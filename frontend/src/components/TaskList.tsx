import React, { useEffect, useState } from 'react';
import type { Task } from '../api/taskService';
import { getRootTasks } from '../api/taskService';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

interface TaskListProps {
  refreshKey?: number;
  isAddingRoot: boolean;
  setIsAddingRoot: (isAdding: boolean) => void;
  filterUrgent: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ refreshKey = 0, isAddingRoot, setIsAddingRoot, filterUrgent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTasks = async () => {
    try {
      const data = await getRootTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTasks = filterUrgent ? tasks.filter(t => t.indicador_urgencia) : tasks;

  return (
    <div className="w-full max-w-4xl flex flex-col items-start px-12 py-10">
      
      {/* Formulario Inline para nueva Tarea Raíz */}
      {isAddingRoot && (
        <div className="mb-10 w-[22rem]">
            <TaskForm 
                onCancel={() => setIsAddingRoot(false)} 
                onTaskCreated={() => {
                    setIsAddingRoot(false);
                    fetchTasks();
                }} 
            />
        </div>
      )}

      {filteredTasks.length === 0 && !isAddingRoot ? (
        <div className="text-center bg-slate-900 p-12 border-2 border-dashed border-slate-700 rounded-2xl shadow-sm w-full max-w-2xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-lg font-medium">Sin tareas</h3>
          <p className="text-slate-400 mt-1">No hay tareas que mostrar en esta vista. Utiliza la barra lateral para crear una.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-8">
          {filteredTasks.map((task) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onUpdate={fetchTasks} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
