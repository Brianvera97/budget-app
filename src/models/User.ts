import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,  // ← Esto ya crea el índice
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Eliminá esta línea:
// UserSchema.index({ email: 1 }); ← Duplicado, borralo

export default mongoose.model<IUser>('User', UserSchema);