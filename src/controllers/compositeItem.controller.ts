import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import compositeItemService from '../services/compositeItem.service';
import { CreateCompositeItemDTO, UpdateCompositeItemDTO } from '../types';

export const createCompositeItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCompositeItemDTO;

        if (!data.name || !data.unit || !data.categoryId || !data.composition || data.composition.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Name, unit, category and composition are required'
            });
            return;
        }

        const item = await compositeItemService.create(data);

        res.status(201).json({
            success: true,
            message: 'Composite item created successfully',
            data: item
        });
    } catch (error: any) {
        console.error('Error in createCompositeItem:', error);

        if (error.message === 'CATEGORY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Category not found'
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

        res.status(500).json({
            success: false,
            message: 'Error creating composite item'
        });
    }
};

export const getAllCompositeItems = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId, active } = req.query;

        const filters: any = {};
        if (categoryId) filters.categoryId = categoryId as string;
        if (active !== undefined) filters.active = active === 'true';

        const items = await compositeItemService.getAll(filters);

        res.json({
            success: true,
            data: items
        });
    } catch (error: any) {
        console.error('Error in getAllCompositeItems:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching composite items'
        });
    }
};

export const getCompositeItemById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const item = await compositeItemService.getById(id);

        res.json({
            success: true,
            data: item
        });
    } catch (error: any) {
        console.error('Error in getCompositeItemById:', error);

        if (error.message === 'COMPOSITE_ITEM_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Composite item not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching composite item'
        });
    }
};

export const updateCompositeItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body as UpdateCompositeItemDTO;

        const item = await compositeItemService.update(id, data);

        res.json({
            success: true,
            message: 'Composite item updated successfully',
            data: item
        });
    } catch (error: any) {
        console.error('Error in updateCompositeItem:', error);

        if (error.message === 'COMPOSITE_ITEM_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Composite item not found'
            });
            return;
        }

        if (error.message === 'CATEGORY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Category not found'
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

        res.status(500).json({
            success: false,
            message: 'Error updating composite item'
        });
    }
};

export const deleteCompositeItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await compositeItemService.delete(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error in deleteCompositeItem:', error);

        if (error.message === 'COMPOSITE_ITEM_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Composite item not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting composite item'
        });
    }
};

export const duplicateCompositeItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const item = await compositeItemService.duplicate(id);

        res.status(201).json({
            success: true,
            message: 'Composite item duplicated successfully',
            data: item
        });
    } catch (error: any) {
        console.error('Error in duplicateCompositeItem:', error);

        if (error.message === 'COMPOSITE_ITEM_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Composite item not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error duplicating composite item'
        });
    }
};

export const searchCompositeItems = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
            return;
        }

        const items = await compositeItemService.search(q);

        res.json({
            success: true,
            data: items
        });
    } catch (error: any) {
        console.error('Error in searchCompositeItems:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching composite items'
        });
    }
};

export const getPriceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const history = await compositeItemService.getPriceHistory(id);

        res.json({
            success: true,
            data: history
        });
    } catch (error: any) {
        console.error('Error in getPriceHistory:', error);

        if (error.message === 'COMPOSITE_ITEM_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Composite item not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching price history'
        });
    }
};