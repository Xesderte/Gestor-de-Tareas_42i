import React, { useState } from 'react';
import { GitBranch, Plus, Zap, Scale, Calendar, ChevronDown, Activity } from 'lucide-react';
import type { Task } from '../api/taskService';
import { toggleTaskUrgency, getTaskById, toggleTaskComplete } from '../api/taskService';
import TaskForm from './TaskForm';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void; // Para recargar desde el padre si es necesario
  isRoot?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, isRoot = true }) => {
  const [isExpanded, setIsExpanded] = useState(false); // Expande descripción
  const [isTreeOpen, setIsTreeOpen] = useState(false); // Expande subtareas
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [children, setChildren] = useState<Task[]>(task.hijos || []);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [localTask, setLocalTask] = useState<Task>(task);

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200 uppercase">Pendiente</span>; // Placeholder if needed
      case 'en progreso':
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-800 bg-blue-100 rounded-full border border-blue-200 uppercase">Progreso</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-700 bg-slate-100 rounded-full border border-slate-200 uppercase">Pendiente</span>;
    }
  };

  const handleToggleUrgency = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedTask = await toggleTaskUrgency(localTask.id, !localTask.indicador_urgencia);
      setLocalTask(prev => ({ ...prev, indicador_urgencia: updatedTask.indicador_urgencia }));
    } catch (error) {
      console.error('Error al cambiar urgencia:', error);
    }
  };

  const handleToggleComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const isCompleted = e.target.checked;
    
    // Si tiene hijos y no están todos completados, backend lo rechazará, 
    // pero podemos prevenir clicks inútiles si final_total < peso_grupal
    if (isCompleted && localTask.final_total < localTask.peso_grupal) {
      alert("No puedes completar esta tarea porque tiene subtareas pendientes.");
      return;
    }

    try {
      const updatedTask = await toggleTaskComplete(localTask.id, isCompleted);
      setLocalTask(updatedTask);
      onUpdate(); // Para propagar los cambios de FT hacia arriba
    } catch (error: any) {
      console.error('Error al cambiar estado completado:', error);
      const errorMessage = error.response?.data?.message || "Hubo un error al intentar actualizar la tarea.";
      alert(errorMessage);
    }
  };

  const handleToggleTree = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isTreeOpen) {
      // Si vamos a abrir, pedimos el detalle al backend para tener el árbol fresco
      setIsLoadingChildren(true);
      try {
        const fullTask = await getTaskById(localTask.id);
        setLocalTask(fullTask);
        setChildren(fullTask.hijos || []);
        setIsTreeOpen(true);
      } catch (error) {
        console.error('Error al obtener subtareas:', error);
      } finally {
        setIsLoadingChildren(false);
      }
    } else {
      // Solo cerramos
      setIsTreeOpen(false);
    }
  };

  const handleAddSubtaskClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isTreeOpen) {
      setIsLoadingChildren(true);
      try {
        const fullTask = await getTaskById(localTask.id);
        setLocalTask(fullTask);
        setChildren(fullTask.hijos || []);
        setIsTreeOpen(true);
      } catch (error) {
        console.error('Error al obtener subtareas:', error);
      } finally {
        setIsLoadingChildren(false);
      }
    }
    setIsAddingSubtask(true);
  };

  const handleChildUpdate = async () => {
    // Si la rama está abierta o somos el padre afectado, recargamos nuestro estado local desde el backend
    // Esto asegura que si un hijo se completó, el padre también refleje el nuevo final_total y la barra de progreso
    try {
      const fullTask = await getTaskById(localTask.id);
      setLocalTask(fullTask);
      setChildren(fullTask.hijos || []);
    } catch (error) {
      console.error('Error al refrescar la rama:', error);
    }
    // Propagamos la actualización hacia el abuelo
    onUpdate();
  };

  const handleSubtaskCreated = async () => {
    setIsAddingSubtask(false);
    // Refrescamos el nodo actual para traer el hijo nuevo
    try {
      const fullTask = await getTaskById(localTask.id);
      setLocalTask(fullTask);
      setChildren(fullTask.hijos || []);
      setIsTreeOpen(true); // Aseguramos que esté abierto
    } catch (error) {
      console.error('Error refrescando tarea después de crear subtarea:', error);
    }
    onUpdate(); // Notifica hacia arriba si es necesario
  };

  return (
    <div className="flex flex-col relative">
      {/* Contenedor de la Tarjeta (Nodo Base) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-[22rem] bg-slate-900 rounded-2xl shadow-sm border border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0 relative group hover:border-slate-500 z-10
          ${isExpanded ? 'shadow-md' : ''}`}
      >
        <div className="p-4 pr-16 relative">
          {/* Fila de Arriba: Titulo y Checkbox */}
          <div className="flex items-start gap-3 pr-4" onClick={(e) => e.stopPropagation()}>
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800 border-slate-600 cursor-pointer" 
              checked={localTask.estado === 'completado'} 
              onChange={handleToggleComplete} 
            />
            <h3 className={`text-base font-bold leading-tight break-words transition-colors ${localTask.estado === 'completado' ? 'text-slate-400 line-through' : 'text-white'}`}>
              {localTask.titulo}
            </h3>
          </div>
          {/* Fila del Medio: Métricas (Debajo del título) */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {getStatusBadge(localTask.estado)}
            
            <div className="flex items-center gap-1 bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-semibold border border-slate-600">
              <Scale className="w-3 h-3 text-blue-400" /> PT: {localTask.peso_total}
            </div>

            <div 
                className={`flex items-center justify-center w-6 h-6 rounded bg-white cursor-pointer ${localTask.indicador_urgencia ? 'text-amber-500' : 'text-slate-300'} hover:scale-110 transition-transform`}
                onClick={handleToggleUrgency}
                title="Alternar Urgencia"
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>

            {(localTask.esfuerzo_total !== undefined && localTask.esfuerzo_relativo !== undefined) && (
              <div className="flex items-center gap-1 font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded-md text-xs text-white">
                <span>🔨</span>
                <span>{localTask.esfuerzo_relativo ?? 0}/{localTask.esfuerzo_total ?? 0}</span>
              </div>
            )}
          </div>

          {/* Barra de Progreso */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 border border-slate-700 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${localTask.peso_total > 0 ? Math.min(100, (localTask.final_total / localTask.peso_total) * 100) : 0}%` }}
            ></div>
          </div>

          {/* Fila de Abajo (Expandible): Descripción */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {localTask.descripcion}
                </p>
                <div className="flex items-center text-xs text-slate-400 font-medium gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(localTask.createdAt).toLocaleDateString()}
                </div>
            </div>
          </div>

          {/* Botones de Acción Derecho (Absolutos) */}
          <div className="absolute top-0 right-0 h-full w-12 flex flex-col border-l border-slate-700 bg-slate-800/50">
            {localTask.peso_grupal > 0 ? (
              <button 
                  onClick={handleToggleTree}
                  className="flex-1 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border-b border-slate-700"
                  title="Ver subtareas"
                  disabled={isLoadingChildren}
              >
                {isLoadingChildren ? (
                   <Activity className="w-5 h-5 animate-pulse" />
                ) : (
                   <GitBranch className={`w-5 h-5 transition-transform ${isTreeOpen ? '-rotate-90 text-blue-400' : ''}`} />
                )}
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 border-b border-slate-700 cursor-not-allowed" title="No tiene subtareas">
                <GitBranch className="w-5 h-5 opacity-30" />
              </div>
            )}
            <button 
                onClick={handleAddSubtaskClick}
                className="flex-1 flex items-center justify-center text-white bg-blue-700 hover:bg-blue-600 transition-colors"
                title="Añadir subtarea"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Árbol de Hijos (Recursión e Indentación Visual) */}
      {(isTreeOpen && !isAddingSubtask && children.length > 0) && (
        <div className="ml-6 relative mt-0">
            {/* Dot origen (en la base del padre) */}
            <div className="absolute left-0 -top-1.5 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] z-50" style={{ transform: 'translateX(-4.5px)' }}></div>
            {/* Linea vertical inicial (cubre el gap entre padre y el primer hijo) */}
            <div className="absolute left-0 top-0 w-[3px] h-4 bg-emerald-500"></div>

            <div className="flex flex-col gap-4 pl-4 pt-4 w-full">
                {/* 1. Mapeo de Subtareas (Los Hijos) */}
                {children.map((hijo, index) => {
                  const isLast = index === children.length - 1;
                  return (
                    <div key={hijo.id} className="relative w-full">
                      {/* Línea vertical individual */}
                      <div className={`absolute -left-4 top-0 w-[3px] bg-emerald-500 ${isLast ? 'h-[27px]' : 'h-[calc(100%+1rem)]'}`}></div>
                      
                      {/* Línea horizontal individual */}
                      <div className="absolute -left-4 top-[24px] w-4 h-[3px] bg-emerald-500"></div>

                      {/* Dot tocando exactamente la tarjeta hijo */}
                      <div className="absolute -left-[4.5px] top-[19.5px] w-3 h-3 bg-emerald-500 rounded-full z-50 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      
                      <TaskCard task={hijo} onUpdate={handleChildUpdate} isRoot={false} />
                    </div>
                  );
                })}
            </div>
        </div>
      )}

      {/* Renderizado del Formulario Inline en modo STACK */}
      {isAddingSubtask && (() => {
        const stackCount = Math.min(children.length, 3);
        const lineOffset = 30 * (stackCount + 1) + 2;

        return (
          <div className="ml-6 relative mt-0">
              {/* Dot origen */}
              <div className="absolute left-0 -top-1.5 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] z-50" style={{ transform: 'translateX(-4.5px)' }}></div>
              {/* Linea inicial */}
              <div className="absolute left-0 top-0 w-[3px] h-4 bg-emerald-500"></div>

              <div className="flex flex-col gap-4 pl-4 pt-4 w-full">
                  <div className="relative w-full">
                      {/* Línea vertical individual */}
                      <div className="absolute -left-4 top-0 w-[3px] bg-emerald-500" style={{ height: `${lineOffset + 3}px` }}></div>
                      
                      {/* Línea horizontal individual */}
                      <div className="absolute -left-4 w-4 h-[3px] bg-emerald-500" style={{ top: `${lineOffset}px` }}></div>

                      {/* Dot tocando exactamente el formulario */}
                      <div className="absolute -left-[4.5px] w-3 h-3 bg-emerald-500 rounded-full z-50 shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ top: `${lineOffset - 4.5}px` }}></div>
                      
                      <TaskForm 
                          parentId={localTask.id} 
                          onCancel={() => setIsAddingSubtask(false)}
                          onTaskCreated={handleSubtaskCreated}
                          siblingTitles={children.map(c => c.titulo)}
                      />
                  </div>
              </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TaskCard;
