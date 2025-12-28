from typing import Optional
from PIL import Image
import numpy as np
import torch
import open_clip


class CLIPEmbeddingBackend:
    def __init__(
        self,
        model_name: str,
        dataset: Optional[str] = "webli",
        device: torch.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu'),
        batch_size: int = 512,
    ) -> None:
        self.device = device
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=dataset, device=device
        )
        self.tokenizer = open_clip.get_tokenizer(model_name)
        self.batch_size = batch_size

    def compute_image_embedding(self, image: Image.Image) -> np.ndarray:
        image = self.preprocess(image).unsqueeze(0)
        image = image.to(self.device)
        with torch.no_grad():
            image_features = self.model.encode_image(image)
        image_features = torch.nn.functional.normalize(image_features, dim=-1)
        image_features = image_features.cpu().detach().numpy().squeeze()
        return image_features

    def compute_batched_image_embeddings(self, images: list[Image.Image]) -> np.ndarray:
        self.model.eval()
        all_embeds = []

        device_type = "cuda" if self.device.type == "cuda" else "cpu"
        autocast_enabled = device_type == "cuda"
        with torch.no_grad(), torch.amp.autocast(device_type, enabled=autocast_enabled):
            for i in range(0, len(images), self.batch_size):
                batch = images[i:i+self.batch_size]

                batch_tensor = torch.stack([
                    self.preprocess(img)
                for img in batch]).to(self.device, non_blocking=True)

                feats = self.model.encode_image(batch_tensor)

                # Qdrant + cosine search → normalize embeddings
                feats = torch.nn.functional.normalize(feats, dim=-1)

                all_embeds.append(feats.cpu())

        return torch.cat(all_embeds, dim=0).numpy()

    def compute_text_embedding(self, text: str) -> np.ndarray:
        tokens = self.tokenizer([text]).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(tokens)
        text_features = torch.nn.functional.normalize(text_features, dim=-1)
        return text_features.cpu().detach().numpy().squeeze()



