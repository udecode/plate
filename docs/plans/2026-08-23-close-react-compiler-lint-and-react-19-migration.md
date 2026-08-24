# Close React Compiler lint and React 19 migration

Objective:
Execute the accepted React Compiler and React 19 plan; done when all 98 findings
are closed, the four rules are enforced, React 19/package/app contracts match,
and focused, browser, repository, and P1 review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-close-react-compiler-lint-and-react-19-migration.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `deep`: 98 forced Compiler diagnostics cross React rendering, editor/runtime
  mutation, effects, refs, tests, package compilation, copied registry code,
  and published dependency contracts. Official React/Oxc research and a
  runtime-risk red-team are justified.

Completion threshold:
- Execution closure: all ten slices below are complete; the forced four-rule
  inventory returns zero diagnostics outside the structural render-probe
  override; source/type/test/build/browser/review gates pass; no generated
  registry or template edits remain.
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- The current forced inventory for `react/immutability`, `react/refs`,
  `react/set-state-in-effect`, and `react/use-memo` is complete, and every
  diagnostic is assigned to a behavior-preserving source fix, shared structural
  override, or one justified production inline exception with a deletion gate.
- No four rules remain globally disabled in the target config. Production
  reaches zero unsuppressed diagnostics, tests contain zero directives, and
  every structural override is scoped by a real shared condition rather than a
  named file list.
- The plan closes all related findings from the preceding audit: registry
  `React.memo`/`.displayName`, the stale `ColorPicker` comparator, the missing
  registry guard, React 18 package compilation, and all unnecessary
  `react-compiler-runtime` dependencies under the repo's React 19.2 minimum.
- Exact execution gates cover lint policy, typecheck, affected tests, package
  builds/artifacts, both Next apps, CI-owned registry generation boundaries,
  and browser proof for changed runtime/component behavior.

Verification surface:
- Official React Compiler lint and effect guidance, the cited
  `you-might-not-need-an-effect` page, official Oxc rule contracts, current
  Oxlint resolved config, and current React/Compiler package contracts.
- A forced Oxlint JSON inventory across authored `apps/**` and `packages/**`,
  grouped by rule, production/test boundary, file, and semantic owner.
- Current registry counts and comparator source; `tooling/config/tsdown.config.ts`;
  every manifest containing `react-compiler-runtime`; package peer ranges;
  build-artifact enforcement and CI consumers.
- Plan checker plus a source-backed red-team of effect timing, editor/ref
  identity, external-store synchronization, DOM selection, DnD, collaboration,
  virtualization, and test-harness risks.

Constraints:
- The user accepted this exact plan and authorized execution on 2026-08-24.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Fix behavior, not syntax. Do not replace imperative editor/runtime laws with
  fake React state, effect churn, wrapper callbacks, double casts, or lint-only
  indirection.
- `react/display-name` stays enabled for production and structurally disabled
  only for anonymous test harnesses. Native
  `react/preserve-manual-memoization` stays enabled.
- Keep `react-doctor/react-compiler-no-manual-memoization` globally off because
  it bans legitimate identity contracts; add a registry-specific enforcement
  owner that targets the copied React 19 + Compiler policy instead.
- Tests get shared structural overrides only where their execution model truly
  conflicts with a rule; tests contain no inline directives.
- Preserve Plite/Plate editor, selection, history, collaboration, DnD,
  virtualization, external-store, and browser behavior. Do not weaken package
  public types or React 19.2 peer requirements.
- Do not commit, push, create a PR, or regenerate registry/templates.

Boundaries:
- In scope: `oxlint.config.ts`, the four current diagnostic families, authored
  React code in `apps/**` and `packages/**`, registry memo/display-name policy,
  `tooling/config/tsdown.config.ts`, package/app manifests, lockfile and package
  artifact checks, and exact execution proof owners.
- Source owners: root lint config and Ultracite preset; each affected React
  hook/component; registry copied-source components; tsdown package compiler;
  manifests and artifact-validation scripts; www and Plite Next configs.
- Non-goals: no unrelated lint backlog, React API redesign by taste, broad
  component cleanup, style-rule changes, generated registry/template edits,
  deployment, commit, push, or PR.
- Direct Plite boundary owners: Plite React hooks/components that own mutable
  editor/ref cells, external-store synchronization, DOM/selection bridges,
  history, collaboration, DnD, and virtualization. Raw Plite model/API changes
  are excluded unless a diagnostic proves the substrate contract itself is the
  cause; such a row must route to Plite Plan or Best API before execution.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if an occurrence cannot be classified after reading its complete
  owner/callers/tests and official rule contract, or if a necessary public API
  or Plite substrate change has multiple materially different target shapes
  requiring user choice. Diagnostic volume, difficult refactors, or expected
  behavior proof are not blockers.

