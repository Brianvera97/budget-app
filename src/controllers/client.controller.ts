import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import clientService from '../services/client.service';
import { CreateClientDTO, UpdateClientDTO } from '../types/index';

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateClientDTO;

        if (!data.name) {
            res.status(400).json({
                success: false,
                message: 'El nombre del cliente es requerido'
            });
            return;
        }

        const client = await clientService.create(data);

        res.status(201).json({
            success: true,
            message: 'Cliente creado correctamente',
            data: client
        });
    } catch (error: any) {
        console.error('Error en createClient:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear cliente'
        });
    }
};

export const getAllClients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const clients = await clientService.getAll();

        res.json({
            success: true,
            data: clients
        });
    } catch (error: any) {
        console.error('Error en getAllClients:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener clientes'
        });
    }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const client = await clientService.getById(id);

        res.json({
            success: true,
            data: client
        });
    } catch (error: any) {
        console.error('Error en getClientById:', error);

        if (error.message === 'CLIENT_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener cliente'
        });
    }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body as UpdateClientDTO;

        const client = await clientService.update(id, data);

        res.json({
            success: true,
            message: 'Cliente actualizado correctamente',
            data: client
        });
    } catch (error: any) {
        console.error('Error en updateClient:', error);

        if (error.message === 'CLIENT_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar cliente'
        });
    }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await clientService.delete(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error en deleteClient:', error);

        if (error.message === 'CLIENT_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar cliente'
        });
    }
};

export const searchClients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Parámetro de búsqueda requerido'
            });
            return;
        }

        const clients = await clientService.search(q);

        res.json({
            success: true,
            data: clients
        });
    } catch (error: any) {
        console.error('Error en searchClients:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar clientes'
        });
    }
};