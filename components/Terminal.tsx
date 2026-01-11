
import React, { useEffect, useRef, useState } from 'react';
import { ProvisioningLog } from '../types';

interface TerminalProps {
  onComplete?: () => void;
}

const LOG_MESSAGES = [
  "Initializing worker request context...",
  "Searching for available capacity in us-east-1...",
  "Worker node found: worker-7742-alpha",
  "Allocating Firecracker MicroVM resources...",
  "Mounting rootfs (Ubuntu 22.04 LTS)...",
  "Configuring Calico networking overlay...",
  "Assigning internal IP: 10.244.15.22/32",
  "Applying security group policies (port 8080 open)...",
  "Cloning repository into /workspace...",
  "Installing dependencies via bun/npm...",
  "Starting code-server (VS Code binary)...",
  "Waiting for health check on port 8080...",
  "Health check passed! Proxying traffic...",
];

const Terminal: React.FC<TerminalProps> = () => {
  const [logs, setLogs] = useState<ProvisioningLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: LOG_MESSAGES[currentLine],
          type: 'info'
        }]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 border-b border-zinc-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="text-xs text-zinc-400 font-medium ml-2 terminal-font">provisioning-logs</span>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 h-80 overflow-y-auto terminal-font text-sm leading-relaxed"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-4 mb-1">
            <span className="text-zinc-500 whitespace-nowrap">[{log.timestamp}]</span>
            <span className="text-emerald-400">➜</span>
            <span className="text-zinc-300">{log.message}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
