const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const authorizeRoles = require("../middlewares/roles");

router.get("/", authorizeRoles("Administrador"), async (req, res) => {
  try {
    const { estado } = req.query;

    let sql = `
      SELECT 
        u.id_usuario,
        u.user_name,
        u.estado,
        u.id_rol,
        r.nombre AS rol,
        p.nombre,
        p.apellidos,
        p.doc
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      INNER JOIN personas p ON u.id_persona = p.id_persona
    `;

    const params = [];

    if (estado) {
      sql += ` WHERE u.estado = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY u.id_usuario DESC`;

    const [rows] = await db.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
    });
  }
});

router.post("/", authorizeRoles("Administrador"), async (req, res) => {
  const {
    tipodoc,
    doc,
    nombre,
    apellidos,
    telefono,
    fecha_nac,
    user_name,
    contrasena,
    id_rol,
  } = req.body;

  if (!tipodoc || !doc || !nombre || !apellidos || !user_name || !contrasena || !id_rol) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos obligatorios son requeridos",
    });
  }

  try {
    //  1. Buscar si persona ya existe
    const [personas] = await db.query(
      `
      SELECT id_persona FROM personas WHERE tipodoc = ? AND doc = ?
    `,
      [tipodoc, doc],
    );

    let id_persona;

    if (personas.length > 0) {
      //  YA EXISTE
      id_persona = personas[0].id_persona;
    } else {
      //  NO EXISTE → crear
      const [persona] = await db.query(
        `
        INSERT INTO personas (tipodoc, doc, nombre, apellidos, telefono, fecha_nac)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [tipodoc, doc, nombre, apellidos, telefono, fecha_nac],
      );

      id_persona = persona.insertId;
    }

    // 2. Verificar si ya tiene usuario (1 a 1)
    const [usuarioExistente] = await db.query(
      `
      SELECT id_usuario FROM usuarios WHERE id_persona = ?
    `,
      [id_persona],
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Esta persona ya tiene un usuario",
      });
    }

    // 3. Hash password
    const hash = await bcrypt.hash(contrasena, 10);

    // 4. Crear usuario
    await db.query(
      `
      INSERT INTO usuarios (id_persona, id_rol, user_name, contrasena)
      VALUES (?, ?, ?, ?)
    `,
      [id_persona, id_rol, user_name, hash],
    );

    res.json({
      success: true,
      message: "Usuario creado correctamente",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Usuario ya existe",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear usuario",
    });
  }
});

//  PUT - EDITAR USUARIO (SIN CONTRASEÑA)
router.put("/:id", authorizeRoles("Administrador"), async (req, res) => {
  const { user_name, id_rol } = req.body;

  if (!user_name || !id_rol) {
    return res.status(400).json({
      success: false,
      message: "Usuario y rol son obligatorios",
    });
  }

  try {
    // actualizar usuario
    const [result] = await db.query(
      `
      UPDATE usuarios 
      SET user_name = ?, id_rol = ?
      WHERE id_usuario = ?
    `,
      [user_name, id_rol, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
    });
  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya existe",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
    });
  }
});

//  PUT - ACTIVAR / DESACTIVAR (NO ELIMINAR)
router.put("/:id/estado", authorizeRoles("Administrador"), async (req, res) => {
  const { estado } = req.body;

  try {
    await db.query(
      `
      UPDATE usuarios SET estado = ? WHERE id_usuario = ?
    `,
      [estado, req.params.id],
    );

    res.json({
      success: true,
      message: `Usuario ${estado === "Activo" ? "activado" : "desactivado"} correctamente`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado",
    });
  }
});

module.exports = router;
