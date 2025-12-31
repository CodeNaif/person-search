# Person Search

Image/text search for people using SigLIP + Qdrant.

## Run

Backend:
1. `python -m venv .venv`
2. Activate venv (`.venv\\Scripts\\activate` on Windows, `source .venv/bin/activate` on Unix)
3. `pip install -r requirements.txt`
4. `uvicorn backend.fast:app --reload --port 8000`

Frontend:
1. `cd frontend/vite`
2. `npm install`
3. `npm run dev`

Optional: set `DATASET_ROOT` (default `D:/datasets/VC-Clothes`). Frontend uses `VITE_API_BASE_URL` (default `http://localhost:8000`).
