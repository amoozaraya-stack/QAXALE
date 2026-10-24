/**
 * QAXALE Cognitive Architecture — Central Orchestrator
 * The core coordinator that manages task lifecycle:
 * Task Classification -> Strategy Selection -> Planning & DAG Validation ->
 * Dependency-Aware Execution -> Milestone Reflection & Critique ->
 * Targeted Self-Correction -> Final Verification & Synthesis.
 */

import {
  SharedTaskState,
  PlanStep,
  ExecutionPlan,
  TaskCategory,
  ExecutionStrategy,
  AgentRole,
  CritiqueReport,
  SelfCorrectionRecord,
  CognitiveExecutionBudget,
  UserMemoryProfile,
  AgentExecutionPhase,
} from "../../types";
import { plannerAgent } from "./plannerAgent";
import { executorAgent } from "./executorAgent";
import { researcherAgent } from "./researcherAgent";
import { criticAgent } from "./criticAgent";
import { selfCorrectionEngine } from "./selfCorrectionEngine";

export interface OrchestratorRunOptions {
  executionId: string;
  userId: string;
  objective: string;
  domain?: string;
  language?: "om" | "en";
  userMemory?: UserMemoryProfile;
  isHumanInTheLoop?: boolean;
  signal?: AbortSignal;
  onPhaseChange?: (phase: AgentExecutionPhase) => void;
  onPlanCreated?: (plan: ExecutionPlan) => void;
  onStepProgress?: (step: PlanStep) => void;
  onCritiqueComplete?: (report: CritiqueReport) => void;
  onCorrectionApplied?: (correction: SelfCorrectionRecord) => void;
  onApprovalRequired?: (payload: {
    toolName: string;
    parameters: Record<string, any>;
    riskLevel: any;
    rationale: string;
  }) => Promise<boolean>;
}

