import mongoose, { Schema } from 'mongoose';
import { IClient } from '../types';

const ClientSchema = new Schema<IClient>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    ruc: {
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

ClientSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

ClientSchema.index({ name: 1 });

export default mongoose.model<IClient>('Client', ClientSchema);