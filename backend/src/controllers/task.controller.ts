import { Request, Response } from 'express';
import { Task } from '../db';
import { PropagarIncrementoPeso, PropagarAvanceProgreso } from '../utils/task.utils';

export const createRootTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { titulo, descripcion, indicador_urgencia } = req.body;

        const newTask = await Task.create({
            titulo,
            descripcion,
            indicador_urgencia,
            padre_id: null
        });

        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error al crear tarea raíz:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la tarea' });
    }
};

export const getRootTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const tasks = await Task.findAll({
            where: { padre_id: null }
        });

        const tasksWithEffort = tasks.map(task => {
            const ptRaiz = task.peso_total;
            const esfuerzo_total = ptRaiz === 0 ? 0 : Math.round((task.peso_total / ptRaiz) * 10);
            const esfuerzo_relativo = ptRaiz === 0 ? 0 : Math.round(((task.peso_total - task.final_total) / ptRaiz) * 10);
            
            return {
                ...task.toJSON(),
                esfuerzo_total,
                esfuerzo_relativo
            };
        });

        res.status(200).json(tasksWithEffort);
    } catch (error) {
        console.error('Error al obtener tareas raíz:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las tareas' });
    }
};

export const toggleUrgencyTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { indicador_urgencia } = req.body;

        const task = await Task.findByPk(id as string);

        if (!task) {
            res.status(404).json({ message: 'Tarea no encontrada' });
            return;
        }

        if (indicador_urgencia === undefined) {
            res.status(400).json({ message: 'El campo indicador_urgencia es requerido' });
            return;
        }

        // Asegurarse de que el valor se actualice forzando la actualización
        await task.update({
            indicador_urgencia: indicador_urgencia === true || indicador_urgencia === 'true'
        });

        res.status(200).json(task);
    } catch (error) {
        console.error('Error al modificar la urgencia de la tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la tarea' });
    }
};

export const createSubtask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, indicador_urgencia } = req.body;

        const parentTask = await Task.findByPk(id as string);
        
        if (!parentTask) {
            res.status(404).json({ message: 'La tarea padre no existe' });
            return;
        }

        const newSubtask = await Task.create({
            titulo,
            descripcion,
            indicador_urgencia,
            padre_id: id,
            peso_individual: 1,
            peso_grupal: 0,
            peso_total: 1,
            final_total: 0
        });

        await PropagarIncrementoPeso(id as string, 1);

        res.status(201).json(newSubtask);
    } catch (error) {
        console.error('Error al crear subtarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la subtarea' });
    }
};

const getRootTask = async (taskId: string): Promise<Task | null> => {
    let currentTask: Task | null = await Task.findByPk(taskId);
    if (!currentTask) return null;
    
    while (currentTask && currentTask.padre_id !== null) {
        const parentTask: Task | null = await Task.findByPk(currentTask.padre_id);
        if (!parentTask) break;
        currentTask = parentTask;
    }
    return currentTask;
};

const buildTaskTree = async (taskId: string, ptRaiz: number): Promise<any> => {
    const tarea = await Task.findByPk(taskId);
    if (!tarea) return null;

    const hijos = await Task.findAll({ where: { padre_id: taskId } });
    
    const hijosData = [];
    for (const h of hijos) {
        const hijoTree = await buildTaskTree(h.id, ptRaiz);
        if (hijoTree) hijosData.push(hijoTree);
    }

    // Fórmulas de Análisis Técnico (Métricas derivadas - Escala del 0 al 10 con redondeo)
    const esfuerzo_total = ptRaiz === 0 ? 0 : Math.round((tarea.peso_total / ptRaiz) * 10);
    const esfuerzo_relativo = ptRaiz === 0 ? 0 : Math.round(((tarea.peso_total - tarea.final_total) / ptRaiz) * 10);

    return {
        ...tarea.toJSON(),
        hijos: hijosData,
        esfuerzo_total,
        esfuerzo_relativo
    };
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        // Verificamos si existe la tarea inicial
        const task = await Task.findByPk(id as string);
        if (!task) {
            res.status(404).json({ message: 'Tarea no encontrada' });
            return;
        }

        // Buscamos la raíz para obtener el PT maestro
        const rootTask = await getRootTask(id as string);
        const ptRaiz = rootTask ? rootTask.peso_total : 0;
        
        // Construimos el árbol inyectando las métricas calculadas
        const taskTree = await buildTaskTree(id as string, ptRaiz);

        res.status(200).json(taskTree);
    } catch (error) {
        console.error('Error al obtener la tarea y su árbol:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la tarea' });
    }
};

export const toggleTaskComplete = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { completed } = req.body; // boolean

        const task = await Task.findByPk(id as string);

        if (!task) {
            res.status(404).json({ message: 'Tarea no encontrada' });
            return;
        }

        const isCurrentlyCompleted = task.estado === 'completado';

        // Si ya está en el estado deseado, no hacemos nada
        if (completed === isCurrentlyCompleted) {
            res.status(200).json(task);
            return;
        }

        if (completed) {
            // Validación bottom-up: no se puede completar si sus hijos no están todos completados
            // Los hijos aportan 'peso_grupal' en total. Si su aporte no está completo, final_total será menor a peso_grupal.
            if (task.final_total < task.peso_grupal) {
                res.status(400).json({ message: 'No se puede completar la tarea porque tiene subtareas pendientes.' });
                return;
            }
            await PropagarAvanceProgreso(task.id, 1);
        } else {
            // Validacion top-down para desmarcar: 
            // Si la tarea superior ya está completada, no se puede desmarcar un hijo 
            // para evitar colisiones matemáticas en final_total
            if (task.padre_id) {
                const padre = await Task.findByPk(task.padre_id);
                if (padre && padre.estado === 'completado') {
                    res.status(400).json({ message: 'No puedes desmarcar esta tarea porque su tarea superior ya fue completada. Desmárcala primero.' });
                    return;
                }
            }

            // Si la desmarcamos, restamos 1 al árbol
            await PropagarAvanceProgreso(task.id, -1);
        }

        const updatedTask = await Task.findByPk(id as string);
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error al cambiar el estado de completado:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la tarea' });
    }
};

