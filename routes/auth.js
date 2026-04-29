'use strict';

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { user_name, contrasena } = req.body;

    // 1. Validación básica
    if (!user_name || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos',
      });
    }

    // 2. Buscar usuario en BD
    const [rows] = await db.query(
      `SELECT 
        u.id_usuario,
        u.user_name,
        u.contrasena,
        u.estado,
        r.nombre AS rol,
        p.nombre,
        p.apellidos
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      INNER JOIN personas p ON u.id_persona = p.id_persona
      WHERE u.user_name = ?`,
      [user_name]
    );

    // 3. Validar existencia
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const user = rows[0];

    // 4. Validar estado
    if (user.estado !== 'Activo') {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo',
      });
    }

    // 5. Comparar contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta',
      });
    }

    // 6. Generar token
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        user_name: user.user_name,
        rol: user.rol,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

    // 7. Respuesta
    res.json({
      success: true,
      token,
      user: {
        nombre: user.nombre,
        apellidos: user.apellidos,
        rol: user.rol,
      },
    });

  } catch (error) {
    console.error('Error login:', error);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

module.exports = router;