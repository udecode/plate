# Recheck Challenged API Shapes

Objective:
Recheck every challenged Plite/Plate API recommendation against live owners;
revise the audit wherever the proposed public shape is not absolute best.

Flow mode:
collaborative planning

Goal plan:
docs/plans/2026-07-22-recheck-challenged-api-shapes.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:

- none

Mode:

- `standard`: bounded re-review of named public shapes, with adversarial source
  review but no implementation or external research.

Completion threshold:

- Shapes 3 and 9-23 each have a source-backed `keep`, `revise`, or `reject`
  verdict: 16/16 resolved.
- The artifact reflects the accepted corrections: no `config.targets`, shortcut
  `target` stays optional, fallback-editor behavior is honest, hooks address
  value-import pressure, and shapes 14-23 are re-earned rather than assumed.
- Target API examples and ranking text agree; focused artifact checks and
  `check-complete` pass.

Verification surface:

- Live Plate/Plite plugin, React hook/store, editor creation, codec, observer,
  runtime, layout, Yjs, and browser-proof types plus production callsites.
- Updated API-shape artifact with 16 explicit verdict rows and reconciled
  before/after examples.
- Focused consistency parser, local-link audit, `git diff --check`, and this
  plan's `check-complete.mjs` gate.

Constraints:

- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Honor direct user decisions: reject `config: { targets: [...] }`; shortcut
  `target` must be optional; preserve a fallback editor if Rules of Hooks
  require non-throwing access.
- Be harsh: keep a proposed break only when it beats the current API on actual
  semantics, type inference, lifecycle correctness, or ownership.

Boundaries:

- In scope: shape 3 and shapes 9-23 in the existing API-shape ledger.
- Source owners: Plate plugin compiler/runtime and React stores/hooks; Plite
  React, DOM codecs, layout, Yjs, and browser proof APIs.
- Non-goals: package implementation, compatibility layers, unrelated ranks
  0-2/4-8, browser execution, performance claims, or migration code.
- Direct adoption owners: relevant Plate packages, apps/www registry, Plite
  satellite packages, and proof packages only as planning evidence.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Block only if live source exposes two mutually exclusive requirements whose
  choice is product intent rather than architecture. Naming uncertainty alone
  is not a blocker.

Plite Plan state:

- status: ready
- phase: handoff
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | All challenged shapes and three explicit user corrections are checkable above. |
| Active goal and plan verified | yes | Goal names this plan and the 16/16 threshold. |
| Current owners read | yes | Read exact plugin configuration/target/shortcut, Plate controller/hooks, Plite React/source, creation/HTML/codec/observer/runtime, layout, and browser/mobile owners. |
| Mode and execution boundary resolved | yes | Collaborative planning only; no package implementation. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Recheck shape 3 (`configure` versus type-widening `extend`).
- [x] Recheck shapes 9-13: targeting, optional shortcut routing, fallback
      editor, descriptor/type-only hooks, command hook.
- [x] Recheck shapes 14-17: React freshness, entrypoint reexports, editor
      creation fallback, and schema-linked codec ownership/naming.
- [x] Recheck shapes 18-23: observers, runtime visibility, layout compilation
      and configuration, minor cleanup, browser/mobile proof.
- [x] Reconcile the ranking, concept ledger, examples, rejection gallery, and
      proof text; run consistency/link/diff/checker gates.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | 16/16 challenged shapes have explicit verdicts; keep/defer rows are not execution packets. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Read current plugin, React, creation, codec, observer, runtime, layout, Yjs, browser owners, and production callsites. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Failure-mode table covers every shape; browser/benchmark/release proof is N/A for planning-only edits. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Focused 16/16 parser, 25/25 heading audit, link audit, Prettier, and `git diff --check` pass. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Corrected artifact contains stable IDs, before/after contracts, rejections, and execution verdicts. |
