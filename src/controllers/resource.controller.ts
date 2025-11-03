import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import resourceService from '../services/resource.service';
import { CreateResourceDTO, UpdateResourceDTO, ResourceType } from '../types';

export const createResource = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateResourceDTO;

        if (!data.name || !data.unit || data.price === undefined || !data.type) {
            res.status(400).json({
                success: false,
                message: 'Name, type, unit and price are required'
            });
            return;
        }

        if (data.price < 0) {
            res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
            return;
        }

        const resource = await resourceService.create(data);

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: resource
        });
    } catch (error: any) {
        console.error('Error in createResource:', error);

        if (error.message === 'CATEGORY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error creating resource'
        });
    }
};

export const getAllResources = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, categoryId } = req.query;

        const filters: any = {};
        if (type) filters.type = type as ResourceType;
        if (categoryId) filters.categoryId = categoryId as string;

        const resources = await resourceService.getAll(filters);

        res.json({
            success: true,
            data: resources
        });
    } catch (error: any) {
        console.error('Error in getAllResources:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources'
        });
    }
};

export const getResourceById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const resource = await resourceService.getById(id);

        res.json({
            success: true,
            data: resource
        });
    } catch (error: any) {
        console.error('Error in getResourceById:', error);

        if (error.message === 'RESOURCE_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching resource'
        });
    }
};

export const getResourcesByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;

        const resources = await resourceService.getByCategory(categoryId);

        res.json({
            success: true,
            data: resources
        });
    } catch (error: any) {
        console.error('Error in getResourcesByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources by category'
        });
    }
};

export const getResourcesByType = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type } = req.params;

        if (!['material', 'labor', 'equipment'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Invalid resource type'
            });
            return;
        }

        const resources = await resourceService.getByType(type as ResourceType);

        res.json({
            success: true,
            data: resources
        });
    } catch (error: any) {
        console.error('Error in getResourcesByType:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources by type'
        });
    }
};

export const updateResource = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body as UpdateResourceDTO;

        if (data.price !== undefined && data.price < 0) {
            res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
            return;
        }

        const resource = await resourceService.update(id, data);

        res.json({
            success: true,
            message: 'Resource updated successfully',
            data: resource
        });
    } catch (error: any) {
        console.error('Error in updateResource:', error);

        if (error.message === 'RESOURCE_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Resource not found'
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

        res.status(500).json({
            success: false,
            message: 'Error updating resource'
        });
    }
};

export const deleteResource = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await resourceService.delete(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error in deleteResource:', error);

        if (error.message === 'RESOURCE_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting resource'
        });
    }
};

export const searchResources = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q, type } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
            return;
        }

        const resources = await resourceService.search(q, type as ResourceType);

        res.json({
            success: true,
            data: resources
        });
    } catch (error: any) {
        console.error('Error in searchResources:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching resources'
        });
    }
};

export const getOutdatedResources = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 30;

        const resources = await resourceService.getOutdated(days);

        res.json({
            success: true,
            data: resources
        });
    } catch (error: any) {
        console.error('Error in getOutdatedResources:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching outdated resources'
        });
    }
};

export const bulkUpdatePrices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { updates } = req.body as { updates: Array<{ id: string; price: number }> };

        if (!updates || !Array.isArray(updates)) {
            res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
            return;
        }

        const results = await resourceService.updatePrices(updates);

        res.json({
            success: true,
            message: `${results.updated} prices updated`,
            data: results
        });
    } catch (error: any) {
        console.error('Error in bulkUpdatePrices:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating prices'
        });
    }
};