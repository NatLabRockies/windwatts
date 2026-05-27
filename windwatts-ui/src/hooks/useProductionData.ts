import { useContext, useMemo } from "react";
import useSWR from "swr";
import { SettingsContext } from "../providers/SettingsContext";
import { getEnergyProduction } from "../services/api";
import { isOutOfBounds, isCustomTurbineId, resolveCustomCurve } from "../utils";
import { useLossAdjustedProductionData } from ".";

export const useProductionData = () => {
  const {
    currentPosition,
    hubHeight,
    turbine,
    preferredModel,
    lossAssumptionFactor,
    customCurves,
  } = useContext(SettingsContext);
  // Always use ERA5 for production calculations, even when ensemble is selected
  const dataModel =
    preferredModel === "ensemble-quantiles" ? "era5-quantiles" : preferredModel;
  const { lat, lng } = currentPosition || {};
  const outOfBounds =
    lat && lng && dataModel ? isOutOfBounds(lat, lng, dataModel) : false;

  const isCustomTurbine = isCustomTurbineId(turbine);
  const customCurve = resolveCustomCurve(turbine, customCurves);

  const shouldFetch =
    lat &&
    lng &&
    hubHeight &&
    turbine &&
    dataModel &&
    !outOfBounds &&
    (!isCustomTurbine || customCurve !== null);

  // Memoize the SWR key to prevent unnecessary re-renders
  const swrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      lat,
      lng,
      hubHeight,
      turbine,
      dataModel,
      period: "full",
      isCustom: isCustomTurbine,
    });
  }, [shouldFetch, lat, lng, hubHeight, turbine, dataModel, isCustomTurbine]);

  const { isLoading, data, error } = useSWR(
    swrKey,
    () =>
      getEnergyProduction({
        lat: lat!,
        lng: lng!,
        hubHeight,
        dataModel,
        period: "full",
        ...(isCustomTurbine && customCurve
          ? { customPowerCurve: customCurve.data }
          : { turbine }),
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 0,
    }
  );

  const productionDataWithLoss = useLossAdjustedProductionData(
    data,
    lossAssumptionFactor
  );

  return {
    productionData: productionDataWithLoss ?? data,
    isLoading,
    error,
    hasData: !!data,
    outOfBounds,
    dataModel,
    lat,
    lng,
  };
};
