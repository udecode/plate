# cleanup hook-bearing render injection

Objective:
Replace or sharply reduce Plate's hook-bearing render injection only where a
single compiled/mounted owner preserves every current behavior and improves the
measured render path; retain any hook whose replacement proof is incomplete.

Goal plan:
docs/plans/2026-09-04-cleanup-hook-bearing-render-injection.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: direct user request continuing the completed rendering-safety packet
- id / link: current Codex task plus `docs/plans/2026-09-03-plate-and-plite-rendering-safety-architecture.md`
- title: hook-bearing render-injection architecture cleanup
- requested surface: Plate render injection and its Plite/React execution boundary, especially prior D9-D12
- cleanup intent: execute the strongest durable cleanup after a bounded bestness challenge; break or rearchitect in scope when the replacement is proved
- acceptance criteria: complete owner/reachability map, at least two material target alternatives, hostile challenge and delta, at most three checkpointed phases, every cut obligation replaced and regression-proved, frozen performance reruns for growing work, and no speculative dirty packet

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: one-shot architecture execution with at most three independently reversible checkpoints
- initial confidence / cleanliness score: 3.0/10 at 91% evidence confidence;
  `wrong-lifetime` hard cap. Receipt:
  `node tooling/scripts/plate-review-score.mjs --axis owner=1 --axis lifetime=1 --axis boundary=2 --axis api=1 --axis scale=1 --axis correctness=2 --axis proof=2 --confidence inventory=4 --confidence trace=4 --confidence consumers=3 --confidence runtime=3 --cap wrong-lifetime`
- improvement loop: audit, challenge, implement one proved phase, rerun focused proof, then continue/pivot/retain
- final score / loop closure: complete only after every accepted cut and retained owner has an evidence-backed decision

