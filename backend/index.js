require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes       = require("./src/routes/auth");
const usuariosRoutes   = require("./src/routes/usuarios");
const perfilesRoutes   = require("./src/routes/perfiles");
const habilidadesRoutes = require("./src/routes/habilidades");
const vacantesRoutes   = require("./src/routes/vacantes");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth",        authRoutes);
app.use("/api/usuarios",    usuariosRoutes);
app.use("/api/perfiles",    perfilesRoutes);
app.use("/api/habilidades", habilidadesRoutes);
app.use("/api/vacantes",    vacantesRoutes);

app.get("/", (req, res) => res.json({ status: "EmpleaMe API corriendo" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
