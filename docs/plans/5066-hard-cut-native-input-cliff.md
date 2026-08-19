# hard cut native input cliff

Objective:
Close #5066 native-input architecture; done when every Plite binary readiness
gate passes; plan docs/plans/5066-hard-cut-native-input-cliff.md.

Flow mode:
one-shot execution (accepted by the user on 2026-08-17)

Goal plan:
docs/plans/5066-hard-cut-native-input-cliff.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`: the public/runtime break spans Plite command evaluation, Plite
  React DOM/input, Plate rendering adoption, raw Plite examples, docs, browser
  proof, and the homepage benchmark. No external editor comparison is needed.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Live source audit at `a18bab5bba2d73e446523cbd848c5baeb19935f4`:
  `packages/plite/src/core/command-registry.ts`,
  `packages/plite-react/src/editable/runtime-before-input-events.ts`,
  `packages/plite-react/src/editable/native-input-strategy.ts`,
  `packages/plite-react/src/dom-text-sync.ts`,
  `packages/plite-react/src/dom-strategy/create-segment-plan.ts`,
  `packages/plite-react/src/components/editable-text.tsx`,
  `packages/core/src/react/components/PlateContent.tsx`, and
  `packages/core/src/react/utils/{pipeRenderLeaf,pipeRenderText}.tsx`.
- Bounded adoption audit: all ten production `insertText` registration files,
  the three production raw-Plite `textSync` example owners, the public export,
  and `content/docs/plite/libraries/plite-react/editable.mdx`.
- Execution commands: focused Plite command and React contracts; Core renderer
  tests and typecheck; `pnpm check:plite:dev`; focused Chromium raw-Plite rows;
  exact Chrome homepage replay; `pnpm --filter www perf:homepage-input` after
  replacing the 150 ms gate; strict `pnpm check:plite`; P2 autoreview.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve pure command semantics, one canonical transaction/commit, history,
  collaboration, effects, tags, IME/composition, native selection, undo, and
  follow-up typing. A native preview followed by delayed semantic repair is not
  an acceptable performance result.
- Normal Plate/Plite app setup gains no input-strategy or performance flag.
- Implementation uses no compatibility aliases, per-handler `nativeSafe`
  boolean, dual renderer contracts, debounce, or delayed repair theater.

Boundaries:
- In scope: command evaluation versus application; per-event native/model input
  choice; live renderer invariance; DOM text sync; Android stored-diff policy;
  public text-sync option removal; Plate renderer adoption; raw Plite examples;
  docs, tests, diagnostics, exact browser proof, and homepage perf gate.
- Source owners: `packages/plite` owns pure command evaluation and canonical
  transaction specs; `packages/plite-react` owns input/DOM/selection strategy;
  `packages/core` owns the Plate renderer bridge; `apps/www` owns public demos
  and the homepage gate; `@platejs/browser`/`apps/plite` own replayable browser
  proof when the interaction repeats.
- Non-goals: cutting product plugins, changing command authoring call sites,
  weakening suggestion/input-rule/link/table behavior, redesigning DOM mounting
  strategies, pagination architecture, physical-device claims, release, PR,
  push, issue comment, label, or closure.
- Direct Plate/collaboration adoption owners: Plate Core renderer pipeline and
  every installed command handler remain consumers. Yjs/collaboration has no
  public API change but must preserve one canonical commit and history mapping.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block execution only if pure command results cannot distinguish an unchanged
  native insertion from a material semantic intervention without adding a
  second public policy source, or if exact Chrome cannot exercise the final
  source after fresh host repair. Planning is not blocked.

Plite Plan state:
- status: complete
- phase: slice 6 complete
- next: push the exact current checkout and replay the case on that pushed ref only when the user authorizes git delivery
- handoff: the local candidate is complete; public fixed/completed promotion remains blocked only by missing push authority and pushed-ref replay

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Rearchitect and cut the dangerous implicit behavior; prevent recurrence; use Best API then Auto/Plite Plan; preserve exact #5066 proof. |
| Active goal and plan verified | yes | Goal `Close #5066 native-input architecture`; this issue-prefixed plan is the sole Plite planning artifact. |
| Current owners read | yes | Current Plite command/input/DOM/render owners, Plate bridge, all ten production command registrations, three text-sync example owners, docs, tests, and live issue read at exact HEAD. |
| Best API target resolved | yes | Best API verdict: no app performance flags and no handler-presence heuristic; derive strategy from material pure command result and renderer ownership. |
| Mode and execution boundary resolved | yes | Standard agent-led plan hardening. Planning only; user must invoke this exact plan for implementation. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Slice 0 replaces the lying homepage budget with an exact red-capable oracle and current baseline.
- [x] Slice 1 separates pure command evaluation from application with exact semantic parity.
- [x] Slice 2 removes handler-presence gating and preserves exactly one canonical commit.
- [x] Slice 3 hard-cuts public text-sync flags and moves renderer capability to its owner.
- [x] Slice 4 closes Android and projection adoption without widening the public API.
- [x] Slice 5 passes exact Chrome 5/5 stability, zero long tasks, latency gates, and package-focused checks.
- [x] Slice 6 repairs docs, Vision, Best API teaching, generated mirrors, strict checks, stale-symbol audit, and final fingerprints.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All responsibilities, decisions, breaks, adoption, slices, risks, and proof gates are resolved below. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Exact HEAD `a18bab5...`; source fingerprints and live issue #5066 refreshed on 2026-08-17. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | P0 implicit fast-path cliffs rejected; selected hard cut keeps normal call sites unchanged and removes public text-sync flags. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | High-risk runtime/browser/perf, issue provenance, Plate/docs/examples, and collaboration commit law are concrete below; release and physical-device claims are out of scope. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Source/adoption audit, diagnostic metrics, test owners, browser claims, and execution commands are recorded. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete. |
| Implementation slices | yes | Complete or honestly revert every accepted vertical slice | Slices 0-5 complete; slice 6 closeout open. |
| Public hard cut | yes | Remove exports, types, callers, examples, docs, tests, and stale teaching with no compatibility path | `DOMTextSyncOptions`/`textSync` removed from public source, examples, tests, and current docs; zero live authoring matches. |
| Browser and performance | yes | Exact Chrome 5/5, zero long tasks, latency/correctness gates, and focused raw-Plite browser proof | Final P2-clean exact Chrome 5/5: mutation p95 5.5-5.9 ms, second-paint p95 16.0-18.0 ms, 20/20 trusted native input events and commits per run, zero long tasks/errors, exact emitted-character text/caret, model/DOM parity, focus preserved. |
| Package and strict checks | yes | Focused tests/typechecks, `pnpm check:plite:dev`, lint, and strict `pnpm check:plite` | Passed: affected development lane in 157,499 ms; strict lane in 386,480 ms, including all typechecks/package/contracts/public types/builds and 698 Chromium tests across all 78 bounded batches (6 skipped). |
| Doctrine and generated parity | yes | Best API repair, smallest Plite Vision repair, affected worker audit, `pnpm install`, and zero stale examples | Complete: source rules/Vision updated, mirrors regenerated, `.claude` symlinks current, zero live `textSync` authoring matches. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only | Clean final runtime bundle at 0.86 confidence and clean late strict-gate delta at 0.94 confidence; no accepted/actionable P0-P2 findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5066-hard-cut-native-input-cliff.md` | Passed: `[autogoal] complete: docs/plans/5066-hard-cut-native-input-cliff.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Exact ref, issue, owners, public exports/docs, ten command registrations, renderer bridge, existing tests, and measured reproduction read. | Decide |
| Decide | complete | Best API hard-cut target converted into resolved concept ledger and adoption map. | Prove and hand off |
| Prove and hand off | complete | Vertical slices, exact proof matrix, risk controls, and final handoff prepared. | User accepts exact plan for execution |
| Execute slice 0: oracle | complete | Harness now gates mutation p95 <=16 ms, second-paint p95 <=32 ms, zero long tasks, exact text/selection/focus/commit state, and raw samples. | Execute slice 1 |
| Execute slice 1: command evaluation | complete | 47 command-spec tests pass; evaluation/application split preserves ordering, delegation, tags, rollback, and one canonical commit. | Execute slice 2 |
| Execute slice 2: semantic input probe | complete | Opaque default-result probe keeps pass-through handlers native and fails closed on rewrites/prefix/material consumption; desktop and Android share it. | Execute slice 3 |
| Execute slice 3: renderer hard cut | complete | Live leaf text strings and public text-sync flags are cut; per-node Plate capability keeps inactive/simple renderers native and active custom whole-text renderers model-owned. | Execute slice 4 |
| Execute slice 4: Android/projection | complete | Android pass-through/material contracts and projection/DOM-sync suites pass without public flags. | Execute slice 5 |
| Execute slice 5: exact browser closure | complete | Final exact Chrome 5/5 passed at 5.5-5.9 ms mutation p95 and 16.0-18.0 ms second-paint p95 with zero long tasks and exact correctness oracle. | Execute slice 6 |
| Execute slice 6: doctrine/strict handoff | complete | Doctrine/mirrors, API generation, fingerprints, ledger completion, focused proof, clean P2, affected dev proof, and strict 78-batch Chromium proof complete. | Pushed-ref replay after authorized delivery |

