# plite editor static api hard cut

Objective:
Cut public Plite Editor static API; done when public exports/docs/tests stop exposing Editor as a value and Plite gates pass.

Goal plan:
docs/plans/2026-06-23-plite-editor-static-api-hard-cut.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked auto
- prompt / link: `[$auto] go all those cuts`
- lane: Plite package/API hard cut
- surface / route / package: `packages/plite`, public root `@platejs/plite`, internal helper bridge
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration given
- completion threshold summary: root package no longer exposes `Editor` as a value, public docs/tests do not teach `Editor.*`, any remaining internal static adapter is deletion-gated or removed, and focused Plite gates pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- `@platejs/plite` root export keeps `Editor` type-only and does not export an `Editor` runtime/static value.
- Public type smoke and public surface contracts prove `isEditor` is the value predicate and `Editor` is only a type.
- Current Plite docs do not present `Editor.*` as public usage. Migration/history mentions are allowed only when they refer to upstream/old API or type names.
- Internal `InternalEditor` / static object usage is removed or explicitly quarantined as private deletion-gated debt with exact owner and remaining import count.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-plite-editor-static-api-hard-cut.md` passes.

Verification surface:
- Source audits:
  - `rg -n "export \\{ Editor \\}|typeof import\\('@platejs/plite'\\)\\.Editor|from ['\\\"]@platejs/plite['\\\"].*Editor"` on public package/docs/test surfaces.
  - `rg -n "\\bInternalEditor\\b|export \\{ Editor \\}|const Editor"` on Plite internals for remaining static-object debt.
- Focused package gates:
  - `pnpm --filter @platejs/plite typecheck`
  - `pnpm --filter @platejs/plite test`
- Broader package/API gate when the focused cut affects sibling Plite packages:
  - `pnpm check:plite` if the focused gate passes and the change is broad enough.
- Plite package proof uses `pnpm plite:test` and `pnpm plite:typecheck`.
- Plite daily proof uses `pnpm check:plite`.
- Plite focused browser proof uses `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.
- `apps/plite` reuses `apps/www` Plite examples; never maintain a second example source tree.
- Plite release/deletion proof adds explicit closure gates such as package
  build, docs checks, benchmark target audit, and
  `pnpm check:plite:browser-matrix` when those claims are in scope.

Constraints:
- Resolve lane first: Plite, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Plite-lane proof runs from the Plate repo root against transplanted Plite packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Plite runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite. Do not patch Plite runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: `packages/plite/src/index.ts`, `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/internal/index.ts`, Plite public surface tests, current Plite docs.
- Allowed edit scope: Plite package/API files, Plite package tests/smokes, docs needed to avoid public `Editor.*` teaching, and this plan.
- Browser surfaces: N/A unless docs UI changes require route proof; this is package API shape work.
- Package/API surfaces: `@platejs/plite` root public exports and `@platejs/plite/internal` private sibling-package helper exports.
- Agent/skill surfaces: N/A unless the loop discovers a recurring workflow miss.
- Docs/research surfaces: `content/docs/plite/**` only where `Editor` static API is current-facing.
- Non-goals: no Plate runtime migration, no compat alias, no broad `ElementApi`/`NodeApi` namespace cut, no release/publish/PR work.

Output budget strategy:
- Use focused `rg` counts/files first. Do not stream all `Editor.*` internal hits. Write broad hit lists to `.tmp/plite-editor-static-api-hard-cut/` when needed.

Blocked condition:
- Stop only if removing the internal static adapter requires a large unsafe runtime rewrite that cannot be proven by focused Plite gates in this loop, and no smaller public/API cut remains runnable. In that case, quarantine the adapter with deletion gate instead of pretending the internal cut is complete.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plite
- surface: public package API and internal static helper bridge
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: done
- next_checkpoint: none
- goal_status: complete

