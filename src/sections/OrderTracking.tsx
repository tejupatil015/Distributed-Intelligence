import { useCallback, useEffect, useMemo, useState } from "react";
import "../utils/OrderTracking.css";

const ORDER_WEBHOOK_URL =
  "https://dheeraj-11.app.n8n.cloud/webhook/fmcg-order";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqbbS4F4muN87mveSo2r3069O-dz-Kfzf_9KTat7w1sA2z148aTjmcQLOYp4ALPyGfnnkZpo0JxGE6/pub?output=csv";

const LOCAL_STORAGE_KEY = "di_order_history";

type Product = {
  id: string;
  name: string;
  price: number;
};

type OrderForm = {
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
};

type OrderRecord = {
  order_id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
  product_name: string;
  product_id: string;
  quantity: number;
  grand_total: number;
  date: string;
  status: string;
  source?: string;
  [key: string]: string | number | undefined;
};

/*
  Replace the product names/prices below with your actual product catalogue.
  Keep the IDs consistent with the products used in your n8n workflow.
*/
const PRODUCTS: Product[] = [
  { id: "P001", name: "Product P001", price: 10 },
  { id: "P002", name: "Product P002", price: 60 },
];

const EMPTY_FORM: OrderForm = {
  customer_name: "",
  customer_email: "",
  phone: "",
  address: "",
};

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;

      row.push(cell.trim());

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  return rows;
}

function csvToObjects(csv: string): Record<string, string>[] {
  const rows = parseCSV(csv);

  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());

  return rows.slice(1).map((values) => {
    const object: Record<string, string> = {};

    headers.forEach((header, index) => {
      object[header] = values[index] ?? "";
    });

    return object;
  });
}

