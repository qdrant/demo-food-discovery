import argparse
import json
import os.path
from multiprocessing import Pool
from typing import Optional, Iterable

import numpy as np
import tqdm
from npy_append_array import NpyAppendArray

from encoder import ParallelEncoder


def read_meta(meta_path: str) -> Iterable[dict]:
    with open(meta_path) as fd:
        for line in fd:
            yield json.loads(line)


def read_meta_image_path(meta_path: str, image_dir: str) -> Iterable[str]:
    with open(meta_path) as fd:
        for line in fd:
            row = json.loads(line)
            yield os.path.join(image_dir, row['image_file'])


def read_image_folder(image_dir: str) -> Iterable[str]:
    for image_name in os.listdir(image_dir):
        yield os.path.join(image_dir, image_name)


def main(
    images_dir: str,
    output_path: str,
    meta_path: Optional[str] = None,
    workers: int = 1,
):
    if meta_path is not None:
        images = read_meta_image_path(meta_path, images_dir)
    else:
        images = read_image_folder(images_dir)

    images_to_skip = 0
    if os.path.exists(output_path):
        images_to_skip = np.load(output_path, allow_pickle=True).shape[0]
        print(f'Skipping {images_to_skip} images')

    with NpyAppendArray(output_path, delete_if_exists=False) as npaa:

        for i in range(images_to_skip):
            next(images)

        with Pool(workers) as pool:
            for embedding in tqdm.tqdm(pool.imap(ParallelEncoder.encode, images)):
                npaa.append(np.expand_dims(embedding, axis=0))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        prog='CLIP encoder',
        description='Encode images in a given folder into a numpy array with CLIP encoder')

    parser.add_argument('--images-dir', type=str, required=True, help='Path to a folder with images')
    parser.add_argument('--meta-path', type=str, required=True, help='Path to a json file with metadata')
    parser.add_argument('--output-path', type=str, required=True, help='Path numpy array with embeddings')
    parser.add_argument('--workers', type=int, default=1, help='Number of workers')

    args = parser.parse_args()

    main(
        images_dir=args.images_dir,
        output_path=args.output_path,
        meta_path=args.meta_path,
        workers=args.workers,
    )
