import CompositeItem from '../models/CompositeItem';
import Resource from '../models/Resource';
import Category from '../models/Category';
import { CreateCompositeItemDTO, UpdateCompositeItemDTO, CompositeItemCalculation } from '../types';

class CompositeItemService {
    // Calculate cost and price dynamically
    private async calculateItem(item: any): Promise<CompositeItemCalculation> {
        const category = await Category.findById(item.categoryId);
        if (!category) {
            throw new Error('CATEGORY_NOT_FOUND');
        }

        const compositionWithDetails = [];
        const costBreakdown = {
            materials: 0,
            labor: 0,
            equipment: 0,
            total: 0
        };

        // Calculate cost for each component
        for (const comp of item.composition) {
            const resource = await Resource.findById(comp.resourceId);
            if (!resource) {
                throw new Error(`RESOURCE_NOT_FOUND: ${comp.resourceId}`);
            }

            const subtotal = resource.price * comp.quantity;

            // Add to breakdown by type
            if (resource.type === 'material') {
                costBreakdown.materials += subtotal;
            } else if (resource.type === 'labor') {
                costBreakdown.labor += subtotal;
            } else if (resource.type === 'equipment') {
                costBreakdown.equipment += subtotal;
            }

            compositionWithDetails.push({
                resource: {
                    id: String(resource._id),
                    name: resource.name,
                    type: resource.type,
                    unit: resource.unit,
                    price: resource.price
                },
                quantity: comp.quantity,
                unit: resource.unit,
                subtotal
            });
        }

        costBreakdown.total = costBreakdown.materials + costBreakdown.labor + costBreakdown.equipment;

        // Calculate margin (custom or category default)
        const margin = item.customMargin !== undefined ? item.customMargin : category.defaultMargin;

        // Calculate final price
        const finalPrice = costBreakdown.total * (1 + margin / 100);

        return {
            id: String(item._id),
            name: item.name,
            description: item.description,
            unit: item.unit,
            category: {
                id: String(category._id),
                name: category.name,
                defaultMargin: category.defaultMargin,
                color: category.color
            },
            composition: compositionWithDetails,
            costBreakdown,
            margin,
            finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
            active: item.active,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        };
    }

    async create(data: CreateCompositeItemDTO) {
        // Validate category exists
        const category = await Category.findById(data.categoryId);
        if (!category) {
            throw new Error('CATEGORY_NOT_FOUND');
        }

        // Validate all resources exist
        for (const comp of data.composition) {
            const resource = await Resource.findById(comp.resourceId);
            if (!resource) {
                throw new Error(`RESOURCE_NOT_FOUND: ${comp.resourceId}`);
            }
        }

        const compositeItem = await CompositeItem.create(data);

        return this.calculateItem(compositeItem);
    }

    async getAll(filters?: { categoryId?: string; active?: boolean }) {
        const query: any = {};

        if (filters?.categoryId) {
            query.categoryId = filters.categoryId;
        }

        if (filters?.active !== undefined) {
            query.active = filters.active;
        }

        const items = await CompositeItem.find(query).sort({ name: 1 });

        const calculatedItems = [];
        for (const item of items) {
            try {
                const calculated = await this.calculateItem(item);
                calculatedItems.push(calculated);
            } catch (error) {
                console.error(`Error calculating item ${item._id}:`, error);
                // Skip items with calculation errors
            }
        }

        return calculatedItems;
    }

    async getById(itemId: string) {
        const item = await CompositeItem.findById(itemId);

        if (!item) {
            throw new Error('COMPOSITE_ITEM_NOT_FOUND');
        }

        return this.calculateItem(item);
    }

    async update(itemId: string, data: UpdateCompositeItemDTO) {
        // Validate category if provided
        if (data.categoryId) {
            const category = await Category.findById(data.categoryId);
            if (!category) {
                throw new Error('CATEGORY_NOT_FOUND');
            }
        }

        // Validate resources if composition is updated
        if (data.composition) {
            for (const comp of data.composition) {
                const resource = await Resource.findById(comp.resourceId);
                if (!resource) {
                    throw new Error(`RESOURCE_NOT_FOUND: ${comp.resourceId}`);
                }
            }
        }

        const item = await CompositeItem.findByIdAndUpdate(
            itemId,
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!item) {
            throw new Error('COMPOSITE_ITEM_NOT_FOUND');
        }

        return this.calculateItem(item);
    }

    async delete(itemId: string) {
        const item = await CompositeItem.findByIdAndDelete(itemId);

        if (!item) {
            throw new Error('COMPOSITE_ITEM_NOT_FOUND');
        }

        return { message: 'Composite item deleted successfully' };
    }

    async duplicate(itemId: string) {
        const original = await CompositeItem.findById(itemId);

        if (!original) {
            throw new Error('COMPOSITE_ITEM_NOT_FOUND');
        }

        const duplicated = await CompositeItem.create({
            name: `${original.name} (Copy)`,
            description: original.description,
            unit: original.unit,
            categoryId: original.categoryId,
            composition: original.composition,
            customMargin: original.customMargin
        });

        return this.calculateItem(duplicated);
    }

    async search(query: string) {
        const items = await CompositeItem.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ],
            active: true
        }).sort({ name: 1 });

        const calculatedItems = [];
        for (const item of items) {
            try {
                const calculated = await this.calculateItem(item);
                calculatedItems.push(calculated);
            } catch (error) {
                console.error(`Error calculating item ${item._id}:`, error);
            }
        }

        return calculatedItems;
    }

    async getPriceHistory(itemId: string) {
        const item = await CompositeItem.findById(itemId);

        if (!item) {
            throw new Error('COMPOSITE_ITEM_NOT_FOUND');
        }

        // Calculate current price
        const current = await this.calculateItem(item);

        // For now, just return current price
        // In the future, you could store historical snapshots
        return {
            itemId: String(item._id),
            name: item.name,
            currentPrice: current.finalPrice,
            currentCost: current.costBreakdown.total,
            margin: current.margin,
            lastUpdated: item.updatedAt
        };
    }
}

export default new CompositeItemService();