| Autoreview | N/A | Run for implementation changes or record planning-only N/A | Planning-only; five independent source lanes and an adversarial pass were reconciled. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-recheck-challenged-api-shapes.md` | Final checker passes after closure fields were recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners and production callsites audited | Decide |
| Decide | completed | 16/16 verdicts recorded below and in artifact | Prove and hand off |
| Prove and hand off | completed | Consistency, links, formatting, diff, and plan checker pass | User review |

Decision brief:

- outcome: a smaller, defensible set of changes with honest alternatives and
  no invented public spelling.
- chosen shape: keep proven semantics, repair dishonest or ambiguous contracts,
  and delete speculative work rather than laundering it as architecture.
- strongest rejected alternative: defending the previous artifact because it
  is already exhaustive; exhaustive wrongness is still wrong.
- consequence: ranking and execution scope may shrink or pivot materially.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shapes 3, 9-23 | Existing 16 recommendations | 16 source-backed keep/revise/reject verdicts | Named live owners | User challenged semantic and DX assumptions | Update plan artifact only | Focused source and consistency audits | Broad cleanups may lack enough value | pass |

Recheck verdicts:

| Shape | Verdict                     | Absolute-best target                                                                                                            |
| ----: | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
|     3 | revise                      | Keep contextual non-widening `.configure`; compose ordered object/callback layers.                                              |
|     9 | keep                        | Keep top-level weak optional `targetPluginNames`; compile one private resolved binding. Reject `config.targets`.                 |
|    10 | revise                      | Infer the sole shortcut route; require optional target `update` or `api` only for collisions.                                   |
|    11 | revise                      | Keep a stable inert fallback privately for hook order; expose strict and nullable public hooks.                                 |
|    12 | revise                      | Prefer descriptor inference while accepting generic/type-only forms; strict/optional hooks; no fake live arbitrary-node path.   |
|    13 | revise                      | `usePliteCommand(command)` returns a typed input dispatcher; imperative callback is honestly named.                             |
|    14 | revise                      | Hook-owned selector freshness without caller `useCallback`; direct stores; explicit source revision only for external mutation. |
|    15 | revise                      | Pure app DSL from `platejs`, React APIs from `platejs/react`; owner imports inside packages.                                    |
|    16 | revise                      | Synchronous `initialValue`, contextual sync conversion, external async ownership, controller loading fallback.                  |
|    17 | reject proposed convergence | Keep MIME slice codecs, feature document conversion, and React rendering distinct; no `editor.api.codecs`.                      |
|    18 | revise                      | Canonical non-cancellable `onCommit(EditorCommitContext)` plus independent narrow observers and provider-owned listeners.       |
|    19 | revise                      | Internalize raw registries gradually behind descriptor portal; retain genuine dynamic capabilities; no speculative inspector.   |
|    20 | defer                       | Keep surface-owned layout provider; one consumer does not earn a profile compiler and plugin-global layout is wrong.            |
|    21 | revise                      | Atomic committed `reconfigure`, direct virtualized strategy data, keep engine factory, delete orphan type.                      |
|    22 | revise                      | Freeze pure APIs, infer policy with `property.json`, intrinsic `render.as`, sweep static wrappers; keep `createYjsExtension`.   |
|    23 | revise                      | Serializable canonical proof plus explicit imperative lane; typed curated harness; delete unused mobile transport layer.        |

Failure-mode pressure pass:

| Shape | Three failure modes that decide the verdict                                                                                                                          |
| ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     3 | Callback-to-extend widens inferred shape; later configuration still erases package behavior; removal semantics stay ambiguous without ordered merge rules.           |
|     9 | Descriptor arrays force cross-package imports; absent optional peers become fatal; eager descriptor types can disagree with configured installed types.              |
|    10 | Current collisions silently choose update; mandatory targets add noise to every unambiguous shortcut; missing methods disappear without a diagnostic.                |
|    11 | Deleting fallback breaks stable hook order; exposing it lets mutations vanish; strict access in an empty controller crashes legitimate shell UI.                     |
|    12 | Descriptor-only hooks force runtime imports; generic-only hooks cannot validate scope; arbitrary node objects cannot promise a live path.                            |
|    13 | Prebinding input is stale for event data; arbitrary callbacks bypass command policy; dispatch must retain mounted-root and focus behavior.                           |
|    14 | Deleting deps without latest-callback repair creates stale closures; mandatory `useCallback` is poor AX; callback identity misses external mutable-source revisions. |
|    15 | React reexports create a third canonical pure import; headless declarations look React-owned; package source drifts toward umbrella dependencies.                    |
|    16 | Promise initialization can overwrite edits; it lacks cancellation/generation guards; pre-editor conversion may require a compiled plugin model.                      |
|    17 | MIME handlers are ordered and delegating; document conversion returns different shapes; React HTML output is presentation, not semantic serialization.               |
|    18 | Plugin middleware can suppress app observers; `PlateContent` lifetime loses node/text listeners; a parallel DTO would drift from `EditorCommitContext`.              |
|    19 | Immediate removal breaks genuine dynamic lookups; public caches permit invariant-breaking mutation; a speculative inspector freezes an owner with no consumer.       |
|    20 | Editor-global layout cannot support simultaneous surfaces; dynamic measurement/settings are view policy; one consumer does not justify a compiler.                   |
|    21 | Render-time refs can expose abandoned options; reconfiguration during notification can mix snapshots; a singleton can leak future state across editors.              |
|    22 | Removing contextual extension factories breaks configured extensions; `yjs()` is ambiguous and high-churn; freezing by naming heuristic can capture runtime objects. |
|    23 | Closures inside canonical scenarios kill replay; deleting all imperative proof loses native-only behavior; mobile descriptors decorate an unused runner layer.       |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Plate plugin/React | Shapes 3 and 9-15 | Requirements captured | Seven verdicts resolved | Source/type/callsite audit |
| 2 | Creation/codec/observers | Shapes 16-19 | Slice 1 findings recorded | Four verdicts resolved | Source/type/callsite audit |
| 3 | Layout/proof/cleanup | Shapes 20-23 | Slice 2 findings recorded | Four verdicts resolved | Source/type/callsite audit |
| 4 | Audit artifact | Reconcile all affected prose/examples/ranks | 16 verdicts resolved | No contradiction remains | Parser, links, diff, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| 16/16 challenged shapes resolved | Verdict table and live source pointers | N/A: planning only | pass |
| Explicit user corrections preserved | Artifact search for rejected/optional/fallback shapes | N/A: planning only | pass |
| No artifact contradictions | Targeted consistency parser | N/A: planning only | pass |

Conditional evidence:

- High-risk scenarios: public hook/editor/codec/layout recommendations require
  three failure cases before any break remains accepted.
- External research: N/A; current repo semantics can settle the named review.
- Issue/PR provenance: N/A; no issue-backed claim.
- Browser/benchmark/release/behavior-law: no execution claim; browser/runtime
  owners are read as architecture evidence only.

Findings:

- Initial correction: `config.targets` is rejected by user and also risks
  turning immutable plugin config into a generic dependency container.
- Initial correction: shortcut `target` should disambiguate collisions but
  remain optional when only one callable namespace contains the named method.
- Shape 3: `ContextualBasePluginConfig` is intentionally non-widening and only
  permits handlers/options/render/shortcuts. `.extend` returns an
  `ExtendedBasePlugin` and is the widening owner. Keep callback configuration;
  replace the single `__runtimeConfiguration` slot with ordered composition.
- Shape 9: six production plugins use the same `targetPluginNames` for schema
  property targets and runtime host behavior. No divergent caller currently
  justifies a second targeting concept. Keys are deliberately weak/optional and
  avoid cross-package imports; descriptors remain correct for required peers.
- Shape 11: the fallback editor exists only when a `PlateController` is present
  but has no active editor; no-provider use already throws. Removing it would
  break controller chrome and stable hook execution.
- Shape 17: Plite host codecs are configuration-ordered clipboard
  parse/serialize extensions over `ContentSlice`; Plate `serializeHtml` is React
  static rendering. An `editor.api.codecs` hierarchy would merge different
  contracts and has no live owner.
- Shape 20: only one pagination surface owns the large layout policy. Binding
  layout to editor/schema extensions would prevent simultaneous screen/print
  policies and is unjustified abstraction.
- Shape 23: the mobile transport builders have no executable consumer; adding
  a product descriptor would polish dead code. Preserve proof classification
  and delete the construction layer.

Decisions and tradeoffs:

- Prefer additive type inference over mandatory ceremony. A discriminant should
  be required only when inference is genuinely ambiguous.
- Keep `.configure(object | callback)` and make callbacks compose; do not send
  non-widening runtime patches through widening `.extend`.
- Keep controller fallback semantics, but do not broaden fallback use beyond a
  present controller with no active editor.
- Keep type-only and descriptor-inferred hook forms because they solve distinct
  problems: generic composition versus runtime scope/inference.
- Reject a one-import `platejs/react` facade for pure builders; ownership beats
  saving one import line.

Review fixes:

- Reversed shape 3: contextual `.configure` is distinct from widening
  `.extend`; composition, not deletion, is the repair.
- Rejected `config.targets`, mandatory shortcut targets, fallback deletion,
  `editor.api.codecs`, plugin-global layout, the engine singleton, Yjs rename,
  speculative inspector, and a product mobile descriptor.
- Corrected invalid commit fields, command input shape, import ownership, and
  browser proof guarantees.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:

- `pnpm exec prettier --write <plan> <artifact>`: pass.
- Focused consistency audit: 16/16 challenged verdict rows, 25/25 stable shape
  headings, explicit fallback/optional-target/type-only/codec decisions: pass.
- Local Markdown link audit for plan and artifact: pass.
- `git diff --check -- <plan> <artifact>`: pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs <plan>`: pass after
  closure fields were recorded.

