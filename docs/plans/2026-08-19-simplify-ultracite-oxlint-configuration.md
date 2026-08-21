# Simplify Ultracite Oxlint configuration

Objective:
Collapse Plate's Oxlint configuration to one clear owner while preserving the
audited Ultracite policy and runtime behavior. Narrow or inline exceptions by
semantic ownership, add structural proof, and finish with a green root check.

Goal plan:
docs/plans/2026-08-19-simplify-ultracite-oxlint-configuration.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: direct user request following a source-backed harsh-honest review
- id / link: `tooling/config/oxlint-base.mjs`
- title: make Plate's Oxlint configuration as structurally clean as `../ellie`
- requested surface: `oxlint.config.ts`, `tooling/config/oxlint-base.mjs`,
  `tooling/config/oxlint-policy.mjs`, source-local Oxlint suppressions, and the
  owning structural verification command
- cleanup intent: apply all eight accepted recommendations from the review
- acceptance criteria: one effective config owner; policy registry and base
  indirection deleted; duplicates eliminated; one-off exceptions moved beside
  code; mega-lists classified without weakening rules due to volume; broad test
  exceptions narrowed; structural validation added; no package-local config
  sprawl; full check green

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence / cleanliness score: 35/100; three runtime config owners,
  94 overrides, 1,347 exact file/rule exemptions, and 18 duplicate pairs
- improvement loop: classify each override by semantic owner, apply the least
  permissive durable form, and rerun focused lint after each packet
- final score / loop closure: 94/100; one config owner, zero duplicate or
  missing exact selectors, reasoned global policy, idempotent safe fix, and a
  green root check

Completion threshold:
- `tooling/config/oxlint-base.mjs` and `tooling/config/oxlint-policy.mjs` are
  deleted and `oxlint.config.ts` is the sole effective Oxlint configuration
  owner.
- Every former override is classified as global policy, stable semantic path,
  source-local suppression, code fix, or rejected exception; diagnostic count
  alone never determines the decision.
- Structural validation reports zero duplicate selector/rule pairs and zero
  missing exact paths, and is wired into the owning repo check.
