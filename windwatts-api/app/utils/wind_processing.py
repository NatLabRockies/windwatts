import bisect
import numpy as np
import pandas as pd
from scipy.interpolate import CubicSpline
from typing import List, Optional
from app.config.model_config import MODEL_CONFIG, TEMPORAL_SCHEMAS


def resolve_heights(target_height: int, available_heights: list[int]) -> dict:
    """
    Determine what columns to fetch for a given target height.

    Returns dict with:
        exact (bool), columns (list[str]), lower (int|None), upper (int|None)
    """
    if target_height in available_heights:
        return {
            "exact": True,
            "columns": [f"windspeed_{target_height}m"],
            "lower": None,
            "upper": None,
        }

    sorted_h = sorted(available_heights)
    idx = bisect.bisect_left(sorted_h, target_height)

    if idx == 0 or idx >= len(sorted_h):
        raise ValueError(
            f"Height {target_height}m outside range [{sorted_h[0]}, {sorted_h[-1]}]m"
        )

    lower, upper = sorted_h[idx - 1], sorted_h[idx]
    return {
        "exact": False,
        "lower": lower,
        "upper": upper,
        "columns": [f"windspeed_{lower}m", f"windspeed_{upper}m"],
    }


def _power_law(
    v_ref: pd.Series, h_target: int, h_ref: int, alpha: float = 1 / 7
) -> pd.Series:
    """Power Law: V(h) = V_ref * (h / h_ref) ^ alpha
    alpha default to 1/7 for neutral stability if alpha not provided."""
    return v_ref * (h_target / h_ref) ** alpha


def interpolate_windspeed_linear(
    df: pd.DataFrame, target_height: int, lower: int, upper: int
) -> pd.DataFrame:
    """
    Add windspeed_{target_height}m column via linear interpolation.
    Returns new DataFrame (does not mutate input).
    """
    result = df.copy()
    fraction = (target_height - lower) / (upper - lower)
    result[f"windspeed_{target_height}m"] = (
        result[f"windspeed_{lower}m"]
        + fraction * (result[f"windspeed_{upper}m"] - result[f"windspeed_{lower}m"])
    ).round(2)
    return result


def interpolate_windspeed_power_law_quantiles(
    df: pd.DataFrame, target_height: int, lower: int, upper: int
) -> pd.DataFrame:
    """
    Add windspeed_{target_height}m column via Neutral Power Law interpolation.

    Averages estimates from both bracketing heights because with a fixed
    exponent (1/7) the power law curve through one height won't pass exactly
    through the other. Averaging uses all available information and reduces
    directional bias.

    Returns new DataFrame (does not mutate input).
    """
    result = df.copy()

    est_from_lower = _power_law(result[f"windspeed_{lower}m"], target_height, lower)
    est_from_upper = _power_law(result[f"windspeed_{upper}m"], target_height, upper)

    result[f"windspeed_{target_height}m"] = (
        0.5 * (est_from_lower + est_from_upper)
    ).round(2)
    return result


def interpolate_windspeed_power_law_timeseries(
    df: pd.DataFrame, target_height: int, lower: int, upper: int
) -> pd.DataFrame:
    """
    Add windspeed_{target_height}m column via local power law interpolation.
    Solves the shear exponent per row from the two bracketing heights, because
    paired timeseries rows (same hour, same air column) lie on one real wind
    profile. The resulting curve passes through BOTH known heights exactly, so
    no averaging is needed, projecting from either anchor gives the same value.

    Calm-row handling: the power law is undefined when an anchor is zero (its
    log/ratio terms blow up to NaN). Such rows would otherwise emit blank CSV
    values and drop out of monthly means, biasing the series upward. So the power
    law is applied only to rows where BOTH anchors are positive; rows with a zero
    anchor fall back to linear interpolation between the two heights, which keeps
    a genuine calm hour (both anchors zero) as 0 instead of NaN.

    Returns new DataFrame (does not mutate input).
    """
    result = df.copy()
    v_lower = result[f"windspeed_{lower}m"]
    v_upper = result[f"windspeed_{upper}m"]
    positive = (v_lower > 0) & (v_upper > 0)

    alpha = np.log(v_upper.where(positive) / v_lower.where(positive)) / np.log(
        upper / lower
    )
    power = _power_law(v_lower, target_height, lower, alpha)
    linear = v_lower + (v_upper - v_lower) * (target_height - lower) / (upper - lower)
    result[f"windspeed_{target_height}m"] = np.where(positive, power, linear).round(2)

    return result


# Default interpolation method
interpolate_windspeed = interpolate_windspeed_power_law_quantiles


def aggregate(df: pd.DataFrame, height: int, period: str) -> dict:
    """Aggregate timeseries df by period. Column must exist."""
    col = f"windspeed_{height}m"

    if period == "all":
        return {"global_avg": round(float(df[col].mean()), 2)}

    elif period == "annual":
        grouped = df.groupby("year")[col].mean().round(2)
        return {
            "yearly_avg": [{"year": int(y), col: float(v)} for y, v in grouped.items()]
        }

    elif period == "monthly":
        tmp = df.copy()
        tmp["month"] = tmp["mohr"] // 100
        grouped = tmp.groupby("month")[col].mean().round(2)
        return {
            "monthly_avg": [
                {"month": int(m), col: float(v)} for m, v in grouped.items()
            ]
        }

    elif period == "hourly":
        tmp = df.copy()
        tmp["hour"] = tmp["mohr"] % 100
        grouped = tmp.groupby("hour")[col].mean().round(2)
        return {
            "hourly_avg": [{"hour": int(h), col: float(v)} for h, v in grouped.items()]
        }

    raise ValueError(f"Unsupported period: {period}")


