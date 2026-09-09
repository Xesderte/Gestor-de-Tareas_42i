# Plan de Desarrollo: Sistema de Gestión de Tareas

## Iteración 1: Tareas Base (Nivel Raíz)
El objetivo es tener un tablero funcional para tareas simples (sin jerarquía aún).

* **Backend (GET & POST):** Crear el endpoint para obtener todas las tareas principales (`padre_id = null`) y el endpoint para crear una nueva tarea raíz.
* **Frontend (Vista Principal):** Maquetar la tabla o lista principal. Implementar la llamada a la API para mostrar las tareas vacías y crear el formulario/modal para agregar la primera tarea raíz.
* **Validación:** Comprobar que al crear una tarea en el front, esta aparece en la base de datos con `PI=1`, `PG=0`, `PT=1`, `FT=0`.

## Iteración 2: El Árbol de Subtareas y Burbujeo de Pesos
Aquí introducimos la complejidad recursiva de la arquitectura.

* **Backend (POST Subtarea):** Crear el endpoint para agregar una subtarea a un `padre_id` específico. Implementar la función recursiva `PropagarIncrementoPeso` para que el `PG` y `PT` de todos los ancestros suban `+1`.
* **Backend (GET Detalle):** Crear el endpoint para obtener una tarea por su ID, incluyendo todo su árbol de descendientes (`hijos`) y calculando al vuelo las métricas derivadas (Esfuerzo Total y Relativo).
* **Frontend (Vista Detalle):** Crear la pantalla de detalle de la tarea. Diseñar el componente recursivo que renderice las subtareas indentadas. Agregar el botón de "Añadir Subtarea".
* **Validación:** Crear subtareas en el nivel 2 y 3, y verificar en el Front que la tarea Raíz refleja correctamente el esfuerzo total sumado.

## Iteración 3: Ciclo de Vida y Progreso
Damos vida a la máquina de estados implícita (`pendiente` -> `en progreso` -> `completado`).

* **Backend (PATCH Estado):** Crear el endpoint para marcar una tarea individual como completada. Implementar la validación bottom-up (no se puede completar si `FT < PG`) y la recursividad de `PropagarAvanceProgreso` para sumar `+1` al `FT` hacia arriba.
* **Frontend (Interacción):** Agregar checkboxes a la vista de árbol. Implementar barras de progreso visuales en base a la fórmula `FT / PT`.
* **Validación:** Marcar una subtarea profunda como completada y ver cómo la barra de progreso del padre principal avanza automáticamente y su estado cambia a `en progreso`.

## Iteración 4: Edición, Eliminación y Cascada
Completamos las operaciones CRUD restantes y el mantenimiento del árbol.

* **Backend (PUT & DELETE):** Crear el endpoint de edición simple (cambiar título/urgencia) y el de eliminación. Implementar la función `EliminarEnCascada` (restando el `PT` del nodo eliminado a sus ancestros).
* **Frontend (Acciones):** Agregar botones de edición y eliminación con modales de confirmación (advirtiendo que eliminar un padre borra sus hijos).
* **Validación:** Eliminar una rama entera y verificar que los porcentajes de la tarea raíz se recalculan correctamente con el nuevo peso total.

## Iteración 5: Calidad y Despliegue
Cumplimos con los requisitos técnicos estrictos del desafío.

* **Backend (Testing):** Escribir las pruebas unitarias con Jest directamente sobre las funciones matemáticas (crear árbol, completar hijo, validar estado del padre) sin necesidad de levantar el servidor.
* **Refinamiento (UI/UX):** Agregar los "Nice to have": indicadores de urgencia visuales (colores), responsividad para móviles, y algún filtro básico (ej. ver solo pendientes).
* **Dockerización:** Escribir los `Dockerfile` para Front y Back, y el `docker-compose.yml` maestro para levantar todo con un solo comando. Configurar el README final.