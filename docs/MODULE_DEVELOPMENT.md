# ORONID TECH Module Development Guide
**Platform:** QAXALE Core Foundation  
**Audience:** Internal Engineers & Ecosystem Contributors  
**Company:** ORONID TECH  

---

## 1. Overview

Every new service, specialized agent, or product in the ORONID TECH ecosystem must be authored as a modular unit conforming to the `PlatformModule` contract defined in `src/services/platform/contracts.ts`.

This ensures:
- Loose coupling between UI components and backend logic.
- Safe dependency resolution and circular dependency rejection.
- Independent versioning and lifecycle controls.
- Aggregated health monitoring and telemetry.

---

## 2. PlatformModule Contract

```typescript
import {
  PlatformModule,
  PlatformInitContext,
  ModuleHealthCheck,
} from "./src/services/platform/contracts";

export class CustomPillarModule implements PlatformModule {
  public metadata = {
    id: "custom-pillar",
    name: "Custom ORONID TECH Pillar",
    version: "1.0.0",
    description: "Specialized service description",
    pillar: "community_knowledge" as const,
    company: "ORONID TECH" as const,
    author: "Hamza Yasin",
    tags: ["custom", "pillar"],
    capabilities: ["service-action-1"],
  };

  public dependencies = ["qaxale-core"];
  public status = "registered" as const;

  public async init(ctx: PlatformInitContext): Promise<void> {
    // Read platform environment and configuration
  }

  public async start(): Promise<void> {
    // Start background listeners, sync databases
  }

  public async stop(): Promise<void> {
    // Clean up timers and open handles
  }

  public async healthCheck(): Promise<ModuleHealthCheck> {
    const t0 = Date.now();
    // Test connectivity
    return {
      healthy: true,
      latencyMs: Date.now() - t0,
      timestamp: Date.now(),
    };
  }
}
```

---

## 3. Registering Your Module

Register your module with the singleton registry:

```typescript
import { moduleRegistry } from "./src/services/platform/moduleRegistry";

moduleRegistry.registerModule(new CustomPillarModule());
```

The registry validates:
1. Unique module IDs.
2. Complete dependency graph resolution.
3. Absence of cyclical dependencies.

---

## 4. Multi-Agent Task Invocation Pattern

When delegating tasks from your module to specialized cognitive agents:

```typescript
import { multiAgentOrchestrator } from "./src/services/orchestrator";

const context = multiAgentOrchestrator.createContext({
  userId: "user_123",
  role: "researcher",
  availableTools: ["document_query", "grounded_search"],
});

const result = await multiAgentOrchestrator.executeAgentTask(context, async (ctx) => {
  // Execute isolated task
  return { answer: "verified" };
});

if (!result.success) {
  console.error("Task failed:", result.error?.message);
}
```

---

## 5. Coding Standards & Review Checklist

- **Afaan Oromoo First:** Provide natural Afaan Oromoo explanations alongside English technical terms.
- **No Mock Fallbacks as Real Data:** Clearly label simulated or cached data.
- **Strict Budgeting:** Never run unbound execution loops.
- **Telemetry:** Report usage records using `UsageRecord` format.
