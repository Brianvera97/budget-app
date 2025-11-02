const Task = require('../models/Task');

const tasksService = {
    // Crear tarea
    async create(taskData, userId) {
        const task = await Task.create({
            ...taskData,
            user: userId
        });

        return task;
    },

    // Obtener todas las tareas del usuario
    async getAll(userId, filters = {}) {
        const query = { user: userId };

        // Filtro opcional por completed
        if (filters.completed !== undefined) {
            query.completed = filters.completed === 'true';
        }

        // Filtro opcional por priority
        if (filters.priority) {
            query.priority = filters.priority;
        }

        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        return tasks;
    },

    // Obtener una tarea por ID
    async getById(taskId, userId) {
        const task = await Task.findOne({ _id: taskId, user: userId })
            .populate('user', 'name email');

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    },

    // Actualizar tarea
    async update(taskId, userId, updateData) {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, user: userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    },

    // Eliminar tarea
    async delete(taskId, userId) {
        const task = await Task.findOneAndDelete({ _id: taskId, user: userId });

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    },

    // Marcar como completada/no completada
    async toggleComplete(taskId, userId) {
        const task = await Task.findOne({ _id: taskId, user: userId });

        if (!task) {
            throw new Error('Task not found');
        }

        task.completed = !task.completed;
        await task.save();

        return task;
    }
};

module.exports = tasksService;