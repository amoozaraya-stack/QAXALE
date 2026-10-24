/**
 * QAXALE Cognitive Architecture — Planner Agent
 * Responsible for task classification, strategy selection, structured DAG plan generation,
 * capability verification, and bounded adaptive replanning.
 */

import {
  ExecutionPlan,
  PlanStep,
  TaskCategory,
  ExecutionStrategy,
  AgentRole,
  ToolRiskLevel,
  UserMemoryProfile,
} from "../../types";
import { toolRegistry } from "../toolRegistry";

export interface PlannerInput {
  taskId: string;
  objective: string;
  domain?: string;
  userMemory?: UserMemoryProfile;
  availableCapabilities?: string[];
  maxSteps?: number;
  existingPlan?: ExecutionPlan;
  replanReason?: string;
}

export interface DAGValidationResult {
  isValid: boolean;
  errors: string[];
  executionBatches?: string[][]; // steps that can be run concurrently in order
}

export class PlannerAgent {
  /**
   * 1. Task Classification
   * Categorizes the user's objective into an operational task archetype.
   */
  public classifyTask(objective: string): {
    category: TaskCategory;
    strategy: ExecutionStrategy;
    rationale: string;
  } {
    const text = objective.toLowerCase();

    // Check for consequential actions (webhooks, external exports, high-risk mutations)
    if (
      text.includes("webhook") ||
      text.includes("dispatch to url") ||
      text.includes("send post request") ||
      text.includes("export to external")
    ) {
      return {
        category: "consequential_action",
        strategy: "hierarchical",
        rationale: "Task involves external mutation or webhook dispatch requiring strict verification & approval.",
      };
    }

    // Check for document analysis
    if (
      text.includes("analyze document") ||
      text.includes("extract from text") ||
      text.includes("summarize file") ||
      text.includes("pdf") ||
      text.includes("contract")
    ) {
      return {
        category: "document_analysis",
        strategy: "lightweight",
        rationale: "Unstructured document analysis requiring critical extraction and synthesis.",
      };
    }

    // Check for research-heavy objectives
    if (
      text.includes("deep research") ||
      text.includes("compare sources") ||
      text.includes("state of the art") ||
      text.includes("investigate") ||
      text.includes("market trends") ||
      text.includes("qorannoo")
    ) {
      return {
        category: "research_intensive",
        strategy: "hierarchical",
        rationale: "Requires multi-source empirical retrieval, cross-referencing, and factual grounding.",
      };
    }

    // Check for mathematical or probabilistic simulation
    if (
      text.includes("monte carlo") ||
      text.includes("ruin probability") ||
      text.includes("kelly criterion") ||
      text.includes("odds") ||
      text.includes("herrega carraa")
    ) {
      return {
        category: "multi_step",
        strategy: "hierarchical",
        rationale: "Requires stochastic trial simulation, mathematical bounds, and epistemic auditing.",
      };
    }

    // Check for simple questions or conversational statements
    if (
      objective.trim().length < 40 &&
      !text.includes("calculate") &&
      !text.includes("simulate") &&
      !text.includes("execute")
    ) {
      return {
        category: "conversational",
        strategy: "direct",
        rationale: "Simple informational query suitable for direct execution without decomposition overhead.",
      };
    }

    return {
      category: "multi_step",
      strategy: "lightweight",
      rationale: "Multi-factor objective benefiting from step decomposition and verification.",
    };
  }

  /**
   * 2. Dependency Graph (DAG) Validation & Cycle Detection
   * Ensures the plan forms a Directed Acyclic Graph with zero circular dependencies.
   */
  public validatePlanDAG(steps: PlanStep[]): DAGValidationResult {
    const errors: string[] = [];
    const stepMap = new Map<string, PlanStep>();
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const step of steps) {
      if (stepMap.has(step.id)) {
        errors.push(`Duplicate step ID detected: '${step.id}'`);
      }
      stepMap.set(step.id, step);
      inDegree.set(step.id, 0);
      adjList.set(step.id, []);
    }

