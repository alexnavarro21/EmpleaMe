const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

const auth = [verificarToken, soloRol("slep")];

// GET /api/slep/stats
router.get("/stats", ...auth, async (req, res) => {
  try {
    const [[{ total_empresas }]]    = await db.query("SELECT COUNT(*) AS total_empresas FROM perfiles_empresas");
    const [[{ total_colegios }]]    = await db.query("SELECT COUNT(*) AS total_colegios FROM perfiles_colegios");
    const [[{ total_estudiantes }]] = await db.query("SELECT COUNT(*) AS total_estudiantes FROM perfiles_estudiantes");
    const [[{ total_vacantes }]]    = await db.query("SELECT COUNT(*) AS total_vacantes FROM vacantes WHERE esta_activa = TRUE");
    res.json({ total_empresas, total_colegios, total_estudiantes, total_vacantes });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/slep/empresas
router.get("/empresas", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pe.usuario_id, pe.nombre_empresa, pe.descripcion, pe.telefono_contacto,
              pe.region, pe.comuna, pe.foto_perfil, u.correo, u.fecha_creacion,
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

// GET /api/slep/colegios
router.get("/colegios", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pc.usuario_id, pc.nombre_institucion, pc.descripcion, pc.telefono_contacto,
              pc.region, pc.comuna, pc.foto_perfil, u.correo, u.fecha_creacion,
              COUNT(pe.usuario_id) AS total_estudiantes
       FROM perfiles_colegios pc
       JOIN usuarios u ON u.id = pc.usuario_id
       LEFT JOIN perfiles_estudiantes pe ON pe.colegio_id = pc.usuario_id
       GROUP BY pc.usuario_id
       ORDER BY pc.nombre_institucion`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// Verifica que el reporte sea sobre contenido de empresa o colegio
async function esSlepReporte(reporteId) {
  const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [reporteId]);
  if (!reporte) return false;
  if (reporte.tipo === "publicacion") {
    const [[row]] = await db.query(
      "SELECT 1 FROM publicaciones p JOIN usuarios u ON u.id = p.autor_id WHERE p.id = ? AND u.rol IN ('empresa','colegio')",
      [reporte.referencia_id]
    );
    return !!row;
  }
  if (reporte.tipo === "comentario") {
    const [[row]] = await db.query(
      "SELECT 1 FROM comentarios c JOIN usuarios u ON u.id = c.autor_id WHERE c.id = ? AND u.rol IN ('empresa','colegio')",
      [reporte.referencia_id]
    );
    return !!row;
  }
  if (reporte.tipo === "perfil") {
    const [[row]] = await db.query(
      "SELECT 1 FROM usuarios WHERE id = ? AND rol IN ('empresa','colegio')",
      [reporte.referencia_id]
    );
    return !!row;
  }
  return false;
}

// GET /api/slep/reportes?estado=pendiente
router.get("/reportes", ...auth, async (req, res) => {
  const { estado = "pendiente" } = req.query;
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
           (r.tipo = 'publicacion' AND r.referencia_id IN (
             SELECT p.id FROM publicaciones p
             JOIN usuarios u2 ON u2.id = p.autor_id
             WHERE u2.rol IN ('empresa','colegio')
           ))
           OR (r.tipo = 'comentario' AND r.referencia_id IN (
             SELECT c.id FROM comentarios c
             JOIN usuarios u2 ON u2.id = c.autor_id
             WHERE u2.rol IN ('empresa','colegio')
           ))
           OR (r.tipo = 'perfil' AND r.referencia_id IN (
             SELECT u2.id FROM usuarios u2
             WHERE u2.rol IN ('empresa','colegio')
           ))
         )
       ORDER BY r.creado_en DESC`,
      [estado]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/slep/reportes/:id/contenido — SLEP elimina la publicación/comentario y resuelve el reporte
router.delete("/reportes/:id/contenido", ...auth, async (req, res) => {
  try {
    const [[reporte]] = await db.query("SELECT tipo, referencia_id FROM reportes WHERE id = ?", [req.params.id]);
    if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" });
    if (!await esSlepReporte(req.params.id))
      return res.status(403).json({ error: "Este reporte no corresponde a contenido de empresa o colegio" });

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

// PUT /api/slep/reportes/:id — SLEP actualiza estado del reporte
router.put("/reportes/:id", ...auth, async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ["resuelto", "descartado"];
  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
    if (!await esSlepReporte(req.params.id))
      return res.status(403).json({ error: "Este reporte no corresponde a contenido de empresa o colegio" });

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
