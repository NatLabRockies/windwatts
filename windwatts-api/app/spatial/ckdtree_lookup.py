import gzip
import pickle
from scipy.spatial import cKDTree


class CKDTreeLookup:
    """Nearest-neighbor on a point cloud. For WTK and ERA5."""

    def __init__(self, index_path: str):
        with gzip.open(index_path, "rb") as f:
            self.location_data = pickle.load(f)
        coords = self.location_data[["latitude", "longitude"]].values
        self.tree = cKDTree(coords)

    def find_nearest(self, lat: float, lng: float) -> tuple[str, float, float]:
        _, idx = self.tree.query([lat, lng])
        row = self.location_data.iloc[idx]
        return (str(row["index"]), float(row["latitude"]), float(row["longitude"]))

    def find_n_nearest(
        self, lat: float, lng: float, n: int
    ) -> list[tuple[str, float, float]]:
        _, indices = self.tree.query([lat, lng], k=n)
        if n == 1:
            indices = [indices]
        return [
            (
                str(self.location_data.iloc[i]["index"]),
                float(self.location_data.iloc[i]["latitude"]),
                float(self.location_data.iloc[i]["longitude"]),
            )
            for i in indices
        ]
