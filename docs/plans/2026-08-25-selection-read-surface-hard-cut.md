# Selection read surface hard cut

Objective:
Remove the parallel block-selection authority and tagged selection payloads from
ordinary editor reads. Plite owns selection state; `selection()` returns
`Range | null`, `selection.ranges()` is the plural projection, and
`selection.nodes()` is exact node-selection membership.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-selection-read-surface-hard-cut.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- `selection()` is typed and implemented as a frozen plain `Range | null` on
  editor state, direct reads, root views, and active update facades.
- `selection.ranges()` is the only generic plural projection, and
  `selection.nodes()` returns entries only for exact `NodeSelection` state.
- Ordinary public callers need no selection-kind guard to read a range.
- `@platejs/selection`, `BlockSelectionPlugin`, `SelectionArea`, the
  `blockSelection` namespace, and compatibility aliases are absent from live
  authored source.
- Node/custom mapping, persistence, history, marks, slices, DOM projection,
  table behavior, paste, typing, undo, and child-root behavior stay green.
- Node-selection UI composes Plite's selection authority without owning
  semantic selection state.
- Doctrine, docs, generated registry output, changesets, and final proof match
  the cut; the goal checker passes.

Verification surface:
- Owner-scoped source sweeps for the deleted package, plugin, namespace,
  marquee abstraction, representative accessors, tagged ordinary reads, and
  compatibility aliases.
- Focused Plite, DOM, React, history, table, collaboration, Plate adopter, and
  NodeSelection UI type/tests.
- `pnpm check:plite:dev`, exact child-root Chromium replay, focused
  NodeSelection Browser and Playwright proof, registry generation, `pnpm brl`,
  final `pnpm check:plite`, bounded P1 review attempts, and `check-complete`.

Constraints:
- The user accepted immediate execution with `ok go full cut`; do not pause for
  another planning approval.
- Keep one selection authority in Plite core. A React or registry plugin may
  register rendering/injection only; it cannot own selection state or commands.
- Expose exactly one normal singular read and one generic plural read:
  `selection()` and `selection.ranges()`.
- Keep `selection.nodes()` because exact node membership is a distinct query,
  not another generic selection value.
- Do not add `selection.value()`, `selection.range()`, `primaryRange()`,
  `replacementRange()`, deprecated aliases, shims, or a renamed block-selection
  namespace.
- Preserve tagged values only in explicit construction, write, extension,
  persistence, and owner-internal runtime contracts that require semantic
  identity. Ordinary reads never return those carriers.
- Preserve unrelated shared-checkout changes. Do not commit or push.

Boundaries:
- In scope: Plite selection state/protocol/facades; Plite DOM, React, history,
  layout, hyperscript, and Yjs; Plate packages and examples; the obsolete
  selection package; registry NodeSelection UI; docs, doctrine, barrels,
  generated registry output, changesets, and behavior proof.
- Canonical owner: `@platejs/plite` owns text, node, and installed custom
  selection state. Selection-kind owners provide private mapping, codec, marks,
  slices, ranges, and DOM projection where their laws require it.
- UI owner: `apps/www/src/registry/components/editor/node-selection.tsx` owns
  marquee interaction and selected-node rendering through core
  `selection.setNodes()` / `selection.nodes()`.
- Non-goals: erase tagged persistence or explicit custom-kind authoring,
  aggregate disjoint nodes into a false range, change table UX, edit CI-owned
  templates manually, claim performance, commit, or push.
- Generated templates may retain old bytes until CI regeneration; authored
  registry source and current generated registry artifacts are the local proof
  boundary.

Output budget strategy:
- Read literal owners first, use counted source sweeps for breadth, and retain
  exact command receipts instead of streaming large logs.

Blocked condition:
- Block only if a hard selection law requires a second semantic authority or a
  third ordinary public read, or if the final strict gate proves an unrelated
  repository failure that cannot be isolated honestly.