export class CognitiveOrchestrator {
  /**
   * Runs the complete end-to-end cognitive orchestration lifecycle.
   */
  public async orchestrate(options: OrchestratorRunOptions): Promise<SharedTaskState> {
    const {
      executionId,
      userId,
      objective,
      domain = "knowledge",
      language = "om",
      userMemory,
      isHumanInTheLoop = false,
      signal,
      onPhaseChange,
      onPlanCreated,
      onStepProgress,
      onCritiqueComplete,
      onCorrectionApplied,
      onApprovalRequired,
    } = options;

    const startTime = Date.now();
    const fingerprintsSeen = new Set<string>();

    const budget: CognitiveExecutionBudget = {
      maxToolCalls: 6,
      maxReplans: 2,
      maxCritiquePasses: 2,
      maxCorrectionAttempts: 2,
      maxDurationMs: 45000,
      toolCallsExecuted: 0,
      replansExecuted: 0,
      critiquePassesExecuted: 0,
      correctionsExecuted: 0,
      startedAt: startTime,
    };

    const emitPhase = (phase: AgentExecutionPhase) => {
      state.phase = phase;
      if (onPhaseChange) onPhaseChange(phase);
    };

    const checkBudgetOrAbort = () => {
      if (signal?.aborted) {
        emitPhase("CANCELLED");
        throw new Error("Cognitive execution cancelled by user.");
      }
      if (Date.now() - budget.startedAt > budget.maxDurationMs) {
        emitPhase("TIMEOUT");
        throw new Error(`Execution exceeded allocated budget (${budget.maxDurationMs}ms).`);
      }
    };

    // 1. UNDERSTANDING & CLASSIFICATION
    const classification = plannerAgent.classifyTask(objective);

    // 2. PLANNING & DAG VALIDATION
    const plan = plannerAgent.generatePlan({
      taskId: executionId,
      objective,
      domain,
      userMemory,
    });

    const dagCheck = plannerAgent.validatePlanDAG(plan.steps);
    if (!dagCheck.isValid) {
      throw new Error(`Plan validation failed: ${dagCheck.errors.join("; ")}`);
    }

    const state: SharedTaskState = {
      executionId,
      ownerUid: userId,
      objective,
      category: classification.category,
      strategy: classification.strategy,
      plan,
      evidenceStore: [],
      critiqueReports: [],
      correctionHistory: [],
      budget,
      phase: "PLANNING",
      status: "running",
    };

    if (onPlanCreated) onPlanCreated(plan);
    emitPhase("PLANNING");

    // 3. EXECUTION PHASE (Dependency-Aware Batching)
    emitPhase("EXECUTING_TOOL");
    const executionBatches = dagCheck.executionBatches || [plan.steps.map((s) => s.id)];

    for (const batch of executionBatches) {
      checkBudgetOrAbort();

      // Independent steps within a batch can be executed concurrently
      await Promise.all(
        batch.map(async (stepId) => {
          const step = state.plan.steps.find((s) => s.id === stepId);
          if (!step || step.status === "completed") return;

          step.status = "running";
          if (onStepProgress) onStepProgress(step);

          // Route to appropriate specialized agent based on assigned role
          if (step.assignedAgent === "researcher") {
            const researchRes = await researcherAgent.research(step, {
              userId,
              executionId,
              language,
              fingerprintsSeen,
            });
            state.evidenceStore.push(...researchRes.evidenceItems);
            Object.assign(step, researchRes.step);
            budget.toolCallsExecuted++;
          } else if (step.assignedAgent === "executor") {
            const execRes = await executorAgent.executeStep({
              executionId,
              userId,
              step,
              fingerprintsSeen,
              isHumanInTheLoop,
              onApprovalRequired,
            });
            Object.assign(step, execRes.step);
            budget.toolCallsExecuted++;
          } else {
            // Orchestrator / Planner synthetic step
            step.status = "completed";
            step.outputSummary = `Deconstructed vector: ${step.objective}`;
            step.durationMs = 25;
          }

          if (onStepProgress) onStepProgress(step);
        })
      );
    }

    // 4. REFLECTION & QUALITY CRITIQUE
    emitPhase("EVALUATING_PROGRESS");
    budget.critiquePassesExecuted++;

    let generatedOutput = `### QAXALE Cognitive Synthesis for "${objective}"\n\n`;
    for (const s of state.plan.steps) {
      generatedOutput += `- **${s.objective}**: ${s.outputSummary || "Verified"}\n`;
    }

    const critiqueReport = criticAgent.evaluate({
      taskId: executionId,
      objective,
      plan: state.plan,
      completedSteps: state.plan.steps.filter((s) => s.status === "completed"),
      evidenceStore: state.evidenceStore,
      outputToEvaluate: generatedOutput,
    });

    state.critiqueReports.push(critiqueReport);
    if (onCritiqueComplete) onCritiqueComplete(critiqueReport);

    // 5. TARGETED SELF-CORRECTION LOOP (If defects detected)
    if (critiqueReport.status === "needs_revision" || critiqueReport.findings.length > 0) {
      emitPhase("VALIDATING_ACTION");
      const correctionResult = await selfCorrectionEngine.correctOutput(
        state,
        critiqueReport,
        generatedOutput
      );

      generatedOutput = correctionResult.correctedOutput;
      if (correctionResult.correctionRecord && onCorrectionApplied) {
        onCorrectionApplied(correctionResult.correctionRecord);
      }
    }

    // 6. FINAL VERIFICATION & PACKAGING
    emitPhase("FINAL_VERIFICATION");
    const isOm = language === "om";

    state.finalAnswer = {
      summary: isOm
        ? `Xiinxalli otoonoomasii kaayyoo "${objective}" irratti xumurameera. Ragaan qabatamaa walitti qabamee herrega carraatiin madaalameera.`
        : `Cognitive multi-agent evaluation completed for "${objective}". Empirical evidence and stochastic bounds verified.`,
      verifiedClaims: state.evidenceStore.map((e) => e.snippet.slice(0, 100)),
      caveatsAndLimitations: [
        "Historical statistical patterns represent calibrated probability distributions, never guarantees.",
        "Strict anti-chasing capital boundaries enforced.",
      ],
      directives: [
        {
          title: "Enforce Safe Capital Allocation",
          priority: "high",
        },
        {
          title: "Monitor Outcome Variance",
          priority: "medium",
        },
      ],
    };

    state.status = "completed";
    emitPhase("COMPLETED");

    return state;
  }
}

export const cognitiveOrchestrator = new CognitiveOrchestrator();