Final handoff prepared:

- Ownership and target API/runtime: corrected artifact is authoritative; each
  shape names its owner and visible before/after.
- Public breaks and Plate/collaboration adoption: shapes 3, 10-19, and 21-23
  are revised packets; shape 9 is keep and shape 20 is defer.
- Applicable browser/benchmark/docs/provenance decisions: planning-only, so no
  runtime/browser claim; implementation retains package/browser obligations.
- Proof and execution risks: failure-mode table and open risks below.
- Execution order and user attention: review especially shapes 11, 16, 18, and
  21 because they change lifecycle behavior.

Timeline:

- 2026-07-22T16:53:55.036Z Plite Plan created.
- 2026-07-22T19:20:57+02:00 Rechecked 16/16 challenged shapes, rewrote the
  API ledger, and completed focused planning proof.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Handoff |
| Where am I going? | User review, then optional implementation planning |
| What is the goal? | Resolve 16 challenged recommendations and repair the audit before implementation. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- `targetPluginNames` needs one internal compiled binding and typo diagnostics
  without making absent optional peers fatal.
- Async-loading adoption must prove that product/controller loading UI replaces
  the current editable fallback-document behavior.
- Layout `reconfigure` needs atomic notification, deferred-refresh, and React
  concurrent-render laws before implementation is accepted.
