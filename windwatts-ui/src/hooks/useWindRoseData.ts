import { useContext, useMemo } from "react";
import useSWR from "swr";
import { SettingsContext } from "../providers/SettingsContext";
import { getWindRose } from "../services/api";
import { DATA_MODEL_INFO } from "../constants";
import { findNearestWindDirectionHeight } from "../utils";
import { isCustomTurbineId, resolveCustomCurve } from "../utils/turbine";
import type { WindRoseType } from "../types/WindRose";

export const useWindRoseData = (
  gridIndex?: string,
  roseType: WindRoseType = "wind_speed"
) => {
  const { hubHeight, preferredModel, turbine, customCurves } =
    useContext(SettingsContext);

  const dataModel =
    preferredModel === "ensemble-quantiles" ? "era5-quantiles" : preferredModel;

  const directionHeights =
    DATA_MODEL_INFO["era5-quantiles"].wind_direction_heights;
  const windRoseHeight = findNearestWindDirectionHeight(
    directionHeights,
    hubHeight
  );

  const isCustomTurbine = isCustomTurbineId(turbine);
  const customCurve = resolveCustomCurve(turbine, customCurves);

  const shouldFetch = !!(gridIndex && hubHeight && dataModel);

  const swrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      gridIndex,
      height: windRoseHeight,
      dataModel,
      endpoint: "windrose",
      roseType,
      ...(roseType === "energy" && {
        turbine: isCustomTurbine ? customCurve?.id : turbine,
      }),
    });
  }, [
    shouldFetch,
    gridIndex,
    windRoseHeight,
    dataModel,
    roseType,
    turbine,
    isCustomTurbine,
    customCurve,
  ]);

  const { isLoading, data, error } = useSWR(
    swrKey,
    () =>
      getWindRose({
        gridIndex: gridIndex!,
        height: windRoseHeight,
        dataModel,
        rose_type: roseType,
        ...(roseType === "energy"
          ? isCustomTurbine && customCurve
            ? { customPowerCurve: customCurve.data }
            : { turbine }
          : {}),
      }),
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
