DROP DATABASE IF EXISTS appprestamo;
CREATE DATABASE appprestamo;
USE appprestamo;

-- =========================
-- ROLES
-- =========================
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150),
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- AREAS
-- =========================
DROP TABLE IF EXISTS areas;
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo'
);

INSERT INTO areas (nombre) VALUES
('Almacén'),
('Mantenimiento'),
('Producción'),
('Logística'),
('Seguridad'),
('Supervisión');

-- =========================
-- PERSONAS
-- =========================
DROP TABLE IF EXISTS personas;
CREATE TABLE personas (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    tipodoc VARCHAR(20) NOT NULL,
    doc VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_nac DATE,
    UNIQUE (tipodoc, doc),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- JORNADAS
-- =========================
DROP TABLE IF EXISTS jornadas;
CREATE TABLE jornadas (
    id_jornada INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    hora_inicio TIME,
    hora_fin TIME,
    turno VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- USUARIOS
-- =========================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT,
    id_rol INT,
    user_name VARCHAR(50) UNIQUE,
    contraseña VARCHAR(255),
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- =========================
-- COLABORADORES
-- =========================
DROP TABLE IF EXISTS colaboradores;
CREATE TABLE colaboradores (
    id_colaborador INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT,
    id_jornada INT,
    id_area INT,
    cargo VARCHAR(100),
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo',

    FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    FOREIGN KEY (id_jornada) REFERENCES jornadas(id_jornada),
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

-- =========================
-- PROVEEDORES
-- =========================
DROP TABLE IF EXISTS proveedores;
CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150),
    ruc VARCHAR(20),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    email VARCHAR(100),
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo'
);

-- =========================
-- MARCAS
-- =========================
DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(150)
);

-- =========================
-- MODELOS
-- =========================
DROP TABLE IF EXISTS modelos;
CREATE TABLE modelos (
    id_modelo INT AUTO_INCREMENT PRIMARY KEY,
    id_marca INT,
    modelo VARCHAR(100),

    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
);

-- =========================
-- TIPO HERRAMIENTA
-- =========================
DROP TABLE IF EXISTS tipo_herramienta;
CREATE TABLE tipo_herramienta (
    id_tipo_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    descripcion VARCHAR(150)
);

-- =========================
-- COMPRAS
-- =========================
DROP TABLE IF EXISTS compras;
CREATE TABLE compras (
    id_compras INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT,
    id_usuario INT,
    fecha_compra DATE,
    tipo_comprobante VARCHAR(50),
    numero_comprobante VARCHAR(50),
    total DECIMAL(10,2),
    estado ENUM('Registrado','Anulado') DEFAULT 'Registrado',

    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =========================
-- DETALLE COMPRAS
-- =========================
DROP TABLE IF EXISTS detalle_compras;
CREATE TABLE detalle_compras (
    id_detalle_compras INT AUTO_INCREMENT PRIMARY KEY,
    id_compras INT,
    id_modelo INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),

    FOREIGN KEY (id_compras) REFERENCES compras(id_compras),
    FOREIGN KEY (id_modelo) REFERENCES modelos(id_modelo)
);

-- =========================
-- HERRAMIENTAS
-- =========================
DROP TABLE IF EXISTS herramientas;
CREATE TABLE herramientas (
    id_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo INT,
    id_tipo_herramienta INT,
    id_detalle_compras INT,

    codigoqr VARCHAR(100),
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(150),
    numero_serie VARCHAR(100) UNIQUE,

    estado ENUM('Disponible','Prestado','Mantenimiento','Dañado','Perdido') DEFAULT 'Disponible',
    ubicacion VARCHAR(150),

    FOREIGN KEY (id_modelo) REFERENCES modelos(id_modelo),
    FOREIGN KEY (id_tipo_herramienta) REFERENCES tipo_herramienta(id_tipo_herramienta),
    FOREIGN KEY (id_detalle_compras) REFERENCES detalle_compras(id_detalle_compras)
);

-- =========================
-- PRESTAMOS
-- =========================
DROP TABLE IF EXISTS prestamos;
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_colaborador INT,
    id_usuario_prestamo INT,
    motivo_uso TEXT,
    fecha_prestamo DATE,
    area_uso VARCHAR(100),
    firma VARCHAR(255),
    observacion TEXT,
    estado ENUM('Activo','Finalizado','Pendiente') DEFAULT 'Activo',

    FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador),
    FOREIGN KEY (id_usuario_prestamo) REFERENCES usuarios(id_usuario)
);

-- =========================
-- DETALLE PRESTAMOS
-- =========================
DROP TABLE IF EXISTS detalle_prestamos;
CREATE TABLE detalle_prestamos (
    id_detalle_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT,
    id_herramienta INT,
    id_usuario_devolucion INT,

    hora_prestamo DATETIME,
    hora_devolucion_esperada DATETIME,
    hora_devolucion_final DATETIME,

    estado ENUM('Prestado','Devuelto','Retrasado') DEFAULT 'Prestado',
    estado_devolucion ENUM('Bueno','Regular','Dañado','Incompleto'),
    observaciones_devolucion TEXT,

    FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo),
    FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    FOREIGN KEY (id_usuario_devolucion) REFERENCES usuarios(id_usuario)
);

-- =========================
-- BAJAS
-- =========================
DROP TABLE IF EXISTS bajas;
CREATE TABLE bajas (
    id_bajas INT AUTO_INCREMENT PRIMARY KEY,
    id_herramienta INT,
    id_usuario INT,
    tipo_baja ENUM('Dañado','Perdido','Robado','Obsoleto'),
    motivo TEXT,
    fecha_baja DATE,

    FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);