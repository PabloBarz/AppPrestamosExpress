"use strict";

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =========================
// GET - LISTAR COMPRAS
// =========================
router.get("/", async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT
        c.id_compra,
        c.fecha_compra,
        c.tipo_comprobante,
        c.numero_comprobante,
        c.total,
        c.estado,
        p.razon_social,
        u.user_name
      FROM compras c
      INNER JOIN proveedores p
        ON c.id_proveedor = p.id_proveedor
      INNER JOIN usuarios u
        ON c.id_usuario = u.id_usuario
      ORDER BY c.id_compra DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error al obtener compras"
    });
  }
});

module.exports = router;