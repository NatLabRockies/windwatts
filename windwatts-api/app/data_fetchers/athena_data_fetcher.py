import boto3
import time
import pandas as pd
from io import StringIO
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


class AthenaDataFetcher(AbstractDataFetcher):
    def __init__(self, athena_config: dict, model_key: str):
        """
        Initializes the AthenaDataFetcher with a single model_key like 'wtk-timeseries', 'era5-quantiles', or 'ensemble-quantiles' with its respective Athena config.

        Args:
            athena_config (str): Full athena config dict from ConfigManager.get_config()
            model_key (str): Key into config["sources"], e.g. "wtk-timeseries", "era5-quantiles", "ensemble-quantiles". Same as MODEL_CONFIG keys.
        """
        print(f"Initializing Athene Data Fetcher for '{model_key}'")
        self.model_key = model_key
        source = athena_config["sources"][model_key]

        self.database = athena_config["database"]
        self.workgroup = athena_config["athena_workgroup"]
        self.output_bucket = athena_config["output_bucket"]
        self.output_location = athena_config["output_location"]
        self.table = source["athena_table_name"]
        self.alt_table = source.get("alt_athena_table_name", "")

        self.athena = boto3.client("athena", region_name=athena_config["region_name"])
        self.s3 = boto3.client("s3", region_name=athena_config["region_name"])

        self._df_cache: OrderedDict[str, pd.DataFrame] = OrderedDict()
        self._df_cache_maxsize = 100
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

        query = f"SELECT * FROM {self.table} WHERE index = '{grid_idx}'"
        df = self._execute_athena(query)

        with self._cache_lock:
            existing = self._df_cache.get(grid_idx)
            if existing is not None:
                self._df_cache.move_to_end(grid_idx)
                return existing.copy()
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

    def _execute_athena(
        self, query: str, params: list[str] | None = None
    ) -> pd.DataFrame:
        """Execute an Athena query and return results as a DataFrame.

        Uses 7-day result reuse so repeated queries for the same location
        resolve from cache server-side. Polls with exponential backoff,
        checking immediately on the first attempt for fast cache hits.

        Args:
            query: SQL query string to execute.

        Returns:
            DataFrame parsed from the CSV result stored in S3.

        Raises:
            RuntimeError: If the query fails or is cancelled.
        """
        execution_id = self.athena.start_query_execution(
            QueryString=query,
            QueryExecutionContext={"Database": self.database},
            ResultConfiguration={"OutputLocation": self.output_location},
            ResultReuseConfiguration={
                "ResultReuseByAgeConfiguration": {
                    "Enabled": True,
                    "MaxAgeInMinutes": 10080,
                }
            },
            WorkGroup=self.workgroup,
        )["QueryExecutionId"]

        delay = 0
        while True:
            resp = self.athena.get_query_execution(QueryExecutionId=execution_id)
            state = resp["QueryExecution"]["Status"]["State"]
            if state == "SUCCEEDED":
                break
            if state in ("FAILED", "CANCELLED"):
                reason = resp["QueryExecution"]["Status"].get("StateChangeReason", "")
                raise RuntimeError(f"Athena query {state}: {reason}")
            if delay == 0:
                delay = 0.15
            else:
                delay = min(delay * 2, 5.0)
            time.sleep(delay)

        output = resp["QueryExecution"]["ResultConfiguration"]["OutputLocation"]
        bucket, key = output.replace("s3://", "").split("/", 1)
        obj = self.s3.get_object(Bucket=bucket, Key=key)
        return pd.read_csv(StringIO(obj["Body"].read().decode("utf-8")))
