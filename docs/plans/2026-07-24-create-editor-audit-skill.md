# create editor audit skill

Objective:
Create Editor Audit skill; done when source routing, API doctrine, generated
skill, forward test, and checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-create-editor-audit-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: current thread
- title: Create a generic external-editor architecture audit skill
- acceptance criteria:
  - title has at most two words;
  - generic one-to-many local editor repository inputs;
  - no Wordgard-, Lexical-, ProseMirror-, or donor-specific mechanism list;
  - exhaustive atomic-concept accounting without scoring trivial helpers;
  - every material change candidate shows current and proposed public/internal
    shape;
  - public call-shape decisions use `best-api` rather than duplicating it;
  - accepted architecture/adoption routes to `plite-plan` or `plate-plan`;
  - avoid score-chasing and machinery added merely to look more complete;
  - source routing, generated mirror, validation, agent-native review, and a
    realistic forward test pass.
  - every audit records repository identity, source URL/path, audited commit,
    audit date, and artifact/schema version;
  - `sync` pulls each audited repository, computes the exact
    `<last-audited-commit>..HEAD` range, updates only concepts affected by that
    diff while revalidating dependencies, and advances the stored hash only
    after proof passes;
  - `sync` also routes changed/new tests to `editor-test-harvester` and new or
    changed issue evidence to `issue-harvester`;
  - interrupted or failed sync never advances the last verified audit hash;
  - overlap with `editor-test-harvester`, `issue-harvester`,
    `slate-research`, `major-task`, `best-api`, `plite-plan`, `plate-plan`,
    `architecture-cleanup`, and `clawsweeper` is explicitly resolved;
  - the stale `slate-research` topology is either retained with a precise
    non-overlapping owner or hard-cut/migrated with all source references
    repaired.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary artifact and forward-test gates
- improvement loop: close actionable validation and reviewer findings
- final score / loop closure: N/A: no timed loop

Completion threshold:
- `.agents/rules/editor-audit.mdc` exists, has a two-word title, accepts one or
  many repository paths, owns only comparative research/scoring, requires
  current-versus-proposed shapes for material candidates, and routes public API
  decisions to `best-api` plus accepted architecture to the correct layer plan.
- The audit state records immutable verified commit provenance. `sync` is
  resumable, diff-bounded, dependency-aware, and invokes the test/issue owners
  for changed upstream evidence without merging their ledgers into the
  architecture audit.
- `best-api` and the smallest Vision owner state that quality means the smallest
  truthful material improvement, not maximum machinery or rubric score.
- `.agents/AGENTS.md` routes external editor architecture comparisons to the new
  skill; generated mirrors are synced by `pnpm install`.
