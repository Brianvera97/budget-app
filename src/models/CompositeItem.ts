import mongoose, { Schema } from 'mongoose';
import { ICompositeItem } from '../types';

const CompositeItemComponentSchema = new Schema({
    resourceId: {
        type: String,
        ref: 'Resource',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const CompositeItemSchema = new Schema<ICompositeItem>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: String,
        ref: 'Category',
        required: true
    },
    composition: {
        type: [CompositeItemComponentSchema],
        required: true,
        validate: {
            validator: function (v: any[]) {
                return v && v.length > 0;
            },
            message: 'Composition must have at least one resource'
        }
    },
    customMargin: {
        type: Number,
        min: 0,
        max: 100
    },
    active: {
        type: Boolean,
        default: true
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

CompositeItemSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

CompositeItemSchema.index({ name: 1 });
CompositeItemSchema.index({ categoryId: 1 });
CompositeItemSchema.index({ active: 1 });

export default mongoose.model<ICompositeItem>('CompositeItem', CompositeItemSchema);