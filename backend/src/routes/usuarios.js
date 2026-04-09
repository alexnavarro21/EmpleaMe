const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");
const upload = require("../middleware/multerConfig"); // 👈 1. Importamos Multer

// ==========================================
// RUTAS PARA TODOS LOS USUARIOS AUTENTICADOS
// ==========================================

// PUT /api/usuarios/avatar — Subir o actualizar foto de perfil
router.put("/avatar", verificarToken, upload.single("foto_perfil"), async (req, res) => {
  try {
    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ error: "No se detectó ningún archivo." });
    }

    // multer-s3 devuelve la URL pública del bucket directamente en req.file.location
    const url_foto = archivo.location;

    await db.query(
      "UPDATE usuarios SET foto_perfil = ? WHERE id = ?",
      [url_foto, req.usuario.id]
    );

    res.json({
      mensaje: "Foto de perfil actualizada con éxito",
      foto_perfil: url_foto
    });

  } catch (err) {
    console.error("Error al subir avatar:", err);
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// ==========================================
// RUTAS EXCLUSIVAS PARA ADMINISTRADORES
// ==========================================

// GET /api/usuarios  — solo centro/admin
router.get("/", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, correo, rol, fecha_creacion, foto_perfil FROM usuarios ORDER BY fecha_creacion DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/usuarios/:id  — solo centro/admin
router.delete("/:id", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;

module.exports = router;
