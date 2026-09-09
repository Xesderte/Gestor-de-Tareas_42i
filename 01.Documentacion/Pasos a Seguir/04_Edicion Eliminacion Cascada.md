### Paso 4.1: Endpoint de Edición Simple (Backend)
* En `task.controller.ts`, programa la función `updateTask`. Debe recibir el ID por parámetro y los campos a actualizar por el `req.body` (`titulo`, `descripcion`, `indicador_urgencia`).
* Utiliza Sequelize para buscar y actualizar la tarea: `tarea.update({ titulo, descripcion, indicador_urgencia })`.
* Esta operación es puramente de datos descriptivos, por lo que **no altera los pesos matemáticos** del árbol.
* En `task.routes.ts`, agrega la ruta `PUT /tasks/:id` (o `PATCH`).

### Paso 4.2: Lógica de Eliminación Matemática y Cascada (Backend)
* Abre `task.utils.ts` e implementa la función recursiva `PropagarDecrementoPeso(tareaId, pesoARestar, finalARestar)`. Esta restará el `PT` y el `FT` del nodo eliminado a toda su cadena de ancestros para que los porcentajes no se rompan.
* En `task.controller.ts`, crea la función `deleteTask`. 
* **Importante (Orden de ejecución):** 
  1. Primero, busca la tarea a eliminar y guarda temporalmente su `peso_total` y su `final_total`.
  2. Si tiene un `padre_id`, llama a `PropagarDecrementoPeso(padre_id, peso_total, final_total)` para ajustar el árbol hacia arriba.
  3. Finalmente, elimina la tarea de la base de datos. Si configuraste `onDelete: Cascade` en tu modelo de Sequelize, la base de datos se encargará de borrar físicamente todos los hijos de forma automática.
* Agrega la ruta `DELETE /tasks/:id` en `task.routes.ts`.

### Paso 4.3: Actualizar Servicios API (Frontend)
* Abre el archivo `api.ts` (o `taskService.ts`).
* Exporta dos nuevas funciones que utilicen Axios: `updateTask(id: string, data: any)` y `deleteTask(id: string)`.

### Paso 4.4: Interfaz de Edición (Frontend)
* En `TaskDetail.tsx` (y opcionalmente en cada nodo de `SubtaskTree.tsx`), agrega un botón de "Editar" (puedes usar un ícono de lápiz de `lucide-react`).
* Al hacer clic, debe abrirse un Modal (o reutilizar `TaskForm.tsx` pasándole los datos actuales como propiedades iniciales).
* Al guardar, invoca `updateTask`, cierra el modal y recarga la vista para reflejar el cambio de título o urgencia de forma inmediata.

### Paso 4.5: Interfaz de Eliminación y Prevención (Frontend)
* Agrega un botón de "Eliminar" (ícono de papelera) con estilos de advertencia (rojo).
* **Control de Riesgos (Modal de Confirmación):** Nunca elimines directamente. Al hacer clic, abre un modal modal de advertencia. 
* Si la tarea tiene hijos (`tarea.hijos.length > 0`), el modal debe ser explícito: *"Esta tarea contiene X subtareas. Si la eliminas, borrarás todo el subárbol permanentemente. ¿Deseas continuar?"*.
* Si el usuario confirma, invoca `deleteTask`, cierra el modal, y redirige al usuario a la vista principal (si eliminó la raíz) o recarga la rama (si eliminó una subtarea).

### Paso 4.6: Validación End-to-End de Recálculo
* Crea una tarea Raíz A. Agrégale una subtarea B, y a esta una sub-subtarea C.
* Verifica que el Peso Total de A sea 3.
* Completa la tarea C (el Progreso de A debe subir).
* Ahora, elimina la subtarea B (lo que arrastrará a C a la eliminación).
* Comprueba mágicamente la estabilidad de tu arquitectura: la tarea Raíz A no debería romperse. Su Peso Total debe volver a ser 1, y su barra de progreso debe volver al estado original (ya que el peso y avance de B y C se restaron correctamente antes de la eliminación física).