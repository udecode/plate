# plite-browser-public-readiness

Objective:
Make `plite-browser` public-ready with official docs and proof gates, without
running an actual publish/release.

Goal plan:
docs/plans/2026-06-15-plite-browser-public-readiness.md

Template:
docs/plans/templates/slate-auto.md

Primary template:
docs/plans/templates/slate-auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `plite-auto`
- prompt / link: "make plite-browser public ready, with official docs, until
  you're 100% satisfied"
- surface / route / package: `.tmp/plite/packages/plite-browser`,
  `.tmp/plite/docs/**`, related examples/tests/import surfaces
- invocation mode: quality/public-readiness loop, no fixed timebox
- minimum runtime / deadline: N/A; stop only when public-readiness gates pass or
  a real blocker/taste checkpoint remains
- completion threshold summary: installable package metadata, deliberate export
  surface, plugin-to-extension naming cleanup, official docs, package tests, and
  final proof ledger are complete.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Closure is legal only when:
  - `plite-browser` no longer looks like a private-only package
    (`private: true`, `0.0.0-private`, private-only README wording, and hidden
    package-table gaps are resolved or explicitly justified).
  - Public API names use Plite language. In particular, no public
    `plugin-contracts` naming remains; contract API is extension/feature-based.
  - The exported subpaths are intentional, documented, and supportable.
    Internal QA plumbing is not accidentally exposed as app API.
  - Official docs teach install, intended audience, subpaths, Playwright usage,
    proof contracts, screenshots/native-selection traces, and boundaries.
  - Release docs may say Plite is verified with `plite-browser`; user docs
    must not imply it is the editor runtime API.
  - Package/type/test/doc verification commands pass or failures are routed with
    concrete owner and blocker.
  - No npm publish, PR, commit, or changeset is performed unless the user asks.
  - Final handoff contains changed list, commands, public API decisions,
    workflow slowdowns, needs-attention, and stopping checkpoints.
  - `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-browser-public-readiness.md`
    passes.

Verification surface:
- Source audits:
  - `rg -n "plugin-contract|PluginContract|0.0.0-private|private proof|private: true|plite-browser" .tmp/plite`
  - package export/import audit for every `plite-browser` subpath.
- Package proofs from `.tmp/plite`:
  - focused `plite-browser` tests/typecheck/build commands discovered from
    package scripts.
  - import/declaration smoke if package scripts do not already cover exported
    subpaths.
- Docs proofs:
  - docs audit for install snippets, public boundaries, package tables, release
    docs, and no stale private-only/public contradiction.
- Plan proof:
  - `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-browser-public-readiness.md`.

Constraints:
- Plite private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Plite behavior commands from `.tmp/plite`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite.

Boundaries:
- Source of truth: live Plite workspace under `.tmp/plite`; this plan is
  the parent-repo autogoal ledger.
- Allowed edit scope: `.tmp/plite/packages/plite-browser/**`,
  `.tmp/plite/docs/**`, `.tmp/plite/package/package-metadata/docs that
  list public packages`, `.tmp/plite/tests/examples` only if imports break,
  and this plan.
- Browser surfaces: only `plite-browser` browser/proof docs and tests; no app UI
  route proof unless package examples require it.
- Package/API surfaces: package metadata, exports, public names, README/docs,
  declarations, package tests.
- Agent/skill surfaces: N/A unless the loop exposes a reusable workflow miss.
- Docs/research surfaces: official Plite docs and release docs; no external
  research needed unless source evidence is insufficient.
- Non-goals: actual npm publish, PR, commit, changeset, broad editor behavior
  fixes, pagination, mobile/raw-device claims, and runtime QA snippets copied
  from unrelated packages.

Blocked condition:
- Block only if a package-name/version/export strategy requires user taste and
  `vision` gives no safe default, or if exported subpaths cannot be
  verified because the local package toolchain is broken after focused repair.
- Do not block while a safe alternate checkpoint remains runnable.
- If uncertainty is soft, choose the strictest supportable public surface and
  record the deferred question in final handoff.

