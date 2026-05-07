"""
Tests for V1 API endpoints.

"""

from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
import numpy as np
import pandas as pd

client = TestClient(app)


def mock_era5_quantiles_df(height=40):
    "era5-quantiles: quantile_yearly schema -> windspeed, probability and year"
    probs = [0.1, 0.25, 0.5, 0.75, 0.9, 0.95]
    rows = []
    for year in range(2013, 2016):
        for p in probs:
            rows.append(
                {
                    f"windspeed_{height}m": round(5.0 + p * 6, 2),
                    "probability": p,
                    "year": year,
                }
            )
    return pd.DataFrame(rows)


def mock_ensemble_quantiles_df(height=40):
    "ensemble-quantiles: quantile_atemporal schema -> windspeed, probability"
    probs = [0.1, 0.25, 0.5, 0.75, 0.9, 0.95]
    return pd.DataFrame(
        {
            "probability": probs,
            f"windspeed_{height}m": [round(5.0 + p * 6, 2) for p in probs],
        }
    )


def mock_wtk_timeseries_df(height=40):
    "wtk-timeseries: aggregated-mohr schema -> mohr, windspeed"
    rows = []
    for year in range(2000, 2003):
        for month in range(1, 13):
            for hour in range(1, 25):
                rows.append(
                    {
                        "mohr": month * 100 + hour,
                        f"windspeed_{height}m": round(np.random.uniform(1, 5), 2),
                        "year": year,
                    }
                )
    return pd.DataFrame(rows)


def mock_era5_timeseries_df(height=40):
    "era5-timeseries: full hourly schema -> time, windspeed and winddirection"
    timestamps = pd.concat(
        [
            pd.Series(pd.date_range(f"{year}-01-01", periods=200, freq="h"))
            for year in range(2013, 2016)
        ]
    ).reset_index(drop=True)
    n = len(timestamps)
    return pd.DataFrame(
        {
            "time": timestamps,
            "windspeed_10m": np.random.uniform(2, 7, n).round(2),
            "windspeed_100m": np.random.uniform(2, 7, n).round(2),
            "winddirection_10m": np.random.uniform(0, 360, n).round(1),
            "winddirection_100m": np.random.uniform(0, 360, n).round(1),
        }
    )


class TestV1WindspeedEndpoints:
    """Test windspeed endpoints for all models."""

    def test_era5_windspeed_default(self):
        """Test ERA5 windspeed with default period."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=40.0&lng=-70.0&height=40"
        )
        assert response.status_code == 200
        json = response.json()
        assert "global_avg" in json

    def test_era5_windspeed_all(self):
        """Test ERA5 windspeed with period=all."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=40.0&lng=-70.0&height=40&period=all"
        )
        assert response.status_code == 200
        json = response.json()
        assert "global_avg" in json

    def test_era5_windspeed_annual(self):
        """Test ERA5 windspeed with period=annual."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=40.0&lng=-70.0&height=40&period=annual"
        )
        assert response.status_code == 200
        json = response.json()
        assert isinstance(json, dict)
        # Should have yearly_avg key with array of year data
        assert "yearly_avg" in json
        assert isinstance(json["yearly_avg"], list)
        if json["yearly_avg"]:
            assert "year" in json["yearly_avg"][0]

    def test_wtk_windspeed_default(self):
        """Test WTK windspeed with default period."""
        response = client.get(
            "/api/v1/wtk-timeseries/windspeed?lat=40.0&lng=-100.0&height=80"
        )
        assert response.status_code == 200
        json = response.json()
        assert "global_avg" in json

    def test_ensemble_windspeed(self):
        """Test ensemble windspeed."""
        response = client.get(
            "/api/v1/ensemble-quantiles/windspeed?lat=40.0&lng=-70.0&height=40"
        )
        assert response.status_code == 200
        json = response.json()
        assert "global_avg" in json

    def test_windspeed_invalid_model(self):
        """Test windspeed with invalid model."""
        response = client.get(
            "/api/v1/invalid_model/windspeed?lat=40.0&lng=-70.0&height=40"
        )
        assert response.status_code == 400
        json = response.json()
        assert "detail" in json
        assert "Invalid model" in json["detail"]

    def test_windspeed_invalid_period(self):
        """Test windspeed with invalid period."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=40.0&lng=-70.0&height=40&period=invalid"
        )
        assert response.status_code == 400


