import { Router } from 'express';
import { createRootTask, getRootTasks } from '../controllers/task.controller';

const router = Router();

router.post('/', createRootTask);
router.get('/', getRootTasks);

export default router;
