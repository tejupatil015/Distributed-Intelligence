import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Distribution Intelligence API is running",
  });
});

// Dashboard KPI cards
app.get("/api/dashboard", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM locations) AS total_locations,
        (SELECT COUNT(*) FROM inventory) AS total_products,
        (SELECT COALESCE(SUM(quantity), 0)
         FROM location_inventory) AS total_distributed_stock,
        (SELECT COUNT(*) FROM stock_transfers
         WHERE transfer_status = 'PENDING') AS pending_transfers,
        (SELECT COUNT(*) FROM stock_transfers
         WHERE transfer_status = 'COMPLETED') AS completed_transfers
    `);

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Dashboard API:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not load dashboard",
      error: error.message,
    });
  }
});

// Inventory graph data
app.get("/api/inventory-analytics", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COALESCE(SUM(quantity), 0) AS total_inventory
      FROM location_inventory
    `);

    res.json({
      success: true,
      data: {
        totalInventory: Number(rows[0].total_inventory),
        // Add these categories after confirming their database fields.
        blockInventory: null,
        manufacturingInventory: null,
      },
    });
  } catch (error) {
    console.error("Inventory analytics API:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not load inventory analytics",
      error: error.message,
    });
  }
});

// Location-wise stock
app.get("/api/location-stock", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        l.id AS location_id,
        l.city AS location_name,
        COALESCE(SUM(li.quantity), 0) AS total_stock
      FROM locations l
      LEFT JOIN location_inventory li ON li.location_id = l.id
      GROUP BY l.id, l.city
      ORDER BY total_stock DESC
    `);

    res.json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        total_stock: Number(row.total_stock),
      })),
    });
  } catch (error) {
    console.error("Location stock API:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not load location stock",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Backend running at http://127.0.0.1:${PORT}`);
});