const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// GET /api/auth/colegios — lista pública para el selector de registro
router.get("/colegios", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT usuario_id AS id, nombre_institucion FROM perfiles_colegios ORDER BY nombre_institucion"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/auth/login
// body: { identifier (correo o RUT), contrasena }
router.post("/login", async (req, res) => {
  const { identifier, contrasena } = req.body;
  if (!identifier || !contrasena)
    return res.status(400).json({ error: "Identificador y contraseña requeridos" });

  try {
    const id = identifier.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT u.* FROM usuarios u
       LEFT JOIN perfiles_estudiantes pe ON pe.usuario_id = u.id
       WHERE u.correo = ? OR u.rut = ? OR pe.rut = ?`,
      [id, id, id]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const usuario = rows[0];
    const hash = String(usuario.contrasena_hash);

    let valido = false;
    if (hash.startsWith("$2")) {
      valido = await bcrypt.compare(contrasena, hash);
    } else {
      valido = contrasena === hash;
    }

    if (!valido)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // identifier visible para el frontend: preferir correo, si no mostrar RUT
    const identificador = usuario.correo || usuario.rut;

    const token = jwt.sign(
      { id: usuario.id, correo: identificador, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, usuario: { id: usuario.id, correo: identificador, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/auth/register
// Estudiante: requiere nombre_completo, carrera y (correo O rut)
// Empresa:    requiere nombre_empresa y correo
router.post("/register", async (req, res) => {
  const {
    correo, rut, contrasena, rol,
    // estudiante
    nombre, apellido_paterno, apellido_materno, carrera, nivel, telefono, colegio_id,
    // empresa
    nombre_empresa, telefono_contacto,
  } = req.body;

  if (!contrasena || !rol)
    return res.status(400).json({ error: "Contraseña y rol son requeridos" });

  if (!["estudiante", "empresa"].includes(rol))
    return res.status(400).json({ error: "Rol inválido" });

  const correoNorm = correo ? correo.trim().toLowerCase() : null;
  const rutNorm    = rut    ? rut.trim()                  : null;

  if (rol === "empresa" && !correoNorm)
    return res.status(400).json({ error: "Las empresas deben registrarse con correo" });

  if (rol === "estudiante" && !correoNorm && !rutNorm)
    return res.status(400).json({ error: "Debes ingresar correo o RUT" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await conn.query(
      "INSERT INTO usuarios (correo, rut, contrasena_hash, rol) VALUES (?, ?, ?, ?)",
      [correoNorm, rutNorm, hash, rol]
    );
    const usuarioId = result.insertId;

    if (rol === "estudiante") {
      if (!nombre || !apellido_paterno || !carrera)
        return res.status(400).json({ error: "nombre, apellido_paterno y carrera son requeridos para estudiante" });
      const [[carreraRow]] = await conn.query(
        "SELECT id FROM carreras WHERE nombre = ?", [carrera]
      );
      if (!carreraRow)
        return res.status(400).json({ error: "Carrera no válida" });
      const colegioValido = colegio_id ? (await conn.query(
        "SELECT usuario_id FROM perfiles_colegios WHERE usuario_id = ?", [colegio_id]
      ))[0][0] : null;
      await conn.query(
        `INSERT INTO perfiles_estudiantes
           (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, telefono, colegio_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [usuarioId, nombre.trim(), apellido_paterno.trim(), apellido_materno?.trim() || null, rutNorm, carreraRow.id, nivel || null, telefono || null, colegioValido ? colegio_id : null]
      );
    } else if (rol === "empresa") {
      if (!nombre_empresa)
        return res.status(400).json({ error: "nombre_empresa es requerido para empresa" });
      await conn.query(
        "INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto) VALUES (?, ?, ?)",
        [usuarioId, nombre_empresa, telefono_contacto || null]
      );
    }

    await conn.commit();
    res.status(201).json({ mensaje: "Usuario creado correctamente", id: usuarioId });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      const campo = err.message.includes("correo") ? "correo" : "RUT";
      return res.status(409).json({ error: `El ${campo} ya está registrado` });
    }
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/auth/cambiar-contrasena — cualquier usuario autenticado
router.put("/cambiar-contrasena", require("../middleware/auth").verificarToken, async (req, res) => {
  const { contrasena_actual, contrasena_nueva } = req.body;
  if (!contrasena_actual || !contrasena_nueva)
    return res.status(400).json({ error: "contrasena_actual y contrasena_nueva son requeridos" });
  if (contrasena_nueva.length < 6)
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });

  try {
    const [[usuario]] = await db.query(
      "SELECT contrasena_hash FROM usuarios WHERE id = ?", [req.usuario.id]
    );
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const valido = await bcrypt.compare(contrasena_actual, String(usuario.contrasena_hash));
    if (!valido) return res.status(401).json({ error: "La contraseña actual es incorrecta" });

    const hash = await bcrypt.hash(contrasena_nueva, 10);
    await db.query("UPDATE usuarios SET contrasena_hash = ? WHERE id = ?", [hash, req.usuario.id]);
    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
