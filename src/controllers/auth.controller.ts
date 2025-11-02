import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { RegisterDTO, LoginDTO } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body as RegisterDTO;

        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        const user = await authService.createUser({ email, password, name });
        const token = authService.generateToken(user.id); // ← Sin .toString()

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: { token, user }
        });
    } catch (error: any) {
        console.error('Error en register:', error);

        if (error.message === 'EMAIL_EXISTS') {
            res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body as LoginDTO;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
            return;
        }

        const user = await authService.authenticateUser({ email, password });
        const token = authService.generateToken(user.id); // ← Sin .toString()

        res.json({
            success: true,
            message: 'Login exitoso',
            data: { token, user }
        });
    } catch (error: any) {
        console.error('Error en login:', error);

        if (error.message === 'INVALID_CREDENTIALS') {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;

        const user = await authService.getUserById(userId);

        res.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error('Error en getProfile:', error);

        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil'
        });
    }
};

