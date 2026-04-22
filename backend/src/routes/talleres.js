const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");
const upload = require("../middleware/multerConfig");

// GET /api/talleres/inscritos/pendientes — admin ve todos los inscritos pendientes
router.get("/inscritos/pendientes", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.estado, i.fecha_creacion,
              t.id AS taller_id, t.titulo AS taller_titulo,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, c.nombre AS carrera, pe.promedio
       FROM inscripciones_talleres i
       JOIN talleres t ON t.id = i.taller_id
       JOIN perfiles_estudiantes pe ON pe.usuario_id = i.estudiante_id
       LEFT JOIN carreras c ON c.id = pe.carrera_id
       WHERE i.estado = 'pendiente'
       ORDER BY i.fecha_creacion ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/talleres/mis-inscripciones — estudiante ve sus inscripciones
router.get("/mis-inscripciones", verificarToken, soloRol("estudiante"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.estado, i.fecha_creacion,
              t.id AS taller_id, t.titulo, t.area, t.modalidad, t.duracion,
              t.horario, t.costo, t.fecha_inicio, t.esta_activo
       FROM inscripciones_talleres i
       JOIN talleres t ON t.id = i.taller_id
       WHERE i.estudiante_id = ?
       ORDER BY i.fecha_creacion DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/talleres — listar talleres activos (cualquier usuario autenticado)
router.get("/", verificarToken, async (req, res) => {
  try {
    const { todos } = req.query; // admin puede pedir todos incluyendo inactivos
    const soloActivos = todos !== "1" || req.usuario.rol !== "admin";
    const [rows] = await db.query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM inscripciones_talleres i WHERE i.taller_id = t.id) AS total_inscritos
       FROM talleres t
       ${soloActivos ? "WHERE t.esta_activo = TRUE" : ""}
       ORDER BY t.creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

const uploadMulti = upload.single("archivo_multimedia");

const toBool = (v) => v === true || v === "true" || v === "1" || v === 1;
const toIntOrNull = (v) => (v == null || v === "" ? null : parseInt(v, 10));
const toNumOrZero = (v) => (v == null || v === "" ? 0 : Number(v));

// POST /api/talleres — crear taller (solo admin)
router.post("/", verificarToken, soloRol("centro"), uploadMulti, async (req, res) => {
  const { titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, direccion, fecha_inicio, fecha_limite, cupos, permite_inscripcion } = req.body;
  if (!titulo) return res.status(400).json({ error: "El título es requerido" });
  const url_multimedia = req.file ? `/api/media/${req.file.key}` : null;
  try {
    const [result] = await db.query(
      `INSERT INTO talleres (titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, direccion, fecha_inicio, fecha_limite, cupos, permite_inscripcion, url_multimedia)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion || null,
        requisitos  || null,
        area        || null,
        modalidad   || "presencial",
        duracion    || null,
        horario     || null,
        toNumOrZero(costo),
        direccion   || null,
        fecha_inicio || null,
        fecha_limite || null,
        toIntOrNull(cupos),
        permite_inscripcion != null ? toBool(permite_inscripcion) : true,
        url_multimedia,
      ]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Taller creado", url_multimedia });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/talleres/:id — editar taller (solo admin)
router.put("/:id", verificarToken, soloRol("centro"), uploadMulti, async (req, res) => {
  const { titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, direccion, fecha_inicio, fecha_limite, cupos, permite_inscripcion, quitar_multimedia } = req.body;
  try {
    // Si sube archivo nuevo → usar ese; si pide quitar → null; si no → mantener el actual
    let url_multimedia;
    if (req.file) {
      url_multimedia = `/api/media/${req.file.key}`;
    } else if (quitar_multimedia === "1") {
      url_multimedia = null;
    } else {
      const [[actual]] = await db.query("SELECT url_multimedia FROM talleres WHERE id = ?", [req.params.id]);
      url_multimedia = actual?.url_multimedia ?? null;
    }

    const [result] = await db.query(
      `UPDATE talleres SET titulo=?, descripcion=?, requisitos=?, area=?, modalidad=?, duracion=?, horario=?, costo=?, direccion=?, fecha_inicio=?, fecha_limite=?, cupos=?, permite_inscripcion=?, url_multimedia=?
       WHERE id = ?`,
      [
        titulo,
        descripcion || null,
        requisitos  || null,
        area        || null,
        modalidad   || "presencial",
        duracion    || null,
        horario     || null,
        toNumOrZero(costo),
        direccion   || null,
        fecha_inicio || null,
        fecha_limite || null,
        toIntOrNull(cupos),
        permite_inscripcion != null ? toBool(permite_inscripcion) : true,
        url_multimedia,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Taller no encontrado" });
    res.json({ mensaje: "Taller actualizado", url_multimedia });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/talleres/:id/toggle — activar/desactivar taller (solo admin)
router.put("/:id/toggle", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [[taller]] = await db.query("SELECT esta_activo FROM talleres WHERE id = ?", [req.params.id]);
    if (!taller) return res.status(404).json({ error: "Taller no encontrado" });
    await db.query("UPDATE talleres SET esta_activo = ? WHERE id = ?", [!taller.esta_activo, req.params.id]);
    res.json({ esta_activo: !taller.esta_activo });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/talleres/:id — eliminar taller (solo admin)
router.delete("/:id", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM talleres WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Taller no encontrado" });
    res.json({ mensaje: "Taller eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/talleres/:id/inscribir — estudiante se inscribe al taller
router.post("/:id/inscribir", verificarToken, soloRol("estudiante"), async (req, res) => {
  const tallerId = req.params.id;
  try {
    const [[taller]] = await db.query("SELECT esta_activo, cupos FROM talleres WHERE id = ?", [tallerId]);
    if (!taller) return res.status(404).json({ error: "Taller no encontrado" });
    if (!taller.esta_activo) return res.status(403).json({ error: "Este taller ya no está activo" });

    // Verificar cupos si tiene límite
    if (taller.cupos != null) {
      const [[{ inscritos }]] = await db.query(
        "SELECT COUNT(*) AS inscritos FROM inscripciones_talleres WHERE taller_id = ? AND estado != 'rechazado'",
        [tallerId]
      );
      if (inscritos >= taller.cupos)
        return res.status(409).json({ error: "El taller ya no tiene cupos disponibles" });
    }

    const [result] = await db.query(
      "INSERT INTO inscripciones_talleres (taller_id, estudiante_id) VALUES (?, ?)",
      [tallerId, req.usuario.id]
    );

    // Notificación al centro
    try {
      const [[est]]  = await db.query("SELECT nombre_completo FROM perfiles_estudiantes WHERE usuario_id = ?", [req.usuario.id]);
      const [[tal]]  = await db.query("SELECT titulo FROM talleres WHERE id = ?", [tallerId]);
      const [[centro]] = await db.query("SELECT id FROM usuarios WHERE rol = 'centro' LIMIT 1");
      if (centro) {
        await db.query(
          "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'postulacion_nueva', ?, ?)",
          [centro.id, `Nueva inscripción en "${tal.titulo}"`, `${est.nombre_completo} se ha inscrito al taller`]
        );
      }
    } catch (_) {}

    res.status(201).json({ id: result.insertId, mensaje: "Inscripción enviada" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Ya estás inscrito en este taller" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/talleres/:id/inscritos — admin ve inscritos de un taller
router.get("/:id/inscritos", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.estado, i.fecha_creacion,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, c.nombre AS carrera,
              pe.promedio, pe.calificacion_docente
       FROM inscripciones_talleres i
       JOIN perfiles_estudiantes pe ON pe.usuario_id = i.estudiante_id
       LEFT JOIN carreras c ON c.id = pe.carrera_id
       WHERE i.taller_id = ?
       ORDER BY i.fecha_creacion ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/talleres/inscripciones/:id/estado — admin actualiza estado de inscripción
router.put("/inscripciones/:id/estado", verificarToken, soloRol("centro"), async (req, res) => {
  const { estado } = req.body;
  if (!["pendiente", "aceptado", "rechazado"].includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
    const [[insc]] = await db.query(
      "SELECT i.estudiante_id, t.titulo FROM inscripciones_talleres i JOIN talleres t ON t.id = i.taller_id WHERE i.id = ?",
      [req.params.id]
    );
    if (!insc) return res.status(404).json({ error: "Inscripción no encontrada" });

    await db.query("UPDATE inscripciones_talleres SET estado = ? WHERE id = ?", [estado, req.params.id]);

    // Notificación al estudiante
    try {
      const titulo = estado === "aceptado" ? "¡Inscripción al taller aceptada!" : "Tu inscripción no fue aceptada";
      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, ?, ?, ?)",
        [insc.estudiante_id, estado === "aceptado" ? "postulacion_aceptada" : "postulacion_rechazada",
         titulo, `Taller: "${insc.titulo}"`]
      );
    } catch (_) {}

    res.json({ mensaje: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
