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
