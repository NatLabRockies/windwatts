from typing import NamedTuple, Optional


class NoLandCellError(Exception):
    """Raised when no land grid cell is found within the search window."""


class GridPoint(NamedTuple):
    index: str
    latitude: float
    longitude: float
    tile: Optional[str] = None


__all__ = ["GridPoint", "NoLandCellError"]
