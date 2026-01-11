
export enum SessionStatus {
  IDLE = 'IDLE',
  PROVISIONING = 'PROVISIONING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface InstanceData {
  id: string;
  ip: string;
  port: number;
  repoUrl: string;
  createdAt: string;
}

export interface ProvisioningLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