Completion threshold:
- The bounded D9-D12 surface has one accepted target and canonical owner; at
  least five concrete candidates and two materially different architectures are
  scored; the hostile review records its challenge delta; no more than three
  phases are used; every removed hook/adapter/owner names its replacement and
  proof; focus, IME/composition, hydration/SSR, refs, custom hosts, local React
  state/effects, cleanup, static rendering, commands/defaults/schema,
  serialization, selection, and failure repair remain exact; normal, large,
  and stress performance lanes meet frozen budgets; incomplete replacements are
  retained rather than cut; all implemented packets end keep/revert/quarantine.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-cleanup-hook-bearing-render-injection.md`
  passes.

Verification surface:
- Source/reachability audit of plugin compilation, injected node props,
  `getRenderNodeProps`, render pipes, mounted Plate/Plite components, static
  rendering, and all first-party hook-bearing definitions/callers.
- Existing D9-D12 attribute-source receipts plus a matched production
  pre/post normal/large/stress benchmark for any hot-owner mutation.
- Focused React/state/effect/StrictMode/SSR/hydration/custom-host/ref/cleanup,
  focus/selection/composition/native-input, static/serialization/command, and
  inferred public-type proof; relevant package checks and Browser proof before
  broad Plite/Plate closure.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Preserve product UX and document/native behavior. The accepted hard cut may
  remove the unsupported claim that `transformProps` is a React hook host and
  the editor-global block-placeholder target selector, but only after the
  `best-api` counterfactual, current call-site audit, replacement proof,
  current-state docs, and changeset are complete.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.
- Preserve hard correctness, serialized data, native browser behavior, runtime
  ownership, and exact cleanup; compatibility and implementation cost may
  change adoption order but not the ideal target.
- Keep normal rich text, explicit external text, and document virtualization
  independent. Do not use the CodeMirror lane to hide normal-render costs.
- Every removed hook needs a production replacement, not a renamed callback
  bag or prototype-only attribute source.
- Use at most three execution phases with continue/pivot/stop checkpoints.
- Do not commit, push, open a PR, release, or mutate external systems.

Boundaries:
- Source of truth: root `VISION.md`, Plate/Plite vision detail, current source/tests, and the completed rendering-safety benchmark receipts
- Allowed edit scope: Plate plugin compilation/render injection, owning Plite/React render boundary, focused tests/benchmarks/docs/plans required by accepted packets
- Plite / Plate boundary: Plate owns plugin declarations/compiled render data; Plite owns canonical editor state, native DOM/input, selection, composition, and mounted view lifetime
- Public API boundary: no public change under a cleanup-only packet; any justified public cut must first pass `best-api` and the owning Plite/Plate adoption plan
- Browser surface: focused raw Plite behavior surfaces and standalone Plate code-block/editor surfaces only when affected; `editor-ai` is excluded
- Package/API surface: `packages/platejs`, `packages/plitejs`, their React entrypoints/type tests, and first-party registry definitions needed to prove reachability
- Non-goals: redoing the settled CodeMirror/external-text/code-line decision, mixing external text with document virtualization, automatic thresholds, viewport token rendering in normal mode, unrelated package cleanup, Git publication

Output budget strategy:
- Inventory filenames/counts first; scope `rg` away from generated output,
  dependencies, and historical plans except the named D9-D12 evidence; save
  benchmark traces/large matrices as artifacts and inspect summaries.

Blocked condition:
- Stop a phase when any cut lacks a named production owner or executable
  replacement oracle, when matched performance is slower/inconclusive, or when
  focus/IME/hydration/custom-host/ref/state/effect/cleanup/static/serialization
  behavior diverges after three materially different isolation moves.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: heavyweight
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: active

Current verdict:
- verdict: keep
- cleanliness confidence: 9.6/10 at 100% evidence confidence
- next owner: none; route a third independent dynamic-attribute job to
  `best-api` before exposing a public manager
- keep / revert / quarantine call: keep all three executed packets; retain the
  prior commit-boundary AttributeSource prototype as historical evidence only
- reason: the production owner is view-local, private, output-only, and keyed;
  hook-bearing injection and the duplicate named-root view are gone, exact
  behavior gates pass, and target-move work no longer grows with document size

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-cleanup-hook-bearing-render-injection.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, execute authority, max-three checkpoint law, replacement matrix, proof, non-goals, stop rule, and final handoff are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | `.agents/skills/architecture-cleanup/SKILL.md` read completely. |
| Active goal checked or created | yes | Active task goal created with the full execution and regression contract. |
| Source of truth read before analysis | yes | Root `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, current implementation/tests, and the D9-D12 rendering-safety packet were read before target lock. |
| VISION fit gate read | yes | The target follows the mounted-view lifetime law and keeps raw Plite Decoration range-only; no Vision change is required. |
| Plite / Plate boundary selected | yes | Plate declaration/compilation ownership and Plite mounted/native lifetime ownership recorded above. |
| Cleanup surface selected | yes | Hook-bearing render injection, especially D9-D12. |
| Non-goals recorded | yes | Boundaries exclude settled huge-code architecture, editor-ai, unrelated cleanup, and publication. |
| Output budget strategy recorded | yes | Scoped inventory and artifact-first benchmark output recorded above. |
| Implementation authority decided | yes | User's “go” authorizes in-scope execution after the architecture challenge; no Git/external authority. |
| Proof strategy selected | yes | Source/reachability, replacement matrix, focused behavior/types/browser, and frozen matched performance proof recorded above. |
| Runtime scale applicability resolved | yes | The packet removes per-plugin per-node subscriptions and global host rerenders. Current 100/1k/10k mount and navigation receipts are frozen; exact production reruns are mandatory. |

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
- [x] Implementation packets are behavior-neutral except for the accepted
      public `_target`/selector and hook-transform cuts, narrow, reversible by
      packet, and have focused proof plus a changeset for the public break.
- [x] Every hot-owner packet has a frozen pre-packet scale receipt and exact
      post-packet production rerun plus correctness guard; paper complexity or
      "benchmark later" cannot justify keep.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused tests, matched production receipts, Plate typecheck, `check:plite:dev`, strict `check:plite`, registry/barrel generation, and browser proof all pass. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | See source map below. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | See deslop inventory below. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Seven candidates scored below. |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Selected target moves dynamic paint from three implicit owners to one named private owner; details below. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | One new private owner is accepted because two features share the same view-local keyed lifetime and one focused contract; no generic public package or helper tree is added. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Delete hook semantics and `_target`; merge dynamic attribute publication; keep pure injection; reject wrapper and public-manager expansion. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Existing mounted-view presentation and range-only Decoration laws select the target. No taste change. |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | Three packets recorded below; all are kept. |
