import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  healthMetrics, 
  riskAssessments,
  chatMessages,
  type User, 
  type InsertUser,
  type HealthMetrics,
  type InsertHealthMetrics,
  type RiskAssessment,
  type InsertRiskAssessment,
  type ChatMessage,
  type InsertChatMessage,
  type HealthMetricsWithRisk
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Health metrics methods
  createHealthMetrics(metrics: InsertHealthMetrics & { userId: string }): Promise<HealthMetrics>;
  getUserHealthMetrics(userId: string, limit?: number): Promise<HealthMetrics[]>;
  getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined>;
  
  // Risk assessment methods
  createRiskAssessment(assessment: InsertRiskAssessment & { userId: string; healthMetricId: string }): Promise<RiskAssessment>;
  getUserRiskHistory(userId: string, limit?: number): Promise<HealthMetricsWithRisk[]>;
  getLatestRiskAssessment(userId: string): Promise<RiskAssessment | undefined>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage & { userId: string }): Promise<ChatMessage>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async createHealthMetrics(metrics: InsertHealthMetrics & { userId: string }): Promise<HealthMetrics> {
    const result = await db.insert(healthMetrics).values(metrics).returning();
    return result[0];
  }

  async getUserHealthMetrics(userId: string, limit = 10): Promise<HealthMetrics[]> {
    return await db
      .select()
      .from(healthMetrics)
      .where(eq(healthMetrics.userId, userId))
      .orderBy(desc(healthMetrics.recordedAt))
      .limit(limit);
  }

  async getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined> {
    const result = await db
      .select()
      .from(healthMetrics)
      .where(eq(healthMetrics.userId, userId))
      .orderBy(desc(healthMetrics.recordedAt))
      .limit(1);
    return result[0];
  }

  async createRiskAssessment(assessment: InsertRiskAssessment & { userId: string; healthMetricId: string }): Promise<RiskAssessment> {
    const result = await db.insert(riskAssessments).values(assessment).returning();
    return result[0];
  }

  async getUserRiskHistory(userId: string, limit = 7): Promise<HealthMetricsWithRisk[]> {
    const results = await db
      .select({
        healthMetrics: healthMetrics,
        riskAssessment: riskAssessments,
      })
      .from(healthMetrics)
      .leftJoin(riskAssessments, eq(healthMetrics.id, riskAssessments.healthMetricId))
      .where(eq(healthMetrics.userId, userId))
      .orderBy(desc(healthMetrics.recordedAt))
      .limit(limit);

    return results.map(result => ({
      ...result.healthMetrics,
      riskAssessment: result.riskAssessment || undefined,
    }));
  }

  async getLatestRiskAssessment(userId: string): Promise<RiskAssessment | undefined> {
    const result = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.userId, userId))
      .orderBy(desc(riskAssessments.createdAt))
      .limit(1);
    return result[0];
  }

  async createChatMessage(message: InsertChatMessage & { userId: string }): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async getUserChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
