import { Sequelize, DataTypes, Model } from 'sequelize';

// Inicializamos Sequelize con SQLite local
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './dev.sqlite', // El archivo de la DB
    logging: false,
});

// Definimos el modelo
export class Task extends Model {
    declare public id: string;
    declare public titulo: string;
    declare public descripcion: string;
    declare public estado: string;
    declare public indicador_urgencia: boolean;

    declare public padre_id: string | null;

    // Métricas
    declare public peso_individual: number;
    declare public peso_grupal: number;
    declare public peso_total: number;
    declare public final_total: number;
}

Task.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        titulo: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: false },
        estado: { type: DataTypes.STRING, defaultValue: 'pendiente' },
        indicador_urgencia: { type: DataTypes.BOOLEAN, defaultValue: false },

        padre_id: { type: DataTypes.UUID, allowNull: true },

        peso_individual: { type: DataTypes.INTEGER, defaultValue: 1 },
        peso_grupal: { type: DataTypes.INTEGER, defaultValue: 0 },
        peso_total: { type: DataTypes.INTEGER, defaultValue: 1 },
        final_total: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
        sequelize,
        modelName: 'Task',
    }
);

// Definimos la relación jerárquica (Padre -> Hijos)
Task.hasMany(Task, { as: 'hijos', foreignKey: 'padre_id' });
Task.belongsTo(Task, { as: 'padre', foreignKey: 'padre_id' });