# Documento de Requisitos - MatrixFlow Enterprise

## 1. Descripción del sistema

MatrixFlow Enterprise es un sistema web empresarial orientado al análisis de ventas, inventario e indicadores de una empresa con múltiples sucursales.

La característica principal del sistema es convertir información empresarial en vectores y matrices para ejecutar operaciones de álgebra lineal y utilizar sus resultados en indicadores y reportes.

El sistema no funciona únicamente como una calculadora matricial. Las operaciones matemáticas forman parte del proceso de análisis empresarial.

---

## 2. Problema

Una empresa con múltiples sucursales necesita analizar simultáneamente información relacionada con:

- Ventas.
- Productos.
- Inventario.
- Costos.
- Metas.
- Sucursales.

Cuando la cantidad de información aumenta, realizar comparaciones y cálculos manualmente se vuelve más complejo.

MatrixFlow Enterprise centraliza la información y permite aplicar operaciones matemáticas reproducibles para apoyar el análisis.

---

## 3. Objetivo general

Desarrollar un sistema web empresarial que permita registrar, organizar y analizar información de ventas, productos, inventario y sucursales mediante vectores y matrices, aplicando operaciones de álgebra lineal con Python y NumPy para generar indicadores, análisis y reportes.

---

## 4. Objetivos específicos

- Registrar empresas, sucursales, productos, usuarios, ventas e inventario.
- Representar información empresarial mediante vectores.
- Representar información multidimensional mediante matrices.
- Aplicar suma, resta y multiplicación por escalar.
- Aplicar producto escalar y multiplicación matricial.
- Aplicar transposición y combinaciones lineales.
- Validar dimensiones y datos antes de ejecutar operaciones.
- Guardar entradas, resultados, usuario, fecha y estado de cada operación.
- Generar indicadores y reportes empresariales.
- Implementar seguridad, roles y auditoría.

---

## 5. Alcance funcional

El sistema contempla las siguientes áreas:

```text
Empresa
Sucursales
Productos
Ventas
Inventario
Metas
Vectores
Matrices
Operaciones
Combinaciones lineales
Historial
Reportes
Usuarios
Configuración
Auditoría
```

---

## 6. Modelo empresarial

El escenario de referencia corresponde a una empresa comercial con múltiples sucursales y productos tecnológicos.

Ejemplos de información utilizada:

```text
Sucursales:
Lima
Arequipa
Trujillo
Cusco
Piura

Productos:
Laptop
PC
Monitor
Teclado
Mouse
```

La información empresarial puede utilizarse de la siguiente forma:

```text
Vector:
Ventas de una sucursal por producto.

Matriz:
Ventas de todas las sucursales por producto.

Producto escalar:
Cantidades × precios = ingresos.

Resta matricial:
Ventas reales − metas.

Escalar:
Ajuste porcentual de precios o cantidades.

Combinación lineal:
Indicador ponderado de ventas, rentabilidad y rotación.
```

---

# 7. Requerimientos funcionales

## RF-01 - Iniciar sesión

El sistema debe permitir que los usuarios se autentiquen mediante sus credenciales.

El acceso posterior debe depender del rol asignado.

---

## RF-02 - Gestionar usuarios y roles

El sistema debe permitir gestionar usuarios.

Los usuarios deben estar asociados a roles.

Los roles contemplados son:

```text
Administrador
Analista
Consulta
```

---

## RF-03 - Gestionar empresas y sucursales

El sistema debe permitir administrar información de la empresa y sus sucursales.

---

## RF-04 - Gestionar productos y categorías

El sistema debe permitir administrar:

```text
Productos
Categorías
```

Los productos pueden estar asociados a una categoría.

---

## RF-05 - Registrar ventas

El sistema debe permitir registrar ventas realizadas por usuarios autorizados.

---

## RF-06 - Gestionar inventario

El sistema debe permitir consultar y administrar las existencias y movimientos relacionados con inventario.

---

## RF-07 - Registrar metas

El sistema debe permitir registrar metas empresariales que puedan utilizarse posteriormente en análisis.

---

## RF-08 - Crear y consultar vectores

El sistema debe permitir crear y consultar representaciones vectoriales de información.

---

