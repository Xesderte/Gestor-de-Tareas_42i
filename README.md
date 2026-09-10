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
```
docker compose up --build
```
> **URLs de acceso:**
> - **Frontend (Aplicación Web):** [http://localhost:5173](http://localhost:5173)
> - **Backend API:** [http://localhost:3001/api/tasks](http://localhost:3001/api/tasks)

---

### 2. Detener la Aplicación en Docker
Detiene y remueve los contenedores de la aplicación:
```
docker compose down
```

---

### 3. Ejecutar las Pruebas Unitarias
Ejecuta la suite de pruebas unitarias automatizadas con Jest y ts-jest que validan la lógica de negocio y las fórmulas de propagación matemática (`PropagarIncrementoPeso`, `PropagarAvanceProgreso`, `PropagarEliminacionNodo`):
```
cd backend && npm test
```

---

### 4. Ejecución Local sin Docker (Entorno de Desarrollo)

Si deseas ejecutar cada servicio por separado de forma nativa en tu máquina:

#### Backend:
Instala las dependencias y corre el servidor Express con TypeScript y SQLite:
```
cd backend
npm install
npx ts-node src/index.ts
```

#### Frontend:
Instala las dependencias y corre el servidor de desarrollo de Vite:
```
cd frontend
npm install
npm run dev
```

---

## 💡 ¿Qué hicimos y Por qué?
Desarrollamos una herramienta de seguimiento de trabajo en equipo. El objetivo principal (el *por qué*) es brindar visibilidad instantánea del esfuerzo y el progreso en tareas complejas que se subdividen en múltiples partes. Para lograrlo, implementamos un modelo de datos recursivo (una tarea puede ser padre de otras) con propagación matemática de métricas de progreso.

---

## 🖥️ Guía Visual de la Interfaz y Métricas

La tarjeta de cada tarea cuenta con indicadores claros y acciones contextuales:

* **Estados de la Tarea:**
  * 🔴 **Pendiente:** Ningún trabajo iniciado (0% completado).
  * 🟡 **En Progreso:** Parte del trabajo o subtareas han sido completadas.
  * 🟢 **Finalizado:** Se completa pulsando el checkbox/casilla.
* **Métricas Clave:**
  * ⚖️ **Peso Total (`PT`):** Suma total de unidades de trabajo de la tarea y de todas sus subtareas anidadas.
  * ⚡ **Rayo / Urgencia (`indicador_urgencia`):** Indica si la tarea es urgente. Permite filtrar el árbol en la vista especial de urgencias.
  * 🔨 **Martillo / Esfuerzo:** Representa la estimación de esfuerzo requerido para resolver la tarea (escala del 1 al 10).
  * 📊 **Barra de Progreso:** Muestra visual y porcentualmente el avance del trabajo completado (`FT` / `PT`) considerando todo el árbol de subtareas.
* **Acciones Rápidas:**
  * ➕ **Botón (+):** Si está en la barra superior (Navbar), crea una **tarea principal/raíz**. Si está dentro de una tarjeta, crea una **subtarea** anidada directamente en ese nodo.
  * 🌿 **Icono de Ramas:** Expande o colapsa el árbol de subtareas de ese nodo.
  * ✏️ **Editar:** Permite actualizar el título y la descripción de la tarea (habilitado solo si la tarea no está finalizada).
  * 🗑️ **Eliminar:** Muestra un modal de confirmación advirtiendo sobre la reubicación de subtareas.

---

## 🧠 Reglas de Lógica de Negocio e Integridad

1. **Restricción de Finalización (Bottom-Up):**
   * Una tarea **NO puede finalizarse** si tiene subtareas pendientes. Debe resolverse primero todo el árbol de hijos para poder completar el padre.
2. **Re-enlace Inteligente de Huérfanos al Eliminar:**
   * Cuando se elimina una tarea intermedia que contiene hijos, las subtareas **no se destruyen**: son reasignadas automáticamente pasando a depender del padre de la tarea eliminada (el abuelo).
3. **Inmutabilidad de Tareas Finalizadas:**
   * Una tarea en estado **Finalizado** no puede ser editada ni modificada sin antes reabrirla.
4. **Protección de Tareas Urgentes:**
   * Una tarea marcada como urgente **no se puede eliminar directamente**. El sistema bloquea la acción y exige quitarle el indicador de urgencia primero como medida de seguridad.

---

## 🛠️ Tecnologías Utilizadas
* **Backend:** Node.js, Express, TypeScript, Sequelize ORM, SQLite. (Lógica de grafos y propagación matemática centralizada).
* **Frontend:** React.js (Vite), TypeScript, Tailwind CSS, Axios. (UI interactiva, notificaciones tipo Toast in-app, y modales personalizados sin alertas nativas).
* **Pruebas:** Jest, ts-jest.
* **Contenedores:** Docker, Docker Compose.
