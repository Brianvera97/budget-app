const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');

// Importar error handler
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ==================== MIDDLEWARES DE SEGURIDAD ====================
app.use(helmet());
app.use(cors());

// Rate limiting: máximo 100 requests por IP cada 15 minutos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Retorna info en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
});

app.use('/api/', limiter);

// ==================== BODY PARSER ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ==================== RUTAS ====================
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// ==================== MANEJO DE RUTAS NO ENCONTRADAS ====================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ==================== ERROR HANDLER (debe ir al final) ====================
app.use(errorHandler);

module.exports = app;