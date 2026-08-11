import { Router } from 'express';
import { ResultsController } from './results.controller';
import { authenticate, authorize } from '../../middleware';

const router = Router();

// Retrieve all results
router.get('/', authenticate, authorize('STUDENT'), ResultsController.getResults);

// Get synchronization status
router.get('/status', authenticate, authorize('STUDENT'), ResultsController.getStatus);

// Sync result data
router.post('/sync', authenticate, authorize('STUDENT'), ResultsController.syncResults);

// Retrieve subjects detail for one semester
router.get('/:semester', authenticate, authorize('STUDENT'), ResultsController.getSemesterResult);

export default router;
export const resultsRoutes = router;