- Safe fix is idempotent, Oxlint has zero warnings/errors, and `pnpm check`
  passes.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-simplify-ultracite-oxlint-configuration.md`
  passes.

Verification surface:
- Source audits for deleted config owners, config references, exact selectors,
  duplicate selector/rule pairs, and source-local suppression reasons.
- `pnpm exec oxlint --type-aware --deny-warnings` for focused lint proof.
- Two safe `pnpm exec ultracite fix` runs for idempotence.
- Ultracite migration audit and strict config-policy audit.
- Root `pnpm check` for the final repository gate.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: installed Ultracite presets and migration policy, current
  root config, current diagnostics, and representative source owners
- Allowed edit scope: root/tooling config, package/app source only where a
  former one-off exception moves inline or a safe lint fix is clearly better,
  package scripts/check ownership, and this plan
- Plite / Plate boundary: unchanged; lint configuration is shared tooling
- Public API boundary: no public API changes
- Browser surface: N/A: no visible behavior may change
- Package/API surface: package source may receive only behavior-neutral lint
  repairs or source-local suppressions
- Non-goals: do not reduce global-off or error counts for appearances; do not
  broaden path/global disables to shorten config; do not split package-local
  configs; do not change runtime behavior; do not create migration compatibility

Output budget strategy:
- Use capped `rg`, config-object summaries, rule-group counts, and per-rule
  diagnostic artifacts; never stream the whole lint output into the thread.

Blocked condition:
- Stop only if preserving lint strictness requires a public API/runtime change,
  a rule's semantics cannot be classified from local source and focused proof,
  or the same external tooling failure repeats for three goal turns.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: complete
- goal_status: complete

Current verdict:
- verdict: keep the single root config and its narrow semantic exceptions;
  delete the policy/base indirection and reject package-local config sprawl
- cleanliness confidence: 94/100 after implementation
- next owner: tooling maintainer only if a scoped exception becomes stale or a
  later behavior-changing type repair is authorized
- keep / revert / quarantine call: keep all six completed packets
- reason: one effective owner plus local reasons is easier to audit without
  weakening rules to make the file shorter

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-simplify-ultracite-oxlint-configuration.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | all eight accepted actions, non-goals, verification, stop condition, and handoff requirements recorded above |
| Timed checkpoint parsed | yes | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | complete skill read on 2026-08-19 |
| Active goal checked or created | yes | active goal created for this plan |
| Source of truth read before analysis | yes | root/base/policy config, Ellie reference, Ultracite playbook and rule policy |
| VISION fit gate read | yes | `VISION.md` and `docs/vision/common.md` read |
| Plite / Plate boundary selected | yes | shared tooling only; runtime boundary unchanged |
| Cleanup surface selected | yes | root/base/policy config plus narrowly owning source and check script |
| Non-goals recorded | yes | Boundaries section |
| Output budget strategy recorded | yes | capped/count-based commands |
| Implementation authority decided | yes | user said `go all` after accepting all eight actions |
| Proof strategy selected | yes | structural audit, focused lint/fix, migration audits, root check |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Structural checker, migration audit, safe-fix idempotence, and `pnpm check` all passed |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source map below records one private config owner and its proof chain |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Inventory below records every found config smell and its disposition |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Eight ranked candidates each have a final decision |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Three effective config files became one; structural proof became one command |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No split accepted; package-local configs were explicitly rejected |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Base/policy deleted, assembly and semantic groups merged, one-offs moved inline |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Existing durable-owner and least-machinery doctrine applies; no Vision update needed |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | Six packets below all ended keep after focused lint or structural proof |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Added `tooling/scripts/check-oxlint-config.mjs` and wired it into root lint |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | Changes are config, comments, and lint directives; build, typecheck, and tests passed |
| Package/API proof | yes | Run relevant package/export/type/build proof when package boundaries changed, or N/A | `pnpm check` completed every package build, typecheck, and test gate |
| Browser proof | no | Run Browser/Playwright proof when visible behavior changed, or N/A | N/A: no visible runtime behavior changed |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | `pnpm lint` and final `pnpm check` exited 0 |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Diagnostic audits were counted by rule/path and full command output was capped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Completed below with exact metrics, proof, and residual risk |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-simplify-ultracite-oxlint-configuration.md` | Final mechanical plan check is the closing command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read Plate, Ellie, Ultracite, and migration policy owners | source map complete |
| Source map | complete | mapped config, script, source-local, CI, and proof owners | inventory complete |
| Deslop inventory | complete | classified indirection, duplicates, broad scopes, and stale paths | matrix complete |
| Candidate matrix | complete | eight candidates decided from source and diagnostic evidence | packets complete |
| Cleanup packets / owner routing | complete | six behavior-neutral packets kept | verification complete |
| Verification | complete | focused lint, two safe fixes, audits, and root check passed | closeout complete |
| Closeout | complete | final metrics, risks, and ownership recorded | final response |

Source map:
- Before: `oxlint.config.ts` was a 40-line forwarding owner;
  `tooling/config/oxlint-base.mjs` held 1,512 lines of assembly and overrides;
  `tooling/config/oxlint-policy.mjs` held 1,575 lines of generated policy.
- After: `oxlint.config.ts` is the sole 1,500-line effective owner. It directly
  composes Ultracite, Next, Plate policy, semantic overrides, and ignores.
- The config is private tooling with no package export or public API boundary.
  Root `lint` owns validation and root `check` owns broad repository proof.
- `tooling/scripts/check-oxlint-config.mjs` owns structural proof for duplicate
  pairs, missing exact paths, redundant root overrides, duplicate global keys,
  and global-off reasons.
- Twenty-three changed source owners now hold 34 narrow directives for former
  one-off exceptions. Stable multi-file runtime/test classes remain in root.

