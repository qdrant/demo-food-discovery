import os

import torch
from PIL import Image
import numpy as np

from sentence_transformers import SentenceTransformer


torch.set_num_threads(1)


class ParallelEncoder:

    model = None

    @classmethod
    def encode(cls, image_path):
        if cls.model is None:
            cls.model = SentenceTransformer('clip-ViT-B-32')

        if not os.path.exists(image_path):
            print(f'File {image_path} not found')
            # replace not found images with random embedding
            embedding = np.random.rand(512)
        else:
            embedding = cls.model.encode(Image.open(image_path))

        return embedding