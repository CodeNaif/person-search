# Person Search

Dataset used: https://wanfb.github.io/dataset.html (VC-Clothes)

## Before Run (new dataset)
1) Add a dataset class in `backend/dataset.py` (must return `DatasetInfo` with `samples` and `metadata`).
2) Update `get_dataset()` in `backend/index_dataset.py` to use your class and dataset path.
3) If you change model/collection/dim, update these in `backend/index_dataset.py`:
   - `collection_name`
   - `model_name`, `dataset`
   - `embedding_dim` (must match the model output)
4) Keep `.env` in sync with `backend/index_dataset.py` (model + collection).

## Config
Root `.env` keys:
`DATASET_ROOT`, `MODEL_NAME`, `MODEL_DATASET`, `EMBED_BATCH_SIZE`,
`QDRANT_COLLECTION`, `QDRANT_HOST`, `QDRANT_PORT`, `API_BASE_URL`

Vite `.env`:
`VITE_API_BASE_URL`

## Index
1) Start Qdrant:
`docker compose -f backend/quadrant/dev_env/docker-compose.yaml up -d`
2) Index:
`python backend/index_dataset.py`

## Run (conda)
1) Env:
`conda create -n person-search python=3.11`
`conda activate person-search`
2) Configure `.env` (repo root) and `frontend/vite/.env`.
3) Backend:
`pip install -r requirements.txt`
`uvicorn backend.fast:app --reload --port 8000`
4) Vite UI:
`cd frontend/vite`
`npm install`
`npm run dev`
5) Streamlit UI:
`cd frontend/streamlit`
`pip install -r requirements.txt`
`streamlit run app.py`
