import axios from 'axios';

// Update this to your Replit backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HealthMetrics {
  sleepQuality: number;
  sleepDuration: number;
  fatigueLevel: number;
  moodScore: number;
  activitySteps: number;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  riskScore: number;
  riskCategory: string;
  suggestion: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const apiClient = {
  // Health Metrics
  async predictRisk(userId: string, metrics: HealthMetrics) {
    const response = await api.post('/api/predict-risk', {
      userId,
      ...metrics,
    });
    return response.data;
  },

  async getRiskHistory(userId: string, limit = 7) {
    const response = await api.get(`/api/risk-history/${userId}`, {
      params: { limit },
    });
    return response.data.history;
  },

  async getLatestRisk(userId: string) {
    const response = await api.get(`/api/latest-risk/${userId}`);
    return response.data.riskAssessment;
  },

  // Chat
  async sendChatMessage(userId: string, message: string) {
    const response = await api.post('/api/chat', {
      userId,
      message,
    });
    return response.data;
  },

  async getChatHistory(userId: string, limit = 50) {
    const response = await api.get(`/api/chat/history/${userId}`, {
      params: { limit },
    });
    return response.data.history;
  },

  // Users
  async createUser(uid: string, email: string, name: string) {
    const response = await api.post('/api/users', {
      id: uid,
      email,
      name,
    });
    return response.data.user;
  },

  async getUser(uid: string) {
    const response = await api.get(`/api/users/${uid}`);
    return response.data.user;
  },
};
