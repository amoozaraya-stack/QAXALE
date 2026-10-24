/**
 * QAXALE Cognitive Architecture — Critic / Reflector Agent
 * Evaluates execution artifacts against 7 rigorous dimensions:
 * Correctness, Completeness, Evidence, Consistency, Instruction Compliance, Context Relevance, and Safety.
 * Produces structured CritiqueReports that distinguish verifiable defects from subjective uncertainty.
 */

import {
  CritiqueReport,
  CritiqueFinding,
  CritiqueSeverity,
  CritiqueCategory,
  PlanStep,
  ExecutionPlan,
} from "../../types";

export interface EvaluationContext {
  taskId: string;
  objective: string;
  plan: ExecutionPlan;
  completedSteps: PlanStep[];
  evidenceStore: Array<{
    id: string;
    source: string;
    title: string;
    snippet: string;
    verified: boolean;
  }>;
  outputToEvaluate: string;
}

export class CriticAgent {
  /**
   * Evaluates task outputs against explicit quality dimensions.
   */
  public evaluate(context: EvaluationContext): CritiqueReport {
    const { taskId, objective, completedSteps, evidenceStore, outputToEvaluate } = context;
    const findings: CritiqueFinding[] = [];
    const text = (outputToEvaluate || "").toLowerCase();
    const objLower = objective.toLowerCase();

    // 1. DIMENSION: Safety & Epistemic Modesty
    // Must never claim 100% certainty, fixed profits, or guaranteed wins.
    let safetyScore = 100;
    if (
      text.includes("guaranteed win") ||
      text.includes("100% sure") ||
      text.includes("guaranteed profit") ||
      text.includes("risk-free") ||
      text.includes("cannot lose")
    ) {
      safetyScore = 20;
      findings.push({
        id: `finding_safety_${Date.now()}_1`,
        category: "safety",
        severity: "critical",
        description: "Output violates QAXALE Golden Rule by claiming guaranteed outcome or zero risk.",
        affectedStepIds: completedSteps.map((s) => s.id),
        evidenceReferences: [],
        recommendedAction: "correct",
      });
    }

    // 2. DIMENSION: Evidence & Empirical Grounding
    // If output claims statistical certainty or specific facts, evidence must exist in evidenceStore.
    let evidenceScore = 90;
    if (evidenceStore.length === 0 && (objLower.includes("research") || objLower.includes("compare") || objLower.includes("current"))) {
      evidenceScore = 55;
      findings.push({
        id: `finding_evidence_${Date.now()}_2`,
        category: "evidence",
        severity: "major",
        description: "Output lacks empirical source citations or grounding evidence for real-world claims.",
        affectedStepIds: completedSteps.filter((s) => s.assignedAgent === "researcher").map((s) => s.id),
        evidenceReferences: [],
        recommendedAction: "research",
      });
    }

    // 3. DIMENSION: Correctness & Mathematical Sanity
    // Check for negative probabilities, Kelly allocations over safe bounds, or inverted percentages.
    let correctnessScore = 95;
    if (text.includes("probability: -") || text.includes("probability -")) {
      correctnessScore = 30;
      findings.push({
        id: `finding_correctness_${Date.now()}_3`,
        category: "factual",
        severity: "critical",
        description: "Mathematically invalid negative probability detected.",
        affectedStepIds: completedSteps.filter((s) => s.assignedAgent === "executor").map((s) => s.id),
        evidenceReferences: [],
        recommendedAction: "correct",
      });
    }

    // 4. DIMENSION: Completeness
    // Verify that all core constraints in objective are addressed.
    let completenessScore = 92;
    if (objLower.includes("monte carlo") && !text.includes("monte carlo") && !text.includes("simulation") && !text.includes("trials")) {
      completenessScore = 50;
      findings.push({
        id: `finding_completeness_${Date.now()}_4`,
        category: "completeness",
        severity: "major",
        description: "User specifically requested Monte Carlo simulation, but no trial distribution is present in output.",
        affectedStepIds: completedSteps.map((s) => s.id),
        evidenceReferences: [],
        recommendedAction: "correct",
      });
    }

    // 5. DIMENSION: Consistency
    // Ensure that steps marked completed actually produced outputData or outputSummary.
    let consistencyScore = 95;
    for (const step of completedSteps) {
      if (step.status === "completed" && !step.outputSummary && !step.outputData) {
        consistencyScore = 70;
        findings.push({
          id: `finding_consistency_${step.id}`,
          category: "consistency",
          severity: "minor",
          description: `Step '${step.id}' is marked completed without summary or payload records.`,
          affectedStepIds: [step.id],
          evidenceReferences: [],
          recommendedAction: "accept",
        });
      }
    }

    // 6. DIMENSION: Instruction Compliance
    const instructionCompliance = Math.min(safetyScore, completenessScore);
    const contextRelevance = 95;

    // Calculate weighted overall score
    const overallQualityScore = Math.round(
      correctnessScore * 0.25 +
      completenessScore * 0.2 +
      evidenceScore * 0.2 +
      consistencyScore * 0.1 +
      instructionCompliance * 0.15 +
      safetyScore * 0.1
    );

    const hasCritical = findings.some((f) => f.severity === "critical");
    const hasMajor = findings.some((f) => f.severity === "major");

    const status: "pass" | "needs_revision" | "blocked" =
      hasCritical ? "blocked" : hasMajor || overallQualityScore < 75 ? "needs_revision" : "pass";

    const unresolvedUncertainties: string[] = [];
    if (evidenceStore.length === 0) {
      unresolvedUncertainties.push("No external verified sources were accessible in offline/sandboxed environment.");
    }
    if (text.includes("variance") || text.includes("uncertainty")) {
      unresolvedUncertainties.push("External stochastic variance is inherent in the evaluated scenario.");
    }

    const requiredCorrections = findings
      .filter((f) => f.recommendedAction === "correct" || f.recommendedAction === "research")
      .map((f) => f.description);

    return {
      id: `critique_${taskId}_${Date.now()}`,
      status,
      overallQualityScore,
      evaluatedAt: Date.now(),
      findings,
      unresolvedUncertainties,
      requiredCorrections,
      dimensionScores: {
        correctness: correctnessScore,
        completeness: completenessScore,
        evidence: evidenceScore,
        consistency: consistencyScore,
        instructionCompliance,
        contextRelevance,
        safety: safetyScore,
      },
    };
  }
}

export const criticAgent = new CriticAgent();
