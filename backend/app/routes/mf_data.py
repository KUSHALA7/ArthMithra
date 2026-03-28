"""
Mutual Fund Data API Routes

Uses mfapi.in - Free, no API key required
"""

from fastapi import APIRouter, Query
from backend.app.services.mf_data import (
    search_mutual_funds,
    get_fund_nav,
    get_latest_nav,
    get_fund_returns,
    POPULAR_FUNDS
)

router = APIRouter()


@router.get("/search")
async def search_funds(q: str = Query(..., min_length=3, description="Search query (min 3 chars)")):
    """
    Search mutual funds by name.
    Example: /api/mf/search?q=parag parikh
    """
    results = await search_mutual_funds(q)
    return {"query": q, "count": len(results), "funds": results[:20]}  # Limit to 20 results


@router.get("/popular")
async def get_popular_funds():
    """Get list of popular mutual fund scheme codes for reference."""
    return {"funds": POPULAR_FUNDS}


@router.get("/{scheme_code}")
async def get_fund_data(scheme_code: str):
    """
    Get NAV history for a mutual fund scheme.
    Example: /api/mf/122639 (Parag Parikh Flexi Cap)
    """
    data = await get_fund_nav(scheme_code)
    if not data:
        return {"error": "Fund not found", "scheme_code": scheme_code}
    return data


@router.get("/{scheme_code}/latest")
async def get_fund_latest_nav(scheme_code: str):
    """
    Get only the latest NAV for a fund.
    Example: /api/mf/122639/latest
    """
    data = await get_latest_nav(scheme_code)
    if not data:
        return {"error": "Fund not found", "scheme_code": scheme_code}
    return data


@router.get("/{scheme_code}/returns")
async def get_fund_returns_data(scheme_code: str):
    """
    Get calculated returns (1M, 3M, 6M, 1Y, 3Y, 5Y) for a fund.
    Example: /api/mf/122639/returns
    """
    data = await get_fund_returns(scheme_code)
    if not data:
        return {"error": "Fund not found or insufficient data", "scheme_code": scheme_code}
    return data
