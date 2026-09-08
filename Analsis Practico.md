# Análisis Técnico y Arquitectura del Sistema de Tareas

## 1. Estructura de Tareas y Subtareas
* Tenemos Tareas y Subtareas (es una tarea más pequeña).
* Las Tareas no tienen un predecesor, son el padre.
* Las Subtareas son tareas hijas de las Tareas, y además pueden tener otras subtareas, es decir, otros hijos.

## 2. Atributos de Cada Tarea y Subtarea
Cada una de las Tareas y Subtareas cuenta con:
* **a.** Un Título (`string`).
* **b.** Una descripción (`string`).
* **c.** Un estado (`pendiente`, `en progreso`, `completado`).
* **d.** Un padre (solo si es una subtarea).
* **e.** Una o más subtareas.
* **f.** Indicador de Urgencia (Opcional):
  * **f1.** Se calcula en función al peso.
  * **f2.** Se selecciona y se le etiqueta de Urgente.
* **g.** El esfuerzo de cada una de las subtareas se calcula en función al peso.
* **h.** Las tareas tienen diferentes medidas (utilizadas para calcular su esfuerzo y su progreso):
  * **h1.** **Peso Individual:** `1` (Cada Tarea y Subtarea pesa 1).
  * **h2.** **Peso Grupal:** La suma del peso total de cada uno de sus hijos. (Si no tiene hijos su peso es `0`).
  * **h3.** **Peso Total:** Es la suma del Peso Individual y el Peso Grupal.
  * **h4.** **Tareas Terminada:** `boolean` (`True` si la tarea está terminada, `false` si la tarea no está terminada).
  * **h5.** **Esfuerzo:** El esfuerzo de cada una de las subtareas se calcula en función al peso.
  * **h6.** **Final Total:** Cantidad de tareas terminadas. 
  * **h7.** Padre (la Tarea de la que procede o de donde se origina).
  * **h8.** Hijos (Subtareas).

---

## 3. Ejemplo Práctico de Medidas y Pesos

* **Tarea A -> Nivel 1** (`PI: 1`, `PG: 5` <<Suma de PT de cada uno de sus hijos>>, `PT: 6` <<PI + PG>>)
  * **Subtarea AB -> Nivel 2** (`PI: 1`, `PG: 2` <<Suma de PT de cada uno de sus hijos>>, `PT: 3` <<PI + PG>>)
    * **Subtarea ABC -> Nivel 3** (`PI: 1`, `PG: 0`, `PT: 1`)
    * **Subtarea ABC1 -> Nivel 3** (`PI: 1`, `PG: 0`, `PT: 1`)
  * **Subtarea AB1 -> Nivel 2** (`PI: 1`, `PG: 0`, `PT: 1`)
  * **Subtarea AB2 -> Nivel 2** (`PI: 1`, `PG: 0`, `PT: 1`)

Como la Tarea A es el padre, sabemos en su $PT$ todas las tareas que debemos de realizar en el Sistema (en este caso serían 6 tareas en total).

Sabemos que las subtareas de A son AB, AB1 y AB2:
* **AB esfuerzo** = $PT(AB) / PG(\text{Tarea A Nivel 1}) = 3 / 5 = 0.60 \rightarrow 60\% \rightarrow \text{Esfuerzo 6 sobre 10}$
* **ABC esfuerzo** = $PT(ABC) / PG(\text{A Nivel 1}) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$
* **ABC1 esfuerzo** = $PT(ABC1) / PG(\text{A Nivel 1}) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$
* **AB1 esfuerzo** = $PT(AB1) / PG(\text{A Nivel 1}) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$
* **AB2 esfuerzo** = $PT(AB2) / PG(\text{A Nivel 1}) = 1 / 5 = 0.20 \rightarrow 20\% \rightarrow \text{Esfuerzo 2 sobre 10}$   

### Cálculo del Progreso
* **Para calcular el progreso de toda la actividad:**
  Se toma el $PT(A)$ (Tarea A, el padre principal) y la Final Total de cada uno de sus hijos directos:
  $$\frac{\text{FinalTotal}(AB) + \text{FinalTotal}(AB1) + \text{FinalTotal}(AB2)}{PT(A)} = \text{Progreso de la Actividad}$$

* **Calcular el progreso de Cada Subtarea:** se utiliza la misma fórmula para el progreso principal pero esta vez para cada subtarea. Se toma el $PT(AB)$ (Tarea AB, el padre de las subtareas) y la Final Total de cada uno de sus hijos directos:
  $$\frac{\text{FinalTotal}(ABC) + \text{FinalTotal}(ABC1)}{PT(AB)} = \text{Progreso de la Subtarea AB}$$

> *Nota:* Si una tarea no tiene hijos, su $PT = PI$ y su $PG = 0$, y por lo tanto su $PG$ es `0`, ($PI = 1$) $\Rightarrow$ ($PT = 1$).

---

## 4. Consideraciones Técnicas para la Implementación

### Funciones Recursivas
1. **Tanto en la creación de Subtareas:** Actualización de los pesos (Peso Grupal, Peso Total, Esfuerzo) de cada una de las Tareas y Subtareas.
2. **En la Eliminación de Subtareas / Tareas:** 
   * Si se elimina la Tarea Padre Principal, las Subtareas pasan a ser Padres.
   * Si una Subtarea es eliminada y esta misma tiene hijos: Los hijos pasan a ser tareas hijas de la tarea que tiene como padre a la subtarea a eliminar. Actualización de los pesos (Peso Grupal, Peso Total, Esfuerzo) de cada una de las Tareas y Subtareas.
   * Si una tarea es eliminada y no tiene hijos: Actualización de los pesos (Peso Grupal, Peso Total, Esfuerzo) de cada una de las Tareas y Subtareas.

### Ciclo de Vida y Estados
* **Aclaración Principal:** Una Tarea es completa cuando sus subtareas son completas (si es que tiene subtareas) y cuando finaliza su propia tarea. Por ende, si no tiene subtareas, únicamente con que termine su propia tarea ya se considera completada.
* Si no terminó sus subtareas, no puede completarse a sí misma; sí o sí para poder terminar su propia tarea, debe terminar sus Subtareas.  

### Métricas a Calcular
Dos tipos de progresos:
1. **Progreso General:** El progreso de toda la actividad a través de su Tarea Padre Principal.
2. **Progreso de cada una de las Subtareas:** Se calcula individualmente para cada una de ellas.