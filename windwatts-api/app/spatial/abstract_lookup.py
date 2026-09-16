from abc import ABC, abstractmethod
from typing import Optional

from app.types.spatial import GridPoint


class AbstractSpatialLookup(ABC):
    @abstractmethod
    def find_nearest(
        self, lat: float, lng: float, max_search_cells: Optional[int] = None
    ) -> GridPoint: ...

    @abstractmethod
    def find_n_nearest(
        self,
        lat: float,
        lng: float,
        n_neighbors: int,
        max_search_cells: Optional[int] = None,
    ) -> list[GridPoint]: ...
