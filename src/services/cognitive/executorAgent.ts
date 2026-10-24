/**
 * QAXALE Cognitive Architecture — Executor Agent
 * Carries out assigned execution steps through the trusted tool execution pipeline.
 * Strictly respects tool risk levels, approval requirements, and parameter contracts.
 */

import {
  PlanStep,
  NormalizedToolResult,
  AgentHandoff,
} from "../../types";
import { executeToolSafely, ToolExecutionContext } from "../toolRegistry";

export interface ExecutorTaskContext {
  executionId: string;
  userId: string;
  step: PlanStep;
  fingerprintsSeen?: Set<string>;
  isHumanInTheLoop?: boolean;
  onApprovalRequired?: (payload: {
    toolName: string;
    parameters: Record<string, any>;
    riskLevel: any;
    rationale: string;
  }) => Promise<boolean>;
}

export class ExecutorAgent {
  /**
   * Executes a single assigned plan step using the central validated tool registry.
   */
  public async executeStep(
    taskContext: ExecutorTaskContext
  ): Promise<{
    step: PlanStep;
    result: NormalizedToolResult;
  }> {
    const { executionId, userId, step, fingerprintsSeen, isHumanInTheLoop, onApprovalRequired } = taskContext;
    const startTime = Date.now();

    const toolName = step.requiredCapabilities[0] || "system_diagnostics";

    const toolContext: ToolExecutionContext = {
      userId,
      missionId: executionId,
      fingerprintsSeen,
      isHumanInTheLoop,
      onApprovalRequired,
    };

    // Determine parameters based on step objective
    const params: Record<string, any> = {};
    if (toolName === "monte_carlo") {
      params.trials = 10000;
      params.winRate = 0.54;
      params.initialBankroll = 1000;
    } else if (toolName === "odds_probability") {
      params.oddsFormat = "decimal";
      params.odds1 = 2.1;
      params.odds2 = 3.2;
    } else if (toolName === "connectors_webhook") {
      params.url = "https://api.qaxale.internal/hook";
      params.method = "POST";
      params.payload = { objective: step.objective };
    }

    const toolResult = await executeToolSafely(toolName, params, toolContext);
    const durationMs = Date.now() - startTime;

    const isSuccess = toolResult.status === "success";
    const updatedStep: PlanStep = {
      ...step,
      status: isSuccess ? "completed" : toolResult.status === "denied" ? "blocked" : "failed",
      outputSummary: toolResult.data
        ? `Executed ${toolName} safely: ${JSON.stringify(toolResult.data).slice(0, 150)}...`
        : toolResult.error?.message || "Execution completed.",
      outputData: toolResult.data,
      error: toolResult.error?.message,
      durationMs,
      evidenceReferences: toolResult.metadata.fingerprint ? [toolResult.metadata.fingerprint] : [],
    };

    return {
      step: updatedStep,
      result: toolResult,
    };
  }
}

export const executorAgent = new ExecutorAgent();
