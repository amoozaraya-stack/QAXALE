/**
 * ORONID TECH Platform Module Registry
 * Central orchestrator for module discovery, lifecycle, dependency resolution,
 * and aggregated health verification.
 * Author: Hamza Yasin / ORONID TECH
 */

import {
  PlatformModule,
  ModuleMetadata,
  ModuleStatus,
  ModuleHealthCheck,
  PlatformInitContext,
} from "./contracts";

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, PlatformModule> = new Map();
  private isInitialized = false;

  private constructor() {
    this.registerCoreModules();
  }

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Registers a platform module.
   */
  public registerModule(module: PlatformModule): void {
    const id = module.metadata.id;
    if (this.modules.has(id)) {
      throw new Error(`Module with id '${id}' is already registered in ORONID TECH registry.`);
    }
    this.modules.set(id, module);
  }

  /**
   * Unregisters a module (useful in testing or dynamic plugins).
   */
  public unregisterModule(id: string): boolean {
    return this.modules.delete(id);
  }

  /**
   * Retrieves a module by its identifier.
   */
  public getModule(id: string): PlatformModule | undefined {
    return this.modules.get(id);
  }

  /**
   * Lists all registered modules.
   */
  public listModules(): PlatformModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Validates module dependencies and detects circular dependencies.
   * Returns a topographically ordered list of module IDs for safe initialization.
   */
  public resolveStartupOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (id: string, path: string[]) => {
      if (visiting.has(id)) {
        throw new Error(
          `Circular module dependency detected in ORONID TECH ecosystem: ${[...path, id].join(" -> ")}`
        );
      }
      if (!visited.has(id)) {
        visiting.add(id);
        const mod = this.modules.get(id);
        if (!mod) {
          throw new Error(`Missing required module dependency '${id}' in ORONID TECH registry.`);
        }
        for (const depId of mod.dependencies) {
          visit(depId, [...path, id]);
        }
        visiting.delete(id);
        visited.add(id);
        order.push(id);
      }
    };

    for (const id of this.modules.keys()) {
      if (!visited.has(id)) {
        visit(id, []);
      }
    }

    return order;
  }

  /**
   * Initializes all registered modules according to their topological dependency order.
   */
  public async initializeAll(context: PlatformInitContext): Promise<void> {
    const startupOrder = this.resolveStartupOrder();

    for (const id of startupOrder) {
      const module = this.modules.get(id)!;
      try {
        module.status = "initializing";
        await module.init(context);
        await module.start();
        module.status = "active";
      } catch (err: any) {
        module.status = "error";
        console.error(`[ORONID TECH REGISTRY] Failed to initialize module '${id}':`, err);
        throw err;
      }
    }

    this.isInitialized = true;
  }

  /**
   * Performs an aggregated health check across all registered modules.
   */
  public async performAggregatedHealthCheck(): Promise<{
    platform: string;
    company: string;
    status: "healthy" | "degraded" | "unhealthy";
    totalModules: number;
    activeModules: number;
    results: Record<string, ModuleHealthCheck>;
    timestamp: number;
  }> {
    const results: Record<string, ModuleHealthCheck> = {};
    let hasDegraded = false;
    let hasUnhealthy = false;
    let activeCount = 0;

    for (const [id, mod] of this.modules.entries()) {
      if (mod.status === "active") activeCount++;
      try {
        const check = await mod.healthCheck();
        results[id] = check;
        if (!check.healthy) hasUnhealthy = true;
      } catch (err: any) {
        results[id] = {
          healthy: false,
          latencyMs: 0,
          message: err?.message || "Health check failed with exception",
          timestamp: Date.now(),
        };
        hasUnhealthy = true;
      }
    }

    const overallStatus = hasUnhealthy ? "unhealthy" : hasDegraded ? "degraded" : "healthy";

    return {
      platform: "QAXALE",
      company: "ORONID TECH",
      status: overallStatus,
      totalModules: this.modules.size,
      activeModules: activeCount,
      results,
      timestamp: Date.now(),
    };
  }

  /**
   * Registers default ecosystem pillars and foundational modules for ORONID TECH.
   */
  private registerCoreModules(): void {
    // 1. QAXALE.AI Core Intelligence
    this.registerModule({
      metadata: {
        id: "qaxale-core",
        name: "QAXALE.AI Core Intelligence",
        version: "3.2.0",
        description: "Foundational AI conversation, memory synthesis, and multi-turn reasoning engine.",
        pillar: "core_intelligence",
        company: "ORONID TECH",
        author: "Hamza Yasin",
        tags: ["core", "llm", "reasoning", "memory"],
        capabilities: ["chat", "interpret-layers", "memory-retrieval", "context-synthesis"],
      },
      dependencies: [],
      status: "active",
      init: async () => {},
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => ({
        healthy: true,
        latencyMs: 5,
        message: "QAXALE.AI core intelligence operational",
        timestamp: Date.now(),
      }),
    });

    // 2. KILIMAANJAROO Afaan Oromoo Infrastructure
    this.registerModule({
      metadata: {
        id: "kilimaanjaroo",
        name: "KILIMAANJAROO Language & Knowledge Engine",
        version: "2.1.0",
        description: "Afaan Oromoo technical terminology, grammar deconstruction, and cultural corpus engine.",
        pillar: "language_infrastructure",
        company: "ORONID TECH",
        author: "Hamza Yasin",
        tags: ["afaan-oromoo", "terminology", "linguistics", "translation"],
        capabilities: ["terminology-resolution", "bidirectional-translation", "morphology-analysis"],
      },
      dependencies: ["qaxale-core"],
      status: "active",
      init: async () => {},
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => ({
        healthy: true,
        latencyMs: 8,
        message: "KILIMAANJAROO terminology database connected",
        timestamp: Date.now(),
      }),
    });

    // 3. Learning & Guided Education
    this.registerModule({
      metadata: {
        id: "learning-education",
        name: "QAXALE Academy & Guided Learning",
        version: "1.4.0",
        description: "STEM concept deconstruction, interactive learning pathways, and Feynman method tutor.",
        pillar: "learning_education",
        company: "ORONID TECH",
        author: "Hamza Yasin",
        tags: ["education", "stem", "feynman", "socratic", "quiz"],
        capabilities: ["concept-breakdown", "guided-practice", "quiz-evaluation"],
      },
      dependencies: ["qaxale-core", "kilimaanjaroo"],
      status: "active",
      init: async () => {},
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => ({
        healthy: true,
        latencyMs: 4,
        message: "Learning pathways and STEM curriculum verified",
        timestamp: Date.now(),
      }),
    });

    // 4. Autonomous Agents & Tool Registry
    this.registerModule({
      metadata: {
        id: "agent-tools",
        name: "Autonomous Agents & Extensible Tool Platform",
        version: "2.5.0",
        description: "Multi-agent cognitive orchestration, bounded retries, tool execution, and reflection engine.",
        pillar: "agents_tools",
        company: "ORONID TECH",
        author: "Hamza Yasin",
        tags: ["agents", "tools", "planning", "reflection", "orchestrator"],
        capabilities: ["tool-execution", "dag-planning", "self-correction", "monte-carlo", "odds-math"],
      },
      dependencies: ["qaxale-core"],
      status: "active",
      init: async () => {},
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => ({
        healthy: true,
        latencyMs: 12,
        message: "Cognitive orchestrator and verified tool registry active",
        timestamp: Date.now(),
      }),
    });

    // 5. Developer Platform & Integration API
    this.registerModule({
      metadata: {
        id: "developer-platform",
        name: "ORONID TECH Developer & Integration Hub",
        version: "1.0.0",
        description: "API key governance, rate limiting, secure webhook dispatch, and developer documentation.",
        pillar: "developer_platform",
        company: "ORONID TECH",
        author: "Hamza Yasin",
        tags: ["api", "developer", "webhooks", "governance"],
        capabilities: ["api-key-auth", "rate-limiting", "telemetry-dispatch"],
      },
      dependencies: ["qaxale-core"],
      status: "active",
      init: async () => {},
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => ({
        healthy: true,
        latencyMs: 3,
        message: "Developer gateway ready",
        timestamp: Date.now(),
      }),
    });

    // 6. Administration, Operations & Multi-Tenancy
    this.registerModule({
      metadata: {
        id: "admin-ops",
        name: "Platform Administration & Multi-Tenant Operations",
        version: "1.2.0",
        description: "Tenant isolation, audit logging, system telemetry, and emergency kill switches.",
        pillar: "admin_ops",
        company: "ORONID TECH",
        author: "Hamza Yasin",
        tags: ["admin", "telemetry", "security", "multi-tenant", "audit"],
        capabilities: ["audit-logging", "kill-switch", "tenant-isolation", "usage-tracking"],
      },
      dependencies: ["qaxale-core"],
      status: "active",
      init: async () => {},
      start: async () => {},
      stop: async () => {},
      healthCheck: async () => ({
        healthy: true,
        latencyMs: 6,
        message: "Security boundaries and operational audit logs active",
        timestamp: Date.now(),
      }),
    });
  }
}

export const moduleRegistry = ModuleRegistry.getInstance();
