
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Terminal from './components/Terminal';
import IDEView from './components/IDEView';
import { SessionStatus, InstanceData, ProvisioningLog } from './types';
import { pubSubClient, analyzeRepository, RepoAnalysis } from './services/orchestratorService';

const App: React.FC = () => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  const [repoUrl, setRepoUrl] = useState('');
  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<RepoAnalysis | null>(null);
  const [logs, setLogs] = useState<ProvisioningLog[]>([]);
  const [isBridgeConnected, setIsBridgeConnected] = useState(false);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type: 'info'
    }]);
  }, []);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    try {
      setStatus(SessionStatus.PROVISIONING);
      setError(null);
      setLogs([]);
      
      // 1. Analyze with Gemini in parallel
      analyzeRepository(repoUrl).then(setAiAnalysis);

      // 2. Start Redis Pub/Sub Session
      await pubSubClient.connect();
      setIsBridgeConnected(true);
      
      addLog("Subscribed to Redis Bridge...");
      
      await pubSubClient.subscribeAndLaunch(
        repoUrl,
        (msg) => addLog(msg),
        (inst) => {
          addLog("Environment Ready. Redirecting to VS Code...");
          setInstance(inst);
          setTimeout(() => setStatus(SessionStatus.READY), 1000);
        }
      );

    } catch (err: any) {
      setError(err.message || 'Failed to establish Redis bridge connection');
      setStatus(SessionStatus.ERROR);
      setIsBridgeConnected(false);
    }
  };

  const handleDestroy = async () => {
    if (instance) {
      pubSubClient.terminate(instance.id);
    }
    setInstance(null);
    setStatus(SessionStatus.IDLE);
    setRepoUrl('');
    setAiAnalysis(null);
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b]">
      <Header status={status} onDestroy={handleDestroy} />

      <main className="flex-1 flex flex-col items-center justify-center relative">
        {status === SessionStatus.IDLE && (
          <div className="max-w-3xl w-full px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6 mx-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Firecracker V3.0 + Redis Pub/Sub
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Instant Cloud <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Workspaces.</span>
            </h2>
            
            <form onSubmit={handleLaunch} className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center bg-zinc-900 rounded-xl p-2 border border-zinc-800">
                <input
                  type="text"
                  placeholder="GitHub Repository URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 bg-transparent text-zinc-200 px-6 py-4 focus:outline-none placeholder:text-zinc-600 text-lg"
                />
                <button
                  type="submit"
                  disabled={!repoUrl}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg active:scale-95"
                >
                  Deploy
                </button>
              </div>
            </form>
          </div>
        )}

        {status === SessionStatus.PROVISIONING && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-white mb-2">Real-time Provisioning</h3>
                  <p className="text-zinc-400">Waiting for events on <code className="text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded">redis:pubsub</code></p>
                </div>
                <Terminal logs={logs} isConnected={isBridgeConnected} />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 h-fit">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">AI</div>
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Stack Insights</h4>
                  </div>
                  
                  {!aiAnalysis ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <div className="mb-4">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Detected</div>
                        <div className="text-lg font-semibold text-zinc-100">{aiAnalysis.projectType}</div>
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Auto-Applied Profiles</div>
                      <ul className="space-y-2">
                        {aiAnalysis.suggestedOptimizations.map((opt, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {status === SessionStatus.READY && instance && (
          <div className="w-full h-full animate-in fade-in duration-1000">
            <IDEView url={`http://${instance.ip}:${instance.port}`} />
          </div>
        )}

        {status === SessionStatus.ERROR && (
          <div className="text-center p-8 max-w-md animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              ✖
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Bridge Error</h3>
            <p className="text-zinc-400 mb-10 leading-relaxed">{error}</p>
            <button
              onClick={() => setStatus(SessionStatus.IDLE)}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}
      </main>

      <footer className="h-10 px-6 border-t border-zinc-900 bg-black flex items-center justify-between text-[10px] text-zinc-600 font-medium shrink-0">
        <div className="flex items-center gap-4">
          <span>&copy; 2024 ORCHESTRATOR.IO</span>
          <span className="text-zinc-800">|</span>
          <span className={`flex items-center gap-1.5 font-bold ${isBridgeConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isBridgeConnected ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'}`}></span>
            {isBridgeConnected ? 'REDIS BRIDGE ACTIVE' : 'BRIDGE STANDBY'}
          </span>
        </div>
        <div className="flex gap-6">
          <span>PUB: orchestrator:provision:request</span>
          <span>SUB: orchestrator:provision:logs:*</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
