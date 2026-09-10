import { sequelize, Task } from '../db';
import { PropagarIncrementoPeso, PropagarAvanceProgreso, PropagarEliminacionNodo } from '../utils/task.utils';

describe('Pruebas Unitarias de Lógica de Negocio y Propagación Matemática', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await Task.destroy({ where: {}, truncate: true });
    });

    test('Debe crear una tarea raíz con peso total 1 y estado pendiente', async () => {
        const root = await Task.create({
            titulo: 'Tarea Raíz',
            descripcion: 'Descripción raíz',
            peso_individual: 1,
            peso_grupal: 0,
            peso_total: 1,
            final_total: 0,
            estado: 'pendiente'
        });

        expect(root.peso_total).toBe(1);
        expect(root.estado).toBe('pendiente');
        expect(root.padre_id).toBeFalsy();
    });

    test('PropagarIncrementoPeso: debe incrementar peso_grupal y peso_total hacia los ancestros', async () => {
        const root = await Task.create({
            titulo: 'Raíz',
            descripcion: 'Desc',
            peso_individual: 1,
            peso_grupal: 0,
            peso_total: 1,
            final_total: 0,
            estado: 'pendiente'
        });

        const hijo = await Task.create({
            titulo: 'Hijo 1',
            descripcion: 'Desc',
            padre_id: root.id,
            peso_individual: 1,
            peso_grupal: 0,
            peso_total: 1,
            final_total: 0,
            estado: 'pendiente'
        });

        await PropagarIncrementoPeso(hijo.padre_id, 1);
        await root.reload();

        expect(root.peso_grupal).toBe(1);
        expect(root.peso_total).toBe(2);
    });

    test('PropagarAvanceProgreso: actualizar estado a progreso y luego a finalizado al completar', async () => {
        const root = await Task.create({
            titulo: 'Proyecto',
            descripcion: 'Desc',
            peso_individual: 1,
            peso_grupal: 1,
            peso_total: 2,
            final_total: 0,
            estado: 'pendiente'
        });

        // Completar parte del trabajo (+1)
        await PropagarAvanceProgreso(root.id, 1);
        await root.reload();
        expect(root.final_total).toBe(1);
        expect(root.estado).toBe('progreso');

        // Completar todo el trabajo (+1 adicional)
        await PropagarAvanceProgreso(root.id, 1);
        await root.reload();
        expect(root.final_total).toBe(2);
        expect(root.estado).toBe('finalizado');
    });

    test('PropagarEliminacionNodo: debe decrementar peso en los ancestros correctamente', async () => {
        const root = await Task.create({
            titulo: 'Raíz',
            descripcion: 'Desc',
            peso_individual: 1,
            peso_grupal: 2,
            peso_total: 3,
            final_total: 1,
            estado: 'progreso'
        });

        // Simulamos eliminar una subtarea que estaba finalizada
        await PropagarEliminacionNodo(root.id, true);
        await root.reload();

        expect(root.peso_total).toBe(2);
        expect(root.peso_grupal).toBe(1);
        expect(root.final_total).toBe(0);
        expect(root.estado).toBe('pendiente');
    });
});
