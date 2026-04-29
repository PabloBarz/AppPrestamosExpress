const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Obtener todos los modelos filtrado por marca o por tipo_herramienta
router.get('/', async (req, res) => {
  try {
    const { id_marca, id_tipo } = req.query;

    let query = `
      SELECT
        mo.id_modelo,
        mo.id_marca,
        ma.nombre AS marca,
        mo.id_tipo_herramienta,
        th.tipo AS tipo_herramienta,
        mo.modelo
      FROM modelos mo
      INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
      INNER JOIN tipo_herramienta th ON mo.id_tipo_herramienta = th.id_tipo_herramienta
    `;

    const params = [];

    //  filtro por marca
    if (id_marca) {
      query += ` WHERE mo.id_marca = ?`;
      params.push(id_marca);
    }

    //  filtro por tipo
    if (id_tipo) {
      query += params.length ? ` AND` : ` WHERE`;
      query += ` mo.id_tipo_herramienta = ?`;
      params.push(id_tipo);
    }

    query += ` ORDER BY ma.nombre ASC, th.tipo ASC, mo.modelo ASC`;

    const [rows] = await db.query(query, params);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener modelos',
      error: err.message,
    });
  }
});

// GET - Obtener un modelo por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        mo.id_modelo,
        mo.id_marca,
        ma.nombre AS marca,
        mo.id_tipo_herramienta,
        th.tipo AS tipo_herramienta,
        mo.modelo
      FROM modelos mo
      INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
      INNER JOIN tipo_herramienta th ON mo.id_tipo_herramienta = th.id_tipo_herramienta
      WHERE mo.id_modelo = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado',
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el modelo',
      error: err.message,
    });
  }
});

// POST - Crear nuevo modelo
router.post('/', async (req, res) => {
  const { id_marca, id_tipo_herramienta, modelo } = req.body;

  if (!id_marca) {
    return res.status(400).json({
      success: false,
      message: 'La marca es requerida',
    });
  }

  if (!id_tipo_herramienta) {
    return res.status(400).json({
      success: false,
      message: 'El tipo de herramienta es requerido',
    });
  }

  if (!modelo || modelo.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre del modelo es requerido',
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO modelos (id_marca, id_tipo_herramienta, modelo)
       VALUES (?, ?, ?)`,
      [id_marca, id_tipo_herramienta, modelo.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Modelo creado exitosamente',
      id: result.insertId,
    });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'La marca o el tipo de herramienta no existe',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el modelo',
      error: err.message,
    });
  }
});

// PUT - Actualizar modelo
router.put('/:id', async (req, res) => {
  const { id_marca, id_tipo_herramienta, modelo } = req.body;

  if (!id_marca) {
    return res.status(400).json({
      success: false,
      message: 'La marca es requerida',
    });
  }

  if (!id_tipo_herramienta) {
    return res.status(400).json({
      success: false,
      message: 'El tipo de herramienta es requerido',
    });
  }

  if (!modelo || modelo.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre del modelo es requerido',
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE modelos
       SET id_marca = ?, id_tipo_herramienta = ?, modelo = ?
       WHERE id_modelo = ?`,
      [id_marca, id_tipo_herramienta, modelo.trim(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Modelo actualizado exitosamente',
    });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'La marca o el tipo de herramienta no existe',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar el modelo',
      error: err.message,
    });
  }
});

// DELETE - Eliminar modelo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM modelos WHERE id_modelo = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Modelo eliminado exitosamente',
    });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar: el modelo esta asociado a otros registros',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar el modelo',
      error: err.message,
    });
  }
});

module.exports = router;
