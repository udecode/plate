# Execute agent-native API shapes

Objective:
Execute the corrected agent-native API shapes; finish when shapes 3, 9-19,
and 21-23 are adopted, stale APIs are deleted, package/browser proof and
review pass, and this plan is checker-green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-execute-agent-native-api-shapes.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:

- docs
- package-api
- browser

Mode:

- `deep`

Completion threshold:

- Execute 14 packets: shape 3, shapes 10-19, and shapes 21-23. Keep shape
  9's public optional target list while consolidating one private binding.
  Shape 20 remains deliberately deferred and untouched.
- Migrate every production, docs, test, example, and fixture caller in scope;
  exact stale-symbol searches return zero except explicit historical plans.
- Delete the replaced implementation paths rather than retaining aliases,
  shims, duplicate signatures, or parallel execution truths.
- Pass focused owner tests and typechecks, `pnpm check:plite:dev`, strict
  `pnpm check:plite`, applicable browser proof, and the closure browser matrix.
- Generate required barrels and one main-relative changeset per published
  package with user-visible delta.
- Complete source-backed docs, Browser verification, autoreview with zero
  accepted P0-P3 findings, and this plan's `check-complete` gate.

Verification surface:

- Exact symbol/import audits across `packages/**`, `apps/www/**`, `apps/plite/**`,
  `content/**`, and current-state docs.
- Source-first typechecks and focused tests for every modified package.
- `pnpm check:plite:dev`, `pnpm check:plite`, and
  `pnpm check:plite:browser-matrix` at closure.
- `pnpm --filter www build:source`, `pnpm --filter www check:docs`, `pnpm brl`
  when exports change, and Browser proof on a representative Plite/Plate demo.
- The sibling Wordgard-to-Plite closure task `019f4d13-4361-7bf0-b28b-33494d78a4bd`
  owns the final browser matrix, Browser/Chrome evidence, benchmark, strict
  gates, and six legacy-plan checkers after this task freezes source writes.

Constraints:

- Execution is explicitly authorized by the user's `go all`.
- No public compatibility aliases or runtime shims.
- Preserve type inference for every callback surface; never add local callback
  annotations to hide an owning generic defect.
- Package definitions use `.extend*()` for reusable behavior and
  type/API/options widening. App and registry consumers may apply one terminal,
  non-widening object or contextual `.configure()` call. `options` is Plate's
  only plugin value bag; there is no `plugin.config`, `editor.configure`,
  host-policy resource, or second configuration lifecycle.
- Keep public `targetPluginNames`; do not introduce `config.targets`.
- Shortcut targets use optional public terms `update` and `api`; handlers do
  not accept a target.
- Keep the private inert React fallback only for hook topology. Public
  `useEditor()` is strict; `useActiveEditor()` is nullable.
- Keep descriptor-first and generic/type-only element hooks and props.
- Selector invalidation uses `revision`, not arbitrary dependency arrays.
- Pure app DSL exports come from `platejs`; React surfaces come from
  `platejs/react`; do not re-export pure builders through the React entrypoint.
- Initialization is synchronous. Async loading and staleness stay with the
  application; Yjs retains `skipInitialization`.
- Keep host codecs, feature conversion, and React static rendering distinct;
  do not create `editor.api.codecs`. Markdown's sole editor-bound conversion
  surface is `editor.api.markdown.{deserialize,deserializeInline,serialize}`;
  Markdown options stay on the scoped plugin portal.
- Commit observation uses one non-cancellable `EditorCommitContext` contract.
- Internalize compiled Plate runtime registries and raw option stores as one
  hard cut; do not invent `editor.inspect`.
- Layout uses `createPliteLayout` plus atomic `runtime.reconfigure`.
- Freeze pure namespace objects. `property.json()` accepts JSON values;
  arbitrary values require `property.json({ policy })` and infer their type
  from that policy. Retain contextual extension callbacks and
  `createYjsExtension`.
- Browser proof distinguishes replayable canonical steps from explicitly
  imperative non-replayable steps.

Boundaries:

- In scope: `packages/core`, `packages/plite`, `packages/plite-react`,
  `packages/plite-dom`, `packages/plite-layout`, `packages/browser`, relevant
  feature packages, `packages/yjs` only for adoption without a rename,
  `apps/www`, `apps/plite`, current-state docs, exports, tests, and changesets.
- Source owners: Plate plugin/configuration runtime, Plite immutable editor and
  schema runtime, Plite React provider/hooks/view runtime, Plite DOM codecs,
  Plite layout runtime, and the browser proof harness.
- Non-goals: shape 20's global layout descriptor compiler; shapes 0-2 and 4-8;
  a public mega-codec API; an imperative renderer; worktrees, branches, commits,
  pushes, or PRs.
- Direct Plate/collaboration adoption owners: Plate packages and apps migrate
  in the same slices; Yjs changes only where the accepted APIs require it.
- Final closure proof owner: task `019f4d13-4361-7bf0-b28b-33494d78a4bd`;
  this task sends one source-frozen handoff and does not treat its pre-freeze
  matrix state as evidence.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Block only after the same external/tooling failure occurs three times and no
  focused source, test, runner partition, or alternative proof owner remains.
  Browser infrastructure latency alone is not a blocker.

Plite Plan state:

- status: active
- phase: prove-and-handoff
- next: closure-owned strict Chromium, browser matrix, benchmark, Browser/Chrome,
  legacy checkers, and final main checker
