import { Note, Subfolder } from '../types/note';

export const INITIAL_FOLDERS: Subfolder[] = [
  {
    id: 'f-proj-1',
    name: 'Launch & GTM',
    category: 'projects',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'f-proj-2',
    name: 'Audits & Operations',
    category: 'projects',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'f-area-1',
    name: 'Engineering Standards',
    category: 'areas',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'f-area-2',
    name: 'Personal Wellbeing',
    category: 'areas',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'f-res-1',
    name: 'Design Systems',
    category: 'resources',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'f-res-2',
    name: 'Computer Science',
    category: 'resources',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'f-res-3',
    name: 'Cognitive Frameworks',
    category: 'resources',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'f-arch-1',
    name: '2025 Sprints',
    category: 'archives',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 'f-arch-2',
    name: 'Retired Stacks',
    category: 'archives',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'proj-1',
    title: 'Mobile App v2.0 Redesign Launch',
    category: 'projects',
    folderId: 'f-proj-1',
    tags: ['design', 'mobile', 'q4-launch'],
    pinned: true,
    deadline: '2026-11-20',
    createdAt: '2026-10-24T09:30:00.000Z',
    updatedAt: '2026-10-30T16:15:00.000Z',
    content: `# Mobile App v2.0 Redesign Launch

Target shipping deadline: **November 20, 2026**.

## Objective
Deliver an ultra-minimalist, local-first mobile client overhaul adhering to the [[Design System Token Guidelines]]. Eliminate interface latency and achieve sub-50ms cold starts.

## Phase 1 Checklist
- [x] Finalize typography pairings (Inter & JetBrains Mono)
- [x] Establish 12-column responsive grid with 24px gutters
- [x] Integrate zero-pill metadata formatting
- [ ] Build offline-first synchronizer with local SQLite/IndexedDB cache
- [ ] Implement bidirectional wikilink parser for [[Mental Models & Decision Frameworks]]
- [ ] Conduct end-to-end accessibility testing (WCAG AA 4.5:1 contrast)

## Key Technical Dependencies
- Design system token consistency from [[Design System Token Guidelines]].
- Architectural guardrails documented in [[Engineering Best Practices & Code Health]].

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

## Review Notes
The navigation tree now uses indented, clean typographic links with subtle background highlights on active selection, utilizing the primary Indigo accent solely for active state indicators.
`,
  },
  {
    id: 'proj-2',
    title: 'Q4 Financial & Infrastructure Audit',
    category: 'projects',
    folderId: 'f-proj-2',
    tags: ['finance', 'operations', 'compliance'],
    pinned: false,
    deadline: '2026-12-15',
    createdAt: '2026-10-18T14:00:00.000Z',
    updatedAt: '2026-10-29T11:20:00.000Z',
    content: `# Q4 Financial & Infrastructure Audit

Fiscal close and operational readiness review for the upcoming financial year.

## High-Priority Audit Milestones
- [x] Reconcile cloud compute reserved instances
- [x] Audit third-party SaaS subscriptions and seat utilization
- [ ] Align departmental budgets with [[Personal Finance & Investment Horizon]]
- [ ] Prepare tax preparation ledger and multi-entity transfer pricing logs

## Cost Allocation Matrix
- **Compute & CDN**: $1,420 / month (12% decrease year-over-year)
- **Data Stores & Backup**: $680 / month
- **Workspace Tooling**: $340 / month

See historical figures from last year in [[2025 Cloud Migration Post-Mortem]].
`,
  },
  {
    id: 'proj-3',
    title: 'Client Onboarding Automation Flow',
    category: 'projects',
    folderId: 'f-proj-1',
    tags: ['product', 'automation', 'growth'],
    pinned: false,
    deadline: '2026-11-30',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-28T09:45:00.000Z',
    content: `# Client Onboarding Automation Flow

Eliminating manual intervention during workspace configuration for new institutional partners.

## Desired Outcome
Reduce time-to-first-value from 48 hours to under 3 minutes via self-service verification and automated workspace provisioning.

## Execution Items
- [x] Design frictionless 3-step setup modal
- [x] Draft onboarding email sequence with plain text styling
- [ ] Wire webhook triggers to CRM pipeline
- [ ] Validate rate limits as defined in [[Distributed Systems Architecture]]
`,
  },
  {
    id: 'area-1',
    title: 'Engineering Best Practices & Code Health',
    category: 'areas',
    folderId: 'f-area-1',
    tags: ['engineering', 'standards', 'architecture'],
    pinned: true,
    lead: 'Engineering Team',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-31T00:30:00.000Z',
    content: `# Engineering Best Practices & Code Health

Standards of operational excellence maintained across all client and backend repositories.

## Guiding Principles
1. **Local-First Reliability**: Applications must remain fully operational without continuous network connectivity.
2. **Defensive Typing**: Strict TypeScript mode without permissive \`any\` escapes.
3. **Decoupled State**: Unidirectional data flow, isolated stores, and idempotent side-effects.

## Routine Standards
- [x] Maintain automated unit test coverage above 85%
- [x] Zero warnings on production bundle builds
- [ ] Enforce automated dependency security scans every Monday
- [ ] Review distributed logging schema against [[Distributed Systems Architecture]]

## Pull Request Criteria
- Maximum 300 lines of functional diff per reviewable pull request.
- All database migrations must be backwards-compatible and non-blocking.
`,
  },
  {
    id: 'area-2',
    title: 'Physical Health & Endurance Routine',
    category: 'areas',
    folderId: 'f-area-2',
    tags: ['health', 'habits', 'wellness'],
    pinned: false,
    lead: 'Personal',
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-10-27T18:00:00.000Z',
    content: `# Physical Health & Endurance Routine

Baseline physical standards maintained throughout the training cycle.

## Weekly Training Schedule
- **Monday & Thursday**: Heavy Compound Strength (Squat, Overhead Press, Deadlift)
- **Tuesday & Friday**: Zone 2 Aerobic Base Building (45 min continuous rowing / cycling)
- **Wednesday**: Active Mobility & Posterior Chain recovery
- **Saturday**: Long Trail Run (12-15km)
- **Sunday**: Total Rest & Nutrition Planning

## Health Non-Negotiables
- [x] Minimum 7.5 hours nightly sleep duration
- [x] Daily water intake $\\ge 3.0$ liters
- [ ] Weekly post-workout myofascial release session
- [ ] Quarterly biometric and lipid panel review

Applies mental clarity techniques from [[Mental Models & Decision Frameworks]].
`,
  },
  {
    id: 'area-3',
    title: 'Personal Finance & Investment Horizon',
    category: 'areas',
    folderId: 'f-area-2',
    tags: ['finance', 'wealth', 'investing'],
    pinned: false,
    lead: 'Personal',
    createdAt: '2026-07-10T12:00:00.000Z',
    updatedAt: '2026-10-25T14:30:00.000Z',
    content: `# Personal Finance & Investment Horizon

Strategic wealth accumulation and capital preservation standard.

## Target Allocation
- **Broad Market Index Equities**: 65% (global market cap weighted)
- **Short-Term Fixed Income / Treasuries**: 20%
- **Strategic Liquidity & Emergency Reserves**: 15% (liquid cash yields)

## Ongoing Maintenance
- [x] Automated monthly dollar-cost averaging transfers
- [ ] Semi-annual portfolio rebalancing (tolerances $\\pm 5\\%$)
- [ ] Year-end capital loss harvesting audit
`,
  },
  {
    id: 'res-1',
    title: 'Design System Token Guidelines',
    category: 'resources',
    folderId: 'f-res-1',
    tags: ['design-system', 'tokens', 'ui-ux'],
    pinned: true,
    sourceUrl: 'https://stitch.design/para-note-studio',
    createdAt: '2026-09-12T11:00:00.000Z',
    updatedAt: '2026-10-30T17:40:00.000Z',
    content: `# Design System Token Guidelines

Permanent reference for the Minimalist PARA Notes aesthetic language.

## Surface & Contrast Values
- **Surface**: \`#f7f9fb\` (Dominant clean canvas)
- **Surface Container**: \`#eceef0\`
- **Surface Container Lowest**: \`#ffffff\` (Pure card field)
- **Primary Accent**: \`#4648d4\` (Reserved strictly for interactive focus, active PARA items)
- **Outline & Hairlines**: \`#c7c4d7\` / \`#767586\` (1px sharp borders)

## Corner Radius Rules
- Micro-components (tags, checkboxes): \`0.25rem\` (\`rounded\`)
- Cards, inputs, and modals: \`0.5rem\` (\`rounded-lg\`)
- Never use round pill-shaped badges for informational metadata.

## Typography
- Inter with disciplined line heights (26px on 16px body, 48px on 40px headlines).
- Tabular numerals (\`font-mono tabular-nums\`) for counts, dates, and metrics.

Cross-referenced in [[Mobile App v2.0 Redesign Launch]].
`,
  },
  {
    id: 'res-2',
    title: 'Distributed Systems Architecture',
    category: 'resources',
    folderId: 'f-res-2',
    tags: ['architecture', 'cs', 'distributed'],
    pinned: false,
    createdAt: '2026-08-05T15:20:00.000Z',
    updatedAt: '2026-10-26T21:10:00.000Z',
    content: `# Distributed Systems Architecture

Core theorems, consensus mechanisms, and fault-tolerant patterns for resilient software.

## Foundational Theorems
- **CAP Theorem**: Consistency, Availability, Partition Tolerance. Choose two under partition.
- **PACELC Extension**: If partition (P), trade off Availability (A) and Consistency (C); else (E), trade off Latency (L) and Consistency (C).

## Eventual Consistency Patterns
1. **CRDTs (Conflict-free Replicated Data Types)**: State-based (Pn-Counters, LWW-Element-Set) and Operation-based types enabling peer-to-peer merge without locking.
2. **Event Sourcing**: Storing immutable series of domain events instead of mutable snapshot rows.

Referenced in [[Engineering Best Practices & Code Health]] and [[2025 Cloud Migration Post-Mortem]].
`,
  },
  {
    id: 'res-3',
    title: 'Mental Models & Decision Frameworks',
    category: 'resources',
    folderId: 'f-res-3',
    tags: ['thinking', 'frameworks', 'productivity'],
    pinned: false,
    createdAt: '2026-07-22T09:15:00.000Z',
    updatedAt: '2026-10-22T13:00:00.000Z',
    content: `# Mental Models & Decision Frameworks

Cognitive heuristics for strategic planning, engineering design, and prioritization.

## 1. Inversion
Instead of asking "How do we make this project succeed?", ask:
> "What would guarantee absolute failure, and how do we systematically avoid it?"

## 2. First Principles Decomposition
Break systems down into fundamental truths that cannot be deduced any further, then reason upwards from there.

## 3. Second-Order Thinking
Ask: *"And then what?"* Trace downstream consequences over 6, 12, and 36-month horizons before irreversible choices.

Applied continuously within [[Physical Health & Endurance Routine]] and [[Mobile App v2.0 Redesign Launch]].
`,
  },
  {
    id: 'arch-1',
    title: '2025 Cloud Migration Post-Mortem',
    category: 'archives',
    folderId: 'f-arch-1',
    tags: ['retrospective', 'infrastructure', 'cloud'],
    pinned: false,
    createdAt: '2025-12-18T10:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z',
    content: `# 2025 Cloud Migration Post-Mortem

Retrospective analysis of the datacenter transition to multi-region cloud infrastructure.

## Achieved Results
- **P99 Latency**: Dropped from 340ms to 42ms worldwide.
- **Availability SLA**: 99.98% attained over the 12-month period.
- **Operating Cost**: 18% below initial projection.

## Lessons Learned
- Pre-warming serverless pools prevented initial cold-start spikes during surge hours.
- Automated rollback thresholds caught 2 silent regression bugs before impacting customers.

Archived reference for [[Q4 Financial & Infrastructure Audit]].
`,
  },
  {
    id: 'arch-2',
    title: 'Legacy Monolith Deprecation Plan',
    category: 'archives',
    folderId: 'f-arch-2',
    tags: ['migration', 'legacy', 'deprecated'],
    pinned: false,
    createdAt: '2025-06-10T14:30:00.000Z',
    updatedAt: '2025-11-15T16:00:00.000Z',
    content: `# Legacy Monolith Deprecation Plan

Execution record for retiring the monolithic API cluster in favor of modular edge services.

## Decommissioning Summary
- All ingress traffic successfully rerouted to v2 endpoints.
- Database read replicas archived to cold cold storage.
- Final infrastructure teardown certified on November 15, 2025.
`,
  },
];
