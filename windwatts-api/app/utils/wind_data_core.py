"""
Core data retrieval functions for WindWatts API.

Provides the core business logic for fetching wind speed, energy production,
and timeseries data from various data sources.
"""

from typing import List, Optional
from fastapi import HTTPException
from app.data_fetchers.data_fetcher_router import DataFetcherRouter
from io import StringIO
from app.config.model_config import MODEL_CONFIG, TEMPORAL_SCHEMAS
import pandas as pd
import numpy as np
import bisect
from app.schemas import PowerCurveData
from app.types.spatial import NoLandCellError
from app.utils.wind_processing import (
    compute_sectors,
    resolve_heights,
    interpolate_windspeed_power_law_timeseries,
)

from app.utils.validation import (
    validate_lat,
    validate_lng,
    validate_height,
    validate_model_exists,
    validate_source,
    validate_period_type,
    validate_powercurve,
    validate_year_range,
    validate_year_set,
    validate_years,
    validate_sectors,
    validate_rose_type,
    validate_calm_threshold,
    validate_bin,
    validate_model_for_timeseries,
)
from app.power_curve.global_power_curve_manager import power_curve_manager


def get_windspeed_core(
    model: str,
    lat: float,
    lng: float,
    height: int,
    period: str,
    source: str,
    data_fetcher_router: DataFetcherRouter,
):
    """
    Core function to retrieve wind speed data from the source database.

    Args:
        model (str): Data model (era5, wtk, ensemble).
        lat (float): Latitude of the location.
        lng (float): Longitude of the location.
        height (int): Height in meters.
        period (str): Type of period to retrieve (all, annual, monthly, hourly, none).
        source (str): Source of the data (athena, s3).
        data_fetcher_router: Router instance for fetching data.

    Returns:
        Wind speed data from the data source.
    """
    lat = validate_lat(model, lat)
    lng = validate_lng(model, lng)
    model = validate_model_exists(model)
    height = validate_height(model, height, "windspeed")
    source = validate_source(model, source)
    period = validate_period_type(model, period, "windspeed")

    params = {"lat": lat, "lng": lng, "height": height, "period": period}

    key = f"{source}_{model}"
    try:
        data = data_fetcher_router.fetch_data(params, key=key)
    except NoLandCellError as e:
        raise HTTPException(status_code=404, detail=str(e))
    if data is None:
        raise HTTPException(status_code=404, detail="Data not found")
    return data


def get_production_core(
    model: str,
    lat: float,
    lng: float,
    height: int,
    powercurve: Optional[str],
    custom_power_curve: Optional[PowerCurveData],
    period: str,
    source: str,
    data_fetcher_router: DataFetcherRouter,
):
    """
    Core function to retrieve energy production data.

    Args:
        model (str): Data model (era5, wtk, ensemble).
        lat (float): Latitude of the location.
        lng (float): Longitude of the location.
        height (int): Height in meters.
        powercurve (str): Power curve name.
        custom_power_curve (PowerCurveData): custom power curve data with windspeed and turbine output.
        period (str): Time period to retrieve (all, summary, annual, monthly).
        source (str): Source of the data.
        data_fetcher_router: Router instance for fetching data.

    Returns:
        A dictionary containing energy production data.
    """
    lat = validate_lat(model, lat)
    lng = validate_lng(model, lng)
    model = validate_model_exists(model)
    height = validate_height(model, height, "windspeed")
    powercurve = validate_powercurve(powercurve, custom_power_curve)
    source = validate_source(model, source)
    period = validate_period_type(model, period, "production")

    # Always fetch raw data for production calculations
    params = {"lat": lat, "lng": lng, "height": height}

    key = f"{source}_{model}"
    try:
        df = data_fetcher_router.fetch_raw(params, key=key)
    except NoLandCellError as e:
        raise HTTPException(status_code=404, detail=str(e))
    if df is None:
        raise HTTPException(status_code=404, detail="Data not found")

    if period == "all":
        summary_avg_energy_production = (
            power_curve_manager.calculate_energy_production_summary(
                df, height, powercurve, model
            )
        )
        return {
            "energy_production": summary_avg_energy_production["Average year"][
                "kWh produced"
            ]
        }

    elif period == "summary":
        summary_avg_energy_production = (
            power_curve_manager.calculate_energy_production_summary(
                df, height, powercurve, model
            )
        )
        return {"summary_avg_energy_production": summary_avg_energy_production}

    elif period == "annual":
        yearly_avg_energy_production = (
            power_curve_manager.calculate_yearly_energy_production(
                df, height, powercurve, model
            )
        )
        return {"yearly_avg_energy_production": yearly_avg_energy_production}

    elif period == "monthly":
        monthly_avg_energy_production = (
            power_curve_manager.calculate_monthly_energy_production(
                df, height, powercurve, model
            )
        )
        return {"monthly_avg_energy_production": monthly_avg_energy_production}

    elif period == "full":
        # Add only supported production period_type in full
        schema = MODEL_CONFIG[model]["schema"]
        valid_periods = TEMPORAL_SCHEMAS[schema]["period_type"].get("production", [])
        valid_periods = [p for p in valid_periods if p != "full"]

        response_dict = {}

        summary_avg_energy_production = (
            power_curve_manager.calculate_energy_production_summary(
                df, height, powercurve, model
            )
        )

        response_dict = {
            "summary_avg_energy_production": summary_avg_energy_production,
            "energy_production": summary_avg_energy_production["Average year"][
                "kWh produced"
            ],
        }

        if "annual" in valid_periods:
            response_dict["yearly_avg_energy_production"] = (
                power_curve_manager.calculate_yearly_energy_production(
                    df, height, powercurve, model
                )
            )

        if "monthly" in valid_periods:
            response_dict["monthly_avg_energy_production"] = (
                power_curve_manager.calculate_monthly_energy_production(
                    df, height, powercurve, model
                )
            )

        return response_dict


