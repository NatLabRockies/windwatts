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

from app.utils.validation import (
    validate_lat,
    validate_lng,
    validate_height,
    validate_model,
    validate_source,
    validate_period_type,
    validate_powercurve,
    validate_year_range,
    validate_year_set,
    validate_years,
    validate_sectors,
    validate_calm_threshold,
    validate_bin,
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
    model = validate_model(model)
    height = validate_height(model, height, "windspeed")
    source = validate_source(model, source)
    period = validate_period_type(model, period, "windspeed")

    params = {"lat": lat, "lng": lng, "height": height, "period": period}

    key = f"{source}_{model}"
    data = data_fetcher_router.fetch_data(params, key=key)
    if data is None:
        raise HTTPException(status_code=404, detail="Data not found")
    return data


def get_production_core(
    model: str,
    lat: float,
    lng: float,
    height: int,
    powercurve: str,
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
        period (str): Time period to retrieve (all, summary, annual, monthly).
        source (str): Source of the data.
        data_fetcher_router: Router instance for fetching data.

    Returns:
        A dictionary containing energy production data.
    """
    lat = validate_lat(model, lat)
    lng = validate_lng(model, lng)
    model = validate_model(model)
    height = validate_height(model, height, "windspeed")
    powercurve = validate_powercurve(powercurve)
    source = validate_source(model, source)
    period = validate_period_type(model, period, "production")

    # Always fetch raw data for production calculations
    params = {"lat": lat, "lng": lng, "height": height}

    key = f"{source}_{model}"
    df = data_fetcher_router.fetch_raw(params, key=key)
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


def get_timeseries_core(
    model: str,
    gridIndices: List[str],
    period: str,
    source: str,
    data_fetcher_router: DataFetcherRouter,
    years: Optional[List[int]] = None,
    year_range: Optional[str] = None,
    year_set: Optional[str] = None,
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
    model = validate_model(model)
    source = validate_source(model, source)
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

    key = f"{source}_{model}"
    df = data_fetcher_router.fetch_data(params, key=key)

    if df is None or df.empty:
        raise HTTPException(
            status_code=404, detail="No data found for the specified parameters"
        )

    windspeed_cols = [col for col in df.columns if col.startswith("windspeed")]
    time = pd.to_datetime(df["time"], errors="coerce", utc=False)
    df["time"] = time

    if period == "monthly":
        df["year"] = time.dt.year.astype(int)
        df["month"] = time.dt.month.astype(int)
        df["year_month"] = (
            df["year"].astype(str) + "-" + df["month"].astype(str).str.zfill(2)
        )

        agg_dict = {col: "mean" for col in windspeed_cols}

        df = df.groupby("year_month").agg(agg_dict).reset_index()

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
    turbine: str,
    period: str,
    source: str,
    data_fetcher_router: DataFetcherRouter,
    years: Optional[List[int]] = None,
    year_range: Optional[str] = None,
    year_set: Optional[str] = None,
    return_dataframe: bool = False,
):
    turbine = validate_powercurve(turbine)
    heights = MODEL_CONFIG[model].get("heights")

    df = get_timeseries_core(
        model,
        gridIndices,
        "hourly",
        source,
        data_fetcher_router,
        years,
        year_range,
        year_set,
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
        result_df = df_with_energy[cols]

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


def _make_sector_angles(n: int):
    "Return list of centre bearings (degrees) and sector width for n equal sectors."
    sector_width = 360.0 / n
    centers = [round(i * sector_width, 2) for i in range(n)]
    return centers, sector_width


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
):
    # Validate model and ensure the requested height has wind direction data available
    model = validate_model(model)
    height = validate_height(model, height, "windspeed")
    height = validate_height(model, height, "winddirection")
    sectors = validate_sectors(sectors)
    calm_threshold = validate_calm_threshold(calm_threshold)
    bin = validate_bin(bin)
    source = MODEL_CONFIG.get(model, {}).get("source")

    ws_col = f"windspeed_{height}m"
    wd_col = f"winddirection_{height}m"

    # Fetch raw hourly timeseries; wind rose requires full per-hour records
    df = get_timeseries_core(
        model,
        gridIndices,
        "hourly",
        source,
        data_fetcher_router,
        years=None,
        year_range=year_range,
        year_set=year_set,
        return_dataframe=True,
    )

    ws = df[ws_col].to_numpy(dtype=float)
    wd = df[wd_col].to_numpy(dtype=float)
    total = len(ws)

    # Separate calm rows (speed below threshold) from active rows used in sector assignment
    calm_mask = ws < calm_threshold
    calm_fraction = round(float(calm_mask.sum()) / total, 3)
    active_ws = ws[~calm_mask]
    active_wd = wd[~calm_mask]

    # Divide the compass into equal sectors and assign each active observation to one
    sector_centers, sector_width = _make_sector_angles(sectors)
    sector_idx = (np.floor((active_wd + sector_width / 2) % 360 / sector_width)).astype(
        int
    )

    if bin == 1:
        # Raw - return actual windspeed values per sector keyed by str(direction_deg)
        sectors_data = {}
        for i, deg in enumerate(sector_centers):
            sector_ws = sorted(active_ws[sector_idx == i].round(4).tolist())
            sectors_data[str(deg)] = sector_ws
        return {
            "calm_fraction": calm_fraction,
            "bin_edges": [],
            "cells": [],
            "sectors_data": sectors_data,
        }

    raw_max_ws = float(np.ceil(active_ws.max()))
    # Round up to the nearest multiple of bin count for clean integer edges
    max_ws = float(np.ceil(raw_max_ws / bin) * bin)
    bin_edges = [round(float(e), 1) for e in np.linspace(0, max_ws, bin + 1)]

    cells = []
    for i, deg in enumerate(sector_centers):
        in_sector = sector_idx == i
        # Sort once per sector so bisect can locate bin boundaries in O(log n)
        sector_ws = sorted(active_ws[in_sector].tolist())
        for j in range(bin):
            lo = bin_edges[j]
            hi = bin_edges[j + 1] if j + 1 < bin else float("inf")
            left = bisect.bisect_left(sector_ws, lo)
            right = (
                bisect.bisect_left(sector_ws, hi)
                if hi != float("inf")
                else len(sector_ws)
            )
            freq = round((right - left) / total, 4)
            if freq > 0:
                cells.append({"angle_deg": deg, "bin_index": j, "frequency": freq})

    return {
        "calm_fraction": calm_fraction,
        "bin_edges": bin_edges,
        "cells": cells,
        "sectors_data": {},
    }
