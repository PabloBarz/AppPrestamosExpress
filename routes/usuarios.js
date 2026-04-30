const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const authorizeRoles = require('../middlewares/roles');

router.get('/', authorizeRoles('Administrador'), async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        u.id_usuario,
        u.user_name,
        u.estado,
        r.nombre AS rol,
        p.nombre,
        p.apellidos,
        p.doc
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      INNER JOIN personas p ON u.id_persona = p.id_persona
      ORDER BY u.id_usuario DESC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

router.post('/', authorizeRoles('Administrador'), async (req, res) => {

  const {
    tipodoc,
    doc,
    nombre,
    apellidos,
    telefono,
    fecha_nac,
    user_name,
    contrasena,
    id_rol
  } = req.body;

  try {

    // 🔍 1. Buscar si persona ya existe
    const [personas] = await db.query(`
      SELECT id_persona FROM personas WHERE tipodoc = ? AND doc = ?
    `, [tipodoc, doc]);

    let id_persona;

    if (personas.length > 0) {
      //  YA EXISTE
      id_persona = personas[0].id_persona;

    } else {
      //  NO EXISTE → crear
      const [persona] = await db.query(`
        INSERT INTO personas (tipodoc, doc, nombre, apellidos, telefono, fecha_nac)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [tipodoc, doc, nombre, apellidos, telefono, fecha_nac]);

      id_persona = persona.insertId;
    }

    // 2. Verificar si ya tiene usuario (1 a 1)
    const [usuarioExistente] = await db.query(`
      SELECT id_usuario FROM usuarios WHERE id_persona = ?
    `, [id_persona]);

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta persona ya tiene un usuario'
      });
    }

    // 3. Hash password
    const hash = await bcrypt.hash(contrasena, 10);

    // 4. Crear usuario
    await db.query(`
      INSERT INTO usuarios (id_persona, id_rol, user_name, contrasena)
      VALUES (?, ?, ?, ?)
    `, [id_persona, id_rol, user_name, hash]);

    res.json({
      success: true,
      message: 'Usuario creado correctamente'
    });

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Usuario ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
});



router.put('/:id/estado', authorizeRoles('Administrador'), async (req, res) => {

  const { estado } = req.body;

  await db.query(`
    UPDATE usuarios SET estado = ? WHERE id_usuario = ?
  `, [estado, req.params.id]);

  res.json({
    success: true,
    message: 'Estado actualizado'
  });
});

module.exports = router;