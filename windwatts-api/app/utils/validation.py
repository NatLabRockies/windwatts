"""
Validation functions for WindWatts API.
"""

import re
from fastapi import HTTPException

from app.config.model_config import MODEL_CONFIG, TEMPORAL_SCHEMAS


def validate_model(model: str) -> str:
    """Validate model parameter"""
    if model not in MODEL_CONFIG:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model. Must be one of: {list(MODEL_CONFIG.keys())}. But got f{model} instead.",
        )
    return model


def validate_source(model: str, source: str) -> str:
    """Validate source for given model"""
    valid_source = MODEL_CONFIG[model]["source"]
    if source != valid_source:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source for {model}. Must be : {valid_source}",
        )
    return source


def validate_period_type(model: str, period_type: str, data_type: str) -> str:
    """Validate period parameter for given model and data type"""
    schema = MODEL_CONFIG[model]["schema"]
    valid_periods = TEMPORAL_SCHEMAS[schema]["period_type"].get(data_type, [])
    if period_type not in valid_periods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid period for {model}. Must be one of: {valid_periods}",
        )
    return period_type


def validate_lat(model: str, lat: float) -> float:
    """Validate latitude parameter"""
    min_lat = MODEL_CONFIG[model]["grid_info"].get("min_lat")
    max_lat = MODEL_CONFIG[model]["grid_info"].get("max_lat")
    if not (min_lat <= lat <= max_lat):
        raise HTTPException(
            status_code=400,
            detail=f"Latitude for {model} must be between {min_lat} and {max_lat}.",
        )
    return lat


def validate_lng(model: str, lng: float) -> float:
    """Validate longitude parameter"""
    min_lng = MODEL_CONFIG[model]["grid_info"].get("min_long")
    max_lng = MODEL_CONFIG[model]["grid_info"].get("max_long")
    if not (min_lng <= lng <= max_lng):
        raise HTTPException(
            status_code=400,
            detail=f"Longitude for {model} must be between {min_lng} and {max_lng}.",
        )
    return lng


def validate_height(model: str, height: int) -> int:
    """Validate height parameter"""
    valid_heights = MODEL_CONFIG[model].get("heights", [])
    if valid_heights and height not in valid_heights:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid height for {model}. Must be one of: {valid_heights}",
        )
    return height


def validate_powercurve(powercurve: str) -> str:
    """Validate power curve name"""
    # Import here to avoid circular dependency
    from app.power_curve.global_power_curve_manager import power_curve_manager

    if not re.match(r"^[\w\-.]+$", powercurve):
        raise HTTPException(status_code=400, detail="Invalid power curve name.")
    if powercurve not in power_curve_manager.power_curves:
        raise HTTPException(status_code=400, detail="Power curve not found.")
    return powercurve


def validate_year(year: int, model: str) -> int:
    """Validate year for given model"""
    valid_years = MODEL_CONFIG[model]["years"].get("full", [])
    if valid_years and year not in valid_years:
        year_range = f"{min(valid_years)}-{max(valid_years)}"
        raise HTTPException(
            status_code=400,
            detail=f"Invalid year for {model}. Currently supporting years {year_range}",
        )
    return year


def validate_limit(limit: int) -> int:
    """Validate limit parameter for grid points"""
    if not 1 <= limit <= 4:
        raise HTTPException(
            status_code=400,
            detail="Invalid limit. Currently supporting up to 4 nearest grid points",
        )
    return limit


def validate_data_with_temporal_schema(df, schema: str):
    """Validate the dataframe with repect to temporal schema config."""
    temporal_schema_config = TEMPORAL_SCHEMAS.get(schema, {})

    column_config = temporal_schema_config.get("column_config", {})

    df_cols = set(df.columns.str.lower())

    # validate required columns
    required_cols = column_config.get("temporal_columns", []) + column_config.get(
        "probability_columns", []
    )
    missing_cols = [col for col in required_cols if col.lower() not in df_cols]
    if missing_cols:
        raise ValueError(f"Missing columns: {missing_cols} for the schema {schema}.")

    # validate for no temporal columns
    if not column_config.get("temporal_columns", []):
        temporal_cols = [
            col
            for col in ["year", "month", "day", "hour", "time", "mohr"]
            if col in df_cols
        ]
        if temporal_cols:
            raise ValueError(
                f"Schema '{schema}' validation failed: "
                f"Schema is atemporal and should NOT have temporal columns. "
                f"Found: {temporal_cols}"
            )

def validate_year_range(year_range: str) -> bool:
    """
    Validates if a string is in YYYY-YYYY format and logic is sound.
    """
    if not re.match(r"^\d{4}-\d{4}$", year_range):
        raise ValueError("year range must be given in format YYYY-YYYY.")
    
    start_year, end_year = map(int, year_range.split('-'))

    if start_year > end_year:
        raise ValueError(f"Invalid range: Start year ({start_year}) cannot be greater than end year ({end_year}).")
    
    return start_year, end_year

