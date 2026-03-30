import { useContext, useMemo } from "react";
import useSWR from "swr";
import { SettingsContext } from "../providers/SettingsContext";
import { getWindRose } from "../services/api";
import { DATA_MODEL_INFO } from "../constants";
import { findNearestWindDirectionHeight } from "../utils";

export const useWindRoseData = (gridIndex?: string) => {
  const { hubHeight, preferredModel } = useContext(SettingsContext);

  const dataModel =
    preferredModel === "ensemble-quantiles" ? "era5-quantiles" : preferredModel;

  const directionHeights =
    DATA_MODEL_INFO["era5-quantiles"].wind_direction_heights;
  const windRoseHeight = findNearestWindDirectionHeight(
    directionHeights,
    hubHeight
  );

  const shouldFetch = !!(gridIndex && hubHeight && dataModel);

  const swrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      gridIndex,
      height: windRoseHeight,
      dataModel,
      endpoint: "windrose",
    });
  }, [shouldFetch, gridIndex, windRoseHeight, dataModel]);

  const { isLoading, data, error } = useSWR(
    swrKey,
    () =>
      getWindRose({ gridIndex: gridIndex!, height: windRoseHeight, dataModel }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 0,
    }
  );

  return {
    windRoseData: data,
    windRoseHeight,
    isLoading,
    error,
    hasData: !!data,
  };
};
