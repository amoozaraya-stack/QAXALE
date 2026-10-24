/**
 * ORONID TECH Platform Feature Flags & Governance
 * Provides dynamic feature flag evaluation, tenant/user targeting,
 * percentage rollouts, and instant emergency kill-switches.
 * Author: Hamza Yasin / ORONID TECH
 */

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0 - 100
  allowedTenants?: string[];
  allowedUsers?: string[];
  killSwitchActive?: boolean;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Map<string, FeatureFlag> = new Map();

  private constructor() {
    this.registerDefaultFlags();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Registers default feature flags across the ORONID TECH ecosystem.
   */
  private registerDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: "cognitive_hierarchical_planning",
        name: "Cognitive Hierarchical Planning",
        description: "Enables DAG generation and topological step execution in autonomous tasks.",
        enabled: true,
        rolloutPercentage: 100,
      },
      {
        key: "kilimaanjaroo_deep_morphology",
        name: "KILIMAANJAROO Deep Morphology Engine",
        description: "Enables advanced Afaan Oromoo grammar deconstruction and root extraction.",
        enabled: true,
        rolloutPercentage: 100,
      },
      {
        key: "multi_agent_critic_reflection",
        name: "Multi-Agent Reflection & Critique",
        description: "Executes 7-dimension critique on complex agent outputs before final synthesis.",
        enabled: true,
        rolloutPercentage: 100,
      },
      {
        key: "developer_api_external_access",
        name: "Developer API Gateway",
        description: "Controls external API key access for 3rd-party ORONID TECH integrations.",
        enabled: true,
        rolloutPercentage: 50,
      },
      {
        key: "experimental_monte_carlo_gpu",
        name: "GPU-Accelerated Monte Carlo",
        description: "Experimental client-side WebGL acceleration for large probability simulations.",
        enabled: false,
        rolloutPercentage: 0,
      },
      {
        key: "strict_safety_filter",
        name: "Strict Safety & Gambling Risk Disclaimers",
        description: "Mandatory zero-guarantee filtering and variance education on probability queries.",
        enabled: true,
        rolloutPercentage: 100,
        killSwitchActive: false,
      },
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.key, flag);
    }
  }

  /**
   * Evaluates if a feature flag is enabled for a specific request context.
   */
  public isEnabled(
    flagKey: string,
    context?: { userId?: string; tenantId?: string }
  ): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    // Emergency kill switch overrides all other rules
    if (flag.killSwitchActive) {
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // Tenant check
    if (flag.allowedTenants && flag.allowedTenants.length > 0) {
      if (!context?.tenantId || !flag.allowedTenants.includes(context.tenantId)) {
        return false;
      }
    }

    // User check
    if (flag.allowedUsers && flag.allowedUsers.length > 0) {
      if (!context?.userId || !flag.allowedUsers.includes(context.userId)) {
        return false;
      }
    }

    // Percentage rollout evaluation (deterministic pseudo-hash based on userId or default)
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      if (flag.rolloutPercentage <= 0) return false;
      const targetStr = context?.userId || "anon";
      let hash = 0;
      for (let i = 0; i < targetStr.length; i++) {
        hash = (hash << 5) - hash + targetStr.charCodeAt(i);
        hash |= 0;
      }
      const score = Math.abs(hash) % 100;
      return score < flag.rolloutPercentage;
    }

    return true;
  }

  /**
   * Activates an emergency kill switch for a feature flag.
   */
  public activateKillSwitch(flagKey: string): void {
    const flag = this.flags.get(flagKey);
    if (flag) {
      flag.killSwitchActive = true;
      console.warn(`[ORONID TECH SECURITY] EMERGENCY KILL SWITCH ACTIVATED for '${flagKey}'`);
    }
  }

  /**
   * Deactivates an emergency kill switch.
   */
  public deactivateKillSwitch(flagKey: string): void {
    const flag = this.flags.get(flagKey);
    if (flag) {
      flag.killSwitchActive = false;
    }
  }

  /**
   * Sets or overrides a feature flag.
   */
  public setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
  }

  /**
   * Retrieves all registered feature flags.
   */
  public listFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

export const featureFlagService = FeatureFlagService.getInstance();
