import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import materialService from '../services/material.service';
import { CreateMaterialDTO, UpdateMaterialDTO } from '../types';

export const createMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateMaterialDTO;

        if (!data.name || !data.unit || data.price === undefined) {
            res.status(400).json({
                success: false,
                message: 'Nombre, unidad y precio son requeridos'
            });
            return;
        }

        if (data.price < 0) {
            res.status(400).json({
                success: false,
                message: 'El precio no puede ser negativo'
            });
            return;
        }

        const material = await materialService.create(data);

        res.status(201).json({
            success: true,
            message: 'Material creado correctamente',
            data: material
        });
    } catch (error: any) {
        console.error('Error en createMaterial:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear material'
        });
    }
};

export const getAllMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const materials = await materialService.getAll();

        res.json({
            success: true,
            data: materials
        });
    } catch (error: any) {
        console.error('Error en getAllMaterials:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener materiales'
        });
    }
};

export const getMaterialById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const material = await materialService.getById(id);

        res.json({
            success: true,
            data: material
        });
    } catch (error: any) {
        console.error('Error en getMaterialById:', error);

        if (error.message === 'MATERIAL_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Material no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener material'
        });
    }
};

export const getMaterialsByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { category } = req.params;

        const materials = await materialService.getByCategory(category);

        res.json({
            success: true,
            data: materials
        });
    } catch (error: any) {
        console.error('Error en getMaterialsByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener materiales por categoría'
        });
    }
};

export const updateMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body as UpdateMaterialDTO;

        if (data.price !== undefined && data.price < 0) {
            res.status(400).json({
                success: false,
                message: 'El precio no puede ser negativo'
            });
            return;
        }

        const material = await materialService.update(id, data);

        res.json({
            success: true,
            message: 'Material actualizado correctamente',
            data: material
        });
    } catch (error: any) {
        console.error('Error en updateMaterial:', error);

        if (error.message === 'MATERIAL_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Material no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar material'
        });
    }
};

export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await materialService.delete(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error en deleteMaterial:', error);

        if (error.message === 'MATERIAL_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Material no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar material'
        });
    }
};

export const searchMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Parámetro de búsqueda requerido'
            });
            return;
        }

        const materials = await materialService.search(q);

        res.json({
            success: true,
            data: materials
        });
    } catch (error: any) {
        console.error('Error en searchMaterials:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar materiales'
        });
    }
};

export const getOutdatedMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 30;

        const materials = await materialService.getOutdated(days);

        res.json({
            success: true,
            data: materials
        });
    } catch (error: any) {
        console.error('Error en getOutdatedMaterials:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener materiales desactualizados'
        });
    }
};

export const bulkUpdatePrices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { updates } = req.body as { updates: Array<{ id: string; price: number }> };

        if (!updates || !Array.isArray(updates)) {
            res.status(400).json({
                success: false,
                message: 'Se requiere un array de actualizaciones'
            });
            return;
        }

        const results = await materialService.updatePrices(updates);

        res.json({
            success: true,
            message: `${results.updated} precios actualizados`,
            data: results
        });
    } catch (error: any) {
        console.error('Error en bulkUpdatePrices:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar precios'
        });
    }
};