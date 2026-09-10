import { Router } from 'express';
import { createRootTask, getRootTasks, toggleUrgencyTask, createSubtask, getTaskById, toggleTaskComplete, updateTask, deleteTask } from '../controllers/task.controller';

const router = Router();

router.post('/', createRootTask);
router.get('/', getRootTasks);
router.patch('/:id/urgency', toggleUrgencyTask);
router.post('/:id/subtasks', createSubtask);
router.get('/:id', getTaskById);
router.patch('/:id/complete', toggleTaskComplete);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
