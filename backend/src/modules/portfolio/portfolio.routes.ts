import { Router } from 'express';
import { PortfolioController } from './portfolio.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createPortfolioSchema, updatePortfolioSchema } from './portfolio.schema';

const router = Router();

// Public route to view a published portfolio by unique URL slug (No authentication required)
router.get('/public/:slug', PortfolioController.getPortfolioBySlug);

// Private details route (Student owners, Recruiters, and Placement Officers)
router.get('/:id', authenticate, authorize('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER'), PortfolioController.getPortfolioById);

// Student Workspace routes (Strictly locked to Student role)
router.get('/', authenticate, authorize('STUDENT'), PortfolioController.getPortfolios);
router.post('/', authenticate, authorize('STUDENT'), validate(createPortfolioSchema), PortfolioController.createPortfolio);
router.put('/:id', authenticate, authorize('STUDENT'), validate(updatePortfolioSchema), PortfolioController.updatePortfolio);
router.delete('/:id', authenticate, authorize('STUDENT'), PortfolioController.deletePortfolio);

export default router;
