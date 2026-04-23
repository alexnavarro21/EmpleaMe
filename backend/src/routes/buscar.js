const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/buscar/sugerencias?q=texto
router.get("/sugerencias", verificarToken, async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const lim = 5;
  const like = `%${q}%`;

  try {
    const results = await Promise.allSettled([
      db.query(
        `SELECT pe.usuario_id AS id, pe.nombre_completo AS nombre,
                c.nombre AS sub, 'estudiante' AS tipo
         FROM perfiles_estudiantes pe
         LEFT JOIN carreras c ON c.id = pe.carrera_id
         WHERE pe.nombre_completo LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
      db.query(
        `SELECT emp.usuario_id AS id, emp.nombre_empresa AS nombre,
                NULL AS sub, 'empresa' AS tipo
         FROM perfiles_empresas emp
         WHERE emp.nombre_empresa LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
      db.query(
        `SELECT v.id, v.titulo AS nombre,
                pe.nombre_empresa AS sub, 'vacante' AS tipo
         FROM vacantes v
         JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
         WHERE v.esta_activa = TRUE AND v.titulo LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
      db.query(
        `SELECT t.id, t.titulo AS nombre,
                t.area AS sub, 'taller' AS tipo
         FROM talleres t
         WHERE t.esta_activo = TRUE AND t.titulo LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
    ]);

    const estudiantes = results[0].status === "fulfilled" ? results[0].value[0] : [];
    const empresas    = results[1].status === "fulfilled" ? results[1].value[0] : [];
    const vacantes    = results[2].status === "fulfilled" ? results[2].value[0] : [];
    const talleres    = results[3].status === "fulfilled" ? results[3].value[0] : [];

    res.json([...estudiantes, ...empresas, ...vacantes, ...talleres]);
  } catch (err) {
    console.error("Error en /buscar/sugerencias:", err.message);
    res.json([]);
  }
});

module.exports = router;