Plate Plan state:
- status: complete
- phase: final handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full-plan-only boundary, all four rules, all prior audit findings, cited React effect guidance, exact closure and no-external-mutation requirements are recorded above |
| Active goal and plan verified | yes | New one-shot execution goal names this exact accepted plan; user said `ok go` on 2026-08-24 |
| Current owners read | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md`, the complete 38-file diagnostic inventory, affected callers/tests/docs, lint config, compiler/build owners, and both app configs were read on 2026-08-24 |
| Best API target resolved | yes | Hard cut `PlateEditorWithStore`; `useEditor()` and `useActiveEditor()` return the editor only, while `usePlateStore()` remains the sole store hook. No alias or compatibility bridge. |
| Mode and execution boundary resolved | yes | Deep plan accepted; one-shot execution authorized without commit, push, PR, or generated-output mutation |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the absence of a compatibility bridge have complete adoption answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved.
- [x] Slice 1: lock lint, registry, React 19, and render-probe regression boundaries.
- [x] Slice 2: hard-cut `PlateEditorWithStore` and adopt docs/types/tests/changeset.
- [x] Slice 3: repair Plite imperative mutation and render refs.
- [x] Slice 4: repair commit/external-store ref owners.
- [x] Slice 5: repair DnD, Yjs, and cmdk ref/lifecycle owners.
- [x] Slice 6: remove app, registry, selection, and layout mirrored effects.
- [x] Slice 7: remove registry memo/display assignments and enforce the AST policy.
- [x] Slice 8: finish React 19 compiler/runtime manifests and artifact contract.
- [x] Slice 9: finish supported Next 16.3 config and app proof.
- [x] Slice 10: enable all four rules; run lint, type, test, build, Browser, Best API repair, and P1 review closure.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Complete every accepted execution slice | All ten slices are complete; the four-rule inventory is zero outside the render-probe boundary, and repository, app, Browser, API and review proof is recorded below |
| Fresh source evidence | yes | Recheck decision-changing current claims | Forced Oxlint inventory, manifests, app configs, compiler config, installed Next types, registry source, public exports/docs, and artifact checks refreshed 2026-08-24 |
| Best API review | yes | Resolve every P0/P1 call-shape finding | One P0 hard cut accepted into this plan: delete `PlateEditorWithStore` and `.store` grafting; no other public shape changes admitted |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work | Public API adoption, changeset, copied-registry inputs, browser proof, React runtime artifacts, and static-export limits are explicit below |
| Verification recorded | complete | Record focused, browser, repository, artifact, and review evidence | `CI=1 pnpm check`, `CI=1 pnpm check:plite:dev`, focused contracts/builds, Browser routes, cached API runtime proof and clean P1 review are recorded below |
| Handoff prepared | complete | Prepare final ownership, changes, proof, and residual-risk handoff | Final ownership, public break, verification and the CI-owned generated-index boundary are recorded below |
| P1 autoreview | yes | Run implementation review with `--max-priority P1` | Invocation one found the synchronous inline-cache helper; the repaired async boundary passed invocation two across four chunks with zero P0/P1 findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-close-react-compiler-lint-and-react-19-migration.md` | Final checker passes after this evidence update |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Official contracts, current source, 98 diagnostics, 40 shim manifests, two app configs, and public API/docs were read | Decide |
| Decide | complete | Every diagnostic family and preceding audit finding has one target owner and verdict | Prove and hand off |
| Prove and hand off | complete | Plan checker passes and execution gates are explicit | User acceptance |
| Slice 1: policy boundaries | complete | Six contract tests reject memo aliases, display assignments, React 18/shims/stale exact React, incomplete Next flags, and broad lint exemptions; 124 focused render-probe tests and Plite React typecheck pass | Slice 2 |
| Slice 2: Core API hard cut | complete | `PlateEditorWithStore` and `.store` graft deleted; Core typecheck/type contracts, 4 focused tests, six targeted docs audits, formatting, and forced immutability lane pass; Core major changeset added | Slice 3 |
| Slice 3: Plite mutation/ref repair | complete | Plite React source has zero forced immutability findings and Slice 3 owners have zero forced refs findings; package typecheck and all 1,086 Plite React tests pass; forced repository inventory fell to 28 | Slice 4 |
| Slice 4: commit/external stores | complete | Announcer, document epoch, and root-group owners have zero forced refs/set-state findings; Plite React typecheck and 54 focused tests pass; forced repository inventory fell to 22 | Slice 5 |
| Slice 5: cross-package refs | complete | DnD, Yjs, and cmdk have zero forced findings; all three typecheck; DnD 33, Yjs 221, and cmdk 4 tests pass; forced repository inventory fell to 12 | Slice 6 |
| Slice 6: effects and apps | complete | All four forced rules now return zero repository findings outside render probes; www and Plite app typechecks pass; object URL/media/math/font specs pass 16 tests, layout passes 57, selection passes 71, and the input-router contract passes 53 | Slice 7 |
| Slice 7: registry memo policy | complete | Eight memo wrappers and ten display assignments removed; 364-file registry AST audit, six contract tests, www typecheck, 18 focused component tests, and 76-entry changelog check pass; stale color callback regression added | Slice 8 |
| Slice 8: React 19 artifacts | complete | Compiler target is 19; 40 shim manifest entries and the lockfile shim are gone; exact React/DOM pins are 19.2.8; install, 18-task selected build graph, seven package artifact checks, and emitted-import scans pass | Slice 9 |
| Slice 9: Next apps | complete | Both apps use Next 16.3.2, typed routes, explicit Turbopack root, React Compiler, Rust Compiler, Instant Insights and browser logging; both typecheck; Plite static build renders 46 pages; www direct build reaches the intended config and is blocked only by stale CI-owned generated registry imports | Slice 10 |
| Slice 10: closure | complete | Four rules enabled with zero findings; full root and affected Plite checks pass; browser/app/API proof passes; Best API repair has no stale live references; second P1 autoreview is clean | Final handoff |

Decision brief:
- outcome: execution-ready hard cut from global Compiler-rule offs and React 18
  compiler shims to React 19 Compiler coverage with behavior-owned exceptions.
- chosen shape: fix derivable render/effect/ref violations at their source;
  preserve true imperative owners through the narrowest shared or inline policy;
  remove registry manual memoization; compile packages for React 19 without the
  backport runtime.
- strongest rejected alternative: turn all four rules on and mechanically obey
  every suggestion. That would convert external synchronization and imperative
  editor state into fake React ownership and create real runtime regressions.
