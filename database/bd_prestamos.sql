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
    descripcion VARCHAR(150) NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    CONSTRAINT uq_roles_nombre UNIQUE (nombre),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- AREAS
-- =========================
DROP TABLE IF EXISTS areas;
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    CONSTRAINT uq_areas_nombre UNIQUE (nombre),
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_personas_tipodoc_doc UNIQUE (tipodoc, doc)
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT ck_horas CHECK (hora_inicio < hora_fin),
    CONSTRAINT uk_jornadas_nombre_turno UNIQUE(nombre, turno)
) ENGINE=InnoDB;

-- =========================
-- USUARIOS
-- =========================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT NOT NULL,
    id_rol INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_usuarios_user_name UNIQUE (user_name),
    CONSTRAINT fk_usuarios_personas FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    CONSTRAINT uq_usuarios_id_persona UNIQUE (id_persona),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- =========================
-- COLABORADORES
-- =========================
DROP TABLE IF EXISTS colaboradores;
CREATE TABLE colaboradores (
    id_colaborador INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT NOT NULL,
    id_jornada INT NOT NULL,
    id_area INT NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_colaboradores_personas FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    CONSTRAINT uq_colaboradores_id_persona UNIQUE (id_persona),
    CONSTRAINT fk_colaboradores_jornadas FOREIGN KEY (id_jornada) REFERENCES jornadas(id_jornada),
    CONSTRAINT fk_colaboradores_areas FOREIGN KEY (id_area) REFERENCES areas(id_area)
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uk_proveedores_ruc UNIQUE (ruc)
) ENGINE=InnoDB;

-- =========================
-- MARCAS
-- =========================
DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(150) NULL,

    CONSTRAINT uq_marcas_nombre UNIQUE (nombre),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_categorias_nombre UNIQUE(nombre)

) ENGINE=InnoDB;

-- =========================
-- TIPO HERRAMIENTA
-- =========================
DROP TABLE IF EXISTS tipo_herramienta;
CREATE TABLE tipo_herramienta (
    id_tipo_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_tipo_nombre UNIQUE (tipo),
    CONSTRAINT fk_tipo_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)

) ENGINE=InnoDB;

-- =========================
-- MODELOS
-- =========================
DROP TABLE IF EXISTS modelos;
CREATE TABLE modelos (
    id_modelo INT AUTO_INCREMENT PRIMARY KEY,
    id_marca INT NOT NULL,
    id_tipo_herramienta INT NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_idmarca_idtipo_modelo UNIQUE(id_marca, id_tipo_herramienta, modelo),
    CONSTRAINT fk_modelos_marcas FOREIGN KEY (id_marca) REFERENCES marcas(id_marca),
    CONSTRAINT fk_modelos_tipo_herramienta FOREIGN KEY (id_tipo_herramienta) REFERENCES tipo_herramienta(id_tipo_herramienta)
) ENGINE=InnoDB;

-- =========================
-- COMPRAS
-- =========================
DROP TABLE IF EXISTS compras;
CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_compra DATE NOT NULL,
    tipo_comprobante VARCHAR(50) NOT NULL,
    numero_comprobante VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('Registrado','Anulado') NOT NULL DEFAULT 'Registrado',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT ck_total CHECK (total >= 0),
    CONSTRAINT uq_compras_proveedor_comprobante UNIQUE(id_proveedor, numero_comprobante),
    CONSTRAINT fk_compras_proveedores FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    CONSTRAINT fk_compras_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =========================
-- DETALLE COMPRAS
-- =========================
DROP TABLE IF EXISTS detalle_compras;
CREATE TABLE detalle_compras (
    id_detalle_compras INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_modelo INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT ck_precio CHECK (precio_unitario > 0),
    CONSTRAINT ck_subtotal CHECK (subtotal >= 0),
    CONSTRAINT ck_cantidad CHECK (cantidad > 0),
    CONSTRAINT uq_id_compras_id_modelo UNIQUE(id_compra, id_modelo),
    CONSTRAINT fk_detalle_compras_compras FOREIGN KEY (id_compra) REFERENCES compras(id_compra),
    CONSTRAINT fk_detalle_compras_modelos FOREIGN KEY (id_modelo) REFERENCES modelos(id_modelo)
) ENGINE=InnoDB;

-- =========================
-- HERRAMIENTAS
-- =========================
DROP TABLE IF EXISTS herramientas;
CREATE TABLE herramientas (
    id_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo INT NOT NULL,
    id_detalle_compras INT NULL,
    codigoqr VARCHAR(100) NULL,
    codigo VARCHAR(50) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL,
    estado ENUM('Disponible','Prestado','Mantenimiento','Danado','Perdido') NOT NULL DEFAULT 'Disponible',
    ubicacion VARCHAR(150) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_herramientas_codigo UNIQUE (codigo),
    CONSTRAINT uq_herramientas_numero_serie UNIQUE (numero_serie),
    CONSTRAINT fk_herramientas_modelos FOREIGN KEY (id_modelo) REFERENCES modelos(id_modelo),
    CONSTRAINT fk_herramientas_detalle_compras FOREIGN KEY (id_detalle_compras) REFERENCES detalle_compras(id_detalle_compras)
) ENGINE=InnoDB;

-- =========================
-- PRESTAMOS
-- =========================
DROP TABLE IF EXISTS prestamos;
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_colaborador INT NOT NULL,
    id_usuario_prestamo INT NOT NULL,
    motivo_uso TEXT NULL,
    fecha_prestamo DATE NOT NULL DEFAULT (CURRENT_DATE),
    area_uso VARCHAR(100) NOT NULL,
    firma VARCHAR(255) NULL,
    observacion TEXT NULL,
    estado ENUM('Activo','Finalizado') NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prestamos_colaboradores FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador),
    CONSTRAINT fk_prestamos_usuarios_prestamo FOREIGN KEY (id_usuario_prestamo) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =========================
-- DETALLE PRESTAMOS
-- =========================
DROP TABLE IF EXISTS detalle_prestamos;
CREATE TABLE detalle_prestamos (
    id_detalle_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT NOT NULL,
    id_herramienta INT NOT NULL,
    id_usuario_devolucion INT NULL,
    hora_prestamo DATETIME NOT NULL,
    hora_devolucion_esperada DATETIME NULL,
    hora_devolucion_final DATETIME NULL,
    estado ENUM('Prestado','Devuelto','Vencido') NOT NULL DEFAULT 'Prestado',
    estado_devolucion ENUM('Bueno','Regular','Danado','Incompleto') NULL,
    observaciones_devolucion TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT ck_fechas CHECK (
    hora_devolucion_final IS NULL 
    OR hora_devolucion_final >= hora_prestamo
    ),
    CONSTRAINT uq_idprestamo_idherramienta UNIQUE(id_prestamo, id_herramienta),
    CONSTRAINT fk_detalle_prestamos_prestamos FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo),
    CONSTRAINT fk_detalle_prestamos_herramientas FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    CONSTRAINT fk_detalle_prestamos_usuarios_devolucion FOREIGN KEY (id_usuario_devolucion) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =========================
-- BAJAS
-- =========================
DROP TABLE IF EXISTS bajas;
CREATE TABLE bajas (
    id_bajas INT AUTO_INCREMENT PRIMARY KEY,
    id_herramienta INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_baja ENUM('Danado','Perdido','Robado','Obsoleto') NOT NULL,
    motivo TEXT NULL,
    fecha_baja DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bajas_herramientas FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    CONSTRAINT fk_bajas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT uq_bajas_herramientas UNIQUE(id_herramienta)
) ENGINE=InnoDB;