class TestV1ProductionEndpoints:
    """Test production endpoints for all models."""

    def test_era5_production_all(self):
        """Test ERA5 production with period=all."""
        response = client.get(
            "/api/v1/era5-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=nlr-reference-100kW&period=all"
        )
        assert response.status_code == 200
        json = response.json()
        assert "energy_production" in json
        assert isinstance(json["energy_production"], (int, float))

    def test_era5_production_summary(self):
        """Test ERA5 production with period=summary."""
        response = client.get(
            "/api/v1/era5-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=nlr-reference-100kW&period=summary"
        )
        assert response.status_code == 200
        json = response.json()
        assert "summary_avg_energy_production" in json

    def test_era5_production_annual(self):
        """Test ERA5 production with period=annual."""
        response = client.get(
            "/api/v1/era5-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=nlr-reference-100kW&period=annual"
        )
        assert response.status_code == 200
        json = response.json()
        assert "yearly_avg_energy_production" in json

    def test_era5_production_full(self):
        """Test ERA5 production with period=full."""
        response = client.get(
            "/api/v1/era5-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=nlr-reference-100kW&period=full"
        )
        assert response.status_code == 200
        json = response.json()
        assert "energy_production" in json
        assert "summary_avg_energy_production" in json
        assert "yearly_avg_energy_production" in json

    def test_wtk_production(self):
        """Test WTK production."""
        response = client.get(
            "/api/v1/wtk-timeseries/production?lat=40.0&lng=-100.0&height=80&powercurve=nlr-reference-100kW&period=all"
        )
        assert response.status_code == 200
        json = response.json()
        assert "energy_production" in json

    def test_ensemble_production(self):
        """Test ensemble production (only supports period=all)."""
        response = client.get(
            "/api/v1/ensemble-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=nlr-reference-100kW&period=all"
        )
        assert response.status_code == 200
        json = response.json()
        assert "energy_production" in json

    def test_ensemble_production_full_fails(self):
        """Test ensemble production with period=full should fail."""
        response = client.get(
            "/api/v1/ensemble-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=nlr-reference-100kW&period=full"
        )
        assert response.status_code == 400

    def test_production_invalid_powercurve(self):
        """Test production with invalid power curve."""
        response = client.get(
            "/api/v1/era5-quantiles/production?lat=40.0&lng=-70.0&height=40&powercurve=invalid-curve&period=all"
        )
        assert response.status_code == 400


class TestV1PowerCurves:
    """Test power curves endpoint."""

    def test_get_powercurves(self):
        """Test getting available power curves."""
        response = client.get("/api/v1/powercurves")
        assert response.status_code == 200
        json = response.json()
        assert "available_power_curves" in json
        assert isinstance(json["available_power_curves"], list)
        assert len(json["available_power_curves"]) > 0
        # Check that nlr-reference curves are present
        assert any("nlr-reference" in pc for pc in json["available_power_curves"])


class TestV1GridPoints:
    """Test grid points endpoints."""

    def test_era5_grid_points(self):
        """Test ERA5 grid points lookup."""
        response = client.get(
            "/api/v1/era5-quantiles/grid-points?lat=40.0&lng=-70.0&limit=1"
        )
        assert response.status_code == 200
        json = response.json()
        assert "locations" in json
        assert isinstance(json["locations"], list)
        assert len(json["locations"]) == 1
        assert "index" in json["locations"][0]
        assert "latitude" in json["locations"][0]
        assert "longitude" in json["locations"][0]

    def test_grid_points_multiple_neighbors(self):
        """Test grid points with multiple neighbors."""
        response = client.get(
            "/api/v1/era5-quantiles/grid-points?lat=40.0&lng=-70.0&limit=4"
        )
        assert response.status_code == 200
        json = response.json()
        assert len(json["locations"]) == 4

    def test_wtk_grid_points(self):
        """Test WTK grid points lookup."""
        response = client.get(
            "/api/v1/wtk-timeseries/grid-points?lat=40.0&lng=-100.0&limit=1"
        )
        assert response.status_code == 200
        json = response.json()
        assert "locations" in json


