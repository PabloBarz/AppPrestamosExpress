CREATE DATABASE IF NOT EXISTS appprestamo;
USE appprestamo;

-- =========================
-- ROLES
-- =========================
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150) NULL,
    acciones TEXT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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
    telefono VARCHAR(20) NULL,
    fecha_nac DATE NULL,

    CONSTRAINT uq_tipodoc_doc UNIQUE (tipodoc, doc),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- JORNADAS
-- =========================
DROP TABLE IF EXISTS jornadas;
CREATE TABLE jornadas (
    id_jornada INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    turno VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- USUARIOS
-- =========================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT NOT NULL,
    id_rol INT NOT NULL,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_persona FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- =========================
-- COLABORADORES
-- =========================
DROP TABLE IF EXISTS colaboradores;
CREATE TABLE colaboradores (
    id_colaborador INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT NOT NULL,
    id_jornada INT NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_colab_persona FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    CONSTRAINT fk_colab_jornada FOREIGN KEY (id_jornada) REFERENCES jornadas(id_jornada)
) ENGINE=InnoDB;

-- =========================
-- PROVEEDORES
-- =========================
DROP TABLE IF EXISTS proveedores;
CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NULL,
    direccion VARCHAR(200) NULL,
    email VARCHAR(100) NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- MARCAS
-- =========================
DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(150) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- MODELO
-- =========================
DROP TABLE IF EXISTS modelo;
CREATE TABLE modelo (
    id_modelo INT AUTO_INCREMENT PRIMARY KEY,
    id_marca INT NOT NULL,
    modelo VARCHAR(100) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_modelo_marca FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
) ENGINE=InnoDB;

-- =========================
-- TIPO HERRAMIENTA
-- =========================
DROP TABLE IF EXISTS tipo_herramienta;
CREATE TABLE tipo_herramienta (
    id_tipo_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- COMPRAS
-- =========================
DROP TABLE IF EXISTS compras;
CREATE TABLE compras (
    id_compras INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_compra DATE NOT NULL,
    tipo_comprobante VARCHAR(50) NOT NULL,
    numero_comprobante VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('Registrado','Anulado') NOT NULL DEFAULT 'Registrado',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =========================
-- DETALLE COMPRAS
-- =========================
DROP TABLE IF EXISTS detalle_compras;
CREATE TABLE detalle_compras (
    id_detalle_compras INT AUTO_INCREMENT PRIMARY KEY,
    id_compras INT NOT NULL,
    id_modelo INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_detcomp_compra FOREIGN KEY (id_compras) REFERENCES compras(id_compras),
    CONSTRAINT fk_detcomp_modelo FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo)
) ENGINE=InnoDB;

-- =========================
-- HERRAMIENTAS
-- =========================
DROP TABLE IF EXISTS herramientas;
CREATE TABLE herramientas (
    id_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo INT NOT NULL,
    id_tipo_herramienta INT NOT NULL,
    id_detalle_compras INT NULL,

    codigoqr VARCHAR(100) NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL UNIQUE,

    estado ENUM('Disponible','Prestado','Mantenimiento','Dañado','Perdido') NOT NULL DEFAULT 'Disponible',
    ubicacion VARCHAR(150) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_herr_modelo FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo),
    CONSTRAINT fk_herr_tipo FOREIGN KEY (id_tipo_herramienta) REFERENCES tipo_herramienta(id_tipo_herramienta),
    CONSTRAINT fk_herr_compra FOREIGN KEY (id_detalle_compras) REFERENCES detalle_compras(id_detalle_compras)
) ENGINE=InnoDB;

-- =========================
-- PRESTAMOS
-- =========================
DROP TABLE IF EXISTS prestamos;
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_colaborador INT NOT NULL,
    id_usuario INT NOT NULL,
    motivo_uso TEXT NULL,
    fecha_prestamo DATE NOT NULL,
    area_uso VARCHAR(100) NOT NULL,
    firma VARCHAR(255) NULL,
    observacion TEXT NULL,
    estado ENUM('Activo','Finalizado','Pendiente') NOT NULL DEFAULT 'Activo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prest_colab FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador),
    CONSTRAINT fk_prest_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =========================
-- DETALLE PRESTAMOS
-- =========================
DROP TABLE IF EXISTS detalle_prestamos;
CREATE TABLE detalle_prestamos (
    id_detalle_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT NOT NULL,
    id_herramienta INT NOT NULL,
    hora_prestamo DATETIME NOT NULL,
	hora_devolucion_esperada DATETIME NULL,
	hora_devolucion_final DATETIME NULL,
    estado ENUM('Prestado','Devuelto','Retrasado') NOT NULL DEFAULT 'Prestado',
    estado_devolucion ENUM('Bueno','Regular','Dañado','Incompleto') NULL,
    observaciones_devolucion TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_detprest_prest FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo),
    CONSTRAINT fk_detprest_herr FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta)
) ENGINE=InnoDB;

-- =========================
-- BAJAS
-- =========================
DROP TABLE IF EXISTS bajas;
CREATE TABLE bajas (
    id_bajas INT AUTO_INCREMENT PRIMARY KEY,
    id_herramienta INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_baja ENUM('Dañado','Perdido','Robado','Obsoleto') NOT NULL,
    motivo TEXT NULL,
    fecha_baja DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_baja_herr FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    CONSTRAINT fk_baja_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;