import { Task } from '../db';

/**
 * Propaga recursivamente el peso_grupal de manera bottom-up por el árbol de tareas.
 * 
 * @param tareaId El ID de la tarea a procesar.
 * @param delta El peso a sumar al peso_grupal (por defecto 1).
 */
export const PropagarIncrementoPeso = async (tareaId: string | number | null, delta: number = 1): Promise<void> => {
    if (!tareaId) return;

    // 1. Busca la tarea en la base de datos
    const tarea = await Task.findByPk(tareaId);

    // 2. Retorno temprano si la tarea no existe
    if (!tarea) {
        return;
    }

    // 3. Incremento atómico directo en la base de datos
    await tarea.increment({
        peso_grupal: delta,
        peso_total: delta
    });

    // 4. Recargamos la instancia para obtener los datos frescos antes de subir al siguiente nivel
    await tarea.reload();

    // 5. Condición recursiva: continuar propagando el peso hacia los ancestros
    if (tarea.padre_id !== null) {
        await PropagarIncrementoPeso(tarea.padre_id, delta);
    }
};
