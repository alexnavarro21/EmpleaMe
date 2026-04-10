const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

const auth = [verificarToken, soloRol("centro")];

// ── Stats ─────────────────────────────────────────────────────────────────────

// GET /api/admin/stats  — KPIs del panel
router.get("/stats", ...auth, async (req, res) => {
  try {
    const [[{ total_estudiantes }]] = await db.query(
      "SELECT COUNT(*) AS total_estudiantes FROM perfiles_estudiantes"
    );
    const [[{ total_empresas }]] = await db.query(
      "SELECT COUNT(*) AS total_empresas FROM perfiles_empresas"
    );
    const [[{ total_vacantes_activas }]] = await db.query(
      "SELECT COUNT(*) AS total_vacantes_activas FROM vacantes WHERE esta_activa = TRUE"
    );
    const [[{ total_postulaciones }]] = await db.query(
      "SELECT COUNT(*) AS total_postulaciones FROM postulaciones WHERE estado = 'pendiente'"
    );
    const [[{ total_conversaciones }]] = await db.query(
      "SELECT COUNT(*) AS total_conversaciones FROM conversaciones"
    );
    const [[{ total_evaluaciones }]] = await db.query(
      "SELECT COUNT(*) AS total_evaluaciones FROM evaluaciones"
    );
    const [[{ estudiantes_evaluados }]] = await db.query(
      "SELECT COUNT(DISTINCT estudiante_id) AS estudiantes_evaluados FROM evaluaciones"
    );

    res.json({
      total_estudiantes,
      total_empresas,
      total_vacantes_activas,
      total_postulaciones,
      total_conversaciones,
      total_evaluaciones,
      estudiantes_evaluados,
    });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Usuarios ──────────────────────────────────────────────────────────────────

// GET /api/admin/usuarios  — lista completa con nombres y carrera
router.get("/usuarios", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.correo, u.rol, u.fecha_creacion,
             COALESCE(pe.nombre_completo, emp.nombre_empresa) AS nombre,
             pe.carrera
      FROM usuarios u
      LEFT JOIN perfiles_estudiantes pe  ON pe.usuario_id  = u.id
      LEFT JOIN perfiles_empresas    emp ON emp.usuario_id = u.id
      ORDER BY u.fecha_creacion DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Evaluaciones docentes ─────────────────────────────────────────────────────

// GET /api/admin/evaluaciones  — historial de evaluaciones
router.get("/evaluaciones", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.periodo, e.observaciones, e.creada_en,
             pe.nombre_completo  AS nombre_estudiante,
             pe.carrera,
             AVG(CASE WHEN h.categoria = 'tecnica' THEN eh.puntaje END) AS avg_tecnica,
             AVG(CASE WHEN h.categoria = 'blanda'  THEN eh.puntaje END) AS avg_blanda
      FROM evaluaciones e
      JOIN perfiles_estudiantes pe ON pe.usuario_id = e.estudiante_id
      LEFT JOIN evaluacion_habilidades eh ON eh.evaluacion_id = e.id
      LEFT JOIN habilidades h ON h.id = eh.habilidad_id
      GROUP BY e.id
      ORDER BY e.creada_en DESC
      LIMIT 50
    `);

    const result = rows.map((r) => ({
      ...r,
      promedio_tecnico: r.avg_tecnica != null
        ? (1 + (r.avg_tecnica / 5) * 6).toFixed(1) : null,
      promedio_blando: r.avg_blanda != null
        ? (1 + (r.avg_blanda  / 5) * 6).toFixed(1) : null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/admin/evaluaciones  — guardar evaluación docente
router.post("/evaluaciones", ...auth, async (req, res) => {
  const { estudiante_id, periodo, habilidades, observaciones } = req.body;
  if (!estudiante_id || !periodo)
    return res.status(400).json({ error: "estudiante_id y periodo son requeridos" });

  try {
    const [evalResult] = await db.query(
      "INSERT INTO evaluaciones (estudiante_id, evaluador_id, periodo, observaciones) VALUES (?, ?, ?, ?)",
      [estudiante_id, req.usuario.id, periodo, observaciones || null]
    );
    const evalId = evalResult.insertId;

    if (habilidades && habilidades.length > 0) {
      const values = habilidades
        .filter((h) => h.habilidad_id && h.puntaje)
        .map((h) => [evalId, h.habilidad_id, h.puntaje]);

      if (values.length > 0) {
        await db.query(
          "INSERT INTO evaluacion_habilidades (evaluacion_id, habilidad_id, puntaje) VALUES ?",
          [values]
        );
      }

      // Actualizar calificacion_docente como promedio global (escala 1.0-7.0)
      const [[{ avg_puntaje }]] = await db.query(
        "SELECT AVG(puntaje) AS avg_puntaje FROM evaluacion_habilidades WHERE evaluacion_id = ?",
        [evalId]
      );
      if (avg_puntaje != null) {
        const nota = parseFloat((1 + (avg_puntaje / 5) * 6).toFixed(1));
        await db.query(
          "UPDATE perfiles_estudiantes SET calificacion_docente = ? WHERE usuario_id = ?",
          [nota, estudiante_id]
        );
      }
    }

    res.status(201).json({ id: evalId, mensaje: "Evaluación guardada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Tests socioemocionales ────────────────────────────────────────────────────

// POST /api/admin/tests/resultados  — guardar resultado por estudiante
router.post("/tests/resultados", ...auth, async (req, res) => {
  const { test_nombre, estudiante_id, dimensiones, nota_observaciones } = req.body;
  if (!estudiante_id || !test_nombre)
    return res.status(400).json({ error: "estudiante_id y test_nombre son requeridos" });

  try {
    const [result] = await db.query(
      `INSERT INTO test_resultados
         (test_nombre, estudiante_id, evaluador_id, nota_observaciones)
       VALUES (?, ?, ?, ?)`,
      [test_nombre, estudiante_id, req.usuario.id, nota_observaciones || null]
    );
    const resultId = result.insertId;

    if (dimensiones && dimensiones.length > 0) {
      const values = dimensiones
        .filter((d) => d.puntaje)
        .map((d) => [resultId, d.nombre, Number(d.puntaje)]);

      if (values.length > 0) {
        await db.query(
          "INSERT INTO test_resultado_dimensiones (resultado_id, dimension_nombre, puntaje) VALUES ?",
          [values]
        );
      }
    }

    res.status(201).json({ id: resultId, mensaje: "Resultado guardado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/admin/tests/resultados/:estudianteId
router.get("/tests/resultados/:estudianteId", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tr.id, tr.test_nombre, tr.nota_observaciones, tr.registrado_en,
              pe.nombre_completo AS nombre_estudiante
       FROM test_resultados tr
       JOIN perfiles_estudiantes pe ON pe.usuario_id = tr.estudiante_id
       WHERE tr.estudiante_id = ?
       ORDER BY tr.registrado_en DESC`,
      [req.params.estudianteId]
    );

    const results = await Promise.all(
      rows.map(async (r) => {
        const [dims] = await db.query(
          "SELECT dimension_nombre, puntaje FROM test_resultado_dimensiones WHERE resultado_id = ?",
          [r.id]
        );
        return { ...r, dimensiones: dims };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
