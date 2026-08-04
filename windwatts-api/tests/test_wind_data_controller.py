from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_legacy_wtk_routes_removed():
    """Verify that legacy /wtk/* routes are no longer served (sunset in API v2.0.0)."""
    assert client.get("/wtk/windspeed?lat=40.0&lng=-100.0&height=80").status_code == 404
    assert (
        client.get("/wtk/energy-production?lat=40.0&lng=-100.0&height=80").status_code
        == 404
    )
    assert client.get("/wtk/nearest-locations?lat=40.0&lng=-100.0").status_code == 404


def test_legacy_era5_routes_removed():
    """Verify that legacy /era5/* routes are no longer served (sunset in API v2.0.0)."""
    assert client.get("/era5/windspeed?lat=40.0&lng=-70.0&height=40").status_code == 404
    assert (
        client.get("/era5/production?lat=40.0&lng=-70.0&height=40").status_code == 404
    )
    assert client.get("/era5/grid-points?lat=40.0&lng=-70.0").status_code == 404
