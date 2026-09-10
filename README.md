# Gestor de Tareas 42i

Sistema avanzado de gestión de tareas estructurado en árbol jerárquico infinito, diseñado para priorizar y calcular el esfuerzo de equipos de desarrollo.

## Enlaces Importantes
- [Análisis Técnico](./01.Documentacion/Analisis%20Tecnico.md)
- [Enunciado Principal](./01.Documentacion/Enunciado%20Principal.md)
- [Documentación de Endpoints](./backend/Endpoints.md)

---

## 🚀 Inicio Rápido con Docker Compose (Recomendado)

Para levantar la aplicación completa (Backend + Frontend) con un solo comando:

```
docker compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/tasks

Para detener los contenedores:
```
docker compose down
```

---

## 🧪 Ejecutar Pruebas Unitarias

El proyecto incluye pruebas unitarias automatizadas con Jest y ts-jest que validan la lógica de negocio y las fórmulas de propagación matemática:

```
cd backend
npm test
```

---

## 🛠️ Ejecución Local sin Docker (Desarrollo)

### Backend
```
cd backend
npm install
npx ts-node src/index.ts
```

### Frontend
```
cd frontend
npm install
npm run dev
```

---

## ¿Qué hicimos y Por qué?
Desarrollamos una herramienta de seguimiento de trabajo en equipo. El objetivo principal (el *por qué*) es brindar visibilidad instantánea del esfuerzo y el progreso en tareas complejas que se subdividen en múltiples partes. Para lograrlo, implementamos un modelo de datos recursivo (una tarea puede ser padre de otras) con propagación matemática de métricas de progreso.

## Funcionalidades Principales

* **Árbol Jerárquico Infinito:** Creación de tareas y subtareas sin límite de profundidad.
* **Cálculo de Esfuerzos:** Al completar subtareas, el progreso y el peso (`PT` y `FT`) "burbujean" hacia la tarea raíz para calcular porcentajes de avance reales.
* **Reglas de Integridad (Top-Down y Bottom-Up):**
  * Una tarea no se puede completar si tiene subtareas pendientes.
  * Una subtarea no se puede reabrir si su ancestro ya fue finalizado.
* **Re-enlace Inteligente:** Al eliminar una tarea intermedia, sus subtareas no se pierden ni se eliminan; son promovidas automáticamente conectándose al abuelo.
* **Vista de Urgencias:** Las tareas pueden marcarse como urgentes. Un filtro especial reconstruye el árbol mostrando **solo** los nodos urgentes, conectando directamente nietos urgentes con abuelos urgentes si los padres no lo son.
* **Seguridad en Urgencias:** Las tareas urgentes no pueden ser eliminadas directamente; requieren que se les quite la urgencia primero como medida de seguridad.

## Tecnologías (Cómo lo hicimos)
* **Backend:** Node.js, Express, TypeScript, Sequelize ORM, SQLite. (Lógica de grafos y propagación matemática centralizada).
* **Frontend:** React.js (Vite), TypeScript, Tailwind CSS, Axios. (UI interactiva, notificaciones tipo Toast in-app, y modales personalizados sin alertas nativas).
* **Pruebas:** Jest, ts-jest.
* **Contenedores:** Docker, Docker Compose.
