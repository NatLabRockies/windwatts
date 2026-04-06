import { useContext, useMemo } from "react";
import useSWR from "swr";
import { SettingsContext } from "../providers/SettingsContext";
import {
  getEnergyProduction,
  getWindspeedGlobalAverage,
} from "../services/api";
import { isOutOfBounds, applyLoss } from "../utils";

export const useEnsemble = () => {
  const {
    currentPosition,
    hubHeight,
    turbine,
    preferredModel: dataModel,
    lossAssumptionFactor,
  } = useContext(SettingsContext);

  const { lat, lng } = currentPosition || {};
  const outOfBounds =
    lat && lng && dataModel ? isOutOfBounds(lat, lng, dataModel) : false;
  const shouldFetch = !!(
    lat &&
    lng &&
    hubHeight &&
    turbine &&
    dataModel &&
    dataModel === "ensemble-quantiles" &&
    !outOfBounds
  );

  // Wind data SWR
  const windSwrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      lat,
      lng,
      hubHeight,
      dataModel,
      type: "wind",
    });
  }, [shouldFetch, lat, lng, hubHeight, dataModel]);

  const {
    isLoading: windLoading,
    data: windData,
    error: windError,
  } = useSWR(
    windSwrKey,
    () =>
      getWindspeedGlobalAverage({
        lat: lat!,
        lng: lng!,
        hubHeight,
        dataModel,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 0,
    }
  );

  // Production data SWR
  const prodSwrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      lat,
      lng,
      hubHeight,
      turbine,
      dataModel,
      period: "all",
      type: "production",
    });
  }, [shouldFetch, lat, lng, hubHeight, turbine, dataModel]);

  const {
    isLoading: prodLoading,
    data: prodData,
    error: prodError,
  } = useSWR(
    prodSwrKey,
    () =>
      getEnergyProduction({
        lat: lat!,
        lng: lng!,
        hubHeight,
        turbine: turbine,
        dataModel,
        period: "all",
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 0,
    }
  );

  // Apply loss adjustment to production data
  const productionDataWithLoss = useMemo(() => {
    if (!prodData || !prodData.energy_production) return prodData;

    const adjustedProduction = applyLoss(
      Number(prodData.energy_production),
      lossAssumptionFactor,
      { mode: "floor" }
    );

    return {
      ...prodData,
      energy_production: adjustedProduction,
    };
  }, [prodData, lossAssumptionFactor]);

  return {
    windData,
    productionData: productionDataWithLoss,
    isLoading: windLoading || prodLoading,
    windError,
    productionError: prodError,
    error: windError || prodError,
    hasData: !!windData && !!productionDataWithLoss,
    hasWindData: !!windData,
    hasProductionData: !!productionDataWithLoss,
    windLoading,
    productionLoading: prodLoading,
    outOfBounds,
    dataModel,
    lat,
    lng,
  };
};