- consequence: execution must proceed owner-by-owner with focused behavior
  proof before each global rule is finally enabled; config is the last step,
  not the first.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Four native Compiler rules | All four are globally off | Enable `react/immutability`, `react/refs`, `react/set-state-in-effect`, and `react/use-memo` globally after source cleanup | `oxlint.config.ts` | Oxc includes all four in its recommended React Compiler correctness set; a diagnostic skips the affected compilation unit | Config changes last, after each forced lane reaches its target | Forced JSON command returns zero production diagnostics and only the structural render-probe exemption | Enabling early would bury ownership under noise | accept |
| Render-probe tests | 12 `react/immutability` findings across five Plite React test files synchronously publish render observations | Extract mutation-bearing harnesses under `packages/plite-react/test/render-probes/**`; one directory-shaped override disables only `react/immutability` there | Plite React tests + root Oxlint test override | Effects would change the measured boundary; pretending these writes are application state would invalidate the tests | Import the extracted probes from existing tests; no test directives and no named-file override | Forced lint reports the 12 findings only when the structural override is removed; affected tests still prove synchronous render publication | A broad all-tests override would hide real future defects | accept narrow structural override |
| `useEditor().store` | `useInternalEditor` mutates the selected editor during render and exports `PlateEditorWithStore`; docs teach `.store` | `useEditor(): PlateEditor`, `useActiveEditor(): PlateEditor | null`, `usePlateStore()` for store access, and `useEditorSelector` selectors receive `PlateEditor` | `packages/core/src/react/stores/plate` | The editor and store already have separate hooks; grafting a store onto the editor creates a hidden mutable public hybrid | Delete `PlateEditorWithStore`, update exports/type tests/runtime tests and English/Chinese API docs, add `@platejs/core` changeset; no alias | Core typecheck/tests, type tests, docs source parity, package build and API reference check | This is the only public breaking change | accept hard cut, P0 Best API |
| Plite input/controller mutation | Hooks and event adapters directly assign controller state and runtime ref fields (27 findings across router/runtime files) | Add semantic private transitions to the owning input controller and DOM runtime: intent, native repair, projection, pending input, DOM repair queue, Android manager, and ref assignment | `packages/plite-react/src/editable/**` internal controllers | Imperative editor state is legitimate, but its owner is the controller—not arbitrary React callbacks | Replace direct assignments with named transitions; keep timing and transaction boundaries; do not introduce React state or a public API | Input-router, composition, Android, clipboard, drag, repair, selection, IME, and browser tests; forced immutability lint | A generic `setField` would merely hide mutation and destroy invariants | accept semantic internal methods only |
| Render-written callback and option cells | Plite component/hooks and cmdk mutate hook-returned objects during render | Use real refs whose writes occur in insertion/layout effects; consumers read committed values from events/effects; cmdk queue uses a stable `useRef` | Plite React hook/component owners; cmdk scheduler | Latest callbacks are imperative synchronization, not render output | Preserve decoration refresh ordering and scheduler identity; remove the existing memo-preservation suppression if the stable ref makes it unnecessary | Decoration/source lifecycle tests, cmdk tests, forced immutability + refs lint | Moving a write after refresh would publish stale decoration options | accept with order-specific tests |
| Editable text render identity | A ref is read and incremented during render to force text remounts | Use a pure segment key from projected render revision plus resolved text/marks identity; no mutable counter | `editable-text.tsx` | A-to-B-to-A still remounts because each adjacent key differs; render mutation adds no information | Update text projection/remount tests, including A-to-B-to-A | Plite React text, IME, composition and DOM projection tests; forced refs lint | A key missing text/mark identity could reuse stale DOM | accept pure identity |
| Announcement and document epochs | Announcer and root selector reset/read refs during render | Announcer becomes a per-editor commit external store consumed with `useSyncExternalStore`; root document epoch selects the last relevant replace commit version with `shouldUpdate` | Plite React live-region and root selector owners | Both values come from editor commits, an external store already owned by the editor | Preserve keyed editor remount baseline and polite live-region commit keys | Announcement tests, editor replacement test, root replace/no-replace tests | Replaying the latest commit on remount could duplicate speech | accept external-store ownership |
| Props/callback refs read in render | www perf harness, Yjs overlays, cmdk values, use-chat transport, and DnD connector read/write refs during render | Depend directly on stable callbacks; commit latest Yjs options in layout effect while computing initial data from current options; cmdk context exposes registered values; transport owns abort; DnD attaches connector in layout effect | Each component/package owner | These are callback/DOM/external-resource lifecycles, not render state | Keep public DnD/Yjs signatures; use-chat remains registry-local; selection reconciler tests pass a captured ref rather than reading a property in JSX | Focused package/tests plus forced refs lint | Stale callback or early connector attachment can break cancel, overlay, or drag behavior | accept owner-specific fixes |
| Mirrored UI state effects | Font color mirrors selection color; inline equation mirrors selection into `open`; mounted root groups reconcile inputs in an effect | Capture color in the open event; derive equation visibility from selection plus explicit dismissal intent; reconcile root-group transition memory with a pure guarded render adjustment | Registry color/math; Plite root groups | Per React guidance, render data and user-event transitions do not belong in effects | Add close/reopen, selection-loss, Escape, A-to-B selection, document replace, and monotonic group-mount tests | Focused tests and forced set-state lint | Bad intent reset can reopen a dismissed equation or discard mounted groups | accept event/derivation owners |
| Object URLs | Media preview and HTML export create/revoke URLs in effects and synchronously set React state | Add a copied-registry `useObjectUrl` external resource store; `useSyncExternalStore` exposes the URL, effect only mounts/revokes the resource | New registry hook input + media and HTML registry items | Blob URLs are external browser resources; state mirroring is the wrong owner | Register the hook as a dependency of both copied items; never edit generated registry output locally | URL create/revoke/identity tests, registry source check, `/blocks/media-demo`, `/blocks/plate-to-html` | File replacement must never display a URL belonging to the previous `File` | accept shared copied hook |
| DnD attempted-drag state | An effect clears `isAboutToDrag` when the monitor never starts | Start and schedule the attempted-drag reset inside `canDrag`; cancel/finish it in `item` and `end`, with monitor state checked by the scheduled callback | `packages/dnd/src/useDndNode.ts` | This is a react-dnd lifecycle transition, not prop-derived state | Preserve existing public return shape | Aborted-drag, actual-drag, preview and cleanup tests; browser DnD proof | Resetting before preview capture would flicker or hide the preview | accept lifecycle-owned reset |
| Table drag-handle host | Table queries the selected cell after layout and stores the host | Put `dragCellKey` in the table context and render the handle directly in the matching `TableCellElement`; delete query, portal host state, and effect | Registry table component | The cell already owns the target DOM; querying for it creates a second owner | Keep the same attributes, positioning, pointer interception and content-editable boundary | Table selection/drag tests and `/blocks/table-demo` browser proof | Context fan-out could rerender cells; Compiler coverage and focused profiling must show no regression | accept direct cell ownership |
| Browser mount and viewport state | Mobile lab initializes metadata in an effect; block selection tracks mount with state/effect; Plite layout mirrors resize/scroll snapshots into state | Hydration-gate the mobile lab and lazily initialize the client session; use the existing no-op `useSyncExternalStore` mounted pattern for portals; give viewport listeners/ResizeObserver a controller store consumed by `useSyncExternalStore` | Plite app, selection package, Plite layout | Mount and viewport are external browser facts | Preserve server snapshot `false`, client snapshot `true`, flush behavior, large-jump handling and cleanup | Hydration test, selection portal/focus tests, layout unit tests and Plite Chromium/mobile rows | Snapshot instability can loop; delayed viewport notification can expose stale pages | accept external-store ownership |
| `react/use-memo` test finding | A named `cancelable` factory is passed to `useMemo` although it returns a stateless test object | Delete the hook and use one module-owned immutable cancelable fixture | Input-router contract test | The value has no per-mount state; an inline wrapper would be lint laundering | No runtime adoption | Test remains green; forced `react/use-memo` lint reaches zero | Shared mutation would be unsafe, so freeze/readonly the fixture | accept deletion |
| Registry manual memoization | Eight `React.memo` wrappers, ten `.displayName` assignments, and one stale `ColorPicker` comparator | Remove all eight wrappers; declare named functions so all ten assignments disappear; keep production `react/display-name` enabled | `apps/www/src/registry/components/editor/**` | Compiler owns render memoization; the comparator omits callbacks and DOM props and can retain stale behavior | Update copied source inputs and source tests only; CI regenerates registry artifacts | Registry source check, forced lint, component tests and five standalone browser routes | Removing a wrapper before Compiler coverage could regress hot tables/emoji rows | accept after Compiler source cleanup |
| Registry memo policy | Global Doctor ban is off and nothing prevents reintroduction inside copied registry | Extend `check-plate-schema-adoption.mjs` AST policy to reject React/imported/aliased `memo` calls and custom comparators under authored registry component source | Registry schema-adoption checker + tests | Package primitives can own manual identity contracts; copied React 19 Compiler components cannot | Wire through existing `check-core` consumer; no new parallel checker | Positive/negative/alias/comparator fixtures and `pnpm check` | Text search would miss aliases and create false positives | accept AST guard; keep Doctor rule off |
| Display name and manual-memo preservation rules | Production display-name is on; test override is structural; native preserve rule is on | Keep both policies exactly; do not globally ban package memoization | Root Oxlint config | Names aid debugging; package manual memo can be observable and Compiler must preserve it | Named registry functions replace assignments | Resolved config assertions and lint | Confusing the native preserve rule with a ban would remove valid identities | accept unchanged |
| Package compiler/runtime | tsdown targets React 18 and 40 manifests depend on `react-compiler-runtime` despite a React 19.2 minimum | Compile packages with target `19`; remove all 40 shim dependencies and lockfile entries; update React/DOM from 19.2.4 to current 19.2.8 | tsdown config, manifests, workspace catalog/lockfile, artifact contracts | React 19 has the runtime built in; the backport package is unnecessary | Add a repository contract test for target 19, zero shim manifests/imports, and app compiler flags | Install, manifest contract, affected package builds, packed artifact/import scans, peer/type tests | A hidden emitted import would break consumers only after publish | accept hard cut |
| Next 16.3 app performance | Both apps already use Next 16.3.2, React Compiler, Rust Compiler, Instant Insights and browser-to-terminal; www has Cache Components + Partial Prefetching; Plite is a static export | Keep current version/features; add `typedRoutes` and explicit Turbopack repo root to both. Do not duplicate `useTypeScriptCli` because Next 16.3 defaults it on. Do not enable Cache Components/Partial Prefetching in static-export Plite. | `apps/www/next.config.ts`, `apps/plite/next.config.ts` | Next 16.3.2 is already current. Cache Components officially do not support static export, and Partial Prefetching requires Cache Components. | Preserve `output: 'export'` because Plite owns static browser proof | App config typecheck, direct www Next build without registry generation, Plite static build, dev Browser proof | Cargo-culting every Ellie flag would either duplicate a default or break Plite's deployment model | accept maximal supported features, reject blind parity |
| Docs and release teaching | English/Chinese docs expose the hybrid editor/store type | Teach editor access and store access as separate current APIs; add one breaking core changeset | Core docs/API reference + changeset | Public source must match the hard cut | English and Chinese paired edits; no migration prose in reference docs | Docs parity/API reference/typecheck; changeset check | Missing one locale leaves stale public teaching | accept |

