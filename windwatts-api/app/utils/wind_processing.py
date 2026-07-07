import bisect
import calendar
import numpy as np
import pandas as pd
from scipy.interpolate import CubicSpline


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


def interpolate_windspeed(
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
                {"month": calendar.month_abbr[int(m)], col: float(v)}
                for m, v in grouped.items()
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