Plite Plan state:
- status: complete
- phase: handoff complete
- next: none
- handoff: implementation, strict proof, and receipt complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full package/plugin/namespace cut, one core authority, clean singular/plural reads, exact nodes, aggressive architecture feedback, no commit/push |
| Active goal and plan verified | yes | The active measurable goal names this plan and the `Range | null` threshold |
| Current owners read | yes | Root/Plite Vision, selection interfaces/protocol/state/view, DOM/React/history/table owners, registry NodeSelection UI, public docs, and generated inputs |
| Maximum-value hard cut resolved | yes | Delete `@platejs/selection`, `BlockSelectionPlugin`, `SelectionArea`, and block-selection state; retain only Plite semantic authority plus an app-owned UI composition adapter |
| Public API target resolved | yes | `selection(): Range | null`, `selection.ranges(): readonly Range[]`, and exact `selection.nodes()` |
| Execution authority resolved | yes | User said `ok go full cut`; shared checkout may change, but commit/push remain unauthorized |

Work Checklist:
- [x] Capture every explicit API, package, plugin, namespace, authority, UI,
  doctrine, verification, and git constraint.
- [x] Complete the bounded read/write/runtime/feature/package caller census.
- [x] Delete the selection package and parallel block-selection authority.
- [x] Split ordinary range projection from exact semantic state in Plite core.
- [x] Migrate Plite runtime owners and every live Plate/example caller without
  compatibility APIs.
- [x] Replace block selection UI with an app-owned NodeSelection composition
  that calls core `setNodes()` and `nodes()`.
- [x] Repair public hooks, docs, doctrine, changesets, generated registry
  output, and barrels.
- [x] Run focused package, child-root, NodeSelection, registry, source-audit,
  development-gate, and review-attempt proof.
- [x] Freeze product writes for the final strict gate and record the bounded
  review limitation without claiming a clean review.
