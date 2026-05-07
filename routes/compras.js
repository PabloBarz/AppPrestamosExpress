"use strict";

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =========================
// GET - LISTAR COMPRAS
// =========================
router.get('/', async (req, res) => {
  try {

    const {
      search = '',
      desde = '',
      hasta = '',
      estado = '',
      tipo = ''
    } = req.query;

    let sql = `
      SELECT
        c.id_compra,
        p.razon_social,
        c.tipo_comprobante,
        c.numero_comprobante,
        c.fecha_compra,
        c.total,
        c.estado,
        u.user_name

      FROM compras c

      INNER JOIN proveedores p
        ON p.id_proveedor = c.id_proveedor

      INNER JOIN usuarios u
        ON u.id_usuario = c.id_usuario

      WHERE 1=1
    `;

    const params = [];
    // =========================
    // BUSCADOR
    // =========================
    if (search) {

      sql += `
        AND (
          c.numero_comprobante LIKE ?
          OR p.razon_social LIKE ?
        )
      `;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    // =========================
    // FECHA DESDE
    // =========================
    if (desde) {
      sql += `
        AND c.fecha_compra >= ?
      `;
      params.push(desde);
    }

    // =========================
    // FECHA HASTA
    // =========================
    if (hasta) {
      sql += `
        AND c.fecha_compra <= ?
      `;

      params.push(hasta);
    }

    // =========================
    // ESTADO
    // =========================
    if (estado) {
      sql += `
        AND c.estado = ?
      `;

      params.push(estado);
    }

    if (tipo) {

      sql += `
        AND c.tipo_comprobante = ?
      `;

      params.push(tipo);
    }

    sql += `
      ORDER BY c.id_compra DESC
    `;

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

router.post('/', async (req, res) => {
  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const {
      id_proveedor,
      fecha_compra,
      tipo_comprobante,
      numero_comprobante,
      detalles
    } = req.body;

    if (!detalles || !detalles.length) {
      return res.status(400).json({
        success: false,
        message: 'La compra no tiene detalles'
      });
    }

    const total = detalles.reduce(
      (acc, item) => acc + Number(item.subtotal),
      0
    );

    // =========================
    // INSERTAR COMPRA
    // =========================
    const [compraResult] = await conn.query(
      `
      INSERT INTO compras (
        id_proveedor,
        id_usuario,
        fecha_compra,
        tipo_comprobante,
        numero_comprobante,
        total
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id_proveedor,
        req.user.id_usuario,
        fecha_compra,
        tipo_comprobante,
        numero_comprobante,
        total
      ]
    );

    const id_compra = compraResult.insertId;

    // =========================
    // INSERTAR DETALLES
    // =========================
    for (const item of detalles) {

      const [detalleResult] = await conn.query(
        `
        INSERT INTO detalle_compras (
          id_compra,
          id_modelo,
          cantidad,
          precio_unitario,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          id_compra,
          item.id_modelo,
          item.cantidad,
          item.precio,
          item.subtotal
        ]
      );

      const id_detalle_compras = detalleResult.insertId;

      // =========================
      // GENERAR HERRAMIENTAS
      // =========================
      for (let i = 1; i <= item.cantidad; i++) {

        const [countRows] = await conn.query(
          `SELECT COUNT(*) total FROM herramientas`
        );

        const correlativo =
          String(countRows[0].total + 1).padStart(4, '0');

        const codigo = `HER-${correlativo}`;

        const [marcaRows] = await conn.query(
          `
          SELECT ma.nombre
          FROM modelos mo
          INNER JOIN marcas ma
            ON ma.id_marca = mo.id_marca
          WHERE mo.id_modelo = ?
          `,
          [item.id_modelo]
        );

        const marca = marcaRows[0].nombre
          .toUpperCase()
          .replace(/\s+/g, '');

        const year = new Date().getFullYear();

        const serie = `${marca}-${year}-${correlativo}`;

        await conn.query(
          `
          INSERT INTO herramientas (
            id_modelo,
            id_detalle_compras,
            codigo,
            numero_serie,
            ubicacion,
            estado
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            item.id_modelo,
            id_detalle_compras,
            codigo,
            serie,
            'Almacén Principal',
            'Disponible'
          ]
        );

      }

    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Compra registrada correctamente'
    });

  } catch (err) {

    await conn.rollback();

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {
    conn.release();
  }
});

router.get('/:id', async (req, res) => {
  try {

    const [rows] = await db.query(
      `
      SELECT
        dc.id_detalle_compras,
        mo.modelo,
        ma.nombre AS marca,
        th.tipo AS tipo_herramienta,

        dc.cantidad,
        dc.precio_unitario,
        dc.subtotal,

        h.codigo,
        h.numero_serie,
        h.estado,
        h.ubicacion

      FROM detalle_compras dc

      INNER JOIN modelos mo
        ON mo.id_modelo = dc.id_modelo

      INNER JOIN marcas ma
        ON ma.id_marca = mo.id_marca

      INNER JOIN tipo_herramienta th
        ON th.id_tipo_herramienta = mo.id_tipo_herramienta

      LEFT JOIN herramientas h
        ON h.id_detalle_compras = dc.id_detalle_compras

      WHERE dc.id_compra = ?

      ORDER BY dc.id_detalle_compras DESC
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

module.exports = router;