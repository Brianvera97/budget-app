import { Router } from 'express';
import {
    createCompositeItem,
    getAllCompositeItems,
    getCompositeItemById,
    updateCompositeItem,
    deleteCompositeItem,
    duplicateCompositeItem,
    searchCompositeItems,
    getPriceHistory
} from '../controllers/compositeItem.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createCompositeItem);
router.get('/', getAllCompositeItems);
router.get('/search', searchCompositeItems);
router.get('/:id', getCompositeItemById);
router.get('/:id/price-history', getPriceHistory);
router.put('/:id', updateCompositeItem);
router.delete('/:id', deleteCompositeItem);
router.post('/:id/duplicate', duplicateCompositeItem);

export default router;