from abc import ABC, abstractmethod
from typing import NamedTuple, Optional


class NoLandCellError(Exception):
    """Raised when no land grid cell is found within the search window."""

    pass


class GridPoint(NamedTuple):
    index: str
    latitude: float
    longitude: float
    tile: Optional[str] = None


class BaseSpatialLookup(ABC):
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
