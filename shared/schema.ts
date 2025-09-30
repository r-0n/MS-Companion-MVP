import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sleepQuality: integer("sleep_quality").notNull(), // 1-5 scale
  sleepDuration: real("sleep_duration").notNull(), // hours
  fatigueLevel: integer("fatigue_level").notNull(), // 1-5 scale
  moodScore: integer("mood_score").notNull(), // 1-5 scale
  activitySteps: integer("activity_steps").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  healthMetricId: varchar("health_metric_id").notNull().references(() => healthMetrics.id, { onDelete: "cascade" }),
  riskScore: real("risk_score").notNull(), // 0-100
  riskCategory: text("risk_category").notNull(), // Low, Medium, High
  suggestion: text("suggestion").notNull(),
  mlModelVersion: text("ml_model_version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  name: true,
});

export const insertHealthMetricsSchema = createInsertSchema(healthMetrics).pick({
  sleepQuality: true,
  sleepDuration: true,
  fatigueLevel: true,
  moodScore: true,
  activitySteps: true,
}).extend({
  sleepQuality: z.number().min(1).max(5),
  sleepDuration: z.number().min(1).max(12),
  fatigueLevel: z.number().min(1).max(5),
  moodScore: z.number().min(1).max(5),
  activitySteps: z.number().min(0),
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).pick({
  riskScore: true,
  riskCategory: true,
  suggestion: true,
  mlModelVersion: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHealthMetrics = z.infer<typeof insertHealthMetricsSchema>;
export type HealthMetrics = typeof healthMetrics.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;

export type HealthMetricsWithRisk = HealthMetrics & {
  riskAssessment?: RiskAssessment;
};