def _resolve_timeseries_columns(model: str, height: Optional[int] = None):
    """Resolve the column subset and height_info for a timeseries request.

    Columns are the non-partition temporal columns plus the windspeed column(s)
    for ``height`` (one if native, two bracketing heights if interpolation is
    needed). Returns ``(None, None)`` when ``height`` is None (read all columns).
    """
    if height is None:
        return None, None
    schema = MODEL_CONFIG[model]["schema"]
    temporal_cols = TEMPORAL_SCHEMAS[schema]["column_config"]["temporal_columns"]
    partition_cols = MODEL_CONFIG[model]["s3"]["partition_columns"]

    available_ws_heights = MODEL_CONFIG[model]["heights"]["windspeed"]
    height_info = resolve_heights(height, available_ws_heights)

    file_temporal = [col for col in temporal_cols if col not in partition_cols]
    cols = file_temporal + height_info["columns"]
    return cols, height_info


def _apply_timeseries_interpolation(df: pd.DataFrame, height: int, height_info: dict):
    """Interpolate windspeed to the target height for hourly timeseries.

    When the height is not native, adds ``windspeed_{height}m`` via the per-row
    local shear exponent and drops the two bracketing columns. Returns ``df``
    unchanged when ``height_info`` is None (no height requested) or exact.
    """
    if height_info is None or height_info["exact"]:
        return df
    lower_col = f"windspeed_{height_info['lower']}m"
    upper_col = f"windspeed_{height_info['upper']}m"
    df = interpolate_windspeed_power_law_timeseries(
        df, height, height_info["lower"], height_info["upper"]
    )
    return df.drop(columns=[lower_col, upper_col])


def _aggregate_timeseries_monthly(df, time, windspeed_cols):
    """Aggregate hourly timeseries to a per-month (yyyy-mm) mean.

    Groups rows by calendar ``year_month`` and averages each windspeed column.

    Args:
        df (pd.DataFrame): Hourly timeseries to aggregate.
        time (pd.Series): Parsed datetime series aligned to ``df`` rows.
        windspeed_cols (list[str]): Windspeed columns to average.

    Returns:
        pd.DataFrame: One row per ``year_month`` with mean windspeed columns.
    """
    df["year"] = time.dt.year.astype(int)
    df["month"] = time.dt.month.astype(int)
    df["year_month"] = (
        df["year"].astype(str) + "-" + df["month"].astype(str).str.zfill(2)
    )
    agg_dict = {col: "mean" for col in windspeed_cols}
    return df.groupby("year_month").agg(agg_dict).reset_index()


