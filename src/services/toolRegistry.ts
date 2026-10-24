import {
  ToolDefinition,
  NormalizedToolResult,
  ToolError,
  ToolRiskLevel,
  ToolExecutionStatus,
  AutonomousTool,
} from "../types";

// ============================================================================
// 1. Action Fingerprinting & Loop Prevention Helpers
// ============================================================================

export function computeActionFingerprint(toolName: string, input: Record<string, any>): string {
  try {
    const keys = Object.keys(input || {}).sort();
    const sortedObj: Record<string, any> = {};
    for (const k of keys) {
      const val = input[k];
      if (typeof val === "string") {
        sortedObj[k] = val.trim().toLowerCase();
      } else if (typeof val === "number" || typeof val === "boolean") {
        sortedObj[k] = val;
      } else if (val && typeof val === "object") {
        sortedObj[k] = JSON.stringify(val);
      }
    }
    return `${toolName}:${JSON.stringify(sortedObj)}`;
  } catch {
    return `${toolName}:${Date.now()}`;
  }
}

// ============================================================================
// 2. Central Tool Registry Store
// ============================================================================

const registry = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
  if (registry.has(tool.name)) {
    console.warn(`[TOOL REGISTRY] Overwriting registered tool: ${tool.name}`);
  }
  registry.set(tool.name, tool);
}

export function getTool(name: string): ToolDefinition | undefined {
  return registry.get(name);
}

export function listRegisteredTools(): ToolDefinition[] {
  return Array.from(registry.values());
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return Array.from(registry.values()).filter((t) => t.category === category);
}

// ============================================================================
// 3. Built-In Deterministic Tool Implementations
// ============================================================================

/**
 * Tool 1: Monte Carlo Stochastic Risk Simulator
 */
export const monteCarloTool: ToolDefinition = {
  name: "monte_carlo",
  version: "2.0.0",
  description: {
    om: "Siimuleeshinii lakkoofsaa Monte Carlo 10,000+ gaggeessuun carraa kasaaraa (ruin risk), Half-Kelly, fi variance shallaga.",
    en: "Executes 10,000+ deterministic Monte Carlo trials to compute ruin probability, Value at Risk, and Half-Kelly bounds.",
  },
  category: "math-probability",
  riskLevel: "low",
  requiresApproval: false,
  supportsCancellation: true,
  supportsIdempotency: true,
  timeoutMs: 4000,
  maxRetries: 1,
  inputSchema: {
    type: "object",
    properties: {
      trials: { type: "number", minimum: 100, maximum: 50000, default: 10000 },
      winRate: { type: "number", minimum: 0.01, maximum: 0.99, default: 0.54 },
      payoffRatio: { type: "number", minimum: 0.1, maximum: 100, default: 1.0 },
      initialBankroll: { type: "number", minimum: 10, maximum: 10000000, default: 1000 },
      stakeFraction: { type: "number", minimum: 0.001, maximum: 0.25, default: 0.03 },
      domain: { type: "string" },
    },
    required: ["winRate"],
  },
  async execute(input: any): Promise<NormalizedToolResult> {
    const startTime = Date.now();
    const trials = Math.min(50000, Math.max(100, Number(input.trials) || 10000));
    const winRate = Math.min(0.99, Math.max(0.01, Number(input.winRate) || 0.54));
    const payoffRatio = Math.max(0.1, Number(input.payoffRatio) || 1.0);
    const initialBankroll = Math.max(10, Number(input.initialBankroll) || 1000);
    const fraction = Math.min(0.25, Math.max(0.001, Number(input.stakeFraction) || 0.03));

    const finalBalances = new Float64Array(trials);
    let bankruptCount = 0;

    for (let t = 0; t < trials; t++) {
      let b = initialBankroll;
      for (let step = 0; step < 40; step++) {
        const stake = b * fraction;
        if (Math.random() < winRate) {
          b += stake * payoffRatio;
        } else {
          b -= stake;
        }
        if (b <= initialBankroll * 0.15) {
          bankruptCount++;
          break;
        }
      }
      finalBalances[t] = b;
    }

    finalBalances.sort();
    const median = finalBalances[Math.floor(trials * 0.5)];
    const p5 = finalBalances[Math.floor(trials * 0.05)];
    const p95 = finalBalances[Math.floor(trials * 0.95)];
    const ruinProb = (bankruptCount / trials) * 100;
    const rawKelly = ((payoffRatio * winRate) - (1 - winRate)) / payoffRatio;
    const optimalKelly = Math.max(0, Math.round(rawKelly * 1000) / 10);
    const recommendedHalfKelly = Math.max(0, Math.round((optimalKelly * 0.5) * 10) / 10);

    const data = {
      trials,
      winRatePct: Math.round(winRate * 100),
      payoffRatio,
      optimalKellyPct: optimalKelly,
      recommendedSafeFractionPct: recommendedHalfKelly,
      medianFinalCapital: Math.round(median),
      valueAtRisk_p5: Math.round(p5),
      upsidePotential_p95: Math.round(p95),
      ruinProbabilityPct: Math.round(ruinProb * 10) / 10,
      expectedValueFormula: `EV = (${winRate.toFixed(2)} × ${payoffRatio}) - (${(1 - winRate).toFixed(2)}) = +${((winRate * payoffRatio) - (1 - winRate)).toFixed(3)}`,
      timestamp: Date.now(),
    };

    return {
      toolName: "monte_carlo",
      callId: `call_mc_${Date.now()}`,
      status: "success",
      data,
      metadata: {
        durationMs: Date.now() - startTime,
        truncated: false,
        source: "Deterministic V8 Stochastic Engine",
        timestamp: Date.now(),
      },
    };
  },
};

