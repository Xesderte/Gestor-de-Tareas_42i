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

/**
 * Propaga recursivamente el avance del progreso (final_total) de manera bottom-up.
 * También deduce y actualiza el estado (pendiente, en progreso, completado) de la tarea.
 * 
 * @param tareaId El ID de la tarea a procesar.
 * @param delta El progreso a sumar al final_total (+1 si se completa una hoja, -1 si se desmarca).
 */
export const PropagarAvanceProgreso = async (tareaId: string | number | null, delta: number): Promise<void> => {
    if (!tareaId) return;

    const tarea = await Task.findByPk(tareaId);
    if (!tarea) return;

    // Sumamos al final_total actual
    const nuevoFinalTotal = tarea.final_total + delta;
    
    // Evitar que baje de 0 o supere el peso_total por seguridad (aunque matemáticamente debería ser exacto)
    const finalTotalSeguro = Math.max(0, Math.min(nuevoFinalTotal, tarea.peso_total));

    // Determinar nuevo estado
    let nuevoEstado = 'pendiente';
    if (finalTotalSeguro === 0) {
        nuevoEstado = 'pendiente';
    } else if (finalTotalSeguro === tarea.peso_total) {
        nuevoEstado = 'finalizado';
    } else {
        nuevoEstado = 'progreso';
    }

    // Actualizamos la tarea directamente
    await tarea.update({
        final_total: finalTotalSeguro,
        estado: nuevoEstado
    });

    // Recursividad hacia el padre
    if (tarea.padre_id !== null) {
        await PropagarAvanceProgreso(tarea.padre_id, delta);
    }
};

/**
 * Propaga recursivamente la eliminación de un nodo (resta su peso y final_total) de manera bottom-up.
 * También deduce y actualiza el estado (pendiente, progreso, finalizado) de la tarea padre.
 * 
 * @param tareaId El ID del padre al que hay que restarle.
 * @param estabaFinalizado Booleano que indica si la tarea eliminada estaba finalizada.
 */
export const PropagarEliminacionNodo = async (tareaId: string | number | null, estabaFinalizado: boolean): Promise<void> => {
    if (!tareaId) return;

    const tarea = await Task.findByPk(tareaId);
    if (!tarea) return;

    // Restamos 1 al peso total y grupal
    const nuevoPesoTotal = Math.max(1, tarea.peso_total - 1);
    const nuevoPesoGrupal = Math.max(0, tarea.peso_grupal - 1);
    
    // Si la tarea eliminada estaba finalizada, restamos 1 al final_total
    const deltaFinal = estabaFinalizado ? -1 : 0;
    const nuevoFinalTotal = Math.max(0, Math.min(tarea.final_total + deltaFinal, nuevoPesoTotal));

    // Determinar nuevo estado
    let nuevoEstado = 'pendiente';
    if (nuevoFinalTotal === 0) {
        nuevoEstado = 'pendiente';
    } else if (nuevoFinalTotal === nuevoPesoTotal) {
        nuevoEstado = 'finalizado';
    } else {
        nuevoEstado = 'progreso';
    }

    // Actualizamos la tarea directamente
    await tarea.update({
        peso_total: nuevoPesoTotal,
        peso_grupal: nuevoPesoGrupal,
        final_total: nuevoFinalTotal,
        estado: nuevoEstado
    });

    // Recursividad hacia el abuelo
    if (tarea.padre_id !== null) {
        await PropagarEliminacionNodo(tarea.padre_id, estabaFinalizado);
    }
};
