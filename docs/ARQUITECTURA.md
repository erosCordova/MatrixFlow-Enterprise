# Arquitectura de MatrixFlow Enterprise

## 1. Descripción general

MatrixFlow Enterprise es un sistema web empresarial orientado al registro, administración y análisis de ventas, inventario, productos, sucursales, metas, vectores y matrices.

El sistema utiliza una arquitectura separada por responsabilidades:

```text
Usuario
   ↓
React + TypeScript
   ↓ HTTP / JSON
TanStack Query + Axios
   ↓
FastAPI + Python
   ├── Validación
   ├── Servicios empresariales
   └── Motor matemático NumPy
   ↓
SQLAlchemy
   ↓
PostgreSQL
   ↓
Historial / Auditoría
   ↓
JSON
   ↓
React / Interfaz
```

---

## 2. Frontend

El frontend se encuentra en:

```text
frontend/
```

Tecnologías principales:

```text
React
TypeScript
Vite
TanStack Query
Axios
Tailwind CSS
shadcn/ui
Lucide React
React Hook Form
Zod
Recharts
```

Responsabilidades principales:

```text
Interfaz de usuario
Navegación
Formularios
Validación del lado cliente
Consultas a la API
Manejo de estado del servidor
Visualización de gráficos
Control visual de acceso según rol
Diseño responsive
```

Estructura principal:

```text
frontend/src/
├── components/
├── hooks/
├── pages/
├── schemas/
├── services/
├── types/
└── main.tsx
```

También existen carpetas auxiliares utilizadas por la implementación, como:

```text
assets/
data/
lib/
styles/
```

---

## 3. Backend

El backend se encuentra en:

```text
backend/
```

Tecnologías principales:

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
NumPy
PyJWT
bcrypt
pytest
```

Estructura principal:

```text
backend/app/
├── api/
├── core/
├── models/
├── schemas/
├── services/
├── repositories/
├── algorithms/
└── main.py
```

### api

Contiene los endpoints REST de los módulos del sistema.

### core

Contiene configuración, seguridad y elementos centrales del backend.

### models

Contiene los modelos utilizados para la persistencia de información.

### schemas

Contiene los esquemas utilizados para validar datos de entrada y salida.

### services

Contiene la lógica empresarial.

### repositories

Carpeta destinada a la capa de acceso estructurado a datos.

### algorithms

Contiene los algoritmos matemáticos independientes del resto de la aplicación.

---

## 4. API

La API utiliza el prefijo:

```text
/api/v1
```

Los módulos principales incluyen:

```text
auth
usuarios
empresas
sucursales
productos
ventas
inventario
movimientos de inventario
metas
vectores
matrices
operaciones
reportes
auditoria
```

FastAPI también proporciona documentación interactiva en:

```text
http://localhost:8000/docs
```

cuando el backend se ejecuta localmente.

---

## 5. Base de datos

MatrixFlow Enterprise utiliza PostgreSQL como sistema principal de persistencia.

Las entidades contempladas por el proyecto son:

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

## 6. Motor matemático

El motor matemático se encuentra principalmente en:

```text
backend/app/algorithms/
```

Utiliza NumPy para realizar las operaciones.

### Vectores

El sistema contempla operaciones como:

```text
sum_vector()
subtract_vector()
scalar_multiply()
dot_product()
```

### Matrices

El sistema dispone de:

```text
add_matrix()
subtract_matrix()
multiply_matrix()
transpose_matrix()
scalar_multiply_matrix()
```

La implementación mantiene además funciones internas en español utilizadas por el sistema.

### Combinaciones lineales

El sistema permite utilizar vectores y escalares para obtener nuevas representaciones mediante combinaciones lineales.

---

## 7. Flujo de una operación matemática

El flujo general es:

```text
React
   ↓
Solicitud HTTP
   ↓
FastAPI
   ↓
Validación
   ↓
Servicio de operaciones
   ↓
Algoritmos NumPy
   ↓
Persistencia
   ↓
Historial
   ↓
Respuesta JSON
   ↓
Frontend
```

Esto permite mantener separados:

```text
Presentación
Comunicación HTTP
Validación
Lógica empresarial
Algoritmos matemáticos
Persistencia
Auditoría
```

---

## 8. Autenticación y autorización

El sistema utiliza autenticación mediante JWT.

El usuario inicia sesión y recibe un token que posteriormente se envía mediante:

```text
Authorization: Bearer TOKEN
```

El backend comprueba:

```text
Token válido
Usuario existente
Usuario activo
Rol autorizado
```

Los accesos no autorizados son rechazados por la API.

---

## 9. Roles

### Administrador

Dispone de acceso administrativo al sistema, incluyendo usuarios, empresa, ventas, inventario, vectores, matrices, operaciones, reportes y configuración.

### Analista

Puede trabajar principalmente con ventas, inventario, matrices, vectores, operaciones y reportes.

### Consulta

Puede acceder al Dashboard y a los reportes autorizados.

---

## 10. Auditoría

MatrixFlow Enterprise registra eventos realizados mediante la API.

La información registrada puede contener:

```text
Usuario
Acción
Entidad o módulo
Ruta
Dirección IP cuando corresponde
Estado
Código de resultado
```

La ruta de salud se excluye del registro automático para evitar almacenar eventos innecesarios.

El inicio de sesión administra su propio registro de auditoría.

---

## 11. Comunicación frontend-backend

Axios centraliza las solicitudes HTTP.

TanStack Query administra:

```text
Consultas
Caché
Recarga de información
Mutaciones
Sincronización con el servidor
```

La URL base de la API se obtiene mediante:

```env
VITE_API_URL
```

---

## 12. Configuración

Variables principales del backend:

```env
NOMBRE_APP
VERSION
ENTORNO
FRONTEND_URL
DATABASE_URL
JWT_SECRET_KEY
JWT_ALGORITHM
JWT_EXPIRE_MINUTES
```

Variable principal del frontend:

```env
VITE_API_URL
```

Los secretos y contraseñas reales no deben almacenarse en el repositorio.

---

## 13. Diseño responsive

La interfaz está preparada para adaptarse a diferentes tamaños de pantalla.

Se ha comprobado su comportamiento en resoluciones representativas de:

```text
1440 px
1024 px
768 px
390 px
```

Se verificaron navegación, contenido, formularios, tablas y comportamiento del menú lateral.

---

## 14. Estructura general

```text
matrixflow-enterprise/
├── frontend/
├── backend/
├── database/
├── docs/
├── .env.example
├── docker-compose.yml
└── README.md
```

La arquitectura mantiene separación entre frontend, backend, persistencia, algoritmos y documentación.
