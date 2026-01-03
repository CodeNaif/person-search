import io
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv

from backend.model import CLIPEmbeddingBackend
from backend.quadrant.config.settings import settings
from backend.quadrant.vector_db import QdrantVectorDB

REPO_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(REPO_ROOT / ".env")

embedding_model: CLIPEmbeddingBackend | None = None
qdrant_vector_db: QdrantVectorDB | None = None


def _get_required_env_int(name: str) -> int:
    value = os.getenv(name)
    if value is None:
        raise RuntimeError(f"{name} is required. Set it in .env.")
    try:
        return int(value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer.") from exc


def _parse_dataset_names(raw: Optional[str]) -> Optional[list[str]]:
    if not raw:
        return None
    names = [item.strip() for item in raw.split(",") if item.strip()]
    return names or None


def _get_embedding_dim(backend: CLIPEmbeddingBackend) -> int:
    # Compute a dummy text embedding and use its length
    embedding = backend.compute_text_embedding("test")
    return int(embedding.shape[-1])



def _ensure_ready() -> None:
    if embedding_model is None or qdrant_vector_db is None:
        raise HTTPException(status_code=503, detail="Service not ready")


def _format_results(results) -> list[dict]:
    if hasattr(results, "points"):
        results = results.points
    formatted = []
    for item in results:
        formatted.append(
            {
                "id": str(item.id),
                "score": float(item.score),
                "payload": item.payload or {},
            }
        )
    return formatted


@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedding_model, qdrant_vector_db
    model_name = os.getenv("MODEL_NAME")
    model_dataset = os.getenv("MODEL_DATASET")
    collection_name = os.getenv("QDRANT_COLLECTION")
    if not model_name or not model_dataset or not collection_name:
        raise RuntimeError(
            "MODEL_NAME, MODEL_DATASET, and QDRANT_COLLECTION are required. "
            "Set them in .env."
        )
    batch_size = _get_required_env_int("EMBED_BATCH_SIZE")

    embedding_model = CLIPEmbeddingBackend(
        model_name=model_name,
        dataset=model_dataset,
        batch_size=batch_size,
    )
    embedding_dim = _get_embedding_dim(embedding_model)
    qdrant_vector_db = QdrantVectorDB(
        collection_name=collection_name,
        embedding_dim=embedding_dim,
        host=settings.qdrant_host,
        port=settings.qdrant_port,
    )
    yield
    embedding_model = None
    qdrant_vector_db = None


app = FastAPI(title="Person Semantic Search API", lifespan=lifespan)

dataset_root_value = os.getenv("DATASET_ROOT")
if not dataset_root_value:
    raise RuntimeError("DATASET_ROOT is required. Set it in .env.")
dataset_root = Path(dataset_root_value).resolve()
images_dir = dataset_root / "train"

if images_dir.is_dir():
    app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchTextRequest(BaseModel):
    text: str
    top_k: int = 5
    dataset_names: list[str] | None = None


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/search_text")
def search_text(req: SearchTextRequest) -> dict:
    _ensure_ready()
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    embedding = embedding_model.compute_text_embedding(text)
    results = qdrant_vector_db.search(
        embedding=embedding.tolist(),
        top_k=req.top_k,
        dataset_names=req.dataset_names,
    )
    return {"results": _format_results(results)}


@app.post("/search_image")
async def search_image(
    file: UploadFile = File(...),
    top_k: int = 5,
    dataset_names: Optional[str] = None,
) -> dict:
    _ensure_ready()
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file must be an image")
    content = await file.read()
    try:
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="invalid image") from exc
    embedding = embedding_model.compute_image_embedding(image)
    results = qdrant_vector_db.search(
        embedding=embedding.tolist(),
        top_k=top_k,
        dataset_names=_parse_dataset_names(dataset_names),
    )
    return {"results": _format_results(results)}
