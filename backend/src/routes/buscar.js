const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/buscar/sugerencias?q=texto
router.get("/sugerencias", verificarToken, async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  if (!q) return res.json([]);

  const like = `%${q}%`;

  const rol = req.usuario?.rol || "";
  const puedeVerColegios = rol === "empresa" || rol === "slep";

  try {
    const queries = [
      db.query(
        `SELECT pe.usuario_id AS id, pe.nombre_completo AS nombre,
                c.nombre AS sub, 'estudiante' AS tipo,
                CASE WHEN LOWER(pe.nombre_completo) LIKE ? THEN 0 ELSE 1 END AS starts_with
         FROM perfiles_estudiantes pe
         LEFT JOIN carreras c ON c.id = pe.carrera_id
         WHERE LOWER(pe.nombre_completo) LIKE ?
         ORDER BY starts_with ASC, pe.nombre_completo ASC
         LIMIT 4`,
        [`${q}%`, like]
      ),
      db.query(
        `SELECT emp.usuario_id AS id, emp.nombre_empresa AS nombre,
                NULL AS sub, 'empresa' AS tipo,
                CASE WHEN LOWER(emp.nombre_empresa) LIKE ? THEN 0 ELSE 1 END AS starts_with
         FROM perfiles_empresas emp
         WHERE LOWER(emp.nombre_empresa) LIKE ?
         ORDER BY starts_with ASC, emp.nombre_empresa ASC
         LIMIT 4`,
        [`${q}%`, like]
      ),
      db.query(
        `SELECT v.id, v.titulo AS nombre,
                pe.nombre_empresa AS sub, 'vacante' AS tipo,
                CASE WHEN LOWER(v.titulo) LIKE ? THEN 0 ELSE 1 END AS starts_with
         FROM vacantes v
         JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
         WHERE v.esta_activa = TRUE AND LOWER(v.titulo) LIKE ?
         ORDER BY starts_with ASC
         LIMIT 4`,
        [`${q}%`, like]
      ),
      db.query(
        `SELECT t.id, t.titulo AS nombre,
                t.area AS sub, 'taller' AS tipo,
                CASE WHEN LOWER(t.titulo) LIKE ? THEN 0 ELSE 1 END AS starts_with
         FROM talleres t
         WHERE t.esta_activo = TRUE AND LOWER(t.titulo) LIKE ?
         ORDER BY starts_with ASC
         LIMIT 4`,
        [`${q}%`, like]
      ),
      puedeVerColegios
        ? db.query(
            `SELECT pc.usuario_id AS id, pc.nombre_institucion AS nombre,
                    pc.region AS sub, 'colegio' AS tipo,
                    CASE WHEN LOWER(pc.nombre_institucion) LIKE ? THEN 0 ELSE 1 END AS starts_with
             FROM perfiles_colegios pc
             WHERE LOWER(pc.nombre_institucion) LIKE ?
             ORDER BY starts_with ASC, pc.nombre_institucion ASC
             LIMIT 4`,
            [`${q}%`, like]
          )
        : Promise.resolve([[]])
    ];

    const results = await Promise.allSettled(queries);

    const estudiantes = results[0].status === "fulfilled" ? results[0].value[0] : [];
    const empresas    = results[1].status === "fulfilled" ? results[1].value[0] : [];
    const vacantes    = results[2].status === "fulfilled" ? results[2].value[0] : [];
    const talleres    = results[3].status === "fulfilled" ? results[3].value[0] : [];
    const colegios    = results[4].status === "fulfilled" ? results[4].value[0] : [];

    const intercalados = [];
    const maxLen = Math.max(estudiantes.length, empresas.length, vacantes.length, talleres.length, colegios.length);
    for (let i = 0; i < maxLen; i++) {
      if (estudiantes[i]) intercalados.push(estudiantes[i]);
      if (empresas[i])    intercalados.push(empresas[i]);
      if (vacantes[i])    intercalados.push(vacantes[i]);
      if (talleres[i])    intercalados.push(talleres[i]);
      if (colegios[i])    intercalados.push(colegios[i]);
    }

    res.json(intercalados.map(({ starts_with, ...item }) => item).slice(0, 10));
  } catch (err) {
    console.error("Error en /buscar/sugerencias:", err.message);
    res.json([]);
  }
});

module.exports = router;