Current verdict:
- verdict: complete pending mechanical autogoal check
- confidence: high for public/API cut; medium for private bridge cleanup because that is intentionally quarantined.
- next owner: auto
- keep / revert / quarantine call: keep public cut; quarantine private React bridge as internal-only review attention.
- reason: Plite package/type/browser proof passes and public root no longer exports a runtime `Editor` value.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-plite-editor-static-api-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | done | P0 | Copy prompt requirements and read vision before implementation. | Requirements captured in top sections; `VISION.md` read. | update |
| status | auto | done | P0 | Read active plan, latest prompt, source status, and current evidence. | Root exports `Editor` value; internal static adapter exists; tests already expect no root value. | update |
| gap-scan | auto | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | seed |
| public-root-cut | auto | in_progress | P0 | Remove `Editor` as root value while preserving type-only `Editor`. | `packages/plite/src/index.ts` and public type smoke updated; focused tests pass. | add |
| internal-static-adapter | auto | pending | P1 | Remove or deletion-gate `InternalEditor`/internal `Editor` object so the cut is not fake. | No exported internal `Editor` object, or quarantine row with exact remaining import count and owner. | add |
| closure-handoff | autoclosure | pending | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | Closure delegated or N/A. | seed |
| behavior-proof | lane proof owner | pending | P0 | Prove stable editor behavior before perf. | Focused behavior commands pass or failures routed. | seed |
| oracle-repair | lane test owner / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | Browser / Playwright | pending | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | seed |
| browser-helper-promotion | lane proof harness | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | auto | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | lane proof owner | pending | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded or N/A. | seed |
| perf-packet | lane perf owner | pending | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | seed |
| supervision-mode | auto | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | auto | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 1 | update | public-root-cut, internal-static-adapter, oracle-repair, final-handoff | source audits and Plite gates | public API cut proved; private bridge remains by design | complete |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell, visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command, exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become too large.
- Merge checkpoints when overlap confuses routing or two rows always close together.
- Retire or remove checkpoints that are stale, superseded, irrelevant, duplicated, or contradicted by current evidence. Record the reason in the mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The user's latest request, `vision`, and current source evidence outrank stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | captured above: cut public static API, no compat alias, internal object removal/quarantine, focused gates |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read |
| `vision` read as checkpoint zero | yes | `VISION.md` read; no aliases/compat rule applies |
| Active goal checked or created | yes | goal created with this plan path |
| Lane resolved | yes | Plite package/API hard cut |
| Invocation mode and timebox recorded | yes | full-loop, no timed checkpoint |
| Dynamic checkpoint policy accepted | yes | checkpoint table has add/update rows |
| Source of truth and allowed workspaces recorded | yes | boundaries section names owner files |
| Output budget strategy recorded | yes | broad audits written/capped |
| Release/PR/publish boundary recorded | yes | N/A: no release/PR/publish requested |
| Browser proof strategy recorded | yes | N/A unless docs route behavior changes |
| Package/API proof strategy recorded | yes | focused Plite typecheck/test, optional `check:plite` |
| Mobile/raw-device claim-width policy recorded | no | N/A: no mobile/editor behavior claim |
| Skill repair authority and source-rule boundary recorded | no | N/A: no `.agents/**` changes planned |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | public root export cut, internal value import audit clean, Plite type/test/browser lanes pass |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | public-root-cut and internal-static-adapter rows closed; stale JS fixture import and private React bridge added from evidence |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | commands ran from `/Users/zbeyens/git/plate-2`; package commands target Plite packages and `apps/plite` |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | cwd recorded in Verification evidence; browser proof uses `pnpm --filter plite` |
| Behavior gates | no | Run focused stable behavior proof or record scoped defer rows | N/A: API/export hard cut; package fixture behavior still covered by `pnpm test:plite` |
| Visual/native selection proof | no | Record Browser/Playwright/native-selection evidence or scoped blocker | N/A: no browser-visible editor behavior change; Chromium suite still ran as regression proof |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | public import/type contracts updated; stale JS fixture import caught by package test and fixed |
| `@platejs/browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: no repeated browser helper pattern introduced |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile/raw-device claim |
| Huge-document correctness smoke | no | Run focused huge-document behavior smoke or record owner defer | N/A: no huge-document runtime claim |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `pnpm plite:typecheck`, `pnpm test:plite`, public import smoke, and Chromium browser proof passed |
| Autoclosure handoff | no | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | N/A: this is direct API hard-cut implementation, not post-merge closure |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/**` source changed |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | ledgers below filled |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | scoped Plite type/test/browser gates run; full repo lint/check left for commit/release lane |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | import-rewrite regex miss and noisy command output logged below |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling files changed |
| Autoreview for non-trivial implementation changes | no | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A for this goal: named proof gates cover package/API cut; run `autoreview` before commit if desired |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-plite-editor-static-api-hard-cut.md` | will run after this closure update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | plan sections filled; `VISION.md` read | status |
| Status and current-state read | done | source audits found root `Editor` export and internal adapter debt | public-root-cut |
| Gap scan and scenario matrix | done | API-only hard cut; behavior/browser rows N/A unless runtime behavior changes | public-root-cut |
| Public root export cut | done | `@platejs/plite` root no longer exports runtime `Editor`; `Editor` remains type-only | internal-static-adapter |
| Internal static adapter cleanup/quarantine | done | no exported internal `Editor`; private helper table remains in `interfaces/editor.ts`; private React bridge remains in `plite-react` | package proof |
| Behavior proof | N/A | API export shape, not user-visible editor behavior; package fixtures still passed | oracle repair |
| Oracle repair | done | public import smoke and public type smoke updated; stale JS fixture import fixed | visual proof |
| Visual/native proof | N/A | no browser-visible change; Chromium browser proof still run as regression lane | browser helper promotion |
| Browser helper promotion | N/A | no repeated helper pattern introduced | mobile claim width |
| Mobile/raw-device claim width | N/A | no mobile claim | huge-document smoke |
| Huge-document correctness smoke | N/A | no huge-doc runtime claim | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | done | no perf/doc/skill packet needed; docs audit found only old-API migration mention | consolidation |
| Consolidation and review | done | private bridge and browser flake debt recorded in review attention/open risks | final handoff |
| Final handoff and goal-plan check | done | final evidence recorded; check-complete to run next | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `@platejs/plite` root API | package export | N/A | import/type smoke | exact runtime exports, type-only `Editor` | done |
| `@platejs/plite/internal` helper API | private package bridge | N/A | import smoke | no exported `Editor` object; individual helpers remain | done |
| `apps/plite` Chromium proof | app browser regression | Chromium | example/editor suite | no hard-cut regression; two unrelated flaky retries | done with residual risk |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| public-root-editor-cut | 1 | auto / Plite API | root `Editor` value is public debt; keep type-only `Editor` | `packages/plite/src/index.ts`, public import/type contracts | `pnpm --filter @platejs/plite typecheck`; public import smoke | keep | none |
| internal-helper-namespace-cut | 1 | auto / Plite internals | exported internal `Editor` object would keep static API alive | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/internal/index.ts`, namespace import rewrites across Plite sibling packages | `pnpm plite:typecheck`; `pnpm test:plite` | keep; private helper table accepted | review private bridge later |
| stale-js-fixture-import-fix | 1 | auto / Plite history test | JS fixture still imported `{ Editor }` from internal subpath and broke package test | `packages/plite-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js` | `pnpm test:plite` | keep | none |
| normalization-signature-guard | 1 | auto / Plite package test | object-only prop signature hid nested prop changes and caused normalization proof churn | `packages/plite/src/editor/normalize.ts`, `packages/plite/test/transforms/normalization/set_node.tsx` | focused fixture passed; package test passed | keep | none |
| plite-react-private-runtime-bridge | 1 | auto / Plite React private bridge | `plite-react` runtime still needs an internal helper namespace value without public `@platejs/plite/internal` `Editor` export | `packages/plite-react/src/editable/runtime-editor-api.ts` | `pnpm --filter @platejs/plite-react typecheck`; `pnpm plite:typecheck` | keep/quarantine as private bridge | review attention |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| package fixtures | Plite packages | `pnpm test:plite` | N/A | passed | none |
| browser regression | `apps/plite` | `pnpm --filter plite test:plite-browser:chromium` | Chromium | exit 0, with two flaky retries | log flaky rows |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| hard-cut API export | N/A | N/A | N/A | N/A | no visual selection change in scope |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| none | N/A | N/A | N/A | no helper promotion in this packet |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | N/A | N/A | N/A | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| none | N/A | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| first import rewrite audit | auto | one failed pass | regex missed `.js` fixture and broad `Editor.*` scan streamed too much | `@platejs/plite-history` test failed on stale `{ Editor }` import | fixed fixture; future broad scans should use brace-bounded import grep and logs |
| `pnpm --filter plite test:plite-browser:chromium` | apps/plite | about 3.7m | full Chromium browser suite and static build | 594-test suite passed with flaky retries | keep as regression gate; route flaky rows to browser-proof cleanup lane |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/plite/src/index.ts`; `packages/plite/src/interfaces/editor.ts`; `packages/plite/src/internal/index.ts`; namespace import rewrites across Plite sibling package sources; `packages/plite-react/src/editable/runtime-editor-api.ts` private bridge |
| tests/oracles/browser proof | public import/type/surface contracts; `packages/plite-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js`; normalization fixture |
| benchmarks/metrics/targets | none |
| examples/docs | no user-facing docs changed; docs audit only |
| skills/workflow | this autogoal plan |
| reverted/quarantined packets | private `plite-react` runtime `Editor` bridge kept as private bridge; private `editorInternalApi` table remains unexported |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Private `plite-react` bridge still exposes local `Editor` inside `runtime-editor-api.ts` | It is not public Plite API, but the name can confuse future cleanup | `packages/plite-react/src/editable/runtime-editor-api.ts` | accept for now; review only if you want zero internal namespace values |
| 2 | Private `editorInternalApi` table remains in Plite internals | This keeps implementation grouping without exporting `Editor`; cutting it further would be a larger mechanical rewrite | `packages/plite/src/interfaces/editor.ts` | accept as private implementation table |
| 3 | Chromium suite passed with flaky retries | Unrelated to the API hard cut, but browser proof is not perfectly stable | `apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts`; `apps/plite/tests/plite-browser/donor/examples/pagination.test.ts` | route to browser proof cleanup when the lane is active |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | no user decision required for this packet | remaining items are review attention, not blockers | none | API cut completed | continue with next Plite/Plate API cleanup lane | N/A |

Findings:
- `@platejs/plite` root can expose `Editor` as a type without a runtime/static value.
- `@platejs/plite/internal` does not need to export `Editor`; individual helper exports are enough for sibling packages.
- One JS fixture escaped the TS import rewrite and was caught by `test:plite`.
- Browser proof passed overall but still reports flaky rows outside this API cut.

Decisions and tradeoffs:
- Keep `Editor` type-only in public root.
- Keep private `editorInternalApi` implementation table unexported.
- Keep `plite-react` local `Editor` bridge private for now because replacing every runtime helper call there is a larger source-local cleanup with no public API gain.
- Do not patch browser flaky rows in this API hard-cut packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First `pnpm test:plite` run failed on hidden JS fixture import | 1 | grep `.js/.jsx` fixtures too, not only TS | patched JS fixture and reran green |
| Broad `Editor.*` scan output was too noisy | 1 | use targeted public import/export audits and log files | final audits are targeted and capped |

Verification evidence:
- `rg -n "import \\{[^}]*\\bEditor\\b[^}]*\\}\\s+from ['\\\"]@platejs/plite/internal['\\\"]|export \\{[^}]*\\bEditor\\b[^}]*\\}\\s+from ['\\\"]@platejs/plite/internal['\\\"]" packages --glob "*.{ts,tsx,js,jsx}" || true` -> no output.
- `rg -n "typeof import\\('@platejs/plite'\\)\\.Editor|\\bInternalEditor\\b|\\bInternalEditorStaticApi\\b|export \\{[^}]*\\bEditor\\b[^}]*\\}|export const Editor\\b" packages/plite/src packages/plite/test packages/plite-react/src/editable/runtime-editor-api.ts content/docs/plite --glob "*.{ts,tsx,js,jsx,md,mdx}" || true` -> only private `packages/plite-react/src/editable/runtime-editor-api.ts:32:export { Editor };`.
- `rg -n "\\bEditor\\." content/docs/plite packages/plite/test/public-* packages/plite/src/index.ts --glob "*.{md,mdx,ts,tsx}" || true` -> only old-API migration mapping and internal tests.
- `pnpm --filter @platejs/plite typecheck` -> passed.
- `pnpm --filter @platejs/plite test` -> passed: 1007 pass, 85 skip, 0 fail.
- `cd packages/plite && bun test --preload ../../config/plite-source-test-setup.ts test/public-package-import-smoke.test.ts` -> passed: 18 pass, 0 fail.
- `pnpm test:plite` -> passed.
- `pnpm plite:typecheck` -> passed: 13 successful tasks.
- `pnpm --filter plite test:plite-browser:chromium` -> exited 0: 594-test Chromium suite passed overall; flaky retries logged for code-highlighting and pagination.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-23-plite-editor-static-api-hard-cut.md`
- Lane: Plite package/API hard cut.
- Surface and route/package: `@platejs/plite`, `@platejs/plite/internal`, Plite sibling package imports, `apps/plite` browser regression proof.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timed minimum, one implementation loop plus closure loop.
- Behavior gates and visual proof: package behavior fixtures and Chromium browser regression pass; no new visual claim.
- Primary metric baseline/latest/best and stop reason: no perf metric; stop because public value export cut is complete and gates pass.
- Bugs fixed and oracles added: stale JS fixture import fixed; public import/type contracts updated; normalization object-signature guard repaired.
- Benchmark/skill/docs repairs: none.
- Workflow slowdowns and repairs: stale JS fixture missed by first import rewrite; fixed by `.js` audit. Browser lane logs flaky retries.
- Changed list: see Changed list table.
- Needs your attention: private bridge/table and unrelated browser flaky rows.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: do not cut private `plite-react` local `Editor` bridge in this packet; do not fix unrelated browser flakes here.
- Next owner: `auto` for next Plite/Plate API cleanup; browser-proof cleanup if you want to burn down flaky Chromium rows.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure for Plite public `Editor` static API hard cut |
| Where am I going? | Run `check-complete`, then close goal if it passes |
| What is the goal? | Stop exposing public Plite `Editor` runtime/static value while preserving type-only `Editor` |
| What have I learned? | Internal helper namespace works without exported `Editor`; private React bridge remains |
| What have I done? | Cut root export, removed exported internal object, fixed stale fixture, ran Plite package/type/browser proof |
| What changed in the checkpoint plan? | Seed rows closed, N/A rows scoped, residual risks recorded |

Timeline:
- 2026-06-23T20:05:53.195Z Goal plan created.
- 2026-06-23T23:28:27+02:00 `pnpm test:plite` passed after stale JS fixture fix.
- 2026-06-23T23:31:00+02:00 Chromium browser proof passed overall with flaky retries logged.
- 2026-06-23T23:35:00+02:00 `pnpm plite:typecheck` and public import smoke passed.

Open risks:
- Browser proof has unrelated flaky retries in code-highlighting and pagination rows.
- Private `plite-react` runtime bridge still exports a local `Editor` value from `runtime-editor-api.ts`; this is private, not public Plite API.
- Private `editorInternalApi` implementation table remains unexported in `packages/plite/src/interfaces/editor.ts`.