Decision brief:
- outcome: Plain collapsed text insertion remains native even when conditional
  command handlers and ordinary renderers are installed; material command
  interventions remain model-owned and publish exactly one canonical commit.
- chosen shape: split pure command evaluation from application; derive
  native-equivalence from the evaluated immutable transaction spec; attach
  live renderer capability at the renderer/projection owner; remove app
  `textSync` configuration and handler-presence gating.
- strongest rejected alternative: add `nativeSafe` or text-invariant flags to
  every app/handler. That duplicates behavior truth, silently drifts, and leaves
  future feature registration able to disable the editor globally.
- consequence: public `DOMTextSyncOptions` and
  `DOMStrategyOptions.textSync` break and disappear. Normal Plate, plugin
  command, and raw `Editable renderLeaf` call sites get simpler; advanced
  genuinely text-dependent `renderText` stays an explicit model-owned escape
  path.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Native-input eligibility | `hasCommandHandler(insertText)` makes any registration a global model-input switch. | Evaluate the actual pure immutable command result per event; exact unchanged delegation remains native and any material result fails closed to model input. | Plite command runtime + Plite React input runtime | Registration is not behavior; all ten handlers are conditional and ordinary text usually falls through. | Command authoring call sites remain unchanged. | Pure evaluation tests; pass-through, reflection, rewrite, prefix, effects, tags, scoped views, and state-change browser rows. | The native candidate builds but does not publish a real spec; material commands rebuild after final selection sync and only that final command is applied. | rearchitect |
