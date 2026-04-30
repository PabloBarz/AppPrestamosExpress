const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authorizeRoles = require('../middlewares/roles');


// =========================
//  GET - LISTAR CATEGORIAS
// =========================
router.get('/', authorizeRoles('Administrador'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_categoria, nombre, descripcion
      FROM categorias
      ORDER BY id_categoria DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_categoria, nombre, descripcion FROM categorias WHERE id_categoria = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada',
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la categoria',
      error: err.message,
    });
  }
});


// =========================
//  POST - CREAR CATEGORIA
// =========================
router.post('/', authorizeRoles('Administrador'), async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({
      success: false,
      message: 'El nombre es obligatorio'
    });
  }

  try {
    await db.query(`
      INSERT INTO categorias (nombre, descripcion)
      VALUES (?, ?)
    `, [nombre, descripcion]);

    res.json({
      success: true,
      message: 'Categoría creada correctamente'
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'La categoría ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear categoría'
    });
  }
});


// =========================
//  PUT - EDITAR CATEGORIA
// =========================
router.put('/:id', authorizeRoles('Administrador'), async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({
      success: false,
      message: 'El nombre es obligatorio'
    });
  }

  try {
    await db.query(`
      UPDATE categorias
      SET nombre = ?, descripcion = ?
      WHERE id_categoria = ?
    `, [nombre, descripcion, req.params.id]);

    res.json({
      success: true,
      message: 'Categoría actualizada correctamente'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría'
    });
  }
});

// =========================
//  DELETE FISICO 
// =========================
router.delete('/:id', authorizeRoles('Administrador'), async (req, res) => {
  try {
    //  Verificar si tiene tipos asociados
    const [tipos] = await db.query(
      'SELECT COUNT(*) AS total FROM tipo_herramienta WHERE id_categoria = ?',
      [req.params.id]
    );

    if (tipos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: la categoría tiene ${tipos[0].total} tipo(s) asociado(s)`
      });
    }

    //  Eliminar
    const [result] = await db.query(
      'DELETE FROM categorias WHERE id_categoria = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría',
      error: err.message
    });
  }
});

module.exports = router;