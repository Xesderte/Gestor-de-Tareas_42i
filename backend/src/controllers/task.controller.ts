import { Request, Response } from 'express';
import { Task } from '../db';

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

        res.status(200).json(tasks);
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
