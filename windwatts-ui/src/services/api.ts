import {
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
  EnergyProductionRequest,
  ProductionRequestBody,
  TimeseriesEnergyRequestBody,
  TimeseriesEnergyBatchRequestBody,
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

export const getWindRose = async (
  request: WindRoseRequest
): Promise<WindRoseResponse> => {
  const {
    gridIndex,
    height,
    rose_type = "wind_speed",
    sectors = 16,
    bin = 5,
    calmThreshold,
    turbine,
    customPowerCurve,
  } = request;
  const dataModel = "era5-timeseries"; // timeseries model
  const body: Record<string, unknown> = {
    gridIndex,
    height,
    rose_type,
    sectors,
    bin,
  };

  if (calmThreshold !== undefined) {
    body.calm_threshold = calmThreshold;
  }

  if (customPowerCurve && customPowerCurve.length > 0) {
    body.custom_power_curve = {
      wind_speed_ms: customPowerCurve.map((p) => p.ws),
      turbine_output_kw: customPowerCurve.map((p) => p.kw),
    };
  } else if (turbine) {
    body.turbine = turbine;
  }

  return fetchWrapper<WindRoseResponse>(`/api/v1/${dataModel}/windrose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

// V1 API: POST /{model}/production
// period options: "all" (default), "summary", "annual", "monthly" (varies by model)
// customPowerCurve takes precedence over reference turbine
export const getEnergyProduction = async ({
  lat,
  lng,
  hubHeight,
  turbine,
  customPowerCurve,
  dataModel,
  period = "all",
}: EnergyProductionRequest): Promise<EnergyProductionResponse> => {
  const url = `/api/v1/${dataModel}/production`;
  const body: ProductionRequestBody = { lat, lng, height: hubHeight, period };

  if (customPowerCurve && customPowerCurve.length > 0) {
    body.custom_power_curve = {
      wind_speed_ms: customPowerCurve.map((p) => p.ws),
      turbine_output_kw: customPowerCurve.map((p) => p.kw),
    };
  } else if (turbine) {
    body.turbine = turbine;
  }

  return fetchWrapper<EnergyProductionResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
    customPowerCurve,
    yearSet,
  }: CSVExportRequest,
  includeEnergy: boolean
): Promise<Response> => {
  if (includeEnergy) {
    if (!turbine && !customPowerCurve?.length) {
      throw new Error(
        "Turbine or custom power curve must be specified for energy export"
      );
    }
    // Energy export
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/energy`;
    const body: TimeseriesEnergyRequestBody = { gridIndex, period };
    if (yearSet) body.year_set = yearSet;
    if (customPowerCurve && customPowerCurve.length > 0) {
      body.custom_power_curve = {
        wind_speed_ms: customPowerCurve.map((p) => p.ws),
        turbine_output_kw: customPowerCurve.map((p) => p.kw),
      };
    } else if (turbine) {
      body.turbine = turbine;
    }
    return fetchBlobWrapper(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
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
    customPowerCurve,
    yearSet,
  }: CSVBatchExportRequest,
  includeEnergy: boolean
): Promise<Response> => {
  if (includeEnergy) {
    if (!turbine && !customPowerCurve?.length) {
      throw new Error(
        "Turbine or custom power curve must be specified for energy export"
      );
    }
    // Batch energy export
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/energy/batch`;
    const body: TimeseriesEnergyBatchRequestBody = {
      locations: gridLocations,
      period,
    };
    if (yearSet) body.year_set = yearSet;
    if (customPowerCurve && customPowerCurve.length > 0) {
      body.custom_power_curve = {
        wind_speed_ms: customPowerCurve.map((p) => p.ws),
        turbine_output_kw: customPowerCurve.map((p) => p.kw),
      };
    } else if (turbine) {
      body.turbine = turbine;
    }
    return fetchBlobWrapper(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
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