## RF-09 - Crear y consultar matrices

El sistema debe permitir crear y consultar matrices.

---

## RF-10 - Ejecutar operaciones vectoriales

El sistema debe permitir ejecutar operaciones matemáticas con vectores.

Entre las operaciones contempladas se encuentran:

```text
Suma
Resta
Multiplicación por escalar
Producto escalar
```

---

## RF-11 - Ejecutar operaciones matriciales

El sistema debe permitir ejecutar operaciones con matrices.

Entre las operaciones contempladas se encuentran:

```text
Suma
Resta
Multiplicación
Transposición
Multiplicación por escalar
```

---

## RF-12 - Ejecutar combinaciones lineales

El sistema debe permitir realizar combinaciones lineales utilizando información vectorial.

---

## RF-13 - Conservar historial

El sistema debe conservar información relacionada con las operaciones ejecutadas.

El historial debe permitir mantener trazabilidad de cálculos y resultados.

---

## RF-14 - Generar reportes

El sistema debe generar reportes e indicadores utilizando información persistida.

---

## RF-15 - Registrar eventos de auditoría

El sistema debe registrar eventos de auditoría.

Los eventos pueden incluir:

```text
Usuario
Acción
Módulo o entidad
Fecha
Dirección IP cuando corresponda
Estado
Resultado
```

---

# 8. Requerimientos no funcionales

## RNF-01 - Seguridad y control de acceso

El sistema debe proteger las funcionalidades según el usuario autenticado y su rol.

---

## RNF-02 - Arquitectura modular

El sistema debe estar organizado en módulos separados según responsabilidad.

---

## RNF-03 - Separación frontend/backend

Frontend y backend deben estar separados.

La comunicación debe realizarse mediante HTTP y JSON.

---

## RNF-04 - Validación

Los datos deben validarse tanto en frontend como en backend.

---

## RNF-05 - Persistencia estructurada

La información debe almacenarse de forma estructurada utilizando PostgreSQL.

---

## RNF-06 - Trazabilidad

Las operaciones matemáticas y eventos relevantes deben poder rastrearse posteriormente.

---

## RNF-07 - Escalabilidad y mantenibilidad

La arquitectura debe favorecer el mantenimiento y crecimiento del sistema.

---

## RNF-08 - Interfaz responsive

La interfaz debe adaptarse a distintos tamaños de pantalla.

---

## RNF-09 - Rendimiento matricial

Las operaciones matriciales deben ejecutarse con un rendimiento adecuado.

---

# 9. Roles y permisos

## Administrador

Acceso a:

```text
Usuarios
Empresa
Ventas
Inventario
Matrices
Vectores
Operaciones
Reportes
Configuración
```

---

## Analista

Acceso a:

```text
Ventas
Inventario
Matrices
Vectores
Operaciones
Reportes
```

---

## Consulta

Acceso a:

```text
Dashboard
Reportes autorizados
```

---

# 10. Criterios de aceptación

## CA-01

El usuario puede autenticarse según su rol.

## CA-02

El administrador puede registrar sucursales y productos.

## CA-03

El usuario autorizado puede registrar ventas.

## CA-04

El sistema permite representar datos como vectores.

## CA-05

El sistema permite representar datos como matrices.

## CA-06

Las dimensiones incompatibles son rechazadas.

## CA-07

Las operaciones producen resultados matemáticamente válidos.

## CA-08

Cada operación queda almacenada en el historial.

## CA-09

El resultado puede visualizarse en el frontend.

## CA-10

Los reportes utilizan datos persistidos.

---

# 11. Tecnologías requeridas

## Frontend

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

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
NumPy
```

## Base de datos

```text
PostgreSQL
```

## Seguridad

```text
JWT
RBAC
```

## Pruebas

```text
Pytest
Pruebas UI
Pruebas API
Pruebas de integración
Pruebas de seguridad
Pruebas de aceptación
```

---

# 12. Resultado esperado

MatrixFlow Enterprise debe funcionar como una plataforma empresarial integrada capaz de:

```text
Registrar información empresarial
Persistir datos
Aplicar álgebra lineal
Mostrar resultados
Generar reportes
Controlar accesos
Registrar auditoría
Conservar historial
```