    // Build graph and check dependency validity
    for (const step of steps) {
      for (const depId of step.dependencies) {
        if (!stepMap.has(depId)) {
          errors.push(`Step '${step.id}' depends on non-existent step '${depId}'.`);
          continue;
        }
        if (depId === step.id) {
          errors.push(`Step '${step.id}' cannot depend on itself.`);
          continue;
        }
        adjList.get(depId)!.push(step.id);
        inDegree.set(step.id, (inDegree.get(step.id) || 0) + 1);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Kahn's algorithm for topological sorting and cycle detection
    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const batches: string[][] = [];
    let visitedCount = 0;

    let currentBatch = [...queue];
    while (currentBatch.length > 0) {
      batches.push(currentBatch);
      const nextBatch: string[] = [];

      for (const nodeId of currentBatch) {
        visitedCount++;
        for (const neighbor of adjList.get(nodeId) || []) {
          const newDeg = (inDegree.get(neighbor) || 0) - 1;
          inDegree.set(neighbor, newDeg);
          if (newDeg === 0) {
            nextBatch.push(neighbor);
          }
        }
      }
      currentBatch = nextBatch;
    }

    if (visitedCount !== steps.length) {
      errors.push("Circular dependency cycle detected in plan steps graph.");
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      executionBatches: batches,
    };
  }

  /**
   * 3. Structured Plan Generation
   * Builds an actionable ExecutionPlan tailored to available capabilities.
   */
  public generatePlan(input: PlannerInput): ExecutionPlan {
    const { taskId, objective, existingPlan, replanReason } = input;
    const classification = this.classifyTask(objective);
    const availableToolNames = new Set(toolRegistry.listTools().map((t) => t.name));

    const version = existingPlan ? existingPlan.version + 1 : 1;
    const planId = `plan_${taskId}_v${version}`;

    // If replanning, preserve completed valid steps!
    if (existingPlan && existingPlan.steps) {
      const preservedSteps = existingPlan.steps
        .filter((s) => s.status === "completed")
        .map((s) => ({ ...s }));

      const nextIndex = preservedSteps.length + 1;
      const correctiveSteps: PlanStep[] = [
        {
          id: `step_${taskId}_correction_${nextIndex}`,
          stepIndex: nextIndex,
          objective: `Re-evaluate and adapt: ${replanReason || "Alternative execution vector"}`,
          dependencies: preservedSteps.map((s) => s.id),
          requiredCapabilities: ["web_grounding"],
          assignedAgent: "executor" as AgentRole,
          expectedOutput: "Empirical verification under revised constraints.",
          completionCriteria: ["Alternative empirical evidence confirmed."],
          riskLevel: "low" as ToolRiskLevel,
          requiresApproval: false,
          status: "ready",
        },
        {
          id: `step_${taskId}_synthesis_${nextIndex + 1}`,
          stepIndex: nextIndex + 1,
          objective: "Synthesize adjusted findings and verify completeness.",
          dependencies: [`step_${taskId}_correction_${nextIndex}`],
          requiredCapabilities: ["system_architect"],
          assignedAgent: "critic" as AgentRole,
          expectedOutput: "Updated final synthesis with preserved prior evidence.",
          completionCriteria: ["All acceptance criteria satisfied."],
          riskLevel: "low" as ToolRiskLevel,
          requiresApproval: false,
          status: "pending",
        },
      ];

      return {
        id: planId,
        version,
        taskId,
        objective,
        strategy: existingPlan.strategy,
        successCriteria: existingPlan.successCriteria,
        steps: [...preservedSteps, ...correctiveSteps],
        createdAt: existingPlan.createdAt,
        updatedAt: Date.now(),
        status: "approved",
      };
    }

    // Strategy A: Direct Execution (No complex decomposition needed)
    if (classification.strategy === "direct") {
      const step: PlanStep = {
        id: `step_${taskId}_direct_1`,
        stepIndex: 1,
        objective: `Provide direct answer for: "${objective.slice(0, 50)}"`,
        dependencies: [],
        requiredCapabilities: [],
        assignedAgent: "executor",
        expectedOutput: "Direct factual response.",
        completionCriteria: ["Factual accuracy", "Clear explanation"],
        riskLevel: "low",
        requiresApproval: false,
        status: "ready",
      };

      return {
        id: planId,
        version: 1,
        taskId,
        objective,
        strategy: "direct",
        successCriteria: ["Directly answers user query accurately."],
        steps: [step],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "approved",
      };
    }

    // Strategy B: Lightweight Planning
    if (classification.strategy === "lightweight") {
      const steps: PlanStep[] = [
        {
          id: `step_${taskId}_lw_1`,
          stepIndex: 1,
          objective: `Gather factual context and evidence for "${objective.slice(0, 40)}"`,
          dependencies: [],
          requiredCapabilities: availableToolNames.has("web_grounding") ? ["web_grounding"] : [],
          assignedAgent: "researcher",
          expectedOutput: "Verified empirical context baseline.",
          completionCriteria: ["At least 1 reliable source or grounded observation retrieved."],
          riskLevel: "low",
          requiresApproval: false,
          status: "ready",
        },
        {
          id: `step_${taskId}_lw_2`,
          stepIndex: 2,
          objective: `Synthesize, evaluate, and produce verified outcome`,
          dependencies: [`step_${taskId}_lw_1`],
          requiredCapabilities: [],
          assignedAgent: "executor",
          expectedOutput: "Structured response satisfying user objective.",
          completionCriteria: ["Output directly addresses objective with supporting evidence."],
          riskLevel: "low",
          requiresApproval: false,
          status: "pending",
        },
      ];

      return {
        id: planId,
        version: 1,
        taskId,
        objective,
        strategy: "lightweight",
        successCriteria: ["Grounded empirical facts", "Deliverable complete"],
        steps,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "approved",
      };
    }

    // Strategy C: Hierarchical Planning (Complex, Probabilistic, or Research Intensive)
    const isConsequential = classification.category === "consequential_action";
    const isMathProb = classification.category === "multi_step" && objective.toLowerCase().includes("monte carlo");

    const steps: PlanStep[] = [
      {
        id: `step_${taskId}_hier_1`,
        stepIndex: 1,
        objective: "Perception & Objective Decomposition into Verification Vectors",
        dependencies: [],
        requiredCapabilities: ["system_architect"],
        assignedAgent: "planner",
        expectedOutput: "Structured analysis vectors and constraint boundaries.",
        completionCriteria: ["Problem bounds, metrics, and parameters defined."],
        riskLevel: "low",
        requiresApproval: false,
        status: "ready",
      },
      {
        id: `step_${taskId}_hier_2`,
        stepIndex: 2,
        objective: "Empirical Grounding & Research Retrieval",
        dependencies: [`step_${taskId}_hier_1`],
        requiredCapabilities: ["web_grounding"],
        assignedAgent: "researcher",
        expectedOutput: "Verified facts separated from ungrounded assumptions.",
        completionCriteria: ["Empirical sources retrieved and fact-checked."],
        riskLevel: "low",
        requiresApproval: false,
        status: "pending",
      },
      {
        id: `step_${taskId}_hier_3`,
        stepIndex: 3,
        objective: isMathProb
          ? "Stochastic Simulation & Kelly Capital Preservations (10,000 trials)"
          : isConsequential
          ? "Consequential Action Preparation & Security Audit"
          : "Deterministic Quantitative Analysis",
        dependencies: [`step_${taskId}_hier_2`],
        requiredCapabilities: isMathProb ? ["monte_carlo"] : isConsequential ? ["connectors_webhook"] : ["odds_probability"],
        assignedAgent: "executor",
        expectedOutput: isMathProb ? "Ruin probabilities and Value at Risk bounds." : "Verified computational data payload.",
        completionCriteria: ["Deterministic output with zero hallucinated certainty."],
        riskLevel: isConsequential ? "high" : "low",
        requiresApproval: isConsequential,
        status: "pending",
      },
      {
        id: `step_${taskId}_hier_4`,
        stepIndex: 4,
        objective: "Multi-Agent Triad Consensus & Epistemic Audit",
        dependencies: [`step_${taskId}_hier_3`],
        requiredCapabilities: ["multi_agent_council"],
        assignedAgent: "critic",
        expectedOutput: "Formal critique report checking facts, safety, and guardrails.",
        completionCriteria: ["Critique report passing quality thresholds."],
        riskLevel: "low",
        requiresApproval: false,
        status: "pending",
      },
      {
        id: `step_${taskId}_hier_5`,
        stepIndex: 5,
        objective: "Final Executive Dossier & Bilingual Actionable Directives",
        dependencies: [`step_${taskId}_hier_4`],
        requiredCapabilities: ["system_architect"],
        assignedAgent: "orchestrator",
        expectedOutput: "Complete verified response with provenance and risk limits.",
        completionCriteria: ["Executive summary and guardrails delivered in Afaan Oromoo / English."],
        riskLevel: "low",
        requiresApproval: false,
        status: "pending",
      },
    ];

    return {
      id: planId,
      version: 1,
      taskId,
      objective,
      strategy: "hierarchical",
      successCriteria: [
        "Rigorous empirical grounding",
        "Deterministic variance bounds",
        "Triad critique pass",
        "Cultural and linguistic accuracy (Afaan Oromoo & English)",
      ],
      steps,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "approved",
    };
  }
}

export const plannerAgent = new PlannerAgent();
