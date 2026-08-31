import numpy as np
from app.spatial.base_lookup import BaseSpatialLookup, GridPoint

class GWAGridLookup(BaseSpatialLookup):
    def __init__(self, index_path: str):
        with np.load(index_path) as data:
            self.NROWS = int(data["nrows"]) 
            self.NCOLS = int(data["ncols"])

            self.ROW_MIN = int(data["row_min"])
            self.COL_MIN = int(data["col_min"])
            self.ROW_MAX = int(data["row_max"])
            self.COL_MAX = int(data["col_max"])

            self.LAT_REF = float(data["lat_ref"])
            self.LON_REF = float(data["lon_ref"])

            self.ROW_REF = int(data['row_ref'])
            self.COL_REF = int(data['col_ref'])

            self.STEP = float(data["step"])
            # set during data upload
            self.TILE_SIZE = 50 
            self._packed_mask = data["packed_mask"].copy()

    def lat_lon_to_row_col(self, lat, lng):
        row = self.ROW_REF + round((self.LAT_REF - lat) / self.STEP)
        col = self.COL_REF + round((lng - self.LON_REF) / self.STEP)
        return row, col

    def row_col_to_lat_lon(self, row, col):
        lat = round(self.LAT_REF - (row - self.ROW_REF) * self.STEP, 5)
        lng = round(self.LON_REF + (col - self.COL_REF) * self.STEP, 5)
        return lat, lng

    def row_col_to_index(self, row, col):
        return f"R{row:06d}C{col:06d}"

    def row_col_to_tile(self, row, col):
        tile_row = (row - self.ROW_MIN) // self.TILE_SIZE
        tile_col = (col - self.COL_MIN) // self.TILE_SIZE
        return f"T{tile_row:04d}_{tile_col:04d}"
    
    def is_land(self, row, col):
        arr_r, arr_c = row - self.ROW_MIN, col - self.COL_MIN
        if arr_r < 0 or arr_r >= self.NROWS or arr_c < 0 or arr_c >=self.NCOLS:
            return False
        bit_idx = arr_r * self.NCOLS + arr_c
        byte_idx = bit_idx // 8
        bit_offset = 7 - (bit_idx % 8)
        return bool((self._packed_mask[byte_idx] >> bit_offset) & 1)

    def find_nearest(self, lat: float, lng: float, max_search_cells: int = 4) -> GridPoint:
        row, col = self.lat_lon_to_row_col(lat, lng)
        lands = self._find_existing_neighbors(row, col, 1, max_search_cells)
        if not lands:
            raise ValueError(f"No land cell within {max_search_cells} cells of ({lat}, {lng})")
        r, c = lands[0]
        nearest_lat, nearest_lng = self.row_col_to_lat_lon(r, c)
        index = self.row_col_to_index(r, c)
        tile = self.row_col_to_tile(r, c)
        return GridPoint(
            index=str(index),
            latitude=float(nearest_lat),
            longitude=float(nearest_lng),
            tile=tile
        )
    
    def find_n_nearest(
        self, lat: float, lng: float, n_neighbors: int, max_search_cells: int = 4
    ) -> list[GridPoint]:
        row, col = self.lat_lon_to_row_col(lat, lng)
        lands = self._find_existing_neighbors(row, col, n_neighbors, max_search_cells)
        if not lands:
            raise ValueError(f"No land cell within {max_search_cells} cells of ({lat}, {lng})")
        return [
            GridPoint(
                index=self.row_col_to_index(r, c),
                latitude=float(self.row_col_to_lat_lon(r, c)[0]),
                longitude=float(self.row_col_to_lat_lon(r, c)[1]),
                tile=self.row_col_to_tile(r, c)
            )
            for r,c in lands
        ]

    def _find_existing_neighbors(self, row: int, col: int, n: int, max_search_cells: int) -> list[tuple[int, int]]:
        candidates = []
        for dr in range(-max_search_cells, max_search_cells + 1):
            for dc in range(-max_search_cells, max_search_cells + 1):
                nr, nc = row + dr, col + dc
                if self.is_land(nr, nc):
                    candidates.append((dr * dr + dc * dc, nr, nc))
        candidates.sort()
        return [(r,c) for _, r, c in candidates[:n]]