Deslop inventory:
- Pure indirection: root-to-base forwarding and the generated policy registry.
- Duplication: 18 selector/rule pairs, repeated Next policy spread, and repeated
  unsafe-value, React Compiler, hooks, import-cycle, set/map, and a11y groups.
- Remote one-offs: isolated exceptions with no local reason or stale detection.
- Broad ownership: test globs and two exact unsafe-value lists required a
  diagnostic audit before any narrowing decision.
- Stale integration: two nonexistent app config paths in CI filters.
- N/A: no package barrels, compatibility adapters, orphan tests, public exports,
  or package-local config owners belong in this tooling surface.

Agent-navigation score:
| Measure | Before | After | Net |
|---------|--------|-------|-----|
| Effective config owners | 3 | 1 | better |
| Files needed to explain global policy | 3 | 1 | better |
| One-off exception lookup | remote config plus source | owning source line | better |
| Structural proof | manual inspection | one root lint prerequisite | better |
| Public/private clarity | split across generated-looking modules | one private root owner | better |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | generated policy registry | `tooling/config/oxlint-policy.mjs`, root/base imports | 1,575 lines produce one off-map; reason and disableWhen repeat | 3 config owners -> 1; proof clearer | inline audited off rules with short comments, then delete registry | root Oxlint config | config load + strict policy audit | delete |
| 2 | Strong | base/root double assembly | root and `tooling/config/oxlint-base.mjs` | root extends base then reapplies all base overrides for ordering | 2 assembly owners -> 1 | assemble presets, rules, and overrides once in root | root Oxlint config | effective config + lint | merge |
| 3 | Strong | unsafe-value exact-file mega-lists | root semantic override groups | Removing the groups exposes 1,071 diagnostics concentrated in dynamic editor/plugin boundaries | remote exemptions remain exact and share one rule recipe | retain the least-permissive scopes; defer behavior-changing type repair | source owner + root config | grouped lint diagnostics | defer |
| 4 | Strong | one-off remote exceptions | base exact-file overrides | config exceptions cannot become unused and hide local reason | config lookup -> local line | move true one-offs to narrow source directives with reasons | source owner | unused-directive denial + lint | inline |
| 5 | Strong | broad test override | base test glob | all tests lose compiler and five unsafe rules plus unrelated checks | one vague owner -> smaller proven recipes | start strict and retain only runner/test-double defects proved by diagnostics | root config/test owner | test lint + root check | simplify |
| 6 | Strong | duplicate override pairs | repeated no-img groups | 18 duplicate selector/rule pairs | ambiguous -> single owner | delete duplicates and mechanically reject recurrence | root config | structural audit | delete |
| 7 | Strong | missing structural oracle | no owning script/check | config can accumulate duplicate and stale exact paths silently | manual audit -> one command | add config-structure checker and wire it into check ownership | tooling/check owner | checker red/green proof | simplify |
| 8 | Strong | package-local config temptation | package tree | shorter root via config scattering would increase effective-order ambiguity | 1 owner -> many owners would be worse | keep one root config; use semantic globs and local directives | root config | source audit finds one config owner | reject |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| 1 | merge/delete | root config | root, base, policy | config import plus focused lint | keep | consolidate overrides |
| 2 | merge/delete | root config | root override groups | structural duplicate/redundancy audit | keep | audit broad classes |
| 3 | audit/simplify | root config | test and unsafe semantic groups | strict temporary-config diagnostics by rule/path | keep | localize one-offs |
| 4 | inline | source owners | 23 app/package/tooling files | focused lint with unused directives denied | keep | add oracle |
| 5 | add oracle/repair CI | tooling/check owner | checker, package script, CI | checker red/green plus migration audit | keep | safe fix |
| 6 | format/verify | repository root | all touched files | two safe fixes, lint, Doctor, audits, `pnpm check` | keep | closeout |

Cleanup counts:
- delete: 2
- merge: 1
- inline: 1
- simplify: 2
- split: 0
- keep: 0
- defer: 1
- reject: 1
- plan: 0

