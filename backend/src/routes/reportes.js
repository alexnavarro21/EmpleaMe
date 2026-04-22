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

// GET /api/reportes — admin ve todos los reportes pendientes
router.get("/", verificarToken, soloRol("centro"), async (req, res) => {
  const { estado = "pendiente" } = req.query;
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
       ORDER BY r.creado_en DESC`,
      [estado]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/reportes/:id/contenido — admin elimina el contenido referenciado y resuelve el reporte
router.delete("/:id/contenido", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [req.params.id]);
    if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" });

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
router.put("/:id", verificarToken, soloRol("centro"), async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ["resuelto", "descartado"];
  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
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