Diagnostic disposition:

| Rule | Production | Tests | Target |
| --- | ---: | ---: | --- |
| `react/immutability` | 35 source fixes | 12 structural render-probe exemptions | Globally enabled; only `test/render-probes/**` is off |
| `react/refs` | 34 source fixes | 6 source fixes | Enabled everywhere |
| `react/set-state-in-effect` | 10 source fixes | 0 | Enabled everywhere |
| `react/use-memo` | 0 | 1 deletion | Enabled everywhere |
| Total | 79 | 19 | 86 source fixes/deletions + 12 honest structural test exemptions |

Current 98-finding owner map:

- `react/immutability` (47): Core editor/store graft (1); Plite React callback and decoration cells (6); input router (10); Android/clipboard/composition/drag/input/keyboard/repair/root runtimes (17); cmdk scheduler (1); render-probe tests (12).
- `react/refs` (40): www perf and chat (3); DnD (1); Plite editable blocks/text/announcer/root selectors (23); selection reconciler test (6); cmdk (4); Yjs (3).
- `react/set-state-in-effect` (10): mobile lab, font color, inline equation, media preview, HTML export, table drag host, DnD attempted drag, Plite viewport, root groups, block-selection mount (one each).
- `react/use-memo` (1): input-router contract fixture.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Lock policy and regression boundaries | Oxlint + tooling | Add exact contract tests for registry memo policy and React 19 compiler/runtime; extract render-probe harness boundary without enabling rules yet | Current 98-finding baseline is reproducible | New guards fail on forbidden fixtures and pass current intentional boundaries | Node contract tests + forced JSON inventory unchanged except moved test paths |
| 2. Hard-cut the hybrid editor API | Core + Best API | Delete `.store` mutation/type/export; update selectors, tests, docs and changeset | Slice 1 green | No production or documented `PlateEditorWithStore`/`useEditor().store` remains | Core typecheck/tests/type tests, API reference/docs parity, forced immutability lint |
| 3. Repair Plite imperative mutation | Plite React | Add semantic controller/runtime transitions; commit callback/options cells; replace editable-text render counter; repair selection-reconciler test refs | Slice 2 green | Plite React has zero unsuppressed immutability/refs findings | Focused unit/contract tests, `pnpm check:plite:dev`, forced lint |
| 4. Repair commit/external-store ref owners | Plite React | Announcer store, pure document epoch, root-group guarded reconciliation | Slice 3 green | No render ref access or mirrored effect remains in these owners | Announcement/root/virtualization tests and forced refs/set-state lint |
| 5. Repair cross-package refs | DnD, Yjs, cmdk | Connector layout attachment, lifecycle-owned attempted drag, committed Yjs options, cmdk registered values and stable queue | Slice 4 green | DnD/Yjs/cmdk findings are zero with unchanged public signatures | Package typechecks/tests, DnD browser proof, forced lint |
| 6. Remove app/registry mirrored effects | Registry + selection + Plite layout/app | Color/equation events, object URL store, direct table cell handle, selection mounted snapshot, viewport store, mobile hydration/lazy session | Slice 5 green | All ten set-state findings are gone without a suppression | Focused specs, app typechecks, Browser routes, Plite Chromium/mobile proof, forced lint |
| 7. Remove registry memo/display assignments | Plate UI registry | Delete eight memo wrappers, stale comparator and ten assignments; name functions; enable AST guard | Slices 1-6 green and app Compiler flags proved | Registry has zero manual memo calls and zero `.displayName` assignments while `react/display-name` passes | Schema-adoption tests, registry source check, component tests, standalone Browser routes |
| 8. Finish React 19 package contract | Tooling + manifests | Compiler target 19, React/DOM 19.2.8, remove 40 shim dependencies, update lockfile | React source lanes green | Zero manifest, lockfile or emitted runtime reference to `react-compiler-runtime` | Install, contract tests, source-first typechecks, selected package builds/artifact scans |
| 9. Finish supported Next 16.3 config | www + Plite apps | Add typed routes and Turbopack root; retain current compiler/cache/insight flags and Plite static-export exclusion | Slice 8 install green | Both configs typecheck/build under their actual deployment models | www direct Next build without registry generation, Plite static build, Browser startup/routes |
| 10. Enable and close | Root lint + all owners | Turn on four rules, remove obsolete off comments/suppressions, lint-fix, run full proof and P1 autoreview | Every focused lane green | Zero unsuppressed diagnostics; only structural render-probe override; all checks/review green | Commands in proof matrix; no generated registry/template changes retained |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Inventory is complete | Forced Oxc JSON reports 98 findings in 38 files: 47/40/10/1 by rule | Final forced inventory has zero diagnostics outside the render-probe structural override | complete |
| Rules are genuinely enabled | Resolved config initially showed all four off | All four rules are errors in `oxlint.config.ts`; `pnpm lint`, type-aware lint and negative contract fixtures pass | complete |
| Core API hard cut is complete | The initial export, type tests, runtime tests and docs referenced `PlateEditorWithStore`/`.store` | Live source has zero stale API references; Core types/tests/docs and barrel generation pass | complete |
| Imperative editor behavior survives | Initial assignments sat in input, IME, clipboard, drag, repair and projection owners | Focused owner suites, 1,086 Plite React tests and `CI=1 pnpm check:plite:dev` pass | complete |
| Ref repairs preserve timing | Initial refs carried text remount, announcement baseline, latest callbacks, abort, connector, overlay and DOM values | Text, editor replacement/live-region, abort, DnD, Yjs and cmdk focused suites pass | complete |
| Effects follow React ownership | Official React guidance separates render/event derivation from external synchronization | Derivation and external-store/resource tests pass; forced rule inventory is zero | complete |
| Table behavior survives without portal lookup | The initial portal target was the selected cell DOM node | Focused table tests and Browser table proof pass without console errors | complete |
| Registry Compiler policy is durable | Eight memo wrappers existed without a registry-specific guard | The AST checker rejects namespace/import aliases, direct `memo` and comparators; all 364 live registry source files pass | complete |
| React 19 runtime contract is real | Initial tsdown target was 18 and 40 manifests contained the shim | Contract reports target 19 and zero manifest/lockfile/emitted shim references; selected builds and artifact checks pass with React 19.2.8 | complete |
| Next performance config is supported | Next 16.3.2 and installed types define the supported matrix | Both configs and app types pass; Plite emits 46 static pages; dev startup reports Compiler, Rust Compiler, Cache Components/Partial Prefetching where supported, and no unknown option | complete |
| User-facing behavior works | Affected app/package surfaces have standalone routes or Plite browser rows | Browser proof passes for www home/navigation, Plite mobile lab, table, DnD and changed editor surfaces; the cached sidebar endpoint returns 200 with nine entries | complete |
| Repository closure is green | Existing CI owners and generated-output restrictions are explicit | `CI=1 pnpm check`, `CI=1 pnpm check:plite:dev`, focused builds/contracts and the second P1 autoreview pass; no registry/template generation was run | complete |

