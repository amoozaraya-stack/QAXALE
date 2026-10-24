/**
 * QAXALE Autonomous Agent & Platform Architecture Test Suite
 * Product of ORONID TECH Company (Directed by Hamza Yasin)
 *
 * Verifies:
 * 1. MultiAgentOrchestrator typed contracts (AgentInvocationContext, AgentResult, AgentBudget).
 * 2. Task execution, subtask delegation, error isolation, and budget propagation.
 * 3. Module Registry topological sorting, dependency checks, and cycle rejection.
 * 4. Feature flag evaluation, tenant/user targeting, and emergency kill switches.
 * 5. Platform feedback service ingestion and Net Quality Score metrics.
 */

import {
  PLATFORM_COMPANY,
  PLATFORM_PRODUCT,
  PLATFORM_VERSION,
  multiAgentOrchestrator,
  AgentInvocationContext,
  AgentResult,
} from "../src/services/orchestrator";
import {
  moduleRegistry,
} from "../src/services/platform/moduleRegistry";
import { PlatformModule } from "../src/services/platform/contracts";
import { featureFlagService } from "../src/services/platform/featureFlags";
import { platformFeedbackService } from "../src/services/platform/feedbackService";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("   QAXALE PLATFORM & MULTI-AGENT ARCHITECTURE VERIFICATION SUITE");
  console.log(`   Product of ${PLATFORM_COMPANY} | ${PLATFORM_PRODUCT} v${PLATFORM_VERSION}`);
  console.log("==================================================================");

  // -------------------------------------------------------------------------
  // 1. MultiAgentOrchestrator & Typed Contracts
  // -------------------------------------------------------------------------
  console.log("\n--- 1. Testing Multi-Agent Orchestrator Contracts & Budgeting ---");
  
  assert(PLATFORM_COMPANY === "ORONID TECH", "Platform company must be 'ORONID TECH'");
  assert(PLATFORM_PRODUCT === "QAXALE", "Platform product must be 'QAXALE'");

  const rootContext = multiAgentOrchestrator.createContext({
    userId: "user_test_101",
    tenantId: "tenant_alpha",
    role: "planner",
    availableTools: ["monte_carlo_tool", "document_query"],
    budget: { maxToolCalls: 5, maxDurationMs: 5000 },
  });

  assert(Boolean(rootContext.taskId), "Context must have valid taskId");
  assert(rootContext.role === "planner", "Context role must match input");
  assert(rootContext.tenantId === "tenant_alpha", "Context tenantId must be preserved");
  assert(rootContext.budget.maxToolCalls === 5, "Context budget maxToolCalls must be 5");
  assert(rootContext.provenanceChain.length === 1, "Initial provenance chain must contain root");

  // Execute a successful task
  const successResult: AgentResult<{ status: string }> = await multiAgentOrchestrator.executeAgentTask(
    rootContext,
    async (ctx) => {
      ctx.budget.toolCallsExecuted += 1;
      return { status: "task_complete" };
    }
  );

  assert(successResult.success === true, "Successful task must return success: true");
  assert(successResult.data?.status === "task_complete", "Task payload must match output");
  assert(successResult.provenance.company === "ORONID TECH", "Result provenance company must be ORONID TECH");
  assert(successResult.usage.totalToolCalls === 1, "Usage tool calls must record execution");

  // Execute a failing task to test error boundaries
  const failingContext = multiAgentOrchestrator.createContext({
    userId: "user_test_102",
    role: "executor",
  });

  const failureResult = await multiAgentOrchestrator.executeAgentTask(failingContext, async () => {
    throw new Error("Simulated database failure");
  });

  assert(failureResult.success === false, "Failing task must return success: false");
  assert(failureResult.error?.code === "AGENT_EXECUTION_ERROR", "Error code must indicate execution error");
  assert(failureResult.error?.recoverable === true, "Execution error should be flagged recoverable");

  // -------------------------------------------------------------------------
  // 2. Subtask Delegation & Lineage
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing Subtask Delegation & Lineage Tracking ---");

  const parentCtx = multiAgentOrchestrator.createContext({
    userId: "user_test_201",
    role: "planner",
    budget: { maxToolCalls: 10, maxDurationMs: 10000 },
  });

  const subtaskResult = await multiAgentOrchestrator.delegateSubtask(
    parentCtx,
    "researcher",
    "fetch_sports_evidence",
    async (subCtx) => {
      assert(subCtx.parentTaskId === parentCtx.taskId, "Subtask must maintain parentTaskId lineage");
      assert(subCtx.role === "researcher", "Subtask role must match delegated role");
      assert(subCtx.provenanceChain.some((p) => p.includes("researcher")), "Provenance chain must include researcher");
      subCtx.budget.toolCallsExecuted += 2;
      return { evidenceFound: 3 };
    }
  );

  assert(subtaskResult.success === true, "Delegated subtask must succeed");
  assert(parentCtx.budget.toolCallsExecuted === 2, "Parent context budget must reflect delegated tool calls");

  // Test Aggregation
  const aggregated = multiAgentOrchestrator.aggregateResults<any>([successResult, subtaskResult]);
  assert(aggregated.allSuccess === true, "Aggregator should report allSuccess when all tasks succeed");
  assert(aggregated.data.length === 2, "Aggregated data must contain both payloads");

  // -------------------------------------------------------------------------
  // 3. Platform Module Registry & Topological Dependency Resolution
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Module Registry & Dependency Resolution ---");

  const modules = moduleRegistry.listModules();
  assert(modules.length >= 6, `Core registry must have at least 6 modules (found: ${modules.length})`);

  const qaxaleCore = moduleRegistry.getModule("qaxale-core");
  assert(Boolean(qaxaleCore), "qaxale-core must be registered");
  assert(qaxaleCore?.metadata.company === "ORONID TECH", "Module company must be ORONID TECH");

  const kilimaanjaroo = moduleRegistry.getModule("kilimaanjaroo");
  assert(Boolean(kilimaanjaroo), "kilimaanjaroo must be registered");
  assert(kilimaanjaroo?.dependencies.includes("qaxale-core") === true, "kilimaanjaroo must depend on qaxale-core");

  const startupOrder = moduleRegistry.resolveStartupOrder();
  assert(startupOrder.length >= 6, "Startup order must resolve all modules");
  assert(
    startupOrder.indexOf("qaxale-core") < startupOrder.indexOf("kilimaanjaroo"),
    "qaxale-core must initialize before kilimaanjaroo in topological order"
  );

  // Test circular dependency detection
  const testModuleA: PlatformModule = {
    metadata: {
      id: "test-cycle-a",
      name: "Cycle A",
      version: "1.0.0",
      description: "Test cycle module A",
      pillar: "core_intelligence",
      company: "ORONID TECH",
      author: "Hamza Yasin",
      tags: [],
      capabilities: [],
    },
    dependencies: ["test-cycle-b"],
    status: "registered",
    init: async () => {},
    start: async () => {},
    stop: async () => {},
    healthCheck: async () => ({ healthy: true, latencyMs: 1, timestamp: Date.now() }),
  };

  const testModuleB: PlatformModule = {
    metadata: {
      id: "test-cycle-b",
      name: "Cycle B",
      version: "1.0.0",
      description: "Test cycle module B",
      pillar: "core_intelligence",
      company: "ORONID TECH",
      author: "Hamza Yasin",
      tags: [],
      capabilities: [],
    },
    dependencies: ["test-cycle-a"],
    status: "registered",
    init: async () => {},
    start: async () => {},
    stop: async () => {},
    healthCheck: async () => ({ healthy: true, latencyMs: 1, timestamp: Date.now() }),
  };

  moduleRegistry.registerModule(testModuleA);
  moduleRegistry.registerModule(testModuleB);

  let cycleCaught = false;
  try {
    moduleRegistry.resolveStartupOrder();
  } catch (err: any) {
    if (err?.message?.includes("Circular module dependency detected")) {
      cycleCaught = true;
    }
  }

  assert(cycleCaught === true, "Registry must throw error on circular module dependencies");

  // Clean up test modules
  moduleRegistry.unregisterModule("test-cycle-a");
  moduleRegistry.unregisterModule("test-cycle-b");

  // Test aggregated health check
  const health = await moduleRegistry.performAggregatedHealthCheck();
  assert(health.status === "healthy", "Aggregated health check must report healthy");
  assert(health.company === "ORONID TECH", "Health check company must be ORONID TECH");
  assert(Boolean(health.results["qaxale-core"]), "Health check results must include qaxale-core");

  // -------------------------------------------------------------------------
  // 4. Feature Flag Governance & Kill Switches
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing Feature Flag Governance & Emergency Kill Switches ---");

  const planningActive = featureFlagService.isEnabled("cognitive_hierarchical_planning");
  assert(planningActive === true, "cognitive_hierarchical_planning should be active by default");

  const gpuActive = featureFlagService.isEnabled("experimental_monte_carlo_gpu");
  assert(gpuActive === false, "experimental_monte_carlo_gpu should be disabled by default");

  // Test emergency kill switch
  featureFlagService.activateKillSwitch("cognitive_hierarchical_planning");
  const killSwitchActive = featureFlagService.isEnabled("cognitive_hierarchical_planning");
  assert(killSwitchActive === false, "Kill switch must immediately disable the feature flag");

  // Deactivate kill switch
  featureFlagService.deactivateKillSwitch("cognitive_hierarchical_planning");
  const restored = featureFlagService.isEnabled("cognitive_hierarchical_planning");
  assert(restored === true, "Deactivating kill switch must restore feature flag");

  // -------------------------------------------------------------------------
  // 5. Evaluation & Platform Feedback Service
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Testing Platform Feedback Service & Metrics ---");

  const fbRecord = platformFeedbackService.submitFeedback({
    module: "qaxale-core",
    userId: "usr_eval_1",
    rating: 5,
    sentiment: "positive",
    category: "accuracy",
    comments: "High precision odds modeling without false promises.",
    language: "om",
  });

  assert(Boolean(fbRecord.id), "Feedback record must be assigned an ID");
  assert(fbRecord.rating === 5, "Rating must be recorded accurately");

  const recent = platformFeedbackService.getRecentFeedback({ module: "qaxale-core" });
  assert(recent.length > 0, "Recent feedback query must return submitted records");

  const stats = platformFeedbackService.calculateStats();
  assert(stats.totalFeedbackCount >= 4, "Total feedback count must include seed and test records");
  assert(stats.averageRating >= 4.0, "Average rating should be >= 4.0");
  assert(stats.netQualityScore > 0, "Net Quality Score must be positive");
  assert(stats.languageBreakdown.om >= 2, "Afaan Oromoo feedback count must be tracked");

  console.log("==================================================================");
  console.log(`   ALL PLATFORM TESTS COMPLETED: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("[FATAL TEST ERROR]:", err);
  process.exit(1);
});