| Command API | Pure `handle`/`around` already return `false | TransactionSpec`, but evaluation and application are fused. | Keep public command authoring exactly; factor internal evaluate/inspect/apply stages with no exported planner or second operation stream. | `packages/plite` | Existing pure result is the single semantic truth needed for the strategy decision. | Ten production registrations need no annotations or flags. | Existing command-spec suite plus new native-equivalence trace tests. | Internal split could change ordering, `next.after`, tags, rollback, or recursion. Prove exact parity. | keep |
| Native-equivalence law | No semantic classifier; presence is used as a proxy. | Internal classifier accepts only the default one-character insertion with equivalent target/selection and no extra document changes, effects, tags, or policy output. | `packages/plite` internal + Plite React consumer | Fail closed on material behavior while keeping no-op/pass-through middleware free. | Android and desktop consume the same semantic decision; no public API. | Negative tests for suggestion, input rule, link end, multi-cell table selection, affinity, Copilot effect, and trigger combobox. | Over-broad equivalence could skip product law. Default to model unless equivalence is proven. | rearchitect |
| DOM text-sync public API | `DOMTextSyncOptions` is public and nested under DOM mounting strategy; apps assert `renderLeaf: 'text-invariant'` and projection transforms. | Hard-cut the public export and `DOMStrategyOptions.textSync`. DOM mounting strategy contains mounting only. | `packages/plite-react` | Performance/correctness capability belongs to the renderer/projection owner, not every app route. | Remove three raw-Plite example assertions and editable docs text; no alias or shim. | Export/type audit; raw renderer browser tests; zero stale `textSync` authoring matches outside historical solution prose. | Raw custom renderers need an honest fallback. Keep advanced text-dependent rendering model-owned. | cut |
| Ordinary live leaf rendering | Arbitrary `renderLeaf` is assumed unsafe unless an app flag opts in; props expose raw text fields that can make DOM shape text-dependent. | Make the ordinary live leaf contract text-invariant by construction/type; children carry text and property/decoration data may shape wrappers. | `packages/plite-react` | The normal mark-rendering job does not require branching on the text string, and structural safety beats an app promise. | Raw examples keep `<Editable renderLeaf={renderLeaf}>` with no strategy flag; text-string-dependent consumers move to the advanced lane or runtime-owned empty/projection state. | Type tests, live DOM sync tests, marks/decorations, empty text, hard affinity, and selection proof. | Static renderers and affinity currently consume text length. Split static/live types and keep runtime-only special cases internal. | rearchitect |
| Plate renderer bridge | `PlateContent` always supplies `pipeRenderText`; `pipeRenderText` returns a custom function even with no active outer-text job, so every Plate text host is `custom-text`. | Publish per-node renderer capability internally; ordinary inactive/property-only Plate renderers remain DOM-sync capable, while an active truly text-dependent outer renderer falls back. Do not expose a Plate config flag. | `packages/core` React bridge + Plite React renderer protocol | Installed custom components that are inactive must not globally disable typing. Capability follows the rendered node, not plugin-list presence. | Plate app setup and plugin component authoring stay unchanged; renderer pipeline and tests adopt internally. | Core renderer tests/typecheck; homepage H1 and marked/link/suggestion rows; exact DOM attributes and selection. | Mislabeling a text-dependent component native-safe causes DOM/model divergence. Unknown/custom outer renderers fail closed with a diagnostic. | rearchitect |
| Projection text sync | Pagination passes `projections: 'range-transform'` through DOM strategy. | Move range-transform capability to the projection/renderer owner; the route selects only mounting strategy. | Plite React projection runtime; pagination adopter | Projection behavior, not viewport strategy, knows whether in-place DOM text transformation is legal. | Pagination removes nested text-sync config; no pagination architecture change. | Existing projection/DOM-sync tests plus focused pagination Chromium row. | Projection splits and native selection can diverge. Keep fail-closed coverage and no-double-selection proof. | move |
| Advanced `renderText` | Any `renderText` disables DOM sync, but Plate uses it for ordinary composition too. | Retain `renderText` only as the explicit advanced whole-text/model-owned lane; normal mark/leaf composition must not require it. | Plite React public surface; Plate Core adopter | Progressive disclosure: advanced text-dependent DOM shape pays the cost explicitly without poisoning the normal editor. | Update current docs; no new helper or boolean. | Advanced renderer history/DOM repair test and dev diagnostic. | Some current components may rely on whole-text wrappers. Audit and keep only real owners. | rearchitect |
| Android stored-diff policy | Android flushes pending text diffs from handler presence. | Consume the same evaluated material-command decision; pass-through handlers keep deferred native diffs, material handlers flush/model-own. | Plite React Android input manager | Desktop and Android cannot encode two different meanings for command registration. | No public API; physical-device receipts remain deferred. | Existing Android command-handler contracts rewritten for pass-through/material results; semantic mobile proof. | Raw device timing remains unproved. Do not claim physical-device closure. | rearchitect |
| Diagnostics and perf gate | A 150 ms mutation budget accepted 108 ms and 20/20 long tasks. | Report exact native/model blocker internally; gate homepage at zero >=50 ms long tasks, mutation p95 <=16 ms, second-paint p95 <=32 ms, plus same-run main-relative comparison and correctness fields. | Plite React diagnostics + apps/www benchmark | A dangerous strategy downgrade must be observable and CI-failing. | `/dev/editor-perf` stays a reduced-stack diagnostic, never homepage closure proof. | Exact Chrome final replay, stable harness, raw samples/distribution, focus/model/DOM selection/commit checks. | Fixed budgets can drift by machine. Keep hard long-task/correctness gates and calibrate relative threshold on one runner. | gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Red oracle and benchmark repair | Regression + apps/www | Replace the loose 150 ms gate with raw samples, long tasks, mutation/second-paint distribution, correctness, and same-run control. | Accepted plan; exact current red retained. | Harness fails current source for the exact visible symptom and cannot pass at ~100 ms. | Focused harness self-test; exact Chrome baseline on fresh host. |
| 1. Pure command evaluation split | `packages/plite` | Factor command-chain evaluation from application; add internal trace/equivalence result without public export. | Slice 0 red is stable. | Existing command API and transaction behavior pass unchanged; native-equivalence classification is deterministic. | Plite command-spec/extension tests and typecheck. |
| 2. Semantic browser input decision | `packages/plite-react` | Replace handler-presence gating with evaluation of the real pure command result; material behavior uses the existing model command path, native-equivalent behavior uses native DOM input, and either path publishes exactly one canonical commit. | Slice 1 parity green. | Desktop model/DOM/selection/history/effect/tag/focus tests and synthetic pass-through perf are green. | Plite React model/native/keyboard/mutation contracts; focused Chromium. |
| 3. Renderer ownership hard cut | Plite React + Plate Core | Cut public text-sync configuration, establish ordinary live leaf invariance, add internal per-node renderer/projection capability, stop Plate from globally publishing unsafe outer text behavior. | Slice 2 input semantics green. | Public exports/callers/docs migrated; no app flags; raw and Plate renderers choose native/model honestly. | Plite React DOM strategy/sync tests, Core renderer tests/typecheck, raw examples browser proof. |
| 4. Android/projection adoption | Plite React + pagination | Move Android to material-command decision and projection capability to projection owner. | Slices 1-3 green. | Android semantic tests and focused pagination projection/selection proof pass; physical-device claim remains deferred. | Android contracts; Chromium pagination row; mobile semantic proof. |
| 5. Exact homepage closure | Regression/Patch + apps/www | Run fresh-source exact Chrome and retry-free stability; tune only owning hot code if target still misses; preserve all command behaviors. | All focused package/browser proofs green. | 5/5 warm runs: exact final text/focus/model+DOM selection/one commit, zero long tasks, p95 targets, no accepted P2 finding. | Homepage harness, exact Chrome, source-first typechecks, `pnpm check:plite:dev`, P2 autoreview. |
| 6. Strict handoff and doctrine repair | Plite Plan + Best API repair | Update current docs, Plite Vision principle, Best API source rule, affected worker teaching, generated mirrors, and strict proof. | Slice 5 green. | Zero stale public flags/heuristics, `pnpm install` mirror parity, strict `pnpm check:plite`, final checker. | Source audits, generated parity, strict checks, final exact-ref fingerprints. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Handler registration alone causes no fast-path change | `hasCommandHandler` currently gates every insert; ten production handlers are mostly conditional fallthrough. | Pure pass-through `handle`, unchanged `around(next)`, rewritten input, prefix/effect/tag, and material spec tests. | ready |
| Plain rich homepage insertion is not Plite core scale | Comparable 249-node minimal Plate/Plite measured 10.8 ms p95; rich stack measured 111.8 ms. | Same-process control/full comparison with raw samples and exact correctness. | ready |
| Renderer capability belongs to renderer owner | Public `textSync` appears in one exported type channel and three production raw-Plite example owners; Plate always supplies `renderText`. | Export/type hard-cut audit, live invariant/advanced renderer browser tests, Plate per-node capability tests. | ready |
| Material policies preserve behavior | Production handlers cover suggestion, input rules, link exit, table multi-cell replacement, AI/Copilot, combobox, affinity, and raw examples. | One focused row for each material family plus undo, IME/composition, selection, focus, effects/tags, and commit count. | ready |
| Homepage perceptible delay is removed | Exact Chrome red: mutation p95 98.5 ms, second-paint p95 104.8 ms, 20/20 long tasks; Felix branch median 108.4 ms versus main 1.1 ms. | Final exact Chrome 5/5 passed: mutation p95 5.5-5.9 ms, second paint 16.0-18.0 ms, zero long tasks, 20/20 trusted native events+commits, exact emitted-character text/caret, model/DOM parity/focus; pushed-ref replay still required before public fixed wording. | local-green |