- handoff: prepared from an immutable source snapshot

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Corrected decisions 3, 9-19, and 21-23 copied into constraints and ledger |
| Active goal and plan verified | yes | This plan is the active one-shot execution contract; goal creation follows this checkpoint |
| Current owners read | yes | Corrected audit and live owner map from Plate core, Plite core/React/DOM/layout, browser, and feature callers |
| Mode and execution boundary resolved | yes | Deep execution; user authorized `go all`; shape 20 and unrelated rows excluded |
| Docs pack selected | yes | Public API/reference and current-state example adoption |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read in full |
| Docs lane selected | yes | API reference plus guide/current-state examples |
| Target docs and nearest sibling docs read | yes | Source audit selected core API/editor/store docs; Plite React hooks/editable and layout docs; HTML/static/RSC conversion docs; controlled/editor initialization guides; browser guide and Plite architecture page |
| Docs style doctrine read | yes | `docs-creator` current-state and ownership rules loaded |
| Documented source owner identified | yes | Owning package source remains authoritative for every edited claim |
| Package/API pack selected | yes | Published Plate/Plite API hard cuts and entrypoint changes |
| Public surface or package boundary identified | yes | Core, Plite, Plite React/DOM/layout, browser, feature adoption, public entrypoints |
| Release artifact path selected | yes | `.changeset`; one file per package with a main-relative user-visible delta |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read in full |
| Barrel/export impact decision recorded | yes | Public entrypoint changes require `pnpm brl` after final surface settles |
| Browser pack selected | yes | Package/app-facing behavior changes require browser proof |
| Browser route / app surface identified | yes | Prefer an affected `/blocks/[id]-demo`; otherwise use the canonical Plite example route in `apps/plite` |
| Browser tool decision recorded | yes | Browser plugin for normal app QA; no native Chrome-only interaction is planned |
| Console/network caveat policy recorded | yes | Check both on the exercised route; report infrastructure-only noise separately |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source and the
      frozen packet receipts below; the EditorKit render-resource repair is
      frozen and integrated.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every frozen packet's named API, import, option, route,
      component, transform, demo, and preview is source-backed; final combined
      current-doc audit passes.
- [x] Docs pack: frozen packet docs use current-state reference voice, not changelog voice.
- [x] Docs pack: Markdown links, anchors, and the live preview target the real
      `/docs/markdown` leaf route; other frozen packets did not add a route.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied through the existing
      Core, Plate, Plite, Plite React, layout, Markdown, and browser changesets;
      final status validation passes.
- [x] Package/API pack: `.changeset` work loaded `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions are N/A for this combined goal
      because published package changesets apply; registry-only adoption uses
      the registry changelog owner.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All source packets and reviewer repairs are frozen; closure-only proof remains |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source/API audit is zero; generated `apps/www/public/r` JSON remains CI-owned output and is explicitly excluded from local source adoption |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Focused adoption is recorded; final browser/benchmark/closure receipt pending |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Final development snapshot passes Core, Plite dev, www, public types, docs, changesets, adoption, barrels, and diff gates; closure gates pending |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Immutable source handoff is prepared for the closure task |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Three combined passes repaired two Table P2s; the only remaining finding targets forbidden CI-generated registry JSON and is rejected by repository policy |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-execute-agent-native-api-shapes.md` | Must remain red until every open row closes |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Plite docs audit, 366-doc Core audit, and current www source/docs checks pass |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Markdown and Table routes render from current source; final closure route artifact pending |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Final current-snapshot `build:source` passes in 2.06s |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Current Markdown/Table source docs and docs parity pass |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Shape 19 hard cut, typed opaque render resources, Table scoped API, and final public build 13/13 pass |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package changesets plus registry changelog apply and validate |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Final status passes: 56 major, 0 minor, 2 unrelated patch packages |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Generator contracts pass 16/16; source registry is current; public JSON generation remains CI-owned |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: published package changesets and a registry changelog apply |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Final Core 45/45 plus 632 files, Plite dev 53 typechecks/45 suites, Browser 87/87, contracts 123/123 plus 66/66, Table 233/233, and www typecheck pass |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | Final `pnpm brl` passes 56/56 and Biome checks 4,704 files without changes |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Markdown route passed; final closure Browser/Chrome proof pending |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Markdown route clean; final closure state pending |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Final closure artifact pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Corrected audit accepted; requirements, exclusions, owner map, and proof threshold materialized | Execute |
| Decide | complete | Fourteen execute packets, shape 9 keep/private-consolidate, and shape 20 defer resolved in decision ledger | Execute |
| Execute | complete | Shapes 3, 9-19, and 21-23 plus Core render-resource, Yjs, DnD, immutable-consumer, Table, and Shape 23 review repairs are source-frozen | Closure proof |
| Prove and hand off | in_progress | Final development snapshot passes Core/Plite-dev/www/public/release/docs gates and combined review has zero accepted actionable findings | Closure task runs strict browser/matrix/benchmark/checkers |

Decision brief:

- outcome: one coherent Plate/Plite API with inferred terminal consumer
  configuration, strict React ownership, synchronous construction, honest
  conversion/runtime boundaries, and replayable browser proof.
- chosen shape: execute 14 corrected packets as hard cuts with same-slice
  adoption and deletion, privately consolidate shape 9, and defer shape 20.
- strongest rejected alternative: keep dual signatures and helper aliases so
  callers can migrate gradually.
- consequence: a larger coordinated diff and required changesets, but one
  learnable current API and no permanent branch-only compatibility debt.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 plugin configuration | Plugin values can split ownership and repeated configuration blurs package/user intent | Package definitions use `.extend*()`; one terminal consumer `.configure()` accepts an object or non-widening contextual callback for existing options, handlers, renderers, and shortcuts; `options` is the only value bag | Plate core | Preserve contextual reads with one obvious consumer-owned installation step | Plugin factories, Core installation, packages, registry kits, docs, CSV, Markdown, and Yjs; delete `plugin.config`, `editor.configure`, host policy, and config-specific mutation/equality | Terminal type/runtime contracts, precedence/call-count tests, package ownership audit, Core, packed-artifact, caller and docs audits | Ordering, duplicate side effects, or descriptor/live-option confusion | corrected and execute |
