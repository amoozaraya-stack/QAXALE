# ORONID TECH Ecosystem Architecture & Platform Specification
**Product:** QAXALE (V3.2.0)  
**Company:** ORONID TECH  
**Author / Chief Architect:** Hamza Yasin  
**Philosophy:** *"Understand first. Analyze intelligently. Decide responsibly."*

---

## 1. Executive Summary

QAXALE is the central artificial intelligence and decision-support platform within the **ORONID TECH** ecosystem. Rather than an ad-hoc single-turn chat widget, QAXALE is architected as an extensible, multi-tiered cognitive intelligence platform with native first-class support for **Afaan Oromoo** and **English**.

### Ecosystem Hierarchy:
```
+-------------------------------------------------------------------------+
|                           ORONID TECH                                   |
|                (Governance, Identity, Core Standards)                   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                      Shared Platform Foundation                         |
|   (Contracts, Module Registry, Feature Flags, Evaluation & Telemetry)   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        QAXALE Intelligence Core                         |
|   (Memory & Context, Tool Execution, Cognitive Multi-Agent Engine)       |
+-------------------------------------------------------------------------+
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
        v                           v                           v
+------------------+      +--------------------+      +------------------+
|   QAXALE.AI      |      |   KILIMAANJAROO    |      |  Learning & STEM |
| Core Assistant & |      |   Afaan Oromoo     |      |  Education &     |
| Multi-Turn Chat  |      | Language Engine    |      |  Feynman Tutor   |
+------------------+      +--------------------+      +------------------+
        |                           |                           |
        v                           v                           v
+------------------+      +--------------------+      +------------------+
|  Autonomous      |      |  Developer Gateway |      | Admin & Ops      |
|  Agents & Tools  |      |  & Webhooks API    |      | Multi-Tenancy    |
+------------------+      +--------------------+      +------------------+
```

---

## 2. Multi-Agent Orchestration Engine (`src/services/orchestrator.ts`)

QAXALE's agentic layer operates under explicit boundaries, resource budgets, and evidence provenance.

### Core Contracts:
1. **`AgentInvocationContext`**:
   - `taskId` & `parentTaskId`: Hierarchical task lineage.
   - `executionId`: Execution session identifier.
   - `userId` & `tenantId`: Tenant-isolated security boundary.
   - `role`: Specialized agent role (`planner`, `critic`, `executor`, `researcher`, `verifier`).
   - `budget`: Enforced limits (`maxToolCalls`, `maxDurationMs`, `maxReplans`, `maxCorrections`).
   - `availableTools`: Explicit tool whitelisting per execution.
   - `provenanceChain`: Audit trail tracing parent-to-child delegation.
   - `signal`: AbortSignal for early cancellation.

2. **`AgentResult<T>`**:
   - `success`: Boolean outcome flag.
   - `data`: Typed payload `T`.
   - `error`: Structured `AgentError` (with recovery directives: `retry`, `replan`, `fallback`, `abort`).
   - `usage`: Tool calls, wall-clock duration, token tracking.
   - `evidence`: Provenance-backed facts and sources.
   - `provenance`: Attributed to QAXALE / ORONID TECH.

---

## 3. Platform Module Registry (`src/services/platform/`)

To support independent evolution across ORONID TECH products, modules implement the standard `PlatformModule` contract:

- **Lifecycle Hooks:** `init(ctx)`, `start()`, `stop()`, `healthCheck()`.
- **Topological Sorting:** All modules declare dependencies (e.g. `kilimaanjaroo` depends on `qaxale-core`). The registry performs depth-first cycle detection and initiates modules in strictly verified topological order.
- **Aggregated Health Checks:** Evaluates health across every subsystem concurrently with latency benchmarks.

---

## 4. Cognitive Execution Lifecycle

Every complex agentic objective transitions through a deterministic state machine:

1. **Classification:** Conversational vs. Multi-step vs. Research-intensive vs. Consequential action.
2. **Strategy Selection:** Direct answer vs. Lightweight tools vs. Hierarchical DAG execution.
3. **DAG Planning & Cycle Validation:** Generates dependency graph and rejects circular references.
4. **Isolated Step Execution:** Dispatches steps in topological batches; preserves verified steps across replans.
5. **Quality Reflection (Critic):** Evaluates against 7 dimensions (`correctness`, `completeness`, `evidence`, `consistency`, `instructionCompliance`, `contextRelevance`, `safety`).
6. **Bounded Self-Correction:** Corrects flawed outputs (e.g. removing false guarantee claims or negative probabilities), revalidating before presenting final results. Max 2 iterations.
7. **Synthesis & Executive Dossier:** Produces summary, verified claims, caveats, and next-step directives.

---

## 5. Security & Isolation

- **Zero-Secret Bundling:** Private keys remain strictly on the backend.
- **Failover Chain:** Gemini multi-model fallback chain (`gemini-3.6-flash`, `gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-3.7-flash`).
- **Human-in-the-Loop:** High-consequence tools require explicit user approval.
- **Strict Gambling Safety Filter:** Prohibits "100% sure", "guaranteed profit", and provides variance and probability education.
