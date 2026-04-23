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

module.exports = router;
