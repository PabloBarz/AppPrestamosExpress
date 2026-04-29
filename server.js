require('dotenv').config();
const express = require('express');

const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── 1. Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (frontend SPA)
app.use(express.static(path.join(__dirname, 'public')));

// ── Rutas API ────────────────────────────────────────────────
app.use('/api/marcas', require('./routes/marcas'));
app.use('/api/tipo-herramientas', require('./routes/tipo_herramientas')); 

// 3. SPA: redirigir todo al index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Error handler global ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;