Conditional evidence:
- High-risk scenarios: (1) a suggestion/input-rule material spec is mistaken
  for pass-through and user-visible semantics disappear; (2) a prepared native
  spec becomes stale between `beforeinput` and DOM mutation and publishes at
  the wrong selection/root; (3) a renderer declared invariant changes DOM shape
  from text and corrupts selection/IME; (4) preflight effects/tags execute
  twice; (5) Android stored diffs follow a desktop-only policy. Every scenario
  has a negative proof row in slices 1-4.
- External research: N/A: pure command law, renderer ownership, and the exact
  failure are already live in this repo; no external editor comparison can
  change the selected public shape.
- Issue/PR provenance: live issue
  `https://github.com/udecode/plate/issues/5066` is open. Felix's current
  comment is `https://github.com/udecode/plate/issues/5066#issuecomment-5317304567`.
  The stale `completed` label does not establish closure. No PR exists.
- Browser/benchmark/docs/release/behavior-law owners: browser and benchmark
  apply through exact Chrome/homepage plus raw-Plite Chromium; docs apply to
  `editable.mdx` and three examples; command/runtime law applies to Plite;
  collaboration applies only through one canonical commit proof; release and
  physical-device claims are N/A because neither was requested.

Findings:
- Current exact HEAD is `a18bab5bba2d73e446523cbd848c5baeb19935f4`.
- Pure commands are already specified and implemented as committed-state
  evaluation into `false | TransactionSpec`; public handler APIs need no new
  performance metadata.
