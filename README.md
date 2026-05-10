# EmpleaMe

Plataforma web que conecta estudiantes técnicos con empresas que ofrecen prácticas laborales. Gestiona el proceso completo: desde el registro de estudiantes y empresas, publicación y postulación a vacantes, hasta el seguimiento y gestión por parte de colegios técnicos y el SLEP (Servicio Local de Educación Pública).

---

## Tecnologías

### Frontend
- **React 19** + **Vite**
- **Tailwind CSS v4**
- **React Router DOM v7**
- **Framer Motion** — animaciones
- **Iconify** — íconos
- **html2canvas + jsPDF** — generación de CV en PDF

### Backend
- **Node.js** + **Express 4**
- **MySQL 2** — base de datos relacional
- **JWT (jsonwebtoken)** — autenticación por tokens
- **bcrypt** — hash de contraseñas
- **multer + sharp + ffmpeg** — subida y compresión de archivos multimedia
- **Google Gemini AI** — moderación de contenido y análisis de compatibilidad

### Infraestructura
- **Railway** — backend, base de datos MySQL y almacenamiento de archivos (bucket S3-compatible)
- **Vercel** — despliegue del frontend

---

## Roles

| Rol | Descripción |
|-----|-------------|
| `estudiante` | Crea perfil, postula a vacantes, sube documentos, usa mensajería |
| `empresa` | Publica vacantes, gestiona postulaciones, busca candidatos |
| `colegio` | Administra estudiantes de su establecimiento, talleres, evaluaciones y estadísticas |
| `slep` | Supervisa colegios y empresas de la región, visualiza reportes y estadísticas regionales |

---

## Estructura del proyecto

```
empleame/
├── src/                            # Frontend (React)
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx           # Autenticación (login y registro)
│   │   ├── estudiante/
│   │   │   ├── Perfil.jsx          # Perfil editable, generación de CV PDF
│   │   │   ├── MisPostulaciones.jsx
│   │   │   └── EstudianteMensajeria.jsx
│   │   ├── empresa/
│   │   │   ├── Dashboard.jsx       # Panel con vacantes publicadas
│   │   │   ├── Perfil.jsx
│   │   │   ├── PublicarVacante.jsx
│   │   │   ├── BuscadorEstudiantes.jsx
│   │   │   └── EmpresaMensajeria.jsx
│   │   ├── colegio/
│   │   │   ├── Panel.jsx           # KPIs, habilidades, muro del colegio
│   │   │   ├── Perfil.jsx
│   │   │   ├── Usuarios.jsx        # Gestión de estudiantes y empresas
│   │   │   ├── Talleres.jsx
│   │   │   ├── Reportes.jsx
│   │   │   └── Mensajeria.jsx
│   │   ├── slep/
│   │   │   ├── Panel.jsx           # Panel regional SLEP
│   │   │   ├── Perfil.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   ├── Colegios.jsx
│   │   │   ├── Empresas.jsx
│   │   │   ├── Reportes.jsx
│   │   │   └── Mensajeria.jsx
│   │   ├── shared/
│   │   │   ├── Muro.jsx            # Feed de publicaciones (todos los roles)
│   │   │   ├── BuscarPerfiles.jsx
│   │   │   ├── PerfilCandidato.jsx
│   │   │   ├── Notificaciones.jsx
│   │   │   └── Seguidores.jsx
│   │   └── public/
│   │       ├── PerfilEmpresaPublico.jsx
│   │       └── PerfilColegioPublico.jsx
│   ├── components/                 # Componentes reutilizables (Layout, modales, UI)
│   ├── context/
│   │   └── DarkModeContext.jsx     # Tema claro / oscuro / alto contraste
│   ├── services/
│   │   └── api.js                  # Cliente HTTP con JWT hacia el backend
│   ├── utils/
│   │   ├── generarCV.js            # Generación de CV en PDF
│   │   ├── perfilCompletitud.js    # Cálculo % completitud del perfil
│   │   └── validarRut.js           # Validación y formato de RUT chileno
│   └── data/
│       └── regionesComunas.js      # Regiones y comunas de Chile
├── backend/
│   ├── index.js                    # Entrada Express, registro de routers
│   ├── scripts/
│   │   └── set-bucket-public.js    # Script de configuración del bucket
│   └── src/
│       ├── db.js                   # Pool de conexiones MySQL
│       ├── middleware/
│       │   ├── auth.js             # Verificación JWT y control de roles
│       │   ├── multerConfig.js     # Subida directa al bucket Railway
│       │   └── compressAndUpload.js # Compresión de imagen/video antes de subir
│       └── routes/
│           ├── auth.js             # POST /register, /login
│           ├── usuarios.js         # CRUD usuarios
│           ├── perfiles.js         # Perfiles estudiante y empresa
│           ├── habilidades.js      # Catálogo de habilidades
│           ├── vacantes.js         # Publicación y consulta de vacantes
│           ├── postulaciones.js    # Postulaciones y cambios de estado
│           ├── publicaciones.js    # Feed de publicaciones con multimedia
│           ├── comentarios.js      # Comentarios en publicaciones
│           ├── conversaciones.js   # Chat empresa ↔ estudiante
│           ├── mensajes_directos.js # Chat estudiante ↔ estudiante
│           ├── notificaciones.js   # Notificaciones en tiempo real
│           ├── talleres.js         # CRUD talleres e inscripciones
│           ├── admin.js            # Rutas exclusivas del colegio/admin
│           ├── slep.js             # Rutas exclusivas del SLEP
│           ├── ia.js               # Moderación IA y ranking de candidatos
│           ├── seguidores.js       # Sistema de seguimiento entre usuarios
│           ├── buscar.js           # Búsqueda de perfiles
│           ├── reportes.js         # Reportes y estadísticas
│           ├── notas_admin.js      # Notas privadas del admin por conversación
│           └── media.js            # Proxy de archivos desde el bucket
└── sql/
    └── 01_creacion_db_tablas.sql   # Script de creación de tablas
```