| 9 target binding | Public `targetPluginNames` is resolved independently by consumers | Keep the public optional key list; compile one private optional binding | Plate core/features | One target truth without rejected public descriptor config | Injection/render/parser consumers | Missing-peer and ordering tests | Optional peer accidentally required | keep + private consolidate |
| 10 shortcuts | Resolver guesses mutation then API route | Infer unique route; disambiguate collisions with optional `update` or `api`; handlers forbid target | Plate core | Short happy path and explicit ambiguity | All shortcut definitions/docs | Type/runtime collision tests | Silent wrong dispatch | execute |
| 11 editor hooks | Public hooks can surface inert fallback | Strict `useEditor`; nullable `useActiveEditor`; private stable fallback only | Plate React | Hook topology without lying to callers | Hook/provider callers | Provider/no-provider hook tests | Rules-of-Hooks break | execute |
| 12 element typing | Descriptor and generic forms are inconsistent | Support descriptor-first plus generic/type-only strict/optional hooks and props | Plate React | Best inference for plugin and library authors | Components, hooks, docs | Type tests | Inference widening | execute |
| 13 commands | Hook captures command input/closures ambiguously | Descriptor-first `usePliteCommand(command, options?)` returns an invocation-time input dispatcher using public canonical command types | Plite React | Stable hooks and canonical command ownership | Command hooks/callers and public exports | Hook/type tests for `CompatibleEditorCommand`, `EditorCommandDescriptor`, and `EditorCommandInput` | Stale closure | execute |
| 14 selectors/view data | Arbitrary dependency arrays and render-time publication leak abandoned work | Commit-only callback/data publication, selector catch-up, dormant hook-owned stores, direct arrays, and optional `revision` | Plite React | One invalidation contract with concurrent-render safety | Selector and view-data callers/docs | Catch-up, abandoned-render, child-layout, subscription, and invalidation tests | Missed external change | execute |
| 15 entrypoints | Pure and React exports blur ownership | Pure DSL from `platejs`; React APIs from `platejs/react`; curated internal owner imports | Plate entrypoints | Predictable imports | Whole-repo import sweep | Export/typecheck tests | Cycles or hidden API | execute |
| 16 initialization | Constructor accepts async/string/null/default ambiguity and `onReady` | Synchronous value/callback; apps own async loading; Yjs keeps `skipInitialization` | Core/Plite React | Deterministic construction | Editors/providers/examples/tests | Init and stale-load tests | Async adoption gaps | execute |
| 17 conversion/rendering | Conversion and static render names imply one codec registry | Keep host codecs, feature conversion, and React rendering separate; use `renderStaticHtml`; expose Markdown conversion only at root `editor.api.markdown` while options stay scoped | Plite DOM/features/React | Honest environment and ownership boundaries | HTML/Markdown/AI/static callers | Package round-trip/render tests and `/docs/markdown` Browser proof | Server/client import drift | execute |
| 18 commit observation | Several observer shapes expose partial commit truth | Non-cancellable `onCommit(EditorCommitContext)` plus independent narrow observers, version-ordered reentrant commits, and insertion-effect callback publication before child layout | Plite React | Canonical published snapshot context | Provider/listener callers | Commit ordering/context/lifecycle tests | Listener lifetime leak | execute |
| 19 runtime access | `BaseEditor.runtime` republishes compiled component/plugin/input-rule/shortcut registries; `editor.plugins`, string-key portals, fallback identity, and raw option stores expose implementation machinery | Keep descriptor portals, `usePluginOption(s)`, `userId`, and `isNormalizing`; make `PlateModelPublication` the sole compiled truth, expose `getPlateRuntime` only from Core internal, keep option stores and fallback identity in private WeakMap/WeakSet owners, and hard-cut all public raw registries/store APIs without `editor.inspect` | Plate core/features/docs | One atomic compiled truth and no raw store escape hatch | Core React/static/internal readers, final 24-file Shape 19 lane, feature tests, dev benchmark, current docs, and Core major changeset | API/type/hook tests, failure cleanup, canonical dependency identity, reserved-key registries, exact stale search, and opaque render-resource contracts | Construction/publication lifecycle, prototype-key regression, or misclassifying a React host resource as descriptor data | execute; source-frozen |
| 20 layout descriptors | Proposed global compiler | Keep current feature-owned layout composition; revisit only when two independent reusable consumers need profile composition | `@platejs/plite-layout` plus future Plite Plan | No proven consumer or payoff | None | Zero `layout.profile` and schema-layout contribution matches | Scope creep | deliberately defer |
| 21 layout runtime | Getter/ref/provider split configuration | `createPliteLayout(editor, options)` and atomic `runtime.reconfigure`; direct discriminated DOM strategy data | Plite layout/React | Explicit lifetime and atomic updates | Layout consumers/tests | Runtime/browser layout tests | React commit timing | execute |
| 22 descriptors/schema | Mutable namespace bags and unconstrained JSON defaults | Freeze pure APIs; keep `property.json()` JSON-valued and require an inferred policy for arbitrary values; intrinsic-only `render.as`; direct no-context extensions | Plite schema/extensions | Smaller, inferable, serializable surface | Schema/extensions/Yjs adoption | Positive and negative type/schema tests | Over-freezing dynamic state | execute |
| 23 browser harness | Replayable and imperative steps mix; unused raw/mobile builders and no-op assertions remain | Canonical serializable steps plus explicit `scenario.runImperative` non-replayable lane; remove unused builders; make exact count mutually exclusive with ranges; require nonnegative integer counts/indexes and nonempty proof text | Browser package/apps | Proof artifacts state what they can replay and release-gate | Browser suites, runner contracts, docs, and donor scenarios | Type/runtime decoder contracts plus focused browser proof | Capability regression or false-positive proof | execute |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0 baseline | root | Exact live source/import/stale-symbol audit; fill selected docs | Accepted ledger | Owners and callsites bounded | `rg` ledgers and focused existing tests |
| 1 plugin/config | delegated owner | Shapes 3, 9, 10 | Baseline owner map | Target/config/shortcut APIs adopted and old paths deleted | Core type/runtime tests |
| 2 React hooks | delegated owner | Shapes 11-14 | Slice 0 | Strict hooks, typed elements/commands, revision invalidation adopted | Hook/type/render tests |
| 3 construction/runtime | delegated owners | Shapes 15-19 | Slices 1-2 public shapes stable | Entrypoints, sync init, conversion, commit, and runtime access adopted | Package typechecks/tests and stale searches |
| 4 layout/schema/browser | delegated owners | Shapes 21-23 | Slice 0 | Layout runtime, descriptor/schema cleanup, and proof-harness split complete | Layout/schema/harness tests plus focused browser |
| 5 adoption/release | root | Feature/app/docs/examples/exports/barrels/changesets | Slices 1-4 | Zero stale callsites; current-state docs and release artifacts complete | `pnpm brl`, docs checks, exact `rg` |
| 6 closure | root plus reviewers | Full package/browser/review/checker proof | Slice 5 | Every completion gate green or one evidenced real blocker | `check:plite:dev`, `check:plite`, browser matrix, Browser, autoreview, checker |