- `runtime-before-input-events.ts` converts handler presence into
  `hasAppInputPolicy`, and native input rejects that boolean before examining
  whether handlers materially changed the command.
- Ten production insert-text registration files exist. The eight package
  owners are AI Chat, Copilot, table, link, suggestion, combobox, input rules,
  and affinity; two raw-Plite examples add URL/Markdown shortcuts. Ordinary
  alphabetic input in the homepage H1 falls through these policies.
- `DOMTextSyncOptions` is publicly exported and nested under DOM mounting
  strategy. Three production raw-Plite example owners manually assert
  text-invariant/projection behavior.
- `PlateContent` always supplies `pipeRenderText`; `pipeRenderText` returns a
  custom outer renderer even when no special outer-text job is active, so
  installed Plate composition globally pressures Plite into `custom-text`.
- Existing tests encode the dangerous presence heuristic for desktop and
  Android and explicitly teach app-level text-sync opt-in; they must be
  replaced, not preserved as compatibility law.
- Current public docs teach `textSync?` inside DOM strategy even though the
  rendered Props summary omits it. The hard cut removes that contradiction.

Decisions and tradeoffs:
- Keep command authoring; cut presence-based strategy inference. This uses the
  existing pure semantic result instead of adding a parallel policy source.
- Cut app text-sync configuration. Internal renderer/projection ownership is
  more complex, but that complexity prevents every app from making an unsafe
  promise and keeps normal call sites smaller.
