import React, { useEffect, useState } from 'react';
import type { Task } from '../api/taskService';
import { getRootTasks, toggleTaskUrgency } from '../api/taskService';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
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

    fetchTasks();
  }, []);

  const handleToggleUrgency = async (e: React.MouseEvent, id: string, currentUrgency: boolean) => {
    e.stopPropagation(); // Evita que el clic expanda/contraiga la tarjeta
    try {
      const updatedTask = await toggleTaskUrgency(id, !currentUrgency);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === id ? { ...task, indicador_urgencia: updatedTask.indicador_urgencia } : task
      ));
    } catch (error) {
      console.error('Error al cambiar la urgencia:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center bg-white p-12 border-2 border-dashed border-slate-300 rounded-2xl shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="text-lg font-medium text-slate-900">Sin tareas</h3>
        <p className="text-slate-500 mt-1">No hay tareas principales registradas aún.</p>
      </div>
    );
  }

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return <span className="px-3 py-1 text-xs font-bold tracking-wide text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200">Completado</span>;
      case 'en progreso':
        return <span className="px-3 py-1 text-xs font-bold tracking-wide text-blue-800 bg-blue-100 rounded-full border border-blue-200">En Progreso</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold tracking-wide text-slate-700 bg-slate-100 rounded-full border border-slate-200">Pendiente</span>;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
      {tasks.map((task) => {
        const isExpanded = expandedId === task.id;
        const isUrgent = !!task.indicador_urgencia;

        return (
          <div 
            key={task.id} 
            onClick={() => setExpandedId(isExpanded ? null : task.id)}
            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer overflow-hidden group hover:shadow-md
              ${isExpanded ? 'border-blue-300 shadow-blue-100' : 'border-slate-200 hover:border-blue-200'}`}
          >
            {/* Header siempre visible */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(task.estado)}
                
                {/* Botón de Urgencia */}
                <button 
                  onClick={(e) => handleToggleUrgency(e, task.id, isUrgent)}
                  className={`p-2 rounded-full transition-all duration-300 -mr-2 -mt-2 ${
                    isUrgent 
                      ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 hover:scale-110 shadow-sm' 
                      : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                  }`}
                  title={isUrgent ? "Marcar como no urgente" : "Marcar como urgente"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isUrgent ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                {task.titulo}
              </h3>
            </div>

            {/* Contenido expandible (Acordeón) */}
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                  {task.descripcion}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  
                  {task.peso_total > 0 && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-slate-600 border border-slate-100" title="Peso Total Estimado">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      PT: {task.peso_total}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Indicador sutil de clic para expandir */}
            {!isExpanded && (
              <div className="px-6 pb-4">
                <div className="h-1 w-8 bg-slate-200 rounded-full mx-auto group-hover:bg-blue-300 transition-colors"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