Frozen packet receipts:
| Shape | State | Implemented result | Frozen evidence | Still required by this combined goal |
| --- | --- | --- | --- | --- |
| 3 | corrected in current source | Package definitions use `.extend*()`; one terminal consumer `.configure()` accepts object or contextual existing-field overrides; callbacks execute once per editor, contextual extensions see configured values, and consumer values remain final | Prior receipts remain historical evidence. Current ownership/cardinality implementation and fresh proof are owned by `2026-07-23-single-consumer-plugin-configure.md` | Current correction plan closure proof |
| 9 | source-frozen | One optional top-level `targetPluginNames` field feeds schema and host targeting; missing optional peers remain nonfatal; no `config.targets` | `2026-07-22-hard-cut-inject-target-plugins.md`: focused Core 95/95, final lifecycle/compiler 38/38, affected packages/www, Browser demos, `check:core`, and zero nonhistorical old-target matches. Its `editor.configure` path was later deleted by the options-only hard cut without changing the descriptor field | Current-snapshot Core/stale rerun |
| 10 | source-frozen | Shortcut names infer the sole `.update` or `.api` route; `target` is accepted only to resolve a collision; custom handlers cannot take it | Core shortcut implementation/type contracts and `.changeset/plugin-portal-scoped-api.md`; included in the frozen options-only/Core package proof | Current-snapshot Core/type-contract rerun |
| 11 | source-frozen | `useEditor()` is strict, `useActiveEditor()` is nullable, and controller shells use private inert identity only to preserve hook topology | Core Plate store/provider hook contracts plus `platejs`/www proof recorded by the options-only lane; `.changeset/auto-main-to-next-sync-platejs.md` teaches the final hooks | Current-snapshot Core/React integration rerun |
| 12 | source-frozen | Descriptor-first and generic/type-only element/path hooks coexist in strict and optional forms; paths are provider-owned rather than fabricated from arbitrary nodes | Core element/path hook source and type contracts; Plate/www typechecks in the frozen Core/options receipts | Current-snapshot Core/React integration rerun |
| 13 | source-frozen | Descriptor-first `usePliteCommand` returns an invocation-time typed dispatcher using the public canonical command descriptor/input types | Exact 17-file Shape 13-14 receipt below; full `plite-react` 71 files/1,019 tests and source-first typecheck passed | Combined stale/export scan and strict closure |
| 14 | source-frozen | Selectors publish callbacks/data after commit, catch up after skipped commits, isolate abandoned renders, and activate dormant annotation/widget stores only in insertion effect; view data uses direct arrays plus optional `revision` | Same 17-file receipt; annotation/widget focus 28/28; stale `deps`/projector teaching and its source contract were repaired | Combined docs/stale scan and strict closure |
| 15 | source-frozen | Pure DSL is exported from `platejs`; React surfaces from `platejs/react`; static HTML from `platejs/static`; package internals use owning entrypoints | `platejs`/www type proof in the frozen options lane and final import contract in `.changeset/auto-main-to-next-sync-platejs.md` / `.changeset/plugin-portal-scoped-api.md` | Final barrel and package-direction proof |
| 16 | source-frozen | Editors initialize synchronously from a value or editor-context callback; applications own async loading; deferred construction uses `skipInitialization` and one value replacement; Yjs keeps the explicit skip | Initial-value owners/tests and final public contract in both Plate changesets; Yjs 215/215 in the frozen options lane | Whole-scope stale scan for async/default/`onReady` shapes and current package rerun |
| 17 | source-frozen | Host codecs, Markdown document conversion, and React static rendering remain distinct; the sole editor-bound Markdown service is `editor.api.markdown.{deserialize,deserializeInline,serialize}` and the scoped portal owns options only | `2026-07-22-restore-markdown-root-api.md`: 79 root calls in 21 live files, zero scoped/direct-helper live calls, Markdown/Core/AI/www typechecks, Markdown/AI tests, focused spec 10/10, docs/changeset checks, clean review, and fresh `/docs/markdown` Browser 200 with empty warning/error console | Final combined docs/package proof only |
| 18 | source-frozen | One non-cancellable `EditorCommitContext` observes the published snapshot; narrow observers remain independent; reentrant commits stay version-ordered; callback publication precedes child layout effects | Plite React provider/runtime contracts included in the frozen 71-file/1,019-test receipt and `.changeset/plite-react-read-only-provider.md` | Strict current-snapshot Plite React/browser closure |
| 19 | source-frozen | `PlateModelPublication` is the sole compiled truth; `getPlateRuntime`, option stores, and fallback identity are private; portals are descriptor-only; public registries, store factories, string-key lookup, and inspector proposals are absent | Final 24-file Shape 19 receipt plus the typed opaque-render-resource repair: Core 715/715, exact accessor diagnostics, component identity preservation, final Core/public/current-snapshot proof | Closure-only strict/browser proof |
| 20 | deliberately deferred | Keep feature-owned layout composition; no editor-global profile compiler or plugin/schema layout contribution exists | Prior exact audit reported zero `layout.profile` and schema-layout contribution matches; owner is `@platejs/plite-layout` plus a future Plite Plan | Recheck zero matches at final audit; revisit only after two independent reusable consumers exist |
| 21 | source-complete | `createPliteLayout(editor, options)` owns a per-editor runtime with atomic complete `reconfigure`; DOM strategy data is discriminated and direct; estimated-engine construction remains | `packages/plite-layout` pretext 9/9 and manual atomic reconfigure/rollback contract passed; current source/docs and `.changeset/plite-layout-runtime.md` record the contract | Current package type/test and browser matrix proof |
| 22 | source-frozen | Pure descriptor namespaces are frozen; derived schemas enforce explicit nested content grammar; `property.json()` is JSON-valued; arbitrary values require `property.json({ policy })`, infer through `NoInfer`, and cannot widen from a default; contextual extensions and `createYjsExtension` remain | JSON policy packet: `@platejs/plite` typecheck, focused schema 12/12, nested-derived grammar contract, exact-file Biome, and diff check passed; broader contract is recorded in `.changeset/plite-canonical-architecture.md` | Current full Plite/public-type/stale proof |
| 23 | source-frozen | Canonical scenarios are serializable/replayable; arbitrary browser code is isolated in non-release-capable `scenario.runImperative`; unused builders are removed; replay/builders/release proof reject dishonest numeric domains | Final 11-file numeric-domain receipt enforces exact XOR range, ordered bounds, discrete offsets/counts/indexes, positive iteration/capacity values, finite nonnegative settle time, and forged-soak rejection; Browser passes 99 core + 11 DOM, public builds 13/13, and runner integrity contracts 55/55 | Strict Chromium, full matrix, benchmark, and final Browser/Chrome evidence |

