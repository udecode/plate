# find non-huge performance issues versus main

Objective:
Find and rank non-huge performance issues versus exact main, using measured bundle/module/owner evidence while the real current route host is blocked.

Goal plan:
docs/plans/2026-08-18-find-non-huge-performance-issues-versus-main.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: direct user performance investigation
- prompt / link: "find any other perf issue vs main; ignore huge doc"
- lane: Plate registry/default editor and ordinary example performance
- surface / route / package: current `EditorKit`, ordinary examples, multiple editors, optional serializers/tooling, prior non-huge startup and heap regressions
- invocation mode: full-loop, finding/proof only
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: rank measured non-huge costs against main/source deltas, isolate at least the top current optional owners with five-run controlled evidence, and separate confirmed issues from route-host-blocked suspicions

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A: quantitative ranking applies
- improvement loop: source/import census -> byte attribution -> leave-one-owner-out bundles -> five-run module-load/heap where useful -> rank
- final score / loop closure: N/A

Completion threshold:
- Huge document is excluded from every scan, metric, and recommendation.
- Current default-editor bundle inputs are grouped by package/feature and ranked by bytes.
- Optional features newly or eagerly owned by current/default composition receive same-source leave-one-owner-out bundle proof and, for the strongest candidate, five-run Browser module-load/heap proof.
- Prior multiple-editor and independent heap rows are source-classified and retained as open when the broken route host prevents exact rerun.
- Final report names confirmed issues, supporting-only candidates, rejected false positives, and exact next owners without product changes.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-find-non-huge-performance-issues-versus-main.md` passes.

Verification surface:
- Current Bun bundle metafiles under `.tmp/post-docx-example-performance/` and new `.tmp/non-huge-perf-audit/` artifacts.
- Exact source diffs/import ownership between `origin/main` and current candidate for default EditorKit and ordinary example stacks.
- Same-current-source controlled aliases/entries to remove one optional owner without changing product source.
- Five deterministic bundle builds and five Browser static module-load runs for threshold-crossing candidates.
- Prior exact route artifacts for baseline context only; route claims remain blocked until the current host compiles.
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
- Source of truth: exact main source/artifacts, current candidate source/metafiles, and same-source controlled builds.
- Allowed edit scope: this plan and `.tmp/non-huge-perf-audit/**` measurement artifacts only; no product/runtime/generated/skill fixes.
- Browser surfaces: static controlled module-load pages only when route host is blocked; label them supporting, never route proof.
- Package/API surfaces: read-only package/input/feature ownership and current registry composition.
- Agent/skill surfaces: N/A unless this audit proves a recurring measurement workflow defect.
- Docs/research surfaces: prior performance plans/artifacts as context; no docs mutation.
- Non-goals: huge document, pagination, fixing candidates, generated registry repair, mobile/raw-device claims, commit/push/PR/issue mutation.

Output budget strategy:
- Parse metafiles into compact feature/package summaries; inspect top rows only; exclude generated registry, `.next`, logs, and `node_modules` source text; write raw tables to `.tmp/non-huge-perf-audit/**` and cap tool output.

Blocked condition:
- Exact route startup/heap claims remain blocked by the stale generated registry host, but bundle/import/source investigation continues. Stop only when every measurable non-huge owner is ranked or no controlled comparison can isolate it honestly.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate registry/default-editor performance
- surface: non-huge ordinary examples and optional default composition
- mode: full-loop finding-only
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 2
- current_checkpoint: final-handoff
- current_checkpoint_status: completed
- next_checkpoint: Patch per-editor model/runtime memory, then rerun current route host when generated registry is repaired
- goal_status: investigation complete

Current verdict:
- verdict: one systemic P1 memory regression and one connected startup regression confirmed
- confidence: high for exact pushed main/next route measurements and owner family; allocation line remains unresolved because HeapProfiler sampling is unavailable
- next owner: `patch` on per-editor Plate-on-Plite model/schema/runtime publication
- keep / revert / quarantine call: keep memory/startup evidence; keep CSV/migrations as minor debt; reject Highlight.js/Faker as vs-main regressions
- reason: five-run exact route rows reproduce across simple and multiple editors while DOM/listeners do not explain heap growth

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-find-non-huge-performance-issues-versus-main.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | completed | P0 | Copy prompt requirements, exclude huge, and read Vision. | Requirements and root/common/Plate doctrine recorded. | update |
| status | auto | completed | P0 | Read prior metrics, exact refs, current bundle graph, and host limits. | Non-huge sources and artifacts grounded. | update |
| gap-scan | auto | completed | P0 | Separate current-only additions, main baseline debt, and pushed-next runtime regressions. | Feature/package byte census and route matrix complete. | split |
| closure-handoff | autoclosure | completed | N/A | Finding-only investigation. | N/A. | retire |
| behavior-proof | lane proof owner | completed | P0 | Keep correctness before perf. | All measured non-huge routes mounted expected editors with zero runtime errors. | update |
| oracle-repair | lane test owner / tdd | completed | N/A | No implementation/test mutation. | Heap allocation-line gap deferred to Patch owner. | defer |
| visual-proof | Browser | completed | P0 | Real exact pushed hosts required. | Five fresh Browser runs for five route families; no visual/native interaction claim. | update |
| browser-helper-promotion | lane proof harness | completed | N/A | Existing repeated Browser helper sufficient for investigation. | No API promotion. | retire |
| mobile-claim-width | auto | completed | N/A | Desktop Chromium only. | N/A. | retire |
| huge-document-smoke | lane proof owner | completed | N/A | User explicitly excluded huge document. | N/A. | retire |
| perf-packet | lane perf owner | completed | P0 | Rank current/default and per-editor costs. | Five-run memory/startup, bundle census, and source owner evidence complete. | update |
| supervision-mode | auto | completed | N/A | No timed minimum. | N/A. | retire |
| consolidation | auto | completed | N/A | No reusable doctrine changed. | Evidence lives in plan/artifact. | retire |
| final-handoff | auto | completed | P0 | Rank confirmed, minor, rejected, and blocked rows. | Final ledgers complete. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by checkpoint-zero update |
| 0 | update | checkpoint-zero, status, gap-scan, perf-packet | User excludes huge and asks for other main-relative performance issues while route host is blocked. | Rank optional default composition with controlled bundle/module evidence; keep route rows blocked. | checkpoint-zero complete |
| 1 | split | perf-packet | Bundle census found large Highlight.js/Faker costs but exact main owns both; current-only CSV/migrations are small. | Reject baseline debt as regression; measure per-editor routes. | complete |
| 1 | update | behavior-proof, visual-proof, perf-packet | Five simple/multiple editor rows mount cleanly on exact main/next. | Keep memory/startup regression evidence. | complete |
| 2 | update | perf-packet, final-handoff | Scaling and source audit point to per-editor Plate-on-Plite compile/publication; no dominant CPU hotspot. | Route one P1 owner to Patch. | complete |

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
| Prompt requirements captured before work | yes | Find other perf issues versus main; huge explicitly excluded; measurement-only. |
| `auto` source rule read or fallback recorded | yes | Complete Auto and Performance skills read. |
| `vision` read as checkpoint zero | yes | Vision router, root, common, and Plate detail read; optional capabilities must not tax defaults. |
| Active goal checked or created | yes | Matching goal created after `get_goal` returned none. |
| Lane resolved | yes | Plate registry/default editor performance. |
| Invocation mode and timebox recorded | yes | Full-loop finding-only; no duration. |
| Dynamic checkpoint policy accepted | yes | Split optional-bundle, module-load, multiple-editor, and blocked route owners. |
| Source of truth and allowed workspaces recorded | yes | Exact main source/artifacts, current source/metafiles, `.tmp` controls. |
| Output budget strategy recorded | yes | Structured metafile parsing and artifacted raw output. |
| Release/PR/publish boundary recorded | N/A | No external/Git mutation. |
| Browser proof strategy recorded | yes | Supporting static pages only; no route-green claim. |
| Package/API proof strategy recorded | yes | Read-only feature/package ownership and byte/input deltas. |
| Mobile/raw-device claim-width policy recorded | N/A | Desktop Chromium supporting proof only. |
| Skill repair authority and source-rule boundary recorded | yes | Repair only if audit method itself repeats a workflow defect; no skill edits planned. |

Work Checklist:
- [x] First checkpoint complete: non-huge scope, main comparison, proof widths, artifacts, non-goals, and stop rule recorded.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Full-loop mode, no duration, dynamic checkpoints, and no soft questions are recorded.
- [x] Lane is Plate registry/default-editor performance with exact-main/current-source ownership proof.
- [x] Checkpoint supervisor reconciled after bundle, five-route memory, CPU, and owner passes.
- [x] Autoclosure N/A: no implementation/current-tree closure.
- [x] Each loop records split/update/retire decisions.
- [x] Status packet recorded; no runtime patch made.
- [x] Behavior proof: all five measured route families mounted expected editors without errors.
- [x] Visual/native selection proof scoped to mount/DOM/editor-count only; no interaction claim.
- [x] Missing allocation oracle deferred to Patch; Browser HeapProfiler sampling is unsupported.
- [x] Browser helper promotion N/A: investigation helper is sufficient and no product harness API is justified yet.
- [x] Mobile/raw-device N/A: desktop Chromium only.
- [x] Huge-document N/A: explicitly excluded by user.
- [x] Perf packets ran after clean route mounts.
- [x] Package/API audit read-only; no hard cut or public change.
- [x] Docs/Vision/rule consolidation N/A: no new doctrine.
- [x] Workflow slowdowns logged, including unsupported allocation profiler and one failed nested-code call.
- [x] Packet ledger covers bundle census, per-editor memory, multiple startup, select-editor amplification, and rejected baseline debt.
- [x] Changed list includes only plan and `.tmp` artifact.
- [x] Needs-your-attention ranked below.
- [x] Stopping checkpoint names Patch owner and current-candidate rerun blocker.
- [x] P2 autoreview N/A: no product implementation diff.
- [x] Agent-native review N/A: no agent changes.
- [x] Output stayed structured/capped and raw data is artifacted.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Rank at least one measured non-huge issue and reject false positives | Five route families plus bundle/source census complete. |
| Dynamic checkpoint reconciliation | complete | Split baseline debt, minor additions, and systemic runtime owner | Mutation ledger loops 1-2. |
| Lane authority proof | complete | Exact main/next production hosts and current bundle graph | Evidence below. |
| Workspace authority proof | complete | Plate root, exact-ref hosts, Browser/CDP | Evidence below. |
| Behavior gates | complete | Clean route mounts | All measured runs expected editor counts, zero errors. |
| Visual/native selection proof | complete | Mount/DOM only | No selection claim. |
| Missing oracle repair | complete | Defer exact allocation line to Patch | HeapProfiler sampling unavailable; source/scaling owner recorded. |
| `@platejs/browser` promotion | complete | N/A | No reusable public helper justified. |
| Mobile/raw-device claim width | complete | N/A | Desktop Chromium only. |
| Huge-document correctness smoke | complete | N/A | User excluded huge. |
| Package/API proof | complete | N/A | No package/API mutation. |
| Autoclosure handoff | complete | N/A | Finding-only. |
| Skill/rule sync | complete | N/A | No skill/rule change. |
| Changed list / review attention / stopping checkpoints | complete | Fill ledgers | Complete below. |
| Final lint/check | complete | Validate JSON and plan | JSON parse and checker. |
| Workflow slowdown review | complete | Log exact failures | Complete below. |
| Agent-native review for agent/tooling changes | complete | N/A | No agent changes. |
| P2 autoreview for non-trivial implementation changes | complete | N/A | No implementation diff. |
| Goal plan complete | complete | Run checker | Run after final update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | completed | Non-huge scope and Vision recorded. | status |
| Status and current-state read | completed | Prior route data, current metafile, exact refs/hosts, and source delta grounded. | gap scan |
| Gap scan and scenario matrix | completed | Bundle baseline debt, current-only additions, and per-editor routes split. | behavior proof |
| Behavior proof | completed | Five route families mounted cleanly. | perf packet |
| Oracle repair | completed | Allocation profiler gap deferred to Patch. | perf packet |
| Visual/native proof | completed | Browser DOM/editor/error proof complete. | perf packet |
| Browser helper promotion | completed | N/A. | perf packet |
| Mobile/raw-device claim width | completed | Desktop Chromium only. | perf packet |
| Huge-document correctness smoke | completed | N/A: excluded. | perf packet |
| Perf/API/docs/skill packets as needed | completed | Bundle census, five-run memory/startup, CPU/source owner evidence complete. | consolidation |
| Consolidation and review | completed | One summary artifact and ranked owner; no product review needed. | final handoff |
| Final handoff and goal-plan check | completed | Ledgers complete; checker runs after final edit. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| simple editor baseline | one editor, zero or three basic marks | desktop Chromium / five fresh tabs | mount | ready, heap, DOM, listeners, errors | complete |
| multiple editors | three editors with basic nodes/media | desktop Chromium / five fresh tabs | mount | ready, heap, DOM, listeners, errors | complete |
| select editor | one form/select editor | desktop Chromium / five fresh tabs | mount | heap, DOM, listeners, ready | complete |
| default bundle | full current EditorKit | Bun metafile | static build | feature/package bytes and main-source ownership | complete |
| huge document | excluded | N/A | N/A | N/A | N/A: explicit user boundary |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| bundle-census | 1 | performance | Large current bundle groups may be next regressions | current default metafile plus exact-main source audit | Highlight.js/Faker large but main-owned; CSV/migrations small/current-only | keep/reject rows | per-editor memory |
| per-editor-memory | 1 | performance/Browser | Plate-on-Plite has higher mounted editor heap | four one-editor routes, five fresh tabs each | +26.5% to +72.3% heap, small DOM/listener changes, zero errors | keep P1 | Patch core runtime publication |
| multiple-editor-startup | 1 | performance/Browser | Per-editor cost compounds across three editors | five fresh main/next routes | 110 -> 140 ms median; 15.93 -> 26.87 MB heap | keep P1 | same Patch owner |
| select-editor | 2 | performance/Browser | Feature migration amplifies systemic heap | five fresh routes | +72.3% heap, +19.4% DOM, +22.0% listeners, flat startup | keep P1/P2 | inspect after core fix |
| allocation-owner | 2 | source/CDP | One hot function or DOM/listener fanout owns growth | CPU profile, unsupported HeapProfiler, exact next source | no CPU hotspot; per-editor compile/publication creates schema/API/update/store maps | keep owner family | Patch with allocation instrumentation |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| exact pushed main/next simple editors | install editor, marks, controlled, select | Browser/CDP five fresh tabs | desktop Chromium | expected editor count and zero errors every run | pass |
| exact pushed main/next multiple editors | `multiple-editors-demo` | Browser/CDP five fresh tabs | desktop Chromium | 3 editors and zero errors every run | pass |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| mount-only performance | N/A | N/A | DOM/editor counts plus runtime errors | Browser exact hosts | complete; no selection/native behavior claim |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| fresh-tab memory/startup | five route families | existing Browser/CDP pattern | rerun after Patch and current host repair | keep as investigation harness; no public API promotion |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| all claims | desktop Chromium | local Mac Browser/CDP | complete | desktop only; no mobile/raw-device claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| all huge rows | N/A | N/A | user excluded huge | N/A | N/A |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| HeapProfiler allocation sampling | Browser CDP capability | one unsupported call | raw CDP surface forbids HeapProfiler sampling | exact limitation, no fake attribution | switch to five-route scaling plus source owner audit |
| first nested evaluation code string | Browser orchestration | one failed call | nested template literal was parsed by outer tool | no product evidence | rebuilt expression without nested templates; source audit continued |
| current dirty route host | generated registry owner | existing blocker | stale generated imports prevent current-candidate route replay | exact main/next pushed evidence still valid | report pushed-next issue; rerun dirty candidate after host repair |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/oracles/browser proof | five-route Browser/CDP measurement artifact |
| benchmarks/metrics/targets | `.tmp/non-huge-perf-audit/summary.json` |
| examples/docs | this plan only |
| skills/workflow | none |
| reverted/quarantined packets | HeapProfiler attribution unavailable; Highlight.js/Faker rejected as vs-main regressions |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Per-editor Plate-on-Plite heap growth | Systemic and compounds with plugins/editors | `.tmp/non-huge-perf-audit/summary.json` | fix first |
| 2 | Multiple-editor startup +27% | Exceeds 20% and 20 ms threshold | `/blocks/multiple-editors-demo` exact refs | include in same Patch packet |
| 3 | Select-editor +72% heap | Highest one-editor delta and has extra DOM/listeners | `/blocks/select-editor-demo` exact refs | remeasure after core fix, then feature-specific follow-up if residual |
| 4 | CSV default cost | Current-only but just 21.2 KB minified raw | `apps/www/src/registry/components/editor/plugins.ts` | defer; below material threshold |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| NON-HUGE-PERF-1 | implementation | Add allocation instrumentation and reduce per-editor compiled Plate model/runtime publication | Exact allocation line is not visible through Browser CDP | no fix attempted | bundle/source/route audit completed | Patch one minimal/marks/multiple case together; avoid example-specific fixes | `packages/core/src/lib/editor/withPlite.ts`, `compilePlateModel.ts`, `resolvePlugins.ts` |
| NON-HUGE-PERF-2 | proof-width | Repair generated registry before claiming the dirty local candidate | Current local route cannot run | local-candidate route replay | exact pushed main/next evidence continued | fix registry owner, then replay five routes | `apps/www/src/__registry__/index.tsx` |

Findings:
- Confirmed systemic heap regression on exact pushed next: installation editor +26.5%, marks +51.1%, controlled +54.1%, select editor +72.3%, and multiple editors +68.7% median fresh-tab heap versus exact main.
- Multiple editors also regresses median ready time from 110 to 140 ms (+27.3%, +30 ms), crossing both thresholds.
- DOM rises only 3% on multiple editors and listeners fall 41%, so DOM/listener fanout does not explain the 10.94 MB heap delta.
- Three simple routes add only 7-9% DOM and roughly unchanged listeners while heap adds 3.17-5.98 MB, isolating a per-editor runtime/model cost.
- Exact next `withPlite` compiles and publishes a Plate application model per editor. `compilePlateModel`/`resolvePlugins` create per-plugin schema bindings, maps, API snapshots, update-method tables, shortcuts, stores, and native extensions. This is the owning family, though HeapProfiler sampling is unavailable to name one allocation line.
- Select editor is the strongest feature amplifier: +72.3% heap, +19.4% DOM, +22.0% listeners, but startup is flat. Recheck it after the core per-editor fix before making a feature-specific patch.
- Current default bundle contains about 974 KB minified Highlight.js languages and 494 KB Faker, but exact main already imports both; they are baseline debt, not main-relative regressions.
- Current-only CSV plus migrations add about 42 KB minified raw combined. CSV is optional eager debt but below the audit's material regression threshold.

Decisions and tradeoffs:
- Rank the systemic per-editor heap/runtime owner above feature-specific cleanup; five independent routes reproduce it.
- Keep multiple-editor startup in the same Patch packet because it scales the same per-editor owner and crosses the latency threshold.
- Reject Highlight.js/Faker as answers to this request: large does not mean regressed versus main.
- Defer CSV isolation as minor until the P1 runtime memory owner is fixed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser HeapProfiler allocation sampling unsupported | 1 | Use repeated heap scaling, CPU profile, React/runtime shape, and source audit | Owner family identified; exact allocation line remains Patch work. |
| Nested browser evaluation template parsed by outer tool | 1 | Remove nested template strings | Retry ran; no product evidence lost. |

Verification evidence:
- `.tmp/non-huge-perf-audit/summary.json` contains refs, all five-run heap arrays, medians, startup rows, bundle groups, rejected rows, and owner evidence.
- Browser exact refs: main `2f87593f...` on `:3200`; next `a18bab5b...` on `:3201`; all measured routes mounted expected editors with zero errors.
- Five-run multiple editors: ready median 110 -> 140 ms; heap 15,930,328 -> 26,868,504 bytes; DOM 386 -> 397; listeners 1224 -> 726.
- Five-run simple editor heap medians: 11,949,896 -> 15,122,236; 11,720,848 -> 17,705,044; 10,125,988 -> 15,602,620; 11,365,732 -> 19,580,152 bytes.
- Current bundle metafile input attribution: Highlight.js 974,051 raw bytes, Faker 494,066, CSV/PapaParse 21,195, migrations 20,958.
- Exact-main source audit confirms Lowlight `all` and Faker were already default dependencies.

Final handoff contract:
- Goal plan: this file.
- Lane: Plate registry/default-editor performance.
- Surface and route/package: four simple editor routes, multiple editors, select editor, current default bundle, Plate-on-Plite model/runtime publication.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop finding-only; no minimum; two loops.
- Behavior gates and visual proof: five fresh Browser runs per route family; mount/DOM/error only.
- Primary metric baseline/latest/best and stop reason: heap and ready medians above; stopped after systemic owner family and feature amplifier were ranked.
- Bugs fixed and oracles added: none; finding-only authority.
- Benchmark/skill/docs repairs: none; summary artifact and plan only.
- Workflow slowdowns and repairs: unsupported HeapProfiler replaced with scaling/source evidence; exact output stayed capped.
- Changed list: plan and `.tmp/non-huge-perf-audit/summary.json` only.
- Needs your attention: per-editor runtime heap first; multiple startup and select residual second.
- Stopping checkpoints to unblock: Patch allocation instrumentation/fix; repair generated registry before dirty-candidate replay.
- Accepted deferrals and residual risks: exact allocation line unknown; current dirty candidate unmeasured; CPU profile shows no one dominant hotspot.
- Next owner: `patch` for one normalized per-editor memory/startup case.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff complete |
| Where am I going? | Patch per-editor runtime memory, then exact route replay |
| What is the goal? | Find non-huge performance issues versus main |
| What have I learned? | Systemic per-editor Plate-on-Plite heap is the material regression; large bundle debts already existed on main |
| What have I done? | Bundle census, five-route/five-run Browser heap and startup proof, CPU/source owner audit, and ranked artifact |
| What changed in the checkpoint plan? | Split baseline bundle debt, current minor additions, systemic runtime memory, and feature amplification |

Timeline:
- 2026-08-18T13:04:52.461Z Goal plan created.
- 2026-08-18: read Auto, Performance, Autogoal, Vision, current metafile, prior exact route artifacts, and main/current source ownership.
- 2026-08-18: five fresh runs across four simple routes and multiple editors confirmed systemic heap growth and multiple-editor startup regression.
- 2026-08-18: CPU/runtime/source audit identified per-editor model/schema/API publication as owner family; bundle false positives rejected.

Open risks:
- Current dirty candidate cannot be route-measured until generated registry is repaired; exact pushed-next regression is confirmed.
- Browser CDP cannot sample heap allocations, so the Patch owner must add internal allocation counters or a first-party benchmark before optimizing.
- Select-editor may retain a feature-specific residual after the systemic runtime fix.
