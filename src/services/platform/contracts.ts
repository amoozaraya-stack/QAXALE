/**
 * ORONID TECH Platform Contracts & Foundation
 * Standard interfaces and contracts for all modules across the ORONID TECH ecosystem.
 * Author: Hamza Yasin / ORONID TECH
 */

export type EcosystemPillar =
  | "core_intelligence" // QAXALE.AI
  | "language_infrastructure" // KILIMAANJAROO (Afaan Oromoo)
  | "learning_education" // Learning & Guided Courses
  | "agents_tools" // Extensible Agent & Tool Registry
  | "community_knowledge" // Collaborative Knowledge
  | "developer_platform" // Controlled APIs & Integration
  | "admin_ops" // Administration & Multi-Tenant Operations
  | "mobile_client"; // Cross-Platform Mobile Clients

export type ModuleStatus =
  | "unregistered"
  | "registered"
  | "initializing"
  | "active"
  | "degraded"
  | "disabled"
  | "error";

export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  pillar: EcosystemPillar;
  company: "ORONID TECH";
  author: string;
  tags: string[];
  capabilities: string[];
  documentationUrl?: string;
}

export interface ModuleHealthCheck {
  healthy: boolean;
  latencyMs: number;
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface PlatformInitContext {
  platformVersion: string;
  company: string;
  environment: "development" | "production" | "test";
  config: Record<string, any>;
}

export interface PlatformModule {
  metadata: ModuleMetadata;
  dependencies: string[];
  status: ModuleStatus;
  init(ctx: PlatformInitContext): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<ModuleHealthCheck>;
}

export interface RequestContext {
  traceId: string;
  tenantId: string;
  userId: string;
  locale: "om" | "en";
  authToken?: string;
  roles?: string[];
  timestamp: number;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    recoverable?: boolean;
  };
  metadata?: Record<string, any>;
  executionTimeMs: number;
}

export interface UsageRecord {
  metric: string;
  value: number;
  unit: string;
  tenantId: string;
  userId: string;
  timestamp: number;
  dimensions?: Record<string, string>;
}