/**
 * Tool 2: Odds & Implied Probability Converter
 */
export const oddsProbabilityTool: ToolDefinition = {
  name: "odds_probability",
  version: "1.5.0",
  description: {
    om: "Odds gara carraa dhugaatti jijjiira, bu'aa buukii (margin) shallaga, fi deebii EV deconstruct godha.",
    en: "Converts odds to implied and true probability, extracts bookmaker vig/margin, and evaluates expected value.",
  },
  category: "math-probability",
  riskLevel: "low",
  requiresApproval: false,
  supportsCancellation: true,
  supportsIdempotency: true,
  timeoutMs: 3000,
  maxRetries: 1,
  inputSchema: {
    type: "object",
    properties: {
      odds: { type: "number", minimum: 1.01 },
      format: { type: "string", enum: ["decimal", "fractional", "american"], default: "decimal" },
      marginPct: { type: "number", minimum: 0, maximum: 50, default: 5 },
    },
    required: ["odds"],
  },
  async execute(input: any): Promise<NormalizedToolResult> {
    const startTime = Date.now();
    const decimalOdds = Math.max(1.01, Number(input.odds) || 2.0);
    const margin = Math.max(0, Math.min(50, Number(input.marginPct) || 5));

    const rawImplied = (1 / decimalOdds) * 100;
    // Remove estimated bookmaker margin to derive fair probability
    const fairProb = Math.max(0.1, rawImplied * (1 - margin / 100));
    const fairOdds = Math.round((100 / fairProb) * 100) / 100;

    const data = {
      decimalOdds,
      impliedProbabilityPct: Math.round(rawImplied * 10) / 10,
      estimatedMarginPct: margin,
      fairEstimatedProbabilityPct: Math.round(fairProb * 10) / 10,
      fairDecimalOdds: fairOdds,
      halfKellySafeStakePct: Math.max(0.5, Math.min(2.5, Math.round(((fairProb / 100) - (1 - fairProb / 100) / (decimalOdds - 1)) * 50 * 10) / 10)),
      guaranteeWarning: "Never treat odds as certainty. 1.15 odds still fail ~13% of the time.",
    };

    return {
      toolName: "odds_probability",
      callId: `call_odds_${Date.now()}`,
      status: "success",
      data,
      metadata: {
        durationMs: Date.now() - startTime,
        truncated: false,
        source: "Probabilistic Calibration Engine",
        timestamp: Date.now(),
      },
    };
  },
};

/**
 * Tool 3: Document Analyzer with Boundary Isolation
 */
