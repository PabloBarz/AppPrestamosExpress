const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authorizeRoles = require("../middlewares/roles");

// =========================
// POST - CREAR PRÉSTAMO
// =========================
router.post("/", authorizeRoles("Administrador"), async (req, res) => {
  const { id_colaborador, herramientas, observacion } = req.body;

  if (!id_colaborador || !Array.isArray(herramientas) || herramientas.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Colaborador y herramientas son obligatorios",
    });
  }

  //  evitar duplicados en array
  const herramientasUnicas = [...new Set(herramientas)];

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. VALIDAR HERRAMIENTAS
    const [rows] = await conn.query(
      `SELECT id_herramienta, estado 
       FROM herramientas 
       WHERE id_herramienta IN (?)`,
      [herramientasUnicas]
    );

    if (rows.length !== herramientasUnicas.length) {
      throw new Error("Una o más herramientas no existen");
    }

    const noDisponibles = rows.filter(h => h.estado !== "Disponible");

    if (noDisponibles.length > 0) {
      throw new Error(
        `Herramientas no disponibles: ${noDisponibles.map(h => h.id_herramienta).join(", ")}`
      );
    }

    // 2. OBTENER JORNADA
    const [[jornada]] = await conn.query(
      `SELECT j.hora_fin
       FROM colaboradores c
       JOIN jornadas j ON c.id_jornada = j.id_jornada
       WHERE c.id_colaborador = ?`,
      [id_colaborador]
    );

    if (!jornada) throw new Error("Colaborador sin jornada");

    // hora Perú
    const ahora = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
    );

    // fecha YYYY-MM-DD local
    const fechaHoy = ahora.toLocaleDateString("en-CA");

    // construir hora fin correcta
    const [h, m, s] = jornada.hora_fin.split(":");

    const fechaHoraFin = new Date(ahora);
    fechaHoraFin.setHours(h, m, s, 0);

    //  BLOQUEO FUERA DE JORNADA
    if (fechaHoraFin < ahora) {
      throw new Error("El colaborador ya terminó su jornada");
    } 

    const [[colaborador]] = await conn.query(`
      SELECT a.nombre AS area
      FROM colaboradores c
      JOIN areas a ON c.id_area = a.id_area
      WHERE c.id_colaborador = ?
    `, [id_colaborador]);

    // 3. CREAR PRÉSTAMO
    const [prestamoResult] = await conn.query(
      `INSERT INTO prestamos 
      (id_usuario_prestamo, id_colaborador, area_uso, observacion)
      VALUES (?, ?, ?, ?)`,
      [
        req.user.id_usuario,
        id_colaborador,
        colaborador.area,
        observacion || null
      ]
    );

    const id_prestamo = prestamoResult.insertId;

    // 4. INSERTAR DETALLE
    const detalleValues = herramientasUnicas.map(id => [
      id_prestamo,
      id,
      ahora,
      fechaHoraFin,
      "Prestado"
    ]);

    await conn.query(
      `INSERT INTO detalle_prestamos
       (id_prestamo, id_herramienta, hora_prestamo, hora_devolucion_esperada, estado)
       VALUES ?`,
      [detalleValues]
    );

    // 5. ACTUALIZAR HERRAMIENTAS
    await conn.query(
      `UPDATE herramientas
       SET estado = 'Prestado'
       WHERE id_herramienta IN (?)`,
      [herramientasUnicas]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Préstamo registrado correctamente",
      id_prestamo
    });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({
      success: false,
      message: err.message
    });
  } finally {
    conn.release();
  }
});


// =========================
// GET - ACTIVOS
// =========================
router.get("/activos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
      p.id_prestamo,
      MIN(dp.hora_prestamo) AS fecha_prestamo,
      p.estado,
      per.nombre,
      per.apellidos,
      COUNT(dp.id_detalle_prestamo) AS total_herramientas
    FROM prestamos p
    JOIN colaboradores c ON p.id_colaborador = c.id_colaborador
    JOIN personas per ON c.id_persona = per.id_persona
    JOIN detalle_prestamos dp ON p.id_prestamo = dp.id_prestamo
    WHERE p.estado = 'Activo'
    GROUP BY p.id_prestamo
    ORDER BY p.id_prestamo DESC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener préstamos"
    });
  }
});

