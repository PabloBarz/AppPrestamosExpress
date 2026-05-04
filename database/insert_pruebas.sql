USE appprestamo;

-- =========================
-- AREAS
-- =========================
INSERT INTO areas (nombre) VALUES
('Almacen'),
('Mantenimiento'),
('Produccion'),
('Logistica'),
('Seguridad'),
('Supervision');


-- =========================
-- CATEGORIAS
-- =========================
INSERT INTO categorias (nombre, descripcion) VALUES
('Eléctrica', 'Herramientas que funcionan con energía eléctrica'),
('Manual', 'Herramientas que se operan sin energía externa'),
('Neumática', 'Herramientas que funcionan con aire comprimido'),
('Medición', 'Herramientas utilizadas para medir magnitudes'),
('Seguridad', 'Equipos de protección personal');


-- =========================
-- TIPO HERRAMIENTA
-- =========================
INSERT INTO tipo_herramienta (id_categoria, tipo, descripcion) VALUES
-- ELÉCTRICAS (1)
(1, 'Taladro', 'Herramienta eléctrica para perforar superficies'),
(1, 'Amoladora', 'Herramienta eléctrica para cortar o desbastar materiales'),
(1, 'Sierra eléctrica', 'Herramienta para cortar madera o metal con motor'),

-- MANUALES (2)
(2, 'Martillo', 'Herramienta manual para golpear o clavar'),
(2, 'Destornillador', 'Herramienta manual para ajustar tornillos'),
(2, 'Llave inglesa', 'Herramienta para ajustar tuercas y pernos'),

-- NEUMÁTICAS (3)
(3, 'Pistola neumática', 'Herramienta de aire comprimido'),
(3, 'Llave de impacto', 'Herramienta neumática para ajuste de pernos'),

-- MEDICIÓN (4)
(4, 'Cinta métrica', 'Herramienta para medir longitudes'),
(4, 'Nivel', 'Herramienta para verificar nivel'),

-- SEGURIDAD (5)
(5, 'Casco', 'Protección para la cabeza'),
(5, 'Guantes', 'Protección para manos'),
(5, 'Lentes de seguridad', 'Protección para ojos');


-- =========================
-- MARCAS
-- =========================
INSERT INTO marcas (nombre, descripcion) VALUES
('Bosch', 'Herramientas eléctricas'),
('Makita', 'Equipos industriales'),
('DeWalt', 'Construcción'),
('Stanley', 'Herramientas manuales'),
('Black+Decker', 'Uso doméstico'),
('Hilti', 'Construcción pesada'),
('Milwaukee', 'Alto rendimiento'),
('Ryobi', 'Accesible'),
('Truper', 'Económico'),
('Ingco', 'Industrial moderno');


-- =========================
-- MODELOS (COHERENTES CON TIPO)
-- =========================
INSERT INTO modelos (id_marca, id_tipo_herramienta, modelo) VALUES
-- TALADROS (tipo 1)
(1, 1, 'GSB 13 RE'),
(2, 1, 'HP1630'),
(3, 1, 'DWD024'),
(5, 1, 'KR504RE'),

-- AMOLADORAS (tipo 2)
(1, 2, 'GWS 750-100'),
(2, 2, 'GA5030'),
(3, 2, 'DWE4010'),

-- SIERRAS (tipo 3)
(2, 3, 'HS7600'),
(7, 3, 'M18 FUEL Saw'),

-- MARTILLOS (tipo 4)
(4, 4, 'STHT51346'),
(9, 4, 'TRUP-100'),

-- DESTORNILLADOR (tipo 5)
(4, 5, '66-052'),

-- LLAVE INGLESA (tipo 6)
(4, 6, '87-471'),

-- NEUMATICAS (tipo 7,8)
(6, 7, 'DX 2'),
(6, 8, 'SIW 22T-A'),

-- MEDICION (tipo 9,10)
(4, 9, '30-615'),
(4, 10, '42-480'),

-- SEGURIDAD (tipo 11,12,13)
(9, 11, 'CASCO-TR'),
(9, 12, 'GUANTE-TR'),
(9, 13, 'LENTE-TR');