| Hot-owner scale preservation | yes | For every applicable packet, compare matched pre/post normal/large/stress cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed zero-runtime N/A | Frozen and current receipts use the same 100/1k/10k fixtures; all correctness guards pass and warm target moves improve 11.7x-30.1x. |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Private store, mounted navigation, multi-view placeholder, compiled capability, pure injection, default host, retained text, SSR, and hydration oracles added or repaired. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | Product behavior is exact. The unsupported hook-host claim and placeholder `_target` selector are deliberately cut after `best-api`; `.changeset/utils-plite-node-types.md` records the break. |
| Package/API proof | yes | Run relevant package/export/type/build proof when package boundaries changed, or N/A | `pnpm --filter platejs typecheck`, `pnpm brl`, `check:plite:dev`, and strict `check:plite` pass; the private store is absent from public barrels. |
| Browser proof | yes | Run Browser/Playwright proof when visible behavior changed, or N/A | Standalone 10k code-block demo inspected in Browser; its two-row Chromium behavior suite and product benchmark pass. Current block-placeholder docs render the new contract. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | Targeted Ultracite, 193 focused tests, Plate typecheck, development closure, and strict closure pass. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Searches stayed owner-scoped and benchmark/test detail was written to receipts; the strict runner emitted bounded batch summaries. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Completed below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-cleanup-hook-bearing-render-injection.md` | Run after this closeout update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | source, Vision, skill, and prior D9-D12 evidence read | source map |
| Source map | complete | owner/reachability map below | deslop inventory |
| Deslop inventory | complete | concrete debt rows below | candidate matrix |
| Candidate matrix | complete | seven candidates plus hostile challenge | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | all three accepted packets implemented; each kept after its checkpoint | verification |
| Verification | complete | focused, matched scale, package, strict Chromium, registry, lint, and live Browser gates pass | closeout |
| Closeout | complete | plan, changeset, docs, source-owner teaching, receipts, and residual risk recorded | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | high | Stable plugin hook components publish render-safe attributes into one private view-local keyed store; pure injection remains document/static data | `PlateContent`, new private store, four element render hosts, navigation, placeholder | Two current dynamic jobs share exact mounted-view lifetime; one keyed update touches old/new NodeKeys; no raw Plite or public manager | before 5 files / 3 implicit owners / weak proof / ambiguous boundary; after 3 owner files for runtime trace / 1 runtime owner / focused store+feature proofs / private boundary | implement in no more than three phases | Plate React | keyed store contract, multi-view focus/IME/SSR/custom-host/ref tests, matched production benchmark | plan/keep when gates pass |
| 2 | medium | Extend raw Plite Decoration from text ranges to element attributes | Plite Decoration types, manager, renderer, Plate adapter | Reuses mature invalidation machinery | 4 files / 1 owner / strong proof, but public boundary becomes ambiguous | reject: violates explicit range-only inline-paint law and makes raw Plite own Plate product attributes | none | Vision counterfactual | reject |
| 3 | low | Keep hook transforms and optimize selectors/caches | current injection/store files | Small diff; hooks still execute in ordinary loops and preserve global capability penalty | 5 files / 3 owners / weak proof / public ambiguity unchanged | reject: cannot remove hook-order calls, static/live conflict, or all-node subscription fan-out | none | source trace and 10k receipt | reject |
| 4 | low | Wrap every node in one stable component per stateful plugin | render slots / wrappers | Legal React hook lifetime | 5+ files / N plugin owners / fragmented proof / public wrapper exposure | reject: multiplies fibers/subscriptions and disables fast element paths | none | reachability and scale counterfactual | reject |
| 5 | low | Imperatively mutate target DOM attributes | DOM runtime/integrity observer/navigation/placeholder | O(1) mutation | 5 files / split React+DOM owners / difficult proof / private boundary | reject: React can overwrite attributes; hydration, custom hosts, refs, and cleanup become two-writer problems | none | hostile lifecycle matrix | reject |
| 6 | medium | Require each element component to own navigation/placeholder hooks | every target component and registry host | Hooks have real component identity | unbounded callers / fragmented owners / per-component proof / public burden | reject: default/intrinsic/custom hosts cannot inherit cross-cutting behavior reliably | none | host reachability map | reject |
| 7 | medium | Publish a generic public AttributeSource/manager API | Plate public plugin API plus provider/store | Could serve hypothetical third parties | 6+ files / 2 public concepts / broad proof / clear but unnecessary boundary | defer: only two first-party jobs exist; stable components are the honest migration for third-party React-local state | `best-api` if a third independent job appears | call-site census and API counterfactual | defer |

Source map:
- Declaration/public capability owner:
  `packages/platejs/src/react/plugin/PlatePlugin.ts` exposes
  `InjectNodeProps.transformProps`; `packages/platejs/src/lib/plugin/BasePlugin.ts`
  carries the shared/static form. Static and React currently share a type that
  cannot honestly promise hooks.
- Compile/reachability owner:
  `packages/platejs/src/internal/plugin/resolvePlugins.ts` publishes one global
  `pluginCache.inject.nodeProps` list. It records no element/text or pure/hook
  capability.
- Execution owners:
  `pluginInjectNodeProps.ts` invokes transforms on rejected nodes to preserve
  hook order; `pipeInjectNodeProps.tsx` calls every injection plugin before the
  edit-only check; `getRenderNodeProps.internal.ts` activates the slow path for
  any injection; element, leaf, text, and static renderers all consume it.
- Mounted React owners:
  `PlateContent.tsx` owns one Editable and `EditorRefEffect`; stable
  `plugin.useHooks` components are the correct React lifetime. Element output
  lands through `FastElementBody`, `FastIntrinsicElementBody`,
  `ElementContent`, or `DefaultElementWithPath`.
- Dynamic callers: only
  `NavigationFeedbackPlugin.ts` and `BlockPlaceholderPlugin.tsx` call hooks
  from `transformProps`. Navigation subscribes every element to one full
  target. Placeholder writes a mounted-view choice into editor-global
  `_target`, then subscribes every matching block to that state.
- Existing unrelated owner:
  Plite `decoration-source.ts` is a 1,512-line, NodeKey-indexed, fault-contained
  range-paint manager. `VISION.md` and `docs/vision/plite.md` explicitly limit
  it to inline keyed ranges, so it is evidence for keyed invalidation, not the
  owner of element attributes.
- Largest/live files in the bounded path:
  `editable-text-blocks.tsx` 2,131 lines, `decoration-source.ts` 1,512,
  `pipeRenderElement.internal.tsx` 478, `pipeRenderLeaf.internal.tsx` 355,
  navigation 273, `pipeRenderText.internal.tsx` 244, injection helper 170,
  placeholder hook 125. Size alone is not a split trigger.
- Proof owners:
  `pluginInjectNodeProps.spec.ts`, `pipeRenderElement.spec.tsx`,
  `pipeRenderLeaf.spec.tsx`, `BlockPlaceholderPlugin.slow.tsx`,
  `NavigationFeedbackPlugin.spec.tsx`, `PlateContent.spec.tsx`, Plite browser
  focus/composition/static contracts, and the mounted 100/1k/10k receipt.

Deslop inventory:
| Surface | Finding | Decision |
|---------|---------|----------|
| rejected-node transform calls | Fake `{ props: {} }` calls exist only to impersonate React hook order | delete after dynamic callers move |
| edit-only injection order | Work runs before the feature is known to be disabled | move guard before evaluation |
| default element guard | Default elements silently lose all injection because one callback might be a hook | delete guard; pure injection applies uniformly |
| global injection capability | Element-only injection poisons text/leaf retained-flow selection | compile/derive target capability and cut the false penalty |
| placeholder `_target` | Exact-view presentation is stored in editor-global plugin state and publicly surfaced through a redundant selector | delete; stable view hook publishes attributes directly |
| navigation transform subscription | Every element subscribes to one target and filters after wakeup | replace with one view hook plus old/new keyed publication |
| Plite Decoration reuse | Attractive duplicate-kernel reduction, but wrong public domain | reject; do not widen range paint |
| DOM commit-boundary prototype | Solves imperative two-writer damage rather than the owning problem | quarantine as historical evidence only; do not productionize |
| D11 config fields | `defaultNodeValue`, `nodeKey`, valid values, commands, and schema/serialization jobs are pure document config | keep; do not delete `inject.nodeProps` wholesale |
| D12 mixed slots | No proven connection to the measured fan-out | defer outside this packet |

Hostile challenge and delta:
- Initial target: productionize a private AttributeSource read/observe manager.
- Challenge: the repository already has a mature keyed Decoration manager, so
  a second source runtime looked like duplication.
- Failed pivot: widening Decoration to element attributes would contradict the
  explicit raw-Plite range-only law and turn product props into substrate API.
- Final delta: keep the keyed store private and output-only. Stable Plate
  `useHooks` components calculate dynamic state and publish tiny NodeKey maps;
  the store only merges, snapshots, and wakes affected element hosts. It has no
  public source API, node traversal, editor-global state, or second callback
  lifecycle.

Accepted phases and pivot checkpoints:
1. Add the private keyed rendered-attribute owner; migrate navigation and block
   placeholder; delete placeholder `_target`/selector. Continue only if exact
   UI, multi-view, focus/read-only/composition, cleanup, SSR/hydration,
   custom-host/ref, and 100/1k/10k navigation gates pass.
2. Make injection transforms pure: delete rejected-node hook calls, move the
   edit-only guard before evaluation, enable default-element injection, and
   replace hook-support tests with pure/static parity. Continue only if package
   and static proofs pass.
3. Remove false text/leaf penalties from element-only injection and run the
   full normal/large/stress, huge-code demo, package, and browser gates. Revert
   or retain any capability whose exact target cannot be proved.

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
| 1. View-local paint | Add one private output-only NodeKey store; migrate navigation and block placeholder; inline the old placeholder hook; remove `_target`; make named-root `PlateContent` mount exactly one Plite view | Plate React mounted view | `rendered-attributes.tsx`, `PlateContent.tsx`, `PlateRoot.tsx`, navigation, placeholder | Store merge/isolation/cleanup/ref-handler/SSR/hydration tests; mounted navigation move/clear; focus/read-only/composition and two-view same-root placeholder tests | `rendered-attributes.mounted.receipt.json`: same frozen fixtures, exact model/selection/text/target guards, at most two target renders | keep | pure injection |
| 2. Pure injection | Delete fake rejected-node calls; evaluate `editOnly` before transforms; allow pure injection through the default element renderer | Plate compiled plugin/render pipeline | `pluginInjectNodeProps.ts`, `pipeInjectNodeProps.tsx`, element/static render owners and tests | Reject/query/path/edit-only zero-call assertions; default/intrinsic/custom/static host parity; Plate typecheck | Source-backed N/A for isolated callback order; packet is also covered by the phase-3 full mounted and code-block receipts | keep | compiled reachability |
| 3. Narrow reachability and closure | Compile separate element/text injection lists so element-only config cannot disable retained text flow; run all scale, package, browser, docs, and source-owner gates | Plate compiler plus render consumers | `resolvePlugins.ts`, render element/leaf/text consumers, docs, changeset, authoring audit | Frozen 100/1k/10k receipt; 10k CodeMirror product receipt; 193 focused tests; development and strict Plite closure; registry/barrel/lint/Browser proof | Mounted target move improves 11.7x/25.0x/30.1x; 10k code block stays bounded and within all product budgets | keep | closeout |

Cleanup counts:
- delete: 4 architecture liabilities: hook-order dummy calls, placeholder
  `_target`/selector, duplicate named-root Plite view, and the standalone
  placeholder hook module
- merge: 2 dynamic paint jobs into one private keyed owner
- inline: 1 one-use placeholder hook into its plugin
- simplify: 3 paths: edit-only ordering, default-element injection, and
  element/text capability selection
- split: 1 justified private runtime owner with one focused contract
- keep: 3 laws: pure document injection, range-only Plite Decoration, and the
  separate normal/external-text/document-virtualization lanes
- defer: 1 generic public rendered-attribute manager until a third independent
  job proves it
- reject: 5 alternatives: Decoration widening, hook-transform tuning,
  per-plugin node wrappers, imperative DOM mutation, and caller-owned hooks
- plan: 0 remaining implementation packets in this bounded surface

Changed list:
- code/runtime/API: private keyed rendered attributes; single named-root view;
  navigation and block-placeholder publication; pure injection; target-specific
  compiled injection lists; `_target`/selector cut
- tests/oracles: private store and hydration; mounted navigation; same-root
  multi-view focus/read-only/composition placeholder; pure injection and
  compiled classification; default/custom/static hosts and retained text flow
- docs/plans: current plugin, API, block-placeholder, and navigation docs;
  changeset; this plan; frozen/current benchmark scripts and receipts
- skills/workflow: Plate plugin-authoring source rule teaches pure transforms
  and stable mounted hooks; `pnpm install` regenerated an identical skill mirror
- reverted/quarantined: no speculative production code remains; the older
  commit-boundary AttributeSource prototype stays only in the named historical
  artifact folder

Needs review:
- External packages that called React hooks from `inject.nodeProps.transformProps`
  must move those hooks to a stable plugin/component lifetime. Preserving that
  misuse would restore the global render penalty, so compatibility is rejected.
- The rendered-attribute owner stays private and accepts only `className`,
  `placeholder`, `style`, `aria-*`, and `data-*`; handlers and refs are rejected.
  Do not publish it until a third independent current job passes `best-api`.
- Unrelated checkout changes were neither audited nor claimed by this packet.

Open risks:
- No known in-repo correctness or performance risk remains in the bounded
  surface. External hook-transform adopters face the deliberate migration
  above, and browser millisecond values remain machine-specific; structural
  guards, budgets, and source hashes govern the receipts.

Verification evidence:
- CWD for every command: `/Users/zbeyens/git/plate-2`.
- Frozen baseline:
  `docs/plans/artifacts/2026-09-03-plate-and-plite-rendering-safety-architecture/attribute-source.mounted-current.receipt.json`,
  captured `2026-09-04T11:02:30.559Z` before implementation.
- Current mounted production receipt:
  `docs/plans/artifacts/2026-09-04-cleanup-hook-bearing-render-injection/rendered-attributes.mounted.receipt.json`.

| Nodes | Frozen mount / renders | Current mount / renders | Frozen move p95 / renders | Current move p95 / renders | Move speedup |
|-------|------------------------|-------------------------|----------------------------|-----------------------------|--------------|
| 100 | 244.47 ms / 200 | 69.39 ms / 100 | 29.09 ms / 100 | 2.49 ms / 2 | 11.7x |
| 1,000 | 633.27 ms / 2,000 | 200.91 ms / 1,000 | 183.30 ms / 1,000 | 7.33 ms / 2 | 25.0x |
| 10,000 | 4,167.90 ms / 20,000 | 1,436.68 ms / 10,000 | 1,784.80 ms / 10,000 | 59.35 ms / 2 | 30.1x |

- Every matched row preserves fixture hashes, model, selection, text, target
  attributes, element-host count, and retained-flow host count.
- The standalone 10,000-line CodeMirror product receipt passes all budgets:
  navigation-to-queryable p95 `998.72 ms <= 5000`, input-to-paint p95
  `30.9 ms <= 200`, highlight settle p95 `403.2 ms <= 600`; the model is exact,
  DOM elements stay below 500, rendered lines below 100, native text hosts are
  zero, and highlighting is present.
- Focused Bun proof: 193 tests across 11 files, 0 failures; includes six store
  tests and 13 mounted placeholder tests.
- `pnpm --filter platejs typecheck`: all 75 tasks passed.
- `pnpm check:plite:dev`: source-first typechecks, 134 package-test partitions,
  232 contracts, 25 benchmark contracts, 49 benchmark targets, public types,
  build, and Chromium smoke passed.
- `pnpm check:plite`: strict closure passed in 344.1 seconds; Chromium reported
  735 passed, 8 expected skips, and all 81 bounded batches passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www
  test:www-browser:chromium tests/browser/code-block-codemirror.spec.ts`: both
  10k model/bounded-DOM and editing/IME/remote/read-only rows passed.
