import { Router } from 'express';
import { createRootTask, getRootTasks, toggleUrgencyTask, createSubtask, getTaskById, toggleTaskComplete } from '../controllers/task.controller';

const router = Router();

router.post('/', createRootTask);
router.get('/', getRootTasks);
router.patch('/:id/urgency', toggleUrgencyTask);
router.post('/:id/subtasks', createSubtask);
router.get('/:id', getTaskById);
router.patch('/:id/complete', toggleTaskComplete);

export default router;
