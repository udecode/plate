# Plate Compound Engineering Tree

This is the Plate-specific reduction of the Compound Engineering agent tree.

It is grounded in:

- `skiller-lock.json` for what Plate actually installed from `EveryInc/compound-engineering-plugin`
- `.agents/rules/task.mdc` for the default task lane
- `.agents/rules/major-task.mdc` for the heavyweight architecture/comparison lane
- `.agents/rules/agent-browser-issue.mdc` for the browser parity escalation
- `.agents/AGENTS.md` for explicit exclusions

This is not the whole plugin zoo. It is the slice Plate actually keeps, where it is wired, and why the rest stays dead.

## Actual Plate Tree

```text
Plate CE set
├── task lane
│   ├── ce:brainstorm
│   ├── learnings-researcher
│   ├── framework-docs-researcher (conditional, second-pass only)
│   ├── risky-change review lane
│   │   ├── ce-review
│   │   ├── correctness-reviewer
│   │   ├── maintainability-reviewer
│   │   ├── project-standards-reviewer
│   │   └── code-simplicity-reviewer
│   └── agent-native parity lane
│       └── agent-native-reviewer
├── major-task lane
│   ├── ce:plan
│   ├── learnings-researcher
│   ├── repo-research-analyst
│   ├── architecture-strategist
│   ├── pattern-recognition-specialist
│   ├── framework-docs-researcher (conditional, after local clone/source pass)
│   ├── best-practices-researcher (conditional)
│   ├── performance-oracle
│   ├── spec-flow-analyzer
│   └── issue-intelligence-analyst / git-history-analyzer (conditional)
└── major-task conditional document-review pass
    ├── coherence-reviewer
    ├── feasibility-reviewer
    ├── scope-guardian-reviewer
    ├── product-lens-reviewer
    └── adversarial-document-reviewer
```

## Installed CE Agents

### Research

- `best-practices-researcher`
- `framework-docs-researcher`
- `git-history-analyzer`
- `issue-intelligence-analyst`
- `learnings-researcher`
- `repo-research-analyst`

### Review

- `agent-native-reviewer`
- `architecture-strategist`
- `code-simplicity-reviewer`
- `correctness-reviewer`
- `maintainability-reviewer`
- `pattern-recognition-specialist`
- `performance-oracle`
- `project-standards-reviewer`

### Workflow

- `spec-flow-analyzer`

### Document Review

- `adversarial-document-reviewer`
- `coherence-reviewer`
- `feasibility-reviewer`
- `product-lens-reviewer`
- `scope-guardian-reviewer`

## Where Plate Uses Them

## `task.mdc`

Direct CE references in `.agents/rules/task.mdc`:

- `ce:brainstorm`
  Use when the task is still mushy after reading the source of truth and nearby code.
- `learnings-researcher`
  Default early pass for repeated domains, prior solutions, and non-trivial work.
- `framework-docs-researcher`
  Conditional only. Use after the AGENTS-required local clone/source/docs pass when third-party behavior is still unclear, unfamiliar, or version-sensitive.
- `ce-review`
- `correctness-reviewer`
- `maintainability-reviewer`
- `project-standards-reviewer`
- `code-simplicity-reviewer`
  This is the risky-change review lane. It is not default. It is reserved for risky, large, user-facing, or architecture-sensitive work.
- `agent-native-reviewer`
  Separate conditional lane. Use only for `.agents/**`, `.claude/**`, AI/tooling surfaces, commands, or user-action parity work.

Companion rule outside the CE tree:

- `.agents/rules/agent-browser-issue.mdc`
  If browser/tool automation exposes a reusable action-parity gap, it tells the task flow to load `agent-native-reviewer` and capture that gap as a real follow-up instead of shrugging.

What `task` does not do:

- It does not default to the full CE review zoo.
- It does not default to document-review personas.
- It does not default to architecture research unless intake escalates to `major-task`.

## `major-task.mdc`

Direct CE references in `.agents/rules/major-task.mdc`:

- `ce:plan`
  Main planning spine for heavyweight work.
- `learnings-researcher`
  Early repo-memory pass when prior decisions matter.
- `repo-research-analyst`
  Default repo-grounding helper for major work.
- `architecture-strategist`
  Public API, layering, ownership, abstraction cleanup, and cross-package refactor work.
