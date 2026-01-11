
import React, { useState } from 'react';
import Header from './components/Header';
import Terminal from './components/Terminal';
import IDEView from './components/IDEView';
import { SessionStatus, InstanceData } from './types';
import { launchInstance, terminateSession } from './services/orchestratorService';

const App: React.FC = () => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  const [repoUrl, setRepoUrl] = useState('');
  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    try {
      setStatus(SessionStatus.PROVISIONING);
      setError(null);
      
      const data = await launchInstance(repoUrl);
      setInstance(data);
      setStatus(SessionStatus.READY);
    } catch (err: any) {
      setError(err.message || 'Failed to provision instance');
      setStatus(SessionStatus.ERROR);
    }
  };

  const handleDestroy = async () => {
    if (instance) {
      try {
        await terminateSession(instance.id);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
    setInstance(null);
    setStatus(SessionStatus.IDLE);
    setRepoUrl('');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950">
      <Header status={status} onDestroy={handleDestroy} />

      <main className="flex-1 flex flex-col items-center justify-center relative">
        {status === SessionStatus.IDLE && (
          <div className="max-w-2xl w-full px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Ephemeral <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Dev Environments</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Launch a pre-configured VS Code server for any GitHub repository in seconds. Powered by Firecracker.
            </p>
            
            <form onSubmit={handleLaunch} className="relative max-w-xl mx-auto group">
              <input
                type="text"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 text-lg"
              />
              <button
                type="submit"
                disabled={!repoUrl}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Launch Instance
              </button>
            </form>

            <div className="mt-12 flex items-center justify-center gap-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <img src="https://picsum.photos/id/1/60/24" alt="Docker" className="h-6" />
               <img src="https://picsum.photos/id/2/80/24" alt="K8s" className="h-6" />
               <img src="https://picsum.photos/id/3/100/24" alt="AWS" className="h-6" />
            </div>
          </div>
        )}

        {status === SessionStatus.PROVISIONING && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                Provisioning in Progress
              </div>
              <h3 className="text-2xl font-semibold text-zinc-100 mb-2">Setting up your environment</h3>
              <p className="text-zinc-400">This usually takes about 30 seconds</p>
            </div>
            <Terminal />
          </div>
        )}

        {status === SessionStatus.READY && instance && (
          <div className="w-full h-full animate-in fade-in duration-1000">
            <IDEView url={`http://${instance.ip}:${instance.port}`} />
          </div>
        )}

        {status === SessionStatus.ERROR && (
          <div className="text-center p-8 max-w-md animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ⚠️
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Provisioning Failed</h3>
            <p className="text-zinc-400 mb-8">{error || 'An unexpected error occurred while launching your instance.'}</p>
            <button
              onClick={() => setStatus(SessionStatus.IDLE)}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="h-10 px-6 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-600 font-medium shrink-0">
        <div>&copy; 2024 CLOUDIDE ORCHESTRATOR v0.1.0-alpha</div>
        <div className="flex gap-4">
          <span>LATENCY: 14ms</span>
          <span>SYSTEM LOAD: 4.2%</span>
          <span className="text-green-600">CLUSTER HEALTH: OPTIMAL</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