Exact lint command:

```bash
pnpm exec oxlint -A all \
  -D react/immutability \
  -D react/refs \
  -D react/set-state-in-effect \
  -D react/use-memo \
  apps packages --format json
```

Exact package/app closure order:

```bash
pnpm install
pnpm turbo typecheck \
  --filter=./packages/core \
  --filter=./packages/plite-react \
  --filter=./packages/plite-layout \
  --filter=./packages/dnd \
  --filter=./packages/yjs \
  --filter=./packages/selection \
  --filter=./packages/udecode/cmdk
pnpm check:plite:dev
pnpm --filter www typecheck
pnpm --filter plite typecheck
pnpm lint:fix
pnpm check:plite
pnpm check
```

For Next config proof, run `pnpm --filter plite build`. For www, run its
source preparation followed by a direct `next build` command that bypasses the
`build` script's forbidden local `build:registry` pre-step. CI remains the only
owner of registry generation. Start each app's dev server and use the Browser
tool for the routes above before handoff.

Conditional evidence:
- High-risk scenarios: required. IME/composition, Android input, native repair,
  selection, A-to-B-to-A DOM remount, editor replacement announcements, DnD
  abort/start/end, Yjs callback replacement, object URL replacement/revocation,
  table multi-cell drag, viewport resize/scroll, hydration, root replacement,
  and virtualized group monotonicity all have focused proof above.
