import { useState, useContext, useMemo } from "react";
import useSWR from "swr";
import { getExportCSV, getBatchExportCSV, getModelInfo } from "../services/api";
import { downloadWindDataCSV, downloadWindDataZIP } from "../services/download";
import { SettingsContext } from "../providers/SettingsContext";
import { GridLocation } from "../types";

export const useDownloadCSVFile = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [includeEnergy, setIncludeEnergy] = useState(false);
  const [period, setPeriod] = useState<"hourly" | "monthly">("hourly");
  const [yearSet, setYearSet] = useState<"full" | "sample">("full");
  const { currentPosition, preferredModel, turbine } =
    useContext(SettingsContext);
  const dataModel =
    preferredModel === "ensemble-quantiles" ? "era5-quantiles" : preferredModel;
  const { lat, lng } = currentPosition || {};

  const canDownload = !!(lat && lng && dataModel);

  const { data: modelInfo } = useSWR(
    dataModel ? `/api/v1/${dataModel}/info` : null,
    () => (dataModel ? getModelInfo(dataModel) : null)
  );

  const fullYearRange: string = useMemo(() => {
    if (!modelInfo?.available_years) return "All available years";
    const years = modelInfo.available_years;
    if (years.length === 0) return "All available years";
    if (years.length === 1) return `${years[0]}`;
    return `${years[0]}-${years[years.length - 1]}`;
  }, [modelInfo]);

  const sampleYearRange: string = useMemo(() => {
    if (!modelInfo?.sample_years) return "Recent years";
    const years = modelInfo.sample_years;
    if (years.length === 0) return "Recent years";
    if (years.length === 1) return `${years[0]}`;
    if (years.length <= 4) return years.join(", ");
    return `${years[0]}-${years[years.length - 1]}`;
  }, [modelInfo]);

  const downloadFile = async (
    gridLat: number,
    gridLng: number,
    gridIndex: string
  ) => {
    try {
      setIsDownloading(true);

      const response: Response = await getExportCSV(
        {
          gridIndex: gridIndex,
          dataModel: dataModel!,
          period: period,
          turbine: includeEnergy ? turbine : undefined,
          yearSet: yearSet,
        },
        includeEnergy
      );

      await downloadWindDataCSV(response, gridLat, gridLng);
      return { success: true };
    } catch (error) {
      console.error("Download failed:", error);
      return { success: false, error };
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadBatchFiles = async (gridLocations: GridLocation[]) => {
    try {
      setIsDownloading(true);

      const response: Response = await getBatchExportCSV(
        {
          gridLocations: gridLocations,
          dataModel: dataModel!,
          period: period,
          turbine: includeEnergy ? turbine : undefined,
          yearSet: yearSet,
        },
        includeEnergy
      );

      await downloadWindDataZIP(response, lat!, lng!);
      return { success: true };
    } catch (error) {
      console.error("Batch Download failed:", error);
      return { success: false, error };
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    canDownload,
    isDownloading,
    downloadFile,
    downloadBatchFiles,
    turbine,
    includeEnergy,
    setIncludeEnergy,
    period,
    setPeriod,
    yearSet,
    setYearSet,
    fullYearRange,
    sampleYearRange,
  };
};
