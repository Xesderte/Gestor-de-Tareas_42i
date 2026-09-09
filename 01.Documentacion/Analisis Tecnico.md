# Análisis Técnico y Arquitectura del Sistema de Tareas

## 1. Estructura de Tareas y Subtareas
* Tenemos Tareas y Subtareas (es una tarea más pequeña).
* Las Tareas no tienen un predecesor, son el padre.
* Las Subtareas son tareas hijas de las Tareas, y además pueden tener otras subtareas, es decir, otros hijos.

## 2. Atributos y Esquema de Datos

Para optimizar el rendimiento y evitar escrituras masivas innecesarias en la base de datos, el sistema divide sus datos en dos categorías: **Métricas Principales Persistidas** y **Métricas Derivadas al Vuelo**.

### 2.1. Métricas Principales (Persistidas en Base de Datos)
Son los campos estructurales e incrementales que se guardan físicamente en la base de datos. Solo se modifican de forma ascendente en la rama afectada ($\mathcal{O}(h)$) durante la creación, eliminación o finalización de una tarea:
* **a.** `id`: Identificador único (`UUID` o entero).
* **b.** `titulo`: Nombre descriptivo (`string`).
* **c.** `descripcion`: Detalle de la tarea (`string`).
* **d.** `estado`: Estado del ciclo de vida (`'pendiente'`, `'en progreso'`, `'completado'`).
* **e.** `padre_id`: Referencia a la tarea padre (`UUID` / `entero` o `null` si es Tarea Principal / Raíz).
* **f.** `hijos_ids` / `hijos`: Lista o conjunto de subtareas directas (`Array[ID]` o relación 1-a-N). Lista vacía (`[]`) si la tarea no tiene subtareas (nodo hoja). Permite recorrer el subárbol hacia abajo (`nodo.hijos`).
* **g.** `indicador_urgencia` (Opcional): Etiqueta manual de urgencia o prioridad asignada.
* **h.** `peso_individual` ($PI$): `1` (Cada Tarea y Subtarea pesa 1 por sí misma).
* **i.** `peso_grupal` ($PG$): Suma del peso total de cada uno de sus hijos directos. (Si no tiene hijos, es `0`).
* **j.** `peso_total` ($PT$): Suma del Peso Individual y el Peso Grupal ($PT = PI + PG$).
* **k.** `final_total` ($FT$): Cantidad de tareas terminadas dentro de su jerarquía (incluyéndose a sí misma si está completada).

---

### 2.2. Métricas Derivadas (Calculadas al Vuelo / En Memoria)
**NO se almacenan en la base de datos.** Se calculan dinámicamente en el backend (servicios/serializadores/DTOs) al momento de consultar una tarea o listado. Esto evita que la adición o eliminación de una subtarea en niveles profundos obligue a actualizar todos los registros de la base de datos:

* **a. Progreso Individual / Subárbol:**
  $$
  \text{Progreso} = \frac{FT}{PT}
  $$
* **b. Progreso General (de toda la actividad):**
  $$
  \text{Progreso General} = \frac{FT(\text{Raíz})}{PT(\text{Raíz})}
  $$
* **c. Esfuerzo Total (Fijo / Línea Base):** Proporción de trabajo que demanda la tarea respecto a las subtareas del padre principal:
  $$
  \text{Esfuerzo Total}(\text{tarea}) = \frac{PT(\text{tarea})}{PG(\text{Raíz})}
  $$
  Es una métrica estática que no varía con el avance, permitiendo conocer desde el inicio la envergadura y complejidad de cada rama (por ejemplo, saber que una rama concentra el 60% del esfuerzo del proyecto).
