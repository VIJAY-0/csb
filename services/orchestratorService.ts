
import { GoogleGenAI, Type } from "@google/genai";
import { InstanceData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Hardcoded Redis-Bridge Configuration
const WS_URL = "ws://localhost:8081/ws"; 
const CHANNELS = {
  REQUEST: "worker:codesb:start",
  TERMINATE: "worker:codesb:stop",
  RESPONSE_PREFIX: "worker:codesb:response:"
};

export interface RepoAnalysis {
  projectType: string;
  suggestedOptimizations: string[];
  customLog: string;
}

export type LogCallback = (message: string) => void;
export type ReadyCallback = (instance: InstanceData) => void;

class RedisPubSubClient {
  private socket: WebSocket | null = null;
  private taskId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(WS_URL);
      this.socket.onopen = () => resolve();
      this.socket.onerror = (err) => reject(err);
    });
  }

  async subscribeAndLaunch(
    repoUrl: string, 
    onLog: LogCallback, 
    onReady: ReadyCallback
  ) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    this.taskId = `${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`;
    
    // Listen for responses on our specific task response channel
    this.socket!.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      // The bridge should deliver messages from the response channel
      if (payload.channel === `${CHANNELS.RESPONSE_PREFIX}${this.taskId}`) {
        if (payload.type === 'LOG') {
          onLog(payload.message);
        } else if (payload.type === 'READY') {
          onReady(payload.data as InstanceData);
        } else if (payload.type === 'ERROR') {
          onLog(`Error: ${payload.message}`);
        }
      }
    };

    // Publish launch request as defined in the worker spec
    const taskPayload = {
      task_id: this.taskId,
      cpu: 1,
      memory: 1024,
      network_group: "",
      isolated: true,
      github_url: repoUrl
    };

    this.socket!.send(JSON.stringify({
      channel: CHANNELS.REQUEST,
      payload: taskPayload
    }));
  }

  terminate(sessionId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        channel: CHANNELS.TERMINATE,
        payload: { task_id: this.taskId || sessionId }
      }));
    }
  }
}

export const pubSubClient = new RedisPubSubClient();

export const analyzeRepository = async (repoUrl: string): Promise<RepoAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this GitHub repository URL: ${repoUrl}. 
      Guess the tech stack and provide a JSON response with the project type, 3 optimization steps for a cloud environment, and a one-sentence terminal log message.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectType: { type: Type.STRING },
            suggestedOptimizations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            customLog: { type: Type.STRING }
          },
          required: ["projectType", "suggestedOptimizations", "customLog"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}') as RepoAnalysis;
  } catch (error) {
    return {
      projectType: "Standard Application",
      suggestedOptimizations: ["Resource isolation", "Port mapping", "Volume persistence"],
      customLog: "Analyzing project structure..."
    };
  }
};
