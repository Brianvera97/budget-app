import { Router } from 'express';
import {
    createResource,
    getAllResources,
    getResourceById,
    getResourcesByCategory,
    getResourcesByType,
    updateResource,
    deleteResource,
    searchResources,
    getOutdatedResources,
    bulkUpdatePrices
} from '../controllers/resource.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createResource);
router.get('/', getAllResources);
router.get('/search', searchResources);
router.get('/outdated', getOutdatedResources);
router.post('/bulk-update-prices', bulkUpdatePrices);
router.get('/category/:categoryId', getResourcesByCategory);
router.get('/type/:type', getResourcesByType);
router.get('/:id', getResourceById);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

export default router;