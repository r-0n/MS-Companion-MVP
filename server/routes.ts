import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHealthMetricsSchema, insertUserSchema } from "@shared/schema";
import { spawn } from "child_process";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User endpoints
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health metrics endpoints
  app.post("/api/health-metrics", async (req, res) => {
    try {
      const { userId, ...metricsData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const validatedMetrics = insertHealthMetricsSchema.parse(metricsData);
      const healthMetric = await storage.createHealthMetrics({
        ...validatedMetrics,
        userId,
      });

      res.json({ healthMetric });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/health-metrics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      
      const metrics = await storage.getUserHealthMetrics(
        userId, 
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json({ metrics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Risk prediction endpoint
  app.post("/api/predict-risk", async (req, res) => {
    try {
      const { userId, ...metricsData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const validatedMetrics = insertHealthMetricsSchema.parse(metricsData);
      
      // First, save the health metrics
      const healthMetric = await storage.createHealthMetrics({
        ...validatedMetrics,
        userId,
      });

      // Call ML service for prediction
      const prediction = await callMLService(validatedMetrics);
      
      // Save risk assessment
      const riskAssessment = await storage.createRiskAssessment({
        userId,
        healthMetricId: healthMetric.id,
        riskScore: prediction.riskScore,
        riskCategory: prediction.riskCategory,
        suggestion: prediction.suggestion,
        mlModelVersion: prediction.modelVersion,
      });

      res.json({
        healthMetric,
        riskAssessment,
        prediction,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Risk history endpoint
  app.get("/api/risk-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      
      const history = await storage.getUserRiskHistory(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json({ history });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get latest risk assessment
  app.get("/api/latest-risk/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const riskAssessment = await storage.getLatestRiskAssessment(userId);
      
      if (!riskAssessment) {
        return res.status(404).json({ error: "No risk assessment found" });
      }
      
      res.json({ riskAssessment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { generateAIResponse } = await import('./gemini-service.js');
      const { insertChatMessageSchema } = await import('@shared/schema');
      
      const { userId, message } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const validatedMessage = insertChatMessageSchema.parse({
        role: "user",
        content: message,
      });

      const chatHistory = await storage.getUserChatHistory(userId, 10);
      const latestMetrics = await storage.getLatestHealthMetrics(userId);
      const latestRisk = await storage.getLatestRiskAssessment(userId);

      const context = {
        recentMetrics: latestMetrics ? {
          sleepQuality: latestMetrics.sleepQuality,
          sleepDuration: latestMetrics.sleepDuration,
          fatigueLevel: latestMetrics.fatigueLevel,
          moodScore: latestMetrics.moodScore,
          activitySteps: latestMetrics.activitySteps,
          riskScore: latestRisk?.riskScore,
          riskCategory: latestRisk?.riskCategory,
        } : undefined,
        conversationHistory: chatHistory
          .reverse()
          .map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
      };

      const aiResponse = await generateAIResponse(validatedMessage.content, context);

      const userMessage = await storage.createChatMessage({
        userId,
        ...validatedMessage,
      });

      const assistantMessage = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid message format", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chat/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      
      const history = await storage.getUserChatHistory(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json({ history: history.reverse() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate dummy data endpoint
  app.post("/api/generate-dummy-data/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const dummyData = [
        {
          sleepQuality: 7,
          sleepDuration: 8,
          fatigueLevel: 4,
          moodScore: 7,
          activitySteps: 6500,
          riskScore: 15,
          riskCategory: 'Low',
          suggestion: 'Great job maintaining consistent sleep patterns! Keep up your regular activity level.',
        },
        {
          sleepQuality: 5,
          sleepDuration: 6,
          fatigueLevel: 7,
          moodScore: 5,
          activitySteps: 3200,
          riskScore: 45,
          riskCategory: 'Moderate',
          suggestion: 'Your fatigue levels are elevated. Consider taking more breaks and prioritizing rest.',
        },
        {
          sleepQuality: 8,
          sleepDuration: 7.5,
          fatigueLevel: 3,
          moodScore: 8,
          activitySteps: 8000,
          riskScore: 12,
          riskCategory: 'Low',
          suggestion: 'Excellent health indicators! Your activity and rest are well balanced.',
        },
        {
          sleepQuality: 6,
          sleepDuration: 7,
          fatigueLevel: 6,
          moodScore: 6,
          activitySteps: 5000,
          riskScore: 32,
          riskCategory: 'Moderate',
          suggestion: 'Moderate fatigue detected. Try to maintain consistent sleep schedule and stay hydrated.',
        },
        {
          sleepQuality: 4,
          sleepDuration: 5,
          fatigueLevel: 8,
          moodScore: 4,
          activitySteps: 2000,
          riskScore: 68,
          riskCategory: 'High',
          suggestion: 'High risk indicators detected. Please prioritize rest and consider consulting your healthcare provider.',
        },
      ];

      const results = [];
      
      for (const data of dummyData) {
        const healthMetric = await storage.createHealthMetrics({
          userId,
          sleepQuality: data.sleepQuality,
          sleepDuration: data.sleepDuration,
          fatigueLevel: data.fatigueLevel,
          moodScore: data.moodScore,
          activitySteps: data.activitySteps,
        });

        const riskAssessment = await storage.createRiskAssessment({
          userId,
          healthMetricId: healthMetric.id,
          riskScore: data.riskScore,
          riskCategory: data.riskCategory,
          suggestion: data.suggestion,
          mlModelVersion: 'dummy-v1',
        });

        results.push({ healthMetric, riskAssessment });
      }

      res.json({ 
        message: 'Dummy data created successfully',
        count: results.length,
        data: results 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Function to call ML service
async function callMLService(metrics: any): Promise<{
  riskScore: number;
  riskCategory: string;
  suggestion: string;
  modelVersion: string;
}> {
  return new Promise((resolve, reject) => {
    const pythonScript = join(process.cwd(), 'server', 'ml-service.py');
    const python = spawn('python3', [pythonScript]);
    
    let dataString = '';
    let errorString = '';

    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ML service failed: ${errorString}`));
      } else {
        try {
          const result = JSON.parse(dataString.trim());
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse ML service response: ${dataString}`));
        }
      }
    });

    // Send metrics data to Python script
    python.stdin.write(JSON.stringify(metrics));
    python.stdin.end();
  });
}
