import express from 'express';
import cors from 'cors';
import { sequelize } from './db';

import taskRoutes from './routes/task.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

const PORT = 3001;

async function startServer() {
    try {
        // Esto hace la magia: crea dev.sqlite y las tablas si no existen
        await sequelize.sync();
        console.log('✅ Base de datos sincronizada correctamente.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
}

startServer();