import boto3
import time
import pandas as pd
from io import StringIO

from botocore.config import Config

from app.schemas import AthenaConfig, AthenaSourceConfig


class AthenaQueryClient:
    def __init__(self, config: AthenaConfig, source: AthenaSourceConfig):
        self.table = source.athena_table_name
        self.alt_table = source.alt_athena_table_name

        self._database = config.database
        self._workgroup = config.athena_workgroup
        self._output_location = config.output_location

        boto_cfg = Config(
            connect_timeout=5,
            read_timeout=5,
            retries={"max_attempts": 2, "mode": "standard"},
        )
        self._athena = boto3.client(
            "athena", region_name=config.region_name, config=boto_cfg
        )
        self._s3 = boto3.client("s3", region_name=config.region_name, config=boto_cfg)

    def query(self, grid_idx: str) -> pd.DataFrame:
        """Fetch all data for a single grid point."""
        query = f"SELECT * FROM {self.table} WHERE index = '{grid_idx}'"
        return self._execute(query)

    def _execute(self, query: str) -> pd.DataFrame:
        """Execute an Athena query with 7-day result reuse. Returns DataFrame."""
        execution_id = self._athena.start_query_execution(
            QueryString=query,
            QueryExecutionContext={"Database": self._database},
            ResultConfiguration={"OutputLocation": self._output_location},
            ResultReuseConfiguration={
                "ResultReuseByAgeConfiguration": {
                    "Enabled": True,
                    "MaxAgeInMinutes": 10080,
                }
            },
            WorkGroup=self._workgroup,
        )["QueryExecutionId"]

        start = time.monotonic()
        delay = 0.0
        max_wait_seconds = 15
        while True:
            resp = self._athena.get_query_execution(QueryExecutionId=execution_id)
            state = resp["QueryExecution"]["Status"]["State"]
            if state == "SUCCEEDED":
                break
            if state in ("FAILED", "CANCELLED"):
                reason = resp["QueryExecution"]["Status"].get("StateChangeReason", "")
                raise RuntimeError(f"Athena query {state}: {reason}")
            if time.monotonic() - start > max_wait_seconds:
                raise RuntimeError(
                    f"Athena query timed out after {max_wait_seconds:.0f}s (execution_id={execution_id})"
                )
            delay = 0.15 if delay == 0 else min(delay * 2, 3.0)
            time.sleep(delay)

        output = resp["QueryExecution"]["ResultConfiguration"]["OutputLocation"]
        bucket, key = output.replace("s3://", "").split("/", 1)
        obj = self._s3.get_object(Bucket=bucket, Key=key)
        return pd.read_csv(StringIO(obj["Body"].read().decode("utf-8")))
