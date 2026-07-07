from app.spatial.ckdtree_lookup import CKDTreeLookup as CKDTreeLookup

_lookups: dict[str, object] = {}


def register(model: str, lookup):
    """Register a lookup instance for a model. Called at startup"""
    _lookups[model] = lookup


def find_nearest(lat: float, lng: float, model: str) -> tuple[str, float, float]:
    lookup = _lookups.get(model)
    if not lookup:
        raise ValueError(f"No spatial lookup registered for '{model}'")
    return lookup.find_nearest(lat, lng)


def find_n_nearest(
    lat: float, lng: float, model: str, n: int = 1
) -> list[tuple[str, float, float]]:
    lookup = _lookups.get(model)
    if not lookup:
        raise ValueError(f"No spatial lookup registered for '{model}'")
    return lookup.find_n_nearest(lat, lng, n)
