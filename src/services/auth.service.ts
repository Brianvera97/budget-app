import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ENV } from '../config/env';
import { RegisterDTO, LoginDTO } from '../types/index';

class AuthService {
    async createUser(data: RegisterDTO) {
        const { email, password, name } = data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('EMAIL_EXISTS');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            name
        });

        return {
            id: String(user._id),
            email: user.email,
            name: user.name
        };
    }

    async authenticateUser(data: LoginDTO) {
        const { email, password } = data;

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('INVALID_CREDENTIALS');
        }

        return {
            id: String(user._id),
            email: user.email,
            name: user.name
        };
    }

    generateToken(userId: string): string {
        return jwt.sign(
            { userId },
            ENV.JWT_SECRET,
            { expiresIn: '30d' }
        );
    }

    async getUserById(userId: string) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        return {
            id: String(user._id),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };
    }
}

export default new AuthService();