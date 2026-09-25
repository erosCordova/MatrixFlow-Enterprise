# MatrixFlow Enterprise

Sistema web empresarial para registrar, organizar y analizar información de ventas, inventario, productos, sucursales, metas, vectores y matrices.

MatrixFlow Enterprise integra un frontend desarrollado con React + TypeScript, una API desarrollada con FastAPI, persistencia en PostgreSQL y un motor matemático en Python para las operaciones de álgebra lineal.

---

## Arquitectura

```text
React + TypeScript
        ↓
TanStack Query / Axios
        ↓
FastAPI
        ↓
Services
├── Lógica empresarial
└── Motor matemático
        ↓
PostgreSQL
        ↓
JSON
        ↓
React
```

---

## Tecnologías

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- Axios
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod
- Recharts

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL
- PyJWT
- bcrypt
- pytest

---

## Estructura del proyecto

```text
matrixflow-enterprise/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── schemas/
│   │   └── main.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── algorithms/
│   │   └── main.py
│   ├── requirements.txt
│   └── alembic.ini
│
├── database/
├── docs/
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Módulos del sistema

MatrixFlow Enterprise incluye los siguientes módulos:

- Inicio de sesión.
- Usuarios y roles.
- Empresa.
- Sucursales.
- Productos y categorías.
- Ventas.
- Inventario.
- Movimientos de inventario.
- Metas.
- Vectores.
- Matrices.
- Operaciones vectoriales.
- Operaciones matriciales.
- Combinaciones lineales.
- Historial de operaciones.
- Reportes.
- Auditoría.

---

## Roles

El sistema utiliza tres roles principales.

### Administrador

Puede acceder a la administración del sistema, usuarios, empresa, ventas, inventario, vectores, matrices, operaciones, reportes y configuración.

### Analista

Puede trabajar con ventas, inventario, metas, vectores, matrices, operaciones matemáticas y reportes.

### Consulta

Tiene acceso principalmente al dashboard y a reportes autorizados.

---

## Seguridad

El sistema implementa:

- Autenticación mediante JWT.
- Bearer Token.
- Contraseñas almacenadas mediante hash.
- Control de acceso por roles.
- Bloqueo de usuarios inactivos.
- Protección de endpoints.
- Auditoría de solicitudes realizadas a la API.
- Configuración CORS mediante `FRONTEND_URL`.

---

## Variables de entorno

El proyecto incluye un archivo:

```text
.env.example
```

Este archivo sirve como referencia.

No debe contener contraseñas ni secretos reales.

### Backend

El backend utiliza un archivo:

```text
backend/.env
```

Ejemplo:

```env
NOMBRE_APP=MatrixFlow Enterprise API
VERSION=1.0.0
ENTORNO=desarrollo

FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql+psycopg://USUARIO:CONTRASENA@HOST:5432/BASE_DE_DATOS

JWT_SECRET_KEY=CAMBIAR_POR_UNA_CLAVE_SEGURA
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

### Frontend

El frontend utiliza:

```text
frontend/.env
```

Ejemplo:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

# Instalación del backend

Entrar al backend:

```bash
cd backend
```

Crear el entorno virtual:

```bash
python -m venv .venv
```

En Git Bash de Windows:

```bash
source .venv/Scripts/activate
```

Instalar las dependencias:

```bash
python -m pip install -r requirements.txt
```

---

## Migraciones

Aplicar las migraciones de la base de datos:

```bash
alembic upgrade head
```

---

## Ejecutar backend

Con el entorno virtual activado:

```bash
uvicorn app.main:app --reload
```

Por defecto estará disponible en:

```text
http://localhost:8000
```

La documentación interactiva estará disponible en:

```text
http://localhost:8000/docs
```

---

# Instalación del frontend

Abrir otra terminal y entrar al frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Vite normalmente utilizará:

```text
http://localhost:5173
```

---

## Build del frontend

```bash
npm run build
```

---

## Lint del frontend

```bash
npm run lint
```

---

## Vista previa

```bash
npm run preview
```

---

# PostgreSQL mediante Docker

El proyecto incluye:

```text
docker-compose.yml
```

Este archivo permite levantar una instancia PostgreSQL local.

Configura las variables:

```env
POSTGRES_DB=matrixflow
POSTGRES_USER=matrixflow
POSTGRES_PASSWORD=CAMBIAR_PASSWORD
POSTGRES_PORT=5432
```

Levantar PostgreSQL:

```bash
docker compose up -d postgres
```

Verificar el contenedor:

```bash
docker compose ps
```

Detenerlo:

```bash
docker compose down
```

Eliminar también el volumen:

```bash
docker compose down -v
```

---

# Pruebas del backend

Entrar al backend:

```bash
cd backend
```

Activar el entorno virtual:

```bash
source .venv/Scripts/activate
```

Ejecutar:

```bash
pytest tests -q
```

Las pruebas permiten verificar:

- Algoritmos.
- Servicios.
- API.
- Integración.
- Autenticación.
- Roles y permisos.
- Manejo de errores.

---

# API

Los endpoints principales utilizan el prefijo:

```text
/api/v1
```

Entre los módulos disponibles se encuentran:

```text
/api/v1/auth
/api/v1/usuarios
/api/v1/empresas
/api/v1/sucursales
/api/v1/productos
/api/v1/ventas
/api/v1/inventario
/api/v1/metas
/api/v1/vectores
/api/v1/matrices
/api/v1/operaciones
/api/v1/reportes
/api/v1/auditoria
```

---

# Auditoría

MatrixFlow Enterprise registra eventos generados mediante la API.

La información registrada puede incluir:

- Usuario.
- Acción.
- Módulo o entidad.
- Ruta.
- Dirección IP cuando corresponde.
- Estado.
- Código de resultado.

La ruta de salud no genera registros de auditoría para evitar almacenar eventos innecesarios.

El inicio de sesión registra su propia auditoría.

---

# Frontend

El frontend utiliza TanStack Query para administrar los datos provenientes del servidor.

Axios realiza la comunicación HTTP con la API.

React Hook Form y Zod se utilizan para los formularios y validación.

Tailwind CSS y shadcn/ui forman parte del sistema visual.

Lucide React proporciona los iconos.

Recharts permite mostrar los indicadores y gráficos del dashboard y los reportes.

---

# Base de datos

La persistencia utiliza PostgreSQL.

Entre las entidades principales se encuentran:

```text
users
roles
companies
branches
categories
products
sales
sale_details
inventory
inventory_movements
targets
vectors
vector_values
matrices
matrix_values
operations
operation_inputs
operation_results
audit_logs
```

Alembic administra las migraciones de la base de datos.

---

# Validación final

Antes de realizar una entrega final deben ejecutarse las pruebas del backend:

```bash
cd backend
pytest tests -q
```

Y comprobar el frontend:

```bash
cd frontend
npm run build
npm run lint
```

También deben verificarse manualmente:

- Inicio de sesión.
- Navegación.
- Formularios.
- CRUD.
- Roles y permisos.
- Operaciones matemáticas.
- Historial.
- Reportes.
- Diseño responsive.
