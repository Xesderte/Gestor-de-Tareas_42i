import { Router } from 'express';
import { createRootTask, getRootTasks, toggleUrgencyTask, createSubtask } from '../controllers/task.controller';

const router = Router();

router.post('/', createRootTask);
router.get('/', getRootTasks);
router.patch('/:id/urgency', toggleUrgencyTask);
router.post('/:id/subtasks', createSubtask);

export default router;
