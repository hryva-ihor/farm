
import React from 'react';

interface HeaderProps {
    view: 'dashboard' | 'details';
    setView: (view: 'dashboard' | 'details') => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const navButtonClasses = (buttonView: 'dashboard' | 'details') => 
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        view === buttonView 
        ? 'bg-cyan-600 text-white' 
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-cyan-400">
          <span className="text-slate-200">3D</span> Printer Farm
        </h1>
        <nav className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-lg">
            <button onClick={() => setView('dashboard')} className={navButtonClasses('dashboard')}>
                Панель керування
            </button>
            <button onClick={() => setView('details')} className={navButtonClasses('details')}>
                Керування Деталями
            </button>
        </nav>
      </div>
    </header>
  );
};