function readField(
  row: Record<string, string>,
  candidates: string[]
): string {
  const normalizedCandidates = candidates.map(normalizeKey);

  const matchingKey = Object.keys(row).find((key) =>
    normalizedCandidates.includes(normalizeKey(key))
  );

  return matchingKey ? String(row[matchingKey] ?? "").trim() : "";
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value ?? "").replace(/[₹,\s]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function parseDate(value: string): number {
  if (!value) return 0;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value: string): string {
  if (!value) return "—";

  const timestamp = parseDate(value);

  if (!timestamp) return value;

  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function makeOrderId(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function mapSheetRow(
  row: Record<string, string>,
  index: number
): OrderRecord {
  const orderId = readField(row, [
    "order_id",
    "orderId",
    "order id",
    "id",
    "order_number",
  ]);

  const customerName = readField(row, [
    "customer_name",
    "customer",
    "customer name",
    "name",
    "retailer_name",
  ]);

  const productName = readField(row, [
    "product_name",
    "product",
    "product name",
    "item_name",
    "item",
  ]);

  const productId = readField(row, [
    "product_id",
    "product id",
    "productId",
    "item_id",
  ]);

  const quantity = toNumber(
    readField(row, ["quantity", "qty", "order_quantity", "demand_quantity"])
  );

  const total = toNumber(
    readField(row, [
      "grand_total",
      "total_amount",
      "total",
      "order_total",
      "amount",
      "revenue",
    ])
  );

  const date = readField(row, [
    "timestamp",
    "created_at",
    "createdAt",
    "order_date",
    "order_date_time",
    "date",
    "datetime",
  ]);

  const status =
    readField(row, ["status", "order_status", "orderStatus"]) || "Received";

  return {
    ...row,
    order_id: orderId || `SHEET-${index + 1}`,
    customer_name: customerName || "Customer",
    customer_email: readField(row, ["customer_email", "email"]),
    phone: readField(row, ["phone", "mobile", "contact"]),
    address: readField(row, ["address", "delivery_address"]),
    product_name: productName || productId || "—",
    product_id: productId,
    quantity,
    grand_total: total,
    date,
    status,
    source: "sheet",
  };
}

function getSavedOrders(): OrderRecord[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: OrderRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Could not save orders locally:", error);
  }
}

function deduplicateOrders(orders: OrderRecord[]): OrderRecord[] {
  const seen = new Set<string>();

  return orders.filter((order, index) => {
    const id = String(order.order_id || "").trim();

    // Do not collapse different sheet line items when their IDs are missing.
    const key = id ? `${id}-${order.product_id}-${order.product_name}` : `row-${index}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export default function OrderTracking() {
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [qty, setQty] = useState(1);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [search, setSearch] = useState("");

  const selectedProduct =
    PRODUCTS.find((product) => product.id === selectedProductId) ?? PRODUCTS[0];

  const estimatedTotal = selectedProduct.price * qty;

  const loadOrders = useCallback(async () => {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(SHEET_CSV_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Google Sheet returned HTTP ${response.status}`);
      }

      const csv = await response.text();

      if (
        csv.trim().startsWith("<!DOCTYPE") ||
        csv.trim().startsWith("<html")
      ) {
        throw new Error(
          "The Sheet URL returned HTML instead of CSV. Check that the sheet is published to the web."
        );
      }

      const rawRows = csvToObjects(csv);
      const sheetOrders = rawRows.map(mapSheetRow);

      // Keep recently submitted orders in the list even before the Sheet refreshes.
      const localOrders = getSavedOrders();
      const combined = deduplicateOrders([...localOrders, ...sheetOrders]);

      combined.sort((a, b) => {
        const aTime = parseDate(a.date);
        const bTime = parseDate(b.date);

        if (aTime && bTime) return bTime - aTime;
        if (aTime) return -1;
        if (bTime) return 1;

        return 0;
      });

      setOrders(combined);
      saveOrders(combined);
    } catch (err) {
      console.error("Order history fetch failed:", err);

      // Still show locally saved orders when the Sheet cannot be fetched.
      const localOrders = getSavedOrders();
      setOrders(localOrders);

      setError(
        err instanceof Error
          ? `${err.message} Showing locally saved orders if available.`
          : "Could not load Google Sheet order history."
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    const interval = window.setInterval(() => {
      void loadOrders();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadOrders]);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult("");

    if (!form.customer_name.trim()) {
      setError("Please enter the customer name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter the phone number.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the delivery address.");
      return;
    }

    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    setLoading(true);

    const orderId = makeOrderId();
    const orderDate = new Date().toISOString();

    const newOrder: OrderRecord = {
      order_id: orderId,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      product_name: selectedProduct.name,
      product_id: selectedProduct.id,
      quantity: qty,
      grand_total: estimatedTotal,
      date: orderDate,
      status: "Submitted",
      source: "local",
    };

    const payload = {
      ...form,
      order_id: orderId,
      order_date: orderDate,
      items: [
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: qty,
          price: selectedProduct.price,
          total: estimatedTotal,
        },
      ],
      quantity: qty,
      grand_total: estimatedTotal,
      status: "Submitted",
    };

    try {
      const response = await fetch(ORDER_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? "This order was rejected as a duplicate. Please check the order workflow."
            : `Order submission failed (HTTP ${response.status}). ${responseText}`
        );
      }

      // Show the new order immediately, without waiting for the Sheet refresh.
      setOrders((previous) => {
        const updated = [newOrder, ...previous];
        saveOrders(updated);
        return updated;
      });

      setResult(
        `Order submitted successfully! Your order reference is ${orderId}.`
      );

      setForm(EMPTY_FORM);
      setQty(1);

      // Refresh the Sheet after a short delay to pick up the newly appended row.
      window.setTimeout(() => {
        void loadOrders();
      }, 2500);
    } catch (err) {
      console.error("Order submission failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not submit the order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = parseDate(a.date);
      const bTime = parseDate(b.date);

      if (aTime && bTime) return bTime - aTime;
      if (aTime) return -1;
      if (bTime) return 1;

      return 0;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return sortedOrders;

    return sortedOrders.filter((order) =>
      Object.values(order).some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [sortedOrders, search]);

  const totalOrders = useMemo(() => {
    const ids = new Set(
      orders
        .map((order) => order.order_id)
        .filter((id) => id && !String(id).startsWith("SHEET-"))
    );

    return ids.size || orders.length;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    /*
      This sums the total column on each row. If your Sheet repeats an order's
      grand total on multiple product rows, group rows by order_id in this
      calculation to avoid double-counting.
    */
    return orders.reduce((sum, order) => sum + toNumber(order.grand_total), 0);
  }, [orders]);

  const itemsSold = useMemo(() => {
    return orders.reduce((sum, order) => sum + toNumber(order.quantity), 0);
  }, [orders]);

  const latestOrder = sortedOrders[0];

  return (
    <main className="order-section order-tracking-page">
      <header className="order-heading">
        <p className="order-eyebrow">DISTRIBUTED INTELLIGENCE</p>
        <h1>Order Tracking</h1>
        <p>Place a new order and track your recent orders in one place.</p>
      </header>

      {/* SUMMARY */}
      <section className="order-tracking-stats">
        <article className="tracking-stat-card">
          <span>Total Orders</span>
          <strong>{fetching ? "…" : totalOrders}</strong>
        </article>

        <article className="tracking-stat-card">
          <span>Total Revenue</span>
          <strong>{fetching ? "…" : formatMoney(totalRevenue)}</strong>
        </article>

        <article className="tracking-stat-card">
          <span>Items Sold</span>
          <strong>{fetching ? "…" : itemsSold}</strong>
        </article>

        <article className="tracking-stat-card">
          <span>Latest Order</span>
          <strong className="tracking-latest-date">
            {latestOrder ? formatDate(latestOrder.date) : "No orders yet"}
          </strong>
        </article>
      </section>

      {/* LATEST ORDER */}
      {latestOrder && (
        <section className="tracking-panel tracking-latest-panel">
          <div className="tracking-panel-heading">
            <div>
              <p className="order-eyebrow">MOST RECENT</p>
              <h2>Latest Order</h2>
            </div>
            <span className="tracking-status">{latestOrder.status}</span>
          </div>

          <div className="tracking-latest-grid">
            <div>
              <span>Order ID</span>
              <strong>{latestOrder.order_id}</strong>
            </div>
            <div>
              <span>Customer</span>
              <strong>{latestOrder.customer_name}</strong>
            </div>
            <div>
              <span>Product</span>
              <strong>{latestOrder.product_name}</strong>
            </div>
            <div>
              <span>Quantity</span>
              <strong>{latestOrder.quantity || "—"}</strong>
            </div>
            <div>
              <span>Order Total</span>
              <strong>{formatMoney(latestOrder.grand_total)}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{formatDate(latestOrder.date)}</strong>
            </div>
          </div>
        </section>
      )}

      {/* PLACE ORDER FORM */}
      <section className="tracking-panel">
        <div className="tracking-panel-heading">
          <div>
            <p className="order-eyebrow">NEW REQUEST</p>
            <h2>Place an Order</h2>
          </div>
        </div>

        <form className="tracking-form" onSubmit={handleSubmit}>
          <label htmlFor="customer_name">Customer Name *</label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            placeholder="Enter customer name"
            value={form.customer_name}
            onChange={handleFormChange}
            required
          />

          <label htmlFor="customer_email">Email</label>
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            placeholder="Enter email address"
            value={form.customer_email}
            onChange={handleFormChange}
          />

          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleFormChange}
            required
          />

          <label htmlFor="address">Delivery Address *</label>
          <textarea
            id="address"
            name="address"
            placeholder="Enter complete delivery address"
            value={form.address}
            onChange={handleFormChange}
            rows={3}
            required
          />

          <label htmlFor="product">Select Product *</label>
          <select
            id="product"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
          >
            {PRODUCTS.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatMoney(product.price)}
              </option>
            ))}
          </select>

          <label htmlFor="quantity">Quantity *</label>
          <input
            id="quantity"
            type="number"
            min={1}
            step={1}
            value={qty}
            onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
            required
          />

          <div className="tracking-order-total">
            <span>Estimated Total</span>
            <strong>{formatMoney(estimatedTotal)}</strong>
          </div>

          {error && (
            <p className="tracking-message tracking-message-error" role="alert">
              {error}
            </p>
          )}

          {result && (
            <p
              className="tracking-message tracking-message-success"
              role="status"
            >
              {result}
            </p>
          )}

          <button type="submit" disabled={loading} className="tracking-submit">
            {loading ? "Submitting Order..." : "Place Order"}
          </button>
        </form>
      </section>

      {/* ORDER HISTORY */}
      <section className="tracking-panel">
        <div className="tracking-panel-heading">
          <div>
            <p className="order-eyebrow">ORDER RECORDS</p>
            <h2>Order History</h2>
          </div>

          <button
            type="button"
            className="tracking-refresh"
            onClick={() => void loadOrders()}
            disabled={fetching}
          >
            {fetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <input
          className="tracking-search"
          type="search"
          placeholder="Search order ID, customer, product, status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {error && (
          <p className="tracking-message tracking-message-error" role="alert">
            {error}
          </p>
        )}

        {fetching && orders.length === 0 ? (
          <p className="tracking-empty">Loading order history...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="tracking-empty">No orders found.</p>
        ) : (
          <div className="tracking-table-wrapper">
            <table className="tracking-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr
                    key={`${order.order_id}-${order.product_id}-${index}`}
                  >
                    <td>{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity || "—"}</td>
                    <td>{formatMoney(order.grand_total)}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>
                      <span className="tracking-status">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="tracking-footnote">
          Order history refreshes automatically every 30 seconds. Newly submitted
          orders appear immediately in this page.
        </p>
      </section>
    </main>
  );
}