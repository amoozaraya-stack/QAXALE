# QAXALE-AI

**QAXALE — Afaan Oromoo-first Advanced AI Intelligence Platform**  
Built by **Hamza Yasin** under **ORONID TECH**

---

## Overview

QAXALE is an Afaan Oromoo-first advanced AI intelligence platform that combines intelligent conversation, autonomous agents, learning systems, document analysis, and decision-making tools into one unified multi-user experience.

It is designed to make powerful AI accessible, practical, and culturally relevant — with strong support for both **Afaan Oromoo** and **English**.

---

## Key Features

- **ORONID TECH Platform Foundation**: Modular, contract-driven architecture (`src/services/platform/`) supporting the 8 strategic ecosystem pillars (`QAXALE.AI`, `KILIMAANJAROO`, `Learning & Education`, `Agents & Tools`, `Community & Knowledge`, `Developer Platform`, `Admin & Operations`, `Mobile Clients`).
- **Advanced Multi-Agent Cognitive Orchestrator**: Strongly typed task execution foundation (`src/services/orchestrator.ts`) with `AgentInvocationContext`, `AgentResult<T>`, budget tracking, 7-dimension critique, and bounded self-correction.
- **Advanced AI Chat**: Multiple reasoning modes (Feynman technique, Socratic dialogue, Agency Loop, Code Builder, First-Principles, Demystify & Clarify).
- **Autonomous Agents & Tool Execution**: Self-directed multi-stage cognitive execution pipeline (Perception -> Grounding -> Monte Carlo -> Terminology Bridge -> Adversarial Audit -> Synthesis).
- **Learning System with Progress Tracking**: Structured STEM curriculum, coding challenges, tech dictionary, and persistent XP streak counters.
- **Document & File Analysis**: In-depth text, code snippet, and document synthesis.
- **Decision & Sports Intelligence Tools**: 10,000-iteration Monte Carlo probability engine, implied probability calculators, Half-Kelly bankroll boundaries, and anti-addiction responsible decision support.
- **Multi-User Support with Secure Data Isolation**: Firebase Authentication with strict zero-trust Firestore security rules (ABAC) preventing cross-user data leakage.
- **Afaan Oromoo <-> English Bilingual Support**: Native natural Afaan Oromoo (Qubee) with technical English parity.

---

## Ecosystem Documentation

Comprehensive engineering specifications are available in the [`docs/`](./docs) directory:
- [Platform Architecture & System Specification](./docs/ARCHITECTURE.md)
- [Module Development & Integration Guide](./docs/MODULE_DEVELOPMENT.md)
- [Operations, Security Boundaries & Failover Manual](./docs/OPERATIONS_SECURITY.md)
- [Long-Term Scalability & Ecosystem Roadmap](./docs/ROADMAP.md)

---

## Current Status

**Private** — Currently in active development and upgrading toward a reliable, production-ready platform.

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **AI Engine**: Google Gemini AI (`@google/genai` TypeScript SDK with resilient circuit-breaker failover)
- **Database & Auth**: Firebase Authentication + Google Cloud Firestore (Rules v2)
- **PWA & Offline**: Web App Manifest + Service Worker + Local fallback caching

---

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/amoozaraya-stack/Qaxale-advanceD.git
cd Qaxale-advanceD
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Add your `GEMINI_API_KEY` and other required configuration values to `.env`.

4. **Run the development server**
```bash
npm run dev
```
Open `http://localhost:3000` to interact with QAXALE.

5. **Build for production**
```bash
npm run build
npm start
```

---

## Contribution

This project is currently private and under active development by **ORONID TECH**.

If you are invited to collaborate:
1. Create a new branch from `main`
2. Make your changes adhering to TypeScript strict typing and zero-leak security rules
3. Submit a Pull Request with a clear description
4. Wait for review before merging

Please follow clean code practices, maintain multi-user isolation, and keep commits meaningful.

---

## Author

**Hamza Yasin**  
Founder & Lead Architect — **ORONID TECH**

---

## License

Private — All rights reserved.
