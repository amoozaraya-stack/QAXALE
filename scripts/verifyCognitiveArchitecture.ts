/**
 * QAXALE Cognitive Architecture — Automated Verification Test Suite
 * Master Engineering Specification Acceptance Test
 */

import { plannerAgent } from "../src/services/cognitive/plannerAgent";
import { criticAgent } from "../src/services/cognitive/criticAgent";
import { selfCorrectionEngine } from "../src/services/cognitive/selfCorrectionEngine";
import { researcherAgent } from "../src/services/cognitive/researcherAgent";
import { executorAgent } from "../src/services/cognitive/executorAgent";
import { cognitiveOrchestrator } from "../src/services/cognitive/orchestrator";
import { PlanStep, ExecutionPlan, SharedTaskState } from "../src/types";

async function runCognitiveTestSuite() {
  console.log("==================================================================");
  console.log("   QAXALE ADVANCED COGNITIVE ARCHITECTURE TEST SUITE");
  console.log("   Planning, Reflection, Self-Correction & Multi-Agent Orchestration");
  console.log("==================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 1. Planner: Adaptive Task Classification & Strategy Selection
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing Planner: Task Classification & Strategy Selection ---");

  const c1 = plannerAgent.classifyTask("What is probability in Afaan Oromoo?");
  assert(c1.category === "conversational", "Short simple query classified as conversational");
  assert(c1.strategy === "direct", "Conversational task selects direct execution strategy");

  const c2 = plannerAgent.classifyTask("Execute 10,000 Monte Carlo trials to compute ruin probability and Half-Kelly bounds.");
  assert(c2.category === "multi_step", "Monte Carlo objective classified as multi_step");
  assert(c2.strategy === "hierarchical", "Monte Carlo task selects hierarchical strategy");

  const c3 = plannerAgent.classifyTask("Conduct deep research and compare state of the art transformer models.");
  assert(c3.category === "research_intensive", "Research query classified as research_intensive");
  assert(c3.strategy === "hierarchical", "Research task selects hierarchical strategy");

  const c4 = plannerAgent.classifyTask("Dispatch payload to external webhook URL https://api.partner.com");
  assert(c4.category === "consequential_action", "External webhook classified as consequential_action");

  // -------------------------------------------------------------------------
  // 2. Planner: DAG Dependency Validation & Cycle Rejection
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing Planner: DAG Dependency Validation & Cycle Rejection ---");

  // Valid linear DAG: step 1 -> step 2 -> step 3
  const validSteps: PlanStep[] = [
    {
      id: "step_1",
      stepIndex: 1,
      objective: "Decompose problem",
      dependencies: [],
      requiredCapabilities: [],
      assignedAgent: "planner",
      expectedOutput: "Vectors",
      completionCriteria: ["Done"],
      riskLevel: "low",
      requiresApproval: false,
      status: "ready",
    },
    {
      id: "step_2",
      stepIndex: 2,
      objective: "Gather evidence",
      dependencies: ["step_1"],
      requiredCapabilities: ["web_grounding"],
      assignedAgent: "researcher",
      expectedOutput: "Evidence",
      completionCriteria: ["Done"],
      riskLevel: "low",
      requiresApproval: false,
      status: "pending",
    },
    {
      id: "step_3",
      stepIndex: 3,
      objective: "Synthesize",
      dependencies: ["step_2"],
      requiredCapabilities: [],
      assignedAgent: "executor",
      expectedOutput: "Result",
      completionCriteria: ["Done"],
      riskLevel: "low",
      requiresApproval: false,
      status: "pending",
    },
  ];

  const validDAG = plannerAgent.validatePlanDAG(validSteps);
  assert(validDAG.isValid, "Linear dependency graph must validate as valid DAG");
  assert(
    validDAG.executionBatches !== undefined && validDAG.executionBatches.length === 3,
    "Valid DAG must produce topological execution batches"
  );

  // Invalid cyclic graph: A -> B -> C -> A
  const cyclicSteps: PlanStep[] = [
    {
      ...validSteps[0],
      id: "cycle_A",
      dependencies: ["cycle_C"],
    },
    {
      ...validSteps[1],
      id: "cycle_B",
      dependencies: ["cycle_A"],
    },
    {
      ...validSteps[2],
      id: "cycle_C",
      dependencies: ["cycle_B"],
    },
  ];

  const cyclicDAG = plannerAgent.validatePlanDAG(cyclicSteps);
  assert(!cyclicDAG.isValid, "Cyclic dependency graph must fail DAG validation");
  assert(
    cyclicDAG.errors.some((e) => e.includes("cycle") || e.includes("Circular")),
    "Validation error must explicitly flag circular dependency cycle"
  );

  // Self-dependency: A -> A
  const selfDepSteps: PlanStep[] = [
    {
      ...validSteps[0],
      id: "self_A",
      dependencies: ["self_A"],
    },
  ];
  const selfDAG = plannerAgent.validatePlanDAG(selfDepSteps);
  assert(!selfDAG.isValid, "Self-dependency must fail validation");

  // -------------------------------------------------------------------------
  // 3. Planner: Bounded Adaptive Replanning with Result Preservation
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Planner: Adaptive Replanning & Progress Preservation ---");

  const initialPlan = plannerAgent.generatePlan({
    taskId: "task_replan_test",
    objective: "Execute comprehensive risk audit",
  });
  assert(initialPlan.version === 1, "Initial plan version should be 1");

  // Simulate completing step 1
  initialPlan.steps[0].status = "completed";
  initialPlan.steps[0].outputSummary = "Step 1 decomposed parameters verified.";

  const revisedPlan = plannerAgent.generatePlan({
    taskId: "task_replan_test",
    objective: "Execute comprehensive risk audit",
    existingPlan: initialPlan,
    replanReason: "External data source timeout",
  });

  assert(revisedPlan.version === 2, `Replanned version must increment (got: ${revisedPlan.version})`);
  assert(
    revisedPlan.steps[0].status === "completed",
    "Completed step from version 1 must be preserved during replanning"
  );
  assert(
    revisedPlan.steps.some((s) => s.objective.includes("Re-evaluate and adapt")),
    "Replanned plan must inject corrective step"
  );

  // -------------------------------------------------------------------------
  // 4. Critic: Multi-Dimensional Reflection & Quality Evaluation
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing Critic: Multi-Dimensional Reflection & Defect Detection ---");

  const dummyPlan: ExecutionPlan = {
    id: "plan_test_critique",
    version: 1,
    taskId: "task_critique",
    objective: "Analyze sports match odds with Monte Carlo",
    strategy: "hierarchical",
    successCriteria: ["Deterministic ruin probability"],
    steps: validSteps,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "approved",
  };

  // Evaluation A: Flawed output claiming 100% certainty (Safety violation)
  const flawedOutput = "This bet is a 100% sure guaranteed win with zero risk! Probability: -0.20";
  const flawedCritique = criticAgent.evaluate({
    taskId: "task_critique",
    objective: "Analyze sports match odds with Monte Carlo",
    plan: dummyPlan,
    completedSteps: validSteps,
    evidenceStore: [],
    outputToEvaluate: flawedOutput,
  });

  assert(flawedCritique.status === "blocked", "Output with critical safety/math violations must be blocked");
  assert(
    flawedCritique.findings.some((f) => f.category === "safety" && f.severity === "critical"),
    "Critic must flag false guarantee claim as critical safety defect"
  );
  assert(
    flawedCritique.findings.some((f) => f.category === "factual" && f.severity === "critical"),
    "Critic must flag negative probability as critical factual defect"
  );
  assert(
    flawedCritique.dimensionScores.safety < 50,
    "Safety dimension score must reflect critical breach"
  );

  // Evaluation B: Compliant output with proper probabilistic phrasing
  const compliantOutput = "Probabilistic estimation models estimate home win probability at 52% (no guarantee). 10,000 Monte Carlo trials bound ruin risk at 2.4%. Safe Half-Kelly capital cap: 1.5%.";
  const compliantCritique = criticAgent.evaluate({
    taskId: "task_critique",
    objective: "Analyze sports match odds with Monte Carlo",
    plan: dummyPlan,
    completedSteps: validSteps,
    evidenceStore: [{ id: "e1", source: "https://qaxale.internal", title: "Stats", snippet: "Historical form", verified: true }],
    outputToEvaluate: compliantOutput,
  });

  assert(compliantCritique.status === "pass", "Compliant probabilistic output must pass critique");
  assert(compliantCritique.overallQualityScore >= 80, "Compliant output should score >= 80");
  assert(compliantCritique.findings.length === 0, "Compliant output should have zero severe findings");

  // -------------------------------------------------------------------------
  // 5. Self-Correction: Targeted Fixes, Revalidation & Provenance
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Testing Self-Correction Engine: Targeted Fixes & Revalidation ---");

  const mockSharedState: SharedTaskState = {
    executionId: "exec_corr_test",
    ownerUid: "test_user_corr",
    objective: "Analyze sports match odds with Monte Carlo",
    category: "multi_step",
    strategy: "hierarchical",
    plan: dummyPlan,
    evidenceStore: [{ id: "e1", source: "https://qaxale.internal", title: "Odds", snippet: "Form data", verified: true, timestamp: Date.now() }],
    critiqueReports: [flawedCritique],
    correctionHistory: [],
    budget: {
      maxToolCalls: 6,
      maxReplans: 2,
      maxCritiquePasses: 2,
      maxCorrectionAttempts: 2,
      maxDurationMs: 45000,
      toolCallsExecuted: 2,
      replansExecuted: 0,
      critiquePassesExecuted: 1,
      correctionsExecuted: 0,
      startedAt: Date.now(),
    },
    phase: "EVALUATING_PROGRESS",
    status: "running",
  };

  const correctionResult = await selfCorrectionEngine.correctOutput(
    mockSharedState,
    flawedCritique,
    flawedOutput
  );

  assert(correctionResult.isResolved, "Self-correction should successfully resolve flawed claims");
  assert(
    !correctionResult.correctedOutput.includes("100% sure"),
    "Corrected output must not contain '100% sure'"
  );
  assert(
    !correctionResult.correctedOutput.includes("guaranteed win"),
    "Corrected output must not contain 'guaranteed win'"
  );
  assert(
    correctionResult.correctionRecord !== undefined,
    "Self-correction record must be generated"
  );
  assert(
    correctionResult.correctionRecord?.revalidationPassed === true,
    "Revalidation check must be marked passed"
  );
  assert(
    mockSharedState.correctionHistory.length === 1,
    "Correction record must be appended to shared task state"
  );

  // Test stopping bound: Exhausting max correction attempts
  mockSharedState.budget.correctionsExecuted = 2; // at max limit
  const boundedResult = await selfCorrectionEngine.correctOutput(
    mockSharedState,
    flawedCritique,
    "Another flawed text"
  );
  assert(!boundedResult.isResolved, "Correction must halt when max budget is exhausted");

  // -------------------------------------------------------------------------
  // 6. Multi-Agent Components: Researcher & Executor
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Testing Specialized Agents: Researcher & Executor ---");

  const researchStep: PlanStep = {
    id: "step_res_1",
    stepIndex: 1,
    objective: "Empirical Grounding for Transformer Self-Attention",
    dependencies: [],
    requiredCapabilities: ["web_grounding"],
    assignedAgent: "researcher",
    expectedOutput: "Evidence snippets",
    completionCriteria: ["Sources retrieved"],
    riskLevel: "low",
    requiresApproval: false,
    status: "ready",
  };

  const resOutput = await researcherAgent.research(researchStep, {
    userId: "test_research_user",
    executionId: "exec_res_test",
    language: "en",
  });

  assert(resOutput.step.status === "completed", "Researcher step should complete successfully");
  assert(resOutput.evidenceItems.length > 0, "Researcher must return at least one verified evidence item");
  assert(typeof resOutput.evidenceItems[0].source === "string", "Evidence item must include source provenance");

  const execStep: PlanStep = {
    id: "step_exec_1",
    stepIndex: 2,
    objective: "10,000 Monte Carlo stochastic simulation",
    dependencies: ["step_res_1"],
    requiredCapabilities: ["monte_carlo"],
    assignedAgent: "executor",
    expectedOutput: "Ruin bounds",
    completionCriteria: ["Trials calculated"],
    riskLevel: "low",
    requiresApproval: false,
    status: "ready",
  };

  const execOutput = await executorAgent.executeStep({
    executionId: "exec_step_test",
    userId: "test_exec_user",
    step: execStep,
  });

  assert(execOutput.step.status === "completed", "Executor step should complete successfully");
  assert(execOutput.result.data?.trials >= 1000, "Monte Carlo output payload should contain trials");
  assert(typeof execOutput.result.data?.ruinProbabilityPct === "number", "Ruin probability must be calculated");

  // -------------------------------------------------------------------------
  // 7. Cognitive Orchestrator: End-to-End Orchestration
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Testing Central Cognitive Orchestrator (End-to-End) ---");

  const recordedPhases: string[] = [];
  let planRecorded: ExecutionPlan | undefined;
  let critiqueRecorded = false;

  const finalState = await cognitiveOrchestrator.orchestrate({
    executionId: "e2e_cog_mission",
    userId: "user_e2e_verified",
    objective: "Herrega carraa fi variance xiinxali, siimuleeshinii Monte Carlo yaalii 10,000 gaggeessi.",
    domain: "decision-science",
    language: "om",
    onPhaseChange: (ph) => {
      recordedPhases.push(ph);
    },
    onPlanCreated: (p) => {
      planRecorded = p;
    },
    onCritiqueComplete: () => {
      critiqueRecorded = true;
    },
  });

  assert(finalState.status === "completed", "Orchestrated task must complete with status 'completed'");
  assert(planRecorded !== undefined, "Plan must be created and captured via callback");
  assert(planRecorded?.steps.length! >= 3, `Hierarchical plan must contain at least 3 steps (found ${planRecorded?.steps.length})`);
  assert(critiqueRecorded, "Quality reflection & critique must be performed");
  assert(finalState.evidenceStore.length > 0, "Evidence store must capture research items");
  assert(finalState.finalAnswer !== undefined, "Final answer package must be produced");
  assert(
    recordedPhases.includes("PLANNING") &&
    recordedPhases.includes("EXECUTING_TOOL") &&
    recordedPhases.includes("EVALUATING_PROGRESS") &&
    recordedPhases.includes("FINAL_VERIFICATION") &&
    recordedPhases.includes("COMPLETED"),
    `State machine must progress through all cognitive phases (recorded: ${recordedPhases.join(" -> ")})`
  );

  console.log("\n==================================================================");
  console.log(`   ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================\n");
  process.exit(0);
}

runCognitiveTestSuite().catch((err) => {
  console.error("Cognitive Test Suite failed with error:", err);
  process.exit(1);
});