export const documentAnalyzerTool: ToolDefinition = {
  name: "document_analyzer",
  version: "1.2.0",
  description: {
    om: "Galmee fi barruulee bal'aa qora, yaada ijoo adda baasa, fi ragaa qabatamaa deebisa.",
    en: "Parses documents with untrusted input boundary fencing, extracting summaries, takeaways, and structured entities.",
  },
  category: "document-data",
  riskLevel: "moderate",
  requiresApproval: false,
  supportsCancellation: true,
  supportsIdempotency: true,
  timeoutMs: 15000,
  maxRetries: 2,
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", minLength: 5 },
      fileName: { type: "string" },
      language: { type: "string", enum: ["om", "en"], default: "om" },
    },
    required: ["text"],
  },
  async execute(input: any): Promise<NormalizedToolResult> {
    const startTime = Date.now();
    try {
      const response = await fetch("/api/document-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: String(input.text).slice(0, 50000), // Max payload cap
          fileName: input.fileName || "Document.txt",
          language: input.language || "om",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from document analyzer`);
      }

      const resData = await response.json();
      return {
        toolName: "document_analyzer",
        callId: `call_doc_${Date.now()}`,
        status: "success",
        data: resData,
        metadata: {
          durationMs: Date.now() - startTime,
          truncated: String(input.text).length > 50000,
          source: "/api/document-analyze",
          timestamp: Date.now(),
        },
      };
    } catch (err: any) {
      return {
        toolName: "document_analyzer",
        callId: `call_doc_err_${Date.now()}`,
        status: "failure",
        error: {
          code: "DOCUMENT_ANALYSIS_FAILED",
          message: err?.message || "Failed to analyze document",
          retryable: true,
        },
        metadata: {
          durationMs: Date.now() - startTime,
          truncated: false,
          timestamp: Date.now(),
        },
      };
    }
  },
};

/**
 * Tool 4: Google Grounding & Live Research
 */
export const webGroundingTool: ToolDefinition = {
  name: "web_grounding",
  version: "2.1.0",
  description: {
    om: "Google Search fayyadamuun ragaalee qabatamaa, kubbaa miilaa, fi oduu ammaa sakatta'a.",
    en: "Retrieves live real-world evidence and current sports/technical facts using grounded Google Search.",
  },
  category: "research-grounding",
  riskLevel: "moderate",
  requiresApproval: false,
  supportsCancellation: true,
  supportsIdempotency: true,
  timeoutMs: 18000,
  maxRetries: 2,
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", minLength: 3 },
      language: { type: "string", enum: ["om", "en"], default: "om" },
    },
    required: ["query"],
  },
  async execute(input: any): Promise<NormalizedToolResult> {
    const startTime = Date.now();
    try {
      const response = await fetch("/api/google-search-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: String(input.query).trim().slice(0, 300),
          language: input.language || "om",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from search grounding`);
      }

      const resData = await response.json();
      return {
        toolName: "web_grounding",
        callId: `call_grounding_${Date.now()}`,
        status: "success",
        data: resData,
        metadata: {
          durationMs: Date.now() - startTime,
          truncated: false,
          source: "Google Search via Gemini Grounding",
          timestamp: Date.now(),
        },
      };
    } catch (err: any) {
      return {
        toolName: "web_grounding",
        callId: `call_grounding_err_${Date.now()}`,
        status: "failure",
        error: {
          code: "GROUNDING_FETCH_ERROR",
          message: err?.message || "Failed to query grounding service",
          retryable: true,
        },
        metadata: {
          durationMs: Date.now() - startTime,
          truncated: false,
          timestamp: Date.now(),
        },
      };
    }
  },
};

/**
 * Tool 5: Safe Connectors & Webhook Dispatcher
 */