- External research: required and complete for planning. Official React effect,
  rule, Compiler target/library; official Oxc Compiler support/rule; official
  Next 16.3, Cache Components, Partial Prefetching, static export and upgrade
  sources control the decisions. Installed 16.3.2 types confirm local defaults.
- Issue/PR provenance: not applicable. This is a local audit/plan, not a public
  issue, PR review, or shipped-fix claim.
- Docs/registry/browser/release/behavior-law owners: required. Core API docs and
  changeset, registry source/checker/CI-generated boundary, both app Browser
  lanes, and package artifact/runtime contracts are assigned above.

Findings:
- The scary number is 98, but only 12 are intentional test-harness behavior.
  All 79 production findings and seven ordinary test findings have source
  repairs. No production suppression is needed.
- `react/immutability` exposed one actual public API defect: `useEditor()`
  mutates the editor during render only to graft on a store no production caller
  reads. The correct fix is deletion, not a ref wrapper.
- The Plite runtime findings mostly identify missing mutation ownership, not a
  need for React state. Semantic controller transitions retain the imperative
  engine and make Compiler eligibility honest.
- The `ColorPicker` comparator is a proven correctness defect: it ignores
  callback and DOM props. Removing the wrapper fixes stale behavior and lets the
  Compiler own optimization.
- Every current `set-state-in-effect` finding has a non-suppressive fix. Four
  are render/event derivation, three are external browser resources/stores, one
  is react-dnd lifecycle state, one is client hydration, and the table can
  render directly in its cell owner.
- The lone `use-memo` finding is needless test machinery. Delete the hook;
  wrapping the named factory would be dishonest lint appeasement.
- Next does not need an upgrade: both apps already resolve current 16.3.2.
  Both already enable React Compiler in development and production, including
  the Rust compiler. There is no development-disable branch left to remove.
- Blind Ellie parity is wrong for Plite. Cache Components do not support static
  export, and Partial Prefetching requires Cache Components. Keeping
  `output: 'export'` is the correct proof-app contract.
- React 19 migration is incomplete at the package boundary: target 18 and 40
  runtime-shim manifests contradict the repo's React 19.2 minimum.

Decisions and tradeoffs:
- Prefer one hard public cut over preserving `PlateEditorWithStore`. The hybrid
  has no production consumer and violates the existing editor/store split.
- Keep a structural test exemption only for extracted synchronous render
  probes. Do not exempt all tests and do not add file-by-file directives.
- Use external stores only for actual external systems: commit streams, blob
  URLs, mount/hydration, viewport/ResizeObserver. Ordinary UI state stays in
  render derivation or user events.
- Keep manual memoization legal in packages. The registry ban is narrower
  because copied React 19 Compiler components have a uniform contract.
- Keep `react/display-name` and `react/preserve-manual-memoization` enabled.
  Disable neither to make the cleanup easier.
- Do not add redundant `experimental.useTypeScriptCli: true`; 16.3.2 already
  defaults it on. Add only `typedRoutes` and explicit Turbopack root.
