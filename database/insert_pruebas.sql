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
-- TIPO HERRAMIENTA
-- =========================
INSERT INTO tipo_herramienta (tipo, descripcion) VALUES
('Manual', 'Herramientas de uso manual'),
('Electrica', 'Herramientas con motor electrico'),
('Neumatica', 'Herramientas de aire comprimido'),
('Medicion', 'Herramientas de medicion'),
('Seguridad', 'Equipos de proteccion');

-- =========================
-- MARCAS
-- =========================
INSERT INTO marcas (nombre, descripcion) VALUES
('Bosch', 'Herramientas electricas'),
('Makita', 'Equipos industriales'),
('DeWalt', 'Construccion'),
('Stanley', 'Herramientas manuales'),
('Black+Decker', 'Uso domestico'),
('Hilti', 'Construccion pesada'),
('Milwaukee', 'Alto rendimiento'),
('Ryobi', 'Accesible'),
('Truper', 'Economico'),
('Ingco', 'Industrial moderno');

-- =========================
-- MODELOS
-- =========================
INSERT INTO modelos (id_marca, id_tipo_herramienta, modelo) VALUES
(1, 2, 'GWS 750-100'),
(1, 2, 'GSB 13 RE'),
(2, 2, 'HR2470'),
(2, 2, 'GA5030'),
(3, 2, 'DWE5010'),
(3, 2, 'DCD771C2'),
(4, 1, 'STGS9115'),
(4, 1, 'SDH600'),
(5, 2, 'KR504RE'),
(5, 2, 'CD121K'),
(6, 2, 'TE 7-C'),
(6, 2, 'AG 125-A22'),
(7, 2, 'M18 FUEL'),
(7, 2, 'M12 Drill'),
(8, 2, 'RAG800'),
(8, 2, 'RCD120'),
(9, 1, 'TRUP-100'),
(9, 1, 'TRUP-200'),
(10, 2, 'ID6508'),
(10, 2, 'AG95028');

-- =========================
-- HERRAMIENTAS
-- =========================
INSERT INTO herramientas (
    id_modelo,
    codigoqr,
    codigo,
    nombre,
    numero_serie,
    estado,
    ubicacion
) VALUES
(1, NULL, 'H-001', 'Esmeril Bosch', 'SER001', 'Disponible', 'Almacen A'),
(2, NULL, 'H-002', 'Taladro Bosch', 'SER002', 'Disponible', 'Almacen A'),
(3, NULL, 'H-003', 'Rotomartillo Makita', 'SER003', 'Disponible', 'Almacen B'),
(4, NULL, 'H-004', 'Esmeril Makita', 'SER004', 'Disponible', 'Almacen B'),
(5, NULL, 'H-005', 'Taladro DeWalt', 'SER005', 'Disponible', 'Almacen C'),
(6, NULL, 'H-006', 'Taladro DeWalt', 'SER006', 'Disponible', 'Almacen C'),
(7, NULL, 'H-007', 'Herramienta Stanley', 'SER007', 'Disponible', 'Almacen A'),
(8, NULL, 'H-008', 'Herramienta Stanley', 'SER008', 'Disponible', 'Almacen A'),
(9, NULL, 'H-009', 'Taladro Black+Decker', 'SER009', 'Disponible', 'Almacen B'),
(10, NULL, 'H-010', 'Taladro Black+Decker', 'SER010', 'Disponible', 'Almacen B'),
(11, NULL, 'H-011', 'Equipo Hilti', 'SER011', 'Disponible', 'Almacen C'),
(12, NULL, 'H-012', 'Equipo Hilti', 'SER012', 'Disponible', 'Almacen C'),
(13, NULL, 'H-013', 'Equipo Milwaukee', 'SER013', 'Disponible', 'Almacen A'),
(14, NULL, 'H-014', 'Equipo Milwaukee', 'SER014', 'Disponible', 'Almacen A'),
(15, NULL, 'H-015', 'Equipo Ryobi', 'SER015', 'Disponible', 'Almacen B'),
(16, NULL, 'H-016', 'Equipo Ryobi', 'SER016', 'Disponible', 'Almacen B'),
(17, NULL, 'H-017', 'Herramienta Truper', 'SER017', 'Disponible', 'Almacen C'),
(18, NULL, 'H-018', 'Herramienta Truper', 'SER018', 'Disponible', 'Almacen C'),
(19, NULL, 'H-019', 'Equipo Ingco', 'SER019', 'Disponible', 'Almacen A'),
(20, NULL, 'H-020', 'Equipo Ingco', 'SER020', 'Disponible', 'Almacen A');


-- =========================
-- LOGIN
-- =========================

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

-- =========================
-- USUARIO
-- =========================

INSERT INTO usuarios (id_persona, id_rol, user_name, contrasena) VALUES
(1, 1, 'admin', '$2b$10$Gaxbj.xyKb09yRQsaM7HMufecCzUfL/X8K/koXzHpj5ws1ktT8rwW'),
(2, 2, 'almacen1', '$2b$10$Gaxbj.xyKb09yRQsaM7HMufecCzUfL/X8K/koXzHpj5ws1ktT8rwW'),
(3, 3, 'trabajador1', '$2b$10$Gaxbj.xyKb09yRQsaM7HMufecCzUfL/X8K/koXzHpj5ws1ktT8rwW');


