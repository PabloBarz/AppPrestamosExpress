const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authorizeRoles = require('../middlewares/roles');


// =========================
// GET - LISTAR HERRAMIENTAS
// =========================
router.get('/', async (req, res) => {
  try {
    const { estado, id_modelo } = req.query;

    let sql = `
      SELECT 
        h.id_herramienta,
        h.codigo,
        h.numero_serie,
        h.estado,
        h.ubicacion,
        h.codigoqr,

        m.id_modelo,
        m.modelo,

        ma.nombre AS marca,
        t.tipo,
        c.nombre AS categoria

      FROM herramientas h
      INNER JOIN modelos m ON h.id_modelo = m.id_modelo
      INNER JOIN marcas ma ON m.id_marca = ma.id_marca
      INNER JOIN tipo_herramienta t ON m.id_tipo_herramienta = t.id_tipo_herramienta
      INNER JOIN categorias c ON t.id_categoria = c.id_categoria
      WHERE 1=1
    `;

    const params = [];

    if (estado) {
      sql += ` AND h.estado = ?`;
      params.push(estado);
    }

    if (id_modelo) {
      sql += ` AND h.id_modelo = ?`;
      params.push(id_modelo);
    }

    sql += ` ORDER BY h.id_herramienta DESC`;

    const [rows] = await db.query(sql, params);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener herramientas',
      error: err.message
    });
  }
});


// =========================
// GET - UNA HERRAMIENTA
// =========================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        m.modelo,
        ma.nombre AS marca,
        t.tipo,
        c.nombre AS categoria
      FROM herramientas h
      INNER JOIN modelos m ON h.id_modelo = m.id_modelo
      INNER JOIN marcas ma ON m.id_marca = ma.id_marca
      INNER JOIN tipo_herramienta t ON m.id_tipo_herramienta = t.id_tipo_herramienta
      INNER JOIN categorias c ON t.id_categoria = c.id_categoria
      WHERE h.id_herramienta = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener herramienta',
      error: err.message
    });
  }
});


// =========================
// POST - CREAR HERRAMIENTA (MANUAL)
// =========================
router.post('/', authorizeRoles('Administrador'), async (req, res) => {
  const {
    id_modelo,
    codigo,
    numero_serie,
    ubicacion,
    codigoqr
  } = req.body;

  if (!id_modelo || !codigo || !numero_serie) {
    return res.status(400).json({
      success: false,
      message: 'Modelo, código y número de serie son obligatorios'
    });
  }

  
  try {
    // validar código duplicado también
      const [existeCodigo] = await db.query(
        'SELECT id_herramienta FROM herramientas WHERE codigo = ?',
        [codigo.trim()]
      );
  
      if (existeCodigo.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El código ya existe'
        });
      }
    
    //  Validar duplicado por número de serie
    const [existeSerie] = await db.query(
      'SELECT id_herramienta FROM herramientas WHERE numero_serie = ?',
      [numero_serie.trim()]
    );

    if (existeSerie.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una herramienta con ese número de serie'
      });
    }

    const [result] = await db.query(`
      INSERT INTO herramientas 
      (id_modelo, codigo, numero_serie, ubicacion, codigoqr)
      VALUES (?, ?, ?, ?, ?)
    `, [
      id_modelo,
      codigo.trim(),
      numero_serie.trim(),
      ubicacion || null,
      codigoqr || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Herramienta registrada correctamente',
      id: result.insertId
    });

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'El código ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear herramienta',
      error: err.message
    });
  }
});


// =========================
// PUT - ACTUALIZAR DATOS (LIMITADO)
// =========================
router.put('/:id', authorizeRoles('Administrador'), async (req, res) => {
  const {
    id_modelo,
    codigo,
    numero_serie,
    ubicacion,
    codigoqr
  } = req.body;

  // solo validar en creación lógica (no en edición completa)
    if (ubicacion === undefined && codigoqr === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar al menos ubicación o QR'
      });
    }

  try {

    //  No permitir editar si está prestado
    const [[herr]] = await db.query(
    'SELECT estado, ubicacion, codigoqr FROM herramientas WHERE id_herramienta = ?',
      [req.params.id]
    );

    if (!herr) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      });
    }

    if (herr.estado === 'Prestado') {
      return res.status(409).json({
        success: false,
        message: 'No se puede editar una herramienta prestada'
      });
    }

    if (ubicacion === herr.ubicacion && codigoqr === herr.codigoqr) {
      return res.status(400).json({
        success: false,
        message: 'No hay cambios para actualizar'
      });
    }

    await db.query(`
      UPDATE herramientas
      SET 
        ubicacion = ?,
        codigoqr = ?
      WHERE id_herramienta = ?
    `, [
        ubicacion || null,
        codigoqr || null,
        req.params.id
      ]);

    res.json({
      success: true,
      message: 'Herramienta actualizada correctamente'
    });

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Código o número de serie duplicado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar herramienta',
      error: err.message
    });
  }
});


// =========================
// PATCH - CAMBIAR ESTADO (CONTROLADO)
// =========================
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;

  const estadosPermitidos = ['Disponible', 'Mantenimiento'];

  if (!estado || !estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      success: false,
      message: 'Solo se permite cambiar a Disponible o Mantenimiento'
    });
  }

  try {
    const [[herr]] = await db.query(
      'SELECT estado FROM herramientas WHERE id_herramienta = ?',
      [req.params.id]
    );

    if (!herr) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      });
    }

    //  no cambiar si está prestado
    if (herr.estado === 'Prestado') {
      return res.status(409).json({
        success: false,
        message: 'No se puede cambiar estado mientras está prestado'
      });
    }

    await db.query(
      'UPDATE herramientas SET estado = ? WHERE id_herramienta = ?',
      [estado, req.params.id]
    );

    res.json({
      success: true,
      message: 'Estado actualizado correctamente'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: err.message
    });
  }
});


module.exports = router;