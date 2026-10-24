# ORONID TECH Operations & Security Manual
**Platform:** QAXALE Core Foundation  
**Company:** ORONID TECH  
**Version:** 3.2.0  

---

## 1. Threat Model & Security Boundaries

QAXALE safeguards user trust, computational integrity, and data confidentiality across all ecosystem modules.

### Core Safeguards:
1. **Secret & Key Protection:**
   - Private Gemini keys and server credentials remain strictly server-side (`process.env.GEMINI_API_KEY`).
   - Zero API keys are bundled into Vite or browser assets.
2. **Tenant Isolation:**
   - In multi-tenant environments, every `AgentInvocationContext` and `RequestContext` carries an explicit `tenantId`.
   - Data access queries and Firestore synchronization are partitioned by tenant boundaries.
3. **Emergency Kill-Switches:**
   - The `FeatureFlagService` provides instant kill-switches (`killSwitchActive: true`) allowing immediate shutdown of any feature flag without code deployments.
4. **Safety & Zero-Guarantee Policy:**
   - Gambling and probability tools undergo strict safety validation.
   - Any model output or agent claim asserting "100% sure", "guaranteed profit", or fixed sports wins is blocked and routed to the `selfCorrectionEngine` for automated repair.

---

## 2. Gemini Multi-Model Failover

When calling LLM endpoints, QAXALE routes through an ordered model fallback ladder:
```
Primary: gemini-3.6-flash
Fallback 1: gemini-3.8-flash
Fallback 2: gemini-3.1-flash-lite
Fallback 3: gemini-3.7-flash
Fallback 4: gemini-flash-latest
```
- Cooldown tracking automatically isolates failing models for 60 seconds before retesting.
- In-memory 30-minute query caching prevents redundant token consumption.

---

## 3. Human-in-the-Loop Safeguards

Any action categorized as `HIGH` or `CRITICAL` risk (e.g. database schema modifications, external webhook dispatches) pauses the execution state machine:
- Status transitions to `awaiting_approval`.
- An explicit prompt with tool parameters, risk assessment, and rationale is presented to the user.
- Execution halts until an explicit user authorization callback is received.

---

## 4. Platform Endpoints & Health Monitoring

Operational endpoints available under `/api/platform/*`:
- `GET /api/platform/info`: Platform metadata, company verification, and active pillars.
- `GET /api/platform/modules`: List of registered modules and startup sequence.
- `GET /api/platform/health`: Aggregated health check with latency breakdown.
- `GET /api/platform/flags`: Active feature flags and tenant targeting.
- `POST /api/platform/feedback`: Structured user feedback and evaluation metrics.
