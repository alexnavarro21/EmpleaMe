# EmpleaMe

Plataforma web que conecta estudiantes técnicos con empresas que ofrecen prácticas laborales. Permite a los estudiantes explorar y postular a vacantes, y a las empresas publicar oportunidades y gestionar candidatos.

---

## Tecnologías

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **React Router DOM v7**
- **Framer Motion** — animaciones
- **Iconify** — íconos

### Backend
- **Node.js** + **Express 4**
- **MySQL 2** — base de datos relacional
- **JWT (jsonwebtoken)** — autenticación por tokens
- **bcrypt** — hash de contraseñas
- **dotenv** — variables de entorno

### Infraestructura
- **Railway** — backend y base de datos MySQL desplegados en la nube

---

## Estructura del proyecto

```
empleame/
├── src/                        # Frontend (React)
│   ├── pages/
│   │   ├── Login.jsx           # Autenticación
│   │   ├── estudiante/         # Vistas del rol estudiante
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Perfil.jsx
│   │   │   ├── Evidencias.jsx
│   │   │   └── EstudianteMensajeria.jsx
│   │   ├── empresa/            # Vistas del rol empresa
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PublicarVacante.jsx
│   │   │   ├── BuscadorEstudiantes.jsx
│   │   │   ├── PerfilCandidato.jsx
│   │   │   └── EmpresaMensajeria.jsx
│   │   └── admin/              # Vistas del rol admin/docente
│   │       ├── Panel.jsx
│   │       ├── Usuarios.jsx
│   │       ├── Monitoreo.jsx
│   │       ├── Evaluaciones.jsx
│   │       ├── ImportarNotas.jsx
│   │       ├── Tests.jsx
│   │       └── Mensajeria.jsx
│   └── services/
│       └── api.js              # Cliente HTTP hacia el backend
├── backend/                    # Backend (Express)
│   ├── index.js                # Punto de entrada, configuración Express
│   └── src/
│       ├── db.js               # Pool de conexiones MySQL
│       ├── middleware/
│       │   └── auth.js         # Middleware JWT
│       └── routes/
│           ├── auth.js         # POST /api/auth/login, /register
│           ├── usuarios.js     # CRUD usuarios
│           ├── perfiles.js     # Perfiles estudiante/empresa
│           ├── habilidades.js  # Habilidades de estudiantes
│           └── vacantes.js     # Publicación y consulta de vacantes
└── sql/
    └── 01_creacion_db_tablas.sql  # Script de creación de tablas
```

---

## Roles

| Rol | Acceso |
|-----|--------|
| `estudiante` | Dashboard, perfil, evidencias, mensajería, postulaciones |
| `empresa` | Dashboard, publicar vacantes, buscar estudiantes, mensajería |
| `centro` (admin) | Panel de control, usuarios, monitoreo, evaluaciones, notas |

---

## Instalación local

### Requisitos
- Node.js 18+
- Una base de datos MySQL accesible (local o en la nube)

### 1. Clonar el repositorio

```bash
git clone https://github.com/alexnavarro21/EmpleaMe.git
cd EmpleaMe
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env   # o crea el .env manualmente
npm install
```

Contenido del `backend/.env`:

```env
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=railway
JWT_SECRET=una_clave_secreta_larga
PORT=3001
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
cd ..          # volver a la raíz
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

### Frontend (`.env` en la raíz)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend (ej. `https://empleame.up.railway.app/api`) |

---

## API — Endpoints principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión, retorna JWT |
| POST | `/api/auth/register` | Registrar nuevo usuario |

### Usuarios y perfiles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar usuarios |
| GET | `/api/perfiles` | Obtener perfiles |
| GET | `/api/habilidades` | Habilidades de estudiantes |

### Vacantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/vacantes` | Listar vacantes publicadas |
| POST | `/api/vacantes` | Publicar nueva vacante |

---

## Despliegue en Railway

El backend y la base de datos MySQL están desplegados en [Railway](https://railway.app).

- **Servicio backend:** `empleame.up.railway.app`  
- **Root Directory:** `/backend`  
- Las variables de entorno se configuran en Railway → Variables

Para que el frontend apunte al backend en producción, configurar en `.env`:

```env
VITE_API_URL=https://empleame.up.railway.app/api
```
