const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/buscar/sugerencias?q=texto&limit=4
router.get("/sugerencias", verificarToken, async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const lim = Math.min(parseInt(req.query.limit) || 4, 8);
  const like = `%${q}%`;

  try {
    const [
      [estudiantes],
      [empresas],
      [vacantes],
      [talleres],
    ] = await Promise.all([
      db.query(
        `SELECT pe.usuario_id AS id, pe.nombre_completo AS nombre,
                pe.foto_perfil AS foto, pe.carrera AS sub,
                'estudiante' AS tipo
         FROM perfiles_estudiantes pe
         WHERE pe.nombre_completo LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
      db.query(
        `SELECT emp.usuario_id AS id, emp.nombre_empresa AS nombre,
                emp.foto_perfil AS foto, emp.descripcion AS sub,
                'empresa' AS tipo
         FROM perfiles_empresas emp
         WHERE emp.nombre_empresa LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
      db.query(
        `SELECT v.id, v.titulo AS nombre,
                pe.nombre_empresa AS sub,
                'vacante' AS tipo
         FROM vacantes v
         JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
         WHERE v.esta_activa = TRUE AND v.titulo LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
      db.query(
        `SELECT t.id, t.titulo AS nombre,
                t.area AS sub,
                'taller' AS tipo
         FROM talleres t
         WHERE t.esta_activo = TRUE AND t.titulo LIKE ?
         LIMIT ?`,
        [like, lim]
      ),
    ]);

    // Lista plana ordenada: primero estudiantes y empresas (más frecuentes), luego vacantes y talleres
    const resultados = [...estudiantes, ...empresas, ...vacantes, ...talleres];
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