Changed list:
- code/runtime/API: no runtime or API changes; 23 source files gained 34 narrow
  lint directives with local semantic reasons
- tests/oracles: added `tooling/scripts/check-oxlint-config.mjs`
- docs/plans: completed this architecture-cleanup plan
- skills/workflow: root lint runs the structural checker; stale CI config paths
  removed; two obsolete tooling config modules deleted
- reverted/quarantined: no speculative changes; generated
  `apps/www/.next-plite` cache removed after it polluted the legacy audit and is
  recoverable by the owning build

Needs review:
- None for this behavior-neutral packet. Actual unsafe-value type repairs and
  React Compiler rewrites need a later regression-aware phase, not config
  cosmetics.

Verification evidence:
- `node tooling/scripts/check-oxlint-config.mjs` reports 178 root rules and
  1,455 selector/rule pairs with zero duplicates, missing exact paths,
  redundant root overrides, or unexplained global offs.
- Two `pnpm exec ultracite fix` runs were idempotent; focused and root lint pass.
- Ultracite Doctor passed all six checks.
- Migration audit with `--assert-migrated` passed with no legacy configs,
  dependencies, suppressions, or active ownership.
- Generic policy audit reports `missingBaseline=[]` and `missingReason=[]`.
  Its strict mode also rejects 51 audited Plate-specific extras because its
  fixed baseline has no project-extension contract; the local checker owns
  reason enforcement for those extras.
- `pnpm check` exited 0 after lint, 60/60 builds, full typecheck, 1,528 fast
  tests plus 3,233 broad tests, and the remaining package test lanes.
- All commands ran from `/Users/zbeyens/git/plate-2` with the repository's
  pinned pnpm, Bun, Ultracite, Oxlint, and Node tooling.

Final handoff contract:
- Source roots inspected: root config/scripts, CI, apps, packages, installed
  Ultracite policy, migration tooling, and `../ellie` reference
- Candidate count and top recommendation: eight; delete policy/base indirection
  and assemble the effective config once
- Cleanup counts: delete 2, merge 1, inline 1, simplify 2, split 0, keep 0,
  defer 1, reject 1, plan 0
- Agent-navigation score changes: three effective owners became one; one-off
  reasons moved to the owning lines; structural proof became automatic
- Packets applied with keep/revert/quarantine result: six kept, none reverted or
  quarantined
- Proof commands/source audits: checker, focused lint, two safe fixes, Doctor,
  migration audit, policy audit, source ownership searches, and `pnpm check`
- Rejected/deferred candidates: rejected package-local config sprawl; deferred
  runtime-sensitive unsafe-value and Compiler source rewrites
- Needs-review list: none in current scope
- Residual risks: exact unsafe-value lists remain large by necessity; the
  generic strict policy checker cannot whitelist reasoned project extensions
- Next owner and exact first command/file: tooling maintainer starts with
  `node tooling/scripts/check-oxlint-config.mjs` and `oxlint.config.ts`

Open risks:
- The exact unsafe-value lists remain maintenance-heavy, but broadening or
  deleting them would weaken policy or force runtime-sensitive rewrites.
- Node emits a module-type performance warning when directly importing the
  TypeScript config. Adding root `"type": "module"` has repository-wide
  semantics and is intentionally outside this behavior-neutral cleanup.
- The generic strict policy audit cannot distinguish undocumented extras from
  reasoned Plate extensions. Root lint's structural checker closes that gap.

Timeline:
- 2026-08-19T18:32:45.127Z Architecture-cleanup goal plan created.
- 2026-08-19 Requirements extracted before implementation; one-shot flow,
  eight accepted cleanup decisions, constraints, and proof thresholds recorded.
- 2026-08-19 Six cleanup packets kept after focused proof; root check and final
  ownership audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | One clear Oxlint config owner with justified local/semantic exceptions and green structural plus root proof |
| What have I learned? | One owner is cleaner, but large semantic exception classes are not bugs merely because their lists are ugly |