* **d. Esfuerzo Relativo (Dinámico / Restante):** Proporción de esfuerzo pendiente por ejecutar en función del avance de la tarea y sus subtareas:
  $$
  \text{Esfuerzo Relativo}(\text{tarea}) = \frac{PT(\text{tarea}) - FT(\text{tarea})}{PG(\text{Raíz})}
  $$
  Al comenzar ($FT = 0$), el esfuerzo relativo es idéntico al Esfuerzo Total. A medida que se completan subtareas ($FT$ aumenta), el esfuerzo relativo decrece gradualmente hasta llegar a $0$ cuando la tarea y todas sus subtareas finalizan ($FT = PT$).
* **e. Determinación del Estado a partir de las Métricas:** El estado de una tarea (`pendiente`, `en progreso`, `completado`) responde directamente a la relación entre $FT$, $PT$ y $PG$:
  * **Pendiente (`pendiente`):** Si $FT = 0$ (no se ha iniciado ninguna subtarea ni la propia tarea).
  * **En Progreso (`en progreso`):** Si $0 < FT < PT$.
    * *Hito relevante:* Si $FT = PG$, todas las subtareas ya fueron concluidas y únicamente resta que la tarea se complete a sí misma ($PI = 1$).
  * **Completado (`completado`):** Si $FT = PT$ (todas las subtareas y la propia tarea están terminadas). En el caso de tareas hoja ($PG = 0$), pasan directamente de `pendiente` ($FT = 0$) a `completado` ($FT = 1$).

---

## 3. Ejemplo Práctico de Medidas y Pesos

* **Tarea A -> Nivel 1 (Raíz)** (`PI: 1`, `PG: 5` <<Suma de PT de cada uno de sus hijos>>, `PT: 6` <<PI + PG>>)
  * **Subtarea AB -> Nivel 2** (`PI: 1`, `PG: 2` <<Suma de PT de cada uno de sus hijos>>, `PT: 3` <<PI + PG>>)
    * **Subtarea ABC -> Nivel 3** (`PI: 1`, `PG: 0`, `PT: 1`)
    * **Subtarea ABC1 -> Nivel 3** (`PI: 1`, `PG: 0`, `PT: 1`)
  * **Subtarea AB1 -> Nivel 2** (`PI: 1`, `PG: 0`, `PT: 1`)
  * **Subtarea AB2 -> Nivel 2** (`PI: 1`, `PG: 0`, `PT: 1`)

Como la Tarea A es el padre principal, sabemos en su $PT$ todas las tareas que debemos de realizar en el Sistema (en este caso 6 tareas en total, de las cuales 5 son subtareas).

### A. Esfuerzo Total (Fijo / Inicial)
Calculado respecto a $PG(\text{Raíz A}) = 5$:
* **AB esfuerzo total** = $PT(AB) / PG(A) = 3 / 5 = 0.60 \rightarrow 60\% \rightarrow \text{Esfuerzo 6 sobre 10}$
* **ABC esfuerzo total** = $PT(ABC) / PG(A) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$
* **ABC1 esfuerzo total** = $PT(ABC1) / PG(A) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$
* **AB1 esfuerzo total** = $PT(AB1) / PG(A) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$
* **AB2 esfuerzo total** = $PT(AB2) / PG(A) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$

Este esfuerzo total permanece inmutable como histórico y referencia de dimensionamiento.

---

### B. Cálculo del Progreso
* **Progreso de toda la actividad (Raíz A):**
  $$
  \text{Final Total}(A) = \text{Final Total}(AB) + \text{Final Total}(AB1) + \text{Final Total}(AB2) + (\text{propia tarea terminada})
  $$
  $$
  \text{Progreso}(A) = \frac{\text{Final Total}(A)}{PT(A)}
  $$

* **Progreso de cada Subtarea (ej. AB):**
  $$
  \text{Progreso}(AB) = \frac{\text{Final Total}(AB)}{PT(AB)}
  $$

---

### C. Dinámica del Esfuerzo Relativo y Evolución de Estados

Veamos el comportamiento paso a paso en la rama **AB**:

