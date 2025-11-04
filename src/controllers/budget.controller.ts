import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import budgetService from '../services/budget.service';
import { CreateBudgetDTO } from '../types';

export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateBudgetDTO;

        if (!data.clientId || !data.items || data.items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Client and items are required'
            });
            return;
        }

        // Validate items
        for (const item of data.items) {
            if (!item.itemType || !['resource', 'composite'].includes(item.itemType)) {
                res.status(400).json({
                    success: false,
                    message: 'Each item must have a valid itemType (resource or composite)'
                });
                return;
            }

            if (item.itemType === 'resource' && !item.resourceId) {
                res.status(400).json({
                    success: false,
                    message: 'resourceId is required for resource items'
                });
                return;
            }

            if (item.itemType === 'composite' && !item.compositeItemId) {
                res.status(400).json({
                    success: false,
                    message: 'compositeItemId is required for composite items'
                });
                return;
            }

            if (!item.quantity || item.quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Quantity must be greater than 0'
                });
                return;
            }
        }

        const budget = await budgetService.create(data);

        res.status(201).json({
            success: true,
            message: 'Budget created successfully',
            data: budget
        });
    } catch (error: any) {
        console.error('Error in createBudget:', error);

        if (error.message === 'CLIENT_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Client not found'
            });
            return;
        }

        if (error.message.startsWith('RESOURCE_NOT_FOUND')) {
            res.status(404).json({
                success: false,
                message: 'One or more resources not found'
            });
            return;
        }

        if (error.message.startsWith('COMPOSITE_ITEM_NOT_FOUND')) {
            res.status(404).json({
                success: false,
                message: 'One or more composite items not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error creating budget'
        });
    }
};

export const getAllBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, clientId } = req.query;

        const filters: any = {};
        if (status) filters.status = status;
        if (clientId) filters.clientId = clientId;

        const budgets = await budgetService.getAll(filters);

        res.json({
            success: true,
            data: budgets
        });
    } catch (error: any) {
        console.error('Error en getAllBudgets:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener presupuestos'
        });
    }
};

export const getBudgetById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const budget = await budgetService.getById(id);

        res.json({
            success: true,
            data: budget
        });
    } catch (error: any) {
        console.error('Error en getBudgetById:', error);

        if (error.message === 'BUDGET_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener presupuesto'
        });
    }
};

export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body as Partial<CreateBudgetDTO>;

        const budget = await budgetService.update(id, data);

        res.json({
            success: true,
            message: 'Presupuesto actualizado correctamente',
            data: budget
        });
    } catch (error: any) {
        console.error('Error en updateBudget:', error);

        if (error.message === 'BUDGET_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
            return;
        }

        if (error.message === 'CLIENT_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar presupuesto'
        });
    }
};

export const updateBudgetStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['draft', 'sent', 'approved', 'rejected'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
            return;
        }

        const budget = await budgetService.updateStatus(id, status);

        res.json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: budget
        });
    } catch (error: any) {
        console.error('Error en updateBudgetStatus:', error);

        if (error.message === 'BUDGET_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado'
        });
    }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await budgetService.delete(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error en deleteBudget:', error);

        if (error.message === 'BUDGET_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar presupuesto'
        });
    }
};

export const duplicateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const budget = await budgetService.duplicate(id);

        res.status(201).json({
            success: true,
            message: 'Presupuesto duplicado correctamente',
            data: budget
        });
    } catch (error: any) {
        console.error('Error en duplicateBudget:', error);

        if (error.message === 'BUDGET_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Presupuesto no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al duplicar presupuesto'
        });
    }
};

export const getBudgetStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const stats = await budgetService.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Error en getBudgetStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};