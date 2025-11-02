import { Router } from 'express';
import {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    searchClients
} from '../controllers/client.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas protegidas
router.use(authMiddleware);

router.post('/', createClient);
router.get('/', getAllClients);
router.get('/search', searchClients);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;