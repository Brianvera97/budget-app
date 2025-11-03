import { Router } from 'express';
import {
    createBudget,
    getAllBudgets,
    getBudgetById,
    updateBudget,
    updateBudgetStatus,
    deleteBudget,
    duplicateBudget,
    getBudgetStats
} from '../controllers/budget.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas protegidas
router.use(authMiddleware);

router.post('/', createBudget);
router.get('/', getAllBudgets);
router.get('/stats', getBudgetStats);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.patch('/:id/status', updateBudgetStatus);
router.delete('/:id', deleteBudget);
router.post('/:id/duplicate', duplicateBudget);

export default router;