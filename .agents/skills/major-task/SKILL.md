---
description: Work heavyweight framework or library tasks with planning-first research, selective deep analysis, and rigorous handoff
argument-hint: '[task description | spec path | issue id/link]'
disable-model-invocation: true
name: major-task
metadata:
  skiller:
    source: .agents/rules/major-task.mdc
---

# Major Task

Handle $ARGUMENTS. Use this for architectural, comparative, benchmark, migration, or proposal-grade work where wrong framing is expensive. Be deep, not bloated. Be explicit, not ceremonial.

<task>#$ARGUMENTS</task>

## Core Rules

- Read the source of truth first.
- Plan before drifting into implementation.
- Start from repo constraints, not internet takes.
- Search for existing seams, patterns, and prior decisions before inventing new ones.
- Prefer the smallest heavy stack that can answer the decision.
- Usually load 3 to 5 helpers, not every possible helper.
- Separate facts, inference, and recommendation.
- Do not default to ce-review, browser proof, PR work, or compounding.
- Use external docs only when repo evidence and local clones are not enough or the task explicitly depends on third-party behavior.
- If the task turns into code-changing execution, prefer the best durable seam fix over a local patch.

## Use This For

- Architecture or public API redesign.
- Breaking changes or major cross-package refactors.
- Framework comparison, migration, or tradeoff analysis.
- Benchmarking, profiling strategy, scalability work, or performance-at-scale decisions.
- RFC, proposal, or spec work that needs repo research plus external grounding.
- Explicit review of a serious plan, spec, or proposal.

## Do Not Use This For

- Ordinary bug fixes.
- One-package features.
- Docs-only edits.
- Routine test work.
- Small refactors.
- Normal execution work that is merely non-trivial.

## Intake

1. Classify the input:
   - Plain task text: the user prompt is the source of truth.
   - File path or spec path: read it first.
   - GitHub issue URL: fetch it with `gh issue view` first.
   - GitHub PR URL: fetch it with `gh pr view` first.
   - Bare GitHub issue like `#555`: resolve it against the current `gh` repo first, then fetch it with `gh issue view`.
   - Linear issue link/id: fetch it with the Linear integration first.
2. Read the full source-of-truth context before doing anything else.
3. If the task comes from a ticket, issue, PR, or spec, also read comments and attachments when available.
4. Restate the decision to make, not just the topic.
5. Classify the major-work lane:
   - architecture or public API
   - benchmark or performance
   - framework comparison or migration
   - spec or proposal
   - document review
   - mixed
6. Decide whether the work is:
   - analytical only
   - planning only
   - planning plus later implementation
   - already code-changing execution
7. Load `planning-with-files` immediately.
8. Load `ce:plan` when the work needs a real implementation plan, phased rollout, or a plan artifact.
9. Load `learnings-researcher` early when the domain smells repeated or the repo has prior decisions worth mining.
10. If the work is editor-framework-facing, start from `@docs/analysis/editor-architecture-candidates.md` as the candidate map instead of widening the field randomly.
11. For library or framework questions, inspect the local clone in `..` first per AGENTS. If missing, clone it. Only then reach for official docs.
12. Pick the smallest justified helper stack for the lane.
13. For any tracker source, restate for yourself:

- source type
- source id
- exact title
- decision type: architecture, benchmark, migration, proposal, review, or mixed
- expected outcome
- acceptance criteria or decision criteria
- likely files, packages, or public surfaces affected
- whether there is a real browser surface to verify
- likely highest-leverage seam

14. Read repo instructions and nearby implementation patterns before editing.
15. If the task becomes code-changing work:

- if already on a relevant feature branch, continue there
- otherwise check out `main`, pull the latest `main`, then create a repo-convention branch before editing
- if the task has a tracker id, prefer a branch name that includes it
- run install or setup only when the repo or task actually needs it

16. If the task stays analytical, skip branch and setup noise.
17. If anything important is still ambiguous after the source-of-truth pass and nearby code reading, ask the smallest useful clarifying question.

## Tracked Task Rules

Apply this section only when the task source is a tracker item.

### GitHub

- Treat the GitHub issue or PR as the source of truth.
- Use `gh` for fetch and sync-back.
- If useful, rename the thread to `<issue-number> <issue-title>`.
- If the work becomes code-changing, prefer a branch name that includes the issue number.
- If the task changed code and reached a verified meaningful outcome, create or update the PR before any issue comment unless blocked or the user said not to.
- If the task stayed analytical, only post back when the analysis itself is the deliverable and a comment would help.

### Linear

- Keep the same fetch-first behavior as the dedicated Linear workflow.
- Read the issue, comments, and attachments before analysis.
- Keep comment-back QA-focused.
- Do not force browser proof unless the task actually has a browser surface.

### Tracked Task Non-Rules

- Do not force PR creation for tracker tasks that stayed analytical, ended blocked, or never changed code.
- Do not require tracker comments for inconclusive investigation unless sync-back is useful.
- Do not force screenshots for non-browser analytical work.

