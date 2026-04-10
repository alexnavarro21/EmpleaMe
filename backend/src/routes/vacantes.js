const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");
const upload = require("../middleware/multerConfig");

// GET /api/vacantes  — vacantes activas (para estudiantes)
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, pe.nombre_empresa
       FROM vacantes v
       JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
       WHERE v.esta_activa = TRUE
       ORDER BY v.fecha_creacion DESC`
    );

    // Adjuntar habilidades a cada vacante
    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const [habs] = await db.query(
        `SELECT vh.vacante_id, h.id, h.nombre, h.categoria
         FROM vacante_habilidades vh
         JOIN habilidades h ON h.id = vh.habilidad_id
         WHERE vh.vacante_id IN (?)`,
        [ids]
      );
      const habsPorVacante = {};
      habs.forEach((h) => {
        if (!habsPorVacante[h.vacante_id]) habsPorVacante[h.vacante_id] = [];
        habsPorVacante[h.vacante_id].push({ id: h.id, nombre: h.nombre, categoria: h.categoria });
      });
      rows.forEach((v) => { v.habilidades = habsPorVacante[v.id] || []; });
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/vacantes/empresa/:id  — vacantes de una empresa con conteo de postulantes
router.get("/empresa/:id", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*,
              (SELECT COUNT(*) FROM postulaciones p WHERE p.vacante_id = v.id) AS total_postulantes
       FROM vacantes v
       WHERE v.empresa_id = ?
       ORDER BY v.fecha_creacion DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/vacantes  — publicar vacante (solo empresa)
router.post("/", verificarToken, soloRol("empresa"), upload.single("archivo_multimedia"), async (req, res) => {
  const { titulo, descripcion, requisitos, area, modalidad, duracion, horario, remuneracion, direccion, beneficios, fecha_limite, habilidades, tipo } = req.body;
  if (!titulo || !descripcion)
    return res.status(400).json({ error: "titulo y descripcion son requeridos" });
  const tipoValido = tipo === "puesto_laboral" ? "puesto_laboral" : "practica";
  try {
    const [result] = await db.query(
      `INSERT INTO vacantes
         (empresa_id, tipo, titulo, descripcion, requisitos, area, modalidad, duracion, horario, remuneracion, direccion, beneficios, fecha_limite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id, tipoValido, titulo, descripcion,
        requisitos || null, area || null,
        modalidad || "presencial",
        duracion || null, horario || null,
        remuneracion || null, direccion || null,
        beneficios || null, fecha_limite || null,
      ]
    );

    const vacanteId = result.insertId;

    // Insertar habilidades requeridas
    const habilidadesIds = habilidades
      ? (Array.isArray(habilidades) ? habilidades : JSON.parse(habilidades))
      : [];
    if (habilidadesIds.length > 0) {
      const values = habilidadesIds.map((hid) => [vacanteId, hid]);
      await db.query("INSERT INTO vacante_habilidades (vacante_id, habilidad_id) VALUES ?", [values]);
    }

    // Crear publicación en el feed vinculada a la vacante
    const url_multimedia = req.file ? `/uploads/${req.file.filename}` : null;
    const [[tipoVacante]] = await db.query("SELECT id FROM tipos_publicacion WHERE nombre = 'vacante'");
    if (tipoVacante) {
      await db.query(
        "INSERT INTO publicaciones (autor_id, tipo_id, vacante_id, titulo, contenido, url_multimedia) VALUES (?, ?, ?, ?, ?, ?)",
        [req.usuario.id, tipoVacante.id, vacanteId, titulo, descripcion, url_multimedia]
      );
    }

    res.status(201).json({ id: vacanteId, mensaje: "Vacante publicada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/vacantes/:id/desactivar  — desactivar vacante y rechazar postulaciones pendientes
router.put("/:id/desactivar", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE vacantes SET esta_activa = FALSE WHERE id = ? AND empresa_id = ?",
      [req.params.id, req.usuario.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Vacante no encontrada o sin permisos" });

    await db.query(
      "UPDATE postulaciones SET estado = 'rechazado' WHERE vacante_id = ? AND estado = 'pendiente'",
      [req.params.id]
    );

    res.json({ mensaje: "Vacante desactivada y postulaciones pendientes rechazadas" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/vacantes/:id/activar  — reactivar vacante (solo empresa)
router.put("/:id/activar", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE vacantes SET esta_activa = TRUE WHERE id = ? AND empresa_id = ?",
      [req.params.id, req.usuario.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Vacante no encontrada o sin permisos" });
    res.json({ mensaje: "Vacante activada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
