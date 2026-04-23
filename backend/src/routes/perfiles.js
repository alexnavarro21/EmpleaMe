const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");
const upload = require("../middleware/multerConfig");

// GET /api/perfiles/estudiante/:id
router.get("/estudiante/:id", verificarToken, async (req, res) => {
  try {
    const [perfil] = await db.query(
      `SELECT pe.*, c.nombre AS carrera, u.correo,
              pc.nombre_institucion AS colegio_nombre
       FROM perfiles_estudiantes pe
       JOIN usuarios u ON u.id = pe.usuario_id
       LEFT JOIN carreras c ON c.id = pe.carrera_id
       LEFT JOIN perfiles_colegios pc ON pc.usuario_id = pe.colegio_id
       WHERE pe.usuario_id = ?`,
      [req.params.id]
    );
    if (perfil.length === 0)
      return res.status(404).json({ error: "Perfil no encontrado" });

    // Admin solo puede ver estudiantes de su propia institución
    if (req.usuario.rol === "colegio" && perfil[0].colegio_id !== req.usuario.id)
      return res.status(403).json({ error: "No tienes acceso a este perfil" });

    const [habilidades] = await db.query(
      `SELECT h.id, h.nombre, h.categoria, he.nivel_dominio, he.porcentaje, he.esta_validada
       FROM habilidades_estudiantes he
       JOIN habilidades h ON h.id = he.habilidad_id
       WHERE he.estudiante_id = ?`,
      [req.params.id]
    );

    const [idiomas] = await db.query(
      "SELECT * FROM idiomas_estudiantes WHERE estudiante_id = ? ORDER BY idioma",
      [req.params.id]
    );

    const [historial_academico] = await db.query(
      "SELECT * FROM historial_academico WHERE estudiante_id = ? ORDER BY fecha_inicio DESC",
      [req.params.id]
    );

    const [historial_laboral] = await db.query(
      `SELECT hl.*,
              v.titulo AS vacante_titulo,
              COALESCE(hl.descripcion, v.descripcion) AS descripcion
       FROM historial_laboral hl
       LEFT JOIN postulaciones p ON p.id = hl.postulacion_id
       LEFT JOIN vacantes v ON v.id = p.vacante_id
       WHERE hl.estudiante_id = ?
       ORDER BY hl.fecha_inicio DESC`,
      [req.params.id]
    );

    const [cv_seleccion] = await db.query(
      "SELECT experiencia_id FROM cv_seleccion_experiencias WHERE estudiante_id = ?",
      [req.params.id]
    );
    const cv_experiencias = cv_seleccion.map((r) => r.experiencia_id);

    res.json({ ...perfil[0], habilidades, idiomas, historial_academico, historial_laboral, cv_experiencias });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PATCH /api/perfiles/estudiante/:id/cv-experiencias — guarda IDs favoritos para el CV
router.patch("/estudiante/:id/cv-experiencias", verificarToken, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids debe ser un array" });
  const estudianteId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM cv_seleccion_experiencias WHERE estudiante_id = ?", [estudianteId]);
    if (ids.length > 0) {
      const valores = ids.map((expId) => [estudianteId, expId]);
      await conn.query("INSERT INTO cv_seleccion_experiencias (estudiante_id, experiencia_id) VALUES ?", [valores]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/perfiles/estudiante/:id
router.put("/estudiante/:id", verificarToken, async (req, res) => {
  const { id: callerId, rol } = req.usuario;
  const targetId = parseInt(req.params.id);

  if (rol === "estudiante" && callerId !== targetId)
    return res.status(403).json({ error: "No puedes modificar el perfil de otro estudiante" });

  if (rol === "colegio") {
    const [[row]] = await db.query(
      "SELECT 1 FROM perfiles_estudiantes WHERE usuario_id = ? AND colegio_id = ?",
      [targetId, callerId]
    );
    if (!row)
      return res.status(403).json({ error: "Este estudiante no pertenece a tu institución" });
  }

  const { nombre_completo, carrera, telefono, biografia, semestre, promedio, estado_civil, rut, region, comuna, colegio_id } = req.body;
  try {
    const [[carreraRow]] = await db.query(
      "SELECT id FROM carreras WHERE nombre = ?", [carrera]
    );
    if (!carreraRow)
      return res.status(400).json({ error: "Carrera no válida" });

    await db.query(
      `UPDATE perfiles_estudiantes
       SET nombre_completo=?, carrera_id=?, telefono=?, biografia=?, semestre=?, promedio=?,
           estado_civil=?, rut=?, region=?, comuna=?, colegio_id=?
       WHERE usuario_id=?`,
      [nombre_completo, carreraRow.id, telefono || null, biografia || null,
       semestre || null, promedio || null, estado_civil || null,
       rut || null, region || null, comuna || null, colegio_id || null, req.params.id]
    );
    res.json({ mensaje: "Perfil actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/perfiles/empresa/:id
router.get("/empresa/:id", verificarToken, async (req, res) => {
  try {
    const [perfil] = await db.query(
      "SELECT * FROM perfiles_empresas WHERE usuario_id = ?",
      [req.params.id]
    );
    if (perfil.length === 0)
      return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(perfil[0]);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/perfiles/empresa/:id
router.put("/empresa/:id", verificarToken, async (req, res) => {
  const { nombre_empresa, telefono_contacto, descripcion, region, comuna } = req.body;
  try {
    await db.query(
      "UPDATE perfiles_empresas SET nombre_empresa=?, telefono_contacto=?, descripcion=?, region=?, comuna=? WHERE usuario_id=?",
      [nombre_empresa, telefono_contacto, descripcion, region || null, comuna || null, req.params.id]
    );
    res.json({ mensaje: "Perfil actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/perfiles/colegio/:id
router.get("/colegio/:id", verificarToken, async (req, res) => {
  try {
    const [perfil] = await db.query(
      `SELECT pc.*, u.correo
       FROM perfiles_colegios pc
       JOIN usuarios u ON u.id = pc.usuario_id
       WHERE pc.usuario_id = ?`,
      [req.params.id]
    );
    if (perfil.length === 0)
      return res.status(404).json({ error: "Perfil no encontrado" });

    const [[stats]] = await db.query(
      `SELECT COUNT(*) AS total_estudiantes FROM perfiles_estudiantes WHERE colegio_id = ?`,
      [req.params.id]
    );

    res.json({ ...perfil[0], total_estudiantes: stats.total_estudiantes });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/perfiles/colegio/:id
router.put("/colegio/:id", verificarToken, async (req, res) => {
  const { nombre_institucion, telefono_contacto, descripcion, region, comuna } = req.body;
  try {
    await db.query(
      "UPDATE perfiles_colegios SET nombre_institucion=?, telefono_contacto=?, descripcion=?, region=?, comuna=? WHERE usuario_id=?",
      [nombre_institucion, telefono_contacto, descripcion, region || null, comuna || null, req.params.id]
    );
    res.json({ mensaje: "Perfil actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/perfiles/empresas  — lista para buscador
router.get("/empresas", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pe.usuario_id, pe.nombre_empresa, pe.descripcion, pe.telefono_contacto,
              pe.region, pe.comuna, pe.foto_perfil,
              COUNT(v.id) AS total_vacantes
       FROM perfiles_empresas pe
       LEFT JOIN vacantes v ON v.empresa_id = pe.usuario_id AND v.esta_activa = TRUE
       GROUP BY pe.usuario_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/perfiles/estudiantes  — lista para buscador (incluye habilidades)
// Query param opcional: ?colegio_id=X  → filtra solo estudiantes de esa institución
router.get("/estudiantes", verificarToken, async (req, res) => {
  const { colegio_id } = req.query;
  try {
    const whereClause = colegio_id ? "WHERE pe.colegio_id = ?" : "";
    const params      = colegio_id ? [Number(colegio_id)] : [];
    const [rows] = await db.query(
      `SELECT pe.usuario_id, pe.nombre_completo, c.nombre AS carrera, pe.semestre,
              pe.promedio, pe.calificacion_docente, pe.biografia,
              pe.region, pe.comuna, pe.foto_perfil,
              GROUP_CONCAT(h.nombre SEPARATOR '||') AS habilidades_raw
       FROM perfiles_estudiantes pe
       LEFT JOIN carreras c ON c.id = pe.carrera_id
       LEFT JOIN habilidades_estudiantes he ON he.estudiante_id = pe.usuario_id
       LEFT JOIN habilidades h ON h.id = he.habilidad_id
       ${whereClause}
       GROUP BY pe.usuario_id`,
      params
    );
    const result = rows.map((r) => ({
      ...r,
      habilidades: r.habilidades_raw ? r.habilidades_raw.split("||") : [],
      habilidades_raw: undefined,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/perfiles/foto — subir foto de perfil al bucket
router.put("/foto", verificarToken, upload.single("foto"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se envió ninguna imagen" });

  const url = `/api/media/${req.file.key}`;
  const { id, rol } = req.usuario;

  try {
    if (rol === "estudiante") {
      await db.query(
        "UPDATE perfiles_estudiantes SET foto_perfil = ? WHERE usuario_id = ?",
        [url, id]
      );
    } else if (rol === "empresa") {
      await db.query(
        "UPDATE perfiles_empresas SET foto_perfil = ? WHERE usuario_id = ?",
        [url, id]
      );
    } else if (rol === "colegio") {
      await db.query(
        "UPDATE perfiles_colegios SET foto_perfil = ? WHERE usuario_id = ?",
        [url, id]
      );
    } else {
      return res.status(403).json({ error: "Rol no soportado para foto de perfil" });
    }

    res.json({ foto_perfil: url });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
