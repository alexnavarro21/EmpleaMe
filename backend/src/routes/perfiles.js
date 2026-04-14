const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");
const upload = require("../middleware/multerConfig");

// GET /api/perfiles/estudiante/:id
router.get("/estudiante/:id", verificarToken, async (req, res) => {
  try {
    const [perfil] = await db.query(
      "SELECT * FROM perfiles_estudiantes WHERE usuario_id = ?",
      [req.params.id]
    );
    if (perfil.length === 0)
      return res.status(404).json({ error: "Perfil no encontrado" });

    const [habilidades] = await db.query(
      `SELECT he.id, h.nombre, h.categoria, he.nivel_dominio, he.porcentaje, he.esta_validada
       FROM habilidades_estudiantes he
       JOIN habilidades h ON h.id = he.habilidad_id
       WHERE he.estudiante_id = ?`,
      [req.params.id]
    );

    const [portafolio] = await db.query(
      "SELECT * FROM items_portafolio WHERE estudiante_id = ? ORDER BY fecha_creacion DESC",
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

    res.json({ ...perfil[0], habilidades, portafolio, idiomas, historial_academico, historial_laboral });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/perfiles/estudiante/:id
router.put("/estudiante/:id", verificarToken, async (req, res) => {
  const { nombre_completo, carrera, telefono, biografia, semestre, promedio, estado_civil, rut, region, comuna } = req.body;
  try {
    await db.query(
      `UPDATE perfiles_estudiantes
       SET nombre_completo=?, carrera=?, telefono=?, biografia=?, semestre=?, promedio=?,
           estado_civil=?, rut=?, region=?, comuna=?
       WHERE usuario_id=?`,
      [nombre_completo, carrera, telefono || null, biografia || null,
       semestre || null, promedio || null, estado_civil || null,
       rut || null, region || null, comuna || null, req.params.id]
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

// GET /api/perfiles/estudiantes  — lista para buscador de empresas (incluye habilidades)
router.get("/estudiantes", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pe.usuario_id, pe.nombre_completo, pe.carrera, pe.semestre,
              pe.promedio, pe.calificacion_docente, pe.biografia,
              pe.region, pe.comuna, pe.foto_perfil,
              GROUP_CONCAT(h.nombre SEPARATOR '||') AS habilidades_raw
       FROM perfiles_estudiantes pe
       LEFT JOIN habilidades_estudiantes he ON he.estudiante_id = pe.usuario_id
       LEFT JOIN habilidades h ON h.id = he.habilidad_id
       GROUP BY pe.usuario_id`
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
    } else {
      return res.status(403).json({ error: "Rol no soportado para foto de perfil" });
    }

    res.json({ foto_perfil: url });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
