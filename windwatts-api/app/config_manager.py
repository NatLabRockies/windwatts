import os
import json
from app.config.model_config import MODEL_CONFIG

REQUIRED_FIELDS = {
    "athena": ["bucket_name", "athena_table_name"],
    "s3": ["bucket_name"],
}


class ConfigManager:
    def __init__(self, local_config_path: str = None):
        """
        Initialize the ConfigManager.

        :param local_config_path: The path to the local configuration file.
        """
        self.local_config_path = local_config_path

    def get_config(self) -> dict:
        """
        Retrieve the config from environment variables, or the local configuration file.
        :return: The dict with config keys.
        """
        # Try to retrieve config from environment variables
        env_config = self._get_config_from_env()
        if env_config:
            print("Config loaded from environment variables.")
            return env_config

        # Fallback: load the local configuration file
        if self.local_config_path and os.path.exists(self.local_config_path):
            with open(self.local_config_path, "r") as f:
                print(f"Loaded config from local path '{self.local_config_path}'")
                return json.load(f)

        raise FileNotFoundError(
            "Local configuration file not found and required config environment variables are not set."
        )

    def get_s3_config(self, model_key: str) -> dict:
        resolved = self.get_config()
        structure = MODEL_CONFIG[model_key]["s3"]
        bucket_name = resolved["sources"][model_key]["bucket_name"]
        return {"bucket": bucket_name, **structure}

    def _get_config_from_env(self):
        """
        Retrieve configuration from environment variables.
        Dynamically scan env vars with SOURCES_<SOURCE>_FIELD_NAME pattern for `sources` configuration.
        """
        # Top-level keys
        region_name = os.getenv("REGION_NAME")
        output_location = os.getenv("OUTPUT_LOCATION")
        database = os.getenv("DATABASE")
        athena_workgroup = os.getenv("ATHENA_WORKGROUP")

        # Scan for all SOURCES_<SOURCE>_FIELD_NAME env vars
        sources = {}
        prefix = "SOURCES_"
        suffixes = ["_ATHENA_TABLE_NAME", "_BUCKET_NAME"]
        env = os.environ
        source_fields = {}
        for key, value in env.items():
            if key.startswith(prefix):
                rest = key[len(prefix) :]
                for suffix in suffixes:
                    if rest.endswith(suffix):
                        source = rest[: -len(suffix)].lower().replace("_", "-")
                        field = suffix[1:].lower()  # e.g. 'bucket_name'
                        if source not in source_fields:
                            source_fields[source] = {}
                        source_fields[source][field] = value
                        break
        # Package the sources with required fields into `sources`
        for source, fields in source_fields.items():
            model = MODEL_CONFIG.get(source)
            if not model:
                continue
            required = REQUIRED_FIELDS.get(model["source"], ["bucket_name"])
            missing = [f for f in required if not fields.get(f)]
            if missing:
                raise ValueError(
                    f"Config for '{source}' (source={model['source']}) is missing: {missing}"
                )
            sources[source] = {
                "bucket_name": fields["bucket_name"],
                "athena_table_name": fields.get("athena_table_name", ""),
            }
        # check if all keys have been set
        if (
            all(
                [
                    region_name,
                    database,
                    athena_workgroup,
                ]
            )
            and sources
        ):
            return {
                "region_name": region_name,
                "output_location": output_location,
                "database": database,
                "athena_workgroup": athena_workgroup,
                "sources": sources,
            }
        else:
            return None