class TestV1Validation:
    """Test parameter validation."""

    def test_invalid_latitude(self):
        """Test with invalid latitude."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=100.0&lng=-70.0&height=40"
        )
        assert response.status_code == 400

    def test_invalid_longitude(self):
        """Test with invalid longitude."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=40.0&lng=-200.0&height=40"
        )
        assert response.status_code == 400

    def test_invalid_height(self):
        """Test with invalid height."""
        response = client.get(
            "/api/v1/era5-quantiles/windspeed?lat=40.0&lng=-70.0&height=500"
        )
        assert response.status_code == 400

    def test_missing_required_params(self):
        """Test with missing required parameters."""
        response = client.get("/api/v1/era5-quantiles/windspeed")
        assert response.status_code == 422  # FastAPI validation error


class TestV1Info:
    """Test info endpoint."""

    def test_era5_info(self):
        """Test ERA5 info endpoint."""
        response = client.get("/api/v1/era5-quantiles/info")
        assert response.status_code == 200
        json = response.json()
        assert "model" in json
        assert json["model"] == "era5-quantiles"
        assert "supported_periods" in json
        assert "available_heights" in json

    def test_wtk_info(self):
        """Test WTK info endpoint."""
        response = client.get("/api/v1/wtk-timeseries/info")
        assert response.status_code == 200
        json = response.json()
        assert json["model"] == "wtk-timeseries"

    def test_ensemble_info(self):
        """Test ensemble info endpoint."""
        response = client.get("/api/v1/ensemble-quantiles/info")
        assert response.status_code == 200
        json = response.json()
        assert json["model"] == "ensemble-quantiles"


