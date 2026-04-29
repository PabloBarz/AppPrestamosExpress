const mysql = require("mysql2/promise")
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "appprestamo",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "00:00",
});

(async () => {
  try {
    const conn = await pool.getConnection(); 
    console.log("Conexión a MySQL establecida correctamente");
    conn.release(); 
  } catch (err) {
    console.error("Error al conectar con MySQL:", err.message);
  } 
})();

module.exports = pool;