Shape 13-14 exact frozen receipt:

- public/type owner: `packages/plite/src/index.ts`,
  `packages/plite/src/interfaces/editor.ts`, and
  `packages/plite/test/public-package-types-smoke.ts`;
- React stores/hooks: `packages/plite-react/src/annotation-store.ts`,
  `packages/plite-react/src/widget-store.ts`,
  `packages/plite-react/src/hooks/use-editor-selector.tsx`,
  `packages/plite-react/src/hooks/use-editor-runtime-state.ts`,
  `packages/plite-react/src/hooks/use-plite-runtime.tsx`,
  `packages/plite-react/src/hooks/use-plite-annotation-store.tsx`, and
  `packages/plite-react/src/hooks/use-plite-widget-store.tsx`;
- contracts: `packages/plite-react/test/provider-hooks-contract.tsx`,
  `packages/plite-react/test/use-editor-runtime-state.test.tsx`,
  `packages/plite-react/test/plite-runtime-provider-contract.test.tsx`,
  `packages/plite-react/test/annotation-store-contract.tsx`,
  `packages/plite-react/test/widget-layer-contract.tsx`,
  `packages/plite-react/test/generic-react-editor-contract.tsx`, and
  `packages/plite-react/test/surface-contract.tsx`.

Shape 19 final frozen receipt:

- the final Shape 19 lane covers 24 files across the Core
  publication/runtime/store owners, Core React/static/internal readers,
  external descriptor-portal adopters, current docs, and the Core major
  changeset;
- publication after failed construction is cleaned up atomically, dependency
  and nested-plugin identity are canonical, registry lookup is safe for
  prototype-reserved keys, raw registries/store factories/string portals are
  absent, and the option store plus fallback identity are private editor-keyed
  owners;
- focused API/type/hook/runtime proof and the lane's exact stale scan passed;
  the final affected graph and opaque render-resource contracts also pass;
- a follow-up Core/Markdown receipt replaced the first declaration alias that
  leaked the branded command type with a reduced-group public alias and keeps
  Markdown option snapshots immutable, materializing mutable unified settings
  and plugin arrays only at the codec boundary;
- Plate Editor and Plate Plugin EN/CN API pages, editor-methods and unit-testing
  EN/CN guides, `content/docs/meta.json`, and
  `.changeset/core-private-plugin-runtime.md` remain frozen on the hard-cut
  target.

Cross-packet integration receipts:

- History eagerly synchronizes its schema identity and validates replay against
  a structurally valid container fixture; `@platejs/plite-history` passed
  122/122, and the focused Table undo reproduction passed 5/5.
- Plite schema derives nested content grammar explicitly, while
  `property.json({ policy, default })` uses `NoInfer` so the policy—not the
  default—owns the arbitrary value type.
- Combobox trigger arrays and Normalize Types configuration cross the compiled
  publication boundary as readonly inputs; consumers derive mutable local work
  values instead of mutating published snapshots. Their focused tests,
  typechecks, and the Core-to-Utils declaration build passed.
- Table is source-frozen on the sole scoped `TablePlugin` portal: 233/233 tests,
  package typecheck/build/lint, type contracts, barrels, and docs parity passed.
  Hooks stay unconditional across live `disableMerge` changes, and detached
  initial values publish one fresh cell-index map before React render without
  retaining stale IDs or indexing the synthetic root.
- Media's placeholder removal clones the readonly published upload map before
  deletion and republishes through `setOption`; focused 6/6 and 13/13 proof
  passed without weakening Core immutability.
- DnD keeps one stable renderer and reads live `enableScroller` options inside
  it; false-to-true-to-false reconfiguration and `scrollerProps` updates pass
  28/28 package tests without configure-order capture.
- Yjs state/transaction namespaces defer controller lookup until method use,
  so Plate initial-value materialization no longer requires an active provider;
  the full Yjs suite passes 215/215.
