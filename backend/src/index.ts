import express from 'express';
import cors from 'cors';
import { sequelize } from './db';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

async function startServer() {
    try {
        // Esto hace la magia: crea dev.sqlite y las tablas si no existen
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada correctamente.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
}

startServer();