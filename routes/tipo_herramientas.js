const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Obtener todos los tipos de herramienta
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_tipo_herramienta, tipo, descripcion
      FROM tipo_herramienta
      ORDER BY tipo ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de herramienta',
      error: err.message,
    });
  }
});

// GET - Obtener un tipo de herramienta por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_tipo_herramienta, tipo, descripcion
       FROM tipo_herramienta
       WHERE id_tipo_herramienta = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de herramienta no encontrado',
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el tipo de herramienta',
      error: err.message,
    });
  }
});

// POST - Crear nuevo tipo de herramienta
router.post('/', async (req, res) => {
  const { tipo, descripcion } = req.body;

  if (!tipo || tipo.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El tipo de herramienta es requerido',
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO tipo_herramienta (tipo, descripcion) VALUES (?, ?)',
      [tipo.trim(), descripcion?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Tipo de herramienta creado exitosamente',
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el tipo de herramienta',
      error: err.message,
    });
  }
});

// PUT - Actualizar tipo de herramienta
router.put('/:id', async (req, res) => {
  const { tipo, descripcion } = req.body;

  if (!tipo || tipo.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El tipo de herramienta es requerido',
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE tipo_herramienta
       SET tipo = ?, descripcion = ?
       WHERE id_tipo_herramienta = ?`,
      [tipo.trim(), descripcion?.trim() || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de herramienta no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Tipo de herramienta actualizado exitosamente',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el tipo de herramienta',
      error: err.message,
    });
  }
});

// DELETE - Eliminar tipo de herramienta
router.delete('/:id', async (req, res) => {
  try {
    const [modelos] = await db.query(
      'SELECT COUNT(*) AS total FROM modelos WHERE id_tipo_herramienta = ?',
      [req.params.id]
    );

    if (modelos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: el tipo tiene ${modelos[0].total} modelo(s) asociado(s)`,
      });
    }

    const [result] = await db.query(
      'DELETE FROM tipo_herramienta WHERE id_tipo_herramienta = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de herramienta no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Tipo de herramienta eliminado exitosamente',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el tipo de herramienta',
      error: err.message,
    });
  }
});

module.exports = router;
