const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");
const upload = require("../middleware/multerConfig"); // 👈 1. IMPORTAMOS MULTER

// POST /api/publicaciones — crear publicación (Soporta archivos y detecta errores)
router.post("/", verificarToken, upload.single("archivo_multimedia"), async (req, res) => {
  
  // --- EL DETECTOR ---
  console.log("\n====== NUEVO INTENTO DE PUBLICACIÓN ======");
  console.log("1. Datos de texto (req.body):", req.body);
  console.log("2. Archivo (req.file):", req.file);
  console.log("=========================================\n");

  const { titulo, contenido, tipo_nombre, vacante_id, tipo } = req.body;
  const archivo = req.file; // AQUÍ CAE EL ARCHIVO FÍSICO
  
  // Ajustes de variables por defecto
  const tituloFinal = titulo || "Actualización de estado";
  const tipoFinal = tipo_nombre || tipo || (archivo ? "multimedia" : "texto");

  try {
    const [tipoDb] = await db.query(
      "SELECT id FROM tipos_publicacion WHERE nombre = ?",
      [tipoFinal]
    );
    
    const tipoId = tipoDb.length > 0 ? tipoDb[0].id : 1; 

    let url_multimedia = null;
    if (archivo) {
      url_multimedia = `/uploads/${archivo.filename}`;
    }

    const [result] = await db.query(
      "INSERT INTO publicaciones (autor_id, tipo_id, vacante_id, titulo, contenido, url_multimedia) VALUES (?, ?, ?, ?, ?, ?)",
      [req.usuario.id, tipoId, vacante_id || null, tituloFinal, contenido || null, url_multimedia]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      mensaje: "Publicación creada con éxito",
      url_multimedia 
    });
  } catch (err) {
    console.error("Error al crear:", err);
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});
// GET /api/publicaciones — feed de publicaciones activas
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.titulo, p.contenido, p.publicado_en, p.vacante_id, p.url_multimedia,
              tp.nombre AS tipo,
              u.rol AS autor_rol,
              CASE u.rol
                WHEN 'empresa'    THEN pe.nombre_empresa
                WHEN 'estudiante' THEN est.nombre_completo
                ELSE 'Centro Educacional'
              END AS autor_nombre
       FROM publicaciones p
       JOIN tipos_publicacion tp  ON tp.id  = p.tipo_id
       JOIN usuarios u            ON u.id   = p.autor_id
       LEFT JOIN perfiles_empresas pe    ON pe.usuario_id  = u.id
       LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
       WHERE p.esta_activa = TRUE
       ORDER BY p.publicado_en DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/publicaciones — crear publicación (AHORA SOPORTA ARCHIVOS)
// 👈 2. AGREGAMOS upload.single('archivo_multimedia') EN LA RUTA
router.post("/", verificarToken, upload.single("archivo_multimedia"), async (req, res) => {
  // Nota: Desde React solo enviamos 'contenido' y 'tipo'. Si no viene 'titulo', 
  // le ponemos un valor por defecto o puedes ajustar el Frontend luego.
  const { titulo, contenido, tipo_nombre, vacante_id, tipo } = req.body;
  const archivo = req.file; // 👈 AQUÍ CAE EL ARCHIVO FÍSICO
  
  // Ajustamos variables para que no choque con lo que envía React actualmente
  const tituloFinal = titulo || "Actualización de estado";
  const tipoFinal = tipo_nombre || tipo || (archivo ? "multimedia" : "texto");

  try {
    // 1. Buscamos el ID del tipo de publicación
    const [tipoDb] = await db.query(
      "SELECT id FROM tipos_publicacion WHERE nombre = ?",
      [tipoFinal]
    );
    
    // Si no existe el tipo exacto, forzamos al menos un ID válido para que no explote
    const tipoId = tipoDb.length > 0 ? tipoDb[0].id : 1; 

    // 2. Preparamos la URL del archivo si es que el usuario subió uno
    let url_multimedia = null;
    if (archivo) {
      url_multimedia = `/uploads/${archivo.filename}`;
    }

    // 3. 👈 INSERTAMOS EN LA BASE DE DATOS (Incluyendo la URL del archivo)
    const [result] = await db.query(
      "INSERT INTO publicaciones (autor_id, tipo_id, vacante_id, titulo, contenido, url_multimedia) VALUES (?, ?, ?, ?, ?, ?)",
      [req.usuario.id, tipoId, vacante_id || null, tituloFinal, contenido || null, url_multimedia]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      mensaje: "Publicación creada con éxito",
      url_multimedia 
    });
  } catch (err) {
    console.error("Error al crear:", err);
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/publicaciones/:id — desactivar publicación (autor o centro)
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { id, rol } = req.usuario;
    let result;

    if (rol === "centro") {
      [result] = await db.query(
        "UPDATE publicaciones SET esta_activa = FALSE WHERE id = ?",
        [req.params.id]
      );
    } else {
      [result] = await db.query(
        "UPDATE publicaciones SET esta_activa = FALSE WHERE id = ? AND autor_id = ?",
        [req.params.id, id]
      );
    }

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Publicación no encontrada o sin permisos" });

    res.json({ mensaje: "Publicación eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;