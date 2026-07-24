from pathlib import Path
from app.spatial.spatial_manager import SpatialManager
from app.spatial.ckdtree_lookup import CKDTreeLookup
from app.config.model_config import MODEL_CONFIG

# Singleton
spatial_manager = SpatialManager()

_GRID_DIR = Path(__file__).parent / "grid_lookup_files"

_GRID_LOADERS = {
    "wtk": lambda: CKDTreeLookup(str(_GRID_DIR / "wtk_location_data.npz")),
    "era5": lambda: CKDTreeLookup(str(_GRID_DIR / "era5_location_data.npz")),
}


def init_spatial():
    "Load grids and register lookups for all models in MODEL_CONFIG"
    loaded: dict[str, object] = {}
    for model_key, config in MODEL_CONFIG.items():
        grid = config.get("grid")
        if not grid:
            continue
        if grid not in loaded:
            loader = _GRID_LOADERS.get(grid)
            if loader is None:
                raise ValueError(f"No loader for grid '{grid}' (model '{model_key}')")
            loaded[grid] = loader()
        spatial_manager.register(model_key, loaded[grid])
        print(f"Loaded grid lookup for model '{model_key}' on grid '{grid}'")
