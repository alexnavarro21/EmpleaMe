import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DarkModeProvider } from "./context/DarkModeContext";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";

import Muro from "./pages/shared/Muro";
import EstudiantePerfil from "./pages/estudiante/Perfil";
import EstudianteMensajeria from "./pages/estudiante/EstudianteMensajeria";
import MisPostulaciones from "./pages/estudiante/MisPostulaciones";

import EmpresaDashboard from "./pages/empresa/Dashboard";
import EmpresaPerfil from "./pages/empresa/Perfil";
import EmpresaPublicar from "./pages/empresa/PublicarVacante";
import EmpresaBuscador from "./pages/empresa/BuscadorEstudiantes";
import EmpresaMensajeria from "./pages/empresa/EmpresaMensajeria";

import ColegioPanel from "./pages/colegio/Panel";
import ColegioPerfil from "./pages/colegio/Perfil";
import ColegioUsuarios from "./pages/colegio/Usuarios";
import ColegioTalleres from "./pages/colegio/Talleres";
import ColegioMensajeria from "./pages/colegio/Mensajeria";
import ColegioReportes from "./pages/colegio/Reportes";

import SlepPanel      from "./pages/slep/Panel";
import SlepUsuarios   from "./pages/slep/Usuarios";
import SlepReportes   from "./pages/slep/Reportes";
import SlepMensajeria from "./pages/slep/Mensajeria";
import SlepPerfil     from "./pages/slep/Perfil";

import BuscarPerfiles       from "./pages/shared/BuscarPerfiles";
import PerfilCandidato      from "./pages/shared/PerfilCandidato";
import PerfilEmpresaPublico from "./pages/public/PerfilEmpresaPublico";
import PerfilColegioPublico from "./pages/public/PerfilColegioPublico";
import Notificaciones       from "./pages/shared/Notificaciones";
import Seguidores           from "./pages/shared/Seguidores";


export default function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>

            {/* Perfiles públicos — accesibles desde cualquier rol */}
            <Route path="/empresa-publica/:id" element={<PerfilEmpresaPublico />} />
            <Route path="/colegio-publico/:id" element={<PerfilColegioPublico />} />

            {/* Estudiante */}
            <Route path="/estudiante/muro" element={<Muro />} />
            <Route path="/estudiante/perfil" element={<EstudiantePerfil />} />
            <Route path="/estudiante/mensajeria" element={<EstudianteMensajeria />} />
            <Route path="/estudiante/postulaciones" element={<MisPostulaciones />} />
            <Route path="/estudiante/buscar" element={<BuscarPerfiles />} />
            <Route path="/estudiante/notificaciones" element={<Notificaciones />} />
            <Route path="/estudiante/seguidores" element={<Seguidores />} />
            <Route path="/estudiante/candidato/:id" element={<PerfilCandidato />} />

            {/* Empresa */}
            <Route path="/empresa/muro" element={<Muro />} />
            <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
            <Route path="/empresa/perfil" element={<EmpresaPerfil />} />
            <Route path="/empresa/publicar" element={<EmpresaPublicar />} />
            <Route path="/empresa/buscador" element={<EmpresaBuscador />} />
            <Route path="/empresa/buscar" element={<BuscarPerfiles />} />
            <Route path="/empresa/candidato/:id" element={<PerfilCandidato />} />
            <Route path="/empresa/mensajeria" element={<EmpresaMensajeria />} />
            <Route path="/empresa/notificaciones" element={<Notificaciones />} />
            <Route path="/empresa/seguidores" element={<Seguidores />} />

            {/* Colegio */}
            <Route path="/admin/muro" element={<Muro />} />
            <Route path="/admin/perfil" element={<ColegioPerfil />} />
            <Route path="/admin/panel" element={<ColegioPanel />} />
            <Route path="/admin/usuarios" element={<ColegioUsuarios />} />
            <Route path="/admin/notas" element={<Navigate to="/admin/usuarios" replace />} />
            <Route path="/admin/tests" element={<Navigate to="/admin/usuarios" replace />} />
            <Route path="/admin/talleres" element={<ColegioTalleres />} />
            <Route path="/admin/mensajeria" element={<ColegioMensajeria />} />
            <Route path="/admin/reportes" element={<ColegioReportes />} />
            <Route path="/admin/buscar" element={<BuscarPerfiles />} />
            <Route path="/admin/candidato/:id" element={<PerfilCandidato />} />
            <Route path="/admin/notificaciones" element={<Notificaciones />} />

            {/* SLEP */}
            <Route path="/slep/perfil"         element={<SlepPerfil />} />
            <Route path="/slep/muro"           element={<Muro />} />
            <Route path="/slep/panel"          element={<SlepPanel />} />
            <Route path="/slep/usuarios"       element={<SlepUsuarios />} />
            <Route path="/slep/reportes"       element={<SlepReportes />} />
            <Route path="/slep/candidato/:id"  element={<PerfilCandidato />} />
            <Route path="/slep/buscar"          element={<BuscarPerfiles />} />
            <Route path="/slep/mensajeria"     element={<SlepMensajeria />} />
            <Route path="/slep/notificaciones" element={<Notificaciones />} />
          </Route>
        </Routes>
      </DarkModeProvider>
    </BrowserRouter>
  );
}
