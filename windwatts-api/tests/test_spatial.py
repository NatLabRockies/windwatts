"""
Simple unit tests for the spatial lookup layer.
"""

import numpy as np
import pytest

from app.spatial.ckdtree_lookup import CKDTreeLookup
from app.spatial.gwa_grid_lookup import GWAGridLookup
from app.spatial.spatial_manager import SpatialManager
from app.types.spatial import NoLandCellError


def _make_gwa_npz(path):
    # 2x4 toy land mask (1=land, 0=water):
    # row0: land, land, water, water
    # row1: water, land, land, water
    packed_mask = np.array([0b11000110], dtype=np.uint8)
    np.savez(
        path,
        nrows=2,
        ncols=4,
        row_min=0,
        col_min=0,
        row_max=1,
        col_max=3,
        lat_ref=10.0,
        lon_ref=0.0,
        row_ref=0,
        col_ref=0,
        step=1.0,
        packed_mask=packed_mask,
    )


@pytest.fixture
def gwa_lookup(tmp_path):
    path = tmp_path / "gwa_mask.npz"
    _make_gwa_npz(path)
    return GWAGridLookup(str(path))


def test_gwa_is_land_matches_mask(gwa_lookup):
    assert gwa_lookup.is_land(0, 0) is True
    assert gwa_lookup.is_land(0, 2) is False
    assert gwa_lookup.is_land(1, 1) is True
    assert gwa_lookup.is_land(-1, 0) is False  # out of bounds treated as water


def test_gwa_find_nearest_skips_water(gwa_lookup):
    point = gwa_lookup.find_nearest(lat=10.0, lng=2.0, max_search_cells=1)
    assert point.index == "R000000C000001"
    assert (point.latitude, point.longitude) == (10.0, 1.0)
    assert point.tile == "T0000_0000"


def test_gwa_find_nearest_raises_when_no_land_nearby(gwa_lookup):
    with pytest.raises(NoLandCellError):
        gwa_lookup.find_nearest(lat=10.0, lng=3.0, max_search_cells=0)


def test_gwa_find_n_nearest_returns_sorted_land_cells(gwa_lookup):
    points = gwa_lookup.find_n_nearest(
        lat=10.0, lng=2.0, n_neighbors=2, max_search_cells=1
    )
    assert [p.index for p in points] == ["R000000C000001", "R000001C000002"]


def _make_ckdtree_npz(path):
    np.savez(
        path,
        index=np.array(["p0", "p1", "p2"]),
        latitude=np.array([10.0, 20.0, 30.0]),
        longitude=np.array([-100.0, -90.0, -80.0]),
    )


@pytest.fixture
def ckdtree_lookup(tmp_path):
    path = tmp_path / "ckdtree.npz"
    _make_ckdtree_npz(path)
    return CKDTreeLookup(str(path))


def test_ckdtree_find_nearest(ckdtree_lookup):
    point = ckdtree_lookup.find_nearest(lat=20.1, lng=-90.1)
    assert point.index == "p1"


def test_ckdtree_find_n_nearest(ckdtree_lookup):
    points = ckdtree_lookup.find_n_nearest(lat=10.0, lng=-100.0, n_neighbors=2)
    assert [p.index for p in points] == ["p0", "p1"]


def test_spatial_manager_register_and_find_nearest(ckdtree_lookup):
    manager = SpatialManager()
    manager.register("wtk-timeseries", ckdtree_lookup)
    assert manager.registered_models == ["wtk-timeseries"]
    point = manager.find_nearest(lat=10.0, lng=-100.0, model_key="wtk-timeseries")
    assert point.index == "p0"


def test_spatial_manager_missing_model_raises():
    manager = SpatialManager()
    with pytest.raises(ValueError):
        manager.get_lookup("does-not-exist")
