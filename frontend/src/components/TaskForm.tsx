import React, { useState } from 'react';
import { createRootTask } from '../api/taskService';
import type { CreateTaskDTO } from '../api/taskService';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      await createRootTask(data);
      
      // Limpiar formulario y notificar éxito
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Crear Tarea Principal</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="titulo" className="block text-sm font-bold text-slate-700 mb-1.5">
              Título <span className="text-blue-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ej. Implementar módulo de autenticación"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-800 font-medium"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-bold text-slate-700 mb-1.5">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Detalla qué es lo que hay que hacer..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-slate-700"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 ${isUrgent ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <label 
              className="text-sm font-bold text-slate-700 cursor-pointer select-none" 
              onClick={() => setIsUrgent(!isUrgent)}
            >
              Marcar como <span className="text-amber-500">Urgente</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !titulo.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
