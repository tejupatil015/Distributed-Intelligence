import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS totalProducts,
        COALESCE(SUM(quantity), 0) AS totalUnits,
        COALESCE(SUM(quantity * unit_price), 0) AS inventoryValue,
        COALESCE(
          SUM(CASE WHEN quantity < 20 THEN 1 ELSE 0 END),
          0
        ) AS lowStockItems,
        COALESCE(
          SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END),
          0
        ) AS activeProducts
      FROM inventory
    `);

    const summary = rows[0];
    const total = Number(summary.totalProducts);
    const active = Number(summary.activeProducts);

    const [products] = await pool.query(`
      SELECT
        id,
        product_name AS name,
        category,
        quantity,
        unit_price AS unitPrice,
        quantity * unit_price AS stockValue,
        status,
        created_at AS createdAt
      FROM inventory
      ORDER BY created_at DESC, id DESC
      LIMIT 20
    `);

    const maxValue = Math.max(
      1,
      ...products.map((p) => Number(p.stockValue))
    );

    res.json({
      success: true,
      summary: {
        totalProducts: total,
        totalUnits: Number(summary.totalUnits),
        inventoryValue: Number(summary.inventoryValue),
        lowStockItems: Number(summary.lowStockItems),
        activeProducts: active,
        systemEfficiency: total
          ? Number(((active / total) * 100).toFixed(1))
          : 0,
      },
      activity: products.slice(0, 4).map((p) => ({
        id: p.id,
        name: p.name,
        detail: `${p.category} · ${p.quantity} units`,
        time: p.createdAt
          ? new Date(p.createdAt).toLocaleString()
          : "Recently added",
        status: p.status === "Active" ? "Completed" : "Processing",
      })),
      bars: products.map((p) => ({
        label: p.name,
        value: Number(p.stockValue),
        height: Math.max(
          5,
          Math.round((Number(p.stockValue) / maxValue) * 100)
        ),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
});

export default router;