
import axios from 'axios';
import { ApiResponse, InstanceData } from '../types';

const API_BASE_URL = 'https://api.mock-orchestrator.com/v1'; // Placeholder URL

// Note: In a real scenario, these would call your Go bridge. 
// I'm implementing the structure as requested, with a simulated delay to show the provisioning UI.

export const launchInstance = async (repoUrl: string): Promise<InstanceData> => {
  // Simulate API call
  // const response = await axios.post(`${API_BASE_URL}/sessions`, { repo_url: repoUrl });
  // return response.data;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `inst_${Math.random().toString(36).substr(2, 9)}`,
        ip: `10.244.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: 8080,
        repoUrl: repoUrl,
        createdAt: new Date().toISOString()
      });
    }, 5000); // 5s delay to show off the terminal
  });
};

export const terminateSession = async (sessionId: string): Promise<void> => {
  // await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