- The frozen-source audit reports zero forbidden current API matches across
  Shapes 3, 9-19, and 21-23. Shape 20 remains deliberately deferred.

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Configuration and shortcut shapes are inferred and unambiguous | Live owner and callsite audit | Frozen subsidiary Core/type/runtime receipts plus final Core graph | pass |
| React hooks never leak fallback state and remain hook-safe | Provider/store owner audit | Frozen Plate/Plite React receipts plus live Table option-toggle regression | pass; strict browser closure pending |
| Initialization and conversion ownership are deterministic | Constructor/codec/export audit | Frozen initialization, Yjs deferral, Markdown, and detached Table initial-value receipts | pass |
| Commit/runtime/layout publication is atomic and leak-free | Provider/runtime audit | Commit, layout, Shape 19, and typed opaque render-resource receipts | pass; strict browser closure pending |
| Schema and browser APIs expose only honest public capabilities | Schema/harness callsite audit | JSON policy 12/12; Browser 99 core + 11 DOM; public build 13/13 | pass; matrix pending |
| Adoption is complete | Exact stale-symbol/import searches | Final frozen-source audit has zero forbidden current matches | pass; generated registry JSON excluded by CI ownership policy |
| Published API is releasable | Main-relative package audit | Changesets, barrels 56/56, Core/Plite/www/public types/docs | development pass; strict closure pending |

Conditional evidence:

- High-risk scenarios: callback ordering, target collision/absence, no-provider
  hooks, stale external values, async load races, commit listener lifetime,
  layout reconfiguration after React commit, browser replay classification.
- External research: N/A; the accepted source-grounded Wordgard comparison and
  current repository owners already decide these packets.
- Issue/PR provenance: N/A; this is an explicitly accepted internal API effort.
- Browser/benchmark/docs/release/behavior-law owners: Browser and repo browser
  runner own focused proof here; sibling closure task
  `019f4d13-4361-7bf0-b28b-33494d78a4bd` owns the final matrix, Browser/Chrome,
  benchmark, strict gates, and six legacy plan checkers; docs-creator owns
  current-state docs; changeset owns release prose; package tests own behavior
  laws.

Findings:

- The corrected audit rejected several superficially tidy APIs because they
  blurred real ownership: `config.targets`, `editor.api.codecs`, a global
  layout descriptor compiler, and a public custom fallback editor.
- Shape 3 requires three compatible rules: retain contextual non-widening
  configuration, delete the redundant plugin value/config channel, and reserve
  one terminal configure step for the consumer after package `.extend*()`
  authoring. The resolved descriptor remains a compiled snapshot while scoped
  portal options are live; updating options does not recompile schema.
- Shapes 13-14 exposed the real React failure mode: render-time writes can
  escape from abandoned work. Callback/data publication now happens after
  commit, selectors catch up after a skipped notification, and hook-created
  annotation/widget stores stay dormant until insertion effect.
- Shape 17 Browser proof found two real owner defects rather than an API alias
  problem: Markdown font rules emitted absent marks as `undefined`, and media
  alignment schema omitted audio/video while retaining meaningless file
  alignment. Both were repaired in their owners before the Markdown freeze.
- Shape 19 review found publication-lifecycle, canonical dependency identity,
  and prototype-reserved plugin/trigger-key hazards. Those findings are repaired
  and source-frozen in the final 24-file receipt.
- The combined declaration graph caught a first public Core alias that exposed
  a private branded command type as TS4023. The public declaration now aliases
  only the reduced runtime groups required by consumers; no private command
  brand escapes.
- Immutable publication exposed real mutable-consumer bugs instead of a reason
  to weaken Core: History schema capture, Combobox triggers, Normalize Types,
  Table helpers, Markdown unified settings, and Media upload maps were repaired
  at their owning boundaries.
- Browser isolated the EditorKit construction failure to exactly two React
  `forwardRef` resources: `img` and `placeholder`. Core now treats values at
  declared render/override-component locations as opaque host resources while
  preserving identity and still rejecting accessors anywhere in descriptor
  data or plugin options; Core passes 715/715 with exact path diagnostics.
- Shape 21 is source-complete: direct layout options, atomic `reconfigure`,
  nested virtualized layout data, removed getter/provider abstractions, and
  retained estimated-engine factory. Current package/browser proof remains.
- Shape 23's assertion review proved that typed-looking tests could still say
  nothing: exact counts could coexist with ranges, negative/fractional
  discrete values reached the decoder, generated loop counts were coerced,
  native trace limits silently changed retention, and forged soak counts could
  satisfy release proof. Type, decoder, constructor, and release validators now
  reject those claims while retaining signed/fractional geometry.
- Final combined review found two real Table lifecycle defects. Live
  `disableMerge` changes could reorder hooks, and detached initial-value
  transformation indexed the editor's previous document. Both are repaired
  with real provider/store and pre-render initialization regressions.
- The composition repair is separately source-frozen across seven Plite React
  files. Plite React 1,009/1,009 and exact Firefox Backspace/Delete caret rows
  2/2 passed; focused Chromium and the final matrix remain closure-owned.

Decisions and tradeoffs:

- Favor one honest API over compatibility aliases even when the migration diff
  is large.
- Preserve optionality where the runtime truly supports it: shortcut targets,
  optional plugin peers, descriptor-free generic hooks, Yjs initialization.
- Keep distinct concepts distinct: pure DSL vs React, host codecs vs feature
  conversion vs static rendering, replayable steps vs imperative automation.
- Focused packet receipts prove their frozen revisions only. Later shared Core
  and app writes invalidate aggregate checks, so no earlier `check:core`, graph,
  or browser matrix result closes the current combined snapshot.

Review fixes:

- Contextual configure review found an audit bypass for identifier-bound
  callback results; callbacks return explicit allowed runtime fields. The
  current correction also rejects package-definition configure calls and
  direct authoring chains after configure.
