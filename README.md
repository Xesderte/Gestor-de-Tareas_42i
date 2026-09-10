# Gestor de Tareas 42i

Sistema avanzado de gestión de tareas estructurado en árbol jerárquico infinito, diseñado para priorizar y calcular el esfuerzo de equipos de desarrollo.

## Enlaces Importantes
- [Análisis Técnico](./01.Documentacion/Analisis%20Tecnico.md)
- [Enunciado Principal](./01.Documentacion/Enunciado%20Principal.md)
- [Documentación de Endpoints](./backend/Endpoints.md)

---

## 🚀 Guía de Comandos Rápidos (Copiar y Pegar)

Todos los comandos están listos para ejecutarse directamente en la terminal desde la raíz del proyecto.

### 1. Iniciar la Aplicación con Docker Compose (Comando Único)
Compila las imágenes, instala dependencias y levanta tanto el Backend (puerto `3001`) como el Frontend (puerto `5173`) en contenedores conectados:
```bash
docker compose up --build
```
> **URLs de acceso:**
> - **Frontend (Aplicación Web):** [http://localhost:5173](http://localhost:5173)
> - **Backend API:** [http://localhost:3001/api/tasks](http://localhost:3001/api/tasks)

---

### 2. Detener la Aplicación en Docker
Detiene y remueve los contenedores de la aplicación:
```bash
docker compose down
```

---

### 3. Ejecutar las Pruebas Unitarias
Ejecuta la suite de pruebas unitarias automatizadas con Jest y ts-jest que validan la lógica de negocio y las fórmulas de propagación matemática (`PropagarIncrementoPeso`, `PropagarAvanceProgreso`, `PropagarEliminacionNodo`):
```bash
cd backend && npm test
```

---

### 4. Ejecución Local sin Docker (Entorno de Desarrollo)

Si deseas ejecutar cada servicio por separado de forma nativa en tu máquina:

#### Backend:
Instala las dependencias y corre el servidor Express con TypeScript y SQLite:
```bash
cd backend
npm install
npx ts-node src/index.ts
```

#### Frontend:
Instala las dependencias y corre el servidor de desarrollo de Vite:
```bash
cd frontend
npm install
npm run dev
```

---

## 💡 ¿Qué hicimos y Por qué?
Desarrollamos una herramienta de seguimiento de trabajo en equipo. El objetivo principal (el *por qué*) es brindar visibilidad instantánea del esfuerzo y el progreso en tareas complejas que se subdividen en múltiples partes. Para lograrlo, implementamos un modelo de datos recursivo (una tarea puede ser padre de otras) con propagación matemática de métricas de progreso.

## 🌟 Funcionalidades Principales

* **Árbol Jerárquico Infinito:** Creación de tareas y subtareas sin límite de profundidad.
* **Cálculo de Esfuerzos:** Al completar subtareas, el progreso y el peso (`PT` y `FT`) "burbujean" hacia la tarea raíz para calcular porcentajes de avance reales.
* **Reglas de Integridad (Top-Down y Bottom-Up):**
  * Una tarea no se puede completar si tiene subtareas pendientes.
  * Una subtarea no se puede reabrir si su ancestro ya fue finalizado.
* **Re-enlace Inteligente:** Al eliminar una tarea intermedia, sus subtareas no se pierden ni se eliminan; son promovidas automáticamente conectándose al abuelo.
* **Vista de Urgencias:** Las tareas pueden marcarse como urgentes. Un filtro especial reconstruye el árbol mostrando **solo** los nodos urgentes, conectando directamente nietos urgentes con abuelos urgentes si los padres no lo son.
* **Seguridad en Urgencias:** Las tareas urgentes no pueden ser eliminadas directamente; requieren que se les quite la urgencia primero como medida de seguridad.

## 🛠️ Tecnologías Utilizadas
* **Backend:** Node.js, Express, TypeScript, Sequelize ORM, SQLite. (Lógica de grafos y propagación matemática centralizada).
* **Frontend:** React.js (Vite), TypeScript, Tailwind CSS, Axios. (UI interactiva, notificaciones tipo Toast in-app, y modales personalizados sin alertas nativas).
* **Pruebas:** Jest, ts-jest.
* **Contenedores:** Docker, Docker Compose.
