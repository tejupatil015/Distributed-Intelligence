
from datetime import date, timedelta
import math

from pydantic import BaseModel, Field


AREAS = [
    "Pune",
    "Kolhapur",
    "Nashik",
    "Mumbai",
    "Sangli",
    "Satara",
    "Solapur",
    "Nagpur",
    "Thane",
    "Chhatrapati Sambhajinagar",
]

CATEGORIES = [
    "Biscuits & Snacks",
    "Beverages",
    "Personal Care",
    "Household Products",
    "Dairy Products",
    "Packaged Foods",
    "Home Care",
    "Baby Care",
]


class ForecastRequest(BaseModel):
    area: str
    product_category: str
    scaling_price: float = Field(default=10, ge=-100, le=100)
    load_time: int = Field(default=24, ge=1, le=168)
    start_date: date
    forecast_days: int = Field(default=14, ge=1, le=60)


def predict_demand(request: ForecastRequest):
    if request.area not in AREAS:
        raise ValueError(
            f"Unsupported area. Choose from: {', '.join(AREAS)}"
        )

    if request.product_category not in CATEGORIES:
        raise ValueError(
            f"Unsupported category. Choose from: {', '.join(CATEGORIES)}"
        )

    # Demo baseline only; replace with a trained forecasting model
    area_factor = 1 + AREAS.index(request.area) * 0.08
    category_factor = 1 + CATEGORIES.index(request.product_category) * 0.06

    base_demand = 100 * area_factor * category_factor

    # Assumption: higher scaling_price means a higher percentage price increase
    price_effect = max(
        0.1,
        1 - (request.scaling_price / 100) * 0.35
    )

    # Longer supply/load time requires more safety stock
    load_time_factor = 1 + (request.load_time / 168) * 0.10

    predictions = []

    for index in range(request.forecast_days):
        forecast_date = request.start_date + timedelta(days=index)
        day = index + 1

        weekly_pattern = math.sin(day * math.pi / 7) * 0.12
        trend = day * 0.015
        variation = math.cos(day * 1.6) * 0.04

        demand = max(
            0,
            round(
                base_demand
                * price_effect
                * (1 + weekly_pattern + trend + variation)
            ),
        )

        predictions.append({
            "date": forecast_date.isoformat(),
            "demand": demand,
        })

    total_demand = sum(item["demand"] for item in predictions)
    peak_demand = max(
        (item["demand"] for item in predictions),
        default=0,
    )

    # Demo assumption; replace with actual product price from your database
    average_unit_price = 100

    recommended_stock = math.ceil(
        total_demand * load_time_factor * 1.10
    )

    return {
        "area": request.area,
        "product_category": request.product_category,
        "start_date": request.start_date.isoformat(),
        "forecast_days": request.forecast_days,
        "predictions": predictions,
        "total_demand": total_demand,
        "expected_revenue": total_demand * average_unit_price,
        "recommended_stock": recommended_stock,
        "peak_demand": peak_demand,
        "model_type": "baseline_demo",
    }