## Load Skills Only When Justified

- `planning-with-files`
  Use by default here. Major work should not rely on short-lived memory.
- `ce:plan`
  Use for phased implementation plans, rollout plans, or plan artifacts.
- `learnings-researcher`
  Use early when prior repo decisions, solutions, or repeated failures may matter.
- `repo-research-analyst`
  Default repo-grounding helper for major work.
- `architecture-strategist`
  Use for public API design, layering, ownership boundaries, abstraction cleanup, and major cross-package refactors.
- `pattern-recognition-specialist`
  Use when the question needs repo-wide pattern extraction, repeated smell detection, or design consistency analysis across packages.
- `framework-docs-researcher`
  Use only after local clone/source/docs work per AGENTS is not enough, or when competing framework behavior must be grounded in official docs.
- `best-practices-researcher`
  Use only when official docs leave gaps or the task genuinely needs broader field patterns beyond official sources.
- `performance-oracle`
  Use for benchmark design, scalability analysis, hot-path tradeoffs, or performance validation strategy.
- `spec-flow-analyzer`
  Use for RFCs, proposals, acceptance criteria, rollout plans, and completeness pressure-testing.
- `issue-intelligence-analyst` or `git-history-analyzer`
  Use only when issue churn, historical regressions, or design history matter to the decision.
- `coherence-reviewer` and `feasibility-reviewer`
  Default pair for explicit document review.
- `scope-guardian-reviewer`
  Use when scope, abstraction count, or rollout shape may be inflated.
- `product-lens-reviewer`
  Use when the document is making product framing, value, or roadmap claims.
- `adversarial-document-reviewer`
  Use for larger, riskier, or more assumption-heavy docs where premise stress-testing is worth the cost.
- `ce-review`, `correctness-reviewer`, `maintainability-reviewer`, `project-standards-reviewer`, `code-simplicity-reviewer`
  Use only when major work actually turns into risky code-changing execution or architecture-sensitive diffs.
- `agent-native-reviewer`
  Use only when the change touches `.agents/**`, `.claude/**`, AI/tooling surfaces, commands, or user actions that an agent should also be able to perform.
- `dev-browser`
  Use only when there is a real browser surface to verify.
- `agent-browser-issue`
  Use when browser automation is blocked by a likely reusable tool-side issue that deserves a separate GitHub follow-up.
- `changeset`
  Use when verified work changes a published package under `packages/` and the repo expects release notes before completion.
- `git-commit-push-pr`
  Use when verified code-changing work should ship as a PR.
- `ce-compound`
  Use only after verified, non-trivial work that produced reusable knowledge.

## Execution Paths

### Architecture Or Public API

1. Map the current seams, ownership, public surface, and package boundaries first.
2. Find what already exists before proposing new structure.
3. Prefer changing the seam over papering around it at each call site.
4. Call out blast radius explicitly when the recommendation changes public API or package contracts.
5. If recommending a migration path, include staged rollout, compatibility strategy, and rollback shape.
6. If a smaller seam change and a broader architecture reset are both viable, say why one wins now.

### Performance And Optimization

1. Define the performance question and the decision it should unlock before reading more.
2. State the workload explicitly:
   - typing latency
   - normalization or transform cost
   - selection or cursor stability under load
   - React render churn
   - large-document scaling
   - bundle or startup cost
   - pagination or layout composition cost
3. Capture repo-grounded constraints first:
   - current architecture
   - package boundaries
   - existing perf complaints
   - editor surface being stressed
   - whether the problem is runtime, rendering, layout, or architecture
4. Set explicit criteria up front: latency, throughput, memory, render count, bundle cost, implementation cost, maintenance cost, or similar.
5. Define benchmark scenarios before implementation. No vague "seems faster" bullshit.
6. Separate:
   - measured evidence
   - benchmark plan
   - intuition
7. If the question is comparative, compare equivalent workloads, not vibes or marketing claims.
8. For editor-framework performance comparisons:
   - start from `@docs/analysis/editor-architecture-candidates.md`
   - prefer `Plate vs Slate` first for direct inheritance pressure
   - use `ProseMirror` and `Lexical` when questioning deeper runtime or architecture direction
   - use `Tiptap` more for product-layer or packaging cost than raw engine performance
   - use `Pretext` or `Premirror` when the question is pagination, composition, or layout-aware editing
9. If no measurement exists yet, say so plainly and provide the smallest honest measurement plan.

### Framework Comparison Or Migration

1. For editor-framework comparisons, begin with `@docs/analysis/editor-architecture-candidates.md`.
2. Narrow the candidate set based on the actual decision, not curiosity.
3. Read local clone/source first, then official docs if the clone does not settle the question.
4. Read official docs before blogs or random benchmark posts.
5. Set explicit criteria up front: API ergonomics, extensibility, runtime cost, migration cost, docs quality, maintenance cost, or similar.
6. End with a recommendation, tradeoffs, and what evidence would change the recommendation.

