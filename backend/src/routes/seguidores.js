const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// Detecta si la tabla seguidores existe (migración 25 aplicada)
let seguidoresDisponible = null;
async function tieneTablaSeguidores() {
  if (seguidoresDisponible !== null) return seguidoresDisponible;
  try {
    const [rows] = await db.query(
      "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='seguidores' AND TABLE_SCHEMA=DATABASE() LIMIT 1"
    );
    seguidoresDisponible = rows.length > 0;
  } catch {
    seguidoresDisponible = false;
  }
  return seguidoresDisponible;
}

// Obtiene nombre y foto de un usuario según su rol
async function getDatosUsuario(usuarioId) {
  const [[u]] = await db.query(
    `SELECT u.id, u.rol,
      CASE u.rol
        WHEN 'empresa'    THEN pe.nombre_empresa
        WHEN 'estudiante' THEN est.nombre_completo
        ELSE 'Administrador'
      END AS nombre,
      CASE u.rol
        WHEN 'empresa'    THEN pe.foto_perfil
        WHEN 'estudiante' THEN est.foto_perfil
        ELSE NULL
      END AS foto_perfil
     FROM usuarios u
     LEFT JOIN perfiles_empresas pe     ON pe.usuario_id  = u.id
     LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
     WHERE u.id = ?`,
    [usuarioId]
  );
  return u || null;
}

// POST /api/seguidores/:id/toggle — seguir/dejar de seguir al usuario :id
router.post("/:id/toggle", verificarToken, async (req, res) => {
  const seguidoId  = parseInt(req.params.id);
  const seguidorId = req.usuario.id;

  if (seguidoId === seguidorId) {
    return res.status(400).json({ error: "No puedes seguirte a ti mismo" });
  }

  try {
    const hayTabla = await tieneTablaSeguidores();
    if (!hayTabla) return res.status(503).json({ error: "Función no disponible aún" });

    // ¿Ya sigo a este usuario?
    const [[existente]] = await db.query(
      "SELECT id FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
      [seguidorId, seguidoId]
    );

    if (existente) {
      // Dejar de seguir
      await db.query(
        "DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
        [seguidorId, seguidoId]
      );
      res.json({ siguiendo: false });
    } else {
      // Seguir
      await db.query(
        "INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)",
        [seguidorId, seguidoId]
      );

      // Crear notificación para el usuario seguido
      const seguidor = await getDatosUsuario(seguidorId);
      if (seguidor) {
        await db.query(
          `INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido)
           VALUES (?, 'seguidor', ?, ?)`,
          [
            seguidoId,
            `${seguidor.nombre} ahora te sigue`,
            `${seguidor.nombre} comenzó a seguirte en EmpleaMe.`,
          ]
        );
      }

      res.json({ siguiendo: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/seguidores/:id/estado — ¿sigo yo al usuario :id? + conteos
router.get("/:id/estado", verificarToken, async (req, res) => {
  const seguidoId  = parseInt(req.params.id);
  const seguidorId = req.usuario.id;

  try {
    const hayTabla = await tieneTablaSeguidores();
    if (!hayTabla) return res.json({ siguiendo: false, seguidores: 0, siguiendo_count: 0 });

    const [[{ siguiendo }]] = await db.query(
      "SELECT COUNT(*) AS siguiendo FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
      [seguidorId, seguidoId]
    );
    const [[{ total_seguidores }]] = await db.query(
      "SELECT COUNT(*) AS total_seguidores FROM seguidores WHERE seguido_id = ?",
      [seguidoId]
    );
    const [[{ total_siguiendo }]] = await db.query(
      "SELECT COUNT(*) AS total_siguiendo FROM seguidores WHERE seguidor_id = ?",
      [seguidoId]
    );

    res.json({
      siguiendo: siguiendo > 0,
      seguidores: total_seguidores,
      siguiendo_count: total_siguiendo,
    });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/seguidores/:id/seguidores — lista de seguidores del usuario :id
router.get("/:id/seguidores", verificarToken, async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  try {
    const hayTabla = await tieneTablaSeguidores();
    if (!hayTabla) return res.json([]);

    const [rows] = await db.query(
      `SELECT u.id, u.rol,
        CASE u.rol
          WHEN 'empresa'    THEN pe.nombre_empresa
          WHEN 'estudiante' THEN est.nombre_completo
          ELSE 'Administrador'
        END AS nombre,
        CASE u.rol
          WHEN 'empresa'    THEN pe.foto_perfil
          WHEN 'estudiante' THEN est.foto_perfil
          ELSE NULL
        END AS foto_perfil,
        s.creado_en
       FROM seguidores s
       JOIN usuarios u             ON u.id  = s.seguidor_id
       LEFT JOIN perfiles_empresas pe     ON pe.usuario_id  = u.id
       LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
       WHERE s.seguido_id = ?
       ORDER BY s.creado_en DESC`,
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/seguidores/:id/siguiendo — lista de usuarios que sigue el usuario :id
router.get("/:id/siguiendo", verificarToken, async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  try {
    const hayTabla = await tieneTablaSeguidores();
    if (!hayTabla) return res.json([]);

    const [rows] = await db.query(
      `SELECT u.id, u.rol,
        CASE u.rol
          WHEN 'empresa'    THEN pe.nombre_empresa
          WHEN 'estudiante' THEN est.nombre_completo
          ELSE 'Administrador'
        END AS nombre,
        CASE u.rol
          WHEN 'empresa'    THEN pe.foto_perfil
          WHEN 'estudiante' THEN est.foto_perfil
          ELSE NULL
        END AS foto_perfil,
        s.creado_en
       FROM seguidores s
       JOIN usuarios u             ON u.id  = s.seguido_id
       LEFT JOIN perfiles_empresas pe     ON pe.usuario_id  = u.id
       LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
       WHERE s.seguidor_id = ?
       ORDER BY s.creado_en DESC`,
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
