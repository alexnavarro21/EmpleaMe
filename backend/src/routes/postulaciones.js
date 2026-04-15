const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// POST /api/postulaciones  — estudiante postula a una vacante
router.post("/", verificarToken, soloRol("estudiante"), async (req, res) => {
  const { vacante_id } = req.body;
  if (!vacante_id) return res.status(400).json({ error: "vacante_id es requerido" });
  try {
    const [[vacante]] = await db.query(
      "SELECT esta_activa FROM vacantes WHERE id = ?",
      [vacante_id]
    );
    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });
    if (!vacante.esta_activa) return res.status(403).json({ error: "Esta vacante ya no está activa" });

    const [result] = await db.query(
      "INSERT INTO postulaciones (vacante_id, estudiante_id) VALUES (?, ?)",
      [vacante_id, req.usuario.id]
    );

    // Notificación a la empresa
    try {
      const [[est]]  = await db.query("SELECT nombre_completo FROM perfiles_estudiantes WHERE usuario_id = ?", [req.usuario.id]);
      const [[vac2]] = await db.query("SELECT empresa_id, titulo FROM vacantes WHERE id = ?", [vacante_id]);
      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'postulacion_nueva', ?, ?)",
        [vac2.empresa_id, `Nueva postulación en "${vac2.titulo}"`, `${est.nombre_completo} ha postulado a tu vacante`]
      );
    } catch (_) {}

    res.status(201).json({ id: result.insertId, mensaje: "Postulación enviada" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Ya postulaste a esta vacante" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/estudiante  — estudiante ve sus propias postulaciones con estado
router.get("/estudiante", verificarToken, soloRol("estudiante"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              v.id AS vacante_id, v.titulo, v.area, v.modalidad,
              pe.nombre_empresa
       FROM postulaciones p
       JOIN vacantes v ON v.id = p.vacante_id
       JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
       WHERE p.estudiante_id = ?
       ORDER BY p.fecha_creacion DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/empresa/aceptados  — empresa ve postulantes aceptados (para completar práctica)
router.get("/empresa/aceptados", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, pe.carrera,
              v.titulo AS vacante_titulo, v.id AS vacante_id, v.tipo AS vacante_tipo
       FROM postulaciones p
       JOIN perfiles_estudiantes pe ON pe.usuario_id = p.estudiante_id
       JOIN vacantes v ON v.id = p.vacante_id
       WHERE v.empresa_id = ? AND p.estado = 'aceptado'
       ORDER BY p.fecha_creacion DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/empresa  — empresa ve postulantes pendientes de todas sus vacantes
router.get("/empresa", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, pe.carrera,
              pe.promedio, pe.calificacion_docente, pe.foto_perfil,
              v.titulo AS vacante_titulo, v.id AS vacante_id
       FROM postulaciones p
       JOIN perfiles_estudiantes pe ON pe.usuario_id = p.estudiante_id
       JOIN vacantes v ON v.id = p.vacante_id
       WHERE v.empresa_id = ? AND p.estado = 'pendiente'
       ORDER BY p.fecha_creacion DESC
       LIMIT 20`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/vacante/:id  — empresa ve postulantes de una vacante específica
router.get("/vacante/:id", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, pe.carrera,
              pe.promedio, pe.calificacion_docente, pe.biografia
       FROM postulaciones p
       JOIN perfiles_estudiantes pe ON pe.usuario_id = p.estudiante_id
       WHERE p.vacante_id = ?
       ORDER BY p.fecha_creacion DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/postulaciones/:id/estado  — empresa actualiza estado de una postulación
router.put("/:id/estado", verificarToken, soloRol("empresa"), async (req, res) => {
  const { estado } = req.body;
  if (!["pendiente", "aceptado", "rechazado"].includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
    const [result] = await db.query(
      `UPDATE postulaciones p
       JOIN vacantes v ON v.id = p.vacante_id
       SET p.estado = ?
       WHERE p.id = ? AND v.empresa_id = ?`,
      [estado, req.params.id, req.usuario.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });

    // Notificación al estudiante y al admin
    try {
      const [[post]] = await db.query(
        `SELECT p.estudiante_id, v.titulo, pe.nombre_completo AS estudiante_nombre
         FROM postulaciones p
         JOIN vacantes v ON v.id = p.vacante_id
         JOIN perfiles_estudiantes pe ON pe.usuario_id = p.estudiante_id
         WHERE p.id = ?`,
        [req.params.id]
      );
      if (post) {
        const tipo   = estado === "aceptado" ? "postulacion_aceptada" : "postulacion_rechazada";
        const titulo = estado === "aceptado"
          ? `¡Tu postulación fue aceptada!`
          : `Tu postulación no fue seleccionada`;
        await db.query(
          "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, ?, ?, ?)",
          [post.estudiante_id, tipo, titulo, `Vacante: "${post.titulo}"`]
        );
        // Notificación al centro (admin)
        const [[centro]] = await db.query("SELECT id FROM usuarios WHERE rol = 'centro' LIMIT 1");
        if (centro) {
          const tituloAdmin = estado === "aceptado"
            ? `Alumno aceptado en vacante`
            : `Alumno no seleccionado en vacante`;
          const contenidoAdmin = `${post.estudiante_nombre} ${estado === "aceptado" ? "fue aceptado/a" : "no fue seleccionado/a"} en "${post.titulo}"`;
          await db.query(
            "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, ?, ?, ?)",
            [centro.id, tipo, tituloAdmin, contenidoAdmin]
          );
        }
      }
    } catch (_) {}

    res.json({ mensaje: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/postulaciones/:id/completar  — empresa marca práctica como completada
// Solo aplica a postulaciones en estado 'aceptado'
// Crea automáticamente un registro en historial_laboral del estudiante
router.put("/:id/completar", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    // Verificar que la postulación pertenece a una vacante de esta empresa y está aceptada
    const [[post]] = await db.query(
      `SELECT p.id, p.estudiante_id, p.estado,
              v.titulo, v.tipo,
              pe.nombre_empresa
       FROM postulaciones p
       JOIN vacantes v ON v.id = p.vacante_id
       JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
       WHERE p.id = ? AND v.empresa_id = ?`,
      [req.params.id, req.usuario.id]
    );
    if (!post)
      return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
    if (post.estado !== "aceptado")
      return res.status(400).json({ error: "Solo se pueden completar postulaciones aceptadas" });

    // Marcar como completada
    await db.query(
      "UPDATE postulaciones SET estado = 'completado', fecha_completada = NOW() WHERE id = ?",
      [req.params.id]
    );

    // Crear entrada en historial laboral
    await db.query(
      `INSERT INTO historial_laboral
         (estudiante_id, empresa_nombre, cargo, fecha_fin, tipo, postulacion_id)
       VALUES (?, ?, ?, CURDATE(), 'practica_completada', ?)`,
      [post.estudiante_id, post.nombre_empresa, post.titulo, post.id]
    );

    // Notificación al estudiante y al admin
    try {
      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'practica_completada', ?, ?)",
        [post.estudiante_id, "¡Práctica completada!", `Tu práctica en "${post.titulo}" ha sido registrada en tu perfil de EmpleaMe`]
      );
      const [[centro]] = await db.query("SELECT id FROM usuarios WHERE rol = 'centro' LIMIT 1");
      if (centro) {
        await db.query(
          "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'practica_completada', ?, ?)",
          [centro.id, `Práctica completada`, `${post.nombre_empresa} registró la práctica de un estudiante en "${post.titulo}"`]
        );
      }
    } catch (_) {}

    res.json({ mensaje: "Práctica marcada como completada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
