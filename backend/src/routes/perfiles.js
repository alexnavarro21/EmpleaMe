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

// GET /api/perfiles/estudiantes  — lista para buscador de empresas (incluye habilidades)
router.get("/estudiantes", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pe.usuario_id, pe.nombre_completo, pe.carrera, pe.semestre,
              pe.promedio, pe.calificacion_docente, pe.biografia,
              u.rol,
              GROUP_CONCAT(h.nombre SEPARATOR '||') AS habilidades_raw
       FROM perfiles_estudiantes pe
       JOIN usuarios u ON u.id = pe.usuario_id
       LEFT JOIN habilidades_estudiantes he ON he.estudiante_id = pe.usuario_id
       LEFT JOIN habilidades h ON h.id = he.habilidad_id
       GROUP BY pe.usuario_id

       UNION ALL

       SELECT pr.usuario_id, pr.nombre_empresa AS nombre_completo,
              NULL AS carrera, NULL AS semestre,
              NULL AS promedio, NULL AS calificacion_docente,
              pr.descripcion AS biografia,
              u.rol,
              NULL AS habilidades_raw
       FROM perfiles_empresas pr
       JOIN usuarios u ON u.id = pr.usuario_id

       UNION ALL

       SELECT u.id AS usuario_id, u.correo AS nombre_completo,
              NULL AS carrera, NULL AS semestre,
              NULL AS promedio, NULL AS calificacion_docente,
              NULL AS biografia,
              u.rol,
              NULL AS habilidades_raw
       FROM usuarios u
       WHERE u.rol = 'centro'
         AND u.id NOT IN (SELECT usuario_id FROM perfiles_estudiantes)
         AND u.id NOT IN (SELECT usuario_id FROM perfiles_empresas)`
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
