const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

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
      `SELECT he.id, h.nombre, h.categoria, he.nivel_dominio, he.esta_validada
       FROM habilidades_estudiantes he
       JOIN habilidades h ON h.id = he.habilidad_id
       WHERE he.estudiante_id = ?`,
      [req.params.id]
    );

    const [portafolio] = await db.query(
      "SELECT * FROM items_portafolio WHERE estudiante_id = ? ORDER BY fecha_creacion DESC",
      [req.params.id]
    );

    res.json({ ...perfil[0], habilidades, portafolio });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/perfiles/estudiante/:id
router.put("/estudiante/:id", verificarToken, async (req, res) => {
  const { nombre_completo, carrera, telefono, biografia, semestre, promedio } = req.body;
  try {
    await db.query(
      `UPDATE perfiles_estudiantes
       SET nombre_completo=?, carrera=?, telefono=?, biografia=?, semestre=?, promedio=?
       WHERE usuario_id=?`,
      [nombre_completo, carrera, telefono || null, biografia || null, semestre || null, promedio || null, req.params.id]
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
  const { nombre_empresa, telefono_contacto, descripcion } = req.body;
  try {
    await db.query(
      "UPDATE perfiles_empresas SET nombre_empresa=?, telefono_contacto=?, descripcion=? WHERE usuario_id=?",
      [nombre_empresa, telefono_contacto, descripcion, req.params.id]
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

module.exports = router;
