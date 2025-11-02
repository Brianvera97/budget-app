import Client from '../models/Client';
import { CreateClientDTO, UpdateClientDTO } from '../types/index';

class ClientService {
    async create(data: CreateClientDTO) {
        const client = await Client.create(data);

        return {
            id: String(client._id),
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            ruc: client.ruc,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };
    }

    async getAll() {
        const clients = await Client.find().sort({ createdAt: -1 });

        return clients.map(client => ({
            id: String(client._id),
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            ruc: client.ruc,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        }));
    }

    async getById(clientId: string) {
        const client = await Client.findById(clientId);

        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        return {
            id: String(client._id),
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            ruc: client.ruc,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };
    }

    async update(clientId: string, data: UpdateClientDTO) {
        const client = await Client.findByIdAndUpdate(
            clientId,
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        return {
            id: String(client._id),
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            ruc: client.ruc,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };
    }

    async delete(clientId: string) {
        const client = await Client.findByIdAndDelete(clientId);

        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        return { message: 'Cliente eliminado correctamente' };
    }

    async search(query: string) {
        const clients = await Client.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { ruc: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        return clients.map(client => ({
            id: String(client._id),
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            ruc: client.ruc
        }));
    }
}

export default new ClientService();