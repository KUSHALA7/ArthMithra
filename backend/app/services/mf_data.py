"""
Mutual Fund Data Service - Uses mfapi.in (Free, No API Key Required)

API Documentation: https://www.mfapi.in/

Endpoints:
- GET /mf - List all mutual funds
- GET /mf/{scheme_code} - Get NAV history for a fund
- GET /mf/{scheme_code}/latest - Get latest NAV
"""

import httpx
from typing import Optional

MF_API_BASE = "https://api.mfapi.in"

async def search_mutual_funds(query: str) -> list[dict]:
    """Search mutual funds by name. Returns list of matching funds."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{MF_API_BASE}/mf/search?q={query}")
        if response.status_code == 200:
            return response.json()
        return []

async def get_all_funds() -> list[dict]:
    """Get list of all mutual fund schemes (warning: large response)."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{MF_API_BASE}/mf")
        if response.status_code == 200:
            return response.json()
        return []

async def get_fund_nav(scheme_code: str) -> Optional[dict]:
    """
    Get NAV data for a specific mutual fund scheme.
    Returns: {
        "meta": {"fund_house": "...", "scheme_name": "...", ...},
        "data": [{"date": "DD-MM-YYYY", "nav": "123.45"}, ...]
    }
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{MF_API_BASE}/mf/{scheme_code}")
        if response.status_code == 200:
            return response.json()
        return None

async def get_latest_nav(scheme_code: str) -> Optional[dict]:
    """Get only the latest NAV for a fund."""
    data = await get_fund_nav(scheme_code)
    if data and data.get("data"):
        return {
            "meta": data.get("meta"),
            "latest": data["data"][0]  # First entry is latest
        }
    return None

async def get_fund_returns(scheme_code: str) -> Optional[dict]:
    """Calculate returns for 1M, 3M, 6M, 1Y, 3Y, 5Y periods."""
    data = await get_fund_nav(scheme_code)
    if not data or not data.get("data"):
        return None

    nav_data = data["data"]
    latest_nav = float(nav_data[0]["nav"])

    # Calculate returns for different periods
    returns = {"scheme_code": scheme_code, "meta": data.get("meta"), "latest_nav": latest_nav}

    periods = {
        "1M": 22,    # ~22 trading days in a month
        "3M": 66,
        "6M": 132,
        "1Y": 252,
        "3Y": 756,
        "5Y": 1260
    }

    for period_name, days in periods.items():
        if len(nav_data) > days:
            old_nav = float(nav_data[days]["nav"])
            if period_name in ["3Y", "5Y"]:
                # Annualized return for > 1Y periods
                years = days / 252
                returns[period_name] = round(((latest_nav / old_nav) ** (1/years) - 1) * 100, 2)
            else:
                # Absolute return for <= 1Y
                returns[period_name] = round((latest_nav - old_nav) / old_nav * 100, 2)
        else:
            returns[period_name] = None

    return returns


# Popular Indian Mutual Fund Scheme Codes for quick reference
POPULAR_FUNDS = {
    "parag_parikh_flexi": "122639",
    "mirae_emerging_bluechip": "118989",
    "axis_bluechip": "120503",
    "hdfc_flexi_cap": "100127",
    "sbi_small_cap": "130158",
    "kotak_emerging_equity": "120188",
    "icici_value_discovery": "100670",
    "nippon_small_cap": "113177",
    "motilal_oswal_midcap": "119597",
    "quant_small_cap": "120823"
}
