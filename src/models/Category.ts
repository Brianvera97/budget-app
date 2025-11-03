import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const CategorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    defaultMargin: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 20
    },
    color: {
        type: String,
        trim: true,
        default: '#6B7280'
    },
    order: {
        type: Number,
        default: 0
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

CategorySchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

CategorySchema.index({ name: 1 });
CategorySchema.index({ order: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);