- Target-key review found missing live lifecycle invalidation; publication and
  rollback contracts were repaired before that packet froze.
- Shape 13-14 review added selector catch-up, abandoned-render isolation,
  insertion-effect activation, orphan-store cleanup, and public command-type
  contracts.
- Markdown review restored the root API, removed the scoped duplicate, made AI
  dependencies explicit without runtime cycles, and repaired JSON/schema
  defects found by Browser.
- Browser-harness review made count bounds exclusive, numeric indexes/counts
  and offsets domain-correct, ranges ordered, iteration/capacity inputs
  positive integers, settle time finite/nonnegative, and model/text proof
  strings nonempty.
- Shape 19 focused review is closed: failed-publication cleanup,
  canonical identity, and reserved-key repairs are covered by its frozen
  receipt. Final combined review has zero accepted actionable findings.
- History's two first replay fixtures were invalid documents and therefore
  tested schema rejection rather than restoration. The final fixture uses a
  valid container and keeps eager schema publication explicit.
- The Core/Markdown follow-up keeps immutable option snapshots intact and
  performs mutable materialization only where unified requires mutable arrays.
- Final combined autoreview repaired the Table hook-order and detached initial
  value P2s. Its final remaining P1 cites only six CI-generated
  `apps/www/public/r/*.json` files. Repository policy forbids editing or locally
  rebuilding those artifacts; current `apps/www/src/registry` imports use the
  scoped Table portal and the source/registry/docs checks pass, so the finding
  is rejected as generated-output ownership rather than accepted source work.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Combined five-owner baseline `rg` included generated `apps/www/public/r` and exceeded the result cap | 1 | Exclude generated/public/build trees and query one exact symbol family at a time | Active correction: all later audits are bounded by owner and exact symbol |
| Docs/source `rg` used shell-sensitive backticks inside a double-quoted command | 2 | Use single-quoted regular expressions without shell substitution syntax | Subsequent commands use literal-free patterns and pass |
| Two later compound audit commands had unmatched shell quotes | 2 | Split each symbol family into one single-quoted `rg` invocation | No result from those failed commands is used as evidence; final audit remains open |
| Combined declaration/type graph exposed consumers mutating newly readonly published values | 1 | Repair each consumer at its mutable-local boundary instead of weakening Core snapshots | History, Combobox, Normalize Types, Table, Markdown, and Media focused receipts plus the final aggregate graph pass |
| First public runtime-group alias leaked the private command brand and raised TS4023 | 1 | Export a reduced-group alias containing only the public consumer surface | Focused Core declaration/type proof passes; final graph pending |
| History replay proof used structurally invalid fixtures | 2 | Build one schema-valid container fixture before testing restore semantics | Valid-container replay and eager schema contracts pass inside the 122/122 History suite |
| Focused lint audit used a malformed regular expression | 1 | Correct the bounded expression and rerun the owning lint target | Corrected lint invocation passes; the failed output is not evidence |
| Root `pnpm exec tsx` was unavailable | 1 | Use the app-owned TSX runtime | Runner found; app import then stopped at the ESM-only `remark-emoji` boundary |
| App TSX/Bun accessor imports stopped before editor construction at `remark-emoji` and Excalidraw CSS | 2 | Use Browser runtime enumeration rather than weakening loader boundaries | Browser reached EditorKit and isolated the two component accessors |
| Static Table/source getter scan could not identify the runtime accessor owner | 1 | Enumerate descriptors in Browser and bisect EditorKit plugins | Exactly `img` and `placeholder` React `forwardRef` `displayName` accessors reproduce; Table has zero accessors |

Verification evidence:

- Frozen Shape 3 options-only receipt: barrels 56/56, affected type graph
  39/39, Plate/www graph 58/58, focused packages 7/7 with Yjs 215/215,
  4,916-file schema audit, 45-package `check:core`, and packed 10-package /
  34-subpath release proof passed at that revision.
- Frozen Shape 13-14 receipt: full `plite-react` 71 files/1,019 tests,
  annotation/widget 28/28, source-first typecheck, focused lint, public type
  smoke, and diff check passed.
- Frozen Shape 17 receipt: Markdown/Core/AI/www typechecks, Markdown/AI tests,
  focused Markdown 10/10, docs and changeset checks, scoped lint/diff, clean
  autoreview, and fresh `/docs/markdown` Browser proof passed.
- Frozen Shape 19 final receipt: 24 files cover Core publication/runtime/store,
  adoption, docs, and release ownership; focused API/type/hook/runtime proof and
  exact stale scans passed. The follow-up reduced-group declaration alias and
  Markdown boundary materialization also pass focused Core/Markdown proof.
- Frozen integration repair receipt: History 122/122 plus Table undo 5/5;
  nested-derived schema grammar and `property.json` `NoInfer` contracts;
  Combobox/Normalize Types readonly-boundary tests and typechecks; Table
  233/233 plus package/type/docs/barrel proof; Media 6/6 and 13/13.
- Frozen Core render-resource receipt: resolvePlugins 50/50, full Core 715/715,
  source-first type/contracts, identity preservation, and exact accessor-path
  diagnostics pass without a global React-marker bypass.
- Frozen DnD/Yjs receipt: DnD 28/28 plus live option reconfiguration;
  Yjs 215/215 plus deferred controller lookup through initial publication.
- Frozen Shape 23 numeric receipt: 99 Browser core plus 11 DOM tests, public
  build 13/13, focused 10/10 with 55 expects, exact Biome/diff, and changeset
  status pass.
- Frozen-source stale audit: zero forbidden current matches across Shapes 3,
  9-19, and 21-23; Shape 20 remains deliberately deferred.
- Frozen Shape 22 JSON receipt: Plite typecheck, schema 12/12, exact-file
  Biome, and diff check passed.
- Composition partial closure: seven files source-frozen, old
  `exportModelSelectionAfterRender` zero, Plite React 1,009/1,009, lint,
  source-first typecheck, and Firefox caret rows 2/2 passed; Chromium pending.