- [x] Prepare the exact handoff and final goal-checker command.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary readiness | yes | `pnpm check:plite` passed in 116418ms after a fresh 79-batch Chromium proof passed 710 tests |
| Fresh source evidence | yes | Final authored-source sweeps find no deleted package/plugin/namespace or rejected read alias in live source |
| Best API review | yes | The accepted target follows the maximum-value hard-cut gate: one Plite authority, one singular range read, one plural projection, and exact node membership |
| Conditional browser risk | yes | Exact child-root replay passed five fresh Chromium runs; NodeSelection manual Browser drag and focused Playwright passed |
| Generated and doctrine parity | yes | Registry build and barrels passed; source/mirror doctrine contains the repo-wide hard-cut counterfactual and canonical-read law |
| P1 autoreview | yes | Three mandatory helper invocations exhausted the repository cap before model execution; no clean-review claim is made and manual source audit found no verified P0/P1 defect |
| Handoff prepared | yes | Ownership, public breaks, exact proof, review boundary, remaining risk, and no-commit/no-push state are recorded below |
| Goal plan complete | yes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-selection-read-surface-hard-cut.md` passed on final plan bytes |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Literal semantic/UI/package owners and all live callers were inventoried | Decide |
| Decide | completed | The hard-cut target deletes the parallel authority and keeps only hard-law internal carriers | Implement |
| Implement | completed | Core facade, runtime owners, packages, examples, registry UI, docs, doctrine, changesets, generated output, and barrels migrated | Prove |
| Focused proof | completed | Package/dev gates, exact child-root replay, NodeSelection unit/Browser/Playwright, registry, source sweeps, and diff checks passed | Strict proof |
| Strict proof | completed | Fresh Chromium passed 710/718 with 8 intentional skips across 79/79 batches; strict Plite passed in 116418ms | Handoff |
| Handoff | completed | Exact review limitation, checker receipt, and no-commit/no-push boundary recorded | None |

Decision brief:
- Outcome: one semantic selection authority in Plite core. Plate UI only renders
  and controls that state.
- Public shape: `selection()` returns a clean range; `ranges()` returns every
  projected range; `nodes()` returns exact node membership.
- Strongest cut: delete the package, plugin, namespace, `SelectionArea`, public
  tagged read, and representative/replacement aliases instead of moving or
  renaming them.
- Hard-law remainder: exact tagged carriers still exist for explicit writes,
  codecs, custom selection kinds, mapping, history, marks, slices, and native
  DOM projection. They are not returned by the ordinary read facade.

Decision ledger:
| Surface | Current before cut | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Selection package | Package bundled block selection, block menu, and cursor UI | Delete package; move surviving independent UI to literal owners | Plite core, cursor, block menu, registry app | The package had no coherent authority after core owned selection | Remove manifest/lock/export/dependency/caller references | Zero live authored imports; package directory absent; package gates | Generated templates are CI-owned | cut |
| Block selection state | `BlockSelectionPlugin` store/API duplicated selected-node state | Use core `NodeSelection` through `setNodes()` and `nodes()` | Plite | Two authorities can diverge and force synchronization boilerplate | Migrate menus, DnD, table, AI, overlays, and examples | Node-selection, table, typing, paste, undo, Chromium | Wrong exact membership could delete unintended nodes | cut |
| Selection marquee | Generic `SelectionArea` abstraction plus plugin lifecycle | Inline the concrete pointer gesture in registry NodeSelection UI | Registry app | One current UI job does not justify a public/package abstraction | Replace copied UI and docs | Unit, manual Browser, focused Playwright | Editable may register after the effect | inline |
| Singular read | Tagged `text | node | custom` carrier forced kind guards | Return frozen Slate-shaped `Range | null` | Plite public state facade | Storage protocol is not the common caller job | Migrate all ordinary callers and public hook | Type/tests and source sweep | Node/custom representative ordering must be deterministic | rearchitect |
| Plural read | Kind protocol projects one or many ranges | Keep `selection.ranges()` | Plite selection protocol | Lossless multi-range projection is an independent job | Preserve runtime owners and docs | Protocol/table/browser tests | Ordering/root metadata drift | keep |
| Exact nodes | Plugin selected-key store or tagged-state narrowing | Keep `selection.nodes()` exact and empty for non-node selections | Plite query facade | A range cannot encode disjoint exact node membership | Migrate UI and commands | Exact membership, child roots, paste/delete/undo | Treating range intersection as membership would over-select | keep |
| Tagged carrier | Exposed through the ordinary callable read | Keep behind core/installed-kind owners and explicit write/persistence contracts | Plite runtime and selection-kind owner | Mapping, serialization, marks, slices, history, and DOM are real hard-law jobs | Internal owners read exact state directly | Core/history/DOM/React/Yjs/table suites | Leaking it reintroduces public guards | move |
| Representative aliases | `primaryRange` / `replacementRange` encoded generic policy | Delete with no alias | Literal DOM/input owner when needed | The normal answer is already `selection()`; replacement had no independent behavior | Remove declarations, hooks, callers, docs | Zero-symbol sweeps and browser proof | Hidden input behavior could regress | cut |
| NodeSelection UI plugin | Semantic plugin plus UI had one name | Retain one registry-local render/injection descriptor named `nodeSelectionUi`; no semantic state/API | Registry app | Plate render/injection registration is a composition job, not selection authority | `NodeSelectionKit` composes core API | Unit and Browser proof with/without DnD | Calling it semantic ownership would be false | keep UI only |

Execution slices:
| Slice | Owner | Exit | Proof |
| --- | --- | --- | --- |
| Core authority | Plite | Public read is `Range | null`; exact state has one internal owner | Selection protocol/state/view/type contracts |
| Runtime adoption | Plite DOM/React/history/Yjs/table | No runtime law reads a lossy public projection when exact state is required | Package and browser contracts |
| Package hard cut | Plate packages/registry | Selection package, plugin, namespace, and area are gone from live source | Manifest/lock/source sweeps, type/tests, registry build |
| UI composition | Registry app | Marquee writes and reads Plite node selection directly | Unit, Browser, Playwright |
| Teaching and release | Vision/Best API/docs/changesets | Current call shape and aggressive deletion law are taught once | Source/mirror sweep, docs/API/registry proof |
| Closure | Plite/browser/review | Strict gate and goal checker have exact receipts; review boundary is explicit | Fresh 79-batch Chromium, `pnpm check:plite`, and `check-complete.mjs` |

Proof matrix:
| Claim | Evidence | Status |
| --- | --- | --- |
| One semantic authority | Package and `BlockSelectionPlugin` deleted; UI uses `editor.update.selection.setNodes` and `editor.read.selection.nodes` | passed |
| Clean singular read | `EditorStateSelectionApi` callable is `Range | null`; public hook returns no `kind` or marks | passed |
| Multi-selection preserved | `getSelectionRanges` projects node paths and installed custom ranges; table/runtime tests stay green | passed |
| Exact nodes preserved | `selection.nodes()` reads exact `NodeSelection` state only and canonical paths remain sorted/deduplicated | passed |
| Internal laws preserved | Core implicit transforms, codecs, history, React input, Yjs, table, AI, and layout read exact owner state where required | passed |
| Child roots preserved | View-scoped internal selection owner replaced raw global reads; exact regression passed five fresh Chromium runs | passed |
| NodeSelection UI works | Mounted editable subscription fixed the registration race; unit, manual Browser drag, and focused Playwright passed | passed |
| No compatibility sludge | Live authored source has no deleted package/plugin/namespace/area or representative/replacement accessor | passed |

Conditional evidence:
- Native DOM projection remains private to the selection-kind `domRange`
  protocol. It is not a third public read.
- Exact custom selection construction and persistence remain public only where
  extension authors or serialized data require them.
- Benchmark is not applicable because no performance claim is made.
- Public issue/PR provenance is not applicable because this is user-directed
  local architecture work.
- CI regenerates templates; local product code never hand-edits them.

Findings:
- The old package was a junk drawer, not an owner. Deleting it clarifies the
  system more than renaming its namespace ever could.
- `NodeSelection` belongs in the editor model because exact selected paths
  affect commands, slices, history, collaboration, and input behavior.
- `SelectionArea` had one surviving job. Inlining its pointer behavior removed
  a public abstraction and a third-party lifecycle without losing capability.
- A tagged internal carrier can be correct storage and still be a bad public
  read. The public read now returns the domain value callers expect.
- The UI still uses a Plate descriptor because render wrappers and injected DOM
  props require composition registration. That descriptor owns no selection
  state, namespace, or command API.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
| --- | ---: | --- | --- |
| TypeScript 7 AST root exposed only version APIs | 3 | Use Babel parser plus scope analysis | Public guard census completed without regex-only claims |
| Initial strict Chromium child-root row failed after raw live-selection reads | 1 | Restore the view-scoped internal selection owner | Exact row passed five fresh retry-free Chromium runs |
| Final strict exposed `{ kind: 'text' }` through the Browser handle read | 1 | Split clean `getSelection` from explicit internal `getModelSelection` and make `SelectionSnapshot` range-shaped | Focused types, handle tests, Browser tests, and the exact Chromium row passed |
| Public hook test used an invalid expanded selection with marks | 1 | Use a legal collapsed marked selection | Hook projection contract passed |
| Browser shell REPL lacked a trusted browser service | 1 | Use the persistent MCP Node REPL | Browser inspection and drag proof completed |
| `127.0.0.1` blocked current dev chunks cross-origin | 1 | Navigate to `localhost` | Current bundle registered pointer listeners |
| NodeSelection marquee effect ran before editable registration | 1 | Subscribe with `useEditorEditableElement` | Pointer listeners appeared; exact drag selected paths `0` and `1` |
| Playwright config webServer exited 254 | 1 | Start the owned dev server and set `PLAYWRIGHT_BASE_URL` | Focused Chromium test passed 1/1 |
| First repaired handle assertions assumed an aggregate node range and omitted named-root metadata | 2 | Assert the documented first canonical node range and explicit named-root points | Browser handle contract passed 12/12 |
| Browser expectation cleanup removed tags from exact internal commit traces | 1 | Restore tags only on owner-internal trace assertions | Richtext and mentions trace rows passed while ordinary reads remained tag-free |
| Clean child-root reads exposed stale assertions that omitted point `root` metadata | 2 batches | Audit exact editable-void and synced-root expectations, then replay focused rows before the full matrix | Focused rows passed 2/2 and 3/3; the fresh 79-batch run passed |
| Managed browser runner rejected `--repeat-each=5` | 1 | Keep the exact focused run and require the full managed strict rerun | Focused Chromium row passed; full rerun is the closure gate |
| P1 helper saw an unrelated secret-like deleted generated file | 1 | Build an exact temporary review checkout without that unrelated deletion | Secret scan passed in the scoped checkout |
| Temporary review patch left a large staged file untracked | 1 | Apply the patch with index state | File ownership became exact |
| Final P1 helper scope exceeded eight bounded passes | 1 | Stop at the repository's three-invocation cap and perform a manual source audit | No model verdict; no clean-review claim |

Verification evidence:
- `pnpm check:plite:dev` passed in 156087ms, covering 53 package typechecks,
  bounded www integration, 31 package suites, browser core, contracts, and
  Chromium smoke.
- The first final strict attempt passed typechecks, package tests, contracts,
  and Chromium batches 1-56, then batch 57 proved that the Browser handle still
  returned a tagged text selection. That failure was treated as a product/API
  defect, not waived as a stale test.
- The exact child-root clipboard regression passed five fresh retry-free
  Chromium runs after restoring view-scoped exact selection reads.
- `pnpm exec ultracite check
  apps/www/src/registry/components/editor/node-selection.tsx` passed.
- `pnpm exec bun test
  apps/www/src/registry/components/editor/node-selection.spec.tsx` passed 2/2.
- Browser proof on `http://localhost:3110` observed current pointer listeners;
  a held marquee selected paths `0` and `1` with zero native ranges, and release
  kept both paths, removed the marquee, and focused the editor.
