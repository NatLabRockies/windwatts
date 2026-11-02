import duckdb
import pandas as pd
from app.schemas import S3Config

class DuckDBQueryClient:
    def __init__(self, s3_config: S3Config):
        self.conn = duckdb.connect(":memory:")
        self.conn.execute("LOAD httpfs")
        self.conn.execute("LOAD aws")
        self.conn.execute("CREATE OR REPLACE SECRET s3 (TYPE s3, PROVIDER credential_chain, REGION 'us-west-2');")
        self.bucket = s3_config["bucket"]
        self.prefix = s3_config["prefix"]

    def query(self, grid_idx: str, tile: str = None) -> pd.DataFrame:
        """Fetch all data for a single grid point."""
        if tile:
            path = f"s3://{self.bucket}/{self.prefix}/tile={tile}/*.parquet"
            return self.conn.cursor().execute(
                "SELECT * FROM read_parquet(?) WHERE index = ?", [path, grid_idx]
            ).df()
        else:
            path = f"s3://{self.bucket}/{self.prefix}/index={grid_idx}/*.parquet"
            return self.conn.cursor().execute(
                "SELECT * FROM read_parquet(?)", [path]
            ).df()