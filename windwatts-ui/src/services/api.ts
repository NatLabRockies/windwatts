import {
  EnergyProductionRequest,
  WindspeedByLatLngRequest,
  NearestGridLocationRequest,
  CSVExportRequest,
  CSVBatchExportRequest,
} from "../types";

export const fetchWrapper = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchBlobWrapper = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
// V1 API: Uses unified endpoint with model as path parameter
export const getWindspeedByLatLong = async ({
  lat,
  lng,
  hubHeight,
  dataModel,
}: WindspeedByLatLngRequest) => {
  const url = `/api/v1/${dataModel}/windspeed?lat=${lat}&lng=${lng}&height=${hubHeight}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// V1 API:
// period options: "all" (default), "summary", "annual", "monthly" (varies by model)
export const getEnergyProduction = async ({
  lat,
  lng,
  hubHeight,
  powerCurve,
  dataModel,
  period = "all",
}: EnergyProductionRequest) => {
  const url = `/api/v1/${dataModel}/production?lat=${lat}&lng=${lng}&height=${hubHeight}&powercurve=${powerCurve}&period=${period}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
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

// V1 API: Power curves are model-agnostic
export const getAvailablePowerCurves = async () => {
  const url = `/api/v1/powercurves`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// V1 API: Grid points lookup
export const getNearestGridLocation = async ({
  lat,
  lng,
  n_neighbors = 1,
  dataModel,
}: NearestGridLocationRequest) => {
  const url = `/api/v1/${dataModel}/grid-points?lat=${lat}&lng=${lng}&limit=${n_neighbors}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// V1 API: Single timeseries CSV download
// by period of hourly or monthly
// with option to include energy
export const getExportCSV = async (
  { gridIndex, dataModel, period = "hourly", turbine }: CSVExportRequest,
  includeEnergy: boolean
) => {
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
  }: CSVBatchExportRequest,
  includeEnergy: boolean
) => {
  if (includeEnergy) {
    if (!turbine) {
      throw new Error("Turbine must be specified for energy export");
    }
    // Batch energy export
    const params = new URLSearchParams({
      period: period,
      turbine: turbine,
    });
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