1. **Estado Inicial ($FT = 0$):**
   * **Subtarea AB:** $FT(AB) = 0 \implies \text{Estado: 'pendiente'}$.
   * $\text{Esfuerzo Relativo}(AB) = \frac{PT(AB) - FT(AB)}{PG(A)} = \frac{3 - 0}{5} = \frac{3}{5} = 0.60 \rightarrow \text{Esfuerzo 6 sobre 10}$ (igual al Esfuerzo Total).

2. **Se completa ABC ($FT(AB) = 1$):**
   * **Subtarea ABC:** $FT = 1 = PT \implies \text{Estado: 'completado'}$.
   * **Subtarea AB:** $0 < FT(AB) = 1 < PT(AB) = 3 \implies \text{Estado: 'en progreso'}$.
   * $\text{Esfuerzo Relativo}(AB) = \frac{3 - 1}{5} = \frac{2}{5} = 0.40 \rightarrow \text{Esfuerzo 4 sobre 10}$ (bajó de 6 a 4).

3. **Se completa ABC1 ($FT(AB) = 2$):**
   * **Subtarea ABC1:** $FT = 1 = PT \implies \text{Estado: 'completado'}$.
   * **Subtarea AB:** $FT(AB) = 2 = PG(AB) \implies$ **Todas las subtareas de AB están completadas**, solo resta que AB finalice su propia tarea ($PI = 1$). Su estado sigue siendo `'en progreso'`.
   * $\text{Esfuerzo Relativo}(AB) = \frac{3 - 2}{5} = \frac{1}{5} = 0.20 \rightarrow \text{Esfuerzo 2 sobre 10}$.

4. **Se completa la propia tarea AB ($FT(AB) = 3$):**
   * **Subtarea AB:** $FT(AB) = 3 = PT(AB) \implies \text{Estado: 'completado'}$.
   * $\text{Esfuerzo Relativo}(AB) = \frac{3 - 3}{5} = \frac{0}{5} = 0.00 \rightarrow \text{Esfuerzo 0 sobre 10}$ (esfuerzo culminado).

---

## 4. Consideraciones Técnicas para la Implementación

### 4.1. Ciclo de Vida y Deducción de Estados
1. **Deducción Dinámica del Estado:** El estado de una tarea no requiere una asignación manual arbitraria, sino que responde a sus métricas de ejecución:
   * $FT = 0 \implies \text{'pendiente'}$
   * $0 < FT < PT \implies \text{'en progreso'}$ (con $FT = PG$ indicando subtareas listas).
   * $FT = PT \implies \text{'completado'}$
2. **Regla de Dependencia Bottom-Up:** Una tarea con subtareas ($PG > 0$) no puede marcar su propia tarea individual ($PI$) como completada hasta que $FT = PG$ (todas sus subtareas terminadas).
3. **Métricas a Calcular:**
   * **Progreso:** $\text{Final Total} / \text{Peso Total}$.
   * **Esfuerzo Total:** $PT / PG_{\text{Raíz}}$ (fijo).
   * **Esfuerzo Relativo:** $(PT - FT) / PG_{\text{Raíz}}$ (decreciente hacia 0).

---

### 4.2. Pseudocódigo de Funciones Recursivas

#### Operación 1: Creación de Subtarea (Burbujeo Ascendente de Pesos)
Cuando se agrega una subtarea, se suma $+1$ a los pesos grupal y total a lo largo de toda la cadena de ancestros hasta la raíz.

