import React, { useState } from 'react';
import { createRootTask, createSubtask } from '../api/taskService';
import type { CreateTaskDTO } from '../api/taskService';

interface TaskFormProps {
  parentId?: string;
  onCancel: () => void;
  onTaskCreated: () => void;
  siblingTitles?: string[];
}

const TaskForm: React.FC<TaskFormProps> = ({ parentId, onCancel, onTaskCreated, siblingTitles = [] }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setIsSubmitting(true);
    try {
      const data: CreateTaskDTO = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        indicador_urgencia: isUrgent
      };
      
      if (parentId) {
        await createSubtask(parentId, data);
      } else {
        await createRootTask(data);
      }
      
      setTitulo('');
      setDescripcion('');
      setIsUrgent(false);
      onTaskCreated();
    } catch (error) {
      console.error('Error al crear tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxSiblings = 3;
  const displaySiblings = siblingTitles.slice(-maxSiblings);
  
  const stack: string[] = [...displaySiblings];

  return (
    <div className="flex flex-col w-[22rem] mt-2 mb-4 relative">
      {/* Tarjetas de fondo (Hermanos apilados) */}
      {stack.map((title, index) => {
        return (
          <div 
            key={index}
            className="w-[96%] ml-auto bg-slate-900 border border-slate-700 rounded-t-xl px-4 pt-2 pb-6 shadow-sm relative overflow-hidden"
            style={{
              marginTop: index === 0 ? '0' : '-1.5rem',
              zIndex: index
            }}
          >
            <span className="text-white/90 text-sm font-bold truncate text-center w-full block">{title}</span>
          </div>
        );
      })}

      {/* Formulario Principal */}
      <div 
        className="w-full bg-white rounded-xl shadow-lg relative border border-slate-200 overflow-hidden"
        style={{
          marginTop: stack.length > 0 ? '-1.5rem' : '0',
          zIndex: stack.length
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            Crear Tarea 
            {parentId && <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">Subtarea</span>}
          </h2>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor={`titulo-${parentId || 'root'}`} className="block text-xs font-bold text-slate-700 mb-1.5">
              Título <span className="text-blue-500">*</span>
            </label>
            <input
              type="text"
              id={`titulo-${parentId || 'root'}`}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              autoFocus
              placeholder="Ej. Implementar módulo de autenticación"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 font-semibold text-sm placeholder-slate-400"
            />
          </div>

          <div>
            <label htmlFor={`descripcion-${parentId || 'root'}`} className="block text-xs font-bold text-slate-700 mb-1.5">
              Descripción
            </label>
            <textarea
              id={`descripcion-${parentId || 'root'}`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Detalla qué es lo que hay que hacer..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none text-slate-600 text-sm placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${isUrgent ? 'bg-amber-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${isUrgent ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <label 
              className="text-xs font-bold text-slate-700 cursor-pointer select-none flex gap-1" 
              onClick={() => setIsUrgent(!isUrgent)}
            >
              Marcar como <span className="text-amber-500 font-extrabold">Urgente</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 mt-5 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !titulo.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