class TestV1WindRose:
    """Test windrose endpoint"""

    @staticmethod
    def _mock_timeseries_df():
        "Create a mock dataframe of era5-timeseries data"
        np.random.seed(39)
        n = 200
        timestamps = pd.date_range("2020-01-01", periods=n, freq="h")
        return pd.DataFrame(
            {
                "time": timestamps,
                "windspeed_10m": np.random.uniform(2, 15, n).round(2),
                "windspeed_30m": np.random.uniform(3, 16, n).round(2),
                "windspeed_40m": np.random.uniform(3, 17, n).round(2),
                "windspeed_50m": np.random.uniform(4, 18, n).round(2),
                "windspeed_60m": np.random.uniform(4, 18, n).round(2),
                "windspeed_80m": np.random.uniform(5, 19, n).round(2),
                "windspeed_100m": np.random.uniform(5, 20, n).round(2),
                "winddirection_10m": np.random.uniform(0, 360, n).round(1),
                "winddirection_100m": np.random.uniform(0, 360, n).round(1),
            }
        )

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_windrose_default_params(self, mock_router):
        "Test windrose with default parameter values sectors=16, bin=5 and calm_threshold=0."
        mock_router.fetch_data.return_value = self._mock_timeseries_df()
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=026131&height=100"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["no_of_sectors"] == 16
        assert data["no_of_bins"] == 5
        assert len(data["sector_info"]) == 16
        assert len(data["bin_info"]) == 5
        assert len(data["bin_data"]) == 16 * 5
        assert data["calm_info"]["calm_threshold"] == 0.0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_windrose_user_params_1(self, mock_router):
        "Test windrose with user arguments sectors=8, bin=6 and calm_threshold=0.5"
        mock_router.fetch_data.return_value = self._mock_timeseries_df()
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=026131&height=100&sectors=8&bin=6&calm_threshold=0.5"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["no_of_sectors"] == 8
        assert data["no_of_bins"] == 6
        assert len(data["sector_info"]) == 8
        assert len(data["bin_info"]) == 6
        assert len(data["bin_data"]) == 8 * 6
        assert data["calm_info"]["calm_threshold"] == 0.5

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_windrose_user_params_2(self, mock_router):
        "Test windrose with user arguments sectors=8, bin=1 and calm_threshold=0.5"
        mock_router.fetch_data.return_value = self._mock_timeseries_df()
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=026131&height=100&sectors=8&bin=1&calm_threshold=0.5"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["no_of_sectors"] == 8
        assert data["no_of_bins"] == 1
        assert len(data["sector_info"]) == 8
        assert len(data["bin_info"]) == 1
        assert len(data["bin_data"]) == 8 * 1
        assert data["calm_info"]["calm_threshold"] == 0.5

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_windrose_calm_threshold(self, mock_router):
        "Test windrose to filter calm data below calm threshold=2"
        mock_router.fetch_data.return_value = self._mock_timeseries_df()
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=026131&height=100&calm_threshold=2"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["calm_info"]["calm_threshold"] == 2.0
        assert data["calm_info"]["calm_fraction"] >= 0
        for v in data["calm_data"]:
            assert v < 3.0

    def test_windrose_invalid_model(self):
        "Windrose on a model without winddirection should fail."
        response = client.get(
            "/api/v1/era5-quantiles/windrose?gridIndex=046271&height=40"
        )
        assert response.status_code == 400

    def test_windrose_invalid_sectors(self):
        "Sectors must be 4, 8, or 16."
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=046271&height=100&sectors=12"
        )
        assert response.status_code == 400

    def test_windrose_invalid_calm_threshold(self):
        "Calm threshold must be 0-3."
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=046271&height=100&calm_threshold=5.0"
        )
        assert response.status_code == 400

    def test_windrose_invalid_bin(self):
        "Bin count must be 1-10."
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=046271&height=100&bin=0"
        )
        assert response.status_code == 400

    def test_windrose_invalid_height(self):
        "Height must have winddirection data (10 or 100 for era5-timeseries)."
        response = client.get(
            "/api/v1/era5-timeseries/windrose?gridIndex=046271&height=40"
        )
        assert response.status_code == 400


