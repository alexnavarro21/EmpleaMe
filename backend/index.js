require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes            = require("./src/routes/auth");
const usuariosRoutes        = require("./src/routes/usuarios");
const perfilesRoutes        = require("./src/routes/perfiles");
const habilidadesRoutes     = require("./src/routes/habilidades");
const vacantesRoutes        = require("./src/routes/vacantes");
const postulacionesRoutes   = require("./src/routes/postulaciones");
const conversacionesRoutes  = require("./src/routes/conversaciones");
const mensajesDirectosRoutes = require("./src/routes/mensajes_directos");
const publicacionesRoutes   = require("./src/routes/publicaciones");
const comentariosRoutes     = require("./src/routes/comentarios");
const adminRoutes           = require("./src/routes/admin");
const notificacionesRoutes  = require("./src/routes/notificaciones");
const talleresRoutes        = require("./src/routes/talleres");
const mediaRoutes           = require("./src/routes/media");
const notasAdminRoutes      = require("./src/routes/notas_admin");
const iaRoutes              = require("./src/routes/ia");
const seguidoresRoutes      = require("./src/routes/seguidores");
const reportesRoutes        = require("./src/routes/reportes");
const slepRoutes            = require("./src/routes/slep");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",            authRoutes);
app.use("/api/usuarios",        usuariosRoutes);
app.use("/api/perfiles",        perfilesRoutes);
app.use("/api/habilidades",     habilidadesRoutes);
app.use("/api/vacantes",        vacantesRoutes);
app.use("/api/postulaciones",   postulacionesRoutes);
app.use("/api/conversaciones",  conversacionesRoutes);
app.use("/api/mensajes-directos", mensajesDirectosRoutes);
app.use("/api/publicaciones",   publicacionesRoutes);
app.use("/api/publicaciones/:id/comentarios", comentariosRoutes);
app.use("/api/notificaciones",  notificacionesRoutes);
app.use("/api/talleres",        talleresRoutes);
app.use("/api/admin",           adminRoutes);
app.use("/api/media",           mediaRoutes);
app.use("/api/notas-admin",     notasAdminRoutes);
app.use("/api/ia",             iaRoutes);
app.use("/api/seguidores",    seguidoresRoutes);
app.use("/api/reportes",     reportesRoutes);
app.use("/api/slep",         slepRoutes);

app.get("/", (req, res) => res.json({ status: "EmpleaMe API corriendo" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
