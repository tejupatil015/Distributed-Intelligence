
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  gsap,
  useGSAP,
  isReducedMotion,
} from "../hooks/useMediaPreferences";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "../utils/Analytics.css";

const API_URL = "http://127.0.0.1:8000/predict";

const areas = [
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
];

const categories = [
  "Biscuits & Snacks",
  "Beverages",
  "Personal Care",
  "Household Products",
  "Dairy Products",
  "Packaged Foods",
  "Home Care",
  "Baby Care",
];

type ForecastPoint = {
  date: string;
  demand: number;
};

type ForecastResponse = {
  success?: boolean;
  message?: string;
  detail?: string | { msg?: string }[];
  data?: {
    predictions?: unknown;
    total_demand?: number;
    expected_revenue?: number;
    recommended_stock?: number;
    peak_demand?: number;
  };
  predictions?: unknown;
  total_demand?: number;
  expected_revenue?: number;
  recommended_stock?: number;
};

function formatNumber(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatDate(dateString: string, index: number, startDate: string) {
  const parsed = new Date(dateString);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
  }

  const fallback = new Date(`${startDate}T12:00:00`);
  fallback.setDate(fallback.getDate() + index);

  return fallback.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function Analytics() {
  const sectionRef = useRef<HTMLElement>(null);
  const [area, setArea] = useState("Pune");
  const [category, setCategory] = useState("Biscuits & Snacks");
  const [scalingPrice, setScalingPrice] = useState("10");
  const [loadTime, setLoadTime] = useState("24");

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [forecastDays, setForecastDays] = useState("14");

  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [showForecast, setShowForecast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    demand: "-- units",
    revenue: "₹ --",
    stock: "--",
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (isReducedMotion()) {
        gsap.set(
          ".analytics-heading, .forecast-panel, .forecast-field",
          { clearProps: "all" }
        );
        return;
      }

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      intro
        .fromTo(
          ".analytics-heading > span",
          { autoAlpha: 0, x: -24 },
          { autoAlpha: 1, x: 0, duration: 0.55, ease: "power2.out" }
        )
        .fromTo(
          ".analytics-heading h2",
          { autoAlpha: 0, y: 38, clipPath: "inset(0 0 100% 0)" },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 1.05,
            ease: "power4.out",
          },
          "-=0.2"
        )
        .fromTo(
          ".analytics-heading p",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "-=0.55"
        )
        .fromTo(
          ".forecast-panel",
          { autoAlpha: 0, y: 52, scale: 0.975 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.15"
        );

      gsap.fromTo(
        ".forecast-field",
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.075,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".forecast-panel",
            start: "top 72%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const generateForecast = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setShowForecast(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          area,
          product_category: category,
          scaling_price: Number(scalingPrice),
          load_time: Number(loadTime),
          start_date: startDate,
          forecast_days: Number(forecastDays),
        }),
      });

      const result: ForecastResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || result.success === false) {
        let message = result.message || "";

        if (typeof result.detail === "string") {
          message = result.detail;
        } else if (Array.isArray(result.detail)) {
          message = result.detail
            .map((item) => item.msg || "Invalid request")
            .join(", ");
        }

        throw new Error(
          message || `API request failed with status ${response.status}`
        );
      }

      // Supports both { data: {...} } and direct API responses.
      const apiData = result.data ?? result;
      const predictions = apiData.predictions;

      if (!Array.isArray(predictions) || predictions.length === 0) {
        throw new Error(
          "No predictions returned. Check the response in FastAPI /docs."
        );
      }

      const data: ForecastPoint[] = predictions.map(
        (item: unknown, index: number) => {
          const fallbackDate = formatDate("", index, startDate);

          if (typeof item === "number") {
            return {
              date: fallbackDate,
              demand: item,
            };
          }

          if (typeof item !== "object" || item === null) {
            throw new Error("Invalid prediction item received from API.");
          }

          const prediction = item as Record<string, unknown>;

          const rawDemand =
            prediction.demand ?? prediction.predicted_demand;

          const demand = Number(rawDemand);

          if (rawDemand === undefined || !Number.isFinite(demand)) {
            throw new Error(
              "A prediction is missing a valid demand value."
            );
          }

          const date =
            typeof prediction.date === "string"
              ? formatDate(prediction.date, index, startDate)
              : fallbackDate;

          return {
            date,
            demand,
          };
        }
      );

      const calculatedDemand = data.reduce(
        (total, item) => total + item.demand,
        0
      );

      const totalDemand =
        typeof apiData.total_demand === "number"
          ? apiData.total_demand
          : calculatedDemand;

      const expectedRevenue =
        apiData.expected_revenue === undefined
          ? NaN
          : Number(apiData.expected_revenue);

      const recommendedStock =
        apiData.recommended_stock === undefined
          ? NaN
          : Number(apiData.recommended_stock);

      setForecastData(data);

      setSummary({
        demand: `${formatNumber(totalDemand)} units`,
        revenue: Number.isFinite(expectedRevenue)
          ? `₹ ${formatNumber(expectedRevenue)}`
          : "Not provided",
        stock: Number.isFinite(recommendedStock)
          ? `${formatNumber(recommendedStock)} units`
          : "Not provided",
      });

      setShowForecast(true);
    } catch (err) {
      console.error("Forecast API error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to FastAPI. Check that the backend is running on port 8000 and CORS is enabled."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate forecast."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const peakDemand =
    forecastData.length > 0
      ? Math.max(...forecastData.map((item) => item.demand))
      : 0;

  return (
    <section className="analytics-section" ref={sectionRef}>
      <div className="analytics-heading">
        <span>INTELLIGENCE / FORECASTING</span>
        <h2>Predict demand. Plan smarter.</h2>
        <p>
          Analyze sales trends and forecast future demand using
          your FastAPI prediction service.
        </p>
      </div>

      

      <div className="forecast-panel">
        <div className="forecast-form-heading">
          <span>FORECAST CONFIGURATION</span>
          <h3>Set your forecasting parameters</h3>
          <p>
            Configure your location, product category and
            prediction period.
          </p>
        </div>

        <form className="forecast-form" onSubmit={generateForecast}>
          <div className="forecast-field">
            <label htmlFor="forecast-area">Area / Location</label>
            <select
              id="forecast-area"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              required
            >
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="forecast-field">
            <label htmlFor="forecast-category">Product Category</label>
            <select
              id="forecast-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="forecast-field">
            <label htmlFor="forecast-price">Scaling Price (%)</label>
            <input
              id="forecast-price"
              type="number"
              min="-100"
              max="100"
              step="1"
              value={scalingPrice}
              onChange={(event) => setScalingPrice(event.target.value)}
              required
            />
          </div>

          <div className="forecast-field">
            <label htmlFor="forecast-load">Load Time (hours)</label>
            <input
              id="forecast-load"
              type="number"
              min="1"
              max="168"
              value={loadTime}
              onChange={(event) => setLoadTime(event.target.value)}
              required
            />
          </div>

          <div className="forecast-field">
            <label htmlFor="forecast-start">Start Date</label>
            <input
              id="forecast-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </div>

          <div className="forecast-field">
            <label htmlFor="forecast-days">Forecast Days</label>
            <select
              id="forecast-days"
              value={forecastDays}
              onChange={(event) => setForecastDays(event.target.value)}
              required
            >
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
            </select>
          </div>

          <button
            className="forecast-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Generating Forecast..." : "Generate Forecast"}
            {!loading && <span>↗</span>}
          </button>
        </form>

        {error && (
          <p role="alert" className="forecast-error">
            {error}
          </p>
        )}
      </div>

      {showForecast && (
        <div className="forecast-chart-panel">
          <div className="forecast-chart-heading">
            <div>
              <span>DEMAND ANALYTICS</span>
              <h3>Forecast Results</h3>
              <p>
                {area} · {category} · Next {forecastDays} days
              </p>
            </div>

            <div className="forecast-chart-badge">
              <span className="forecast-live-dot" />
              Forecast generated
            </div>
          </div>

          <div className="forecast-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecastData}
                margin={{
                  top: 15,
                  right: 15,
                  left: 0,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="demandGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8178cf"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="#8178cf"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e6e4ee"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#666e93", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                />

                <YAxis
                  tick={{ fill: "#666e93", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e6e4ee",
                  }}
                  formatter={(value) => [
                    `${value ?? 0} units`,
                    "Predicted demand",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="demand"
                  name="Predicted demand"
                  stroke="#8178cf"
                  strokeWidth={3}
                  fill="url(#demandGradient)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="forecast-chart-footer">
            <span>
              <span className="forecast-legend-dot" />
              Predicted demand (units)
            </span>

            <span>
              Peak demand:{" "}
              <strong>{formatNumber(peakDemand)} units</strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