class TestV1PostProductionEndpoints:
    """Test POST production endpoint with inbuilt and custom power curves."""

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_ensemble_all(self, mock_router):
        mock_router.fetch_raw.return_value = mock_ensemble_quantiles_df()
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "turbine": "nlr-reference-100kW",
                "period": "all",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert data["energy_production"] > 0

    def test_post_production_ensemble_invalid_period_all(self):
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "turbine": "nlr-reference-100kW",
                "period": "annual",
            },
        )
        assert response.status_code == 400

    def test_post_production_ensemble_invalid_period_summary(self):
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "turbine": "nlr-reference-100kW",
                "period": "summary",
            },
        )
        assert response.status_code == 400

    def test_post_production_ensemble_invalid_period_monthly(self):
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "turbine": "nlr-reference-100kW",
                "period": "monthly",
            },
        )
        assert response.status_code == 400

    def test_post_production_ensemble_invalid_period_full(self):
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "turbine": "nlr-reference-100kW",
                "period": "full",
            },
        )
        assert response.status_code == 400

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_ensemble_custom_pc(self, mock_router):
        mock_router.fetch_raw.return_value = mock_ensemble_quantiles_df()
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert data["energy_production"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_all(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert data["energy_production"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_custom_pc_all(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert data["energy_production"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_summary(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "summary",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "summary_avg_energy_production" in data
        summary = data["summary_avg_energy_production"]
        for key in ("Lowest year", "Average year", "Highest year"):
            assert key in summary
            assert "year" in summary[key]
            assert "Average wind speed (m/s)" in summary[key]
            assert "kWh produced" in summary[key]
            assert summary[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_custom_pc_summary(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "summary",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "summary_avg_energy_production" in data
        summary = data["summary_avg_energy_production"]
        for key in ("Lowest year", "Average year", "Highest year"):
            assert key in summary
            assert "year" in summary[key]
            assert "Average wind speed (m/s)" in summary[key]
            assert "kWh produced" in summary[key]
            assert summary[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_annual(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "annual",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "yearly_avg_energy_production" in data
        yearly_prod = data["yearly_avg_energy_production"]
        for key in ("2013", "2014", "2015"):
            assert key in yearly_prod
            assert "Average wind speed (m/s)" in yearly_prod[key]
            assert "kWh produced" in yearly_prod[key]
            assert yearly_prod[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_full(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "full",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert "summary_avg_energy_production" in data
        assert "yearly_avg_energy_production" in data

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_era5_quantiles_custom_pc_annual(self, mock_router):
        mock_router.fetch_raw.return_value = mock_era5_quantiles_df()
        response = client.post(
            "/api/v1/era5-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "annual",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        yearly_prod = data["yearly_avg_energy_production"]
        for key in ("2013", "2014", "2015"):
            assert key in yearly_prod
            assert "Average wind speed (m/s)" in yearly_prod[key]
            assert "kWh produced" in yearly_prod[key]
            assert yearly_prod[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_all(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert data["energy_production"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_summary(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "summary",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "summary_avg_energy_production" in data
        summary = data["summary_avg_energy_production"]
        for key in ("Lowest year", "Average year", "Highest year"):
            assert key in summary
            assert "year" in summary[key]
            assert "Average wind speed (m/s)" in summary[key]
            assert "kWh produced" in summary[key]
            assert summary[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_annual(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "annual",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        yearly_prod = data["yearly_avg_energy_production"]
        for key in ("2000", "2001", "2002"):
            assert key in yearly_prod
            assert "Average wind speed (m/s)" in yearly_prod[key]
            assert "kWh produced" in yearly_prod[key]
            assert yearly_prod[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_full(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "full",
                "turbine": "nlr-reference-100kW",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert "summary_avg_energy_production" in data
        assert "yearly_avg_energy_production" in data

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_custom_pc_all(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert data["energy_production"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_custom_pc_summary(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "summary",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "summary_avg_energy_production" in data
        summary = data["summary_avg_energy_production"]
        for key in ("Lowest year", "Average year", "Highest year"):
            assert key in summary
            assert "year" in summary[key]
            assert "Average wind speed (m/s)" in summary[key]
            assert "kWh produced" in summary[key]
            assert summary[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_custom_pc_annual(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "annual",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        yearly_prod = data["yearly_avg_energy_production"]
        for key in ("2000", "2001", "2002"):
            assert key in yearly_prod
            assert "Average wind speed (m/s)" in yearly_prod[key]
            assert "kWh produced" in yearly_prod[key]
            assert yearly_prod[key]["kWh produced"] > 0

    @patch("app.controllers.wind_data_controller.data_fetcher_router")
    def test_post_production_wtk_timeseries_custom_pc_full(self, mock_router):
        mock_router.fetch_raw.return_value = mock_wtk_timeseries_df()
        response = client.post(
            "/api/v1/wtk-timeseries/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "full",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 10, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_production" in data
        assert "summary_avg_energy_production" in data
        assert "yearly_avg_energy_production" in data

    def test_post_production_invalid_custom_pc_duplicate_windspeed(self):
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "custom_power_curve": {
                    "wind_speed": [0, 3, 5, 7, 7, 13, 15, 25],
                    "turbine_output": [0, 0, 50, 70, 80, 85, 95, 100],
                },
            },
        )
        assert response.status_code == 400

    def test_post_production_invalid_custom_pc_less_than_two_data_points(self):
        response = client.post(
            "/api/v1/ensemble-quantiles/production",
            json={
                "lat": 40.0,
                "lng": -70.0,
                "height": 40,
                "period": "all",
                "custom_power_curve": {"wind_speed": [3], "turbine_output": [34]},
            },
        )
        assert response.status_code == 422


if __name__ == "__main__":
    import pytest

    pytest.main([__file__, "-v"])
