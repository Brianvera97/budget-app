import Material from '../models/Material';
import { CreateMaterialDTO, UpdateMaterialDTO } from '../types';

class MaterialService {
    async create(data: CreateMaterialDTO) {
        const material = await Material.create(data);

        return {
            id: String(material._id),
            name: material.name,
            description: material.description,
            unit: material.unit,
            price: material.price,
            category: material.category,
            lastUpdated: material.lastUpdated,
            createdAt: material.createdAt
        };
    }

    async getAll() {
        const materials = await Material.find().sort({ name: 1 });

        return materials.map(material => ({
            id: String(material._id),
            name: material.name,
            description: material.description,
            unit: material.unit,
            price: material.price,
            category: material.category,
            lastUpdated: material.lastUpdated,
            createdAt: material.createdAt
        }));
    }

    async getById(materialId: string) {
        const material = await Material.findById(materialId);

        if (!material) {
            throw new Error('MATERIAL_NOT_FOUND');
        }

        return {
            id: String(material._id),
            name: material.name,
            description: material.description,
            unit: material.unit,
            price: material.price,
            category: material.category,
            lastUpdated: material.lastUpdated,
            createdAt: material.createdAt
        };
    }

    async getByCategory(category: string) {
        const materials = await Material.find({ category }).sort({ name: 1 });

        return materials.map(material => ({
            id: String(material._id),
            name: material.name,
            unit: material.unit,
            price: material.price,
            category: material.category
        }));
    }

    async update(materialId: string, data: UpdateMaterialDTO) {
        const material = await Material.findByIdAndUpdate(
            materialId,
            { ...data, lastUpdated: new Date() },
            { new: true, runValidators: true }
        );

        if (!material) {
            throw new Error('MATERIAL_NOT_FOUND');
        }

        return {
            id: String(material._id),
            name: material.name,
            description: material.description,
            unit: material.unit,
            price: material.price,
            category: material.category,
            lastUpdated: material.lastUpdated,
            createdAt: material.createdAt
        };
    }

    async delete(materialId: string) {
        const material = await Material.findByIdAndDelete(materialId);

        if (!material) {
            throw new Error('MATERIAL_NOT_FOUND');
        }

        return { message: 'Material eliminado correctamente' };
    }

    async search(query: string) {
        const materials = await Material.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).sort({ name: 1 });

        return materials.map(material => ({
            id: String(material._id),
            name: material.name,
            unit: material.unit,
            price: material.price,
            category: material.category
        }));
    }

    async getOutdated(daysOld: number = 30) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysOld);

        const materials = await Material.find({
            lastUpdated: { $lt: dateThreshold }
        }).sort({ lastUpdated: 1 });

        return materials.map(material => ({
            id: String(material._id),
            name: material.name,
            price: material.price,
            lastUpdated: material.lastUpdated,
            daysOld: Math.floor((Date.now() - material.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
        }));
    }

    async updatePrices(updates: Array<{ id: string; price: number }>) {
        const results = {
            updated: 0,
            failed: [] as string[]
        };

        for (const update of updates) {
            try {
                await Material.findByIdAndUpdate(
                    update.id,
                    { price: update.price, lastUpdated: new Date() },
                    { runValidators: true }
                );
                results.updated++;
            } catch (error) {
                results.failed.push(update.id);
            }
        }

        return results;
    }
}

export default new MaterialService();