- `pattern-recognition-specialist`
  Repo-wide pattern extraction, repeated smell detection, and consistency analysis across packages.
- `framework-docs-researcher`
  Conditional second pass only. Local clone and source reading come first per AGENTS. This comes in when official docs are needed to settle third-party behavior or compare competing frameworks honestly.
- `best-practices-researcher`
  Only when official docs still leave gaps or the task genuinely needs wider field patterns.
- `performance-oracle`
  Explicit performance and optimization lane. Used for benchmark design, scalability analysis, hot-path tradeoffs, and editor/runtime comparison strategy.
- `spec-flow-analyzer`
  RFC, proposal, acceptance-criteria, rollout, and completeness pressure-testing.
- `issue-intelligence-analyst` or `git-history-analyzer`
  Conditional only when issue churn, historical regressions, or design history matter.

`major-task` also points editor-framework analysis at:

- `docs/analysis/editor-architecture-candidates.md`

That keeps comparison work bounded instead of widening into random framework tourism.

### `major-task` document-review pass

These are no longer manual-only. They are conditionally wired into `major-task`:

- `coherence-reviewer`
- `feasibility-reviewer`
  Default pair for explicit plan, RFC, proposal, or spec review.
- `scope-guardian-reviewer`
  Add when abstraction count, rollout shape, or scope drift smells inflated.
- `product-lens-reviewer`
  Add when the document makes product framing, value, roadmap, or "are we solving the right problem?" claims.
- `adversarial-document-reviewer`
  Add when the doc is large, assumption-heavy, architecture-heavy, or high-stakes enough to deserve premise stress-testing.

The rule is selective. `major-task` does not load every reviewer just because a doc exists.

### `major-task` performance and comparison lane

This is the sharpest major-task branch for Plate-specific framework work:

- define the workload first
- separate measured evidence from hypothesis
- compare equivalent workloads, not vibes
- start from repo constraints before internet takes
- for editor-framework performance questions:
  - prefer `Plate vs Slate` first for direct inheritance pressure
  - use `ProseMirror` and `Lexical` for deeper runtime or architecture direction
  - use `Tiptap` more for product-layer or packaging cost than raw engine performance
  - use `Pretext` and `Premirror` for pagination, composition, and layout-aware editing questions

## Rejected Or Deferred

### Wrong repo shape

- `data-integrity-guardian`
- `data-migration-expert`
- `data-migrations-reviewer`
- `schema-drift-detector`
- `deployment-verification-agent`
- `api-contract-reviewer`

Reason:

- Plate is a framework/editor monorepo, not a migration-heavy or deploy-heavy product app.
- These agents bias toward data-plane or operational concerns that are not central here.

### Wrong stack

- `dhh-rails-reviewer`
- `kieran-rails-reviewer`
- `kieran-python-reviewer`

Reason:

- Wrong language family.
- Installing them would just add noise and fake sophistication.

### Workflow noise

- `previous-comments-reviewer`
- `pr-comment-resolver`
- `figma-design-sync`
- `bug-reproduction-validator`

Reason:

- PR-thread replay, Figma sync, and extra browser-validator choreography are not part of Plate's default execution model.
- Plate already has its own task, review, and browser flows.

### Overkill for default Plate use

- `security-lens-reviewer`
- `design-lens-reviewer`
- `security-reviewer`
- `security-sentinel`
- `reliability-reviewer`
- `performance-reviewer`
- `adversarial-reviewer`
- `julik-frontend-races-reviewer`
- `kieran-typescript-reviewer`

Reason:

- Some are legit, but not legit enough to justify default install.
- Plate wanted a lean set that earns its keep.
- Add one later on proof, not because the catalog exists.

### Orphan / not first-class yet

- `design-implementation-reviewer`
- `ankane-readme-writer`
- `cli-agent-readiness-reviewer`

Reason:

- No strong first-class parent skill in the current CE tree.
- Not worth pulling into Plate just because they are lying around.

## Why This Shape

Plate wanted two modes:

1. `task` stays lean for normal issue execution.
2. `major-task` handles architecture, comparison, benchmark, and proposal work without turning every task into a research circus.

That means:

- keep a small serious research spine
- keep a small serious risky-change review spine
- wire document-review agents conditionally behind `major-task`
- keep performance/comparison work explicit and evidence-first
- reject data/deploy/Rails/Figma/PR-thread sludge

That is the current best-fit CE slice for Plate.