- Targeted Ultracite passed every task TypeScript/TSX file. `pnpm brl`,
  `pnpm --filter www build:registry`, source/mirror `cmp`, stale-teaching `rg`,
  and scoped `git diff --check` passed.
- Browser showed `/blocks/code-block-demo` with the 10,000-line model and
  bounded rendered window; `/docs/block-placeholder` showed the current
  view-local ownership contract with no removed API.
- Final architecture score: `9.6/10`, raw `9.6`, 100% evidence confidence, no
  cap. Command:
  `node tooling/scripts/plate-review-score.mjs --axis owner=4 --axis lifetime=4
  --axis boundary=4 --axis api=3 --axis scale=4 --axis correctness=4 --axis
  proof=4 --confidence inventory=4 --confidence trace=4 --confidence
  consumers=4 --confidence runtime=4`.

Final handoff contract:
- Source roots inspected: `packages/platejs` compiler, runtime, React, static,
  tests, public barrels; relevant Plite mounted-view/Decoration owners; registry
  example; current docs/rules; prior D9-D12 receipts.
- Candidate count and top recommendation: seven; keep the private view-local
  NodeKey owner and pure compiled injection.
- Cleanup counts: recorded above.
- Agent-navigation score changes: dynamic paint tracing drops from three
  implicit lifecycle owners across five files to one named private store plus
  each feature's stable hook; public/private ownership is explicit and proof is
  concentrated in the store and mounted feature tests.
