const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authorizeRoles = require("../middlewares/roles");

/* =========================================================
   GET - LISTAR PROVEEDORES
========================================================= */
router.get("/", authorizeRoles("Administrador"), async (req, res) => {
  try {
    const { estado } = req.query;

    let sql = `
      SELECT 
        id_proveedor,
        razon_social,
        ruc,
        telefono,
        direccion,
        email,
        estado
      FROM proveedores
    `;

    const params = [];

    if (estado) {
      sql += ` WHERE estado = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY id_proveedor DESC`;

    const [rows] = await db.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener proveedores",
    });
  }
});

/* =========================================================
   POST - CREAR PROVEEDOR
========================================================= */
router.post("/", authorizeRoles("Administrador"), async (req, res) => {
  let { razon_social, ruc, telefono, direccion, email } = req.body;

  //  Normalizar
  razon_social = razon_social?.trim();
  ruc = ruc?.trim();
  telefono = telefono?.trim() || null;
  direccion = direccion?.trim() || null;
  email = email?.trim() || null;

  //  Validaciones
  if (!razon_social) {
    return res.status(400).json({
      success: false,
      message: "La razón social es requerida",
    });
  }

  if (!ruc) {
    return res.status(400).json({
      success: false,
      message: "El RUC es requerido",
    });
  }

  //  VALIDAR RUC 11 dígitos
  if (!/^\d{11}$/.test(ruc)) {
    return res.status(400).json({
      success: false,
      message: "El RUC debe tener 11 dígitos",
    });
  }

  //  VALIDAR EMAIL
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email inválido",
    });
  }

  try {
    //  RUC único
    const [exists] = await db.query(
      `SELECT id_proveedor FROM proveedores WHERE ruc = ?`,
      [ruc],
    );

    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El proveedor con ese RUC ya existe",
      });
    }

    await db.query(
      `
      INSERT INTO proveedores 
      (razon_social, ruc, telefono, direccion, email)
      VALUES (?, ?, ?, ?, ?)
      `,
      [razon_social, ruc, telefono, direccion, email],
    );

    res.json({
      success: true,
      message: "Proveedor creado correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al crear proveedor",
    });
  }
});

/* =========================================================
   PUT - EDITAR PROVEEDOR
========================================================= */
router.put("/:id", authorizeRoles("Administrador"), async (req, res) => {
  let { razon_social, ruc, telefono, direccion, email } = req.body;

  razon_social = razon_social?.trim();
  ruc = ruc?.trim();
  telefono = telefono?.trim() || null;
  direccion = direccion?.trim() || null;
  email = email?.trim() || null;

  //  Validaciones
  if (!razon_social || !ruc) {
    return res.status(400).json({
      success: false,
      message: "Datos incompletos",
    });
  }

  if (!/^\d{11}$/.test(ruc)) {
    return res.status(400).json({
      success: false,
      message: "El RUC debe tener 11 dígitos",
    });
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email inválido",
    });
  }

  try {
    const [exists] = await db.query(
      `
      SELECT id_proveedor FROM proveedores 
      WHERE ruc = ? AND id_proveedor != ?
      `,
      [ruc, req.params.id],
    );

    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Otro proveedor ya usa ese RUC",
      });
    }

    const [result] = await db.query(
      `
      UPDATE proveedores
      SET 
        razon_social = ?,
        ruc = ?,
        telefono = ?,
        direccion = ?,
        email = ?
      WHERE id_proveedor = ?
      `,
      [razon_social, ruc, telefono, direccion, email, req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Proveedor actualizado correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar proveedor",
    });
  }
});

/* =========================================================
   PUT - ACTIVAR / DESACTIVAR
========================================================= */
router.put("/:id/estado", authorizeRoles("Administrador"), async (req, res) => {
  const { estado } = req.body;

  //  VALIDAR ESTADO
  if (!["Activo", "Inactivo"].includes(estado)) {
    return res.status(400).json({
      success: false,
      message: "Estado inválido",
    });
  }

  try {
    await db.query(`UPDATE proveedores SET estado = ? WHERE id_proveedor = ?`, [
      estado,
      req.params.id,
    ]);

    res.json({
      success: true,
      message: `Proveedor ${estado === "Activo" ? "activado" : "desactivado"} correctamente`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado",
    });
  }
});

module.exports = router;
