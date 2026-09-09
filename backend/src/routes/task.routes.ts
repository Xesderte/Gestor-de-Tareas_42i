import { Router } from 'express';
import { createRootTask, getRootTasks, toggleUrgencyTask } from '../controllers/task.controller';

const router = Router();

router.post('/', createRootTask);
router.get('/', getRootTasks);
router.patch('/:id/urgency', toggleUrgencyTask);

export default router;
