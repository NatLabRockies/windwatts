import { useContext, useMemo } from "react";
import useSWR from "swr";
import { getNearestGridLocation } from "../services/api";
import { SettingsContext } from "../providers/SettingsContext";
import { GridLocation } from "../types";

export const useNearestGridLocation = (n_neighbors: number = 1) => {
  const { currentPosition, preferredModel } = useContext(SettingsContext);
  const dataModel =
    preferredModel === "ensemble-quantiles" ? "era5-quantiles" : preferredModel;
  const { lat, lng } = currentPosition || {};

  const shouldFetch = lat && lng && dataModel;

  // Memoize the SWR key to prevent unnecessary re-renders
  const swrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      lat,
      lng,
      n_neighbors,
      dataModel,
      type: "nearest-grid",
    });
  }, [shouldFetch, lat, lng, n_neighbors, dataModel]);

  const {
    isLoading,
    data,
    error,
    mutate: retry,
  } = useSWR(
    swrKey,
    () =>
      getNearestGridLocation({
        lat: lat!,
        lng: lng!,
        n_neighbors: n_neighbors,
        dataModel: dataModel!,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const gridLocations =
    data?.locations?.map((location: GridLocation) => ({
      latitude: location.latitude,
      longitude: location.longitude,
      index: location.index,
    })) || [];

  return {
    gridLocations,
    isLoading,
    error: error?.message || error || null,
    hasData: gridLocations.length > 0,
    retry,
  };
};
