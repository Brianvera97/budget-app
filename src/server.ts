import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB } from './config/database';

// Importar rutas
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import materialRoutes from './routes/material.routes';
import budgetRoutes from './routes/budget.routes';
import categoryRoutes from './routes/category.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);

// Conexión a DB y inicio del servidor
const startServer = async () => {
    await connectDB();

    app.listen(ENV.PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${ENV.PORT}`);
    });
};

startServer();