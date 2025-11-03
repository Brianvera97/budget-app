import mongoose, { Schema } from 'mongoose';
import { IResource } from '../types';

const ResourceSchema = new Schema<IResource>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['material', 'labor', 'equipment'],
        required: true,
        default: 'material'
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    categoryId: {
        type: String,
        ref: 'Category'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ResourceSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

ResourceSchema.index({ name: 1, type: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ categoryId: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema);