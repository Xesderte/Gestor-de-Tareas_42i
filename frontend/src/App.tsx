import React, { useState } from 'react';
import TaskList from './components/TaskList';
import { LayoutDashboard, Plus, Zap } from 'lucide-react';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [filterUrgent, setFilterUrgent] = useState(false);

  return (
    <div className="flex h-screen bg-[#111827] overflow-hidden font-sans">
      
      {/* Sidebar (Columna Izquierda) */}
      <aside className="w-20 bg-slate-900 border-r border-slate-800 text-white flex-col hidden md:flex items-center py-6 shadow-xl z-20">
        <div className="mb-8">
          <div className="bg-blue-600/20 p-2 rounded-xl">
             <LayoutDashboard className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 w-full px-4">
          <button 
            onClick={() => setIsAddingRoot(true)}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-95"
            title="Nueva Tarea Principal"
          >
            <Plus className="h-6 w-6" />
          </button>

          <button 
            onClick={() => setFilterUrgent(!filterUrgent)}
            className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 shadow-md active:scale-95 ${
              filterUrgent 
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
            title="Filtrar Urgentes"
          >
            <Zap className={`h-6 w-6 ${filterUrgent ? 'fill-current' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content (Columna Derecha) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '32px 32px'}}>
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-10 py-6 z-10 shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Tareas Principales
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">
              Visualiza el árbol completo de jerarquías
            </p>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto w-full">
          <div className="pb-24">
            <TaskList 
              refreshKey={refreshKey}
              isAddingRoot={isAddingRoot}
              setIsAddingRoot={setIsAddingRoot}
              filterUrgent={filterUrgent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;