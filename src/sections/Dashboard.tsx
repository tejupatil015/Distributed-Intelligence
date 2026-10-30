import { useEffect, useRef, useState } from "react";
import {
  gsap,
  useGSAP,
  isReducedMotion,
} from "../hooks/useMediaPreferences";
import "../utils/Dashboard.css";

const API = "http://127.0.0.1:5000";

type DashboardData = {
  total_locations: number;
  total_products: number;
  total_distributed_stock: number;
  pending_transfers: number;
  completed_transfers: number;
};

type InventoryAnalytics = {
  totalInventory: number;
  blockInventory: number | null;
  manufacturingInventory: number | null;
};

type LocationStock = {
  location_id: string | number;
  location_name: string;
  total_stock: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const formatNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-IN");

export default function DistributionDashboard() {
  const dashboardRef = useRef<HTMLElement>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [locations, setLocations] = useState<LocationStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const [dashboardResponse, analyticsResponse, locationResponse] =
        await Promise.all([
          fetch(`${API}/api/dashboard`),
          fetch(`${API}/api/inventory-analytics`),
          fetch(`${API}/api/location-stock`),
        ]);

      if (
        !dashboardResponse.ok ||
        !analyticsResponse.ok ||
        !locationResponse.ok
      ) {
        throw new Error("Unable to load dashboard data from the backend.");
      }

      const [dashboardResult, analyticsResult, locationResult] =
        await Promise.all([
          dashboardResponse.json() as Promise<ApiResponse<DashboardData>>,
          analyticsResponse.json() as Promise<ApiResponse<InventoryAnalytics>>,
          locationResponse.json() as Promise<ApiResponse<LocationStock[]>>,
        ]);

      if (
        !dashboardResult.success ||
        !analyticsResult.success ||
        !locationResult.success
      ) {
        throw new Error("The backend returned an unsuccessful response.");
      }

      setDashboard(dashboardResult.data);
      setAnalytics(analyticsResult.data);
      setLocations(locationResult.data);
    } catch (err) {
      setError(
        `${err instanceof Error ? err.message : "Unexpected dashboard error."} Check that the backend and MySQL are running.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      if (loading || isReducedMotion()) return;

      const entrance = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      entrance
        .fromTo(
          ".di-topbar",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.75 }
        )
        .fromTo(
          ".di-section-heading",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          "-=0.38"
        )
        .fromTo(
          ".di-kpi-card",
          { autoAlpha: 0, y: 28, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.09,
          },
          "-=0.2"
        )
        .fromTo(
          [".di-content-grid .di-panel", ".di-transfer-panel"],
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
          "-=0.18"
        );
    },
    { scope: dashboardRef, dependencies: [loading], revertOnUpdate: true }
  );

  const cards = dashboard
    ? [
        {
          label: "Total Locations",
          value: dashboard.total_locations,
          icon: "⌖",
          color: "violet",
        },
        {
          label: "Total Products",
          value: dashboard.total_products,
          icon: "▦",
          color: "blue",
        },
        {
          label: "Distributed Stock",
          value: dashboard.total_distributed_stock,
          icon: "▤",
          color: "teal",
        },
        {
          label: "Pending Transfers",
          value: dashboard.pending_transfers,
          icon: "↗",
          color: "orange",
        },
        {
          label: "Completed Transfers",
          value: dashboard.completed_transfers,
          icon: "✓",
          color: "green",
        },
      ]
    : [];

  const maxStock = Math.max(
    1,
    ...locations.map((location) => Number(location.total_stock))
  );

  if (loading) {
    return (
      <div className="di-loading">
        <div className="di-spinner" />
        <p>Connecting to your distribution network...</p>
      </div>
    );
  }

  return (
    <main className="di-dashboard" ref={dashboardRef}>
      <aside className="di-sidebar">
        <a className="di-brand" href="#overview">
          <span className="di-brand-icon">D</span>
          <span>
            Distribution<span className="di-brand-light">IQ</span>
          </span>
        </a>

        <p className="di-nav-label">WORKSPACE</p>

        <a className="di-nav-item di-nav-active" href="#overview">
          <span>▦</span> Overview
        </a>
        <a className="di-nav-item" href="#inventory">
          <span>▤</span> Inventory
        </a>
        <a className="di-nav-item" href="#locations">
          <span>⌖</span> Locations
        </a>
        <a className="di-nav-item" href="#transfers">
          <span>⇄</span> Transfers
        </a>

        <div className="di-sidebar-bottom">
          <div className="di-status-dot" />
          <div>
            <strong>System status</strong>
            <span>Live dashboard</span>
          </div>
        </div>
      </aside>

      <section className="di-main" id="overview">
        <header className="di-topbar">
          <div>
            <span className="di-breadcrumb">Workspace / Overview</span>
            <h1>Distribution Intelligence</h1>
            <p>Monitor your stock, locations and distribution activity.</p>
          </div>

          <button className="di-refresh" onClick={loadDashboard}>
            ↻ <span>Refresh data</span>
          </button>
        </header>

        {error && (
          <div className="di-error">
            <strong>Connection issue</strong>
            <p>{error}</p>
            <button onClick={loadDashboard}>Try again</button>
          </div>
        )}

        <div className="di-section-heading">
          <div>
            <h2>Network overview</h2>
            <p>Your current distribution snapshot</p>
          </div>
          <span className="di-live"><span /> LIVE DATA</span>
        </div>

        <section className="di-kpi-grid">
          {cards.map((card) => (
            <article
              className="di-kpi-card"
              key={card.label}
            >
              <div className={`di-kpi-icon ${card.color}`}>
                {card.icon}
              </div>
              <p>{card.label}</p>
              <strong>{formatNumber(card.value)}</strong>
              <span className="di-kpi-caption">From your database</span>
            </article>
          ))}
        </section>

        <section className="di-content-grid" id="inventory">
          <article className="di-panel di-inventory-panel">
            <div className="di-panel-header">
              <div>
                <h2>Inventory analytics</h2>
                <p>Stock quantities across your network</p>
              </div>
              <span className="di-panel-icon">▥</span>
            </div>

            <div className="di-total-inventory">
              <div>
                <span>Total inventory</span>
                <strong>
                  {formatNumber(analytics?.totalInventory)}
                </strong>
                <small>Units recorded in location inventory</small>
              </div>
              <div className="di-inventory-symbol">▤</div>
            </div>

            <div className="di-category-list">
              <div className="di-category-row">
                <div className="di-category-title">
                  <span className="di-legend-dot total" />
                  <span>Total Inventory</span>
                </div>
                <strong>{formatNumber(analytics?.totalInventory)}</strong>
              </div>

              <div className="di-category-track">
                <div
                  className="di-category-fill total-fill"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="di-category-row">
                <div className="di-category-title">
                  <span className="di-legend-dot block" />
                  <span>Block Inventory</span>
                </div>
                <strong>
                  {analytics?.blockInventory == null
                    ? "Not configured"
                    : formatNumber(analytics.blockInventory)}
                </strong>
              </div>

              <div className="di-category-track">
                <div
                  className="di-category-fill block-fill"
                  style={{
                    width:
                      analytics?.blockInventory == null
                        ? "0%"
                        : `${
                            Math.min(
                              100,
                              (analytics.blockInventory /
                                Math.max(1, analytics.totalInventory)) *
                                100
                            )
                          }%`,
                  }}
                />
              </div>

              <div className="di-category-row">
                <div className="di-category-title">
                  <span className="di-legend-dot manufacturing" />
                  <span>Inventory in Manufacturing</span>
                </div>
                <strong>
                  {analytics?.manufacturingInventory == null
                    ? "Not configured"
                    : formatNumber(analytics.manufacturingInventory)}
                </strong>
              </div>

              <div className="di-category-track">
                <div
                  className="di-category-fill manufacturing-fill"
                  style={{
                    width:
                      analytics?.manufacturingInventory == null
                        ? "0%"
                        : `${
                            Math.min(
                              100,
                              (analytics.manufacturingInventory /
                                Math.max(1, analytics.totalInventory)) *
                                100
                            )
                          }%`,
                  }}
                />
              </div>
            </div>

            {(analytics?.blockInventory == null ||
              analytics?.manufacturingInventory == null) && (
              <p className="di-note">
                Block and manufacturing values will appear when their
                categories are mapped to your database.
              </p>
            )}
          </article>

          <article className="di-panel" id="locations">
            <div className="di-panel-header">
              <div>
                <h2>Location-wise stock</h2>
                <p>Inventory distribution by city</p>
              </div>
              <span className="di-panel-icon">⌖</span>
            </div>

            {locations.length === 0 ? (
              <div className="di-empty">No location stock found.</div>
            ) : (
              <div className="di-location-list">
                {locations.map((location, index) => (
                  <div className="di-location-item" key={location.location_id}>
                    <div className="di-location-meta">
                      <div className="di-location-name">
                        <span className={`di-location-number number-${index % 4}`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{location.location_name}</span>
                      </div>
                      <strong>{formatNumber(location.total_stock)}</strong>
                    </div>
                    <div className="di-location-track">
                      <div
                        className={`di-location-fill fill-${index % 4}`}
                        style={{
                          width: `${
                            (Number(location.total_stock) / maxStock) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="di-location-footer">
              <span>Locations connected</span>
              <strong>{locations.length}</strong>
            </div>
          </article>
        </section>

        <section className="di-panel di-transfer-panel" id="transfers">
          <div className="di-panel-header">
            <div>
              <h2>Transfer activity</h2>
              <p>Current status of stock movements</p>
            </div>
            <span className="di-panel-icon">⇄</span>
          </div>

          <div className="di-transfer-grid">
            <div className="di-transfer-item">
              <span className="di-transfer-icon pending-icon">◷</span>
              <div>
                <span>Pending transfers</span>
                <strong>{formatNumber(dashboard?.pending_transfers)}</strong>
              </div>
            </div>
            <div className="di-transfer-item">
              <span className="di-transfer-icon completed-icon">✓</span>
              <div>
                <span>Completed transfers</span>
                <strong>{formatNumber(dashboard?.completed_transfers)}</strong>
              </div>
            </div>
          </div>
        </section>

        <footer className="di-footer">
          <span>DistributionIQ · Inventory intelligence</span>
          <span>Data refreshes every 30 seconds</span>
        </footer>
      </section>
    </main>
  );
}