"""
Stock Market Data API Routes

Uses Yahoo Finance - Free, no API key required
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from backend.app.services.stock_data import (
    get_stock_price,
    get_stock_history,
    get_multiple_stocks,
    get_index_data,
    get_gold_price,
    POPULAR_STOCKS
)

router = APIRouter()


class MultipleStocksRequest(BaseModel):
    symbols: list[str]


@router.get("/indices")
def get_market_indices():
    """
    Get major Indian market indices (Nifty 50, Sensex, Bank Nifty, etc.)
    """
    return get_index_data()


@router.get("/gold")
def get_gold():
    """
    Get current gold price in USD and approximate INR.
    """
    data = get_gold_price()
    if not data:
        return {"error": "Unable to fetch gold price"}
    return data


@router.get("/popular")
def get_popular_stocks_list():
    """Get list of popular Indian stock symbols for reference."""
    return {"stocks": POPULAR_STOCKS}


@router.get("/{symbol}")
def get_stock(symbol: str):
    """
    Get current stock price and info.

    Examples:
    - /api/stocks/RELIANCE.NS (Reliance on NSE)
    - /api/stocks/TCS.NS (TCS on NSE)
    - /api/stocks/AAPL (Apple on US markets)
    """
    return get_stock_price(symbol.upper())


@router.get("/{symbol}/history")
def get_stock_hist(
    symbol: str,
    period: str = Query("1mo", description="1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max")
):
    """
    Get historical stock prices.
    Example: /api/stocks/RELIANCE.NS/history?period=1y
    """
    return get_stock_history(symbol.upper(), period)


@router.post("/multiple")
def get_stocks_multiple(request: MultipleStocksRequest):
    """
    Get prices for multiple stocks at once.
    Body: {"symbols": ["RELIANCE.NS", "TCS.NS", "INFY.NS"]}
    """
    return {"stocks": get_multiple_stocks(request.symbols)}
