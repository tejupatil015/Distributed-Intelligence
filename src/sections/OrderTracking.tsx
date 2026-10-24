
import { useState } from "react";

import "../utils/OrderTracking.css";


type OrderStatus =
  | "Order Placed"
  | "Confirmed"
  | "Processing"
  | "Dispatched"
  | "Delivered";

type RetailOrder = {
  retailerName: string;
  businessName: string;
  address: string;
  gst: string;
  contact: string;
  requirement: string;
  quantity: number;
  orderId: string;
  total: number;
  paid: number;
  expectedDelivery: string;
  status: OrderStatus;
  notes: string;
};

const steps: OrderStatus[] = [
  "Order Placed",
  "Confirmed",
  "Processing",
  "Dispatched",
  "Delivered",
];

const initialOrder: RetailOrder = {
  retailerName: "Rahul Patil",
  businessName: "Shree Ganesh Retail Store",
  address: "Market Road, Kolhapur, Maharashtra",
  gst: "27ABCDE1234F1Z5",
  contact: "9876543210",
  requirement: "Rice bags, cooking oil, sugar and pulses",
  quantity: 120,
  orderId: "DI-2026-001",
  total: 85000,
  paid: 50000,
  expectedDelivery: "28 Oct 2026",
  status: "Dispatched",
  notes: "Deliver during business hours. Call before arrival.",
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function OrderTracking() {
  const [order, setOrder] = useState<RetailOrder>(initialOrder);
  const [showForm, setShowForm] = useState(false);
  const [trackingId, setTrackingId] = useState(initialOrder.orderId);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    retailerName: "",
    businessName: "",
    address: "",
    gst: "",
    contact: "",
    requirement: "",
    quantity: "1",
    total: "",
    paid: "",
    notes: "",
  });

  const due = Math.max(0, order.total - order.paid);
  const progress = (steps.indexOf(order.status) / (steps.length - 1)) * 100;

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const submitOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const total = Number(form.total);
    const paid = Number(form.paid || 0);
    const quantity = Number(form.quantity);

    if (paid > total) {
      setMessage("Paid amount cannot exceed the total order amount.");
      return;
    }

    if (!/^\d{10}$/.test(form.contact)) {
      setMessage("Enter a valid 10-digit contact number.");
      return;
    }

    if (form.gst && !/^[0-9A-Z]{15}$/i.test(form.gst)) {
      setMessage("GST number must contain 15 characters.");
      return;
    }

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      !Number.isFinite(quantity) ||
      total <= 0 ||
      quantity <= 0 ||
      paid < 0
    ) {
      setMessage("Enter valid order amount, paid amount and quantity.");
      return;
    }

    const newId = `DI-${Date.now().toString().slice(-8)}`;

    setOrder({
      ...form,
      quantity,
      total,
      paid,
      orderId: newId,
      status: "Order Placed",
      expectedDelivery: "Awaiting confirmation",
    });

    setTrackingId(newId);
    setMessage("New order added to this demo.");
    setShowForm(false);
  };

  const trackOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (trackingId.trim().toUpperCase() === order.orderId.toUpperCase()) {
      setMessage(`Order ${order.orderId} found.`);
    } else {
      setMessage("Order not found in this demo. Try the displayed Order ID.");
    }
  };

  return (
    <section className="ot-section" id="order-tracking">
      <div className="ot-container">
        <div className="ot-heading">
          <div>
            <span className="ot-eyebrow">
              <span className="ot-live-dot" />
              DISTRIBUTED INTELLIGENCE / OPERATIONS
            </span>

            <h2>
              Retail Order
              <br />
              <span>Intelligence.</span>
            </h2>

            <p>
              Every retailer, every payment, every delivery — connected in
              one intelligent tracking space.
            </p>
          </div>

          <button
            className="ot-primary-btn"
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
          >
            {showForm ? "Close Form" : "+ Create New Order"}
          </button>
        </div>

        <div className="ot-overview">
          <div className="ot-overview-card">
            <span className="ot-card-icon">↗</span>
            <p>Current Order Value</p>
            <h3>{money(order.total)}</h3>
            <span className="ot-card-foot">Selected retailer</span>
          </div>

          <div className="ot-overview-card">
            <span className="ot-card-icon">₹</span>
            <p>Payment Received</p>
            <h3>{money(order.paid)}</h3>
            <span className="ot-card-foot ot-positive">Amount paid</span>
          </div>

          <div className="ot-overview-card ot-due-card">
            <span className="ot-card-icon">!</span>
            <p>Outstanding Payment</p>
            <h3>{money(due)}</h3>
            <span className="ot-card-foot ot-warning">
              {due > 0 ? "Payment pending" : "Fully paid"}
            </span>
          </div>

          <div className="ot-overview-card">
            <span className="ot-card-icon">▦</span>
            <p>Items / Units</p>
            <h3>{order.quantity}</h3>
            <span className="ot-card-foot">Requested quantity</span>
          </div>
        </div>

        {showForm && (
          <form className="ot-form" onSubmit={submitOrder}>
            <div className="ot-form-heading">
              <div>
                <span className="ot-eyebrow">RETAILER ONBOARDING</span>
                <h3>Create a retail order</h3>
              </div>
              <span className="ot-form-badge">NEW ENTRY</span>
            </div>

            <div className="ot-form-grid">
              <label>
                Retailer / Owner Name *
                <input
                  required
                  value={form.retailerName}
                  onChange={(e) => updateForm("retailerName", e.target.value)}
                  placeholder="Enter retailer name"
                />
              </label>

              <label>
                Business Name *
                <input
                  required
                  value={form.businessName}
                  onChange={(e) => updateForm("businessName", e.target.value)}
                  placeholder="Retail shop name"
                />
              </label>

              <label className="ot-full">
                Business Address *
                <input
                  required
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="Street, city, state and PIN code"
                />
              </label>

              <label>
                GST Number
                <input
                  value={form.gst}
                  onChange={(e) =>
                    updateForm("gst", e.target.value.toUpperCase())
                  }
                  maxLength={15}
                  placeholder="15-character GSTIN"
                />
              </label>

              <label>
                Contact Number *
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={form.contact}
                  onChange={(e) =>
                    updateForm("contact", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit mobile number"
                />
              </label>

              <label className="ot-full">
                Product / Stock Requirement *
                <textarea
                  required
                  value={form.requirement}
                  onChange={(e) => updateForm("requirement", e.target.value)}
                  placeholder="Products, sizes, brands or stock requirements..."
                  rows={3}
                />
              </label>

              <label>
                Quantity / Units *
                <input
                  required
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => updateForm("quantity", e.target.value)}
                />
              </label>

              <label>
                Total Order Amount (₹) *
                <input
                  required
                  type="number"
                  min="1"
                  value={form.total}
                  onChange={(e) => updateForm("total", e.target.value)}
                  placeholder="e.g. 25000"
                />
              </label>

              <label>
                Amount Paid (₹)
                <input
                  type="number"
                  min="0"
                  value={form.paid}
                  onChange={(e) => updateForm("paid", e.target.value)}
                  placeholder="e.g. 10000"
                />
              </label>

              <label className="ot-full">
                Delivery / Order Notes
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Delivery instructions, special requirements..."
                  rows={2}
                />
              </label>
            </div>

            <button className="ot-primary-btn" type="submit">
              Save Demo Order →
            </button>

            <p className="ot-form-note">
              Demo only: this entry is stored in the current page state, not a
              database.
            </p>
          </form>
        )}

        <div className="ot-main-grid">
          <div className="ot-panel ot-business-panel">
            <div className="ot-panel-heading">
              <div>
                <span className="ot-eyebrow">RETAILER PROFILE</span>
                <h3>Business Information</h3>
              </div>
              <span className="ot-verified">● DEMO</span>
            </div>

            <div className="ot-business-identity">
              <div className="ot-avatar">
                {order.businessName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h4>{order.businessName}</h4>
                <p>{order.retailerName}</p>
              </div>
            </div>

            <div className="ot-info-list">
              <div className="ot-info-row">
                <span>Business Address</span>
                <strong>{order.address}</strong>
              </div>

              <div className="ot-info-row">
                <span>GST Registration</span>
                <strong>{order.gst || "Not provided"}</strong>
              </div>

              <div className="ot-info-row">
                <span>Contact Number</span>
                <strong>{order.contact}</strong>
              </div>

              <div className="ot-info-row">
                <span>Order Reference</span>
                <strong>{order.orderId}</strong>
              </div>
            </div>

            <div className="ot-requirement">
              <span>PRODUCT / STOCK REQUIREMENT</span>
              <p>{order.requirement}</p>
              <div className="ot-quantity">
                <span>Requested quantity</span>
                <strong>{order.quantity} units</strong>
              </div>
            </div>

            <div className="ot-notes">
              <span>DELIVERY NOTES</span>
              <p>{order.notes || "No additional instructions."}</p>
            </div>
          </div>

          <div className="ot-panel ot-tracking-panel">
            <div className="ot-panel-heading">
              <div>
                <span className="ot-eyebrow">ORDER LIFECYCLE</span>
                <h3>Live Order Tracking</h3>
              </div>
              <span className="ot-live-badge">
                <span className="ot-live-dot" />
                DEMO STATUS
              </span>
            </div>

            <div className="ot-tracking-id">
              <div>
                <span>TRACKING ID</span>
                <h4>{order.orderId}</h4>
              </div>
              <div className="ot-truck">↗</div>
            </div>

            <div className="ot-progress-header">
              <span>Delivery progress</span>
              <strong>{Math.round(progress)}%</strong>
            </div>

            <div
              className="ot-progress-track"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="ot-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="ot-timeline">
              {steps.map((step, index) => {
                const active = index <= steps.indexOf(order.status);
                const current = step === order.status;

                return (
                  <div
                    className={`ot-timeline-step ${active ? "is-complete" : ""} ${
                      current ? "is-current" : ""
                    }`}
                    key={step}
                  >
                    <div className="ot-step-rail">
                      <div className="ot-step-dot">
                        {active ? "✓" : String(index + 1).padStart(2, "0")}
                      </div>
                      {index !== steps.length - 1 && (
                        <div className="ot-step-line">
                          <span
                            style={{
                              height:
                                index < steps.indexOf(order.status)
                                  ? "100%"
                                  : "0%",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="ot-step-content">
                      <h4>{step}</h4>
                      <p>
                        {step === "Order Placed" &&
                          "Retailer requirement received"}
                        {step === "Confirmed" &&
                          "Order details confirmed"}
                        {step === "Processing" &&
                          "Stock preparation and packing"}
                        {step === "Dispatched" &&
                          "Shipment handed over for delivery"}
                        {step === "Delivered" &&
                          "Order delivered to the retailer"}
                      </p>
                    </div>

                    {current && (
                      <span className="ot-current-label">CURRENT</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="ot-delivery-box">
              <span className="ot-delivery-icon">⌁</span>
              <div>
                <span>EXPECTED DELIVERY</span>
                <h4>{order.expectedDelivery}</h4>
              </div>
            </div>

            <div className="ot-status-demo">
              <label htmlFor="ot-status">Update demo order status</label>
              <select
                id="ot-status"
                value={order.status}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    status: e.target.value as OrderStatus,
                  })
                }
              >
                {steps.map((step) => (
                  <option value={step} key={step}>
                    {step}
                  </option>
                ))}
              </select>
              <p>
                Changing this selection animates the timeline. It does not
                update a real shipment.
              </p>
            </div>
          </div>
        </div>

        <div className="ot-bottom-grid">
          <div className="ot-panel ot-payment-panel">
            <div className="ot-panel-heading">
              <div>
                <span className="ot-eyebrow">FINANCIAL OVERVIEW</span>
                <h3>Payment & Outstanding</h3>
              </div>
              <span className={due > 0 ? "ot-payment-status" : "ot-verified"}>
                {due > 0 ? "PAYMENT DUE" : "PAID"}
              </span>
            </div>

            <div className="ot-payment-numbers">
              <div>
                <span>Total Amount</span>
                <h3>{money(order.total)}</h3>
              </div>
              <div>
                <span>Paid Amount</span>
                <h3>{money(order.paid)}</h3>
              </div>
            </div>

            <div className="ot-payment-due">
              <span>Outstanding Balance</span>
              <h2>{money(due)}</h2>
              <p>
                {due > 0
                  ? "Balance remaining for this order"
                  : "No outstanding payment"}
              </p>
            </div>

            <div className="ot-payment-bar">
              <span
                style={{
                  width: `${
                    order.total > 0
                      ? Math.min(100, (order.paid / order.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="ot-payment-legend">
              <span>
                <i className="ot-paid-dot" /> Paid
              </span>
              <strong>
                {order.total > 0
                  ? Math.round((order.paid / order.total) * 100)
                  : 0}
                % received
              </strong>
            </div>
          </div>

          <div className="ot-panel ot-search-panel">
            <span className="ot-eyebrow">QUICK LOOKUP</span>
            <h3>Find an Order</h3>
            <p>
              Search the order reference available in this demo.
            </p>

            <form onSubmit={trackOrder} className="ot-search-form">
              <label htmlFor="ot-search">Order / Tracking ID</label>
              <input
                id="ot-search"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. DI-2026-001"
              />
              <button className="ot-primary-btn" type="submit">
                Find Order →
              </button>
            </form>

            <div className="ot-search-hint">
              <span>i</span>
              <p>
                This demo searches the single order currently displayed.
                Connect a backend to look up multiple retailers and orders.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="ot-message" role="status">
            {message}
          </div>
        )}

        <div className="ot-footer-note">
          <span className="ot-live-dot" />
          <p>
            DISTRIBUTED INTELLIGENCE <span>•</span> RETAIL OPERATIONS
          </p>
          <span>FRONTEND DEMO</span>
        </div>
      </div>
    </section>
  );
}
