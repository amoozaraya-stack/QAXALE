/**
 * QAXALE Autonomous Agent & Tool Execution Intelligence System
 * Automated Verification & In-depth Rigorous Test Suite
 */

import {
  toolRegistry,
  computeActionFingerprint,
  executeToolSafely,
  ToolExecutionContext,
} from "../src/services/toolRegistry";
import { AgentExecutionEngine } from "../src/services/agentEngine";
import { AgentExecutionPhase, AutonomousStepLog } from "../src/types";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("   QAXALE AGENT & TOOL EXECUTION INTELLIGENCE TEST SUITE");
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
  // TEST GROUP 1: Central Tool Registry & Schema Validation
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing Central Tool Registry & Discovery ---");
  const registeredTools = toolRegistry.listTools();
  assert(registeredTools.length >= 5, `Registered tools count should be >= 5 (found ${registeredTools.length})`);

  const monteCarloTool = toolRegistry.getTool("monte_carlo");
  assert(!!monteCarloTool, "monte_carlo tool should be registered");
  assert(monteCarloTool?.riskLevel === "low", "monte_carlo risk level should be low");
  assert(monteCarloTool?.requiresApproval === false, "monte_carlo should not require manual approval");

  const webhookTool = toolRegistry.getTool("connectors_webhook");
  assert(!!webhookTool, "connectors_webhook tool should be registered");
  assert(webhookTool?.riskLevel === "high", "connectors_webhook risk level should be high");
  assert(webhookTool?.requiresApproval === true, "connectors_webhook MUST require approval");

  console.log("\n--- 2. Testing Input Schema Validation ---");
  const validValidation = toolRegistry.validateParameters("monte_carlo", {
    trials: 5000,
    winRate: 0.55,
    initialBankroll: 1000,
  });
  assert(validValidation.isValid, "Valid monte_carlo params should pass validation");

  const invalidValidation = toolRegistry.validateParameters("connectors_webhook", {
    method: "POST", // missing url
  });
  assert(!invalidValidation.isValid, "Missing required URL in connectors_webhook should fail validation");
  assert(
    invalidValidation.errors.some((e) => e.field === "url"),
    "Validation error should specifically flag missing 'url' field"
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Deterministic Action Fingerprinting & Loop Prevention
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Action Fingerprinting & Loop Defense ---");
  // Test key order independence
  const fp1 = computeActionFingerprint("monte_carlo", { trials: 1000, winRate: 0.5 });
  const fp2 = computeActionFingerprint("monte_carlo", { winRate: 0.5, trials: 1000 });
  assert(fp1 === fp2, `Action fingerprints must be identical regardless of key ordering (${fp1} === ${fp2})`);

  const fpDifferent = computeActionFingerprint("monte_carlo", { trials: 2000, winRate: 0.5 });
  assert(fp1 !== fpDifferent, "Fingerprints for different parameters must differ");

  // Test loop detection in execution context
  const testFingerprintsSeen = new Set<string>();
  testFingerprintsSeen.add(fp1);

  const mockContextWithLoop: ToolExecutionContext = {
    userId: "test-user-1",
    missionId: "test-mission-1",
    fingerprintsSeen: testFingerprintsSeen,
    isHumanInTheLoop: false,
  };

  const loopResult = await executeToolSafely(
    "monte_carlo",
    { trials: 1000, winRate: 0.5 },
    mockContextWithLoop
  );
  assert(loopResult.status === "denied" || loopResult.status === "failure", "Duplicate identical action call should be denied");
  assert(
    loopResult.error?.code === "LOOP_DETECTED",
    `Error code should be LOOP_DETECTED (got: ${loopResult.error?.code})`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Human-in-the-Loop Approval Gating for Consequential Tools
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing Human-in-the-Loop Consequential Approval Gating ---");
  let approvalPrompted = false;

  const mockContextWithApproval: ToolExecutionContext = {
    userId: "test-user-2",
    missionId: "test-mission-2",
    fingerprintsSeen: new Set<string>(),
    isHumanInTheLoop: true,
    onApprovalRequired: async (req) => {
      approvalPrompted = true;
      assert(req.toolName === "connectors_webhook", "Approval request should identify connectors_webhook");
      assert(req.riskLevel === "high", "Approval request should reflect high risk level");
      return false; // User rejects
    },
  };

  const rejectedResult = await executeToolSafely(
    "connectors_webhook",
    { url: "https://api.example.com/webhook", method: "POST" },
    mockContextWithApproval
  );

  assert(approvalPrompted, "Approval handler must be invoked before executing high-risk tool");
  assert(rejectedResult.status === "denied" || rejectedResult.status === "failure", "Rejected action should return denied status");
  assert(
    rejectedResult.error?.code === "APPROVAL_REJECTED",
    `Error code should be APPROVAL_REJECTED (got: ${rejectedResult.error?.code})`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 4: Normalized Output Envelope Compliance
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Testing Normalized Output Envelope Compliance ---");
  const cleanContext: ToolExecutionContext = {
    userId: "test-user-3",
    missionId: "test-mission-3",
    fingerprintsSeen: new Set<string>(),
    isHumanInTheLoop: false,
  };

  const execResult = await executeToolSafely(
    "monte_carlo",
    { trials: 500, winRate: 0.52 },
    cleanContext
  );

  assert(execResult.toolName === "monte_carlo", "toolName field must match");
  assert(typeof execResult.callId === "string" && execResult.callId.length > 0, "callId must be non-empty string");
  assert(
    execResult.status === "success" || execResult.status === "partial",
    `Status must be valid execution status (got: ${execResult.status})`
  );
  assert(typeof execResult.metadata?.durationMs === "number", "metadata.durationMs must be a number");
  assert(typeof execResult.metadata?.timestamp === "number", "metadata.timestamp must be a number");
  assert(typeof execResult.metadata?.fingerprint === "string", "metadata.fingerprint must be a string");

  // -------------------------------------------------------------------------
  // TEST GROUP 5: Agent State Machine Lifecycle & Budget Bounds
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Testing Agent State Machine Lifecycle & Transitions ---");
  const recordedPhases: AgentExecutionPhase[] = [];
  const recordedSteps: AutonomousStepLog[] = [];

  const engine = new AgentExecutionEngine({
    missionId: "mission-test-verified",
    userId: "test-user-agent",
    objective: "Herrega carraa fi variance xiinxali, siimuleeshinii Monte Carlo yaalii 10,000 gaggeessi.",
    domain: "decision-science",
    autonomyMode: "full",
    targetLanguage: "om",
    onPhaseChange: (phase) => {
      recordedPhases.push(phase);
    },
    onStepProgress: (step, phase) => {
      recordedSteps.push(step);
    },
  });

  const completedMission = await engine.executeMission();

  assert(completedMission.id === "mission-test-verified", "Mission ID must match");
  assert(completedMission.status === "completed", `Mission status should be completed (got: ${completedMission.status})`);
  assert(completedMission.steps.length >= 2, `Mission steps should be recorded (count: ${completedMission.steps.length})`);
  assert(
    recordedPhases.includes("UNDERSTANDING") &&
      recordedPhases.includes("PLANNING") &&
      recordedPhases.includes("EXECUTING_TOOL") &&
      recordedPhases.includes("COMPLETED"),
    `Agent must transition through planned state machine phases (recorded: ${recordedPhases.join(" -> ")})`
  );
  assert(
    completedMission.budget !== undefined,
    "Completed mission must contain execution budget telemetry"
  );
  assert(
    (completedMission.budget?.toolCallsExecuted || 0) <= (completedMission.budget?.maxToolCalls || 6),
    "Executed tool calls must remain strictly within maximum budget"
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 6: AbortSignal Cancellation Handling
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Testing Agent Cancellation via AbortSignal ---");
  const abortController = new AbortController();
  abortController.abort(); // pre-abort

  const abortedEngine = new AgentExecutionEngine({
    missionId: "mission-aborted-test",
    userId: "test-user-agent",
    objective: "Test cancellation handling",
    domain: "tech",
    autonomyMode: "full",
    targetLanguage: "en",
    signal: abortController.signal,
  });

  let threwAbortError = false;
  try {
    await abortedEngine.executeMission();
  } catch (err: any) {
    threwAbortError = true;
    assert(
      String(err.message).toLowerCase().includes("cancelled") ||
        String(err.message).toLowerCase().includes("abort"),
      `Expected cancellation error, got: ${err.message}`
    );
  }
  assert(threwAbortError, "Execution engine must halt immediately when AbortSignal is fired");

  console.log("\n==================================================================");
  console.log(`   ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================\n");
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error("Test Suite failed with error:", err);
  process.exit(1);
});
