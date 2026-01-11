
import React, { useEffect, useRef } from 'react';
import { ProvisioningLog } from '../types';

interface TerminalProps {
  logs: ProvisioningLog[];
  isConnected: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isConnected }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-black border border-zinc-800 rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/5">
      <div className="bg-zinc-900/50 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
          </div>
          <span className="text-xs text-zinc-500 font-medium ml-2 terminal-font">redis-pubsub-stream</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
          <div className="text-[10px] text-zinc-500 terminal-font uppercase tracking-tighter">
            {isConnected ? 'Subscribed' : 'Connecting Bridge...'}
          </div>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="p-5 h-80 overflow-y-auto terminal-font text-sm leading-relaxed"
      >
        {logs.length === 0 && (
          <div className="text-zinc-700 animate-pulse">Waiting for Redis log events...</div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-4 mb-1.5 group animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-zinc-600 whitespace-nowrap opacity-50 select-none">[{log.timestamp}]</span>
            <span className={log.message.includes('[AI]') ? 'text-indigo-400' : 'text-emerald-500'}>
              {log.message.includes('[AI]') ? '✨' : '➜'}
            </span>
            <span className={`${
              log.message.includes('[AI]') ? 'text-indigo-300 font-medium' : 'text-zinc-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-zinc-300 mt-2">
          <span className="w-2 h-4 bg-indigo-500/50 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