- Preserve advanced `renderText` as model-owned rather than pretending every
  arbitrary callback is native-safe. Normal live leaf rendering carries the
  stronger invariant.
- Fail closed on uncertain semantic equivalence. Performance cannot outrank
  suggestions, input rules, IME, selection, history, or collaboration.
- The private classifier evaluates the real pure transaction result. Exact
  delegated identity remains native; rewrites, prefixes, replacements, and
  material specs fail closed. The candidate spec is never published. Material
  commands rebuild after final selection sync and apply once, so no public
  bridge or stale prepared-spec lifetime exists.

Review fixes:
- Active custom Plate text components now fail closed per text node; installed
  but inactive components do not disable native input globally.
- Live comment/suggestion leaf helpers accept metadata-only text properties,
  so current copied UI does not recover the removed text string through casts.
- Plugin access and decoration contexts are reused instead of rebuilt per node.
- `useEditorRuntimeState` coalesces external chrome selectors after paint so 39
  toolbar selectors cannot block native text paint.
- Accepted P2: the default homepage gate now requires 20/20 trusted native
  `input` events and synchronized non-projected text hosts, not only latency
  and final-state equality.
- Rejected P1 stale-state finding after source verification: cached
  `EditorStateView` is a live method facade, not a captured snapshot. A new
  cross-commit command test proves text, selection, and snapshot version all
  advance through the reused facade (48/48 command tests green).
- P2 rerun accepted three fail-closed gaps: command state is cached per actual
  scoped editor view; active arbitrary text/node props and text-capable
  injection transforms are model-owned; element-targeted injections reject
  text nodes at the shared matcher instead of globally disabling the homepage.
- Two-cycle scope pause: all remaining findings affect the same #5066
  native-equivalence/renderer-capability invariant and require no new public
  product, storage, protocol, or release contract. Continue to one clean P2
  rerun after focused and exact Chrome proof.
- Later P2 accepted the runtime leaf gap: live `renderLeaf` payloads omit text
  and segment offsets at runtime, not only in types, while exposing a stable
  path for Core hard-affinity ownership.
- The proxy-sentinel approach was deleted after review proved host operations
  such as `structuredClone` cannot be made fully observable. Classification
  now uses the real pure default spec. Unknown raw `renderLeaf` stays
  model-owned; only the internally audited Plate leaf pipeline publishes
  per-node native capability.
- Exact identity-preserving `next(input)` forwarding is native-equivalent;
  only a different input object is a rewrite. The real-spec classifier and
  exact homepage oracle remain green after this correction.

Autoreview scope baseline:
- Original request: rearchitect #5066 so ordinary homepage typing cannot fall
  off the native path merely because a handler or renderer is installed.
- Violated invariant: fast-path eligibility follows material behavior and
  owner capability; normal apps do not promise safety with flags.
- Target: current dirty checkout rooted at `a18bab5...`; no push, PR, or release
  authority. Exact Chrome local proof is the behavior authority.
- Owner boundary: Plite pure command classification; Plite React input,
  renderer, selection, and runtime-selector scheduling; Plate Core renderer,
  plugin-context, and decoration adoption; comment/suggestion metadata helper
  adoption; current docs/examples/benchmark/doctrine.
- Contracts: preserve every material insert-text policy, one canonical commit,
  history/collaboration, IME, selection, focus, static rendering, and public
  hard-cut adoption. Unknown render/command behavior fails closed.
- Review bundles: the issue-owned runtime received its own P2 pass. Later
  strict-gate repairs received a second bounded P2 pass covering current proof
  inputs, list fixture typing, pagination, path ownership, synced-block unsync,
  and v54 codec expectations.

