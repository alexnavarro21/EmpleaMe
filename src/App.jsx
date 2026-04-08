import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./context/DarkModeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Reels from "./pages/Reels";

import EstudianteDashboard from "./pages/estudiante/Dashboard";
import EstudiantePerfil from "./pages/estudiante/Perfil";
import EstudianteEvidencias from "./pages/estudiante/Evidencias";
import EstudianteMensajeria from "./pages/estudiante/EstudianteMensajeria";

import EmpresaDashboard from "./pages/empresa/Dashboard";
import EmpresaPublicar from "./pages/empresa/PublicarVacante";
import EmpresaBuscador from "./pages/empresa/BuscadorEstudiantes";
import EmpresaCandidato from "./pages/empresa/PerfilCandidato";
import EmpresaMensajeria from "./pages/empresa/EmpresaMensajeria";

import AdminPanel from "./pages/admin/Panel";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminEvaluaciones from "./pages/admin/Evaluaciones";
import AdminNotas from "./pages/admin/ImportarNotas";
import AdminTests from "./pages/admin/Tests";
import AdminMensajeria from "./pages/admin/Mensajeria";
import AdminMonitoreo from "./pages/admin/Monitoreo";

import BuscarPerfiles from "./pages/BuscarPerfiles";


export default function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>

            {/* Estudiante */}
            <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
            <Route path="/estudiante/perfil" element={<EstudiantePerfil />} />
            <Route path="/estudiante/evidencias" element={<EstudianteEvidencias />} />
            <Route path="/estudiante/mensajeria" element={<EstudianteMensajeria />} />
            <Route path="/estudiante/buscar" element={<BuscarPerfiles />} />
            <Route path="/estudiante/candidato/:id" element={<EmpresaCandidato />} />
            <Route path="/estudiante/reels" element={<Reels />} />

            {/* Empresa */}
            <Route path="/empresa/inicio" element={<EstudianteDashboard />} />
            <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
            <Route path="/empresa/publicar" element={<EmpresaPublicar />} />
            <Route path="/empresa/buscador" element={<EmpresaBuscador />} />
            <Route path="/empresa/buscar" element={<BuscarPerfiles />} />
            <Route path="/empresa/candidato/:id" element={<EmpresaCandidato />} />
            <Route path="/empresa/mensajeria" element={<EmpresaMensajeria />} />
            <Route path="/empresa/reels" element={<Reels />} />

            {/* Admin / Profesor */}
            <Route path="/admin/inicio" element={<EstudianteDashboard />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/evaluaciones" element={<AdminEvaluaciones />} />
            <Route path="/admin/notas" element={<AdminNotas />} />
            <Route path="/admin/tests" element={<AdminTests />} />
            <Route path="/admin/mensajeria" element={<AdminMensajeria />} />
            <Route path="/admin/monitoreo" element={<AdminMonitoreo />} />
            <Route path="/admin/buscar" element={<BuscarPerfiles />} />
            <Route path="/admin/candidato/:id" element={<EmpresaCandidato />} />
            <Route path="/admin/reels" element={<Reels />} />
          </Route>
        </Routes>
      </DarkModeProvider>
    </BrowserRouter>
  );
}
