const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Obtener todas las marcas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_marca, nombre, descripcion
      FROM marcas
      ORDER BY nombre ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener marcas',
      error: err.message,
    });
  }
});

// GET - Obtener una marca por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_marca, nombre, descripcion FROM marcas WHERE id_marca = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada',
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la marca',
      error: err.message,
    });
  }
});

// POST - Crear nueva marca
router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre de la marca es requerido',
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)',
      [nombre.trim(), descripcion?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Marca creada exitosamente',
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la marca',
      error: err.message,
    });
  }
});

// PUT - Actualizar marca
router.put('/:id', async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre de la marca es requerido',
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE marcas SET nombre = ?, descripcion = ? WHERE id_marca = ?',
      [nombre.trim(), descripcion?.trim() || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Marca actualizada exitosamente',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la marca',
      error: err.message,
    });
  }
});

// DELETE - Eliminar marca
router.delete('/:id', async (req, res) => {
  try {
    const [modelos] = await db.query(
      'SELECT COUNT(*) AS total FROM modelos WHERE id_marca = ?',
      [req.params.id]
    );

    if (modelos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: la marca tiene ${modelos[0].total} modelo(s) asociado(s)`,
      });
    }

    const [result] = await db.query(
      'DELETE FROM marcas WHERE id_marca = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Marca eliminada exitosamente',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la marca',
      error: err.message,
    });
  }
});

module.exports = router;
