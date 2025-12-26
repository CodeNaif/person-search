from dataset import VirtualPerson, DatasetInfo
from quadrant.vector_db import QdrantVectorDB
from quadrant.config.settings import settings
from PIL import Image
from model import CLIPEmbeddingBackend
from tqdm import tqdm
from quadrant.config.logging import setup_logging
import uuid
from pathlib import Path
logger = setup_logging(__name__)

def get_dataset() -> DatasetInfo:
    cat_dataset = VirtualPerson(path="D:/datasets/VC-Clothes", dataset_name="VC-Clothes")
    return cat_dataset.get_dataset_info()

def get_id_from_path(path: Path) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, str(path)))

def main():
    collection_name = "person_search"
    embedding_model = CLIPEmbeddingBackend(
        model_name="ViT-SO400M-16-SigLIP2-384",
        dataset="webli",
        batch_size=256,  
    )

    qdrant_vector_db = QdrantVectorDB(
        collection_name=collection_name,
        embedding_dim=1152,  
        host=settings.qdrant_host,
        port=settings.qdrant_port,
    )
    qdrant_vector_db.create_collection(recreate=True)

    dataset_info = get_dataset()
    total_samples = len(dataset_info.samples)

    batch_images: list[Image.Image] = []
    batch_payloads: list[dict] = []

    with tqdm(total=total_samples, desc="Indexing all datasets") as pbar:
        for sample in dataset_info.samples:
            with Image.open(sample.path) as img:
                img = img.convert("RGB")
                batch_images.append(img.copy())

            batch_payloads.append({
                "path": sample.path,
                "metadata": sample.metadata,
            })

            if len(batch_images) >= embedding_model.batch_size:
                embeddings = embedding_model.compute_batched_image_embeddings(batch_images)
                for emb, payload in zip(embeddings, batch_payloads):
                    point_id = get_id_from_path(payload["path"])
                    

                #     #TODO make qdrant insert batch
                    qdrant_vector_db.insert(id=point_id, embedding=emb, payload=payload)
                batch_images.clear()
                batch_payloads.clear()

            pbar.update(1)

        #if reamin any pics
        if batch_images:
            embeddings = embedding_model.compute_batched_image_embeddings(batch_images)
            for emb, payload in zip(embeddings, batch_payloads):
                point_id = get_id_from_path(payload["path"])
            #     #TODO make qdrant insert batch
                qdrant_vector_db.insert(id=point_id, embedding=emb, payload=payload)


if __name__=="__main__":
    main()