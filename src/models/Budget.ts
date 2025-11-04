import mongoose, { Schema } from 'mongoose';
import { IBudget, IBudgetItem } from '../types';

const BudgetItemSchema = new Schema<IBudgetItem>({
    itemType: {
        type: String,
        enum: ['resource', 'composite'],
        required: true
    },
    resourceId: {
        type: String,
        ref: 'Resource'
    },
    compositeItemId: {
        type: String,
        ref: 'CompositeItem'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const BudgetSchema = new Schema<IBudget>({
    budgetNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    clientId: {
        type: String,
        required: true,
        ref: 'Client'
    },
    projectName: {
        type: String,
        trim: true
    },
    projectDescription: {
        type: String,
        trim: true
    },
    items: [BudgetItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    iva: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'approved', 'rejected'],
        default: 'draft'
    },
    validUntil: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

BudgetSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

BudgetSchema.methods.calculateTotals = function () {
    this.subtotal = this.items.reduce((sum: number, item: IBudgetItem) => sum + item.subtotal, 0);
    this.iva = this.subtotal * 0.10;
    this.total = this.subtotal + this.iva;
};

BudgetSchema.index({ budgetNumber: 1 });
BudgetSchema.index({ clientId: 1, createdAt: -1 });
BudgetSchema.index({ status: 1 });

export default mongoose.model<IBudget>('Budget', BudgetSchema);