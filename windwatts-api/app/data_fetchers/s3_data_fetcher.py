from typing import List, Optional
import boto3
import pandas as pd
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor, as_completed
from botocore.config import Config
from .abstract_data_fetcher import AbstractDataFetcher
from app.config.model_config import MODEL_CONFIG

MIN_POOL_WORKERS = 1

class S3DataFetcher(AbstractDataFetcher):
    def __init__(self, model_key: str):
        """
        Initializes the S3DataFetcher with the given bucket.
        Parameters:
            model_key(str): Key into config["sources"], e.g. "wtk-timeseries" or "era5-timeseries". Same as MODEL_CONFIG keys.
        """
        print(f"Initializing S3 Data Fetcher for '{model_key}'")
        self.s3_client = boto3.client(
            "s3",
            config=Config(
                retries={"max_attempts": 5, "mode": "standard"},
                tcp_keepalive=True,
            ),
        )
        self.bucket = MODEL_CONFIG[model_key]["s3"]["bucket"]
        self.prefix = MODEL_CONFIG[model_key]["s3"]["prefix"]
        self.partition_template = MODEL_CONFIG[model_key]["s3"]["partition_template"]
        self.partition_columns = MODEL_CONFIG[model_key]["s3"]["partition_columns"]

    def generate_s3_keys(self, grid_Indices: List[str], years: List[int]) -> List[str]:
        """
        Build S3 object keys for the given years and nearest grid indices.

        :param gridIndices: list of grid indices of neighbors.
        :param years: data of years to fetch.
        :return: List of S3 object keys.
        """
        keys: List[str] = []

        for year in years:
            for index in grid_Indices:
                # uri specific to era5 timeseries, might change for ensemble timeseries as it might not have year.
                key = self.partition_template.format(
                    prefix=self.prefix, year=year, index=index
                )
                keys.append(key)

        return keys

    def fetch_raw(self, key: str, cols: Optional[List[str]]):
        """
        Download + parse a single gzip CSV from S3.

        :param key: S3 object key.
        :param cols: Optional list of column names to load (passed to pandas.read_csv).
        :return: DataFrame or None on error.
        """
        try:
            obj = self.s3_client.get_object(Bucket=self.bucket, Key=key)
            payload = obj["Body"].read()
            df = pd.read_csv(
                BytesIO(payload),
                compression="gzip",
                usecols=cols,
            )
            return df
        except Exception as e:
            print(f"Warning: Failed to fetch {key}: {e}")
            raise

    def fetch_data(
        self,
        gridIndices: List[str],
        years: List[int],
        cols: Optional[List[str]] = None,
    ) -> pd.DataFrame:
        """
        Fetch data from S3 in parallel (optimized for ~5 files).

        Args:
            gridIndexes (List(str)): Grid indices of neighbors with respect user selected coordinate.
            years (List[int]): Years of which the data is needed.
            cols (Optional[List[str]]): Optional column subset to read.

        Returns:
            pd.DataFrame: Concatenated DataFrame across requested files (may be empty).
        """
        keys = self.generate_s3_keys(gridIndices, years)
        if not keys:
            return pd.DataFrame()

        frames: List[pd.DataFrame] = []
        workers = min(MIN_POOL_WORKERS, len(keys))

        with ThreadPoolExecutor(max_workers=workers) as ex:
            futures = [ex.submit(self.fetch_raw, k, cols) for k in keys]
            for f in as_completed(futures):
                df = f.result()
                if df is not None and not df.empty:
                    frames.append(df)
        if not frames:
            print(f"No data found for gridIndices {gridIndices}, years={years}")
            return pd.DataFrame()
        out = pd.concat(frames, ignore_index=True)

        return out
