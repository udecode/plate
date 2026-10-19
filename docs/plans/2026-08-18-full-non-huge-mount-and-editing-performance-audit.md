# full non-huge mount and editing performance audit

Objective:
Audit every non-huge comparable example versus exact main for mount and real editing latency, correctness, long tasks, and owning hot paths.

Goal plan:
docs/plans/2026-08-18-full-non-huge-mount-and-editing-performance-audit.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: direct user correction and full performance audit
- prompt / link: "I don't care much about heap; mainly performance mount and editing; do a full audit"
- lane: Plate registry browser performance on exact pushed main/next
- surface / route / package: all 25 shared non-huge `/blocks/*-demo` routes; 14 previously runnable editors get full mount/edit audit; broken/non-editor rows get exact classification
- invocation mode: full-loop, finding/proof only
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: five retry-free alternating mount runs and real trusted-key editing rows for every runnable comparable editor; Enter/undo/long-task/correctness receipts; owner profile for every threshold-crossing lane; huge excluded

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A: route and interaction matrices apply
- improvement loop: route inventory -> correctness -> five-run mount -> trusted typing -> Enter -> undo -> continuous burst/long tasks -> owner profiles -> rank
- final score / loop closure: N/A

Completion threshold:
- Huge document is excluded from every route and conclusion.
- All 25 shared non-huge routes are classified as runnable editor, correctness failure, 404, iframe/non-local editor, or other non-comparable state.
- Every runnable comparable editor has five alternating mount runs and five fresh editing runs using trusted keyboard events with exact text/focus correctness.
- Editing rows record keydown-to-DOM mutation, keydown-to-second-paint, Enter mutation, undo restoration, long-task count/total/max, requested versus actual typing duration, and runtime errors.
- Threshold regressions require both >=20% relative and >=20 ms absolute median/p95 degradation, or a new >=50 ms long-task/correctness failure.
- Threshold-crossing mount/editing lanes get CPU/source owner evidence and are ranked separately from heap, which remains a secondary safety tag.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-full-non-huge-mount-and-editing-performance-audit.md` passes.

Verification surface:
- Exact refs `main=2f87593f...`, `next=a18bab5b...` on isolated production hosts `:3200`/`:3201`, plus the entire current checkout on a scratch production host at `:3203`.
- Connected Chrome with CDP timing and real CUA clicks/keypresses. Every accepted keydown, beforeinput, and input event reported `isTrusted=true`; raw rows are under `.tmp/full-mount-edit-audit/**`.
- Same target-selection/instrumentation logic on paired refs. The current candidate host contains exact selected example/runtime source, but uses 157 inert scratch-only stubs for stale generated-registry imports; candidate bundle-size and cold registry-load claims remain non-authoritative until CI regeneration.
- Source diff and CPU profile for threshold crossings; heap/DOM/listeners only as secondary tags.
- Existing prior artifacts provide route inventory only; every headline number is freshly replayed.
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
- Source of truth: exact pushed main/next production hosts, fresh Browser events, and current source for ownership.
- Allowed edit scope: this plan and `.tmp/full-mount-edit-audit/**` artifacts only; no product/runtime/test/generated/skill patches.
- Browser surfaces: 25 common non-huge example routes; desktop Chromium only.
- Package/API surfaces: read-only source owner/profile mapping.
- Agent/skill surfaces: measurement helper remains scratch unless repeated proof exposes a durable harness owner gap.
- Docs/research surfaces: prior plans/artifacts as route context only.
- Non-goals: huge document, heap-first ranking, pagination, mobile/raw devices, fixes, commit/push/PR/issue mutation, dirty local candidate claims.

Output budget strategy:
- Reuse the known 25-route inventory; write all per-key/per-route data to `.tmp/full-mount-edit-audit/**`; print only compact summaries; redirect server logs; never stream generated registry or Next output.

Blocked condition:
- Block only if exact pushed production hosts or Browser keyboard/CDP cannot run. Individual routes and gestures are classified and the audit continues; no proxy route upgrades a blocked exact row.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate registry browser performance
- surface: all comparable non-huge examples, mount and editing
- mode: full-loop finding-only
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 4
- current_checkpoint: final-handoff
- current_checkpoint_status: completed
- next_checkpoint: none; implementation requires a new architecture/fix goal
- goal_status: complete after checker and goal close

Current verdict:
- verdict: current local mount is broadly healthy after warmup, but editing is not ready
- confidence: high for editing; medium for candidate cold mount because the current generated registry is stale and required scratch-only compile stubs
- next owner: `plite-plan` + `plate-plan` architecture packet, then `patch`/`regression` implementation and exact pushed-ref replay
- keep / revert / quarantine call: keep the plugin-access cache; do not accept post-paint selector deferral as closure; quarantine Browser/synthetic/programmatic-selection rows and the first five noisy cold mount rows
- reason: real trusted Chrome input shows deterministic regressions even after the local partial fix

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-full-non-huge-mount-and-editing-performance-audit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | completed | P0 | Copy full-audit requirements, exclude huge, and read Vision. | Requirements and doctrine recorded. | update |
| status | auto | completed | P0 | Separate exact pushed next from the dirty current candidate. | Exact refs and scratch-candidate authority recorded. | update |
| gap-scan | auto | completed | P0 | Classify all 25 non-huge routes and every gesture lane. | 14 comparable routes, 11 exact classifications, huge excluded. | split |
| closure-handoff | autoclosure | N/A | P0 | No implementation, merge, or until-clean mutation was authorized. | Finding-only audit. | retire |
| behavior-proof | Chrome | completed | P0 | Require trusted type, Enter, undo, focus, text, and tree proof. | 140 pushed rows + 140 paired current rows; all events trusted. | update |
| oracle-repair | regression | deferred | P0 | Durable tests are required with the fix, not as an audit-only mutation. | Queue exact find/undo, Select Editor undo-tree, full-kit typing, and list Enter cases. | reprioritize |
| visual-proof | Chrome | completed | P0 | Use real clicks and native keyboard navigation. | Programmatic-selection rows discarded; real caret clicks and SingleBlock document-end navigation replayed. | update |
| browser-helper-promotion | regression | deferred | P1 | Current perf runner lacks this exact trusted route matrix. | Queue one reusable Chrome/CI runner with real clicks, fingerprinted refs, and route cohorts. | reprioritize |
| mobile-claim-width | auto | N/A | P1 | Desktop Chromium only; no mobile claim. | Scope explicitly limited. | retire |
| huge-document-smoke | auto | N/A | P1 | User explicitly excluded huge document. | No huge evidence enters the verdict. | retire |
| perf-packet | performance | completed | P0 | Rank mount, typing, Enter, undo, burst, long tasks, and owners. | Raw and summary artifacts written. | split |
| supervision-mode | auto | N/A | P0 | No timed minimum runtime. | Completion driven by matrix, not time. | retire |
| consolidation | auto | N/A | P1 | No reusable doctrine change was authorized. | Architecture recommendation recorded in plan only. | retire |
| final-handoff | auto | completed | P0 | Emit verdict, evidence, owner, risks, and next work. | Ledgers below complete. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by checkpoint-zero update |
| 0 | update | checkpoint-zero, status, gap-scan, behavior-proof, perf-packet | User says mount/editing are primary and requests full audit; huge remains excluded. | Build one exact 25-route matrix with trusted input, Enter, undo, long tasks, and owner profiles. | checkpoint-zero complete |
| 1 | split | behavior-proof, visual-proof | Browser Playwright/CUA emitted untrusted or bypassed key events. | Trusted input is a correctness gate. | Switched to connected Chrome. |
| 2 | reopen | behavior-proof | Programmatic DOM selection did not synchronize Plite selection. | Earlier rows compared different edit locations. | Discarded rows; real-click V7 matrix rerun. |
| 3 | update | status, perf-packet | Current checkout already contained uncommitted partial fixes not present in pushed next. | Pushed-next evidence alone would be stale for the user's current candidate. | Built isolated full-checkout candidate and reran paired matrix. |
| 4 | reopen | mount packet | First five cold-ish mount samples were order-sensitive. | Excalidraw/list apparent regressions reversed after warmup. | Added a separate warmed five-run matrix; no current mount threshold crossing. |
| 4 | add | architecture handoff | Current CPU profiles still show `getStateView` -> Plate read factory -> `mergePlugins` on every read. | Cache/deferral partial fix does not remove the owning work. | Queue architecture repair. |

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
| Prompt requirements captured before work | yes | Full non-huge mount/editing audit; heap secondary; exact main comparison; all routes classified. |
| `auto` source rule read or fallback recorded | yes | Complete Auto and Performance skills read. |
| `vision` read as checkpoint zero | yes | Vision router, root, common, and Plate detail read; real native/browser interaction outranks model/heap. |
| Active goal checked or created | yes | Matching goal created after `get_goal` returned none. |
| Lane resolved | yes | Plate registry browser performance. |
| Invocation mode and timebox recorded | yes | Full-loop finding-only; no duration. |
| Dynamic checkpoint policy accepted | yes | Route/gesture failures split into exact rows; owner profiles added from evidence. |
| Source of truth and allowed workspaces recorded | yes | Exact pushed production hosts and scratch artifacts only. |
| Output budget strategy recorded | yes | Raw events artifacted; summaries capped; logs redirected. |
| Release/PR/publish boundary recorded | N/A | No external or Git mutation. |
| Browser proof strategy recorded | yes | In-app Browser, trusted keyboard input, CDP main-world instrumentation, five alternating/fresh runs. |
| Package/API proof strategy recorded | yes | Read-only source/CPU ownership for hot lanes. |
| Mobile/raw-device claim-width policy recorded | N/A | Desktop Chromium only. |
| Skill repair authority and source-rule boundary recorded | yes | Promote helper only if audit proves a reusable owner gap; no skill edit planned. |

Work Checklist:
- [x] First checkpoint complete: full route/mount/edit/Enter/undo/long-task scope, huge exclusion, thresholds, artifacts, and handoff recorded.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Full-loop mode, no duration, dynamic checkpoints, and no soft questions are recorded.
- [x] Lane is Plate registry browser performance on exact pushed main/next hosts.
- [x] Checkpoint supervisor reconciled after Browser failure, selection failure, candidate discovery, and mount-noise discovery.
- [x] Autoclosure N/A: no implementation or merged/current-tree closure requested.
- [x] Every loop has an explicit mutation-ledger decision.
- [x] Current-tree/status packet separates pushed `next` from the full dirty candidate.
- [x] Behavior proof covers all 14 comparable routes; remaining routes are classified.
- [x] Native proof uses trusted Chrome clicks and key events; synthetic rows are quarantined.
- [x] Missing oracles deferred to `regression` with exact cases and proof targets.
- [x] Reusable route harness queued; no package mutation in this audit.
- [x] Mobile/raw-device N/A: desktop Chromium claim only.
- [x] Huge document N/A: explicitly excluded.
- [x] Perf follows behavior checks; two deterministic behavior failures remain findings, not hidden.
- [x] Package/API mutations N/A: read-only source ownership audit only.
- [x] Docs/vision/rule consolidation N/A: no accepted doctrine mutation.
- [x] Workflow slowdowns and harness repairs are logged.
- [x] Packet ledger has one row per evidence packet.
- [x] Changed list covers plan and scratch artifacts only.
- [x] Needs-your-attention list is ranked and capped.
- [x] Stopping checkpoints are listed.
- [x] P2 autoreview N/A: no implementation diff created by this audit.
- [x] Agent-native review N/A: no agent/tooling files changed by this audit.
- [x] Broad raw output is stored under `.tmp/full-mount-edit-audit/**`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | 5 paired rows per branch/route; warm mount replay; 3-run bursts | complete: artifacts below |
| Dynamic checkpoint reconciliation | yes | Four evidence-driven mutations | complete |
| Lane authority proof | yes | Plate registry routes + Plite/Plate source owners | complete |
| Workspace authority proof | yes | cwd `/Users/zbeyens/git/plate-2`; scratch hosts documented | complete |
| Behavior gates | yes | type/Enter/undo/focus/text/tree | complete with two failures reported |
| Visual/native selection proof | yes | connected Chrome real clicks and trusted keys | complete |
| Missing oracle repair | deferred | Fix goal must add durable cases | owner: `regression` |
| `@platejs/browser` promotion | deferred | Promote exact route runner with the fix | owner: regression/browser harness |
| Mobile/raw-device claim width | N/A | Desktop Chromium only | complete |
| Huge-document correctness smoke | N/A | User excluded huge | complete |
| Package/API proof | N/A | No package/API write | complete |
| Autoclosure handoff | N/A | No closure mutation | complete |
| Skill/rule sync | N/A | No skill/rule edit | complete |
| Changed list / review attention / stopping checkpoints | yes | Ledgers filled | complete |
| Final lint/check | N/A | No product code; JSON artifacts validated separately | complete |
| Workflow slowdown review | yes | Failed harnesses and scratch-registry limitation logged | complete |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes | complete |
| P2 autoreview for non-trivial implementation changes | N/A | No implementation diff | complete |
| Goal plan complete | yes | Run checker after this update | queued as final command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | completed | plan + Vision/skills | status |
| Status and current-state read | completed | pushed refs and dirty candidate separated | gap scan |
| Gap scan and scenario matrix | completed | 25-route classification | behavior proof |
| Behavior proof | completed | 280 final paired editing rows across pushed/current matrices | visual proof |
| Oracle repair | deferred | exact cases queued to regression | fix goal |
| Visual/native proof | completed | real Chrome click/typing/Enter/undo | performance |
| Browser helper promotion | deferred | reusable runner gap recorded | fix goal |
| Mobile/raw-device claim width | N/A | desktop only | none |
| Huge-document correctness smoke | N/A | explicitly excluded | none |
| Perf/API/docs/skill packets as needed | completed | mount/edit/burst/CPU/source packets | final handoff |
| Consolidation and review | N/A | no product or doctrine mutation | final handoff |
| Final handoff and goal-plan check | completed | ledgers below; checker next | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| 14 comparable `/blocks/*-demo` routes | exact pushed main/next | desktop Chromium, 5 alternating runs | mount | ready/DCL/script/errors | complete |
| same 14 routes | exact pushed main/next | real click, trusted keys | 10 chars + Enter x2 + undo x2 | mutation/paint/long tasks/text/tree/focus | complete |
| same 14 routes | exact main/current checkout | paired scratch production | identical gesture | same assertions | complete |
| controlled/find/list cohorts | exact main/current | 20 ms requested interval | 50-character burst | actual span/p95/long tasks | complete |
| remaining 11 routes | current candidate | route classification | load/editor/iframe/404 | exact reason | complete |
| huge document | excluded | N/A | N/A | no claim | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| pushed mount/edit | 1-2 | performance | pushed next may regress examples | `mount.json`, `editing.json`, `burst.json` | trusted Chrome matrix | keep as pushed-ref baseline | current candidate replay |
| current edit | 3 | performance | partial local fix may close pushed regressions | `current-editing.json` | 5 paired rows per route | fails | architecture repair |
| current mount | 4 | performance | first five samples suggest Excal/list regressions | `current-mount.json`, `current-warm-mount.json` | extra 10 suspect runs + warm full pass | initial finding rejected as cold noise | keep warm verdict; cold bundle unresolved |
| owner profile | 3-4 | Plite + Plate | read work scales with plugin count/subscribers | `current-cpu-*.json`, source anchors | source-mapped CPU profile | confirmed | cache state/read namespaces |
| behavior failures | 3 | regression | undo corrupts decorated/tag structures | `current-editing.json` | 5/5 exact replay each | confirmed | add red tests before fix |
| workflow | 1-3 | regression harness | synthetic/programmatic input lies | error-attempt ledger | real trusted replacement | queue helper promotion | implement with fix |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| ordinary editors | 12 document routes | `current-editing.json` | Chrome | exact type/Enter/undo state passes 5/5 each | perf repair only |
| Find/replace | `find-replace-demo` | same | Chrome | fails 5/5: undo duplicates paragraph text | regression test + renderer/history fix |
| Select Editor | `select-editor-demo` | same | Chrome | fails 5/5: submitted tag + empty paragraph survive undo | regression test + history fix |
| SingleBlock | `single-block-demo` | trusted `Cmd+ArrowDown`, type, Enter, undo | Chrome | exact initial text/tree restored 5/5 both refs | none |
| candidate-only collaboration | `collaboration-demo` | route classification | Chrome | current mounts two Plite editors; main baseline was not comparable | exclude from perf delta |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| comparable editor typing | DOM marker + exact text/tree | trusted click/keypress | clicked same visible leaf end | Chrome runtime | pass |
| SingleBlock multiline leaf | exact initial/final text | trusted document-end key | `Cmd+ArrowDown` aligns endpoint | Chrome runtime | pass |
| synthetic input audit | N/A | `isTrusted=false` | Browser press/CUA bypass | quarantined | rejected |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| ref-paired real editing | 14 routes, 5 runs | route cohort runner with trusted click/type/Enter/undo and fingerprinted refs | CI production-host replay | defer to regression fix packet |
| mount warmup | Excal/list false positive | explicit cold vs warm cohorts, minimum 10 suspect reruns | runner self-test | required in promoted helper |
| correctness marker | decorated/void routes | model/text/tree assertions, not mutation timing alone | focused find/select cases | required in promoted helper |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| mount/edit regressions | desktop Chrome | connected Chrome on macOS | complete | desktop Chromium only; no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge document | N/A | explicitly excluded by user | N/A | no claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Browser input attempts | harness | 2 failed methods | Playwright events were untrusted; Browser CUA bypassed keydown | false asymmetry between main/next | reject and require Chrome trusted flags |
| programmatic selection | harness | 3 discarded matrices | DOM Range did not synchronize Plite model selection | inserted at different locations/no-op voids | use real clicks; exclude void nodes; trusted document-end navigation |
| Node browser kernel | harness | 1 timeout | two-route batch exceeded runtime and erased memory | no accepted rows lost from disk | persist every route immediately; one route per call |
| candidate host | registry/CI | build workaround | stale generated index references 157 removed files; local rules forbid regeneration | exact runtime/edit rows, limited mount authority | scratch inert stubs only; require pushed CI-regenerated ref before closure |
| mount variance | performance | first 5 runs misleading | server/OS/route cold state dominated | extra 10 suspect runs + full warm pass | separate cold/warm cohorts |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/oracles/browser proof | scratch-only Chrome evidence under `.tmp/full-mount-edit-audit/**` |
| benchmarks/metrics/targets | raw mount/edit/burst/CPU summaries; no committed harness |
| examples/docs | this goal plan only |
| skills/workflow | none; helper promotion deferred |
| reverted/quarantined packets | all synthetic/programmatic-selection matrices; first five cold mount verdicts |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Find/replace | 23.2 ms median per-key regression, 33.4 ms burst, deterministic undo text duplication | `current-summary.json` | P0 red test and fix before push |
| 2 | Full-kit deferred work | code/copilot/Excal produce 121-149 ms max long tasks and 10 ms-class type regressions | `current-editing.json` | cache state/read namespaces; remove latency laundering |
| 3 | List Enter | 105.8 ms vs 11.0 ms; 239 ms median long-task total | same | profile/list-rule transaction and shared read path |
| 4 | Select Editor undo | visible text matches but inline tag + empty paragraph remain after undo | same | P0 history/tree regression test |
| 5 | Delivery authority | current route source cannot build without stale-registry scratch stubs | candidate authority note | regenerate only in CI, push, replay exact fingerprint |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| ARCH-1 | architecture | cache one stable state view and lowered read namespace per editor/extension generation | removes multiplicative owner instead of delaying it | implementation | audit complete | accept via `plite-plan` + `plate-plan` | source owner rows |
| REG-1 | regression | add find undo and Select Editor undo-tree cases | behavior must gate perf | closure | none | mandatory before fix claim | behavior ledger |
| PERF-1 | harness | promote paired real-input route matrix | current synthetic benchmarks missed this class | future closure | none | include cold/warm separation and ref fingerprints | workflow ledger |
| PUSH-1 | delivery | replay on final pushed CI-generated ref | scratch candidate is not shippable authority | completed/fixed wording | local diagnosis complete | mandatory | authority note |

Findings:
- P0: current `find-replace-demo` is still 23.2 ms slower per character at median (23.9 vs 0.7 ms), reaches 33.4 ms/key in the 50-character burst, and duplicates a paragraph segment after undo in 5/5 runs.
- P0: current `select-editor-demo` leaves a submitted inline-void tag and an empty paragraph after two undo operations in 5/5 runs; main restores the original tree.
- P1: current code-drawing/copilot/Excalidraw type at 10.5-11.9 ms versus 1.2-1.4 ms and produce 121-149 ms max long tasks. Their Enter medians are 83-100 ms versus 16-24 ms.
- P1: current list Enter is 105.8 ms versus 11.0 ms, with 239 ms median long-task total.
- P1: current markdown streaming remains 7.6 ms/key versus 0.9 ms but has no median long tasks; simpler editors are 2.2-3.3 ms/key versus 0.5-0.8 ms and stay within a frame.
- Mount: pushed next had six exact cold regressions. The local candidate warm matrix has no >=20 ms regression; markdown streaming is +14 ms and every other route is flat/faster. Candidate cold/bundle closure remains unavailable until CI regenerates the stale registry.
- Owner: every `editor.read` rebuilds `getStateView`, invokes every extension state-group factory, rebuilds Plate read capabilities, and deep-merges them. React subscribers multiply that work. Local plugin-context caching helps; post-paint deferral merely moves remaining work and correlates with stale/long-task behavior.

Decisions and tradeoffs:
- Heap is not ranked; it appears only in raw secondary evidence.
- Do not call the current candidate fixed. Mount is largely repaired, but editing and behavior are not.
- Keep plugin-access caching. Replace post-paint selector deferral with owner-level caching/invalidation of stable state/read views.
- Do not optimize individual examples first. Fix the shared read construction; then profile Find/Replace and List residuals.
- Do not accept local/scratch proof for issue completion. Final pushed-ref replay with CI-generated registry is mandatory.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser Playwright produced untrusted key events | 1 | connected Chrome | resolved |
| Browser CUA type bypassed keydown | 1 | per-key Chrome CUA | resolved |
| programmatic Range failed Plite model selection | 3 matrices | real click + endpoint validation | resolved; rows discarded |
| multiline click landed before final offset | 1 | trusted `Cmd+ArrowDown` | resolved |
| Chrome kernel timeout erased in-memory candidate rows | 1 | persist route immediately | resolved by full rerun |
| raw CDP new-document injection unsupported | 1 | CPU profile + runtime profiler | resolved |
| current `/blocks` host failed on stale generated imports | 1 | isolated full-checkout scratch build with inert unused stubs | runtime proof recovered; delivery remains blocked |
| first five mount samples misranked Excal/list | 1 | +10 suspect runs and full warm pass | finding rejected |

Verification evidence:
- `.tmp/full-mount-edit-audit/mount.json`: exact pushed main/next mount rows.
- `.tmp/full-mount-edit-audit/editing.json`: exact pushed main/next trusted editing rows.
- `.tmp/full-mount-edit-audit/burst.json`: pushed burst cohorts.
- `.tmp/full-mount-edit-audit/current-editing.json`: 140 paired main/current editing rows.
- `.tmp/full-mount-edit-audit/current-mount.json`: first-pass candidate mount rows and authority limitation.
- `.tmp/full-mount-edit-audit/current-warm-mount.json`: stable warm candidate mount matrix.
- `.tmp/full-mount-edit-audit/current-summary.json`: final ranked current verdict, behavior failures, owner evidence, and authority boundaries.
- `.tmp/full-mount-edit-audit/current-cpu-*.json`: source-mapped Find/List and mount owner profiles.

Final handoff contract:
- Goal plan: this file; checker must pass before goal completion.
- Lane: Plate registry performance with shared Plite/Plate owner diagnosis.
- Surface and route/package: 25 non-huge routes classified; 14 comparable routes fully measured; shared owners in Plite public state, Plite React selectors, Plate runtime lowering, plugin merging.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop finding-only; no time minimum; 4 evidence loops.
- Behavior gates and visual proof: trusted Chrome type/Enter/undo/focus/text/tree; two deterministic failures reported.
- Primary metric baseline/latest/best and stop reason: current worst type 23.9 vs 0.7 ms; current worst Enter 105.8 vs 11.0 ms; stop because audit threshold is complete, not because performance is acceptable.
- Bugs fixed and oracles added: none; implementation was out of scope. Exact red cases are queued.
- Benchmark/skill/docs repairs: scratch artifacts and plan only; reusable runner deferred.
- Workflow slowdowns and repairs: untrusted input, selection mismatch, kernel loss, registry drift, and mount noise all recorded with corrected methods.
- Changed list: plan + `.tmp` evidence only.
- Needs your attention: ranked list above; next action is architecture + regression fix, then final pushed-ref replay.
- Stopping checkpoints to unblock: ARCH-1, REG-1, PERF-1, PUSH-1 above.
- Accepted deferrals and residual risks: no implementation/oracle/helper mutation; candidate cold bundle remains non-authoritative until CI regeneration.
- Next owner: `plite-plan` + `plate-plan`, then `regression`/`patch`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff complete; checker next |
| Where am I going? | New architecture/fix goal, outside this audit |
| What is the goal? | Audit all comparable non-huge mount/edit behavior versus main with trusted proof and exact ownership |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-08-18T13:24:11.508Z Goal plan created.
- Pushed main/next: 140 mount rows, 140 trusted editing rows, and burst/profile evidence captured.
- Current checkout: isolated scratch production host built; 140 paired editing rows and cold/warm mount matrices captured.
- Synthetic input and programmatic-selection matrices discarded; exact behavior failures and shared owner confirmed.
- Final plan reconciled for closeout.

Open risks:
- Current dirty checkout cannot provide canonical cold/bundle proof because its generated registry is stale.
- Find/Replace and Select Editor have deterministic behavior regressions.
- Full-kit and List editing retain material long tasks.
- No durable regression tests exist yet for this exact class.