Automation state:
- surface: plite-browser package/docs/API
- mode: public-readiness loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: status
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: slate-auto
- keep / revert / quarantine call: pending
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-browser-public-readiness.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | in_progress | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete. | seed |
| package-status | slate-auto | pending | P0 | Inspect `plite-browser` metadata, scripts, exports, dependencies, README, and current consumers. | Current package state recorded. | replace generic status |
| public-surface-diet | slate-auto | pending | P0 | Avoid publishing support-cost gravity or private QA plumbing by accident. | Exported subpaths are deliberately kept/dropped/documented. | replace generic gap-scan |
| naming-hard-cut | slate-auto | pending | P0 | Public API must use extension/feature language, not plugin drift. | No public `plugin-contracts`/`PluginContract` names remain. | new |
| official-docs | docs-creator / slate-auto | pending | P0 | Make the package usable without reading source. | Install, import, first test, contract registry, trace/screenshot, and boundary docs exist. | replace behavior rows |
| package-proof | slate-auto | pending | P0 | Public package changes need type/build/import/test proof. | Focused package commands pass or blocker recorded. | replace behavior-proof |
| docs-proof | slate-auto | pending | P0 | Docs must not contradict public package readiness. | Search audit and docs command if available pass. | new |
| release-boundary | slate-auto | pending | P1 | Public-ready is not publish/release. | No publish/PR/commit/changeset unless separately requested. | new |
| final-handoff | slate-auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies public-ready/docs/100% satisfaction plus prior risks to resolve. |
| `plite-auto` source rule read | yes | `.agents/skills/slate-auto/SKILL.md` read before work. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read before work. |
| Active goal checked or created | yes | Active goal created for this plan. |
| Invocation mode and timebox recorded | yes | Public-readiness loop, no fixed timebox. |
| Dynamic checkpoint policy accepted | yes | Checkpoints narrowed to package/docs/API proof and may mutate from evidence. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` package/docs plus parent plan only. |
| Output budget strategy recorded | yes | Use `rg` counts/file lists before opening broad sources. |
| Private-alpha release/PR boundary recorded | yes | Public-ready only; no publish/PR/changeset unless asked. |
| Browser proof strategy recorded | yes | Package proof first; UI browser proof N/A unless docs/examples need route proof. |
| Package/API proof strategy recorded | yes | Package scripts plus import/declaration smoke for exported subpaths. |
| Mobile/raw-device claim-width policy recorded | yes | N/A unless docs mention raw-device support; no new mobile claims. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless workflow miss is found. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Public package metadata and dependency support surface are audited/fixed.
- [x] Public export surface is dieted, documented, and import-smoked.
- [x] Public naming hard-cut replaces `plugin-contracts`/`PluginContract` drift
      with extension/feature language, with no aliases.
- [x] Official docs cover install, intended audience, first Playwright test,
      contracts, screenshots/native traces, replay/proof artifacts, and support
      boundaries.
- [x] Release docs/package tables mention `plite-browser` only as a first-party
      test/proof harness, not the app editing API.
- [x] Behavior proof packet N/A: this lane changes package/docs/proof harness
      API, not editor runtime behavior.
- [x] Visual/native selection proof N/A: package docs/tests may describe traces,
      but no runtime editor behavior changed.
- [x] Mobile/raw-device proof N/A unless docs claim raw-device behavior support.
- [x] Huge-document correctness smoke N/A: no editor runtime/huge-doc behavior
      change in scope.
- [x] Perf packet N/A: no runtime perf change in scope.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run package, docs, import, type, and fast repo gates | `bun check` passed; focused gates listed below |
| Dynamic checkpoint reconciliation | yes | Replace generic behavior/perf rows with package/docs/API rows | Checkpoint table narrowed to package-status, public-surface-diet, naming-hard-cut, official-docs, package-proof, docs-proof |
| Workspace authority proof | yes | Run Plite commands from `.tmp/plite`; parent commands only for plan | All package commands ran in `.tmp/plite`; autogoal checker runs in parent repo |
| Behavior gates | N/A | No editor runtime behavior changed | Runtime behavior proof intentionally scoped out |
| Visual/native selection proof | N/A | No runtime browser behavior changed | Existing selection package tests passed through `bun --filter plite-browser test:selection` |
| Missing oracle repair | yes | Add guard for public-ready metadata and feature-contract public names | `package-scripts.test.ts`, public import smoke, public type smoke |
| `plite-browser` promotion | yes | Make package public-ready with official docs | Package metadata, docs, release docs, feature-contract API |
| Mobile/raw-device claim width | yes | Keep transport docs honest | Docs state viewport is not raw-device proof and transports classify proof scope |
| Huge-document correctness smoke | N/A | No huge-document runtime behavior changed | Not part of package-public-readiness lane |
| Package/API proof | yes | Source audit and package/type/test proof | Stale marker audit clean; `bun --filter plite-browser build/typecheck/test/test:selection`; public smoke; `bun check` |
| Skill/rule sync | N/A | No `.agents/rules/**` changed | No skill/rule patch in this run |
| Changed list / review attention / stopping checkpoints | yes | Fill final ledgers | Changed list, attention, and stopping checkpoint rows below |
| Final lint/check | yes | Run scoped lint/check | `bun lint:fix`; `bun check` passed |
| Workflow slowdown review | yes | Log avoidable command pitfall | Direct root Bun file filter failed for import smoke; package-local cwd worked |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling source changed | Not applicable |
| Autoreview for non-trivial implementation changes | yes | Run local structured review | Clean: no accepted/actionable findings |
| Goal plan complete | yes | Run autogoal checker | Passed before final response |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | Prompt requirements copied before implementation | package-status |
| Package status and current-tree closure | done | Metadata/docs/export/consumer audit recorded | public-surface-diet |
| Public surface diet | done | Kept subpath-only public surface; root module unavailable | naming-hard-cut |
| Naming hard cut | done | `plugin-contracts` replaced by `feature-contracts` with no aliases | official-docs |
| Official docs | done | Added `docs/libraries/plite-browser.md`; updated README, Summary, release docs, proof map | package-proof |
| Package proof | done | Focused package tests, build, typecheck, import/type smoke, `bun check` | docs-proof |
| Docs proof | done | Public-surface contract and stale marker audit passed | final handoff |
| Final handoff and goal-plan check | done | This ledger is current | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `plite-browser` public package | subpath-only package | Node/browser test harness | imports/build/docs | package/API/docs proof | done |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| public metadata | 1 | slate-auto | Package still looked private | package.json, bun.lock, package metadata test | N/A runtime | keep | review before publish |
| feature-contract hard cut | 1 | slate-auto | Public API used plugin naming | feature-contracts, first-party contracts, Playwright re-export, stress import, tests | N/A runtime | keep | no aliases |
| official docs | 1 | slate-auto | Public package lacked official docs and had repo-private release wording | README, docs/libraries/plite-browser.md, Summary, release docs, proof map | N/A runtime | keep | docs review |
| package proof | 1 | slate-auto | Public surface could break declarations/imports | focused commands below | Existing selection/dom tests only | keep | autoreview before commit |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| N/A | package/docs only | No editor runtime behavior changed | N/A | scoped out | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Existing plite-browser selection package tests | `bun --filter plite-browser test:selection` | existing browser selection snapshots | existing browser DOM selection snapshots | no new screenshot needed | passed |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| proof contract registry | browser proof families | `definePliteBrowserFeatureContract`, `createPliteBrowserFeatureContractRegistry` | package core tests, import/type smoke | keep, no plugin alias |
| package public readiness | package metadata/docs | dev-dependency install docs and public metadata | `bun check` | keep |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| transports classify device proof scope | docs/test contract | package core tests | passed | no raw-device claim without device gate |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | no huge-doc runtime change | N/A | scoped out |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| direct Bun file filter from repo root | bun/test workflow | small | `bun test ./packages/plite/test/public-package-import-smoke.test.ts` was treated as a filter; package-local cwd worked | failed command recorded; passing package-local import smoke | use package-local cwd or directory gate for this file |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `plite-browser` package metadata made public-ready; contract API hard-cut from plugin to feature naming; root import remains unavailable |
| tests/oracles/browser proof | package metadata guard, feature-contract export guards, public import smoke, public type smoke, stress import update |
| benchmarks/metrics/targets | none |
| examples/docs | package README, official Plite Browser library doc, Summary nav, root README link, release docs, docs proof map |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Public support surface | Publishing `plite-browser` means users may ask for Playwright/browser matrix support | `packages/plite-browser/README.md` | Review boundaries before actual release |
| 2 | Package name | Kept `plite-browser` instead of renaming to `plite-testing` | `packages/plite-browser/package.json` | Keep unless you want a hard rename before publish |
| 3 | Transport subpath | Kept `plite-browser/transports` public because tests already smoke it and docs now narrow claims | `docs/libraries/plite-browser.md` | Review whether transports should stay public |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | no blocker | package/docs gates passed | none | final handoff | proceed to autoreview/commit if desired | this plan |

Findings:
- `plite-browser` was half-public already: public import/type/surface tests
  covered it, but metadata/docs still called it private.
- Feature contracts are a better public name than extension contracts because
  browser proof families include core editing and UI behavior, not only editor
  extensions.

Decisions and tradeoffs:
- Keep `plite-browser` subpath-only and root import unavailable.
- Keep `plite-browser/transports` public but document it as proof-scope
  classification, not a universal mobile driver.
- Do not add backward-compatible plugin aliases.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test ./packages/plite/test/public-package-import-smoke.test.ts` from repo root | 2 | Run from `packages/plite` cwd | package-local command passed |

Verification evidence:
- `rg -n "PLUGIN_CONTRACT|PluginContract|plugin-contract|createPliteBrowserPlugin|definePliteBrowserPlugin|PLITE_BROWSER_FIRST_PARTY_PLUGIN|row\\.plugin|definition\\.plugin|repo-private|0\\.0\\.0-private|not part of the public install surface" .` from `.tmp/plite`: no matches.
- `bun install` from `.tmp/plite`: lockfile refreshed.
- `bun --filter plite-browser test:core`: 81 pass.
- `bun --filter plite-browser typecheck`: passed.
- `bun --filter plite-browser build`: passed.
- `bun --filter plite-browser test`: 81 Bun core tests pass plus 2 browser test files / 11 tests pass.
- `bun --filter plite-browser test:selection`: 1 browser file / 9 tests pass.
- `cd packages/plite && bun test test/public-package-import-smoke.test.ts`: 15 pass.
- `cd packages/plite && bun test ./test/public-surface-contract.ts`: 963 pass.
- `bun --filter plite typecheck`: passed.
- `bun lint:fix`: fixed formatting in 4 files.
- `bun check`: passed; 1264 Bun tests pass, 85 skip, slate-layout 51 pass, slate-react 59 files / 825 tests pass.
- `../../.agents/skills/autoreview/scripts/autoreview --mode local --prompt "...plite-browser public-readiness..."`: clean, no accepted/actionable findings.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-15-plite-browser-public-readiness.md`
- Surface and route/package: `.tmp/plite/packages/plite-browser`,
  `.tmp/plite/docs/**`, public package smoke/type contracts.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count:
  public-readiness loop, no fixed timebox, one implementation loop.
- Behavior gates and visual proof: runtime behavior scoped out; existing
  plite-browser selection/dom package tests passed.
- Primary metric baseline/latest/best and stop reason: N/A; package/docs/API
  lane, stopped because gates passed.
- Bugs fixed and oracles added: public metadata guard, feature-contract API
  guard, public import/type smoke updates.
- Benchmark/skill/docs repairs: official Plite Browser docs and release docs
  repaired; no benchmark or skill patch.
- Workflow slowdowns and repairs: root Bun file filter pitfall recorded; use
  package-local cwd for that smoke file.
- Changed list: see Changed list table.
- Needs your attention: see Needs your attention table.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: actual npm publish, changeset, PR,
  public support docs matrix, and package-name rename are deferred until
  explicit release/commit lane.
- Next owner: user review of support surface, then commit/release lane when
  explicitly requested.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff complete |
| Where am I going? | User review or autoreview/commit lane |
| What is the goal? | Make `plite-browser` public-ready with official docs and proof gates |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-15T20:20:14.552Z Goal plan created.
- 2026-06-15: Replaced generic behavior/perf checkpoint plan with
  package/docs/API public-readiness checkpoints.
- 2026-06-15: Hard-cut plugin contract names to feature contract names.
- 2026-06-15: Added official docs and updated release/package docs.
- 2026-06-15: Ran package, docs, import/type, and fast repo gates.

Open risks:
- None blocking. Main review item is whether `plite-browser/transports` should
  remain public for beta or be hidden before actual publish.
