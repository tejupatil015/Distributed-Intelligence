
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from forecasting import ForecastRequest, predict_demand, AREAS, CATEGORIES


# --------------------------------------------------
# Create FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Distributed Intelligence API",
    description="Demand forecasting API for the Distributed Intelligence dashboard",
    version="1.0.0",
)


# --------------------------------------------------
# CORS configuration for React frontend
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Home route
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Distributed Intelligence API is running",
    }


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
    }


# --------------------------------------------------
# Forecast dropdown options
# --------------------------------------------------

@app.get("/forecast-options")
def forecast_options():
    return {
        "success": True,
        "areas": AREAS,
        "categories": CATEGORIES,
    }


# --------------------------------------------------
# Demand prediction
# --------------------------------------------------

@app.post("/predict")
def forecast_endpoint(request: ForecastRequest):
    try:
        result = predict_demand(request)

        return {
            "success": True,
            "data": result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while generating the forecast.",
        ) from exc
