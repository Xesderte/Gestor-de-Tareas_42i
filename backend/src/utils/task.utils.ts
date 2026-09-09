import { Task } from '../db';

/**
 * Propaga recursivamente el peso_grupal de manera bottom-up por el árbol de tareas.
 * 
 * @param tareaId El ID de la tarea a procesar.
 * @param delta El peso a sumar al peso_grupal (por defecto 1).
 */
export const PropagarIncrementoPeso = async (tareaId: string | number, delta: number = 1): Promise<void> => {
    // 1. Busca la tarea en la base de datos
    const tarea = await Task.findByPk(tareaId);

    // 2. Retorno temprano si la tarea no existe
    if (!tarea) {
        return;
    }

    // 3. Suma el parámetro delta al campo peso_grupal actual
    tarea.peso_grupal += delta;

    // 4. Recalcula el campo peso_total sumando el peso_individual actual + el nuevo peso_grupal
    tarea.peso_total = tarea.peso_individual + tarea.peso_grupal;

    // 5. Guarda explícitamente los cambios en la base de datos mediante el ORM
    await tarea.save();

    // 6. Condición recursiva: continuar propagando el peso hacia los ancestros
    if (tarea.padre_id !== null) {
        await PropagarIncrementoPeso(tarea.padre_id, delta);
    }
};
