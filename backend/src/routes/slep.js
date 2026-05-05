const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

const auth = [verificarToken, soloRol("slep")];

// GET /api/slep/info — datos básicos del SLEP, accesibles a colegios y al propio SLEP
// Para colegios: devuelve su SLEP asignado (por slep_id); para slep: devuelve su propio perfil
router.get("/info", verificarToken, soloRol("colegio", "slep"), async (req, res) => {
  try {
    if (req.usuario.rol === "slep") {
      const [[slep]] = await db.query(
        `SELECT u.id, ps.nombre_organismo, ps.foto_perfil
         FROM usuarios u
         LEFT JOIN perfiles_slep ps ON ps.usuario_id = u.id
         WHERE u.id = ?`,
        [req.usuario.id]
      );
      return res.json(slep || { id: null, nombre_organismo: "SLEP" });
    }
    // Para colegio: buscar su slep_id
    const [[colegio]] = await db.query(
      "SELECT slep_id FROM perfiles_colegios WHERE usuario_id = ?",
      [req.usuario.id]
    );
    if (!colegio?.slep_id) return res.json({ id: null, nombre_organismo: "SLEP" });
    const [[slep]] = await db.query(
      `SELECT u.id, ps.nombre_organismo, ps.foto_perfil
       FROM usuarios u
       LEFT JOIN perfiles_slep ps ON ps.usuario_id = u.id
       WHERE u.id = ?`,
      [colegio.slep_id]
    );
    res.json(slep || { id: null, nombre_organismo: "SLEP" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/slep/perfil
router.get("/perfil", ...auth, async (req, res) => {
  const id = req.usuario.id;
  try {
    let [[perfil]] = await db.query("SELECT * FROM perfiles_slep WHERE usuario_id = ?", [id]);
    if (!perfil) {
      await db.query("INSERT INTO perfiles_slep (usuario_id, nombre_organismo) VALUES (?, 'SLEP')", [id]);
      [[perfil]] = await db.query("SELECT * FROM perfiles_slep WHERE usuario_id = ?", [id]);
    }
    res.json(perfil);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/slep/perfil
router.put("/perfil", ...auth, async (req, res) => {
  const id = req.usuario.id;
  const { nombre_organismo, telefono_contacto, descripcion, region } = req.body;
  try {
    await db.query(
      `INSERT INTO perfiles_slep (usuario_id, nombre_organismo, telefono_contacto, descripcion, region)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nombre_organismo  = VALUES(nombre_organismo),
         telefono_contacto = VALUES(telefono_contacto),
         descripcion       = VALUES(descripcion),
         region            = VALUES(region)`,
      [id, nombre_organismo || "SLEP", telefono_contacto || null, descripcion || null, region || null]
    );
    res.json({ mensaje: "Perfil actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/slep/stats — solo estadísticas de los colegios y estudiantes propios
router.get("/stats", ...auth, async (req, res) => {
  const slepId = req.usuario.id;
  try {
    const [[{ total_colegios }]] = await db.query(
      "SELECT COUNT(*) AS total_colegios FROM perfiles_colegios WHERE slep_id = ?",
      [slepId]
    );
    const [[{ total_estudiantes }]] = await db.query(
      `SELECT COUNT(*) AS total_estudiantes
       FROM perfiles_estudiantes pe
       JOIN perfiles_colegios pc ON pc.usuario_id = pe.colegio_id
       WHERE pc.slep_id = ?`,
      [slepId]
    );
    const [[{ total_empresas }]]    = await db.query("SELECT COUNT(*) AS total_empresas FROM perfiles_empresas");
    const [[{ total_vacantes }]]    = await db.query("SELECT COUNT(*) AS total_vacantes FROM vacantes WHERE esta_activa = TRUE");
    res.json({ total_empresas, total_colegios, total_estudiantes, total_vacantes });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Empresas ──────────────────────────────────────────────────────────────────

// POST /api/slep/empresas — crear cuenta de empresa
router.post("/empresas", ...auth, async (req, res) => {
  const { nombre_empresa, correo, contrasena, region, comuna, telefono_contacto, descripcion } = req.body;
  if (!nombre_empresa || !correo || !contrasena)
    return res.status(400).json({ error: "nombre_empresa, correo y contrasena son requeridos" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await conn.query(
      "INSERT INTO usuarios (correo, contrasena_hash, rol, creado_por) VALUES (?, ?, 'empresa', ?)",
      [correo.trim().toLowerCase(), hash, req.usuario.id]
    );
    const usuarioId = result.insertId;
    await conn.query(
      `INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion, region, comuna)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, nombre_empresa, telefono_contacto || null, descripcion || null, region || null, comuna || null]
    );
    await conn.commit();
    res.status(201).json({ id: usuarioId, mensaje: "Empresa creada correctamente" });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/slep/empresas
router.get("/empresas", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pe.usuario_id, pe.nombre_empresa, pe.descripcion, pe.telefono_contacto,
              pe.region, pe.comuna, pe.foto_perfil, u.correo, u.fecha_creacion,
              u.creado_por,
              COUNT(v.id) AS total_vacantes_activas
       FROM perfiles_empresas pe
       JOIN usuarios u ON u.id = pe.usuario_id
       LEFT JOIN vacantes v ON v.empresa_id = pe.usuario_id AND v.esta_activa = TRUE
       GROUP BY pe.usuario_id
       ORDER BY pe.nombre_empresa`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/slep/empresas/:id — editar perfil de empresa
router.put("/empresas/:id", ...auth, async (req, res) => {
  const { nombre_empresa, telefono_contacto, descripcion, region, comuna, contrasena } = req.body;
  const id = parseInt(req.params.id);
  if (!nombre_empresa)
    return res.status(400).json({ error: "nombre_empresa es requerido" });
  try {
    const [[empresa]] = await db.query(
      "SELECT 1 FROM perfiles_empresas WHERE usuario_id = ?", [id]
    );
    if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });
    await db.query(
      `UPDATE perfiles_empresas
       SET nombre_empresa=?, telefono_contacto=?, descripcion=?, region=?, comuna=?
       WHERE usuario_id=?`,
      [nombre_empresa, telefono_contacto || null, descripcion || null, region || null, comuna || null, id]
    );
    if (contrasena && contrasena.length >= 6) {
      const hash = await bcrypt.hash(contrasena, 10);
      await db.query("UPDATE usuarios SET contrasena_hash=? WHERE id=?", [hash, id]);
    }
    res.json({ mensaje: "Empresa actualizada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/slep/empresas/:id
router.delete("/empresas/:id", ...auth, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [[usuario]] = await db.query(
      "SELECT id, rol FROM usuarios WHERE id = ? AND rol = 'empresa'", [id]
    );
    if (!usuario) return res.status(404).json({ error: "Empresa no encontrada" });
    await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ mensaje: "Empresa eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Colegios ──────────────────────────────────────────────────────────────────

// POST /api/slep/colegios — crear cuenta de colegio asignada a este SLEP
router.post("/colegios", ...auth, async (req, res) => {
  const { nombre_institucion, correo, contrasena, region, comuna, telefono_contacto, descripcion } = req.body;
  if (!nombre_institucion || !correo || !contrasena)
    return res.status(400).json({ error: "nombre_institucion, correo y contrasena son requeridos" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await conn.query(
      "INSERT INTO usuarios (correo, contrasena_hash, rol, creado_por) VALUES (?, ?, 'colegio', ?)",
      [correo.trim().toLowerCase(), hash, req.usuario.id]
    );
    const usuarioId = result.insertId;
    await conn.query(
      `INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, req.usuario.id, nombre_institucion, telefono_contacto || null, descripcion || null, region || null, comuna || null]
    );
    await conn.commit();
    res.status(201).json({ id: usuarioId, mensaje: "Colegio creado correctamente" });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/slep/colegios — solo colegios de este SLEP
router.get("/colegios", ...auth, async (req, res) => {
  const slepId = req.usuario.id;
  try {
    const [rows] = await db.query(
      `SELECT pc.usuario_id, pc.nombre_institucion, pc.descripcion, pc.telefono_contacto,
              pc.region, pc.comuna, pc.foto_perfil, u.correo, u.fecha_creacion,
              u.creado_por,
              COUNT(pe.usuario_id) AS total_estudiantes
       FROM perfiles_colegios pc
       JOIN usuarios u ON u.id = pc.usuario_id
       LEFT JOIN perfiles_estudiantes pe ON pe.colegio_id = pc.usuario_id
       WHERE pc.slep_id = ?
       GROUP BY pc.usuario_id
       ORDER BY pc.nombre_institucion`,
      [slepId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/slep/colegios/:id — editar colegio (solo si pertenece a este SLEP)
router.put("/colegios/:id", ...auth, async (req, res) => {
  const { nombre_institucion, telefono_contacto, descripcion, region, comuna, contrasena } = req.body;
  const id = parseInt(req.params.id);
  if (!nombre_institucion)
    return res.status(400).json({ error: "nombre_institucion es requerido" });
  try {
    const [[colegio]] = await db.query(
      "SELECT 1 FROM perfiles_colegios WHERE usuario_id = ? AND slep_id = ?",
      [id, req.usuario.id]
    );
    if (!colegio) return res.status(404).json({ error: "Colegio no encontrado" });
    await db.query(
      `UPDATE perfiles_colegios
       SET nombre_institucion=?, telefono_contacto=?, descripcion=?, region=?, comuna=?
       WHERE usuario_id=?`,
      [nombre_institucion, telefono_contacto || null, descripcion || null, region || null, comuna || null, id]
    );
    if (contrasena && contrasena.length >= 6) {
      const hash = await bcrypt.hash(contrasena, 10);
      await db.query("UPDATE usuarios SET contrasena_hash=? WHERE id=?", [hash, id]);
    }
    res.json({ mensaje: "Colegio actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Reportes ──────────────────────────────────────────────────────────────────

// Verifica que el reporte esté dentro del scope del SLEP actual
async function esReporteDeSlep(reporteId, slepId) {
  const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [reporteId]);
  if (!reporte) return false;

  // Usuarios gestionados por este SLEP: colegios del SLEP + estudiantes de esos colegios
  const colegiosDelSlep = `
    SELECT usuario_id FROM perfiles_colegios WHERE slep_id = ?
  `;
  const estudiantesDelSlep = `
    SELECT pe.usuario_id FROM perfiles_estudiantes pe
    JOIN perfiles_colegios pc ON pc.usuario_id = pe.colegio_id
    WHERE pc.slep_id = ?
  `;

  if (reporte.tipo === "publicacion") {
    const [[row]] = await db.query(
      `SELECT 1 FROM publicaciones p
       WHERE p.id = ?
         AND p.autor_id IN (${colegiosDelSlep} UNION ${estudiantesDelSlep})`,
      [reporte.referencia_id, slepId, slepId]
    );
    return !!row;
  }
  if (reporte.tipo === "comentario") {
    const [[row]] = await db.query(
      `SELECT 1 FROM comentarios c
       WHERE c.id = ?
         AND c.autor_id IN (${colegiosDelSlep} UNION ${estudiantesDelSlep})`,
      [reporte.referencia_id, slepId, slepId]
    );
    return !!row;
  }
  if (reporte.tipo === "perfil") {
    const [[row]] = await db.query(
      `SELECT 1 FROM usuarios
       WHERE id = ?
         AND id IN (${colegiosDelSlep} UNION ${estudiantesDelSlep})`,
      [reporte.referencia_id, slepId, slepId]
    );
    return !!row;
  }
  return false;
}

// GET /api/slep/reportes?estado=pendiente
router.get("/reportes", ...auth, async (req, res) => {
  const { estado = "pendiente" } = req.query;
  const slepId = req.usuario.id;
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.tipo, r.referencia_id, r.motivo, r.descripcion, r.estado, r.creado_en,
              COALESCE(pe_rep.nombre_completo, emp_rep.nombre_empresa, 'Usuario') AS reportado_por_nombre,
              CASE r.tipo
                WHEN 'publicacion' THEN SUBSTRING(pub.contenido, 1, 250)
                WHEN 'comentario'  THEN SUBSTRING(com.contenido, 1, 250)
                WHEN 'perfil'      THEN COALESCE(pc.nombre_institucion, emp_ref.nombre_empresa)
              END AS contenido_preview,
              com.publicacion_id AS comentario_pub_id,
              u_ref.rol AS referencia_rol
       FROM reportes r
       JOIN usuarios u ON u.id = r.reportado_por
       LEFT JOIN perfiles_estudiantes pe_rep  ON pe_rep.usuario_id  = u.id
       LEFT JOIN perfiles_empresas    emp_rep ON emp_rep.usuario_id = u.id
       LEFT JOIN publicaciones pub ON pub.id = r.referencia_id AND r.tipo = 'publicacion'
       LEFT JOIN comentarios   com ON com.id = r.referencia_id AND r.tipo = 'comentario'
       LEFT JOIN usuarios      u_ref   ON u_ref.id = r.referencia_id AND r.tipo = 'perfil'
       LEFT JOIN perfiles_colegios  pc      ON pc.usuario_id      = u_ref.id
       LEFT JOIN perfiles_empresas  emp_ref ON emp_ref.usuario_id = u_ref.id
       WHERE r.estado = ?
         AND (
           -- Publicaciones de colegios del SLEP o estudiantes de esos colegios
           (r.tipo = 'publicacion' AND r.referencia_id IN (
             SELECT p.id FROM publicaciones p
             WHERE p.autor_id IN (
               SELECT usuario_id FROM perfiles_colegios WHERE slep_id = ?
               UNION
               SELECT pe2.usuario_id FROM perfiles_estudiantes pe2
               JOIN perfiles_colegios pc2 ON pc2.usuario_id = pe2.colegio_id
               WHERE pc2.slep_id = ?
             )
           ))
           OR
           -- Comentarios de colegios del SLEP o estudiantes de esos colegios
           (r.tipo = 'comentario' AND r.referencia_id IN (
             SELECT c.id FROM comentarios c
             WHERE c.autor_id IN (
               SELECT usuario_id FROM perfiles_colegios WHERE slep_id = ?
               UNION
               SELECT pe2.usuario_id FROM perfiles_estudiantes pe2
               JOIN perfiles_colegios pc2 ON pc2.usuario_id = pe2.colegio_id
               WHERE pc2.slep_id = ?
             )
           ))
           OR
           -- Perfiles de colegios del SLEP o estudiantes de esos colegios
           (r.tipo = 'perfil' AND r.referencia_id IN (
             SELECT usuario_id FROM perfiles_colegios WHERE slep_id = ?
             UNION
             SELECT pe2.usuario_id FROM perfiles_estudiantes pe2
             JOIN perfiles_colegios pc2 ON pc2.usuario_id = pe2.colegio_id
             WHERE pc2.slep_id = ?
           ))
         )
       ORDER BY r.creado_en DESC`,
      [estado, slepId, slepId, slepId, slepId, slepId, slepId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/slep/reportes/:id/contenido
router.delete("/reportes/:id/contenido", ...auth, async (req, res) => {
  try {
    const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [req.params.id]);
    if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" });
    if (!await esReporteDeSlep(req.params.id, req.usuario.id))
      return res.status(403).json({ error: "Este reporte no pertenece a tu scope" });

    if (reporte.tipo === "publicacion") {
      await db.query("DELETE FROM publicaciones WHERE id = ?", [reporte.referencia_id]);
    } else if (reporte.tipo === "comentario") {
      await db.query("DELETE FROM comentarios WHERE id = ?", [reporte.referencia_id]);
    }

    await db.query(
      "UPDATE reportes SET estado = 'resuelto', revisado_en = NOW(), revisado_por = ? WHERE id = ?",
      [req.usuario.id, req.params.id]
    );
    res.json({ mensaje: "Contenido eliminado y reporte resuelto" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/slep/reportes/:id
router.put("/reportes/:id", ...auth, async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ["resuelto", "descartado"];
  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
    if (!await esReporteDeSlep(req.params.id, req.usuario.id))
      return res.status(403).json({ error: "Este reporte no pertenece a tu scope" });

    await db.query(
      "UPDATE reportes SET estado = ?, revisado_en = NOW(), revisado_por = ? WHERE id = ?",
      [estado, req.usuario.id, req.params.id]
    );
    res.json({ mensaje: "Reporte actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
