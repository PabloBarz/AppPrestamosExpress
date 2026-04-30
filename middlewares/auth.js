const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Verificar que exista header
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Token requerido",
    });
  }

  // Extraer token
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Diferenciar errores
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
};
