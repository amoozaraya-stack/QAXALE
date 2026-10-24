/**
 * QAXALE Autonomous Agent & Cognitive Architecture
 * Product of ORONID TECH Company (Directed by Hamza Yasin)
 *
 * Central Multi-Agent Task Orchestrator & Execution Foundation
 * Provides strongly-typed context, execution boundaries, budget controls,
 * and result contracts across all ORONID TECH specialized agents.
 */

import {
  AgentRole,
  AgentHandoff,
  SharedTaskState,
  CognitiveExecutionBudget,
  UserMemoryProfile,
  AgentExecutionPhase,
  ExecutionPlan,
  PlanStep,
  CritiqueReport,
  SelfCorrectionRecord,
} from "../types";
import { cognitiveOrchestrator, OrchestratorRunOptions } from "./cognitive/orchestrator";

// =========================================================================
// 1. ORONID TECH Platform Identifiers
// =========================================================================
export const PLATFORM_COMPANY = "ORONID TECH";
export const PLATFORM_PRODUCT = "QAXALE";
export const PLATFORM_VERSION = "3.2.0";
export const PLATFORM_ECOSYSTEM = "ORONID TECH Cognitive Intelligence Ecosystem";

// =========================================================================
// 2. Core Typed Contracts for Multi-Agent Task Management
// =========================================================================

/**
 * Execution budget and resource bounds for an agent task.
 */
export interface AgentBudget {
  maxTokens?: number;
  maxToolCalls: number;
  maxDurationMs: number;
  maxReplans?: number;
  maxCorrections?: number;
  toolCallsExecuted: number;
  startedAt: number;
}

/**
 * Standardized error structure for agentic failures.
 */
export interface AgentError {
  code: string;
  message: string;
  recoverable: boolean;
  suggestedAction?: "retry" | "replan" | "fallback" | "abort";
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Verified evidence reference supporting an agent's conclusion.
 */
export interface EvidenceReference {
  id: string;
  source: string;
  title: string;
  snippet: string;
  verified: boolean;
  timestamp: number;
  confidenceScore?: number;
}

/**
 * Resource utilization statistics for an agent invocation.
 */
export interface AgentUsage {
  totalToolCalls: number;
  durationMs: number;
  tokensUsed?: number;
  modelsInvoked?: string[];
  replansTriggered?: number;
  correctionsApplied?: number;
}

/**
 * Complete runtime invocation context passed to an executing agent.
 * Guarantees tenant isolation, resource limits, and task lineage.
 */
export interface AgentInvocationContext {
  taskId: string;
  parentTaskId?: string;
  executionId: string;
  userId: string;
  tenantId?: string; // ORONID TECH multi-tenant identifier
  role: AgentRole;
  budget: AgentBudget;
  availableTools: string[];
  provenanceChain: string[];
  metadata?: Record<string, any>;
  signal?: AbortSignal;
  timestamp: number;
}

/**
 * Typed execution result returned by every agent in the ORONID TECH ecosystem.
 */
export interface AgentResult<T = any> {
  success: boolean;
  taskId: string;
  role: AgentRole;
  data?: T;
  error?: AgentError;
  usage: AgentUsage;
  evidence: EvidenceReference[];
  handoff?: AgentHandoff;
  executionDurationMs: number;
  completedAt: number;
  provenance: {
    platform: string;
    company: string;
    version: string;
  };
}

// =========================================================================
// 3. Central Multi-Agent Orchestrator Implementation
// =========================================================================

export class MultiAgentOrchestrator {
  private static instance: MultiAgentOrchestrator;

  private constructor() {}

  public static getInstance(): MultiAgentOrchestrator {
    if (!MultiAgentOrchestrator.instance) {
      MultiAgentOrchestrator.instance = new MultiAgentOrchestrator();
    }
    return MultiAgentOrchestrator.instance;
  }

  /**
   * Creates a default bound budget for an agent task.
   */
  public createDefaultBudget(overrides?: Partial<AgentBudget>): AgentBudget {
    return {
      maxToolCalls: overrides?.maxToolCalls ?? 8,
      maxDurationMs: overrides?.maxDurationMs ?? 60000,
      maxReplans: overrides?.maxReplans ?? 2,
      maxCorrections: overrides?.maxCorrections ?? 2,
      toolCallsExecuted: 0,
      startedAt: Date.now(),
      ...overrides,
    };
  }

  /**
   * Creates a root invocation context for a new task.
   */
  public createContext(params: {
    taskId?: string;
    executionId?: string;
    userId: string;
    tenantId?: string;
    role: AgentRole;
    budget?: Partial<AgentBudget>;
    availableTools?: string[];
    metadata?: Record<string, any>;
    signal?: AbortSignal;
  }): AgentInvocationContext {
    const timestamp = Date.now();
    return {
      taskId: params.taskId || `task_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
      executionId: params.executionId || `exec_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      tenantId: params.tenantId || "oronid-default",
      role: params.role,
      budget: this.createDefaultBudget(params.budget),
      availableTools: params.availableTools || [],
      provenanceChain: [`root:${params.role}`],
      metadata: params.metadata || {},
      signal: params.signal,
      timestamp,
    };
  }

