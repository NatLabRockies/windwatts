import pandas as pd
from collections import OrderedDict
import threading

from .abstract_data_fetcher import AbstractDataFetcher
from app.spatial.global_spatial_manager import spatial_manager
from app.utils.wind_processing import (
    resolve_heights,
    interpolate_windspeed,
    aggregate,
    aggregate_quantile,
)
from app.config.model_config import MODEL_CONFIG, TEMPORAL_SCHEMAS
from app.utils.athena_query_client import AthenaQueryClient
from app.schemas import AthenaConfig


class AthenaDataFetcher(AbstractDataFetcher):
    def __init__(self, athena_config: AthenaConfig, model_key: str):
        """
        Initializes the AthenaDataFetcher with a single model_key like 'wtk-timeseries', 'era5-quantiles', or 'ensemble-quantiles' with its respective Athena config.

        Args:
            athena_config (AthenaConfig): Validated Athena config from ConfigManager.
            model_key (str): Key into config["sources"], e.g. "wtk-timeseries", "era5-quantiles", "ensemble-quantiles". Same as MODEL_CONFIG keys.
        """
        print(f"Initializing Athena Data Fetcher for '{model_key}'")
        self.model_key = model_key
        source = athena_config.sources[model_key]
        self.query_client = AthenaQueryClient(athena_config, source)

        self._df_cache: OrderedDict[str, pd.DataFrame] = OrderedDict()
        self._df_cache_maxsize = 10
        self._cache_lock = threading.Lock()

    def _schema(self) -> str:
        return MODEL_CONFIG[self.model_key]["schema"]

    def _available_heights(self) -> list[int]:
        return MODEL_CONFIG[self.model_key]["heights"]["windspeed"]

    def _cache_df(self, grid_idx: str) -> pd.DataFrame:
        with self._cache_lock:
            if grid_idx in self._df_cache:
                self._df_cache.move_to_end(grid_idx)
                return self._df_cache[grid_idx].copy()

        df = self.query_client.query(grid_idx)

        with self._cache_lock:
            if grid_idx not in self._df_cache:
                self._df_cache[grid_idx] = df
                if len(self._df_cache) > self._df_cache_maxsize:
                    self._df_cache.popitem(last=False)
            return df.copy()

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
        grid_idx, _, _ = spatial_manager.find_nearest(lat, lng, self.model_key)
        height_info = resolve_heights(height, self._available_heights())
        df = self._cache_df(grid_idx)

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
        grid_idx, _, _ = spatial_manager.find_nearest(lat, lng, self.model_key)
        height_info = resolve_heights(height, self._available_heights())
        df = self._cache_df(grid_idx)

        if not height_info["exact"]:
            df = interpolate_windspeed(
                df, height, height_info["lower"], height_info["upper"]
            )

        return df
