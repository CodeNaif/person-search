# %%
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import (
    PointStruct,
    ScoredPoint,
    VectorParams,
    Distance,
    Filter,
    FieldCondition,
    MatchAny,
    MatchValue,
)

import logging

logger = logging.getLogger(__name__)

class QdrantVectorDB:
    def __init__(self, collection_name: str, embedding_dim: int, host: str, port: int):
        self.collection_name = collection_name
        self.embedding_dim = embedding_dim
        self.client = QdrantClient(host=host, port=port)

    def create_collection(self, recreate: bool = False):
        if self.client.collection_exists(self.collection_name):
            print(f"the name is: {self.collection_name}")
            if recreate:
                self.client.delete_collection(self.collection_name)
            else:
                logger.warning(f"Collection {self.collection_name} already exists, skipping creation")
                return

        logger.info(f"Creating collection {self.collection_name}")
        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=self.embedding_dim,
                distance=Distance.COSINE
            )
        )

    def insert(self, id, embedding: list[float], payload: dict):
        point = PointStruct(id=id, vector=embedding, payload=payload)
        self.client.upsert(collection_name=self.collection_name, points=[point])

    def search(self, embedding: list[float], top_k: int, dataset_names: list[str] | None = None) -> list[ScoredPoint]:
        query_filter = None
        if dataset_names:
            query_filter = Filter(must=[FieldCondition(key="dataset_name", match=MatchAny(any=dataset_names))])

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=embedding,
            limit=top_k,
            query_filter=query_filter,
        )
        return results

    def get_unique_dataset_names(self) -> list[str]:
        res = self.client.facet(
            collection_name=self.collection_name,
            key="dataset_name",
             limit=1000,
        )
        values = [item.value for item in res.hits]
        return values
    

    def id_exists(self, id: str) -> bool:
        points = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[id],
        )
        return len(points) > 0
    