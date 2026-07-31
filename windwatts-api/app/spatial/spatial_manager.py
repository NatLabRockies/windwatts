class SpatialManager:
    """Manages spatial lookups for all models."""

    def __init__(self):
        self._lookups: dict[str, object] = {}

    def register(self, model_key: str, lookup):
        "Register lookup instance for a model key."
        self._lookups[model_key] = lookup

    def get_lookup(self, model_key: str):
        "Retrieve the lookup for a model key."
        lookup = self._lookups.get(model_key)
        if lookup is None:
            raise ValueError(f"No spatial lookup registered for the '{model_key}'")
        return lookup

    def find_nearest(
        self, lat: float, lng: float, model_key: str
    ) -> tuple[str, float, float]:
        return self.get_lookup(model_key).find_nearest(lat, lng)

    def find_n_nearest(
        self, lat: float, lng: float, model_key: str, n_neighbors: int = 1
    ) -> list[tuple[str, float, float]]:
        return self.get_lookup(model_key).find_n_nearest(lat, lng, n_neighbors)

    @property
    def registered_models(self) -> list[str]:
        return list(self._lookups.keys())
