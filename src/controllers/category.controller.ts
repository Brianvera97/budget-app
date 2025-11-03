import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import categoryService from '../services/category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types';

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCategoryDTO;

        if (!data.name || data.defaultMargin === undefined) {
            res.status(400).json({
                success: false,
                message: 'Name and default margin are required'
            });
            return;
        }

        if (data.defaultMargin < 0 || data.defaultMargin > 100) {
            res.status(400).json({
                success: false,
                message: 'Margin must be between 0 and 100'
            });
            return;
        }

        const category = await categoryService.create(data);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error: any) {
        console.error('Error in createCategory:', error);

        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'A category with that name already exists'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error creating category'
        });
    }
};

export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { includeInactive } = req.query;
        const categories = await categoryService.getAll(includeInactive === 'true');

        res.json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        console.error('Error in getAllCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await categoryService.getById(id);

        res.json({
            success: true,
            data: category
        });
    } catch (error: any) {
        console.error('Error in getCategoryById:', error);

        if (error.message === 'CATEGORY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching category'
        });
    }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body as UpdateCategoryDTO;

        if (data.defaultMargin !== undefined && (data.defaultMargin < 0 || data.defaultMargin > 100)) {
            res.status(400).json({
                success: false,
                message: 'Margin must be between 0 and 100'
            });
            return;
        }

        const category = await categoryService.update(id, data);

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error: any) {
        console.error('Error in updateCategory:', error);

        if (error.message === 'CATEGORY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
            return;
        }

        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'A category with that name already exists'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error updating category'
        });
    }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await categoryService.delete(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error in deleteCategory:', error);

        if (error.message === 'CATEGORY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting category'
        });
    }
};

export const reorderCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { orders } = req.body as { orders: Array<{ id: string; order: number }> };

        if (!orders || !Array.isArray(orders)) {
            res.status(400).json({
                success: false,
                message: 'Orders array is required'
            });
            return;
        }

        const result = await categoryService.reorder(orders);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error in reorderCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error reordering categories'
        });
    }
};