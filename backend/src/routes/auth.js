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

  if (rol === "estudiante" && !rutNorm)
    return res.status(400).json({ error: "El RUT es obligatorio" });

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

// Helper: find-or-create conversación directa y enviar mensaje
async function enviarMensajeDirecto(remitenteId, destinatarioId, contenidoMsg) {
  const u1 = Math.min(remitenteId, destinatarioId);
  const u2 = Math.max(remitenteId, destinatarioId);
  const [existing] = await db.query(
    "SELECT id FROM conversaciones_directas WHERE usuario1_id = ? AND usuario2_id = ?",
    [u1, u2]
  );
  let convId;
  if (existing.length > 0) {
    convId = existing[0].id;
  } else {
    const [result] = await db.query(
      "INSERT INTO conversaciones_directas (usuario1_id, usuario2_id) VALUES (?, ?)",
      [u1, u2]
    );
    convId = result.insertId;
  }
  await db.query(
    "INSERT INTO mensajes_directos (conversacion_id, remitente_id, contenido) VALUES (?, ?, ?)",
    [convId, remitenteId, contenidoMsg]
  );
}

// POST /api/auth/solicitar-recuperacion — sin autenticación
// tipo_perfil: "estudiante" | "empresa" | "colegio"
// estudiante: rut, correo_contacto, telefono, mensaje (opcional)
// empresa/colegio: correo, telefono
router.post("/solicitar-recuperacion", async (req, res) => {
  const { tipo_perfil, rut, correo_contacto, correo, telefono, mensaje } = req.body;

  if (!["estudiante", "empresa", "colegio"].includes(tipo_perfil))
    return res.status(400).json({ error: "tipo_perfil inválido" });

  try {
    if (tipo_perfil === "estudiante") {
      if (!rut || !correo_contacto || !telefono)
        return res.status(400).json({ error: "rut, correo_contacto y telefono son requeridos" });

      const [[estudiante]] = await db.query(
        `SELECT u.id, pe.nombre, pe.apellido_paterno, pe.colegio_id
         FROM perfiles_estudiantes pe
         JOIN usuarios u ON u.id = pe.usuario_id
         WHERE pe.rut = ?`,
        [rut.trim()]
      );
      if (!estudiante)
        return res.status(404).json({ error: "No se encontró un estudiante con ese RUT" });

      if (!estudiante.colegio_id)
        return res.status(400).json({ error: "El estudiante no tiene un colegio asignado. Comuníquese directamente con su institución." });

      const contenido = `El estudiante ${estudiante.nombre} ${estudiante.apellido_paterno} (RUT: ${rut.trim()}) solicita recuperar su contraseña.\nCorreo de contacto: ${correo_contacto}\nTeléfono: ${telefono}${mensaje ? `\nMensaje: ${mensaje}` : ""}`;

      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido, referencia_id) VALUES (?, ?, ?, ?, ?)",
        [estudiante.colegio_id, "recuperacion_contrasena", "Solicitud de recuperación de contraseña", contenido, estudiante.id]
      );

      const msgContenido = `Solicitud de recuperación de contraseña\n\nRUT: ${rut.trim()}\nCorreo de contacto: ${correo_contacto}\nTeléfono: ${telefono}${mensaje ? `\n\nMensaje: ${mensaje}` : ""}`;
      await enviarMensajeDirecto(estudiante.id, estudiante.colegio_id, msgContenido);

      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'mensaje', ?, ?)",
        [estudiante.colegio_id, `Nuevo mensaje de ${estudiante.nombre} ${estudiante.apellido_paterno}`, msgContenido.substring(0, 150)]
      );

      return res.json({ mensaje: "Solicitud enviada. Tu colegio recibirá la notificación y se comunicará contigo." });
    }

    if (tipo_perfil === "empresa") {
      if (!correo || !telefono)
        return res.status(400).json({ error: "correo y telefono son requeridos" });

      const [[empresa]] = await db.query(
        `SELECT u.id, pe.nombre_empresa
         FROM usuarios u
         JOIN perfiles_empresas pe ON pe.usuario_id = u.id
         WHERE u.correo = ?`,
        [correo.trim().toLowerCase()]
      );
      if (!empresa)
        return res.status(404).json({ error: "No se encontró una empresa con ese correo" });

      const [[slep]] = await db.query(
        "SELECT id FROM usuarios WHERE rol = 'slep' LIMIT 1"
      );
      if (!slep)
        return res.status(500).json({ error: "No hay administradores SLEP disponibles" });

      const contenido = `La empresa "${empresa.nombre_empresa}" (correo: ${correo.trim()}) solicita recuperar su contraseña.\nTeléfono de contacto: ${telefono}`;

      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido, referencia_id) VALUES (?, ?, ?, ?, ?)",
        [slep.id, "recuperacion_contrasena", "Solicitud de recuperación de contraseña", contenido, empresa.id]
      );

      const msgContenido = `Solicitud de recuperación de contraseña\n\nEmpresa: ${empresa.nombre_empresa}\nCorreo: ${correo.trim()}\nTeléfono: ${telefono}`;
      await enviarMensajeDirecto(empresa.id, slep.id, msgContenido);

      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'mensaje', ?, ?)",
        [slep.id, `Nuevo mensaje de ${empresa.nombre_empresa}`, msgContenido.substring(0, 150)]
      );

      return res.json({ mensaje: "Solicitud enviada. Un administrador SLEP la revisará y se comunicará contigo." });
    }

    if (tipo_perfil === "colegio") {
      if (!correo || !telefono)
        return res.status(400).json({ error: "correo y telefono son requeridos" });

      const [[colegio]] = await db.query(
        `SELECT u.id, pc.nombre_institucion, pc.slep_id
         FROM usuarios u
         JOIN perfiles_colegios pc ON pc.usuario_id = u.id
         WHERE u.correo = ?`,
        [correo.trim().toLowerCase()]
      );
      if (!colegio)
        return res.status(404).json({ error: "No se encontró un colegio con ese correo" });

      if (!colegio.slep_id)
        return res.status(400).json({ error: "El colegio no tiene un SLEP asignado. Comuníquese directamente con su organismo." });

      const contenido = `El colegio "${colegio.nombre_institucion}" (correo: ${correo.trim()}) solicita recuperar su contraseña.\nTeléfono de contacto: ${telefono}`;

      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido, referencia_id) VALUES (?, ?, ?, ?, ?)",
        [colegio.slep_id, "recuperacion_contrasena", "Solicitud de recuperación de contraseña", contenido, colegio.id]
      );

      const msgContenido = `Solicitud de recuperación de contraseña\n\nColegio: ${colegio.nombre_institucion}\nCorreo: ${correo.trim()}\nTeléfono: ${telefono}`;
      await enviarMensajeDirecto(colegio.id, colegio.slep_id, msgContenido);

      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'mensaje', ?, ?)",
        [colegio.slep_id, `Nuevo mensaje de ${colegio.nombre_institucion}`, msgContenido.substring(0, 150)]
      );

      return res.json({ mensaje: "Solicitud enviada. Tu SLEP asignado recibirá la notificación y se comunicará contigo." });
    }
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
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
