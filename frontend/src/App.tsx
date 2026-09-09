import React from 'react';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar (Columna Izquierda) */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Gestor 42i
          </h2>
        </div>
        <div className="p-6 flex-grow">
          {/* Botón maquetado para Crear Tarea (se implementará en el Paso 1.6) */}
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-95 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Crear Tarea
          </button>
        </div>
      </aside>

      {/* Main Content (Columna Derecha) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-8 py-8 z-10 shadow-sm flex-shrink-0">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Tareas Principales
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Visualiza, administra y prioriza el trabajo en tu equipo.
            </p>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto pb-12">
            <TaskList />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;