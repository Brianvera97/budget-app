import Budget from '../models/Budget';
import Client from '../models/Client';
import Material from '../models/Resource';
import { CreateBudgetDTO } from '../types';

class BudgetService {
    // Generar número de presupuesto único
    private async generateBudgetNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await Budget.countDocuments({
            budgetNumber: new RegExp(`^BUD-${year}-`)
        });
        const number = (count + 1).toString().padStart(3, '0');
        return `BUD-${year}-${number}`;
    }

    // Calcular subtotales de items
    private calculateItemSubtotals(items: any[]) {
        return items.map(item => ({
            ...item,
            subtotal: item.quantity * item.unitPrice
        }));
    }

    async create(data: CreateBudgetDTO) {
        // Verificar que el cliente existe
        const client = await Client.findById(data.clientId);
        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        // Validar que si hay materialId, el material existe
        for (const item of data.items) {
            if (item.materialId) {
                const material = await Material.findById(item.materialId);
                if (!material) {
                    throw new Error(`MATERIAL_NOT_FOUND: ${item.materialId}`);
                }
            }
        }

        // Calcular subtotales de items
        const itemsWithSubtotals = this.calculateItemSubtotals(data.items);

        // Generar número de presupuesto
        const budgetNumber = await this.generateBudgetNumber();

        // Crear presupuesto
        const budget = await Budget.create({
            budgetNumber,
            clientId: data.clientId,
            projectName: data.projectName,
            projectDescription: data.projectDescription,
            items: itemsWithSubtotals,
            validUntil: data.validUntil,
            notes: data.notes
        });

        // Calcular totales
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

        // Si cambia el cliente, verificar que existe
        if (data.clientId && data.clientId !== budget.clientId) {
            const client = await Client.findById(data.clientId);
            if (!client) {
                throw new Error('CLIENT_NOT_FOUND');
            }
        }

        // Si cambian los items, recalcular subtotales
        if (data.items) {
            const itemsWithSubtotals = this.calculateItemSubtotals(data.items);
            budget.items = itemsWithSubtotals as any;
        }

        // Actualizar otros campos
        if (data.projectName !== undefined) budget.projectName = data.projectName;
        if (data.projectDescription !== undefined) budget.projectDescription = data.projectDescription;
        if (data.validUntil !== undefined) budget.validUntil = data.validUntil;
        if (data.notes !== undefined) budget.notes = data.notes;
        if (data.clientId !== undefined) budget.clientId = data.clientId;

        // Recalcular totales
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

        return { message: 'Presupuesto eliminado correctamente' };
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
            projectName: `${originalBudget.projectName} (Copia)`,
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