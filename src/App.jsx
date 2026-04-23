import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./context/DarkModeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";

import EstudianteDashboard from "./pages/estudiante/Dashboard";
import EstudiantePerfil from "./pages/estudiante/Perfil";
import EstudianteMensajeria from "./pages/estudiante/EstudianteMensajeria";
import MisPostulaciones from "./pages/estudiante/MisPostulaciones";

import EmpresaDashboard from "./pages/empresa/Dashboard";
import EmpresaPerfil from "./pages/empresa/Perfil";
import EmpresaPublicar from "./pages/empresa/PublicarVacante";
import EmpresaBuscador from "./pages/empresa/BuscadorEstudiantes";
import EmpresaCandidato from "./pages/empresa/PerfilCandidato";
import EmpresaMensajeria from "./pages/empresa/EmpresaMensajeria";

import AdminPanel from "./pages/admin/Panel";
import AdminPerfil from "./pages/admin/Perfil";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminEvaluaciones from "./pages/admin/Evaluaciones";
import AdminTalleres from "./pages/admin/Talleres";
import { Navigate } from "react-router-dom";
import AdminMensajeria from "./pages/admin/Mensajeria";
import AdminReportes from "./pages/admin/Reportes";

import SlepPanel      from "./pages/slep/Panel";
import SlepEmpresas   from "./pages/slep/Empresas";
import SlepColegios   from "./pages/slep/Colegios";
import SlepReportes   from "./pages/slep/Reportes";
import SlepMensajeria from "./pages/slep/Mensajeria";

import BuscarPerfiles from "./pages/BuscarPerfiles";
import PerfilEmpresaPublico from "./pages/PerfilEmpresaPublico";
import Notificaciones from "./pages/Notificaciones";
import Seguidores from "./pages/Seguidores";


export default function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>

            {/* Perfil público de empresa — accesible desde cualquier rol */}
            <Route path="/empresa-publica/:id" element={<PerfilEmpresaPublico />} />

            {/* Estudiante */}
            <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
            <Route path="/estudiante/perfil" element={<EstudiantePerfil />} />
            <Route path="/estudiante/mensajeria" element={<EstudianteMensajeria />} />
            <Route path="/estudiante/postulaciones" element={<MisPostulaciones />} />
            <Route path="/estudiante/buscar" element={<BuscarPerfiles />} />
            <Route path="/estudiante/notificaciones" element={<Notificaciones />} />
            <Route path="/estudiante/seguidores" element={<Seguidores />} />
            <Route path="/estudiante/candidato/:id" element={<EmpresaCandidato />} />

            {/* Empresa */}
            <Route path="/empresa/inicio" element={<EstudianteDashboard />} />
            <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
            <Route path="/empresa/perfil" element={<EmpresaPerfil />} />
            <Route path="/empresa/publicar" element={<EmpresaPublicar />} />
            <Route path="/empresa/buscador" element={<EmpresaBuscador />} />
            <Route path="/empresa/buscar" element={<BuscarPerfiles />} />
            <Route path="/empresa/candidato/:id" element={<EmpresaCandidato />} />
            <Route path="/empresa/mensajeria" element={<EmpresaMensajeria />} />
            <Route path="/empresa/notificaciones" element={<Notificaciones />} />
            <Route path="/empresa/seguidores" element={<Seguidores />} />

            {/* Colegio (ex Admin) */}
            <Route path="/admin/inicio" element={<EstudianteDashboard />} />
            <Route path="/admin/perfil" element={<AdminPerfil />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/evaluaciones" element={<AdminEvaluaciones />} />
            <Route path="/admin/notas" element={<Navigate to="/admin/evaluaciones" replace />} />
            <Route path="/admin/tests" element={<Navigate to="/admin/evaluaciones" replace />} />
            <Route path="/admin/talleres" element={<AdminTalleres />} />
            <Route path="/admin/mensajeria" element={<AdminMensajeria />} />
            <Route path="/admin/reportes" element={<AdminReportes />} />
            <Route path="/admin/buscar" element={<BuscarPerfiles />} />
            <Route path="/admin/candidato/:id" element={<EmpresaCandidato />} />
            <Route path="/admin/notificaciones" element={<Notificaciones />} />

            {/* SLEP */}
            <Route path="/slep/inicio"         element={<EstudianteDashboard />} />
            <Route path="/slep/panel"          element={<SlepPanel />} />
            <Route path="/slep/empresas"       element={<SlepEmpresas />} />
            <Route path="/slep/colegios"       element={<SlepColegios />} />
            <Route path="/slep/reportes"       element={<SlepReportes />} />
            <Route path="/slep/candidato/:id"  element={<EmpresaCandidato />} />
            <Route path="/slep/buscar"          element={<BuscarPerfiles />} />
            <Route path="/slep/mensajeria"     element={<SlepMensajeria />} />
            <Route path="/slep/notificaciones" element={<Notificaciones />} />
          </Route>
        </Routes>
      </DarkModeProvider>
    </BrowserRouter>
  );
}