- Packets applied with keep/revert/quarantine result: three applied, three kept,
  zero reverted, zero new quarantine.
- Proof commands/source audits: recorded above.
- Hot-owner pre/post scale receipts or source-backed zero-runtime N/A: matched
  production 100/1k/10k and 10k code-block receipts recorded above.
- Rejected/deferred candidates: five rejected, one public API deferred.
- Needs-review list: external hook-transform adopters and the deliberate private
  boundary only.
- Residual risks: no known in-repo behavior or performance regression. The
  unavoidable adoption risk is external code relying on an invalid hook host;
  the changeset and current docs make the replacement law explicit. Browser
  product timing remains machine-specific, so budgets, structural guards, and
  source hashes—not cross-machine millisecond comparisons—govern the receipt.
- Next owner and exact first command/file: none. If a third independent dynamic
  attribute job appears, start `best-api` at
  `packages/platejs/src/react/internal/rendered-attributes.tsx`; do not widen
  Plite Decoration or expose the private module by default.

Timeline:
- 2026-09-04T10:46:05.137Z Architecture-cleanup goal plan created.
- 2026-09-04T11:02:30.559Z Frozen mounted 100/1k/10k baseline captured.
- 2026-09-04T11:54:24.131Z Current mounted production receipt captured;
  all scale and correctness gates passed.
- 2026-09-04T11:56:07.455Z Standalone 10k code-block product receipt
  captured; all budgets and structural guards passed.
- 2026-09-04 Strict `check:plite` closed with 735 Chromium passes across all
  81 bounded batches; closeout completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response; no remaining packet in scope |
| What is the goal? | Remove hook-bearing render injection without restoring global render work or regressing editor behavior |
| What have I learned? | The dominant penalty was two architectural mistakes: hooks inside per-node injection and duplicate named-root views; a private view-local NodeKey channel removes both without polluting raw Plite |