- Do not change Plite from static export merely to claim every Next flag.

Review fixes:
- Red-team replaced the proposed table lint exception with direct cell-owned
  rendering, leaving zero production exceptions.
- Red-team narrowed the immutability test policy from a broad test override to
  an extracted `test/render-probes/**` boundary.
- Best API review promoted the render mutation in `useEditor()` from a local
  refactor to a complete public hard cut with docs, types and changeset.
- The `useMemo(() => cancelable(), [])` idea was rejected as lint laundering;
  the stateless test fixture is module-owned instead.
- Next performance parity was constrained by installed defaults and Plite's
  supported static-export matrix.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad repository searches exceeded the output budget | 4 | Query exact owners one at a time and emit grouped counts rather than raw matches | Resolved; the execution audit and render-revision follow-up use bounded single-owner commands |
| Direct retrieval of the dated Next blog page returned an unsupported representation | 1 | Use official Next index/docs plus the installed 16.3.2 type contract | Resolved; version and feature decisions have official/current evidence |
| Full Plate docs code audit reported unrelated existing schema/example failures | 1 | Audit only the six changed Core API documents, then retain the full audit for final repository proof | Resolved for Slice 2; all six changed documents report zero issues |
| `check:plite:dev` Core package tests inherited a process-global mocked React extension and rejected its raw sentinel descriptor | 1 | Replayed the failures in isolation, repaired the fixture owner, then reran both complete repository lanes | Resolved; `CI=1 pnpm check` and `CI=1 pnpm check:plite:dev` pass |
| Direct www `next build` without registry generation resolves stale imports from `src/__registry__/index.tsx` | 1 | Keep the CI-owned registry generation prohibition; prove source/type/config and runtime locally rather than editing or regenerating registry output | Accepted generated-output boundary; www typecheck, dev startup, homepage/navigation and cached API route pass, while CI retains the exact generated build owner |
| First P1 autoreview found a synchronous helper containing inline `use cache` | 1 | Restore Next's required async helper/route boundary and document the exact `typescript/require-await` exception | Resolved; both lint modes, www typecheck, Next dev compilation, HTTP 200 runtime proof and the second four-chunk P1 review pass |

Verification evidence:
- 2026-08-24 user accepted the exact plan with `ok go`; one-shot execution goal
  created before product edits.
- 2026-08-24 forced Oxlint inventory: 98 diagnostics in 38 files;
  `immutability=47`, `refs=40`, `set-state-in-effect=10`, `use-memo=1`.
- Slice 1 extracted the 12 synchronous mutation probes into
  `packages/plite-react/test/render-probes/**`; the exact structural override
  leaves 86 actionable findings: `immutability=35`, `refs=40`,
  `set-state-in-effect=10`, `use-memo=1`.
- Slice 1 proof: React Compiler contract tests 6/6; affected Plite React tests
  124/124; Plite React source-first typecheck green.
- Slice 2 removed the public hybrid type/export and render-time store graft.
  Core source-first typecheck including type contracts passed; focused Core
  store/selector tests passed 4/4; six changed English/Chinese API documents
  passed targeted source audit; forced actionable inventory fell from 86 to 85.
- Slice 6 removed all remaining mirrored app/registry effects and render refs.
  The exact forced repository inventory is zero outside the structural render
  probes; both app typechecks and 197 focused behavior tests pass.
- Slice 7 removed all eight copied-registry memo wrappers and all ten
  display-name assignments. The AST audit passes all 364 registry source files,
  and the stale color callback regression plus 17 existing focused tests pass.
- Slice 8 targets the React 19 Compiler runtime, removes all 40 authored shim
  dependencies plus transplant regeneration, upgrades 11 exact React/DOM pins,
  and passes install, 18 selected build tasks and seven artifact checks.
- Slice 9 enables typed routes and the monorepo Turbopack root in both apps.
  Both app typechecks pass, and Plite's static build emits all 46 pages. The www
  build reaches the configured Compiler/performance lanes but requires the
  CI-owned registry generation step that local agents may not run.
- Slice 10 enables all four rules and closes the repository lanes. `pnpm lint`
  and type-aware lint pass; `CI=1 pnpm check` passes all 60 package builds,
  typechecks, 3,298 fast tests, 1,549 passing slow tests with 60 intentional
  skips, isolated suites and timing limits. `CI=1 pnpm check:plite:dev` passes
  54 package typechecks, www integration, affected tests, 106 browser-core
  tests, contracts and Chromium smoke.
- Final contract proof passes 23/23 focused tests. `pnpm brl` passes 57/57;
  the registry changelog check reports 76 entries; the Plite static build emits
  46 routes; the platejs package suite passes 60/60 after restoring source-first
  test resolution without a dependency cycle.
- Browser proof passes for the www homepage and typed `/docs` navigation, Plite
  mobile lab state transitions, table, DnD and changed editor surfaces without
  runtime errors. The `/docs` wrapper reaches the stale CI-generated registry
  index boundary. The final sidebar-cache repair compiles under Next 16.3.2 and
  returns HTTP 200 with nine entries; a repeated request completes in 5 ms.
- Best API repair finds no live `PlateEditorWithStore` or editor `.store`
  source references. Current source and docs use `usePlateStore`; only frozen
  audit artifacts and generated public documents retain historical evidence.
- P1 autoreview invocation one found the inline-cache async contract violation.
  After repair and focused proof, invocation two reviewed four chunks and
  reported zero P0/P1 findings with `patch is correct` confidence 0.94.
- Production/test split: 79 production and 19 test diagnostics; 12 test
  immutability findings are synchronous render probes, while the other seven
  test findings receive source fixes.