export const connectorsWebhookTool: ToolDefinition = {
  name: "connectors_webhook",
  version: "1.0.0",
  description: {
    om: "API alaa fi webhook nagaan yaaluu, qindeessuu, fi erguuf tajaajila.",
    en: "Dispatches safe external webhooks and REST requests with HTTP protocol validation and timeout bounds.",
  },
  category: "connectors-export",
  riskLevel: "high",
  requiresApproval: true, // Requires user confirmation due to potential external side effects!
  supportsCancellation: true,
  supportsIdempotency: false,
  timeoutMs: 12000,
  maxRetries: 1,
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string" },
      method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], default: "GET" },
      headers: { type: "object" },
      body: { type: "object" },
    },
    required: ["url"],
  },
  async execute(input: any): Promise<NormalizedToolResult> {
    const startTime = Date.now();
    try {
      const targetUrl = String(input.url).trim();
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        return {
          toolName: "connectors_webhook",
          callId: `call_conn_${Date.now()}`,
          status: "denied",
          error: {
            code: "INVALID_PROTOCOL",
            message: "Only http:// and https:// destinations are permitted",
            retryable: false,
          },
          metadata: { durationMs: 0, truncated: false, timestamp: Date.now() },
        };
      }

      const response = await fetch("/api/connectors/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const resData = await response.json();
      return {
        toolName: "connectors_webhook",
        callId: `call_conn_${Date.now()}`,
        status: resData.success ? "success" : "failure",
        data: resData,
        metadata: {
          durationMs: Date.now() - startTime,
          truncated: false,
          source: targetUrl,
          timestamp: Date.now(),
        },
      };
    } catch (err: any) {
      return {
        toolName: "connectors_webhook",
        callId: `call_conn_err_${Date.now()}`,
        status: "failure",
        error: {
          code: "CONNECTOR_DISPATCH_FAILED",
          message: err?.message || "Connector webhook failed",
          retryable: false,
        },
        metadata: { durationMs: Date.now() - startTime, truncated: false, timestamp: Date.now() },
      };
    }
  },
};

/**
 * Tool 6: System Diagnostics & Health Telemetry
 */
export const systemDiagnosticsTool: ToolDefinition = {
  name: "system_diagnostics",
  version: "1.1.0",
  description: {
    om: "Fayyaa sirnaa, saffisa moodeelotaa, fi kuusaa cache to'ata.",
    en: "Retrieves runtime system diagnostics, active models health, uptime, and cache statistics.",
  },
  category: "system-diagnostics",
  riskLevel: "low",
  requiresApproval: false,
  supportsCancellation: true,
  supportsIdempotency: true,
  timeoutMs: 4000,
  maxRetries: 1,
  inputSchema: {
    type: "object",
    properties: {
      verbose: { type: "boolean", default: false },
    },
  },
  async execute(): Promise<NormalizedToolResult> {
    const startTime = Date.now();
    try {
      const response = await fetch("/api/connectors/system-health");
      const data = await response.json();
      return {
        toolName: "system_diagnostics",
        callId: `call_diag_${Date.now()}`,
        status: "success",
        data,
        metadata: {
          durationMs: Date.now() - startTime,
          truncated: false,
          source: "/api/connectors/system-health",
          timestamp: Date.now(),
        },
      };
    } catch (err: any) {
      return {
        toolName: "system_diagnostics",
        callId: `call_diag_err_${Date.now()}`,
        status: "failure",
        error: {
          code: "DIAGNOSTICS_FETCH_FAILED",
          message: err?.message || "Failed to fetch diagnostics",
          retryable: true,
        },
        metadata: { durationMs: Date.now() - startTime, truncated: false, timestamp: Date.now() },
      };
    }
  },
};

// Register all core tools
registerTool(monteCarloTool);
registerTool(oddsProbabilityTool);
registerTool(documentAnalyzerTool);
registerTool(webGroundingTool);
registerTool(connectorsWebhookTool);
registerTool(systemDiagnosticsTool);

// ============================================================================
// 4. Safe Tool Execution Pipeline with Validation & Loop Prevention
// ============================================================================

export interface ToolExecutionContext {
  userId: string;
  missionId?: string;
  fingerprintsSeen?: Set<string>;
  isHumanInTheLoop?: boolean;
  onApprovalRequired?: (approvalPayload: {
    toolName: string;
    parameters: Record<string, any>;
    riskLevel: ToolRiskLevel;
    rationale: string;
  }) => Promise<boolean>;
}

