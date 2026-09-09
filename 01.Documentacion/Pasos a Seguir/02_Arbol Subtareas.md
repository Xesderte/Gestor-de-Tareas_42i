### Paso 2.1: Lógica Recursiva de Pesos (Backend)
* Dentro de `backend/src`, crea una carpeta llamada `utils` o `services` y agrega un archivo `task.utils.ts`.
* Implementa la función asíncrona `PropagarIncrementoPeso(tareaId, delta = 1)`.
* Esta función debe buscar la tarea por ID. Si existe, sumar `delta` a su `peso_grupal` y recalcular su `peso_total` (`peso_individual + peso_grupal`), guardar en base de datos, y luego llamarse a sí misma recursivamente pasándole el `padre_id` de la tarea actual.

### Paso 2.2: Endpoint para Crear Subtareas (Backend)
* En `task.controller.ts`, programa la función `createSubtask`. Debe recibir el `padre_id` por parámetro de URL (`req.params.id`) y los datos de la tarea por el `req.body`.
* Valida primero que la tarea padre exista en la base de datos para evitar inconsistencias.
* Crea el nuevo registro en Sequelize usando `Task.create({ ..., padre_id })`.
* Inmediatamente después de crearla, invoca la función `PropagarIncrementoPeso(padre_id, 1)`.
* En `task.routes.ts`, agrega la ruta `POST /tasks/:id/subtasks` apuntando a este nuevo controlador.

### Paso 2.3: Endpoint para Obtener Detalle y Árbol (Backend)
* En `task.controller.ts`, programa la función `getTaskById`. 
* Utiliza Sequelize para buscar la tarea y sus descendientes (puedes usar el `include` con el alias `hijos` o una función recursiva de búsqueda si Sequelize limita la profundidad).
* Al mapear la respuesta antes de enviarla al frontend, inyecta dinámicamente las **Métricas Derivadas** (Esfuerzo Total y Esfuerzo Relativo) aplicando las fórmulas de tu análisis (ej. `esfuerzo_relativo = (PT - FT) / PG_Raiz`). Recuerda que no debes guardar esto en la BD, solo devolverlo en el JSON.
* Agrega la ruta `GET /tasks/:id` en `task.routes.ts`.

### Paso 2.4: Actualizar Servicios API (Frontend)
* Abre el archivo `api.ts` (o `taskService.ts`) en la carpeta `frontend/src/api`.
* Exporta dos nuevas funciones que utilicen tu instancia de Axios: `getTaskById(id: string)` y `createSubtask(parentId: string, data: any)`.

### Paso 2.5: Componente de Vista Detalle (Frontend)
* En `frontend/src/components`, crea un nuevo archivo `TaskDetail.tsx`.
* Configura **React Router** para que este componente se renderice en una ruta dinámica como `/tasks/:id`, utilizando el hook `useParams` para extraer el ID.
* Usa `useEffect` para llamar a `getTaskById` y cargar toda la información de la rama.
* Diseña la cabecera mostrando el título, la descripción y un panel destacado con los porcentajes de Esfuerzo (fijo y dinámico) calculados por el backend.

### Paso 2.6: Componente Recursivo de Subtareas (Frontend)
* Crea un componente llamado `SubtaskTree.tsx` (o `SubtaskList.tsx`) que reciba un arreglo de tareas por `props`.
* Dentro de su método `map`, renderiza cada tarea. Si la tarea iterada tiene elementos dentro de su arreglo `hijos`, el componente debe **llamarse a sí mismo** pasándole esos hijos (`<SubtaskTree tasks={tarea.hijos} />`).
* Utiliza las clases de Tailwind (como `ml-6` o `pl-4` más un borde izquierdo) para indentar visualmente cada nivel de profundidad y dejar claro quién es hijo de quién.
* Agrega un botón de "Añadir Subtarea" en cada nodo renderizado que abra el formulario apuntando a ese ID específico.

### Paso 2.7: Validación End-to-End del Burbujeo
* Levanta ambos servidores (`npm run dev` en Front y Back).
* Desde tu `TaskList` principal, haz clic en una tarea para navegar a su vista de Detalle.
* Crea una subtarea (Nivel 2). Verifica que aparezca indentada y que el Esfuerzo Total del Padre se actualice.
* Créale una subtarea a esa nueva subtarea (Nivel 3).
* Revisa la base de datos (o la respuesta del endpoint GET) y valida matemáticamente que la propagación hacia arriba haya funcionado: la tarea Raíz debe haber incrementado su `PG` y su `PT` en 2, absorbiendo el peso de sus dos descendientes.