- Focused Playwright NodeSelection proof passed 1/1 in Chromium in 3.7s.
- After the Browser-handle repair, Browser and Plite React source-first
  typechecks passed; the handle contract passed 12/12; Browser core/DOM passed
  117 tests; and the exact failed Chromium row passed 1/1.
- The Browser proof API, action inputs, scenario validators, and ordinary
  assertions use plain `SelectionSnapshot` ranges. Only explicit internal
  kernel/commit traces retain tagged semantic state.
- A fresh `pnpm --filter plite test:plite-browser:chromium` passed 710 tests,
  skipped 8 intentional rows, and completed all 79 bounded batches in 408.4s.
- Final `pnpm check:plite` passed in 116418ms. Its receipt was: typecheck
  12484ms, package tests 72134ms, contracts 29474ms, and Chromium 2326ms by
  reusing the matching complete 710-pass/8-skip proof.
- `pnpm --filter www build:registry`, `pnpm brl`, and `git diff --check` passed.
- Docs, API reference, generated registry, source/mirror parity, affected
  package tests, and public type proof passed during the implementation loop.
- Live authored-source sweeps report zero `@platejs/selection`,
  `BlockSelectionPlugin`, `SelectionArea`, `blockSelection`, `useBlockSelected`,
  `useIsSelecting`, `primaryRange`, `replacementRange`, or public
  `selection.range()` references. Historical changelogs/plans and CI-owned
  templates are excluded from this current-source claim.