---

## Instalación local

### Requisitos
- Node.js 18+
- MySQL accesible (local o en Railway)

### 1. Clonar el repositorio

```bash
git clone https://github.com/alexnavarro21/EmpleaMe.git
cd EmpleaMe
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear `backend/.env`:

```env
# Base de datos
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=railway

# Autenticación
JWT_SECRET=una_clave_secreta_larga
PORT=3001

# Almacenamiento (Railway Bucket, S3-compatible)
S3_ENDPOINT=https://tu-bucket-endpoint.railway.app
S3_REGION=auto
S3_ACCESS_KEY_ID=tu_access_key
S3_SECRET_ACCESS_KEY=tu_secret_key
S3_BUCKET_NAME=nombre_del_bucket
S3_PUBLIC_URL=https://url-publica-del-bucket

# IA
GEMINI_API_KEY=tu_clave_gemini
```

Inicializar la base de datos:

```bash
mysql -u root -p railway < ../sql/01_creacion_db_tablas.sql
```

Iniciar el backend:

```bash
npm run dev    # con hot-reload (nodemon)
# o
npm start      # producción
```

### 3. Configurar el frontend

```bash
cd ..
npm install
```

Crear `.env` en la raíz:

```env
VITE_API_URL=http://localhost:3001/api
```

Iniciar el frontend:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `DB_HOST` | Host de la base de datos MySQL |
| `DB_PORT` | Puerto MySQL (por defecto `3306`) |
| `DB_USER` | Usuario MySQL |
| `DB_PASSWORD` | Contraseña MySQL |
| `DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `PORT` | Puerto del servidor Express (por defecto `3001`) |
| `S3_ENDPOINT` | Endpoint del bucket Railway (S3-compatible) |
| `S3_REGION` | Región del bucket (generalmente `auto`) |
| `S3_ACCESS_KEY_ID` | Access key del bucket |
| `S3_SECRET_ACCESS_KEY` | Secret key del bucket |
| `S3_BUCKET_NAME` | Nombre del bucket |
| `S3_PUBLIC_URL` | URL pública base para acceder a los archivos |
| `GEMINI_API_KEY` | Clave de Google Gemini AI |

### Frontend (`.env` en la raíz)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend (ej. `https://tu-backend.railway.app/api`) |

---

## API — Endpoints principales

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión, retorna JWT |

### Perfiles y usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/perfiles/estudiante/:id` | Perfil de estudiante |
| GET | `/api/perfiles/empresa/:id` | Perfil de empresa |
| GET | `/api/usuarios` | Listar usuarios (admin) |
| GET | `/api/buscar` | Búsqueda de perfiles por nombre/carrera |

### Vacantes y postulaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/vacantes` | Listar vacantes |
| POST | `/api/vacantes` | Publicar vacante (empresa) |
| POST | `/api/postulaciones` | Postularse a una vacante |
| PUT | `/api/postulaciones/:id/estado` | Cambiar estado de postulación |

### Feed y comunicación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/publicaciones` | Listar publicaciones del feed |
| POST | `/api/publicaciones` | Crear publicación con multimedia |
| GET | `/api/conversaciones` | Listar conversaciones (empresa↔estudiante) |
| GET | `/api/mensajes-directos` | Mensajes directos (estudiante↔estudiante) |
| GET | `/api/notificaciones` | Notificaciones del usuario |

### IA
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ia/resumen/:estudianteId/:vacanteId` | Resumen de compatibilidad candidato–vacante |
| GET | `/api/ia/ranking/:vacanteId` | Ranking IA de postulantes a una vacante |
| POST | `/api/ia/moderar` | Moderación de contenido antes de publicar |

---

## Despliegue

- **Frontend:** desplegado en [Vercel](https://vercel.com). Configurado con `vercel.json` en la raíz.
- **Backend:** desplegado en [Railway](https://railway.app). Root directory: `/backend`.
- **Base de datos:** MySQL en Railway.
- **Almacenamiento de archivos:** Railway Bucket (API S3-compatible). Los archivos se sirven a través de `/api/media/uploads/:filename`.

Para que el frontend apunte al backend en producción, configurar en `.env`:

```env
VITE_API_URL=https://tu-backend.railway.app/api
```
