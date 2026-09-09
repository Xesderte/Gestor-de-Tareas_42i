import React, { useState } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <TaskForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={handleTaskCreated} 
      />
      
      {/* Sidebar (Columna Izquierda) */}
      <aside className="w-fit bg-slate-900 text-white flex-col hidden md:flex items-center py-6 px-4 shadow-xl z-20">
        <div className="mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          {/* Botón maquetado para Crear Tarea (se implementará en el Paso 1.6) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-95 text-sm whitespace-nowrap"
          >
            + Tarea
          </button>
        </div>
      </aside>

      {/* Main Content (Columna Derecha) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-10 py-8 z-10 shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Tareas Principales
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Visualiza, administra y prioriza el trabajo en tu equipo.
            </p>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto px-10 py-8 bg-slate-50/50">
          <div className="pb-12">
            <TaskList refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;