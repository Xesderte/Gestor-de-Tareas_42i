# Documentación de API - Gestor de Tareas

A continuación se detallan todos los endpoints disponibles en el backend para la gestión del árbol de tareas, operaciones CRUD y control de estados.

---

### 1. Obtener Árbol de Tareas Urgentes
* **Descripción:** Devuelve un árbol filtrado que contiene **únicamente** las tareas urgentes. Si un abuelo es urgente y su nieto también, pero el padre no lo es, el nieto se conecta directamente al abuelo.
* **Ruta:** `http://localhost:3001/api/tasks/urgent-tree`
* **Método:** GET
* **Cuerpo de la Petición (JSON Input):** No requiere body.
* **Respuesta Esperada (Output):**
```
[
  {
    "id": "UUID",
    "titulo": "string",
    "descripcion": "string",
    "estado": "pendiente | progreso | finalizado",
    "indicador_urgencia": true,
    "padre_id": "null | UUID",
    "peso_individual": "integer",
    "peso_grupal": "integer",
    "peso_total": "integer",
    "final_total": "integer",
    "createdAt": "date",
    "updatedAt": "date",
    "esfuerzo_total": "integer",
    "esfuerzo_relativo": "integer",
    "hijos": [
      // ...estructura recursiva de tareas urgentes
    ]
  }
]
```

---

### 2. Crear Tarea Raíz
* **Descripción:** Crea una nueva tarea principal en el sistema. Al ser raíz, su `padre_id` se define automáticamente como `null`.
* **Ruta:** `http://localhost:3001/api/tasks`
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
  "estado": "pendiente",
  "indicador_urgencia": "boolean",
  "padre_id": null,
  "peso_individual": 1,
  "peso_grupal": 0,
  "peso_total": 1,
  "final_total": 0,
  "createdAt": "date",
  "updatedAt": "date"
}
```

---

### 3. Obtener Tareas Raíz (Vista Principal)
* **Descripción:** Obtiene la lista de todas las tareas principales (raíz) que no tienen un padre asignado (`padre_id` es `null`). No carga los hijos profundamente para optimizar la vista principal.
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
    "estado": "pendiente | progreso | finalizado",
    "indicador_urgencia": "boolean",
    "padre_id": null,
    "peso_individual": "integer",
    "peso_grupal": "integer",
    "peso_total": "integer",
    "final_total": "integer",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

---

### 4. Alternar Urgencia de Tarea
* **Descripción:** Cambia el indicador de urgencia de una tarea en específico (invierte su valor actual).
* **Ruta:** `http://localhost:3001/api/tasks/:id/urgency`
* **Método:** PATCH
* **Cuerpo de la Petición (JSON Input):**
```
{
  "urgente": "boolean"
}
```
* **Respuesta Esperada (Output):**
```
{
  "id": "UUID",
  "titulo": "string",
  "descripcion": "string",
  "estado": "pendiente | progreso | finalizado",
  "indicador_urgencia": "boolean",
  "padre_id": "null | UUID",
  // ...resto de los campos
}
```

---

### 5. Crear Subtarea
* **Descripción:** Crea una subtarea (hijo) vinculada a una tarea específica (`padre_id` hereda el `:id` de la ruta) y propaga el incremento de peso hacia los ancestros.
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
  "estado": "pendiente",
  "indicador_urgencia": "boolean",
  "padre_id": "UUID",
  "peso_individual": 1,
  "peso_grupal": 0,
  "peso_total": 1,
  "final_total": 0,
  // ...resto de los campos
}
```

---

### 6. Obtener Árbol de una Tarea (Expandir Rama)
* **Descripción:** Obtiene los detalles de una tarea específica junto con todo su árbol de descendencia (`hijos`), inyectando en cada nodo el esfuerzo relativo y total basados en el Peso Total (`PT`) de su raíz principal.
* **Ruta:** `http://localhost:3001/api/tasks/:id`
* **Método:** GET
* **Cuerpo de la Petición (JSON Input):** No requiere body.
* **Respuesta Esperada (Output):**
```
{
  "id": "UUID",
  "titulo": "string",
  "descripcion": "string",
  "estado": "pendiente | progreso | finalizado",
  "indicador_urgencia": "boolean",
  "padre_id": "null | UUID",
  "peso_total": "integer",
  "final_total": "integer",
  "esfuerzo_total": "integer",
  "esfuerzo_relativo": "integer",
  "hijos": [
    // ...estructura recursiva completa
  ]
}
```

---

### 7. Cambiar Estado de Completado
* **Descripción:** Marca o desmarca una tarea como finalizada. Cuenta con validaciones "bottom-up" (no se puede finalizar si tiene hijos pendientes) y "top-down" (no se puede desmarcar si su padre ya fue finalizado). Propaga matemáticamente el avance (`final_total`) hacia arriba.
* **Ruta:** `http://localhost:3001/api/tasks/:id/complete`
* **Método:** PATCH
* **Cuerpo de la Petición (JSON Input):**
```
{
  "completed": "boolean"
}
```
* **Respuesta Esperada (Output):**
```
{
  "id": "UUID",
  "estado": "pendiente | progreso | finalizado",
  "peso_total": "integer",
  "final_total": "integer",
  "esfuerzo_total": "integer",
  "esfuerzo_relativo": "integer"
  // ...resto de los campos
}
```

---

### 8. Editar Tarea (Edición Simple)
* **Descripción:** Actualiza los detalles informativos de una tarea (título, descripción o urgencia). Impide la edición si la tarea tiene el estado `finalizado`.
* **Ruta:** `http://localhost:3001/api/tasks/:id`
* **Método:** PUT
* **Cuerpo de la Petición (JSON Input):** (Todos los campos son opcionales)
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
  "indicador_urgencia": "boolean",
  "estado": "pendiente | progreso | finalizado"
  // ...resto de los campos
}
```

---

### 9. Eliminar Tarea (Re-enlace Simple)
* **Descripción:** Elimina una tarea del sistema. Impide la eliminación si la tarea tiene indicador de urgencia. En lugar de hacer una eliminación en cascada destructiva, "reconecta" a sus hijos pasándolos a ser hijos del abuelo de la tarea, y luego resta su peso de la jerarquía.
* **Ruta:** `http://localhost:3001/api/tasks/:id`
* **Método:** DELETE
* **Cuerpo de la Petición (JSON Input):** No requiere body.
* **Respuesta Esperada (Output):**
```
{
  "message": "string"
}
```
