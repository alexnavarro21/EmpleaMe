const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena)
    return res.status(400).json({ error: "Correo y contraseña requeridos" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const usuario = rows[0];
    const hash = String(usuario.contrasena_hash);
    const valido = await bcrypt.compare(contrasena, hash);

    if (!valido)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, usuario: { id: usuario.id, correo: usuario.correo, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const {
    correo, contrasena, rol,
    // estudiante
    nombre_completo, carrera, semestre, telefono,
    // empresa
    nombre_empresa, telefono_contacto,
  } = req.body;

  if (!correo || !contrasena || !rol)
    return res.status(400).json({ error: "Correo, contraseña y rol son requeridos" });

  if (!["estudiante", "empresa"].includes(rol))
    return res.status(400).json({ error: "Rol inválido" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await conn.query(
      "INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES (?, ?, ?)",
      [correo, hash, rol]
    );
    const usuarioId = result.insertId;

    if (rol === "estudiante") {
      if (!nombre_completo || !carrera)
        return res.status(400).json({ error: "nombre_completo y carrera son requeridos para estudiante" });
      await conn.query(
        "INSERT INTO perfiles_estudiantes (usuario_id, nombre_completo, carrera, semestre, telefono) VALUES (?, ?, ?, ?, ?)",
        [usuarioId, nombre_completo, carrera, semestre || null, telefono || null]
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
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
