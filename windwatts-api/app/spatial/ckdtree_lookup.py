import numpy as np
from scipy.spatial import cKDTree


class CKDTreeLookup:
    """Nearest-neighbor on a point cloud. For WTK and ERA5."""

    def __init__(self, index_path: str):
        data = np.load(index_path)
        self._index = data["index"]
        self._latitude = data["latitude"]
        self._longitude = data["longitude"]
        coords = np.column_stack((self._latitude, self._longitude))
        self.tree = cKDTree(coords)

    def find_nearest(self, lat: float, lng: float) -> tuple[str, float, float]:
        _, idx = self.tree.query([lat, lng])
        return (str(self._index[idx]), float(self._latitude[idx]), float(self._longitude[idx]))

    def find_n_nearest(
        self, lat: float, lng: float, n: int
    ) -> list[tuple[str, float, float]]:
        _, indices = self.tree.query([lat, lng], k=n)
        if n == 1:
            indices = [indices]
        return [
            (
                str(self._index[i]),
                float(self._latitude[i]),
                float(self._longitude[i]),
            )
            for i in indices
        ]