-- =========================
-- HERRAMIENTAS (CORREGIDO)
-- =========================
INSERT INTO herramientas (
    id_modelo,
    codigoqr,
    codigo,
    numero_serie,
    estado,
    ubicacion
) VALUES
(1, NULL, 'H-001', 'SER001', 'Disponible', 'Almacen A'),
(2, NULL, 'H-002', 'SER002', 'Disponible', 'Almacen A'),
(3, NULL, 'H-003', 'SER003', 'Disponible', 'Almacen B'),
(4, NULL, 'H-004', 'SER004', 'Disponible', 'Almacen B'),
(5, NULL, 'H-005', 'SER005', 'Disponible', 'Almacen C'),
(6, NULL, 'H-006', 'SER006', 'Disponible', 'Almacen C'),
(7, NULL, 'H-007', 'SER007', 'Disponible', 'Almacen A'),
(8, NULL, 'H-008', 'SER008', 'Disponible', 'Almacen A'),
(9, NULL, 'H-009', 'SER009', 'Disponible', 'Almacen B'),
(10, NULL, 'H-010', 'SER010', 'Disponible', 'Almacen B'),
(11, NULL, 'H-011', 'SER011', 'Disponible', 'Almacen C'),
(12, NULL, 'H-012', 'SER012', 'Disponible', 'Almacen C'),
(13, NULL, 'H-013', 'SER013', 'Disponible', 'Almacen A'),
(14, NULL, 'H-014', 'SER014', 'Disponible', 'Almacen A'),
(15, NULL, 'H-015', 'SER015', 'Disponible', 'Almacen B'),
(16, NULL, 'H-016', 'SER016', 'Disponible', 'Almacen B'),
(17, NULL, 'H-017', 'SER017', 'Disponible', 'Almacen C'),
(18, NULL, 'H-018', 'SER018', 'Disponible', 'Almacen C'),
(19, NULL, 'H-019', 'SER019', 'Disponible', 'Almacen A'),
(20, NULL, 'H-020', 'SER020', 'Disponible', 'Almacen A');


-- =========================
-- ROLES
-- =========================
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Almacen', 'Gestion de prestamos y devoluciones'),
('Trabajador', 'Solo consulta herramientas');


-- =========================
-- PERSONAS
-- =========================
INSERT INTO personas (tipodoc, doc, nombre, apellidos, telefono, fecha_nac) VALUES
('DNI', '77420150', 'Roberto Pablo', 'Barzola Claudio', '999111111', '2004-05-09'),
('DNI', '87654321', 'Juan', 'Perez', '999222222', '1995-03-15'),
('DNI', '11223344', 'Maria', 'Lopez', '999333333', '1998-08-20');

INSERT INTO personas (tipodoc, doc, nombre, apellidos, telefono, fecha_nac) VALUES
('DNI', '44556677', 'Carlos', 'Ramirez', '999444444', '1992-06-10'),
('DNI', '55667788', 'Luis', 'Gomez', '999555555', '1990-11-25'),
('DNI', '66778899', 'Ana', 'Torres', '999666666', '1997-02-18');


-- =========================
-- USUARIOS
-- =========================
INSERT INTO usuarios (id_persona, id_rol, user_name, contrasena) VALUES
(1, 1, 'admin', '$2b$10$Gaxbj.xyKb09yRQsaM7HMufecCzUfL/X8K/koXzHpj5ws1ktT8rwW'),
(2, 2, 'almacen1', '$2b$10$Gaxbj.xyKb09yRQsaM7HMufecCzUfL/X8K/koXzHpj5ws1ktT8rwW'),
(3, 3, 'trabajador1', '$2b$10$Gaxbj.xyKb09yRQsaM7HMufecCzUfL/X8K/koXzHpj5ws1ktT8rwW');

/* user_name = admin
 contrasena = 123456*/

INSERT INTO jornadas (nombre, hora_inicio, hora_fin, turno) VALUES
('Turno Mañana', '08:00:00', '17:00:00', 'Mañana'),
('Turno Tarde', '14:00:00', '22:00:00', 'Tarde');

INSERT INTO colaboradores (id_persona, id_jornada, id_area, cargo, estado) VALUES
(4, 1, 2, 'Técnico', 'Activo'),     -- Carlos → Mantenimiento
(5, 2, 3, 'Operador', 'Activo'),    -- Luis → Producción
(6, 1, 1, 'Auxiliar', 'Activo');    -- Ana → Almacén