from .abstract_data_fetcher import AbstractDataFetcher
from app.spatial.global_spatial_manager import spatial_manager
from app.utils.wind_processing import (
    resolve_heights,
    interpolate_windspeed,
    aggregate,
    aggregate_quantile,
)
from app.config.model_config import MODEL_CONFIG, TEMPORAL_SCHEMAS
from app.utils.duckdb_query_client import DuckDBQueryClient


class DuckDBDataFetcher(AbstractDataFetcher):
    def __init__(self, model_key: str):
        """
        Initializes the DuckDBDataFetcher with a single model_key like 'wtk-timeseries', 'era5-quantiles', or 'ensemble-quantiles' with its respective Athena config.

        Args:
            model_key (str): Key into config["sources"], e.g. "wtk-timeseries", "era5-quantiles", "ensemble-quantiles". Same as MODEL_CONFIG keys.
        """
        print(f"Initializing DuckDB Data Fetcher for '{model_key}'")
        self.model_key = model_key
        self.model_s3_config = MODEL_CONFIG[self.model_key]["s3"]
        self.query_client = DuckDBQueryClient(self.model_s3_config)

    def _schema(self) -> str:
        return MODEL_CONFIG[self.model_key]["schema"]

    def _available_heights(self) -> list[int]:
        return MODEL_CONFIG[self.model_key]["heights"]["windspeed"]

    def fetch_data(
        self, lat: float, lng: float, height: int, period: str = "all"
    ) -> dict:
        """
        Fetch aggregated wind data for a location.
        Selects only the columns needed for the requested height and period.
        Applies interpolation if height is not natively in the dataset.
        Routes to the appropriate aggregation strategy (timeseries vs quantile).

        Args:
            lat (float): Latitude of the location.
            lng (float): Longitude of the location.
            height (int): Height in meters.
            period (str): Aggregation period to fetch.
                For 'wtk': ['all', 'annual', 'monthly', 'hourly']
                For 'era5': ['all', 'annual']

        Returns:
            dict: Fetched aggregated wind data.
        """
        point = spatial_manager.find_nearest(lat, lng, self.model_key)
        print(f"POINT for ({lat}, {lng}) -> ({point.latitude},{point.longitude})")
        height_info = resolve_heights(height, self._available_heights())
        df = self.query_client.query(point.index, point.tile)
        if df.empty:
            raise ValueError(
                f"No data for {self.model_key} index={point.index!r} tile={point.tile!r}"
            )
        if not height_info["exact"]:
            df = interpolate_windspeed(
                df, height, height_info["lower"], height_info["upper"]
            )

        schema = self._schema()
        if schema in ("quantile_yearly", "quantile_atemporal"):
            use_swi = TEMPORAL_SCHEMAS[schema]["processing"]["use_swi"]
            return aggregate_quantile(df, height, period, use_swi=use_swi)
        return aggregate(df, height, period)

    def fetch_raw(self, lat: float, lng: float, height: int):
        """
        Fetch raw, unaggregated wind data (DataFrame) using the configured client.

        Args:
            lat (float): Latitude of the location.
            lng (float): Longitude of the location.
            height (int): Height in meters.

        Returns:
            DataFrame: Raw wind data without aggregation.
        """
        point = spatial_manager.find_nearest(lat, lng, self.model_key)
        height_info = resolve_heights(height, self._available_heights())
        df = self.query_client.query(point.index, point.tile)

        if not height_info["exact"]:
            df = interpolate_windspeed(
                df, height, height_info["lower"], height_info["upper"]
            )

        return df