def get_timeseries_core(
    model: str,
    gridIndices: List[str],
    period: str,
    source: str,
    data_fetcher_router: DataFetcherRouter,
    years: Optional[List[int]] = None,
    year_range: Optional[str] = None,
    year_set: Optional[str] = None,
    height: Optional[int] = None,
    return_dataframe: bool = False,
):
    """
    Core function to retrieve timeseries data for download.

    Args:
        model (str): Data model (era5, wtk, ensemble).
        gridIndices (List[str]): List of grid indices to retrieve.
        period (str): Time period - "hourly" for raw data, "monthly" for yyyy-mm aggregation
        source (str): Source of the data.
        data_fetcher_router: Router instance for fetching data.
        years (List[int]): List of years to retrieve, default to sample years.
        year_range (str): Range of years for download. Format: YYYY-YYYY.
        year_set (str): Full or Sample dataset to download.
        return_dataframe: If True, return DataFrame instead of CSV string

    Returns:
        str or pd.DataFrame: CSV content as string or DataFrame
    """
    model = validate_model_exists(model)
    model = validate_model_for_timeseries(model)
    source = validate_source(model, source)
    if height is not None:
        height = validate_height(model, height, "windspeed")
    period = validate_period_type(model, period, "timeseries")

    if year_range:
        start_year, end_year = validate_year_range(year_range, model)
        resolved_years = list(range(start_year, end_year + 1))
    elif year_set:
        year_set = validate_year_set(year_set)
        resolved_years = MODEL_CONFIG[model]["years"].get(year_set, [])
    elif years:
        resolved_years = validate_years(years, model)
    else:
        resolved_years = MODEL_CONFIG[model]["years"].get("sample", [])

    params = {"gridIndices": gridIndices, "years": resolved_years}

    resolved_cols, height_info = _resolve_timeseries_columns(model, height)
    if resolved_cols is not None:
        params["cols"] = resolved_cols

    key = f"{source}_{model}"
    df = data_fetcher_router.fetch_data(params, key=key)

    if df is None or df.empty:
        raise HTTPException(
            status_code=404, detail="No data found for the specified parameters"
        )

    time = pd.to_datetime(df["time"], errors="coerce", utc=False)
    df["time"] = time

    df = _apply_timeseries_interpolation(df, height, height_info)

    windspeed_cols = [col for col in df.columns if col.startswith("windspeed")]

    if period == "monthly":
        df = _aggregate_timeseries_monthly(df, time, windspeed_cols)

    df[windspeed_cols] = df[windspeed_cols].round(2)

    if return_dataframe:
        return df

    # Convert DataFrame to CSV string
    csv_io = StringIO()
    df.to_csv(csv_io, index=False)
    return csv_io.getvalue()


def get_timeseries_energy_core(
    model: str,
    gridIndices: List[str],
    turbine: Optional[str],
    custom_power_curve: Optional[PowerCurveData],
    period: str,
    source: str,
    data_fetcher_router: DataFetcherRouter,
    years: Optional[List[int]] = None,
    year_range: Optional[str] = None,
    year_set: Optional[str] = None,
    height: Optional[int] = None,
    return_dataframe: bool = False,
):
    turbine = validate_powercurve(turbine, custom_power_curve)
    if height is None:
        heights = MODEL_CONFIG[model].get("heights").get("windspeed")
    else:
        heights = [height]
    df = get_timeseries_core(
        model,
        gridIndices,
        "hourly",
        source,
        data_fetcher_router,
        years,
        year_range,
        year_set,
        height,
        return_dataframe=True,
    )
    df_with_energy, _ = power_curve_manager.compute_energy_production_df(
        df, heights, turbine, model, relevant_columns_only=False
    )

    if period == "hourly":
        # to maintain col orders
        cols = ["time"]
        for h in heights:
            ws_col = f"windspeed_{h}m"
            cols.append(ws_col)
            energy_col = f"energy_{h}m_kwh"
            cols.append(energy_col)
        result_df = df_with_energy[cols].copy()

    if period == "monthly":
        df_with_energy["year_month"] = (
            df_with_energy["year"].astype(str)
            + "-"
            + df_with_energy["month"].astype(str).str.zfill(2)
        )
        agg_dict = {}
        for h in heights:
            ws_col = f"windspeed_{h}m"
            energy_col = f"energy_{h}m_kwh"
            agg_dict[ws_col] = "mean"
            agg_dict[energy_col] = "sum"

        result_df = df_with_energy.groupby("year_month").agg(agg_dict).reset_index()

    cols_to_round = [
        col
        for col in result_df.columns
        if col.startswith("windspeed") or col.startswith("energy")
    ]

    result_df[cols_to_round] = result_df[cols_to_round].round(2)

    if return_dataframe:
        return result_df

    csv_io = StringIO()
    result_df.to_csv(csv_io, index=False)
    return csv_io.getvalue()