  /**
   * Executes an isolated agent task within strict budget and error boundaries.
   */
  public async executeAgentTask<T>(
    context: AgentInvocationContext,
    taskFn: (ctx: AgentInvocationContext) => Promise<T>
  ): Promise<AgentResult<T>> {
    const startTime = Date.now();
    const evidenceList: EvidenceReference[] = [];

    // Check pre-flight budget and signal
    if (context.signal?.aborted) {
      return {
        success: false,
        taskId: context.taskId,
        role: context.role,
        error: {
          code: "TASK_ABORTED",
          message: "Task was aborted prior to execution",
          recoverable: false,
          suggestedAction: "abort",
          timestamp: Date.now(),
        },
        usage: {
          totalToolCalls: context.budget.toolCallsExecuted,
          durationMs: Date.now() - startTime,
        },
        evidence: [],
        executionDurationMs: Date.now() - startTime,
        completedAt: Date.now(),
        provenance: {
          platform: PLATFORM_PRODUCT,
          company: PLATFORM_COMPANY,
          version: PLATFORM_VERSION,
        },
      };
    }

    let timeoutTimer: NodeJS.Timeout | undefined;
    try {
      // Execute the task with enforced timeout
      const executionPromise = taskFn(context);
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          reject(new Error(`Agent execution timeout exceeded (${context.budget.maxDurationMs}ms)`));
        }, context.budget.maxDurationMs);
      });

      const data = await Promise.race([executionPromise, timeoutPromise]);
      const durationMs = Date.now() - startTime;

      return {
        success: true,
        taskId: context.taskId,
        role: context.role,
        data,
        usage: {
          totalToolCalls: context.budget.toolCallsExecuted,
          durationMs,
        },
        evidence: evidenceList,
        executionDurationMs: durationMs,
        completedAt: Date.now(),
        provenance: {
          platform: PLATFORM_PRODUCT,
          company: PLATFORM_COMPANY,
          version: PLATFORM_VERSION,
        },
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const isTimeout = err?.message?.includes("timeout exceeded");

      return {
        success: false,
        taskId: context.taskId,
        role: context.role,
        error: {
          code: isTimeout ? "BUDGET_TIMEOUT_EXCEEDED" : "AGENT_EXECUTION_ERROR",
          message: err?.message || "Unknown error during agent task execution",
          recoverable: !isTimeout,
          suggestedAction: isTimeout ? "replan" : "fallback",
          details: { originalError: String(err) },
          timestamp: Date.now(),
        },
        usage: {
          totalToolCalls: context.budget.toolCallsExecuted,
          durationMs,
        },
        evidence: evidenceList,
        executionDurationMs: durationMs,
        completedAt: Date.now(),
        provenance: {
          platform: PLATFORM_PRODUCT,
          company: PLATFORM_COMPANY,
          version: PLATFORM_VERSION,
        },
      };
    } finally {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    }
  }

  /**
   * Delegates a subtask to a specialized agent role, preserving lineage and remaining budget.
   */
  public async delegateSubtask<T>(
    parentContext: AgentInvocationContext,
    targetRole: AgentRole,
    subtaskName: string,
    subtaskFn: (subCtx: AgentInvocationContext) => Promise<T>
  ): Promise<AgentResult<T>> {
    const elapsedParentMs = Date.now() - parentContext.budget.startedAt;
    const remainingMs = Math.max(1000, parentContext.budget.maxDurationMs - elapsedParentMs);
    const remainingTools = Math.max(0, parentContext.budget.maxToolCalls - parentContext.budget.toolCallsExecuted);

    const childBudget: AgentBudget = {
      maxToolCalls: remainingTools,
      maxDurationMs: remainingMs,
      maxReplans: parentContext.budget.maxReplans,
      maxCorrections: parentContext.budget.maxCorrections,
      toolCallsExecuted: 0,
      startedAt: Date.now(),
    };

    const childContext: AgentInvocationContext = {
      taskId: `${parentContext.taskId}_sub_${targetRole}_${Date.now().toString(36)}`,
      parentTaskId: parentContext.taskId,
      executionId: parentContext.executionId,
      userId: parentContext.userId,
      tenantId: parentContext.tenantId,
      role: targetRole,
      budget: childBudget,
      availableTools: [...parentContext.availableTools],
      provenanceChain: [...parentContext.provenanceChain, `${targetRole}:${subtaskName}`],
      metadata: { ...parentContext.metadata, subtaskName },
      signal: parentContext.signal,
      timestamp: Date.now(),
    };

    const result = await this.executeAgentTask(childContext, subtaskFn);

    // Propagate child tool calls back to parent budget tracking
    parentContext.budget.toolCallsExecuted += result.usage.totalToolCalls;

    return result;
  }

  /**
   * Aggregates multiple subtask results into a unified outcome.
   */
  public aggregateResults<T>(results: AgentResult<T>[]): {
    allSuccess: boolean;
    data: T[];
    failedTasks: Array<{ taskId: string; role: AgentRole; error?: AgentError }>;
    totalDurationMs: number;
    totalToolCalls: number;
    combinedEvidence: EvidenceReference[];
  } {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return {
      allSuccess: failed.length === 0,
      data: successful.map((r) => r.data!).filter(Boolean),
      failedTasks: failed.map((r) => ({
        taskId: r.taskId,
        role: r.role,
        error: r.error,
      })),
      totalDurationMs: results.reduce((acc, r) => acc + r.executionDurationMs, 0),
      totalToolCalls: results.reduce((acc, r) => acc + r.usage.totalToolCalls, 0),
      combinedEvidence: results.flatMap((r) => r.evidence),
    };
  }

  /**
   * Direct bridge to the QAXALE Central Cognitive Orchestrator for full-lifecycle tasks.
   */
  public async orchestrateCognitiveTask(options: OrchestratorRunOptions): Promise<SharedTaskState> {
    return cognitiveOrchestrator.orchestrate(options);
  }
}

export const multiAgentOrchestrator = MultiAgentOrchestrator.getInstance();
