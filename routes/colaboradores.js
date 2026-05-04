"use strict";

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =========================
// GET - LISTAR
// =========================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT 
        c.id_colaborador,
        c.cargo,
        c.estado,
        p.nombre,
        p.apellidos,
        p.doc,
        a.nombre AS area,
        j.nombre AS jornada,
        j.hora_inicio,
        j.hora_fin
    FROM colaboradores c
    JOIN personas p ON c.id_persona = p.id_persona
    JOIN jornadas j ON c.id_jornada = j.id_jornada
    JOIN areas a ON c.id_area = a.id_area
    ORDER BY c.id_colaborador DESC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener colaboradores",
      error: err.message
    });
  }
});


// =========================
// POST - CREAR
// =========================
router.post("/", async (req, res) => {
  const { id_persona, id_jornada, cargo, area } = req.body;

  if (!id_persona || !id_jornada) {
    return res.status(400).json({
      success: false,
      message: "Persona y jornada son obligatorias"
    });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO colaboradores (id_persona, id_jornada, cargo, area, estado)
      VALUES (?, ?, ?, ?, 'Activo')
    `, [id_persona, id_jornada, cargo || null, area || null]);

    res.json({
      success: true,
      message: "Colaborador creado",
      id: result.insertId
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al crear colaborador",
      error: err.message
    });
  }
});


// =========================
// PUT - ACTUALIZAR
// =========================
router.put("/:id", async (req, res) => {
  const { id_jornada, cargo, area } = req.body;

  try {
    await db.query(`
      UPDATE colaboradores
      SET id_jornada = ?, cargo = ?, area = ?
      WHERE id_colaborador = ?
    `, [id_jornada, cargo, area, req.params.id]);

    res.json({
      success: true,
      message: "Colaborador actualizado"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar colaborador"
    });
  }
});


// =========================
// PATCH - ACTIVAR / DESACTIVAR
// =========================
router.patch("/:id/estado", async (req, res) => {
  try {
    const [[colab]] = await db.query(
      "SELECT estado FROM colaboradores WHERE id_colaborador = ?",
      [req.params.id]
    );

    if (!colab) {
      return res.status(404).json({
        success: false,
        message: "No encontrado"
      });
    }

    const nuevoEstado = colab.estado === "Activo" ? "Inactivo" : "Activo";

    await db.query(
      "UPDATE colaboradores SET estado = ? WHERE id_colaborador = ?",
      [nuevoEstado, req.params.id]
    );

    res.json({
      success: true,
      message: `Colaborador ${nuevoEstado}`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado"
    });
  }
});

module.exports = router;