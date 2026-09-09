# Documentación de Endpoints - Sistema de Tareas

## Iteración 1: Tareas Base

### 1. Crear Tarea Raíz

* **Descripción:** Crea una nueva tarea principal en el sistema. Se garantiza que sea una tarea raíz asignando `padre_id: null` internamente, e inicializando las métricas por defecto.
* **Ruta:** `http://localhost:3001/api/tasks`
* **Método:** POST
* **Cuerpo de la Petición (JSON Input):**
  ```
  {
    "titulo": "string",
    "descripcion": "string",
    "indicador_urgencia": "boolean (opcional)"
  }
  ```
* **Respuesta Esperada (Output):**
  ```
  {
    "id": "UUID",
    "titulo": "string",
    "descripcion": "string",
    "estado": "string (por defecto 'pendiente')",
    "indicador_urgencia": "boolean | null",
    "padre_id": "null",
    "peso_individual": "integer (por defecto 1)",
    "peso_grupal": "integer (por defecto 0)",
    "peso_total": "integer (por defecto 1)",
    "final_total": "integer (por defecto 0)",
    "createdAt": "date-time",
    "updatedAt": "date-time"
  }
  ```

---

### 2. Obtener Tareas Raíz

* **Descripción:** Recupera una lista completa de todas las tareas principales registradas en el sistema (aquellas donde el campo `padre_id` es estrictamente `null`).
* **Ruta:** `http://localhost:3001/api/tasks`
* **Método:** GET
* **Cuerpo de la Petición (JSON Input):** No requiere body.
* **Respuesta Esperada (Output):**
  ```
  [
    {
      "id": "UUID",
      "titulo": "string",
      "descripcion": "string",
      "estado": "string",
      "indicador_urgencia": "boolean | null",
      "padre_id": "null",
      "peso_individual": "integer",
      "peso_grupal": "integer",
      "peso_total": "integer",
      "final_total": "integer",
      "createdAt": "date-time",
      "updatedAt": "date-time"
    }
  ]
  ```

---

### 3. Modificar Urgencia de Tarea

* **Descripción:** Alterna (marca o desmarca) el estado de urgencia de una tarea específica, permitiendo al frontend actualizar este indicador con un solo clic.
* **Ruta:** `http://localhost:3001/api/tasks/:id/urgency`
* **Método:** PATCH
* **Cuerpo de la Petición (JSON Input):**
  ```
  {
    "indicador_urgencia": "boolean"
  }
  ```
* **Respuesta Esperada (Output):**
  ```
  {
    "id": "UUID",
    "titulo": "string",
    "descripcion": "string",
    "estado": "string",
    "indicador_urgencia": "boolean",
    "padre_id": "null | UUID",
    "peso_individual": "integer",
    "peso_grupal": "integer",
    "peso_total": "integer",
    "final_total": "integer",
    "createdAt": "date-time",
    "updatedAt": "date-time"
  }
  ```

---

## Iteración 2: Árbol de Subtareas

### 4. Crear Subtarea

* **Descripción:** Crea una nueva subtarea hija dependiente de una tarea padre existente en el sistema. Esta acción dispara automáticamente el recálculo matemático de pesos (peso_grupal y peso_total) en el padre y ancestros mediante un burbujeo ascendente.
* **Ruta:** `http://localhost:3001/api/tasks/:id/subtasks`
* **Método:** POST
* **Cuerpo de la Petición (JSON Input):**
  ```
  {
    "titulo": "string",
    "descripcion": "string",
    "indicador_urgencia": "boolean"
  }
  ```
* **Respuesta Esperada (Output):**
  ```
  {
    "id": "UUID",
    "titulo": "string",
    "descripcion": "string",
    "estado": "string",
    "indicador_urgencia": "boolean",
    "padre_id": "UUID",
    "peso_individual": "integer",
    "peso_grupal": "integer",
    "peso_total": "integer",
    "final_total": "integer",
    "createdAt": "date-time",
    "updatedAt": "date-time"
  }
  ```

---

### 5. Obtener Detalle y Árbol

* **Descripción:** Recupera una tarea específica por su ID junto con todo su árbol de descendientes (subtareas anidadas). Además, inyecta dinámicamente las métricas derivadas de esfuerzo (`esfuerzo_total` y `esfuerzo_relativo`) calculadas en escala entera del 1 al 10 basándose en el Peso Total de la tarea raíz.
* **Ruta:** `http://localhost:3001/api/tasks/:id`
* **Método:** GET
* **Cuerpo de la Petición (JSON Input):** No requiere body.
* **Respuesta Esperada (Output):**
  ```
  {
    "id": "UUID",
    "titulo": "string",
    "descripcion": "string",
    "estado": "string",
    "indicador_urgencia": "boolean",
    "padre_id": "null | UUID",
    "peso_individual": "integer",
    "peso_grupal": "integer",
    "peso_total": "integer",
    "final_total": "integer",
    "createdAt": "date-time",
    "updatedAt": "date-time",
    "hijos": [
      {
        "id": "UUID",
        "titulo": "string",
        "descripcion": "string",
        "estado": "string",
        "indicador_urgencia": "boolean",
        "padre_id": "UUID",
        "peso_individual": "integer",
        "peso_grupal": "integer",
        "peso_total": "integer",
        "final_total": "integer",
        "createdAt": "date-time",
        "updatedAt": "date-time",
        "hijos": [],
        "esfuerzo_total": "integer",
        "esfuerzo_relativo": "integer"
      }
    ],
    "esfuerzo_total": "integer",
    "esfuerzo_relativo": "integer"
  }
  ```
