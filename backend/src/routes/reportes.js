const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// POST /api/reportes — cualquier usuario autenticado reporta contenido
router.post("/", verificarToken, async (req, res) => {
  const { tipo, referencia_id, motivo, descripcion } = req.body;
  const tiposValidos = ["publicacion", "comentario", "perfil"];
  const motivosValidos = ["spam", "contenido_inapropiado", "acoso", "informacion_falsa", "otro"];

  if (!tiposValidos.includes(tipo))
    return res.status(400).json({ error: "Tipo inválido" });
  if (!motivosValidos.includes(motivo))
    return res.status(400).json({ error: "Motivo inválido" });
  if (!referencia_id)
    return res.status(400).json({ error: "referencia_id es requerido" });

  try {
    await db.query(
      "INSERT INTO reportes (reportado_por, tipo, referencia_id, motivo, descripcion) VALUES (?, ?, ?, ?, ?)",
      [req.usuario.id, tipo, referencia_id, motivo, descripcion?.trim() || null]
    );
    res.status(201).json({ mensaje: "Reporte enviado. El equipo lo revisará pronto." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Ya reportaste este contenido" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/reportes — admin ve reportes sobre contenido de estudiantes de su institución
router.get("/", verificarToken, soloRol("colegio"), async (req, res) => {
  const { estado = "pendiente" } = req.query;
  const colegioId = req.usuario.id;
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.tipo, r.referencia_id, r.motivo, r.descripcion, r.estado, r.creado_en,
              COALESCE(pe_rep.nombre_completo, emp_rep.nombre_empresa, 'Usuario') AS reportado_por_nombre,
              CASE r.tipo
                WHEN 'publicacion' THEN SUBSTRING(pub.contenido, 1, 250)
                WHEN 'comentario'  THEN SUBSTRING(com.contenido, 1, 250)
                WHEN 'perfil'      THEN COALESCE(pe_ref.nombre_completo, emp_ref.nombre_empresa)
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
       LEFT JOIN perfiles_estudiantes pe_ref  ON pe_ref.usuario_id  = u_ref.id
       LEFT JOIN perfiles_empresas    emp_ref ON emp_ref.usuario_id = u_ref.id
       WHERE r.estado = ?
         AND (
           (r.tipo = 'publicacion' AND r.referencia_id IN (
             SELECT p.id FROM publicaciones p
             JOIN perfiles_estudiantes pe ON pe.usuario_id = p.autor_id
             WHERE pe.colegio_id = ?
           ))
           OR (r.tipo = 'comentario' AND r.referencia_id IN (
             SELECT c.id FROM comentarios c
             JOIN perfiles_estudiantes pe ON pe.usuario_id = c.autor_id
             WHERE pe.colegio_id = ?
           ))
           OR (r.tipo = 'perfil' AND r.referencia_id IN (
             SELECT pe.usuario_id FROM perfiles_estudiantes pe
             WHERE pe.colegio_id = ?
           ))
         )
       ORDER BY r.creado_en DESC`,
      [estado, colegioId, colegioId, colegioId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// Verifica que el reporte es sobre contenido de un estudiante del colegio
async function esMiReporte(reporteId, colegioId) {
  const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [reporteId]);
  if (!reporte) return false;
  if (reporte.tipo === "publicacion") {
    const [[row]] = await db.query(
      "SELECT 1 FROM publicaciones p JOIN perfiles_estudiantes pe ON pe.usuario_id = p.autor_id WHERE p.id = ? AND pe.colegio_id = ?",
      [reporte.referencia_id, colegioId]
    );
    return !!row;
  }
  if (reporte.tipo === "comentario") {
    const [[row]] = await db.query(
      "SELECT 1 FROM comentarios c JOIN perfiles_estudiantes pe ON pe.usuario_id = c.autor_id WHERE c.id = ? AND pe.colegio_id = ?",
      [reporte.referencia_id, colegioId]
    );
    return !!row;
  }
  if (reporte.tipo === "perfil") {
    const [[row]] = await db.query(
      "SELECT 1 FROM perfiles_estudiantes WHERE usuario_id = ? AND colegio_id = ?",
      [reporte.referencia_id, colegioId]
    );
    return !!row;
  }
  return false;
}

// DELETE /api/reportes/:id/contenido — admin elimina el contenido referenciado y resuelve el reporte
router.delete("/:id/contenido", verificarToken, soloRol("colegio"), async (req, res) => {
  try {
    const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [req.params.id]);
    if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" });

    if (!await esMiReporte(req.params.id, req.usuario.id))
      return res.status(403).json({ error: "No tienes acceso a este reporte" });

    if (reporte.tipo === "publicacion") {
      await db.query("DELETE FROM publicaciones WHERE id = ?", [reporte.referencia_id]);
    } else if (reporte.tipo === "comentario") {
      await db.query("DELETE FROM comentarios WHERE id = ?", [reporte.referencia_id]);
    }
    // tipo === "perfil": no eliminamos perfiles automáticamente por seguridad

    await db.query(
      "UPDATE reportes SET estado = 'resuelto', revisado_en = NOW(), revisado_por = ? WHERE id = ?",
      [req.usuario.id, req.params.id]
    );
    res.json({ mensaje: "Contenido eliminado y reporte resuelto" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/reportes/:id — admin actualiza estado del reporte
router.put("/:id", verificarToken, soloRol("colegio"), async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ["resuelto", "descartado"];
  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
    if (!await esMiReporte(req.params.id, req.usuario.id))
      return res.status(403).json({ error: "No tienes acceso a este reporte" });

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
