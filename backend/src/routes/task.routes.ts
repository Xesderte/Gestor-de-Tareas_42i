import { Router } from 'express';
import { getRootTasks, createRootTask, createSubtask, getTaskById, toggleTaskComplete, updateTask, deleteTask, getUrgentTree, toggleUrgencyTask } from '../controllers/task.controller';

const router = Router();

router.get('/urgent-tree', getUrgentTree);
router.post('/', createRootTask);
router.get('/', getRootTasks);
router.patch('/:id/urgency', toggleUrgencyTask);
router.post('/:id/subtasks', createSubtask);
router.get('/:id', getTaskById);
router.patch('/:id/complete', toggleTaskComplete);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
