import mongoose, { Schema } from 'mongoose';
import { IMaterial } from '../types';

const MaterialSchema = new Schema<IMaterial>({
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
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        trim: true
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

MaterialSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

MaterialSchema.index({ name: 1, category: 1 });

export default mongoose.model<IMaterial>('Material', MaterialSchema);