- source validation, agent-native review, realistic forward test, and final
  goal checker pass with no accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-create-editor-audit-skill.md` passes.

Verification surface:
- focused source audits of rule, routing, Vision doctrine, and generated skill;
- source/generated body equality after `pnpm install`;
- repo skill validation command discovered from current tooling;
- `agent-native-reviewer` capability map;
- forward test using a generic one-or-many repository invocation without
  seeding the expected answer;
- forward test of `sync` state transitions, diff range, failure behavior, and
  test/issue routing without mutating an actual external checkout;
- final `check-complete.mjs`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep the skill concise and generic; do not embed donor-specific architecture
  inventories or reproduce `best-api`, `plite-plan`, or `plate-plan`.
- Do not implement or modify editor/package runtime code.

Boundaries:
- Source of truth: current user request, `.agents/AGENTS.md`,
  `.agents/rules/best-api.mdc`, relevant Vision doctrine, and repo-local skill
  generation conventions.
- Allowed edit scope: `.agents/rules/editor-audit.mdc`,
  `.agents/rules/best-api.mdc`, `.agents/rules/editor-test-harvester.mdc`,
  `.agents/rules/issue-harvester.mdc`, `.agents/rules/major-task.mdc`,
  `.agents/rules/plite-plan.mdc`, `.agents/rules/plate-plan.mdc`,
  `.agents/rules/slate-research.mdc` or its hard-cut replacement,
  source references to that research owner, `.agents/AGENTS.md`, the smallest
  relevant `VISION.md` or `docs/vision/**` owner, the existing research helper
  usage text, generated agent mirrors via `pnpm install`, and this goal plan.
- Browser surface: none; agent workflow/source-only change.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or tracker target.
- Non-goals: no external-repository audit execution, no editor implementation,
  no public package API change, no PR/commit/push, no donor-specific rules, no
  background sync daemon, no automatic issue-by-issue processing, no new
  lifecycle engine, and no duplicate plan owner.

Output budget strategy:
- Read exact source rules and one or two nearby skill owners; use focused `rg`
  for routing/validation discovery; cap diffs and reviewer output; exclude
  generated/build/dependency trees except the generated skill mirror.

Blocked condition:
- Stop only if repo-native skill generation/validation cannot create a
  discoverable source-owned skill without changing unrelated infrastructure.

Task state:
- task_type: agent workflow and reusable API doctrine
- task_complexity: normal
- current_phase: verification
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: keep discovery as `plite-research`; create `editor-audit` for bounded
  exhaustive comparison and commit-aware sync; keep test/issue ledgers in their
  harvesters
- confidence: high after source/generated sync and 30/30 forward contract
- next owner: goal closeout
- reason: discovery, architecture comparison, public shape, test evidence,
  issue closure, and layer planning are distinct resumable jobs.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-create-editor-audit-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, boundaries, non-goals, proof, and stop condition recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `skill-creator`, `best-api`, `autogoal`, and `agent-native-reviewer`; named owner gap recorded. |
| Active goal checked or created | yes | No prior goal; current goal created with this plan path. |
| Source of truth read before edits | yes | Read exact source rules for `best-api`, `editor-test-harvester`, `issue-harvester`, `slate-research`, `major-task`, `plite-plan`, `plate-plan`, routing, and common/plite Vision doctrine. |
| Tracker comments and attachments read | no | N/A: direct request, no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent rule creation, not product-code diagnosis. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: agent rule only; no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact-file reads and focused capped audits recorded above. |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan. |
| Agent-facing action surface identified | yes | One-to-many external editor architecture audit invocation and handoff routing. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` and `.agents/AGENTS.md`; regenerate mirrors with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded complete skill before edits. |

Work Checklist:
- [x] N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording.
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A, agent rules only.
      N/A with reason.
- [x] Final handoff shape decided: changed owners, invocation, proof, deliberate
      exclusions, and no PR/tracker line.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: N/A, no branch/PR requested.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: run reinstall only if install fails
      with the documented dependency/runtime-rot signals.
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: all proof runs in
      `/Users/zbeyens/git/plate-2` against repo-owned sources and mirrors.
      owns the changed behavior.
- [x] High-risk note: agent routing can silently misroute broad audits or
      duplicate `best-api`/layer-plan ownership; forward test and capability
      map are mandatory.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review target is `agent-native-reviewer`; autoreview is N/A because this
      is agent-rule/docs-only work with no product implementation.
- [x] Agent-native review required and loaded for the skill/routing change.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded; follow through verification.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced by two successful
      `pnpm install` runs; eight touched source/generated bodies match.
- [x] Agent-native pack: accepted agent-native review findings are fixed;
      generic-validator incompatibility is rejected with reason below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named source/generation/forward checks | 30/30 contract checks pass; eight generated bodies match source. |
| Bug reproduced before fix | no | N/A | N/A: workflow creation, not a runtime bug. |
| Targeted behavior verification | yes | Verify `audit`, `sync`, cursors, and routing | 30/30 forward contract passes. |
| TypeScript or typed config changed | no | N/A | N/A: no TypeScript/config API changed. |
| Package exports or file layout changed | no | N/A | N/A: no package exports; `pnpm brl` not applicable. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` | Passed twice; Skiller generated current mirrors. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Passed; old `slate-research` mirror removed, new skills generated. |
| Workspace authority proof | yes | Run checks in owning repo | All checks ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | N/A: no app/browser surface. |
| Browser final proof | no | N/A | N/A: no browser claim. |
| CI-controlled template output changed | no | N/A | N/A: no template source/output touched intentionally. |
| Package behavior or public API changed | no | N/A | N/A: no package release or changeset. |
| Registry-only component work changed | no | N/A | N/A: no registry component. |
| Docs or content changed | yes | Verify internal doctrine/source claims | Focused source audits and generated routing checks pass; no rendered product docs. |
| High-risk mini gate | yes | Record failure modes and proof | Dirty reference checkout, rewritten history, shared-cursor corruption, and issue-provider failure are handled explicitly. |
| Agent-native review for agent/tooling changes | yes | Close accepted findings | PASS after cursor and branch/upstream fixes; capability map below. |
| Local install corruption suspected | no | N/A | N/A: install/generation succeeded normally. |
| Autoreview for non-trivial implementation changes | no | N/A | N/A: agent-rule/internal-doc task; agent-native review is the owning gate. |
| PR create or update | no | N/A | N/A: user did not request PR. |
| Task-style PR body verified | no | N/A | N/A: no PR. |
| PR proof image hosting | no | N/A | N/A: no PR/browser image. |
| Tracker sync-back | no | N/A | N/A: direct request, no tracker. |
| Final handoff contract | yes | Fill final handoff below | Filled below; final chat remains. |
| Final lint | partial | Run `pnpm lint:fix` or scoped equivalent | Scoped `biome check` and `node --check` pass. Root lint is blocked by 12 unrelated current-tree errors. |
| Output budget discipline | yes | Keep output bounded | Source audits and contract output were capped; one root lint failure emitted bounded diagnostics. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-create-editor-audit-skill.md` | Pass after closing the evidence row and phase statuses. |
| Agent source / generated sync | yes | Run `pnpm install` and compare bodies | Passed for eight touched skills. |
| Agent action discoverability | yes | Source-audit agent routes | Root `AGENTS.md`, source rules, and generated mirrors expose `editor-audit`. |
| Agent-native review | yes | Close accepted findings | PASS; no open actionable finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | related owners read completely; overlap map closed | implementation |
| Implementation | done | source rules, routing, doctrine, sync cursors, and research hard cut applied | verification |
| Verification | done | generation, 30/30 contract, scoped lint pass | closeout |
| PR / tracker sync | done | N/A: not requested | final response |
| Closeout | done | plan evidence and handoff complete; final checker rerun follows | final response |

Findings:
- Accepted P1: test sync originally followed `auditedCommit`; this could skip
  tests after a prior test-lane failure. It now resumes from
  `testHarvestCommit`.
- Accepted P2: a commit cursor without branch/upstream identity could compare a
  different branch. Registry and sync now pin both and refuse branch switching.
- Accepted P2: `slate-research` duplicated future `plite-research` routing and
  overlapped architecture audit. The stale name is hard-cut; discovery remains
  separate and routes selected local repos to `editor-audit`.
- Accepted P2: issue sync must not accidentally process an entire historical
  unchecked queue. `--refresh-only` updates compact issue state and stops.
- Rejected validator finding: global `quick_validate.py` rejects
  repo-supported `argument-hint` and `disable-model-invocation`. Skiller is the
  owning generator and succeeded; changing valid repo metadata would be wrong.
- Root lint remains red on unrelated app/core and old audit-artifact errors;
  scoped changed JavaScript is clean.

Decisions and tradeoffs:
- Keep `plite-research`: broad discovery and exhaustive bounded audit have
  different state, stopping rules, and outputs.
- Create the compact audit registry only with the first real audit; no empty
  infrastructure artifact.
- Track architecture, test, and issue freshness independently. Overall status
  is current only when every applicable lane is current.
- A git diff selects affected concepts but never exempts semantically affected
  dependents from re-audit.
- `issue-harvester --refresh-only` records new/changed issue rows; full issue
  closure remains an explicit issue-harvester run.

Implementation notes:
- Added `.agents/rules/editor-audit.mdc` with `audit` and `sync` modes,
  source-derived atomic accounting, material-value gate, before/after shapes,
  per-layer routing, immutable commit provenance, independent lane cursors, and
  explicit failure behavior.
- Added incremental `--since <commit>` test harvesting and bounded
  `--refresh-only` issue refresh.
- Moved exhaustive external comparison ownership out of `major-task`,
  `plite-plan`, and `plate-plan`; they consume accepted audit output.
- Repaired `best-api`, common Vision, Plite Vision, and AGENTS doctrine so
  quality means the smallest materially justified design, not maximum
  machinery.
- Hard-cut `slate-research` to `plite-research`, repaired source routes and
  helper usage text, and kept discovery distinct from audit.
- Ran Skiller through `pnpm install`; generated mirrors and root agent
  instructions are current.

Review fixes:
## Agent-Native Review

### Verdict

PASS

### Capability Map

| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Audit one or many selected editor repositories | `editor-audit audit --target ... <repos...>` | `.agents/rules/editor-audit.mdc` | generated skill, AGENTS, Vision | 30/30 contract and source/body sync | pass |
| Pull and incrementally re-audit all or named audits | `editor-audit sync [all|id|artifact]` | `.agents/rules/editor-audit.mdc` | future `docs/editor-audits/index.json` created by first audit | cursor/failure contract checks | pass |
| Harvest changed/new upstream tests | `editor-test-harvester <repo> --since <commit>` | `.agents/rules/editor-test-harvester.mdc` | generated skill | own-cursor and delta checks | pass |
| Refresh new/changed issue inventory without draining backlog | `issue-harvester <repo> --refresh-only` | `.agents/rules/issue-harvester.mdc` | generated skill and compact issue ledger | bounded-stop contract check | pass |
| Discover candidate editor repositories | `plite-research` | `.agents/rules/plite-research.mdc` | generated skill and Plite Vision | stale route sweep | pass |
| Decide a public call shape | `best-api` | `.agents/rules/best-api.mdc` | generated skill and common Vision | source/body sync | pass |
| Plan accepted substrate or product work | `plite-plan` / `plate-plan` | corresponding source rules | generated skills | external-ledger duplication sweep | pass |

### Forward Scenarios

- `editor-audit --target transactions ../reference-a ../reference-b` routes to
  one planning-only audit, requires clean immutable snapshots for both
  references, derives concepts from source, shows current/proposed shapes, and
  stops before implementation.
- `editor-audit sync all` reads registered per-target cursors, fast-forwards
  matching branches only, re-audits affected concepts and dependents, resumes
  tests from `testHarvestCommit`, refreshes issues without draining the
  historical queue, advances only successful lanes, and reports per-lane
  freshness.
- Dirty reference source, branch/upstream mismatch, rewritten history, and
  unavailable issue provider produce explicit non-advancing states.

### Accepted / Rejected

- Accepted: independent cursors, branch/upstream pinning, bounded issue refresh,
  and discovery/audit split.
- Rejected: generic `quick_validate.py` frontmatter finding because it does not
  support this repo's Skiller metadata contract.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined patch missed a plan context line | 1 | Split source edits into bounded patches | Resolved; no partial source patch applied. |
| Generic skill validator rejected repo-specific frontmatter | 1 | Use owning Skiller plus repo contract checks | Resolved; generation and mirrors pass. |
| Root `pnpm lint:fix` found unrelated current-tree errors | 1 | Run scoped changed-file lint and record blocker | Scoped Biome and Node checks pass; root caveat retained. |

Verification evidence:
- `pnpm install` twice: pass; Skiller applied source rules.
- generated skill topology: `editor-audit` and `plite-research` present;
  `slate-research` absent.
- eight touched source/generated skill bodies: exact body match.
- forward/source contract: 30/30 pass.
- donor-specific names in `editor-audit`: 0.
- stale `slate-research` source routes outside historical plans: 0.
- donor-specific comparison blocks in `plite-plan` / `plate-plan`: 0.
- `node --check tooling/scripts/plite-research.mjs`: pass.
- `pnpm exec biome check tooling/scripts/plite-research.mjs`: pass.
- `pnpm lint:fix`: blocked by 12 unrelated current-tree errors after applying
  its safe fixes; no reported task-file error.

Final handoff contract:
- PR line: N/A: not requested.
- Issue / tracker line: N/A: direct request.
- Confidence line: high; source/generated and forward contract passed.
- Flow table:
  - Reproduced: N/A: workflow creation, no runtime bug; browser N/A.
  - Verified: 30/30 contract, eight mirror comparisons, scoped lint; browser
    N/A.
- Browser check: N/A: no browser surface.
- Outcome: `editor-audit` created with commit-aware sync and clean owner
  routing; `plite-research` retained as discovery owner.
- Caveat: root lint remains red on unrelated current-tree files.
- Design:
  - Chosen boundary: discovery -> audit -> API/layer plan -> implementation;
    test and issue ledgers remain independent.
  - Why not quick patch: leaving comparison in three planning skills would
    preserve duplicated ownership and no reusable sync state.
  - Why not broader change: no runtime/editor implementation or full issue
    closure was needed to define and verify this workflow.
- Verified: source generation, routing, cursor invariants, and scoped tooling.
- PR body verified: N/A: no PR.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested.
- Issue / tracker: N/A: direct request.
- Browser proof: N/A: no browser surface.
- Caveats: root lint has unrelated current-tree failures.

Timeline:
- 2026-07-24T22:38:25.889Z Task goal plan created.
- 2026-07-25: related skills audited; sync/hash requirements added.
- 2026-07-25: source ownership, doctrine, and research rename implemented.
- 2026-07-25: Skiller sync, agent-native review, and 30/30 forward contract
  passed.
- 2026-07-25: final `check-complete.mjs` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final checker and closeout |
| Where am I going? | Final handoff |
| What is the goal? | Create a generic, commit-aware external editor architecture audit owner |
| What have I learned? | Discovery, exhaustive audit, test harvest, issue closure, API shape, and layer plans need separate cursors and owners |
| What have I done? | Created and synced the skill topology; closed agent-native findings |

Open risks:
- Root lint remains blocked by unrelated current-tree app/core and historical
  audit-artifact errors.
