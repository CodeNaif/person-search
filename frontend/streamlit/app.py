import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import quote

import requests
import streamlit as st
from dotenv import load_dotenv


REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env")

API_BASE_URL = os.getenv("API_BASE_URL")
if not API_BASE_URL:
    st.error("API_BASE_URL is not set. Configure it in .env.")
    st.stop()
IMAGE_WIDTH = 256
IMAGE_HEIGHT = 384


def build_image_url(raw_path: Optional[str]) -> str:
    if not raw_path:
        return ""
    filename = raw_path.replace("\\", "/").split("/")[-1]
    if not filename:
        return ""
    return f"{API_BASE_URL}/images/{quote(filename)}"


def coerce_score(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def map_results(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    mapped: List[Dict[str, Any]] = []
    for item in items:
        payload = item.get("payload") or {}
        metadata = payload.get("metadata")
        if not isinstance(metadata, dict):
            metadata = None
        image_url = build_image_url(payload.get("path"))

        mapped.append(
            {
                "id": str(item.get("id", "")),
                "image_url": image_url,
                "score": coerce_score(item.get("score")),
                "metadata": metadata,
            }
        )
    return mapped


def render_metadata(metadata: Dict[str, Any]) -> None:
    ordered_keys = ["person_id", "clothes_id", "location_id", "frame_id"]
    for key in ordered_keys:
        if key in metadata:
            st.write(f"{key}: {metadata[key]}")
    for key, value in metadata.items():
        if key not in ordered_keys:
            st.write(f"{key}: {value}")


def render_results(results: List[Dict[str, Any]]) -> None:
    if not results:
        st.info("No results.")
        return

    st.subheader(f"Results ({len(results)})")
    columns = st.columns(4)
    for idx, result in enumerate(results):
        with columns[idx % 4]:
            if result["image_url"]:
                st.markdown(
                    f"""
                    <div style="width:{IMAGE_WIDTH}px;height:{IMAGE_HEIGHT}px;
                                background:#121212;display:flex;align-items:center;
                                justify-content:center;overflow:hidden;border:1px solid #2a2a2a;">
                      <img src="{result['image_url']}" alt="result"
                           style="width:100%;height:100%;object-fit:contain;" />
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            st.write(f"Score: {result['score'] * 100:.0f}%")
            if result["metadata"]:
                with st.expander("Metadata", expanded=False):
                    render_metadata(result["metadata"])


st.set_page_config(page_title="Person Search", layout="wide")
st.title("Person Search")

mode = st.radio("Search mode", ["Text", "Image"], horizontal=True)

left, right = st.columns([3, 1])
with left:
    slider_value = st.slider("Results", 10, 10000, 10, step=10)
with right:
    result_count = st.number_input(
        "Results", min_value=1, max_value=10000, value=int(slider_value), step=1
    )

if mode == "Text":
    query = st.text_input("Describe a person")
    submitted = st.button("Search", type="primary", use_container_width=True)
    if submitted:
        if not query.strip():
            st.error("Please enter a description.")
        else:
            response = requests.post(
                f"{API_BASE_URL}/search_text",
                json={"text": query, "top_k": int(result_count), "dataset_names": None},
                timeout=60,
            )
            if not response.ok:
                st.error(f"Search failed ({response.status_code}).")
            else:
                data = response.json()
                render_results(map_results(data.get("results", [])))
else:
    uploaded = st.file_uploader("Upload an image", type=["png", "jpg", "jpeg"])
    submitted = st.button("Search", type="primary", use_container_width=True)
    if submitted:
        if uploaded is None:
            st.error("Please upload an image.")
        else:
            response = requests.post(
                f"{API_BASE_URL}/search_image",
                params={"top_k": int(result_count)},
                files={"file": (uploaded.name, uploaded.getvalue(), uploaded.type)},
                timeout=120,
            )
            if not response.ok:
                st.error(f"Search failed ({response.status_code}).")
            else:
                data = response.json()
                render_results(map_results(data.get("results", [])))
