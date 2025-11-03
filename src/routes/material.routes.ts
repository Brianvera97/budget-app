import { Router } from 'express';
import {
    createMaterial,
    getAllMaterials,
    getMaterialById,
    getMaterialsByCategory,
    updateMaterial,
    deleteMaterial,
    searchMaterials,
    getOutdatedMaterials,
    bulkUpdatePrices
} from '../controllers/material.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas protegidas
router.use(authMiddleware);

router.post('/', createMaterial);
router.get('/', getAllMaterials);
router.get('/search', searchMaterials);
router.get('/outdated', getOutdatedMaterials);
router.post('/bulk-update-prices', bulkUpdatePrices);
router.get('/category/:category', getMaterialsByCategory);
router.get('/:id', getMaterialById);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;