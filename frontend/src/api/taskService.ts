import axios from 'axios';

export interface Task {
    id: string;
    titulo: string;
    descripcion: string;
    estado: string;
    indicador_urgencia: boolean | null;
    padre_id: string | null;
    peso_individual: number;
    peso_grupal: number;
    peso_total: number;
    final_total: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDTO {
    titulo: string;
    descripcion: string;
    indicador_urgencia?: boolean;
}

const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api/tasks',
});

export const getRootTasks = async (): Promise<Task[]> => {
    try {
        const response = await apiClient.get<Task[]>('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las tareas raíz:', error);
        throw error;
    }
};

export const createRootTask = async (data: CreateTaskDTO): Promise<Task> => {
    try {
        const response = await apiClient.post<Task>('/', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear la tarea raíz:', error);
        throw error;
    }
};

export const toggleTaskUrgency = async (id: string, indicador_urgencia: boolean): Promise<Task> => {
    try {
        const response = await apiClient.patch<Task>(`/${id}/urgency`, { indicador_urgencia });
        return response.data;
    } catch (error) {
        console.error(`Error al modificar urgencia de la tarea ${id}:`, error);
        throw error;
    }
};