def aggregate_quantile(
    df: pd.DataFrame, height: int, period: str, use_swi: bool = True
) -> dict:
    """Aggregate quantile-based data.

    Args:
        df: DataFrame with windspeed and probability columns.
        height: Hub height in meters.
        period: Aggregation period — "all" or "annual".
        use_swi: If True, apply SWI smoothing before mean (ERA5).
                 If False, use simple midpoint formula (Ensemble).
    """
    col = f"windspeed_{height}m"

    if period == "all":
        if "year" in df.columns:
            means = [
                _quantile_mean(g[col].values, g["probability"].values, use_swi)
                for _, g in df.groupby("year")
            ]
            return {"global_avg": round(float(np.mean(means)), 2)}
        return {
            "global_avg": round(
                _quantile_mean(df[col].values, df["probability"].values, use_swi), 2
            )
        }

    elif period == "annual":
        return {
            "yearly_avg": [
                {
                    "year": int(y),
                    col: round(
                        _quantile_mean(g[col].values, g["probability"].values, use_swi),
                        2,
                    ),
                }
                for y, g in df.groupby("year")
            ]
        }

    raise ValueError(f"Unsupported quantile period: {period}")


def _quantile_mean(quantiles: np.ndarray, probs: np.ndarray, use_swi: bool) -> float:
    """Compute mean from quantiles — SWI for ERA5, simple midpoint for Ensemble."""
    if use_swi:
        return estimate_mean_swi(quantiles, probs)
    q = np.sort(quantiles)
    n = len(q)
    return float((q.sum() - 0.5 * (q[0] + q[-1])) / (n - 1))


def estimate_mean_swi(
    quantiles: np.ndarray, probs: np.ndarray, M1: int = 1000, M2: int = 501
) -> float:
    """
    Spline-With-Inversion: fit CDF spline on quantiles, invert to get
    smooth quantile function, compute mean as average of Q(p).
    """
    q = _jitter_nonincreasing(np.asarray(quantiles, dtype=np.float64))
    p = np.asarray(probs, dtype=np.float64)

    dy_start = (p[1] - p[0]) / (q[1] - q[0])
    dy_end = (p[-1] - p[-2]) / (q[-1] - q[-2])
    spline = CubicSpline(q, p, bc_type=((1, dy_start), (1, dy_end)))

    q_smooth = np.linspace(q[0], q[-1], M1)
    p_smooth = spline(q_smooth)

    probs_new = np.linspace(0, 1, M2)
    diff = np.abs(p_smooth[:, None] - probs_new[None, :])
    q_new = q_smooth[np.argmin(diff, axis=0)]

    return float(np.mean(q_new))


def _jitter_nonincreasing(q: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    q = q.copy()
    for i in range(1, q.size):
        if q[i] <= q[i - 1]:
            q[i] = q[i - 1] + eps
    return q


def compute_sectors(n: int):
    "Return sector centre bearings (degrees CW from North), sector width in degrees, and sector edges."
    sector_width_deg = 360.0 / n
    centers = [round(i * sector_width_deg, 2) for i in range(n)]
    edges = [
        (
            round((c - 0.5 * sector_width_deg) % 360, 2),
            round((c + 0.5 * sector_width_deg) % 360, 2),
        )
        for c in centers
    ]
    return centers, sector_width_deg, edges


def resolve_timeseries_columns(
    model: str, heights: Optional[List[int]] = None, include_winddirection=False
):
    """Resolve the column subset and height_info for a timeseries request.

    Columns are the non-partition temporal columns plus the windspeed column(s)
    for each height (one if native, two bracketing heights if interpolation is
    needed). When ``include_winddirection`` is set, the winddirection column for
    each requested height is added too (native heights only). Returns
    ``(None, None)`` when ``heights`` is empty (read all columns).
    """
    if not heights:
        return None, None
    schema = MODEL_CONFIG[model]["schema"]
    temporal_cols = TEMPORAL_SCHEMAS[schema]["column_config"]["temporal_columns"]
    partition_cols = MODEL_CONFIG[model]["s3"]["partition_columns"]

    available_ws_heights = MODEL_CONFIG[model]["heights"]["windspeed"]
    available_wd_heights = MODEL_CONFIG[model]["heights"]["winddirection"]

    # add temporal col like "time" to the list of columns but not "year" if it's only as parition not a column but still a temporal field.
    cols = [col for col in temporal_cols if col not in partition_cols]
    heights_info = {}
    for height in heights:
        info = resolve_heights(height, available_ws_heights)
        heights_info[height] = info
        for col in info["columns"]:
            if col not in cols:
                cols.append(col)
        if include_winddirection and height in available_wd_heights:
            wd_col = f"winddirection_{height}m"
            if wd_col not in cols:
                cols.append(wd_col)
    return cols, heights_info


def windspeed_at_height(df: pd.DataFrame, height: int, height_info: dict) -> pd.Series:
    if height_info["exact"]:
        return df[f"windspeed_{height}m"]
    interp = interpolate_windspeed_power_law_timeseries(
        df, height, height_info["lower"], height_info["upper"]
    )
    return interp[f"windspeed_{height}m"]


def apply_timeseries_interpolation(
    df: pd.DataFrame, heights: List[int], heights_info: dict
) -> pd.DataFrame:
    result_df = df.copy()
    target_cols = {f"windspeed_{height}m" for height in heights}
    bracket_cols = set()
    for height in heights:
        info = heights_info[height]
        result_df[f"windspeed_{height}m"] = windspeed_at_height(df, height, info)
        if not info["exact"]:
            bracket_cols.update(info["columns"])
    drop = [c for c in bracket_cols - target_cols if c in result_df.columns]
    return result_df.drop(columns=drop)


def aggregate_timeseries_monthly(df, time, windspeed_cols):
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
