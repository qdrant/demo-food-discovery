import argparse
import json
import os
from typing import Iterable

import numpy as np
from qdrant_client import QdrantClient, models
from tqdm import tqdm


def read_meta(meta_path: str) -> Iterable[dict]:
    with open(meta_path) as fd:
        for line in fd:
            yield json.loads(line)


def main(
        meta_path: str,
        vectors_path: str,
        collection_name: str,
        url: str,
):
    client = QdrantClient(
        url=url,
        api_key=os.getenv('QDRANT_API_KEY'),
        prefer_grpc=True
    )

    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=512,
            distance=models.Distance.COSINE,
            on_disk=True,
        ),
        quantization_config=models.ScalarQuantization(
            scalar=models.ScalarQuantizationConfig(
                type=models.ScalarType.INT8,
                quantile=0.99,
                always_ram=True,
            )
        )
    )

    client.create_payload_index(
        collection_name=collection_name,
        field_name="name",
        field_schema=models.TextIndexParams(
            type=models.TextIndexType.TEXT,
            tokenizer=models.TokenizerType.WORD,
            lowercase=True
        )
    )

    client.create_payload_index(
        collection_name=collection_name,
        field_name="cafe.categories",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )

    client.create_payload_index(
        collection_name=collection_name,
        field_name="cafe.location",
        field_schema=models.PayloadSchemaType.GEO
    )

    client.create_payload_index(
        collection_name=collection_name,
        field_name="cafe.rating",
        field_schema=models.PayloadSchemaType.FLOAT
    )

    payload_iter = read_meta(meta_path)
    vectors_iter = np.load(vectors_path, allow_pickle=True)

    print('Uploading: {}', vectors_iter.shape)

    client.upload_collection(
        collection_name=collection_name,
        vectors=vectors_iter,
        payload=payload_iter,
        ids=tqdm(range(vectors_iter.shape[0])),
        parallel=4
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        prog='Upload embeddings to Qdrant',
        description='Encode images in a given folder into a numpy array with CLIP encoder')

    parser.add_argument('--meta-path', type=str, required=True, help='Path to a json file with metadata')
    parser.add_argument('--vectors-path', type=str, required=True, help='Path numpy array with embeddings')
    parser.add_argument('--collection-name', type=str, required=True, help='Name of the collection')
    parser.add_argument('--url', type=str, required=True, help='Qdrant url')

    args = parser.parse_args()

    main(
        meta_path=args.meta_path,
        vectors_path=args.vectors_path,
        collection_name=args.collection_name,
        url=args.url,
    )