export async function executeToolSafely(
  toolName: string,
  rawInput: Record<string, any>,
  context: ToolExecutionContext
): Promise<NormalizedToolResult> {
  const startTime = Date.now();
  const tool = getTool(toolName);

  // 1. Tool Existence Check
  if (!tool) {
    return {
      toolName,
      callId: `call_err_${Date.now()}`,
      status: "failure",
      error: {
        code: "INVALID_TOOL_NAME",
        message: `Tool '${toolName}' is not registered in the QAXALE Unified Registry.`,
        retryable: false,
      },
      metadata: { durationMs: 0, truncated: false, timestamp: Date.now() },
    };
  }

  // 2. Loop & Repetition Protection via Action Fingerprint
  const fingerprint = computeActionFingerprint(toolName, rawInput);
  if (context.fingerprintsSeen) {
    if (context.fingerprintsSeen.has(fingerprint)) {
      return {
        toolName,
        callId: `call_loop_${Date.now()}`,
        status: "denied",
        error: {
          code: "LOOP_DETECTED",
          message: `Blocked duplicate execution loop for ${toolName} with identical parameters.`,
          retryable: false,
        },
        metadata: { durationMs: 0, truncated: false, timestamp: Date.now(), fingerprint },
      };
    }
    context.fingerprintsSeen.add(fingerprint);
  }

  // 3. Consequential Side-Effect & Approval Check
  if (tool.requiresApproval || (context.isHumanInTheLoop && (tool.riskLevel === "high" || tool.riskLevel === "critical"))) {
    if (context.onApprovalRequired) {
      const approved = await context.onApprovalRequired({
        toolName,
        parameters: rawInput,
        riskLevel: tool.riskLevel,
        rationale: `Tool '${toolName}' has risk level '${tool.riskLevel}' and requires explicit confirmation.`,
      });
      if (!approved) {
        return {
          toolName,
          callId: `call_denied_${Date.now()}`,
          status: "denied",
          error: {
            code: "APPROVAL_REJECTED",
            message: "User declined authorization to execute this consequential tool action.",
            retryable: false,
          },
          metadata: { durationMs: Date.now() - startTime, truncated: false, timestamp: Date.now(), fingerprint },
        };
      }
    }
  }

  // 4. Basic Schema Sanity Check
  if (tool.inputSchema?.required && Array.isArray(tool.inputSchema.required)) {
    for (const reqField of tool.inputSchema.required) {
      if (rawInput[reqField] === undefined || rawInput[reqField] === null || rawInput[reqField] === "") {
        return {
          toolName,
          callId: `call_val_err_${Date.now()}`,
          status: "failure",
          error: {
            code: "MISSING_REQUIRED_PARAMETER",
            message: `Required parameter '${reqField}' missing for tool '${toolName}'.`,
            retryable: false,
            details: { requiredFields: tool.inputSchema.required },
          },
          metadata: { durationMs: 0, truncated: false, timestamp: Date.now(), fingerprint },
        };
      }
    }
  }

  // 5. Execution with Bounded Timeout
  try {
    const timeoutPromise = new Promise<NormalizedToolResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Tool '${toolName}' timed out after ${tool.timeoutMs}ms.`));
      }, tool.timeoutMs);
    });

    const execPromise = tool.execute ? tool.execute(rawInput, context) : Promise.reject(new Error("No execution handler"));
    const result = await Promise.race([execPromise, timeoutPromise]);
    result.metadata.fingerprint = fingerprint;
    return result;
  } catch (err: any) {
    const isTimeout = String(err?.message || "").includes("timed out");
    return {
      toolName,
      callId: `call_exec_err_${Date.now()}`,
      status: isTimeout ? "timeout" : "failure",
      error: {
        code: isTimeout ? "TOOL_TIMEOUT" : "TOOL_EXECUTION_ERROR",
        message: err?.message || "Unexpected tool execution failure",
        retryable: isTimeout || tool.maxRetries > 0,
      },
      metadata: {
        durationMs: Date.now() - startTime,
        truncated: false,
        timestamp: Date.now(),
        fingerprint,
      },
    };
  }
}

// ============================================================================
// 5. Parameter Validation Function & Registry Object Export
// ============================================================================

export function validateToolInput(
  toolName: string,
  rawInput: Record<string, any>
): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const tool = getTool(toolName);
  if (!tool) {
    return {
      isValid: false,
      errors: [{ field: "toolName", message: `Tool '${toolName}' is not registered.` }],
    };
  }

  const errors: Array<{ field: string; message: string }> = [];
  if (tool.inputSchema?.required && Array.isArray(tool.inputSchema.required)) {
    for (const reqField of tool.inputSchema.required) {
      if (rawInput[reqField] === undefined || rawInput[reqField] === null || rawInput[reqField] === "") {
        errors.push({ field: reqField, message: `Required parameter '${reqField}' is missing.` });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const toolRegistry = {
  getTool,
  listTools: listRegisteredTools,
  getToolsByCategory,
  validateParameters: validateToolInput,
  registerTool,
};
