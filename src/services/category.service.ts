import Category from '../models/Category';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types';

class CategoryService {
    async create(data: CreateCategoryDTO) {
        if (data.order === undefined) {
            const maxOrder = await Category.findOne().sort({ order: -1 }).select('order');
            data.order = maxOrder ? maxOrder.order + 1 : 1;
        }

        const category = await Category.create(data);

        return {
            id: String(category._id),
            name: category.name,
            description: category.description,
            defaultMargin: category.defaultMargin,
            color: category.color,
            order: category.order,
            active: category.active,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async getAll(includeInactive: boolean = false) {
        const query = includeInactive ? {} : { active: true };
        const categories = await Category.find(query).sort({ order: 1 });

        return categories.map(category => ({
            id: String(category._id),
            name: category.name,
            description: category.description,
            defaultMargin: category.defaultMargin,
            color: category.color,
            order: category.order,
            active: category.active,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));
    }

    async getById(categoryId: string) {
        const category = await Category.findById(categoryId);

        if (!category) {
            throw new Error('CATEGORY_NOT_FOUND');
        }

        return {
            id: String(category._id),
            name: category.name,
            description: category.description,
            defaultMargin: category.defaultMargin,
            color: category.color,
            order: category.order,
            active: category.active,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async update(categoryId: string, data: UpdateCategoryDTO) {
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!category) {
            throw new Error('CATEGORY_NOT_FOUND');
        }

        return {
            id: String(category._id),
            name: category.name,
            description: category.description,
            defaultMargin: category.defaultMargin,
            color: category.color,
            order: category.order,
            active: category.active,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async delete(categoryId: string) {
        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            throw new Error('CATEGORY_NOT_FOUND');
        }

        return { message: 'Category deleted successfully' };
    }

    async reorder(orders: Array<{ id: string; order: number }>) {
        const updates = orders.map(item =>
            Category.findByIdAndUpdate(item.id, { order: item.order })
        );

        await Promise.all(updates);

        return { message: 'Order updated successfully' };
    }
}

export default new CategoryService();