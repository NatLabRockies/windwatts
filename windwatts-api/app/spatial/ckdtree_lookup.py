import numpy as np
from scipy.spatial import cKDTree
from app.spatial.base_lookup import BaseSpatialLookup, GridPoint

class CKDTreeLookup(BaseSpatialLookup):
    """Nearest-neighbor on a point cloud. For WTK and ERA5."""

    def __init__(self, index_path: str):
        with np.load(index_path) as data:
            self._index = data["index"]
            self._latitude = data["latitude"]
            self._longitude = data["longitude"]
        coords = np.column_stack((self._latitude, self._longitude))
        self.tree = cKDTree(coords)

    def find_nearest(self, lat: float, lng: float, max_search_cells=None) -> GridPoint:
        _, idx = self.tree.query([lat, lng])
        return GridPoint(
            index=str(self._index[idx]),
            latitude=float(self._latitude[idx]),
            longitude=float(self._longitude[idx]),
        )

    def find_n_nearest(
        self, lat: float, lng: float, n_neighbors: int, max_search_cells=None
    ) -> list[GridPoint]:
        _, indices = self.tree.query([lat, lng], k=n_neighbors)
        if n_neighbors == 1:
            indices = [indices]
        return [
            GridPoint(
                index=str(self._index[i]),
                latitude=float(self._latitude[i]),
                longitude=float(self._longitude[i]),
            )
            for i in indices
        ]
