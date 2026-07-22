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
- Resolve all 15 scoped rows: shape 3, shape 9's private target binding, shapes
  10-19, and shapes 21-23. Shape 20 remains deferred and untouched.
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
- `.configure` composes non-widening contextual layers; `.extend` alone owns
  type/API/options widening.
- Keep public `targetPluginKeys`; do not introduce `config.targets`.
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
  do not create `editor.api.codecs`.
- Commit observation uses one non-cancellable `EditorCommitContext` contract.
- Internalize runtime caches incrementally; do not invent `editor.inspect`.
- Layout uses `createPliteLayout` plus atomic `runtime.reconfigure`.
- Freeze pure namespace objects, infer JSON properties from
  `property.json({ policy })`, retain contextual extension callbacks, and keep
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
- phase: execute
- next: integrate delegated slices
- handoff: not-prepared

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
- [ ] Outcome, scope, non-goals, constraints, and owners are concrete.
- [ ] Current API/docs/tests/exports/behavior claims cite live source.
- [ ] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [ ] Public breaks and any private bridge have complete adoption/deletion answers.
- [ ] Execution slices and focused proof matrix are concrete.
- [ ] Conditional work and final handoff are resolved without generic N/A matrices.
- [ ] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
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
| Binary readiness | pending | Resolve every readiness condition | pending |
| Fresh source evidence | pending | Recheck decision-changing current claims | pending |
| Conditional risk and adoption | pending | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | pending |
| Verification recorded | pending | Record fresh planning proof and exact execution gates | pending |
| Handoff prepared | pending | Prepare concise ownership, breaks, proof, risks, and execution order | pending |
| Autoreview | pending | Run for implementation changes or record planning-only N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-execute-agent-native-api-shapes.md` | pending |
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Corrected audit accepted; requirements, exclusions, owner map, and proof threshold materialized | Execute |
| Decide | complete | Fifteen execute rows and shape 20 defer row resolved in decision ledger | Execute |
| Execute | in_progress | Six disjoint implementation owners active; root owns integration/adoption | Prove and hand off |
| Prove and hand off | pending | | User review |

Decision brief:
- outcome: one coherent Plate/Plite API with inferred contextual configuration,
  strict React ownership, synchronous construction, honest conversion/runtime
  boundaries, and replayable browser proof.
- chosen shape: execute the corrected audit's 15 scoped rows as hard cuts with
  same-slice adoption and deletion.
- strongest rejected alternative: keep dual signatures and helper aliases so
  callers can migrate gradually.
- consequence: a larger coordinated diff and required changesets, but one
  learnable current API and no permanent branch-only compatibility debt.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 plugin configuration | One runtime callback overwrites another | Compose ordered contextual non-widening `.configure` layers; `.extend` widens | Plate core | Preserve contextual reads without overloading type ownership | Plugin factories and configured plugins | Type inference plus ordering tests | Ordering regression | execute |
| 9 target binding | Public `targetPluginKeys` is resolved independently by consumers | Keep public key list; compile one private optional binding | Plate core/features | One target truth without rejected public descriptor config | Injection/render/parser consumers | Missing-peer and ordering tests | Optional peer accidentally required | execute |
| 10 shortcuts | Resolver guesses mutation then API route | Infer unique route; disambiguate collisions with optional `update` or `api`; handlers forbid target | Plate core | Short happy path and explicit ambiguity | All shortcut definitions/docs | Type/runtime collision tests | Silent wrong dispatch | execute |
| 11 editor hooks | Public hooks can surface inert fallback | Strict `useEditor`; nullable `useActiveEditor`; private stable fallback only | Plate React | Hook topology without lying to callers | Hook/provider callers | Provider/no-provider hook tests | Rules-of-Hooks break | execute |
| 12 element typing | Descriptor and generic forms are inconsistent | Support descriptor-first plus generic/type-only strict/optional hooks and props | Plate React | Best inference for plugin and library authors | Components, hooks, docs | Type tests | Inference widening | execute |
| 13 commands | Hook captures command input/closures ambiguously | `usePliteCommand(command, options?)` returns typed input dispatcher; honest editor callback name only if used | Plite React | Stable hooks and canonical command ownership | Command hooks/callers | Hook/type tests | Stale closure | execute |
| 14 selectors/view data | Arbitrary dependency arrays paper over external mutation | Latest selector/callback; direct annotation/widget values; explicit `revision` | Plite React | One invalidation contract | Selector and view-data callers | Rerender/invalidation tests | Missed external change | execute |
| 15 entrypoints | Pure and React exports blur ownership | Pure DSL from `platejs`; React APIs from `platejs/react`; curated internal owner imports | Plate entrypoints | Predictable imports | Whole-repo import sweep | Export/typecheck tests | Cycles or hidden API | execute |
| 16 initialization | Constructor accepts async/string/null/default ambiguity and `onReady` | Synchronous value/callback; apps own async loading; Yjs keeps `skipInitialization` | Core/Plite React | Deterministic construction | Editors/providers/examples/tests | Init and stale-load tests | Async adoption gaps | execute |
| 17 conversion/rendering | Conversion and static render names imply one codec registry | Keep host codecs, feature conversion, and React rendering separate; call static renderer `renderStaticHtml` | Plite DOM/features/React | Honest environment and ownership boundaries | HTML/Markdown/static callers | Round-trip/render tests | Server/client import drift | execute |
| 18 commit observation | Several observer shapes expose partial commit truth | Non-cancellable `onCommit(EditorCommitContext)` plus independent narrow observers | Plite React | Canonical published snapshot context | Provider/listener callers | Commit ordering/context tests | Listener lifetime leak | execute |
| 19 runtime access | Public caches/registries leak as default access | Internalize behind descriptor access as callers migrate; retain genuinely dynamic APIs | Plite/Plate runtime | Reduce incidental public machinery | Exact callsite-led migration | API/type tests and stale search | Premature deletion | execute |
| 20 layout descriptors | Proposed global compiler | Keep current feature-owned layout composition | N/A | No proven consumer or payoff | None | Exact no-change audit | Scope creep | defer untouched |
| 21 layout runtime | Getter/ref/provider split configuration | `createPliteLayout(editor, options)` and atomic `runtime.reconfigure`; direct discriminated DOM strategy data | Plite layout/React | Explicit lifetime and atomic updates | Layout consumers/tests | Runtime/browser layout tests | React commit timing | execute |
| 22 descriptors/schema | Mutable namespace bags and explicit typed JSON policy | Freeze pure APIs; infer `property.json({ policy })`; intrinsic-only `render.as`; direct no-context extensions | Plite schema/extensions | Smaller, inferable, serializable surface | Schema/extensions/Yjs adoption | Type/schema tests | Over-freezing dynamic state | execute |
| 23 browser harness | Replayable and imperative steps mix; unused raw builders remain | Canonical serializable steps plus explicit non-replayable lane; remove unused escape hatches/builders | Browser package/apps | Proof artifacts say what they can prove | Browser suites/runner/docs | Harness contract and browser proof | Capability regression | execute |

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

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Configuration and shortcut shapes are inferred and unambiguous | Live owner and callsite audit | Core type/runtime tests | pending |
| React hooks never leak fallback state and remain hook-safe | Provider/store owner audit | Hook and browser render tests | pending |
| Initialization and conversion ownership are deterministic | Constructor/codec/export audit | Package and feature tests | pending |
| Commit/runtime/layout publication is atomic and leak-free | Provider/runtime audit | Commit, layout, and browser tests | pending |
| Schema and browser APIs expose only honest public capabilities | Schema/harness callsite audit | Type, contract, replay, and browser proof | pending |
| Adoption is complete | Exact stale-symbol/import searches | Zero unexpected hits | pending |
| Published API is releasable | Main-relative package audit | Changesets, barrels, typechecks, docs | pending |

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
- The hard cuts are coupled by adoption, not by implementation: independent
  package owners can execute in parallel once this contract is active.
- Shape 21 is source-complete: direct layout options, atomic `reconfigure`,
  nested virtualized layout data, removed getter/provider abstractions, and
  retained estimated-engine factory. Full package proof waits for shared
  Plite React barrel integration.

Decisions and tradeoffs:
- Favor one honest API over compatibility aliases even when the migration diff
  is large.
- Preserve optionality where the runtime truly supports it: shortcut targets,
  optional plugin peers, descriptor-free generic hooks, Yjs initialization.
- Keep distinct concepts distinct: pure DSL vs React, host codecs vs feature
  conversion vs static rendering, replayable steps vs imperative automation.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Combined five-owner baseline `rg` included generated `apps/www/public/r` and exceeded the result cap | 1 | Exclude generated/public/build trees and query one exact symbol family at a time | Active correction: all later audits are bounded by owner and exact symbol |
| Docs/source `rg` used shell-sensitive backticks inside a double-quoted command | 2 | Use single-quoted regular expressions without shell substitution syntax | Subsequent commands use literal-free patterns and pass |

Verification evidence:
- Pending.

Final handoff prepared:
- Ownership and target API/runtime: pending.
- Public breaks and Plate/collaboration adoption: pending.
- Applicable browser/benchmark/docs/provenance decisions: pending.
- Proof and execution risks: pending.
- Execution order and user attention: pending.

Timeline:
- 2026-07-22T17:33:36.188Z Plite Plan created.
- 2026-07-22T18:17:19+02:00 User authorized all corrected packets; plan converted to one-shot execution and goal created.
- 2026-07-22T18:18:00+02:00 Six implementation owners assigned by disjoint package/API surface; root retained integration and closure.
- 2026-07-22T18:20:00+02:00 Initial combined source audit was too broad because generated registry files were included; subsequent searches narrowed to exact source owners.
- 2026-07-22T18:31:00+02:00 Sibling Wordgard-to-Plite closure task claimed final matrix/Browser/benchmark/strict/legacy-checker proof after source freeze; current matrix explicitly invalidated.
- 2026-07-22T18:35:00+02:00 Shape 21 source completed; pretext tests passed 9/9 and manual atomic reconfigure/rollback contract passed; root removed stale public aliases and updated current docs.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Execution checkpoint |
| Where am I going? | Implement slices 0-6 and close every proof gate |
| What is the goal? | Execute shapes 3, 9-19, and 21-23 without compatibility debt |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Shared public types can create cross-slice type failures; root integration
  owns conflict repair before broad proof.
- The strict browser gates are slow; use focused rows first, then one closure
  run instead of rerunning the matrix during iteration.