// =========================
// GET - HISTORIAL
// =========================
router.get("/historial", async (req, res) => {
  const { desde, hasta, colaborador } = req.query;

  try {
    let sql = `
      SELECT 
        p.id_prestamo,
        MIN(dp.hora_prestamo) AS fecha_prestamo,
        MAX(dp.hora_devolucion_final) AS fecha_devolucion,
        p.estado,
        per.nombre,
        per.apellidos,
        COUNT(dp.id_detalle_prestamo) AS total_herramientas
      FROM prestamos p
      JOIN colaboradores c ON p.id_colaborador = c.id_colaborador
      JOIN personas per ON c.id_persona = per.id_persona
      JOIN detalle_prestamos dp ON p.id_prestamo = dp.id_prestamo
      WHERE p.estado IN ('Finalizado','Vencido')
    `;

    const params = [];

    // filtros dinámicos
    if (desde) {
      sql += " AND DATE(dp.hora_prestamo) >= ?";
      params.push(desde);
    }

    if (hasta) {
      sql += " AND DATE(dp.hora_prestamo) <= ?";
      params.push(hasta);
    }

    if (colaborador) {
      sql += " AND c.id_colaborador = ?";
      params.push(colaborador);
    }

    sql += `
      GROUP BY p.id_prestamo
      ORDER BY p.id_prestamo DESC
    `;

    const [rows] = await db.query(sql, params);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener historial"
    });
  }
});

// =========================
// GET - DETALLE PRÉSTAMO
// =========================
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dp.id_detalle_prestamo,
        h.codigo,
        dp.hora_prestamo,
        dp.hora_devolucion_esperada,
        dp.hora_devolucion_final,
        dp.estado,
        dp.estado_devolucion,
        dp.observaciones_devolucion,
        u.user_name AS usuario_devolucion
      FROM detalle_prestamos dp
      JOIN herramientas h ON dp.id_herramienta = h.id_herramienta
      LEFT JOIN usuarios u ON dp.id_usuario_devolucion = u.id_usuario
      WHERE dp.id_prestamo = ?
    `, [req.params.id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener detalle"
    });
  }
});


// =========================
// GET - VENCIDOS
// =========================
router.get("/vencidos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dp.id_detalle_prestamo,
        h.codigo,
        h.numero_serie,
        dp.hora_devolucion_esperada,
        per.nombre,
        per.apellidos
      FROM detalle_prestamos dp
      JOIN herramientas h ON dp.id_herramienta = h.id_herramienta
      JOIN prestamos p ON dp.id_prestamo = p.id_prestamo
      JOIN colaboradores c ON p.id_colaborador = c.id_colaborador
      JOIN personas per ON c.id_persona = per.id_persona
      WHERE dp.estado = 'Prestado'
      AND dp.hora_devolucion_esperada < NOW()
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener vencidos"
    });
  }
});


// =========================
// PATCH - DEVOLVER
// =========================
router.patch("/devolver/:id_detalle", require("../middlewares/auth"), async (req, res) => {
  const { estado_devolucion, observaciones_devolucion } = req.body;

  try {
    const [[detalle]] = await db.query(
      `SELECT id_herramienta, id_prestamo
       FROM detalle_prestamos
       WHERE id_detalle_prestamo = ?`,
      [req.params.id_detalle]
    );

    if (!detalle) {
      return res.status(404).json({
        success: false,
        message: "Detalle no encontrado"
      });
    }

    //  ACTUALIZAR DETALLE + USUARIO DEVOLUCIÓN
    await db.query(
      `UPDATE detalle_prestamos
        SET hora_devolucion_final = NOW(),
            estado_devolucion = ?,
            observaciones_devolucion = ?,
            id_usuario_devolucion = ?,
            estado = 'Devuelto'
        WHERE id_detalle_prestamo = ?`,
      [
        estado_devolucion || "Bueno",
        observaciones_devolucion || null,
        req.user.id_usuario,
        req.params.id_detalle
      ]
    );

    // liberar herramienta
    await db.query(
      `UPDATE herramientas
       SET estado = 'Disponible'
       WHERE id_herramienta = ?`,
      [detalle.id_herramienta]
    );

    // cerrar préstamo si ya no hay pendientes
    const [[pendientes]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM detalle_prestamos
       WHERE id_prestamo = ?
       AND estado = 'Prestado'`,
      [detalle.id_prestamo]
    );

    if (pendientes.total === 0) {
      await db.query(
        `UPDATE prestamos
         SET estado = 'Finalizado'
         WHERE id_prestamo = ?`,
        [detalle.id_prestamo]
      );
    }

    res.json({
      success: true,
      message: "Herramienta devuelta correctamente"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al devolver herramienta"
    });
  }
});

module.exports = router;