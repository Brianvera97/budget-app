import Budget from '../models/Budget';
import Client from '../models/Client';
import Resource from '../models/Resource';
import CompositeItem from '../models/CompositeItem';
import compositeItemService from './compositeItem.service';
import { CreateBudgetDTO, IBudgetItem } from '../types';

class BudgetService {
    private async generateBudgetNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await Budget.countDocuments({
            budgetNumber: new RegExp(`^BUD-${year}-`)
        });
        const number = (count + 1).toString().padStart(3, '0');
        return `BUD-${year}-${number}`;
    }

    private async processItems(items: any[]): Promise<IBudgetItem[]> {
        const processedItems: IBudgetItem[] = [];

        for (const item of items) {
            let processedItem: IBudgetItem;

            if (item.itemType === 'resource') {
                // Resource directo
                const resource = await Resource.findById(item.resourceId);
                if (!resource) {
                    throw new Error(`RESOURCE_NOT_FOUND: ${item.resourceId}`);
                }

                processedItem = {
                    itemType: 'resource',
                    resourceId: item.resourceId,
                    description: item.description || resource.name,
                    quantity: item.quantity,
                    unitPrice: resource.price, // Snapshot del precio actual
                    unit: resource.unit,
                    subtotal: resource.price * item.quantity
                };

            } else if (item.itemType === 'composite') {
                // CompositeItem (calculado dinámicamente)
                const compositeItem = await compositeItemService.getById(item.compositeItemId);
                if (!compositeItem) {
                    throw new Error(`COMPOSITE_ITEM_NOT_FOUND: ${item.compositeItemId}`);
                }

                processedItem = {
                    itemType: 'composite',
                    compositeItemId: item.compositeItemId,
                    description: item.description || compositeItem.name,
                    quantity: item.quantity,
                    unitPrice: compositeItem.finalPrice, // Snapshot del precio calculado
                    unit: compositeItem.unit,
                    subtotal: compositeItem.finalPrice * item.quantity
                };

            } else {
                throw new Error('INVALID_ITEM_TYPE');
            }

            processedItems.push(processedItem);
        }

        return processedItems;
    }

    async create(data: CreateBudgetDTO) {
        // Validate client exists
        const client = await Client.findById(data.clientId);
        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        // Process items (get current prices)
        const processedItems = await this.processItems(data.items);

        // Generate budget number
        const budgetNumber = await this.generateBudgetNumber();

        // Create budget
        const budget = await Budget.create({
            budgetNumber,
            clientId: data.clientId,
            projectName: data.projectName,
            projectDescription: data.projectDescription,
            items: processedItems,
            validUntil: data.validUntil,
            notes: data.notes
        });

        // Calculate totals
        (budget as any).calculateTotals();
        await budget.save();

        return this.formatBudget(budget);
    }

    async getAll(filters?: { status?: string; clientId?: string }) {
        const query: any = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.clientId) {
            query.clientId = filters.clientId;
        }

        const budgets = await Budget.find(query)
            .populate('clientId', 'name email ruc')
            .sort({ createdAt: -1 });

        return budgets.map(budget => this.formatBudget(budget));
    }

    async getById(budgetId: string) {
        const budget = await Budget.findById(budgetId)
            .populate('clientId', 'name email phone address ruc');

        if (!budget) {
            throw new Error('BUDGET_NOT_FOUND');
        }

        return this.formatBudget(budget);
    }

    async update(budgetId: string, data: Partial<CreateBudgetDTO>) {
        const budget = await Budget.findById(budgetId);

        if (!budget) {
            throw new Error('BUDGET_NOT_FOUND');
        }

        // Validate client if changed
        if (data.clientId && data.clientId !== budget.clientId) {
            const client = await Client.findById(data.clientId);
            if (!client) {
                throw new Error('CLIENT_NOT_FOUND');
            }
        }

        // Process items if changed
        if (data.items) {
            const processedItems = await this.processItems(data.items);
            budget.items = processedItems as any;
        }

        // Update other fields
        if (data.projectName !== undefined) budget.projectName = data.projectName;
        if (data.projectDescription !== undefined) budget.projectDescription = data.projectDescription;
        if (data.validUntil !== undefined) budget.validUntil = data.validUntil;
        if (data.notes !== undefined) budget.notes = data.notes;
        if (data.clientId !== undefined) budget.clientId = data.clientId;

        // Recalculate totals
        (budget as any).calculateTotals();
        await budget.save();

        return this.formatBudget(budget);
    }

    async updateStatus(budgetId: string, status: 'draft' | 'sent' | 'approved' | 'rejected') {
        const budget = await Budget.findByIdAndUpdate(
            budgetId,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!budget) {
            throw new Error('BUDGET_NOT_FOUND');
        }

        return this.formatBudget(budget);
    }

    async delete(budgetId: string) {
        const budget = await Budget.findByIdAndDelete(budgetId);

        if (!budget) {
            throw new Error('BUDGET_NOT_FOUND');
        }

        return { message: 'Budget deleted successfully' };
    }

    async duplicate(budgetId: string) {
        const originalBudget = await Budget.findById(budgetId);

        if (!originalBudget) {
            throw new Error('BUDGET_NOT_FOUND');
        }

        const budgetNumber = await this.generateBudgetNumber();

        const newBudget = await Budget.create({
            budgetNumber,
            clientId: originalBudget.clientId,
            projectName: `${originalBudget.projectName} (Copy)`,
            projectDescription: originalBudget.projectDescription,
            items: originalBudget.items,
            status: 'draft',
            validUntil: originalBudget.validUntil,
            notes: originalBudget.notes
        });

        (newBudget as any).calculateTotals();
        await newBudget.save();

        return this.formatBudget(newBudget);
    }

    async getStats() {
        const total = await Budget.countDocuments();
        const byStatus = await Budget.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            }
        ]);

        const totalRevenue = await Budget.aggregate([
            {
                $match: { status: 'approved' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ]);

        return {
            total,
            byStatus,
            approvedRevenue: totalRevenue[0]?.total || 0
        };
    }

    private formatBudget(budget: any) {
        return {
            id: String(budget._id),
            budgetNumber: budget.budgetNumber,
            client: budget.clientId,
            projectName: budget.projectName,
            projectDescription: budget.projectDescription,
            items: budget.items,
            subtotal: budget.subtotal,
            iva: budget.iva,
            total: budget.total,
            status: budget.status,
            validUntil: budget.validUntil,
            notes: budget.notes,
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt
        };
    }
}

export default new BudgetService();