- `packages/selection` does not exist and its workspace dependency is absent.
- P1 autoreview produced no model verdict: the mandatory three-invocation cap
  was exhausted by secret-scan/scope setup and the helper's eight-pass bound.
  Manual inspection of the public facade, internal exact-state owners, root
  views, NodeSelection UI, doctrine, and source sweeps found no verified P0/P1
  defect. This is evidence, not a clean autoreview verdict.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-25-selection-read-surface-hard-cut.md` passed on final plan
  bytes.

Final handoff prepared:
- Plite is the only semantic selection authority.
- `selection()` returns `Range | null`; `ranges()` is generic plural;
  `nodes()` is exact membership.
- The selection package, block-selection plugin/namespace, and `SelectionArea`
  are deleted without aliases.
- NodeSelection registry UI is composition only and uses core editor APIs.
- Strict, browser, generated, source-audit, and checker receipts are recorded;
  the P1 model-review limitation is explicit.
- No commit or push was performed.

Timeline:
- 2026-08-25 API target corrected from tagged canonical reads to a clean public
  range projection.
- 2026-08-25 Full selection package/plugin/namespace cut accepted and executed.
- 2026-08-25 Runtime callers, UI, docs, doctrine, changesets, generated output,
  and focused proof completed.
- 2026-08-25 Final strict proof and goal checker recorded.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Handoff only |
| What is the goal? | One Plite selection authority with clean singular/plural reads and exact nodes |
| What have I learned? | Tagged state is required internally but is API leakage on ordinary reads; the old package and SelectionArea had no independent authority |
| What have I done? | Deleted the parallel authority, cut the public read, migrated all owners, fixed the UI registration race, and completed strict proof |

Open risks:
- P1 autoreview did not reach model execution before the repository's mandatory
  three-invocation cap. The final handoff therefore does not claim a clean P1
  review.
- CI-owned templates still contain historical generated selection-package
  bytes until their owning CI regeneration. Live authored source and current
  registry output are clean; templates were not edited by hand.
