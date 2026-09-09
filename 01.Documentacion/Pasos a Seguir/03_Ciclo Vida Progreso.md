### Paso 3.1: Lógica Recursiva de Avance (Backend)
* Abre el archivo `task.utils.ts` (creado en la iteración anterior).
* Implementa la función recursiva `PropagarAvanceProgreso(tareaId, delta = 1)`.
* Esta función debe buscar la tarea por ID y sumar `delta` a su campo `final_total`.
* Dentro de la misma función, debes deducir y actualizar el `estado` al vuelo: 
  * Si `final_total === 0` -> `'pendiente'`
  * Si `final_total === peso_total` -> `'completado'`
  * Si está en el medio (`0 < final_total < peso_total`) -> `'en progreso'`
* Guarda el registro en la base de datos y llámala recursivamente pasándole el `padre_id`.

### Paso 3.2: Endpoint para Completar Tarea Propia (Backend)
* En `task.controller.ts`, programa la función `completeTask`. Debe recibir el ID de la tarea por parámetro (`req.params.id`).
* **Validación Bottom-Up Crucial:** Antes de hacer nada, busca la tarea y verifica si `peso_grupal > 0` y `final_total < peso_grupal`. Si esto es verdadero, significa que tiene subtareas incompletas. Debes retornar un error `400 Bad Request` indicando que no se puede completar una tarea con dependencias pendientes.
* Si pasa la validación, invoca `PropagarAvanceProgreso(tarea.id, 1)` (porque la tarea individual aporta 1 a su propio `final_total`).
* En `task.routes.ts`, agrega la ruta `PATCH /tasks/:id/complete` (usamos PATCH porque solo actualizamos parcialmente el estado de la tarea).

### Paso 3.3: Actualizar Servicios API (Frontend)
* Abre el archivo `api.ts` (o `taskService.ts`) en la carpeta `frontend/src/api`.
* Exporta la función `completeTask(id: string)` haciendo una petición `PATCH` a tu nuevo endpoint.

### Paso 3.4: Interacción Visual - Casillas de Verificación (Frontend)
* Abre tu componente `SubtaskTree.tsx` (y/o `TaskDetail.tsx`).
* Añade un `<input type="checkbox">` o un botón estilizado al lado de cada tarea para marcarla como completada.
* **UX Inteligente:** Utiliza las variables matemáticas para deshabilitar (`disabled={true}`) el checkbox si la tarea tiene hijos incompletos (`FT < PG`), previniendo errores de usuario.
* Asocia el evento `onClick` o `onChange` para llamar al servicio `completeTask` y, tras el éxito, recargar la información de la rama.

### Paso 3.5: Barras de Progreso e Indicadores de Estado (Frontend)
* En `TaskDetail.tsx`, crea un componente visual para la barra de progreso usando Tailwind. 
* Calcula el porcentaje en tiempo real: `const porcentaje = (tarea.final_total / tarea.peso_total) * 100`.
* Inyecta este valor en el ancho de la barra (ej: `<div style={{ width: \`${porcentaje}%\` }} className="bg-green-500 h-2"></div>`).
* Utiliza renderizado condicional para mostrar un *Badge* (etiqueta) de color según el estado: Gris para "Pendiente", Azul para "En Progreso" y Verde para "Completado".

### Paso 3.6: Validación End-to-End de la Máquina de Estados
* Levanta el sistema y crea una jerarquía de 3 niveles: Raíz -> Subtarea -> Sub-subtarea.
* Comprueba que todas están en estado `'pendiente'` y la barra de progreso de la Raíz está en 0%.
* Marca como completada la Sub-subtarea (nivel 3).
* Verifica que la barra de progreso de la Raíz avance, su estado cambie automáticamente a `'en progreso'` (sin que nadie lo haya puesto manualmente en progreso) y que el sistema te permita ahora completar la Subtarea (nivel 2) al haberse liberado su dependencia.