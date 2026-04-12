const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/talleres — listar talleres activos (cualquier usuario autenticado)
router.get("/", verificarToken, async (req, res) => {
  try {
    const { todos } = req.query; // admin puede pedir todos incluyendo inactivos
    const soloActivos = todos !== "1" || req.usuario.rol !== "admin";
    const [rows] = await db.query(
      `SELECT * FROM talleres ${soloActivos ? "WHERE esta_activo = TRUE" : ""} ORDER BY creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/talleres — crear taller (solo admin)
router.post("/", verificarToken, soloRol("centro"), async (req, res) => {
  const { titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, direccion, fecha_inicio, fecha_limite, cupos } = req.body;
  if (!titulo) return res.status(400).json({ error: "El título es requerido" });
  try {
    const [result] = await db.query(
      `INSERT INTO talleres (titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, direccion, fecha_inicio, fecha_limite, cupos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion || null,
        requisitos  || null,
        area        || null,
        modalidad   || "presencial",
        duracion    || null,
        horario     || null,
        costo != null ? costo : 0,
        direccion   || null,
        fecha_inicio || null,
        fecha_limite || null,
        cupos != null ? cupos : null,
      ]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Taller creado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/talleres/:id — editar taller (solo admin)
router.put("/:id", verificarToken, soloRol("centro"), async (req, res) => {
  const { titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, direccion, fecha_inicio, fecha_limite, cupos } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE talleres SET titulo=?, descripcion=?, requisitos=?, area=?, modalidad=?, duracion=?, horario=?, costo=?, direccion=?, fecha_inicio=?, fecha_limite=?, cupos=?
       WHERE id = ?`,
      [
        titulo,
        descripcion || null,
        requisitos  || null,
        area        || null,
        modalidad   || "presencial",
        duracion    || null,
        horario     || null,
        costo != null ? costo : 0,
        direccion   || null,
        fecha_inicio || null,
        fecha_limite || null,
        cupos != null ? cupos : null,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Taller no encontrado" });
    res.json({ mensaje: "Taller actualizado" });
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

module.exports = router;