def get_windrose_core(
    model: str,
    gridIndices: List[str],
    height: int,
    data_fetcher_router: DataFetcherRouter,
    bin: int,
    sectors: int,
    calm_threshold: float,
    year_set: str,
    year_range: Optional[str],
    turbine: Optional[str] = None,
    custom_power_curve: Optional[PowerCurveData] = None,
    rose_type: str = "windspeed",
):
    model = validate_model_exists(model)
    height = validate_height(model, height, "windspeed")
    height = validate_height(model, height, "winddirection")
    sectors = validate_sectors(sectors)
    rose_type = validate_rose_type(rose_type)
    calm_threshold = validate_calm_threshold(calm_threshold, rose_type)
    bin = validate_bin(bin)
    power_curve = None
    if rose_type == "power":
        power_curve = validate_powercurve(turbine, custom_power_curve)

    source = MODEL_CONFIG.get(model, {}).get("source")

    ws_col = f"windspeed_{height}m"
    wd_col = f"winddirection_{height}m"

    # Fetch raw hourly timeseries; rose requires full per-hour records
    df = get_timeseries_core(
        model,
        gridIndices,
        "hourly",
        source,
        data_fetcher_router,
        years=None,
        year_range=year_range,
        year_set=year_set,
        height=None,
        return_dataframe=True,
    )

    ws = df[ws_col].to_numpy(dtype=float)
    wd = df[wd_col].to_numpy(dtype=float)
    total = len(ws)

    if rose_type == "power":
        # Apply power curve: wind speed (m/s) → power output (kW)
        ws_df = pd.DataFrame({"ws-adjusted": ws})
        values = np.array(
            power_curve.windspeed_to_kw(ws_df, ws_column="ws-adjusted"), dtype=float
        )
        bin_edge_decimals = 0
    elif rose_type == "windspeed":
        values = ws
        bin_edge_decimals = 1

    calm_mask = values <= calm_threshold

    calm_fraction = round(float(calm_mask.sum()) / total, 3)
    active_values = values[~calm_mask]
    active_wd = wd[~calm_mask]

    # Divide the compass into equal sectors and assign each active observation to one
    sector_centers, sector_width_deg, sector_edges = compute_sectors(sectors)
    sector_idx = (
        np.floor((active_wd + sector_width_deg / 2) % 360 / sector_width_deg)
    ).astype(int)

    raw_max = (
        float(np.ceil(active_values.max())) if len(active_values) > 0 else float(bin)
    )
    # Round up to the nearest multiple of bin count for clean edges
    max_val = float(np.ceil(raw_max / bin) * bin)
    bin_edges = [
        round(float(e), bin_edge_decimals) for e in np.linspace(0, max_val, bin + 1)
    ]

    bin_info = [
        {
            "bin_index": j,
            "bin_min": bin_edges[j],
            "bin_max": bin_edges[j + 1],
        }
        for j in range(bin)
    ]

    sector_info = [
        {
            "sector_index": i,
            "center_bearing_deg": sector_centers[i],
            "from_deg": sector_edges[i][0],
            "to_deg": sector_edges[i][1],
        }
        for i in range(sectors)
    ]

    common = {
        "no_of_sectors": sectors,
        "no_of_bins": bin,
        "calm_info": {"calm_threshold": calm_threshold, "calm_fraction": calm_fraction},
        "calm_data": np.round(values[calm_mask], 2).tolist(),
        "sector_info": sector_info,
    }

    bin_data = []
    for i in range(sectors):
        sector_values = sorted(active_values[sector_idx == i].round(2).tolist())
        if not sector_values:
            for j in range(bin):
                bin_data.append(
                    {
                        "bin_index": j,
                        "sector_index": i,
                        "data": [],
                        "frequency": 0.0,
                    }
                )
            continue

        right_boundaries = [
            bisect.bisect_right(sector_values, e) for e in bin_edges[1:]
        ]
        prev = 0
        for j in range(bin):
            data = sector_values[prev : right_boundaries[j]]
            prev = right_boundaries[j]
            freq = round(len(data) / total, 4)
            bin_data.append(
                {
                    "bin_index": j,
                    "sector_index": i,
                    "data": data,
                    "frequency": freq,
                }
            )

    return {
        **common,
        "bin_info": bin_info,
        "bin_data": bin_data,
    }
