### Paso 1.1: Estructurar Rutas y Controladores (Backend)
* Dentro de la carpeta `backend/src`, crea dos carpetas nuevas: `controllers` y `routes`.
* Crea el archivo `controllers/task.controller.ts`. Aquí definiremos dos funciones: `createRootTask` y `getRootTasks`.
* Crea el archivo `routes/task.routes.ts`. Aquí importaremos las funciones del controlador y las asignaremos a los métodos HTTP (`POST /tasks` y `GET /tasks`).
* Abre `src/index.ts` e importa las rutas recién creadas para que Express las utilice (ej. `app.use('/api', taskRoutes)`).

### Paso 1.2: Implementar la Creación (POST Tarea Raíz)
* En `task.controller.ts`, programa la función `createRootTask`. Debe recibir del `req.body`: `titulo`, `descripcion` y opcionalmente `indicador_urgencia`.
* Utiliza el modelo de Sequelize para insertar el registro: `Task.create({ titulo, descripcion, indicador_urgencia, padre_id: null })`.
* Retorna la tarea creada con un status `201 Created`.
* Levanta el servidor (`npx ts-node src/index.ts`) y realiza una petición POST con Insomnia hacia `http://localhost:3001/api/tasks` enviando un JSON válido.
* Verifica en la respuesta de Insomnia que la tarea se haya creado y que los valores por defecto se aplicaron correctamente (`peso_individual: 1`, `peso_grupal: 0`, `peso_total: 1`, `final_total: 0`).

### Paso 1.3: Implementar la Lectura (GET Tareas Raíz)
* En `task.controller.ts`, programa la función `getRootTasks`.
* Utiliza Sequelize para buscar solo las tareas principales: `Task.findAll({ where: { padre_id: null } })`.
* Retorna la lista con un status `200 OK`.
* Ejecuta un GET en Insomnia hacia `http://localhost:3001/api/tasks` y confirma que te devuelve un arreglo (array) con la tarea que creaste en el paso anterior.

### Paso 1.4: Configurar la Conexión en el Frontend
* Ve a la carpeta `frontend/src` y crea una carpeta llamada `api` o `services`.
* Crea un archivo `api.ts` (o `taskService.ts`).
* Configura una instancia de Axios apuntando a la URL base de tu backend (`http://localhost:3001/api`).
* Exporta dos funciones que utilicen esta instancia de Axios: `getTasks()` y `createTask(data)`.

### Paso 1.5: Maquetar la Vista Principal (Frontend)
* En `frontend/src`, crea una carpeta `components` y dentro un archivo `TaskList.tsx`.
* Utiliza el hook `useState` para almacenar el arreglo de tareas y `useEffect` para invocar a `getTasks()` ni bien cargue el componente.
* Diseña la interfaz con Tailwind CSS. Puedes usar una tabla o tarjetas (cards) que muestren el `titulo`, `descripcion` y el estado actual de la tarea.
* Importa `TaskList` en tu `App.tsx` para visualizarlo en el navegador.

### Paso 1.6: Implementar el Formulario de Creación (Frontend)
* Crea un componente `TaskForm.tsx` (puede ser un formulario lateral o un modal encima de la lista).
* Maneja el estado local del formulario para capturar los inputs (`titulo`, `descripcion`, `indicador_urgencia`).
* Al hacer submit, intercepta el evento, llama a la función `createTask(data)` de tu servicio Axios y, tras una respuesta exitosa, actualiza el estado de `TaskList` para que la nueva tarea aparezca inmediatamente en pantalla sin recargar la página.

### Paso 1.7: Validación End-to-End
* Abre tu aplicación en el navegador (`http://localhost:5173`).
* Completa el formulario de creación con una nueva tarea y envíalo.
* Comprueba visualmente que la lista se actualiza y muestra la tarea.
* Revisa la consola del navegador o inspecciona la respuesta de red para confirmar matemáticamente la regla de negocio: la nueva tarea ingresó con `PI=1`, `PG=0`, `PT=1`, `FT=0`.