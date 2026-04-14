const router  = require("express").Router();
const multer  = require("multer");
const XLSX    = require("xlsx");
const db      = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

const auth    = [verificarToken, soloRol("centro")];
const upload  = multer({ storage: multer.memoryStorage() });

// ── Stats ─────────────────────────────────────────────────────────────────────

router.get("/stats", ...auth, async (req, res) => {
  try {
    const [[{ total_estudiantes }]]         = await db.query("SELECT COUNT(*) AS total_estudiantes FROM perfiles_estudiantes");
    const [[{ total_empresas }]]            = await db.query("SELECT COUNT(*) AS total_empresas FROM perfiles_empresas");
    const [[{ total_vacantes_activas }]]    = await db.query("SELECT COUNT(*) AS total_vacantes_activas FROM vacantes WHERE esta_activa = TRUE");
    const [[{ total_postulaciones }]]       = await db.query("SELECT COUNT(*) AS total_postulaciones FROM postulaciones WHERE estado = 'pendiente'");
    const [[{ total_conversaciones }]]      = await db.query("SELECT COUNT(*) AS total_conversaciones FROM conversaciones");
    const [[{ total_evaluaciones }]]        = await db.query("SELECT COUNT(*) AS total_evaluaciones FROM evaluaciones");
    const [[{ estudiantes_evaluados }]]     = await db.query("SELECT COUNT(DISTINCT estudiante_id) AS estudiantes_evaluados FROM evaluaciones");

    res.json({ total_estudiantes, total_empresas, total_vacantes_activas,
               total_postulaciones, total_conversaciones, total_evaluaciones, estudiantes_evaluados });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Usuarios ──────────────────────────────────────────────────────────────────

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

router.get("/evaluaciones", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.periodo, e.observaciones, e.creada_en,
             pe.nombre_completo AS nombre_estudiante, pe.carrera,
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
    res.json(rows.map((r) => ({
      ...r,
      promedio_tecnico: r.avg_tecnica != null ? (1 + (r.avg_tecnica / 5) * 6).toFixed(1) : null,
      promedio_blando:  r.avg_blanda  != null ? (1 + (r.avg_blanda  / 5) * 6).toFixed(1) : null,
    })));
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

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

    if (habilidades?.length) {
      const values = habilidades.filter((h) => h.habilidad_id && h.puntaje)
                                .map((h) => [evalId, h.habilidad_id, h.puntaje]);
      if (values.length) {
        await db.query("INSERT INTO evaluacion_habilidades (evaluacion_id, habilidad_id, puntaje) VALUES ?", [values]);
        const [[{ avg }]] = await db.query(
          "SELECT AVG(puntaje) AS avg FROM evaluacion_habilidades WHERE evaluacion_id = ?", [evalId]
        );
        if (avg != null) {
          await db.query(
            "UPDATE perfiles_estudiantes SET calificacion_docente = ? WHERE usuario_id = ?",
            [parseFloat((1 + (avg / 5) * 6).toFixed(1)), estudiante_id]
          );
        }
      }
    }
    res.status(201).json({ id: evalId, mensaje: "Evaluación guardada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Habilidades técnicas — asignación por admin ───────────────────────────────

// POST /api/admin/habilidades/asignar
// body: { estudiante_id, habilidades: [{ habilidad_id, nivel_dominio, porcentaje }] }
// - Técnicas: nivel_dominio = 'Basico'|'Intermedio'|'Avanzado', porcentaje = null
// - Blandas:  nivel_dominio = null, porcentaje = 0-100
router.post("/habilidades/asignar", ...auth, async (req, res) => {
  const { estudiante_id, habilidades, modo } = req.body;
  if (!estudiante_id || !Array.isArray(habilidades))
    return res.status(400).json({ error: "estudiante_id y habilidades son requeridos" });

  // modo "blandas": reemplaza TODAS las blandas del estudiante (permite dejar en 0)
  if (modo === "blandas") {
    try {
      await db.query(
        `DELETE he FROM habilidades_estudiantes he
         JOIN habilidades h ON h.id = he.habilidad_id
         WHERE he.estudiante_id = ? AND h.categoria = 'blanda'`,
        [estudiante_id]
      );
      for (const h of habilidades) {
        await db.query(
          `INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
           VALUES (?, ?, NULL, ?, TRUE)`,
          [estudiante_id, h.habilidad_id, h.porcentaje ?? null]
        );
      }
      return res.json({ mensaje: `${habilidades.length} habilidades blandas actualizadas` });
    } catch (err) {
      return res.status(500).json({ error: "Error del servidor", detalle: err.message });
    }
  }

  if (!habilidades.length)
    return res.status(400).json({ error: "habilidades no puede estar vacío" });

  try {
    for (const h of habilidades) {
      await db.query(
        `INSERT INTO habilidades_estudiantes
           (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
         VALUES (?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE
           nivel_dominio = VALUES(nivel_dominio),
           porcentaje    = VALUES(porcentaje),
           esta_validada = TRUE`,
        [estudiante_id, h.habilidad_id, h.nivel_dominio ?? null, h.porcentaje ?? null]
      );
    }
    res.json({ mensaje: `${habilidades.length} habilidades asignadas` });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/admin/habilidades/quitar
// body: { estudiante_id, habilidad_id }
router.delete("/habilidades/quitar", ...auth, async (req, res) => {
  const { estudiante_id, habilidad_id } = req.body;
  if (!estudiante_id || !habilidad_id)
    return res.status(400).json({ error: "estudiante_id y habilidad_id son requeridos" });
  try {
    await db.query(
      "DELETE FROM habilidades_estudiantes WHERE estudiante_id = ? AND habilidad_id = ?",
      [estudiante_id, habilidad_id]
    );
    res.json({ mensaje: "Habilidad removida" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Tests socioemocionales — plantilla y subida de Excel ─────────────────────

// GET /api/admin/tests/template  — descarga plantilla Excel de tests socioemocionales
// Formato: fila de encabezados (Correo, Nombre, [habilidad1], [habilidad2], ...)
//          una fila por estudiante, celdas vacías para rellenar con porcentaje 0-100
router.get("/tests/template", ...auth, async (req, res) => {
  try {
    const [estudiantes] = await db.query(`
      SELECT pe.nombre_completo, u.correo
      FROM perfiles_estudiantes pe
      JOIN usuarios u ON u.id = pe.usuario_id
      ORDER BY pe.nombre_completo
    `);
    const [habilidades] = await db.query(
      "SELECT nombre FROM habilidades WHERE categoria = 'blanda' ORDER BY nombre"
    );

    const nombresCols = habilidades.map((h) => h.nombre);

    // Fila de encabezados: Correo | Nombre | Habilidad1 | Habilidad2 | ...
    const header = ["Correo", "Nombre", ...nombresCols];
    const data   = [header];

    // Una fila por estudiante con celdas vacías para los porcentajes
    for (const est of estudiantes) {
      data.push([est.correo, est.nombre_completo, ...nombresCols.map(() => "")]);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Anchos de columna: correo(30), nombre(30), y 18 por cada habilidad
    ws["!cols"] = [{ wch: 30 }, { wch: 30 }, ...nombresCols.map(() => ({ wch: 18 }))];

    XLSX.utils.book_append_sheet(wb, ws, "Tests");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=plantilla_tests.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Error generando plantilla", detalle: err.message });
  }
});

//
// Formato esperado del Excel (hoja 1) — matriz:
//   Fila 1 (encabezados): Correo | Nombre | [Habilidad1] | [Habilidad2] | ...
//   Filas siguientes:      correo | nombre | pct(0-100)  | pct(0-100)   | ...
//
// POST /api/admin/tests/excel

router.post("/tests/excel", ...auth, upload.single("archivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Se requiere un archivo Excel" });

  try {
    const wb   = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    if (rows.length < 2) return res.status(400).json({ error: "El archivo no contiene datos" });

    // Fila 0: encabezados. Columnas 0=Correo, 1=Nombre, 2..N=habilidades
    const encabezados     = rows[0];
    const nombresHabilidades = encabezados.slice(2).map((n) => String(n).trim());

    const resultados = [];
    const errores    = [];

    for (let i = 1; i < rows.length; i++) {
      const fila  = rows[i];
      const correo = String(fila[0] ?? "").trim();
      if (!correo) continue; // fila vacía

      const [[usuario]] = await db.query(
        "SELECT id FROM usuarios WHERE correo = ? AND rol = 'estudiante'", [correo]
      );
      if (!usuario) { errores.push(`Estudiante no encontrado: ${correo}`); continue; }

      for (let col = 0; col < nombresHabilidades.length; col++) {
        const habilidadNombre = nombresHabilidades[col];
        const rawPct          = fila[col + 2];

        // Celda vacía → omitir (no sobreescribir con nulo)
        if (rawPct === "" || rawPct === null || rawPct === undefined) continue;

        const porcentaje = parseInt(rawPct, 10);
        if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
          errores.push(`Fila ${i + 1} — "${habilidadNombre}": porcentaje "${rawPct}" no es válido (debe ser 0-100)`);
          continue;
        }

        const [[habilidad]] = await db.query(
          "SELECT id FROM habilidades WHERE nombre = ? AND categoria = 'blanda'",
          [habilidadNombre]
        );
        if (!habilidad) { errores.push(`Habilidad no encontrada: "${habilidadNombre}"`); continue; }

        await db.query(
          `INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, esta_validada, porcentaje)
           VALUES (?, ?, 'Avanzado', TRUE, ?)
           ON DUPLICATE KEY UPDATE porcentaje = VALUES(porcentaje), esta_validada = TRUE`,
          [usuario.id, habilidad.id, porcentaje]
        );
        resultados.push({ correo, habilidad: habilidadNombre, porcentaje });
      }
    }

    res.json({ actualizados: resultados.length, resultados, errores });
  } catch (err) {
    res.status(500).json({ error: "Error procesando el archivo", detalle: err.message });
  }
});

// ── Promedios académicos — plantilla y subida ─────────────────────────────────

// GET /api/admin/promedios/template  — descarga plantilla Excel
router.get("/promedios/template", ...auth, async (req, res) => {
  try {
    const [estudiantes] = await db.query(`
      SELECT pe.nombre_completo, u.correo
      FROM perfiles_estudiantes pe
      JOIN usuarios u ON u.id = pe.usuario_id
      ORDER BY pe.nombre_completo
    `);

    const data = [["Estudiante", "Correo", "Periodo", "Promedio (1.0-7.0)"]];
    estudiantes.forEach((e) => data.push([e.nombre_completo, e.correo, "2025-I", ""]));

    const wb  = XLSX.utils.book_new();
    const ws  = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Promedios");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=plantilla_promedios.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Error generando plantilla", detalle: err.message });
  }
});

// POST /api/admin/promedios/excel  — procesa Excel de promedios
//
// Formato esperado del Excel (hoja 1):
//   Columna A: Nombre estudiante (informativo)
//   Columna B: Correo
//   Columna C: Periodo (informativo)
//   Columna D: Promedio (1.0-7.0)

router.post("/promedios/excel", ...auth, upload.single("archivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Se requiere un archivo Excel" });

  try {
    const wb   = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    const dataRows = rows.slice(1).filter((r) => r[1] && r[3] !== "");

    const actualizados = [];
    const errores      = [];

    for (const [, correo, , promedio] of dataRows) {
      const prom = parseFloat(String(promedio).replace(",", "."));
      if (isNaN(prom) || prom < 1.0 || prom > 7.0) {
        errores.push(`Promedio inválido para ${correo}: "${promedio}"`);
        continue;
      }

      const [[usuario]] = await db.query(
        "SELECT id FROM usuarios WHERE correo = ? AND rol = 'estudiante'", [String(correo).trim()]
      );
      if (!usuario) { errores.push(`Estudiante no encontrado: ${correo}`); continue; }

      await db.query(
        "UPDATE perfiles_estudiantes SET promedio = ? WHERE usuario_id = ?",
        [prom, usuario.id]
      );
      actualizados.push({ correo, promedio: prom });
    }

    res.json({ actualizados: actualizados.length, filas: actualizados, errores });
  } catch (err) {
    res.status(500).json({ error: "Error procesando el archivo", detalle: err.message });
  }
});

// ── Tests socioemocionales — resultados por estudiante ────────────────────────

router.post("/tests/resultados", ...auth, async (req, res) => {
  const { test_nombre, estudiante_id, dimensiones, nota_observaciones } = req.body;
  if (!estudiante_id || !test_nombre)
    return res.status(400).json({ error: "estudiante_id y test_nombre son requeridos" });
  try {
    const [result] = await db.query(
      "INSERT INTO test_resultados (test_nombre, estudiante_id, evaluador_id, nota_observaciones) VALUES (?, ?, ?, ?)",
      [test_nombre, estudiante_id, req.usuario.id, nota_observaciones || null]
    );
    const resultId = result.insertId;

    if (dimensiones?.length) {
      const values = dimensiones.filter((d) => d.puntaje).map((d) => [resultId, d.nombre, Number(d.puntaje)]);
      if (values.length)
        await db.query("INSERT INTO test_resultado_dimensiones (resultado_id, dimension_nombre, puntaje) VALUES ?", [values]);
    }
    res.status(201).json({ id: resultId, mensaje: "Resultado guardado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

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
    const results = await Promise.all(rows.map(async (r) => {
      const [dims] = await db.query(
        "SELECT dimension_nombre, puntaje FROM test_resultado_dimensiones WHERE resultado_id = ?", [r.id]
      );
      return { ...r, dimensiones: dims };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Idiomas ───────────────────────────────────────────────────────────────────

// GET /api/admin/idiomas/:estudiante_id
router.get("/idiomas/:estudiante_id", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM idiomas_estudiantes WHERE estudiante_id = ? ORDER BY idioma",
      [req.params.estudiante_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/admin/idiomas
// body: { estudiante_id, idioma, nivel }
router.post("/idiomas", ...auth, async (req, res) => {
  const { estudiante_id, idioma, nivel } = req.body;
  if (!estudiante_id || !idioma || !nivel)
    return res.status(400).json({ error: "estudiante_id, idioma y nivel son requeridos" });
  try {
    await db.query(
      `INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nivel = VALUES(nivel)`,
      [estudiante_id, idioma.trim(), nivel]
    );
    const [[row]] = await db.query(
      "SELECT * FROM idiomas_estudiantes WHERE estudiante_id = ? AND idioma = ?",
      [estudiante_id, idioma.trim()]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/admin/idiomas/:id
router.delete("/idiomas/:id", ...auth, async (req, res) => {
  try {
    await db.query("DELETE FROM idiomas_estudiantes WHERE id = ?", [req.params.id]);
    res.json({ mensaje: "Idioma eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Historial académico ───────────────────────────────────────────────────────

// GET /api/admin/historial-academico/:estudiante_id
router.get("/historial-academico/:estudiante_id", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM historial_academico WHERE estudiante_id = ? ORDER BY fecha_inicio DESC",
      [req.params.estudiante_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/admin/historial-academico
// body: { estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin }
router.post("/historial-academico", ...auth, async (req, res) => {
  const { estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin } = req.body;
  if (!estudiante_id || !institucion || !titulo)
    return res.status(400).json({ error: "estudiante_id, institucion y titulo son requeridos" });
  try {
    const [result] = await db.query(
      `INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [estudiante_id, institucion.trim(), titulo.trim(), area?.trim() || null, fecha_inicio || null, fecha_fin || null]
    );
    const [[row]] = await db.query("SELECT * FROM historial_academico WHERE id = ?", [result.insertId]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/admin/historial-academico/:id
router.delete("/historial-academico/:id", ...auth, async (req, res) => {
  try {
    await db.query("DELETE FROM historial_academico WHERE id = ?", [req.params.id]);
    res.json({ mensaje: "Registro eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ── Historial laboral ─────────────────────────────────────────────────────────

// GET /api/admin/historial-laboral/:estudiante_id
router.get("/historial-laboral/:estudiante_id", ...auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT hl.*,
              v.titulo AS vacante_titulo,
              COALESCE(hl.descripcion, v.descripcion) AS descripcion
       FROM historial_laboral hl
       LEFT JOIN postulaciones p ON p.id = hl.postulacion_id
       LEFT JOIN vacantes v ON v.id = p.vacante_id
       WHERE hl.estudiante_id = ?
       ORDER BY hl.fecha_inicio DESC`,
      [req.params.estudiante_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/admin/historial-laboral
// body: { estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion }
router.post("/historial-laboral", ...auth, async (req, res) => {
  const { estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion } = req.body;
  if (!estudiante_id || !empresa_nombre || !cargo)
    return res.status(400).json({ error: "estudiante_id, empresa_nombre y cargo son requeridos" });
  try {
    const [result] = await db.query(
      `INSERT INTO historial_laboral
         (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo)
       VALUES (?, ?, ?, ?, ?, ?, 'verificado')`,
      [estudiante_id, empresa_nombre.trim(), cargo.trim(),
       fecha_inicio || null, fecha_fin || null, descripcion?.trim() || null]
    );
    const [[row]] = await db.query("SELECT * FROM historial_laboral WHERE id = ?", [result.insertId]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/admin/historial-laboral/:id
router.delete("/historial-laboral/:id", ...auth, async (req, res) => {
  try {
    await db.query("DELETE FROM historial_laboral WHERE id = ?", [req.params.id]);
    res.json({ mensaje: "Registro eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
