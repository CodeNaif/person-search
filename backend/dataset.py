from pydantic import BaseModel
from pathlib import Path
from tqdm import tqdm

class SampleInfo(BaseModel):
    path: Path
    metadata: dict

class DatasetInfo(BaseModel):
    samples: list[SampleInfo]
    name: str

class DatasetBase:
    def get_dataset_info(self) -> DatasetInfo:
        pass

class VirtualPerson(DatasetBase):
    def __init__(
        self,
        path:str, 
        dataset_name:str,
    ):
        self.data_path = Path(path)
        self.dataset_name = dataset_name
    def get_dataset_info(self,) -> DatasetInfo:
        paths = self.data_path / "train"
        samples = []
        for path in tqdm(paths.iterdir()):
            parts = path.stem.split("-")
            metadata={"person_id":parts[0],"location_id":parts[1], "clothes_id":parts[2], "frame_id":parts[3]}
            sample = SampleInfo(path=path, metadata=metadata)
            samples.append(sample)
        return DatasetInfo(samples=samples, name=self.dataset_name)

            
        

# cleaning = VirtualPerson("D:/datasets/VC-Clothes", "VC-Clothes")
# data = cleaning.get_dataset_info()
# first = data.samples[0]
# print(first.path, first.metadata)


