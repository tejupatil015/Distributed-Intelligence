import "../utils/Analytics.css";

export function Analytics() {
  return (
    <section className="analytics-section">
      <div className="analytics-heading">
        <span>INTELLIGENCE / FORECASTING</span>
        <h2>Predict demand. Plan smarter.</h2>
        <p>
          Analyze sales trends and forecast future demand using
          your FastAPI prediction service.
        </p>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card">
          <span>Forecasted Demand</span>
          <h3 id="forecast-demand">-- units</h3>
          <p>Predicted for the next period</p>
        </article>

        <article className="analytics-card">
          <span>Expected Revenue</span>
          <h3 id="forecast-revenue">₹ --</h3>
          <p>Estimated revenue</p>
        </article>

        <article className="analytics-card">
          <span>Stock Recommendation</span>
          <h3 id="forecast-stock">Loading</h3>
          <p>Based on predicted demand</p>
        </article>
      </div>

      <div className="forecast-panel">
        <h3>Forecast Results</h3>
        <p>
          FastAPI prediction results will appear here after
          connecting the backend.
        </p>
        <button
          onClick={() => alert("Connect this button to your FastAPI endpoint.")}
        >
          Run Forecast
        </button>
      </div>
    </section>
  );
}