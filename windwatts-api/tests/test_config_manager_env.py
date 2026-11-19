import os
from app.config_manager import ConfigManager
import json

# Set required top-level environment variables
os.environ["REGION_NAME"] = "us-west-2"
os.environ["OUTPUT_LOCATION"] = "s3://test-bucket/"
os.environ["DATABASE"] = "test_database"
os.environ["ATHENA_WORKGROUP"] = "test_workgroup"

# Set environment variables for two sources: wtk and era5
os.environ["SOURCES_WTK_BUCKET_NAME"] = "wtk-bucket"
os.environ["SOURCES_WTK_ATHENA_TABLE_NAME"] = "wtk_table"
os.environ["SOURCES_ERA5_BUCKET_NAME"] = "era5-bucket"
os.environ["SOURCES_ERA5_ATHENA_TABLE_NAME"] = "era5_table"

# Instantiate ConfigManager (no local file)
cm = ConfigManager(local_config_path=None)

# Get config (now returns a dict, not a file path)
config = cm.get_config()
print(f"\nGenerated config: {config}\n")

# Verify the config dict structure
print(json.dumps(config, indent=2))
