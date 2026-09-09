### Paso 5.1: Entorno de Pruebas Unitarias (Backend)
* Verifica que Jest y `ts-jest` estén bien configurados en tu `package.json`.
* En `backend/src`, crea una carpeta `__tests__` y dentro un archivo `task.utils.test.ts`.
* Configura Sequelize en el entorno de pruebas para usar una base de datos SQLite en memoria (`dialect: 'sqlite', storage: ':memory:'`). Esto asegura que los tests corran rapidísimo y no ensucien tu `dev.sqlite` real.

### Paso 5.2: Escribir Tests de la Lógica de Negocio (Backend)
* **Test 1 (Burbujeo de Creación):** Crea una tarea padre y dos hijas simuladas. Llama a tu función y usa `expect()` para validar que el `PT` del padre sea 3 y su `PG` sea 2.
* **Test 2 (Regla Bottom-Up):** Intenta marcar como completada una tarea padre que tiene un hijo con `FT = 0`. Valida que tu función lance el error esperado ("No se puede completar con subtareas pendientes").
* **Test 3 (Burbujeo de Finalización):** Marca una tarea hija como completada y valida que el `FT` del padre suba a 1, y su estado deducido cambie automáticamente a `'en progreso'`.
* Ejecuta `npm test` y asegúrate de que todos pasen en verde.

### Paso 5.3: Refinamiento Visual y Responsividad (Frontend)
* Revisa tus componentes (`TaskList`, `TaskDetail`, `SubtaskTree`) y añade clases de Tailwind para diseño responsivo (ej. cambiar de flex-columna en móviles a flex-fila en escritorio usando `flex-col md:flex-row`).
* Añade insignias (Badges) de colores para el `indicador_urgencia`: Rojo para "Alta", Amarillo para "Media" y Azul/Gris para "Baja".
* Asegúrate de que los niveles de indentación de las subtareas se vean bien en pantallas pequeñas (quizás reduciendo el margen izquierdo `ml-2` en móviles y `ml-6` en desktop).

### Paso 5.4: Paginación y Filtros - Nice to Have (Fullstack)
* **Backend:** Modifica el endpoint `GET /tasks` para aceptar *Query Parameters* (`req.query.estado`). Filtra la búsqueda en Sequelize usando estos parámetros.
* **Frontend:** Agrega un menú desplegable `<select>` encima de tu `TaskList` con las opciones "Todas", "Pendientes", "En Progreso" y "Completadas". Al cambiarlo, realiza la petición al backend con el filtro correspondiente.

### Paso 5.5: Dockerización Individual (Dockerfile)
* Crea un archivo llamado `Dockerfile` dentro de la carpeta `backend/`. Debe basarse en una imagen de Node (ej. `node:20-alpine`), copiar el `package.json`, hacer `npm install`, copiar el código fuente, exponer el puerto `3001` y ejecutar `npx ts-node src/index.ts`.
* Crea otro `Dockerfile` dentro de la carpeta `frontend/`. Igual al anterior, basado en Node, instala dependencias, copia el código, expone el puerto de Vite (`5173`) y define el comando de arranque (ej. `npm run dev -- --host` para que sea accesible desde fuera del contenedor).

### Paso 5.6: Orquestación Maestro (docker-compose.yml)
* En la **raíz de tu proyecto** (fuera de las carpetas back/front), crea el archivo `docker-compose.yml`.
* Define dos servicios: `api` (construido desde la ruta `./backend`, mapeando el puerto 3001:3001) y `client` (construido desde la ruta `./frontend`, mapeando el puerto 5173:5173).
* Esto cumple estrictamente con el requerimiento de levantar toda la aplicación con un solo comando sin depender de servicios cloud ni bases de datos externas en contenedores separados (porque SQLite vive dentro del backend).

### Paso 5.7: Documentación y Entrega (README.md final)
* Reemplaza el `README.md` de la raíz por la documentación final del proyecto.
* Incluye una breve explicación de tu arquitectura de **Métricas Principales vs Derivadas** (demuestra muchísimo nivel técnico explicar cómo optimizaste la base de datos).
* Agrega el bloque de comandos para que el evaluador copie y pegue:
  ```bash
  # Levantar el proyecto completo
  docker compose up --build
  
  # Ejecutar los tests (en otra terminal)
  cd backend && npm test