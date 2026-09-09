# Sistema de Tareas

Aplicación web desarrollada para gestionar las tareas de un equipo de desarrollo pequeño, permitiendo organizar, priorizar y estimar el trabajo con una jerarquía de subtareas multinivel y cálculos automáticos de esfuerzo y progreso.

---

## Contexto

El equipo necesita una herramienta sencilla para hacer un seguimiento de su trabajo. Las tareas deben estar organizadas, priorizadas y estimadas para que el equipo pueda entender su carga de trabajo de un vistazo.

---

## Requisitos

### Gestión de tareas
* Los usuarios pueden crear, ver, actualizar y eliminar tareas.
* Cada tarea debe incluir como mínimo: un título, una descripción y metadatos relevantes.
* Las tareas deben tener un ciclo de vida que refleje cómo avanza el trabajo en un equipo.
* Las tareas deben tener una forma de indicar la urgencia para que el equipo pueda enfocarse en lo que más importa.
* Las tareas pueden contener subtareas, las cuales también pueden contener subtareas (la jerarquía puede tener múltiples niveles de profundidad).

### Estimaciones
* Las tareas pueden tener, de forma opcional, una estimación de esfuerzo (un número no negativo).
* El sistema debe ayudar al equipo a entender: cuánto trabajo aún no ha comenzado, cuánto está actualmente en progreso y el esfuerzo total estimado.
* Estos cálculos deben considerar toda la jerarquía de subtareas.

### Vistas
* Una vista principal que liste todas las tareas con su información clave y una forma de acceder a los detalles de cada tarea.
* Una vista de detalle donde los usuarios puedan ver toda la información de la tarea, gestionar subtareas y realizar operaciones sobre la misma.

### Aspectos técnicos
* Proveer una API CRUD para las tareas.
* Implementar pruebas unitarias para validar la lógica de negocio.
* La aplicación y sus dependencias deben ejecutarse localmente con un único comando de Docker Compose.
* El archivo README debe incluir comandos listos para copiar y pegar que permitan iniciar la aplicación y ejecutar las pruebas.
* No debe haber dependencias de cuentas de terceros ni de servicios en la nube.

### Uso de IA
* Este desafío está diseñado para completarse utilizando herramientas de IA. Se te anima a utilizar cualquier asistente de IA, agente de programación o herramienta que prefieras.
* Si usaste un agente de programación (Claude Code, Cursor, etc.), incluye tus archivos de configuración en el repositorio (por ejemplo, `CLAUDE.md`, `.cursorrules`, skills, etc.).
* Importante: El código enviado será revisado en detalle y probado. Eres responsable de la calidad, exactitud y consistencia de lo que entregues, independientemente de cómo haya sido generado.

### Proceso
* Utiliza cualquier lenguaje de programación y framework de tu elección.
* Utiliza cualquier forma de persistencia (por ejemplo, en memoria, base de datos, etc.).
* Mantén un historial de commits limpio que refleje tu proceso de desarrollo.
* Fecha límite: 2 días hábiles.

### Deseable (Nice to have)
* Diseño responsivo (adaptable a dispositivos móviles).
* Paginación, ordenamiento y filtrado.

---

## Instrucciones de Ejecución

### Requisitos previos
* Docker y Docker Compose instalados en tu sistema.

### Iniciar la aplicación
Para iniciar la aplicación y sus dependencias localmente con un único comando, ejecuta:

```bash
docker compose up --build