Agent-native review:
- Verdict: PASS for the #5066 workflow.
- User action -> agent route: public issue routes through Maintainer/Regression
  to one-case Patch and this accepted Plite Plan.
- Source owner -> mirror/doc: Best API and Plite Plan rules are edited under
  `.agents/rules`; `pnpm install` regenerated `.agents/skills`, and `.claude`
  points to those generated owners.
- Proof -> handoff: the checked-in homepage harness, regression ledger, exact
  Chrome recipe, package/browser commands, fingerprints, and public-status law
  let another agent reproduce the red, validate the local candidate, and avoid
  fixed/completed wording before pushed-ref replay.
- Findings: none. Checkout-wide release metadata and proof-input drift are
  repaired and strict is green. Missing push authority is the sole promotion
  boundary and remains explicit here.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Exact selection comparator serialized equal points with different key order | 1 | Normalize point `{ path, offset }` fields before comparison | Correctness gate now compares semantic point fields. |
| Headless double-RAF phase missed 32 ms despite 4-5 ms mutation | 5-run diagnostic | Keep hard target in exact Chrome; profile post-mutation owners instead of widening budget | Decoration/context and chrome-selector owners were optimized; exact Chrome passed 5/5. |
| `check:plite:dev` exposed live-leaf text-string consumers | 2 adopter waves | Fix metadata helpers/examples at their owners | Apps Plite and www package-integration typechecks pass. |
| Chrome fresh navigation hung on stale HMR server | 2 | Stop the exact old process tree, start a clean dev server, reload same Chrome tab | Exact Chrome page mounted and final 5/5 completed. |
| Checkout-wide Plite gate included stale release/proof-input contracts | 2 owner classes | Preserve changeset content, repair exact current inputs, then rerun the whole strict lane | Duplicate changesets were merged without content loss, proof inputs were aligned to current owners, two stale browser contracts were repaired, and strict passed all 78 batches. |

Verification evidence:
- Source audit: exact owners and fingerprints read at HEAD `a18bab5...`; the
  public text-sync channel, Plate bridge, ten command registrations, existing
  tests, docs, and examples are fully enumerated.
- Browser/perf evidence inherited only after exact-ref validation: independent
  exact Chrome reproduction recorded mutation p95 98.5 ms, second-paint p95
  104.8 ms, and 20/20 long tasks; deterministic harness reproduced 111.8 ms;
  minimal comparable Plate/Plite was 10.8 ms; lab-only capability/native
  experiments reached 39.7/5.7 ms and were not kept as code.
- Live GitHub read on 2026-08-17 confirms issue #5066 open, no PR, Felix's
  exact refs/metrics, and a stale `completed` label.
- Focused execution proof: Plite command 47/47; Plite React changed contracts
  300/300 plus runtime-selector 4/4; Core integration/renderer/context tests
  green; AI 43, combobox 23, link 50, suggestion 84, and table/affinity/slow
  behavior 79; modified package typechecks and www integration typecheck green.
- Exact Chrome final proof on P2-clean fresh source: five warm runs at mutation
  p95 5.9/5.7/5.5/5.6/5.5 ms and second-paint p95
  17.4/18.0/16.3/17.7/16.0 ms. Each run recorded 20 trusted native input
  events, 20 canonical commits, zero long tasks, exact model/DOM text and
  selection, collapsed native selection, preserved focus, DOM-sync capability,
  and zero runtime errors.
- Final dirty-ref fingerprint manifest: harness
  `6162336b33c913a2132887af5553a046a6e88b49a020b9c3b48bf6b72d2717c2`,
  playground source `1f02c65d...`, command owner `fc58b4fe...`, DOM-sync
  owner `a8c9a2b7...`, and Plate leaf owner `eb6ab570...`; the 21-column
  regression ledger is completion eligible for this exact manifest.
- Public status read-back: posted local-candidate-only comment
  `https://github.com/udecode/plate/issues/5066#issuecomment-5321521071`,
  then posted final local closure proof at
  `https://github.com/udecode/plate/issues/5066#issuecomment-5322092150`.
  Read-back confirms the issue is open and live labels are `bug` and
  `performance issue`; pushed-ref replay is still required.
- Final checkout proof: `pnpm check:plite:dev` passed in 157,499 ms. Strict
  `pnpm check:plite` passed in 386,480 ms with 698 Chromium tests, 6 skips,
  and every one of 78 bounded batches complete. Fresh exact Chrome DOM replay
  passed 5/5 with exact 20-character text, focus, synchronized non-projected
  text hosts, and no runtime-visible error. The final checked-in performance
  harness passed 5/5 at mutation p95 6.6/6.1/5.7/6.1/6.5 ms and second-paint
  p95 15.5/13.2/15.0/12.5/13.0 ms, with zero long tasks, 20/20 trusted native
  inputs and commits, exact model/DOM/caret state, and no blockers/errors.
