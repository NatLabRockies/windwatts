import {
  EnergyProductionRequest,
  WindspeedByLatLngRequest,
  WindspeedPeriod,
  WindspeedResponse,
  GlobalWindspeedResponse,
  YearlyWindspeedResponse,
  MonthlyWindspeedResponse,
  HourlyWindspeedResponse,
  WindRoseRequest,
  WindRoseResponse,
  ModelInfoResponse,
  EnergyProductionResponse,
  GridPointsResponse,
  AvailableTurbinesResponse,
  NearestGridLocationRequest,
  CSVExportRequest,
  CSVBatchExportRequest,
} from "../types";

export const fetchWrapper = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const fetchBlobWrapper = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

const fetchWindspeedByPeriod = async <T>(
  { lat, lng, hubHeight, dataModel }: WindspeedByLatLngRequest,
  period: WindspeedPeriod
): Promise<T> => {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    height: String(hubHeight),
    period,
  });
  const url = `/api/v1/${dataModel}/windspeed?${params.toString()}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper<T>(url, options);
};

// V1 API: Uses unified endpoint with model as path parameter
export const getWindspeedByLatLong = async ({
  lat,
  lng,
  hubHeight,
  dataModel,
}: WindspeedByLatLngRequest): Promise<WindspeedResponse> => {
  return fetchWindspeedByPeriod<WindspeedResponse>(
    { lat, lng, hubHeight, dataModel },
    "all"
  );
};

export const getWindspeedGlobalAverage = async (
  request: WindspeedByLatLngRequest
): Promise<GlobalWindspeedResponse> => {
  return fetchWindspeedByPeriod<GlobalWindspeedResponse>(request, "all");
};

export const getWindspeedYearlyAverage = async (
  request: WindspeedByLatLngRequest
): Promise<YearlyWindspeedResponse> => {
  return fetchWindspeedByPeriod<YearlyWindspeedResponse>(request, "annual");
};

export const getWindspeedMonthlyAverage = async (
  request: WindspeedByLatLngRequest
): Promise<MonthlyWindspeedResponse> => {
  return fetchWindspeedByPeriod<MonthlyWindspeedResponse>(request, "monthly");
};

export const getWindspeedHourlyAverage = async (
  request: WindspeedByLatLngRequest
): Promise<HourlyWindspeedResponse> => {
  return fetchWindspeedByPeriod<HourlyWindspeedResponse>(request, "hourly");
};

export const getWindRose = async ({
  gridIndex,
  height,
  dataModel,
  sectors = 16,
  bin = 5,
  calmThreshold,
}: WindRoseRequest): Promise<WindRoseResponse> => {
  dataModel = "era5-timeseries"; // Hardcode timeseries model
  const headers = { "Content-Type": "application/json" };

  const params = new URLSearchParams({
    gridIndex,
    height: String(height),
    sectors: String(sectors),
    bin: String(bin),
  });

  if (calmThreshold !== undefined) {
    params.append("calm_threshold", String(calmThreshold));
  }

  return fetchWrapper<WindRoseResponse>(
    `/api/v1/${dataModel}/windrose?${params.toString()}`,
    { method: "GET", headers }
  );
};

// V1 API:
// period options: "all" (default), "summary", "annual", "monthly" (varies by model)
export const getEnergyProduction = async ({
  lat,
  lng,
  hubHeight,
  turbine,
  dataModel,
  period = "all",
}: EnergyProductionRequest): Promise<EnergyProductionResponse> => {
  const url = `/api/v1/${dataModel}/production?lat=${lat}&lng=${lng}&height=${hubHeight}&turbine=${turbine}&period=${period}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper<EnergyProductionResponse>(url, options);
};

// export const getAvailablePowerCurves = async ({
//   dataModel,
// }: { dataModel: DataModel }) => {
//   const url = `/api/${dataModel}/available-powercurves`;
//   const options = {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };
//   return fetchWrapper(url, options);
// };

// V1 API: Turbines are model-agnostic
export const getAvailableTurbines =
  async (): Promise<AvailableTurbinesResponse> => {
    const url = `/api/v1/turbines`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return fetchWrapper<AvailableTurbinesResponse>(url, options);
  };

// V1 API: Grid points lookup
export const getNearestGridLocation = async ({
  lat,
  lng,
  n_neighbors = 1,
  dataModel,
}: NearestGridLocationRequest): Promise<GridPointsResponse> => {
  const url = `/api/v1/${dataModel}/grid-points?lat=${lat}&lng=${lng}&limit=${n_neighbors}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper<GridPointsResponse>(url, options);
};

// V1 API: Get model information
export const getModelInfo = async (
  dataModel: string
): Promise<ModelInfoResponse> => {
  const url = `/api/v1/${dataModel}/info`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper<ModelInfoResponse>(url, options);
};

// V1 API: Single timeseries CSV download
// by period of hourly or monthly
// with option to include energy
export const getExportCSV = async (
  {
    gridIndex,
    dataModel,
    period = "hourly",
    turbine,
    yearSet,
  }: CSVExportRequest,
  includeEnergy: boolean
): Promise<Response> => {
  if (includeEnergy) {
    if (!turbine) {
      throw new Error("Turbine must be specified for energy export");
    }
    // Energy export
    const params = new URLSearchParams({
      gridIndex: gridIndex,
      period: period,
      turbine: turbine,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/energy?${params.toString()}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return fetchBlobWrapper(url, options);
  } else {
    // Timeseries export
    const params = new URLSearchParams({
      gridIndex: gridIndex,
      period: period,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries?${params.toString()}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return fetchBlobWrapper(url, options);
  }
};

// V1 API: Batch CSV download as ZIP
export const getBatchExportCSV = async (
  {
    gridLocations,
    dataModel,
    period = "hourly",
    turbine,
    yearSet,
  }: CSVBatchExportRequest,
  includeEnergy: boolean
): Promise<Response> => {
  if (includeEnergy) {
    if (!turbine) {
      throw new Error("Turbine must be specified for energy export");
    }
    // Batch energy export
    const params = new URLSearchParams({
      period: period,
      turbine: turbine,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/energy/batch?${params.toString()}`;
    const body = {
      locations: gridLocations,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    return fetchBlobWrapper(url, options);
  } else {
    // Batch timeseries export
    const params = new URLSearchParams({
      period: period,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/batch?${params.toString()}`;
    const body = {
      locations: gridLocations,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    return fetchBlobWrapper(url, options);
  }
};