- Final API evidence: `PlateEditorWithStore` and the `.store` graft are absent
  from live Core source, tests, exports and authored docs; `usePlateStore` owns
  store access.
- Final registry evidence: authored registry source has zero `React.memo`
  wrappers and zero `.displayName` assignments; the AST policy guards aliases
  and custom comparators; the ColorPicker callback regression passes.
- Final package evidence: tsdown Compiler target is `19`; all 40 authored shim
  dependencies and the lockfile/transplant shim are gone; exact React/DOM pins
  are 19.2.8; Compiler plugin remains 1.0.0.
- Final app evidence: both apps run Next 16.3.2 with unconditional React/Rust
  Compiler, Instant Insights, browser logging, typed routes and explicit
  Turbopack roots; www owns Cache Components plus Partial Prefetching, while
  Plite correctly retains static export without those unsupported features.
- Installed Next 16.3.2 types: `useTypeScriptCli` defaults true;
  `partialPrefetching` requires `cacheComponents`.
- Plan checker: final `[autogoal] complete` on 2026-08-24 after all execution,
  Browser and review evidence was recorded.

Final handoff prepared:
- Ownership and final API: React code is fixed at its literal UI, controller,
  external-store, registry, package-compiler or app-config owner. `useEditor()`
  returns only `PlateEditor`; `usePlateStore()` owns the store.
- Public break and adoption: `PlateEditorWithStore` is deleted with no alias.
  Exports, selectors, tests, English/Chinese docs, public type proof, barrels and
  the Core major changeset are complete. No second public API change was needed.
- Runtime/package/docs/browser result: semantic internal Plite transitions,
  external stores for true browser resources, registry memo hard cut, React 19
  package target/no shim and maximal supported Next 16.3 flags all pass their
  focused and broad proof.
- Verification: all four native rules are enabled; the forced inventory is
  zero outside the synchronous render-probe directory; full root and affected
  Plite lanes, builds, artifact checks, Browser proof and P1 review pass.
- Residual boundary: local agents may not generate the www registry index, so
  `/docs` and the exact production www build retain the CI-owned generated-input
  gate. Authored source, typecheck, config, homepage/navigation and API runtime
  proof are green. No commit, push, PR or deployment was performed.

Timeline:
- 2026-08-23T23:31:33.646Z Plate Plan created.
- 2026-08-24 Complete rule inventory, official research and literal owners read.
- 2026-08-24 Best API hard cut, diagnostic dispositions, execution slices and
  proof matrix resolved.
- 2026-08-24 Red-team removed the last proposed production exception and
  prepared the user handoff.
- 2026-08-24 User accepted the plan; one-shot execution goal started at Slice 1.
- 2026-08-24 Slice 1 locked registry, React 19, Next flag, and exact lint
  boundaries; extracted render probes without behavior changes; entered Slice 2.
- 2026-08-24 Slice 2 hard-cut the editor/store hybrid, adopted types, tests,
  English/Chinese docs and a Core major changeset; entered Slice 3.
- 2026-08-24 Slice 3 moved Plite imperative writes behind controller/runtime
  transitions, replaced render-written identities with pure keys and committed
  cells, captured test refs outside JSX, passed typecheck and 1,086 package
  tests, and reduced the forced inventory to 28; entered Slice 4.
- 2026-08-24 Slice 4 replaced render refs and mirrored reconciliation with a
  commit announcement store, pure relevant-commit epochs, and guarded root-group
  state; passed typecheck and 54 focused tests, reducing the inventory to 22;
  entered Slice 5.
- 2026-08-24 Slice 5 moved DnD attempt/connector timing into its lifecycle,
  committed Yjs callbacks before refresh, and made cmdk values/queue explicit;
  all package typechecks and 258 tests pass, reducing the inventory to 12;
  entered Slice 6.
- 2026-08-24 Slice 6 moved viewport, mount, mobile session and object URL facts
  to external-store/resource owners; made table/color/equation state direct;
  removed app/chat render refs; passed both app typechecks and 197 focused
  tests; the forced four-rule inventory reached zero; entered Slice 7.
- 2026-08-24 Slice 7 replaced copied manual memo wrappers with named Compiler
  components, added stale-callback proof, passed the 364-file AST policy, www
  typecheck, 18 focused tests and changelog generation/check; entered Slice 8.
- 2026-08-24 Slice 8 switched package compilation to React 19, removed all 40
  shim dependencies and transplant reintroduction, upgraded exact React/DOM to
  19.2.8, refreshed install/lock, and passed selected builds/artifacts; entered
  Slice 9.
- 2026-08-24 Slice 9 added typed routes and explicit Turbopack roots, retained
  every supported Next 16.3 performance feature, passed both app typechecks and
  the 46-page Plite static build, and recorded the CI-owned www build boundary;
  entered Slice 10.
- 2026-08-24 Slice 10 passed full root and affected Plite checks, Browser and
  artifact proof. P1 review found and closed the inline `use cache` async defect;
  the second four-chunk review returned clean and the handoff was prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final handoff; all ten slices complete |
| Where am I going? | No remaining local execution step; CI owns registry generation and exact www production build proof |
| What is the goal? | Close all 98 findings, enforce the four rules, finish React 19/Next contracts, and pass focused/browser/repository/P1 review gates. |
| What have I learned? | See Findings |
| What have I done? | Closed all 98 findings, completed React 19/Next 16.3 contracts, passed repository/browser/review proof, and prepared the handoff |

Open risks:
- CI still owns registry generation and therefore the exact www production
  build and `/docs` wrapper proof. The local failure is confined to stale
  generated-index imports; authored source, strict types, config, homepage,
  typed navigation and the cached API runtime are green.
- No remote CI or deployment receipt exists because neither was authorized.
