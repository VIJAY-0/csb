
import React from 'react';
import { SessionStatus } from '../types';

interface HeaderProps {
  status: SessionStatus;
  onDestroy: () => void;
}

const Header: React.FC<HeaderProps> = ({ status, onDestroy }) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          C
        </div>
        <h1 className="font-semibold text-zinc-200 tracking-tight">CloudIDE Orchestrator</h1>
        {status !== SessionStatus.IDLE && (
          <div className="ml-4 flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
            <div className={`w-2 h-2 rounded-full ${
              status === SessionStatus.READY ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`} />
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {status}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {(status === SessionStatus.READY || status === SessionStatus.PROVISIONING) && (
          <button
            onClick={onDestroy}
            className="text-xs font-semibold px-4 py-2 bg-red-950/30 text-red-400 border border-red-900/50 rounded-md hover:bg-red-900/50 transition-colors"
          >
            Destroy Session
          </button>
        )}
        <div className="hidden md:flex gap-6 text-xs font-medium text-zinc-500">
          <a href="#" className="hover:text-zinc-200 transition-colors">Documentation</a>
          <a href="#" className="hover:text-zinc-200 transition-colors">API Keys</a>
          <a href="#" className="hover:text-zinc-200 transition-colors">Support</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
