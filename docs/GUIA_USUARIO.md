# Guía de Usuario de MatrixFlow Enterprise

## 1. Acceso al sistema

Abra MatrixFlow Enterprise desde el navegador.

La primera pantalla permite iniciar sesión.

Ingrese:

```text
Correo electrónico
Contraseña
```

El sistema comprobará las credenciales y el rol asociado al usuario.

Si las credenciales son correctas, se mostrará el sistema según los permisos disponibles.

---

## 2. Roles

MatrixFlow Enterprise utiliza tres roles.

### Administrador

Puede administrar los principales módulos empresariales y de configuración.

### Analista

Puede trabajar con información empresarial, análisis matemático y reportes según sus permisos.

### Consulta

Dispone de acceso al Dashboard y a reportes autorizados.

Las opciones visibles pueden cambiar según el rol del usuario.

---

## 3. Dashboard

El Dashboard presenta una vista general de la información disponible en MatrixFlow Enterprise.

Puede contener indicadores relacionados con:

```text
Ventas
Productos
Sucursales
Inventario
Metas
Actividad
Reportes
```

La información se obtiene mediante la API y los datos persistidos del sistema.

---

## 4. Empresa

El módulo Empresa permite consultar y administrar la información empresarial correspondiente.

Las acciones disponibles dependen del rol autenticado.

---

## 5. Sucursales

El módulo Sucursales permite administrar las diferentes ubicaciones de la empresa.

Un usuario autorizado puede realizar acciones como:

```text
Registrar
Consultar
Editar
Eliminar
```

---

## 6. Productos y categorías

El módulo Productos permite administrar el catálogo empresarial.

Cada producto puede relacionarse con una categoría.

El sistema permite administrar:

```text
Productos
Categorías
Información comercial asociada
```

Las operaciones de creación, edición y eliminación están restringidas según el rol.

---

## 7. Ventas

El módulo Ventas permite registrar las operaciones comerciales.

El usuario autorizado selecciona la información necesaria para realizar el registro.

El sistema valida los datos antes de almacenar la operación.

La venta registrada pasa a formar parte de la información persistida utilizada por otros módulos.

---

## 8. Inventario

El módulo Inventario permite consultar y gestionar existencias.

También se dispone de información relacionada con movimientos de inventario.

Las operaciones están conectadas con la información de productos y sucursales.

---

## 9. Metas

El módulo Metas permite registrar objetivos empresariales.

Estas metas pueden utilizarse posteriormente como referencia para análisis e indicadores.

---

## 10. Vectores

El módulo Vectores permite crear y consultar vectores.

Un vector está compuesto por una secuencia de valores numéricos.

Los vectores pueden utilizarse en operaciones matemáticas.

---

## 11. Matrices

El módulo Matrices permite crear y consultar matrices.

Una matriz se representa mediante filas y columnas.

Ejemplo:

```text
1  2  3
4  5  6
7  8  9
```

El sistema valida sus dimensiones y estructura.

---

## 12. Operaciones matemáticas

El módulo de Operaciones permite ejecutar cálculos utilizando vectores o matrices.

Entre las operaciones matriciales se encuentran:

```text
Suma
Resta
Multiplicación
Transposición
Multiplicación por escalar
```

El sistema también dispone de operaciones vectoriales.

Cuando una operación requiere dimensiones compatibles, MatrixFlow valida dichas dimensiones antes de realizar el cálculo.

Si las dimensiones son incompatibles, la operación es rechazada.

---

## 13. Combinaciones lineales

Este módulo permite combinar información vectorial utilizando coeficientes.

El resultado puede utilizarse para representar indicadores matemáticos derivados de los datos ingresados.

---

## 14. Historial

Las operaciones matemáticas ejecutadas pueden conservarse en el historial.

El historial permite consultar operaciones realizadas anteriormente y sus resultados.

---

## 15. Reportes

El módulo Reportes utiliza información persistida en el sistema.

Permite consultar indicadores empresariales generados a partir de los datos registrados.

La información disponible depende del rol y de los datos existentes.

---

## 16. Usuarios

El módulo Usuarios está destinado a la administración de cuentas.

El administrador puede gestionar los usuarios y sus roles correspondientes.

El sistema utiliza los roles para determinar qué módulos y operaciones puede utilizar cada cuenta.

---

## 17. Configuración

El módulo Configuración contiene opciones administrativas del sistema.

Su acceso se encuentra restringido según el rol.

---

## 18. Seguridad

MatrixFlow Enterprise protege las funcionalidades mediante autenticación y autorización.

No comparta:

```text
Contraseñas
Tokens de acceso
Claves JWT
Credenciales de base de datos
```

Cuando una cuenta no tiene permisos para una operación, el sistema impide el acceso correspondiente.

---

## 19. Uso en dispositivos móviles

MatrixFlow Enterprise dispone de una interfaz responsive.

En pantallas pequeñas, la navegación puede adaptarse mediante un menú móvil.

Si una tabla contiene muchas columnas, puede requerirse desplazamiento horizontal.

---

## 20. Cierre de sesión

Cuando termine de utilizar MatrixFlow Enterprise, utilice la opción de cierre de sesión disponible en la interfaz.

Esto elimina la sesión activa del frontend y evita continuar utilizando las funciones protegidas con esa sesión.