```text
Funcion PropagarIncrementoPeso(nodoActual, delta = 1):
    Si nodoActual es NULO:
        Retornar
    
    // 1. Incrementar pesos del nodo
    nodoActual.peso_grupal = nodoActual.peso_grupal + delta
    nodoActual.peso_total = nodoActual.peso_individual + nodoActual.peso_grupal
    
    // 2. Llamada recursiva al padre hacia arriba
    PropagarIncrementoPeso(nodoActual.padre, delta)


Funcion CrearSubtarea(padreId, datosNuevaTarea):
    tareaPadre = BuscarTareaPorId(padreId)
    Si tareaPadre es NULO:
        LanzarError("La tarea padre no existe")
        
    nuevaSubtarea = InstanciarTarea(datosNuevaTarea)
    nuevaSubtarea.padre = tareaPadre
    nuevaSubtarea.hijos = ListaVacia()
    nuevaSubtarea.peso_individual = 1
    nuevaSubtarea.peso_grupal = 0
    nuevaSubtarea.peso_total = 1
    nuevaSubtarea.final_total = 0
    
    // Asociar a la lista de hijos del padre
    tareaPadre.hijos.agregar(nuevaSubtarea)
    
    // Propagar incremento (+1) por toda la rama ascendente
    PropagarIncrementoPeso(tareaPadre, 1)
    
    Retornar nuevaSubtarea
```

---

#### Operación 2: Eliminación Simple de Subtarea (Re-enlace / Adopción de Hijos)
Se elimina **únicamente** el nodo seleccionado. Sus hijos no se pierden: son adoptados por el padre del nodo que se elimina (el abuelo). Como la estructura solo pierde $1$ nodo en total, se resta $-1$ a los ancestros.

```text
Funcion PropagarDecrementoPeso(nodoActual, delta):
    Si nodoActual es NULO:
        Retornar
        
    nodoActual.peso_grupal = nodoActual.peso_grupal - delta
    nodoActual.peso_total = nodoActual.peso_individual + nodoActual.peso_grupal
    
    PropagarDecrementoPeso(nodoActual.padre, delta)


Funcion EliminarSubtareaSimple(tareaId):
    tareaAEliminar = BuscarTareaPorId(tareaId)
    padre = tareaAEliminar.padre
    
    Si padre no es NULO:
        // 1. Remover la tarea de la lista de hijos del padre
        padre.hijos.remover(tareaAEliminar)
        
        // 2. Re-enlace (Adopción): Los hijos de la tarea eliminada pasan al abuelo
        Para cada hijo en tareaAEliminar.hijos:
            hijo.padre = padre
            padre.hijos.agregar(hijo)
            
        // 3. Propagar resta de 1 (solo se eliminó una unidad de peso)
        PropagarDecrementoPeso(padre, 1)
        
    Sino:
        // Si era una Tarea Principal (Nivel 1), sus hijos se promueven a Tareas Principales
        Para cada hijo en tareaAEliminar.hijos:
            hijo.padre = NULO
            RegistrarComoTareaPrincipal(hijo)
            
    DestruirRegistro(tareaAEliminar)
```

---

#### Operación 3: Eliminación en Cascada (Nodo + Todo su Subárbol)
Se elimina el nodo y todos sus descendientes de forma definitiva. Se resta el $PT$ completo del nodo a todos los ancestros superiores.

```text
Funcion EliminarSubarbolRecursivo(nodoActual):
    // Recorrido Post-Orden: primero elimina hojas y luego el nodo actual
    Para cada hijo en nodoActual.hijos:
        EliminarSubarbolRecursivo(hijo)
        
    DestruirRegistro(nodoActual)


Funcion EliminarEnCascada(tareaId):
    tareaAEliminar = BuscarTareaPorId(tareaId)
    padre = tareaAEliminar.padre
    pesoARestar = tareaAEliminar.peso_total
    
    Si padre no es NULO:
        // 1. Desvincular del padre
        padre.hijos.remover(tareaAEliminar)
        
        // 2. Restar todo el subárbol hacia arriba
        PropagarDecrementoPeso(padre, pesoARestar)
    
    // 3. Eliminación física en profundidad
    EliminarSubarbolRecursivo(tareaAEliminar)
```

---

#### Operación 4: Deducción de Estado y Propagación de Avance