- Browser-runner infrastructure receipt: integrity invalidation now reports the
  exact repo-relative path/event; runner contracts 55/55 and focused Biome
  passed. This is runner proof, not the final browser matrix.
- Final immutable development snapshot: `check:core` passes 45/45 typechecks,
  45/45 lints, and 632 test files in 73.77s; `check:plite:dev` passes 53
  typechecks, 45 package suites, Browser 87/87, contracts 123/123 plus 66/66,
  and Chromium 3/3 in 123.215s.
- Final www snapshot: source build 2.06s, typecheck 74.17s, and docs check 0.79s
  pass. Public build/types 13/13, schema adoption 4,823 files, registry
  changelog 16/16, Plite docs, changeset status, barrels 56/56, Biome 4,704
  files, and diff check pass.
- Strict `check:plite`, full browser matrix, benchmark, closure Browser/Chrome
  artifact, six legacy checkers, and the final main checker remain pending.

Final handoff prepared:

- Ownership and target API/runtime: decisions and frozen receipts recorded;
  Shapes 3, 9-19, and 21-23 plus every accepted reviewer repair are
  source-complete and frozen.
- Public breaks and Plate/collaboration adoption: packet adoption recorded;
  frozen-source stale audit is zero; CI-generated registry JSON is explicitly
  left to its owning pipeline.
- Applicable browser/benchmark/docs/provenance decisions: owner split recorded;
  closure-task receipt pending.
- Proof and execution risks: focused and integrated development evidence is
  current; only strict closure evidence remains.
- Execution order and user attention: closure task runs strict Chromium,
  matrix, benchmark, Browser/Chrome, six legacy checkers, and final checker on
  this immutable snapshot.

Timeline:

- 2026-07-22T17:33:36.188Z Plite Plan created.
- 2026-07-22T18:17:19+02:00 User authorized all corrected packets; plan converted to one-shot execution and goal created.
- 2026-07-22T18:18:00+02:00 Six implementation owners assigned by disjoint package/API surface; root retained integration and closure.
- 2026-07-22T18:20:00+02:00 Initial combined source audit was too broad because generated registry files were included; subsequent searches narrowed to exact source owners.
- 2026-07-22T18:31:00+02:00 Sibling Wordgard-to-Plite closure task claimed final matrix/Browser/benchmark/strict/legacy-checker proof after source freeze; current matrix explicitly invalidated.
- 2026-07-22T18:35:00+02:00 Shape 21 source completed; pretext tests passed 9/9 and manual atomic reconfigure/rollback contract passed; root removed stale public aliases and updated current docs.
- 2026-07-22 Shape 3 options-only lane froze after full caller, docs, skill,
  release, Core, and packed-artifact proof.
- 2026-07-22 Shapes 13-14 froze after the 17-file hook/store/type packet
  passed 1,019 Plite React tests and focused concurrent-render contracts.
- 2026-07-22 Shape 17 froze on the sole root Markdown API after package/docs,
  review, and fresh Browser proof.
- 2026-07-22 Shape 19 external adoption and docs/release lanes froze; Core kept
  exclusive ownership for publication/store lifecycle and reviewer repairs.
- 2026-07-23 Shape 19 froze its final 24-file source receipt after repairing
  failed-publication cleanup, canonical dependency identity, and
  prototype-reserved registries. A follow-up reduced-group alias removed the
  TS4023 command-brand leak, and Markdown materialization stayed at the codec
  boundary.
- 2026-07-23 History froze at 122/122 with eager schema identity and a valid
  container replay fixture; Plite nested-derived grammar, `property.json`
  `NoInfer`, Combobox/Normalize Types readonly boundaries, Table sole portal,
  and Media 6/6 plus 13/13 immutable-option repairs were recorded.
- 2026-07-23 Frozen-source stale audit reached zero forbidden matches for every
  executed shape. Browser isolated the integration failure to two MediaKit
  `forwardRef` component accessors; Core's typed opaque-resource repair closed
  it without weakening descriptor validation.
- 2026-07-23 Shape 22 JSON policy typing froze after Plite typecheck and 12/12
  focused schema tests.
- 2026-07-23 Main execution ledger refreshed from frozen receipts; no final
  combined gate was promoted to complete.
- 2026-07-23 Autogoal checker failed exactly on six unchecked closure rows and
  the two intentionally open phases; this is the correct pre-freeze state.
- 2026-07-23 Core opaque render resources, DnD live scroller options, Yjs
  deferred controller lookup, immutable consumers, and Table demo integration
  froze with focused owner proof.
- 2026-07-23 Shape 23 numeric-domain audit repaired replay, constructors,
  native tracing, and release proof; 99 core plus 11 DOM tests pass.
- 2026-07-23 Three combined autoreview passes repaired Table hook ordering and
  detached initial indexing. Final development gates pass on the immutable
  snapshot; closure handoff prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | All executed shapes and accepted reviewer repairs are source-frozen; development proof is green and strict closure is active |
| Where am I going? | Closure runs strict browser/matrix/benchmark/checkers, then the main checker closes the goal |
| What is the goal? | Execute shapes 3, 9-19, and 21-23 without compatibility debt |
| What have I learned? | See Findings |
| What have I done? | Completed source execution and current development proof; preserved strict closure as the remaining authority |

Open risks:

- Focused Chromium composition proof, strict `check:plite`, the full browser
  matrix, benchmark, Browser/Chrome evidence, six legacy plan checkers, and the
  final main checker remain closure-owned and unproven for the final snapshot.
- Six stale `apps/www/public/r/*.json` files contain pre-migration Table code,
  but they are CI-generated artifacts that local agents are forbidden to edit
  or regenerate. Current source registry files are migrated and proven.
- The strict browser gates are slow; use focused rows first, then one closure
  run instead of rerunning the matrix during active source writes.