- Planning source query: all production `handle|around(editorCommands.insertText)`
  files and all non-test `textSync|text-invariant` owners were counted before
  line inspection; generated public output and tests were classified separately.

Final handoff prepared:
- Ownership and target API/runtime: Plite evaluates pure commands; Plite React
  chooses input strategy and owns renderer/DOM capability; Plate Core adopts
  internally. Normal public Plate and command call sites stay unchanged.
- Public breaks and Plate/collaboration adoption: remove
  `DOMTextSyncOptions` and `DOMStrategyOptions.textSync`; migrate three raw
  examples/docs; preserve one canonical commit for history/collaboration.
- Applicable browser/benchmark/docs/provenance decisions: exact Chrome
  homepage is closure authority, raw Plite Chromium covers reusable behavior,
  docs/examples teach no flags, live issue remains open, release/device proof
  is out of scope.
- Proof and execution risks: semantic misclassification, stale prepared spec,
  renderer misclassification, double effects/tags, Android divergence. Each is
  tied to a negative execution row and fail-closed behavior.
- Execution order and user attention: oracle -> pure evaluation -> prepared
  input -> renderer hard cut -> Android/projection -> exact homepage -> strict
  checks/doctrine repair is complete. Git delivery remains user-controlled.

Timeline:
- 2026-08-17T19:26:11.529Z Plite Plan created.
- 2026-08-17: refreshed exact HEAD, live issue #5066, renderer/input/command
  owners, every production command registration, public option consumers,
  tests, docs, and prior exact Chrome metrics.
- 2026-08-17: converted the accepted Best API verdict into a resolved hard-cut
  ledger, six execution slices, proof matrix, risk controls, and handoff.
- 2026-08-17: user explicitly accepted this exact plan; created a new one-shot
  execution goal and reopened implementation/proof gates before source edits.
- 2026-08-18: completed command semantic probe, renderer/public hard cut,
  Android/projection adoption, live-leaf consumer migration, context/decorator
  allocation cuts, and post-paint chrome-selector batching.
- 2026-08-18: final P2-clean exact Chrome passed 5/5 with 5.5-5.9 ms
  mutation p95, 16.0-18.0 ms second-paint p95, zero long tasks, exact
  emitted-character/caret oracle, and full correctness fields.
- 2026-08-18: final issue-only P2 autoreview exited clean with no accepted or
  actionable findings; regression ledger is completion eligible at the exact
  dirty ref and five-file fingerprint manifest.
- 2026-08-18: posted and read back the honest local-candidate issue comment;
  removed stale `completed`, preserved the open issue, and named pushed-ref
  replay as the next promotion gate.
- 2026-08-18: repaired the stale checkout-wide release/proof contracts,
  reproduced and fixed newly inserted element path ownership, aligned current
  Plate v54 codec proof, and passed affected development plus the complete
  strict 78-batch Chromium lane.
- 2026-08-18: final late-delta P2 autoreview exited clean at 0.94 confidence;
  fresh exact Chrome DOM replay and the final checked-in performance harness
  both passed 5/5.
- 2026-08-18: regression ledger validation returned `completionEligible: true`
  for the exact five-file manifest, and the final Autogoal checker passed.
- 2026-08-18: posted and read back the final local-candidate proof comment;
  issue #5066 remains open without `completed`.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Local implementation and every requested proof gate are complete |
| Where am I going? | Authorized git delivery, then exact pushed-ref replay and public promotion |
| What is the goal? | Remove silent renderer/handler fast-path cliffs without weakening editor semantics |
| What have I learned? | Pure command specs already own the material decision; app flags and handler presence are false proxies |
| What have I done? | Implemented the hard cut, migrated adopters/docs/doctrine, repaired strict drift, passed P2, affected, strict, exact Chrome, and final harness proof |

Open risks:
- The issue remains a local candidate until the exact checkout is pushed and
  the fingerprint-matched case is replayed on that pushed ref. No fixed,
  completed, merged, or shipped claim is authorized before then.
- Raw physical Android/iOS timing is unproved and explicitly outside this
  issue's desktop Chrome closure. Android semantic contracts still apply.
- The final same-run relative threshold needs calibration on the chosen CI
  runner, but zero long tasks and 16/32 ms hard caps remain non-negotiable for
  local exact-Chrome closure.