```text
Funcion CalcularEstado(nodo):
    Si nodo.final_total == 0:
        Retornar 'pendiente'
    Si nodo.final_total == nodo.peso_total:
        Retornar 'completado'
    Retornar 'en progreso'


Funcion CalcularEsfuerzoRelativo(nodo, nodoRaiz):
    Si nodoRaiz.peso_grupal == 0:
        Retornar 0
    esfuerzoRestante = nodo.peso_total - nodo.final_total
    Retornar esfuerzoRestante / nodoRaiz.peso_grupal


Funcion PropagarAvanceProgreso(nodoActual, deltaFinalTotal = 1):
    Si nodoActual es NULO:
        Retornar
        
    nodoActual.final_total = nodoActual.final_total + deltaFinalTotal
    nodoActual.progreso = nodoActual.final_total / nodoActual.peso_total
    nodoActual.estado = CalcularEstado(nodoActual)
    
    PropagarAvanceProgreso(nodoActual.padre, deltaFinalTotal)


Funcion MarcarTareaPropiaCompletada(tareaId):
    tarea = BuscarTareaPorId(tareaId)
    
    // Validar condición: Si tiene subtareas, deben estar todas completadas (FT == PG)
    Si tarea.peso_grupal > 0 y tarea.final_total < tarea.peso_grupal:
        LanzarError("No se puede completar la tarea propia porque tiene subtareas pendientes")
        
    // Propagar +1 en final_total por la finalización de su propia tarea individual (PI = 1)
    PropagarAvanceProgreso(tarea, 1)
```

---

## 5. Límites del Alcance y Precondiciones (Scope Boundaries)

### 5.1. Reasignación de Tareas (Mover de Padre): Fuera de Alcance (Out of Scope)
* **Definición:** La acción de trasladar una subtarea existente de una rama a otra (cambio dinámico de `padre_id`) queda explícitamente **Fuera de Alcance**.
* **Justificación Técnica:**
  * El requerimiento oficial exige un CRUD habitual (crear, ver, actualizar atributos propios y eliminar).
  * La reasignación de padres introduce complejidad adicional innecesaria (detección de ciclos en grafos, desconexión y doble recálculo de árboles $PT/PG$, re-renderizado profundo) ajena a los objetivos prioritarios del desafío.
* **Precondición:** El vínculo jerárquico (`padre_id`) se establece de forma definitiva al momento de la creación de la subtarea. Si un usuario desea reubicar una tarea, deberá eliminarla y recrearla en la rama correspondiente.

### 5.2. Persistencia y Compatibilidad
* **Modelo Relacional (SQL):** Se persiste `padre_id` como Clave Foránea (`FOREIGN KEY`). La colección `hijos` se resuelve mediante consulta relacional (`WHERE padre_id = tarea.id`) o a través de la relación de navegación 1-a-Muchos provista por el ORM.
* **Modelo Documental (NoSQL / En Memoria):** Se puede persistir directamente el arreglo de `hijos_ids: [id1, id2, ...]` o embeber la lista de subtareas, facilitando el recorrido inmediato del subárbol.
* En cualquier variante, la aplicación y sus dependencias se ejecutarán localmente sin servicios en la nube externos mediante `docker compose up --build`.

### 5.3. Justificación de Rendimiento: No Persistir Métricas Derivadas
* **Problema de la Persistencia Desnormalizada:** Si métricas como el *Esfuerzo Relativo* o el *Progreso* se almacenaran en columnas de la base de datos, cada inserción o eliminación de una subtarea en un nodo de nivel profundo (ej. nivel 5) modificaría el $PG$ de la Raíz principal, obligando a ejecutar un `UPDATE` masivo en **todos los registros de la base de datos** del árbol para actualizar sus porcentajes.
* **Solución Óptima Adoptada:** Únicamente se persisten las variables estructurales e incrementales ($PI, PG, PT, FT, \text{estado}$), cuya propagación ocurre estrictamente en $\mathcal{O}(h)$ (solo la cadena de ancestros hasta la raíz). Las métricas relativas se calculan al vuelo en memoria durante la serialización de respuestas de la API, garantizando máxima velocidad y escalabilidad.