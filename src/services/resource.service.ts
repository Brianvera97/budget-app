import Resource from '../models/Resource';
import Category from '../models/Category';
import { CreateResourceDTO, UpdateResourceDTO, ResourceType } from '../types';

class ResourceService {
    async create(data: CreateResourceDTO) {
        // Validate category if provided
        if (data.categoryId) {
            const category = await Category.findById(data.categoryId);
            if (!category) {
                throw new Error('CATEGORY_NOT_FOUND');
            }
        }

        const resource = await Resource.create(data);

        return {
            id: String(resource._id),
            name: resource.name,
            description: resource.description,
            type: resource.type,
            unit: resource.unit,
            price: resource.price,
            categoryId: resource.categoryId,
            lastUpdated: resource.lastUpdated,
            createdAt: resource.createdAt
        };
    }

    async getAll(filters?: { type?: ResourceType; categoryId?: string }) {
        const query: any = {};

        if (filters?.type) {
            query.type = filters.type;
        }

        if (filters?.categoryId) {
            query.categoryId = filters.categoryId;
        }

        const resources = await Resource.find(query)
            .populate('categoryId', 'name defaultMargin color')
            .sort({ name: 1 });

        return resources.map(resource => ({
            id: String(resource._id),
            name: resource.name,
            description: resource.description,
            type: resource.type,
            unit: resource.unit,
            price: resource.price,
            category: resource.categoryId,
            lastUpdated: resource.lastUpdated,
            createdAt: resource.createdAt
        }));
    }

    async getById(resourceId: string) {
        const resource = await Resource.findById(resourceId)
            .populate('categoryId', 'name defaultMargin color');

        if (!resource) {
            throw new Error('RESOURCE_NOT_FOUND');
        }

        return {
            id: String(resource._id),
            name: resource.name,
            description: resource.description,
            type: resource.type,
            unit: resource.unit,
            price: resource.price,
            category: resource.categoryId,
            lastUpdated: resource.lastUpdated,
            createdAt: resource.createdAt
        };
    }

    async getByCategory(categoryId: string) {
        const resources = await Resource.find({ categoryId }).sort({ name: 1 });

        return resources.map(resource => ({
            id: String(resource._id),
            name: resource.name,
            type: resource.type,
            unit: resource.unit,
            price: resource.price
        }));
    }

    async getByType(type: ResourceType) {
        const resources = await Resource.find({ type })
            .populate('categoryId', 'name color')
            .sort({ name: 1 });

        return resources.map(resource => ({
            id: String(resource._id),
            name: resource.name,
            description: resource.description,
            unit: resource.unit,
            price: resource.price,
            category: resource.categoryId,
            lastUpdated: resource.lastUpdated
        }));
    }

    async update(resourceId: string, data: UpdateResourceDTO) {
        // Validate category if provided
        if (data.categoryId) {
            const category = await Category.findById(data.categoryId);
            if (!category) {
                throw new Error('CATEGORY_NOT_FOUND');
            }
        }

        const resource = await Resource.findByIdAndUpdate(
            resourceId,
            { ...data, lastUpdated: new Date() },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name defaultMargin color');

        if (!resource) {
            throw new Error('RESOURCE_NOT_FOUND');
        }

        return {
            id: String(resource._id),
            name: resource.name,
            description: resource.description,
            type: resource.type,
            unit: resource.unit,
            price: resource.price,
            category: resource.categoryId,
            lastUpdated: resource.lastUpdated,
            createdAt: resource.createdAt
        };
    }

    async delete(resourceId: string) {
        const resource = await Resource.findByIdAndDelete(resourceId);

        if (!resource) {
            throw new Error('RESOURCE_NOT_FOUND');
        }

        return { message: 'Resource deleted successfully' };
    }

    async search(query: string, type?: ResourceType) {
        const searchQuery: any = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };

        if (type) {
            searchQuery.type = type;
        }

        const resources = await Resource.find(searchQuery)
            .populate('categoryId', 'name color')
            .sort({ name: 1 });

        return resources.map(resource => ({
            id: String(resource._id),
            name: resource.name,
            type: resource.type,
            unit: resource.unit,
            price: resource.price,
            category: resource.categoryId
        }));
    }

    async getOutdated(daysOld: number = 30) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysOld);

        const resources = await Resource.find({
            lastUpdated: { $lt: dateThreshold }
        }).sort({ lastUpdated: 1 });

        return resources.map(resource => ({
            id: String(resource._id),
            name: resource.name,
            type: resource.type,
            price: resource.price,
            lastUpdated: resource.lastUpdated,
            daysOld: Math.floor((Date.now() - resource.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
        }));
    }

    async updatePrices(updates: Array<{ id: string; price: number }>) {
        const results = {
            updated: 0,
            failed: [] as string[]
        };

        for (const update of updates) {
            try {
                await Resource.findByIdAndUpdate(
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

export default new ResourceService();