### Spec Or Proposal

1. Use `spec-flow-analyzer` to pressure-test completeness.
2. Define constraints, acceptance criteria, rollout, verification, and open questions before implementation.
3. If the task is still mushy product framing rather than implementation strategy, route to `ce:brainstorm` first.
4. If the spec will be a real decision artifact, run the conditional document-review pass before calling it done.

### Document Review

1. Use this path only for explicit plan, RFC, proposal, or spec review.
2. Default review pair:
   - `coherence-reviewer`
   - `feasibility-reviewer`
3. Add `scope-guardian-reviewer` when the document introduces multiple new abstractions, broad rollout shape, or scope that may have drifted past the stated goal.
4. Add `product-lens-reviewer` when the document is making product framing, roadmap, UX-value, or "are we solving the right thing?" claims.
5. Add `adversarial-document-reviewer` when the document has more than 5 requirements or implementation units, makes significant architectural decisions, proposes new abstractions, or feels high-stakes enough that premise stress-testing is worth the cost.
6. Keep this pass selective. Most docs should not load every reviewer.

### Mixed Major Work

1. Split the work into ordered passes:
   - decision
   - plan
   - review
   - implementation
2. Do not collapse the whole thing into one blob.
3. Make the current pass explicit before doing the next one.

### Code-Changing Major Work

1. Once the decision is made, reduce execution to the smallest meaningful slice that proves the seam.
2. Prefer the cleanest long-term design that fits the slice, not the quickest bolt-on.
3. If existing patterns are weak, improve the pattern or API instead of copying it blindly.
4. Use targeted tests and checks during iteration.
5. Use browser verification only if the work actually hits a browser surface.

### Review Or Investigation

1. Read the relevant diff, files, specs, and surrounding context first.
2. For review tasks, report findings first, ordered by severity, with concrete file references.
3. For investigation tasks, identify the failure mode, probable cause, and next action before changing code.
4. Only implement changes if the user actually asked for them.

## Verification

Keep verification mandatory but proportional.

- Verify claims with repo evidence, official docs, or targeted measurements.
- Benchmark claims need measured scenarios or an explicit measurement plan.
- Comparison claims need criteria-backed reasoning, not vibes.
- For analytical tasks, show where the recommendation came from and what remains uncertain.
- Run targeted tests for changed behavior when code changed.
- Run package or app build and typecheck when relevant to the touched area.
- Run lint when code changed and the repo expects it.
- Run browser verification only for browser or UI tasks.
- Run broader repo-wide gates only when repo instructions require them or the change scope justifies them.
- If verified work changed code, create or update the PR before tracker sync-back unless the user explicitly said not to.
- If the task came from a tracked issue and reached a meaningful outcome, sync back unless the user said not to.
- If UI changed, capture proof from the real browser surface.
- Do not hardcode PR creation, screenshots, or tracker comments for every task.

## Final Handoff

- Recommendation first.
- Keep facts, inferences, and open questions clearly separated.
- If this stayed analytical, skip ship theater.
- If this became code-changing work, follow the same terse final handoff contract as `task.mdc`:
  - same leading tables
  - same verification reporting
  - same browser-proof rules when applicable
  - same PR and tracker sync expectations when applicable
- If this stayed analytical, the handoff must still say:
  - what decision was made
  - what evidence supported it
  - what would change the recommendation
  - what remains open by design

## Post Back To Tracker

Apply this section only when the task came from a tracker item and reached a meaningful outcome.

- If the work changed code, follow the same PR and tracker sync contract as `task.mdc`.
- If the PR contains any real `.changeset/*.md` file, include the managed auto-release block directly at the top of the PR description. Do not wait for CI to add it.
- Use the checked block for patch-only changesets:

  ```md
  <!-- auto-release:start -->
  - [x] Auto release
  <!-- auto-release:end -->
  ```

- Use the unchecked block when any changeset frontmatter entry is `minor` or `major`:

  ```md
  <!-- auto-release:start -->
  - [ ] Auto release
  <!-- auto-release:end -->
  ```

- Omit the block when the PR has no real `.changeset/*.md` file.
- If the work stayed analytical, comment back only when the analysis itself is useful to the tracker owner.
- Keep tracker comments user-facing and outcome-focused.
- Do not dump research process into tracker comments.

## Success Criteria

- Source-of-truth context was read first.
- Relevant local instructions and nearby patterns were read before editing.
- Major-work lane was classified explicitly.
- `planning-with-files` was loaded before the work sprawled.
- Editor-framework comparison stayed bounded by the analysis doc when relevant.
- Local clones/source were checked before external docs when third-party behavior mattered.
- Only the necessary helpers were loaded.
- Document-review personas were conditional, not ceremonial.
- Verification matched whether the work was analytical, planning, or code-changing.
- Final handoff made the recommendation and the evidence easy to scan.
