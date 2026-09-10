# Wordgard Diff Plite Proof Closure

Objective:
Close the three material Wordgard-derived Plite proof gaps; done when exact
history, soft-break geometry, and DOM-boundary contracts pass focused and
strict Plite proof, including the minimal Plite runtime repair required by the
exact Chromium regression, without changing public API.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-wordgard-diff-proof-closure.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:

- runtime repair: `patch` owns the one proven browser-visible Plite defect
- browser proof: Browser and the focused `apps/plite` Chromium row certify the
  rendered behavior
- release artifact: add one `plitejs` patch changeset for the user-visible fix

Linked plans:

- None.

Mode:

- `standard`: three directly related Plite proof owners, with no unresolved API
  or performance design

Completion threshold:

- Binary readiness: every current claim cites live source; each invariant has
  one owner, one test location, and one focused command; donor mechanisms and
  Plate-only cases have explicit dispositions; the smallest durable runtime
  fix passes package, Chromium, live Browser, affected, and strict Plite proof;
  no public break, benchmark claim, or compatibility path remains;
  `check-complete` passes.

Verification surface:

- `packages/plitejs/test/history/integrity-contract.ts`
- `packages/plitejs/test/dom/bridge.ts`
- `packages/plitejs/test/react/surface-contract.tsx`
- `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts`
- focused Plite package tests, focused Chromium proof, `pnpm check:plite:dev`,
  and `pnpm check:plite`

Constraints:

- The user accepted this exact plan with `go` on 2026-09-02.
- The user clarified that `go` includes every in-scope repair needed to finish;
  do not pause for another authorization checkpoint.
- The exact behavior proof is already red. Repair the durable Plite owner, then
  replay the same case through every required gate.
- No new public API, alias, runtime shim, packed range store, Widget class,
  node convenience getter, or Plate adapter.
- Assert Plite's path/point and React DOM contracts. Do not translate
  Wordgard's integer positions, tiles, plots, or widget objects into local API.

Boundaries:

- In scope: one history integration contract, one DOM bridge contract group,
  one Chromium soft-break geometry row, the minimal Plite React/DOM projection
  repair it requires, one package changeset, and focused/full Plite proof.
- Source owners: Plite transaction/history, DOM bridge, React-owned void shell,
  React text rendering/DOM geometry, and `apps/plite` browser proof.
- Non-goals: Wordgard PointSet/RangeSet/MultiSet adoption, decoration or anchor
  redesign, active-mark cursor paint, selection API changes, Plate table/list
  work, cross-browser release claims, or any unrelated product implementation.
- Direct Plate/collaboration adoption owners: N/A. The repair changes only the
  internal DOM projection of a pre-existing Plite text contract.

Output budget strategy:

- Keep the repair inside the existing Plite text-rendering owner and its closest
  package/browser proofs. Reuse current fixtures and helpers. Run focused rows
  before the affected and strict Plite gates.

Blocked condition:

- Block only for an external condition that prevents the same exact case from
  being repaired or replayed after all in-scope alternatives are exhausted.
- The prior product-code boundary is superseded by the user's explicit finish
  instruction.

Plite Plan state:

- status: complete
- phase: execution closure
- next: none
- handoff: The three Wordgard-derived contracts, the trailing-newline runtime
  repair, the logical browser-text assertion, and the proof-monitor correction
  pass focused, affected, live Browser, and strict Plite proof

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Latest Wordgard diff, test harvest, and Plite-versus-Plate routing are recorded in `docs/plans/2026-09-02-wordgard-latest-diff-audit.md` |
| Active goal and plan verified | yes | User accepted this exact plan; a new one-shot goal targets History, DOM/React, and Chromium proof |
| Current owners read | yes | History, DOM bridge, React shell, browser rich-text, Anchor, decoration, Comments, table, and list owners cited below |
| Best API target resolved | no | N/A: every accepted slice adds proof to an existing call shape; no reusable public API changes |
| Runtime scale applicability resolved | yes | The repair adds one suffix check and at most one rendering-only character to the final text child; no index, scan, cache, or repeated traversal is introduced |
| Pre-acceptance Benchmark probe selected | no | N/A: no cache, index, store, scheduler, projection, geometry algorithm, repeated work, or performance claim changes |
| Mode and execution boundary resolved | yes | The user explicitly expanded execution to the minimal runtime repair required for full closure |

Work Checklist:

- [x] Skill analysis complete: `plite-plan` owns accepted substrate proof
      execution, `patch` owns the proven runtime defect, `autogoal` owns
      lifecycle, `tdd` keeps assertions on public behavior, Browser owns the
      live app check, and changeset policy owns the two published-package
      artifacts. No API, Benchmark, docs, or Plate implementation worker
      applies.
- [x] Re-read current History, DOM/React, and browser fixtures before editing.
- [x] Added the extender-plus-history undo/redo contract; focused proof passes
      12/12 and asserts both intermediate document and selection state.
- [x] Added the nested-wrapper plus inline-void zero-width-anchor round-trip
      contract; the two focused React files pass 66/66.
- [x] Added the consecutive/trailing soft-break Chromium contract and retained
      its exact red receipt: the inferred trailing-line center was
      `270.171875`, outside the editor bottom at `259.171875`.
- [x] Repaired final-text trailing-newline projection for plain and decorated
      text, preserved logical offsets with `data-plite-length`, and added the
      closest package-level contract plus the `plitejs` changeset.
- [x] Corrected the shared browser block-text helper to ignore rendering-only
      characters and added the `@platejs/test` changeset.
- [x] Replayed both soft-break rows together and the new row in five forced,
      retry-free Chromium runs; every run passed.
- [x] Replayed `/examples/plite/richtext` in Browser: the trailing fourth line
      is inside the editor, clicking maps to offset 12, typing maps to 16, and
      the console has no errors.
- [x] Ran `pnpm check:plite:dev` and `pnpm check:plite`; both passed.
- [x] Completed scoped formatting review, diff hygiene, audit regeneration, and
      harvest validation without changing product code.
- [x] Ran the goal checker after the browser row and both Plite gates passed.

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, test, and behavior claims cite live source.
- [x] Reusable public call shape is N/A because no public shape changes.
- [x] Scale proof is resolved by inspection: the runtime change is one bounded
      final-child check, one suffix check, and one rendering-only character.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus view presentation is classified: tests observe the
      current editor state and DOM bridge; no parallel state is introduced.
- [x] Public breaks and private bridges are N/A: the plan creates neither.
- [x] Execution slices and focused proof are concrete.
- [x] Browser and external-audit evidence are resolved; release artifacts cover
      both published packages; docs, collaboration, and performance work are
      inapplicable with reasons below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Decision ledger and execution slices below are complete |
| Fresh source evidence | yes | Recheck decision-changing current claims | Frozen Wordgard `b5ad0d0`; live Plite/Plate owners cited below |
| Best API review | no | No public shape change | Current APIs stay intact; donor mechanisms are rejected |
| Pre-acceptance scale proof | no | Constant bounded projection change | One suffix check and one rendering-only character apply only to trailing-newline text; no benchmark claim |
| Production scale rerun contract | yes | Rerun package and strict Plite gates | Focused owner proof plus `pnpm check:plite` must pass |
| Conditional risk and adoption | yes | Resolve browser and donor risks | Three failure modes and browser route recorded below |
| Verification recorded | yes | Run focused History, DOM/React, Chromium, affected, and strict gates | History 12/12; focused React 66/66; forced Chromium 5/5; affected gate passed; strict Chromium 711 passed and 8 skipped |
| Handoff prepared | yes | Record actual ownership, proof, risks, and order | Runtime, assertion-helper, and proof-monitor owners plus final proof are recorded below |
| P1 autoreview | yes | Review the final non-trivial diff at P1 unless the checkout is `next`, where repo law forbids Autoreview | Checkout is `next`; scoped manual review and Ultracite passed with no actionable finding |
| Goal plan complete | yes | Run checker only after every required proof is green | Completion checker passed after all focused and broad proof was green |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current Wordgard and local owners mapped | Decide |
| Decide | complete | Three proof adaptations; all mechanisms rejected | Prove and hand off |
| Prove and hand off | complete | Slices, risks, and commands fixed | User acceptance |
| Accepted execution | complete | History, DOM/React, runtime, helper, and monitor repairs are green | Close |
| Execution closure | complete | Focused Chromium, Browser, affected, and strict gates passed | None |

Decision brief:

- outcome: Keep all three regression contracts and repair the durable Plite
  owner until the exact Chromium row is green; never weaken the assertion.
- chosen shape: Existing Plite history, DOM bridge, React shell, and browser
  APIs remain the tested authorities.
- strongest rejected alternative: Import Wordgard's PointSet, RangeSet,
  MultiSet, Widget, or linear-position machinery.
- consequence: We gain high-signal proof and correct trailing-line behavior
  without a second position model or another runtime layer.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Transaction extension plus history | Command interception can extend one transaction at `packages/plitejs/test/extension-methods-contract.ts:167`; one outer transaction is one undo unit at `packages/plitejs/test/history/integrity-contract.ts:130` | One test extends an insert with a second document edit, isolates adjacent batches, then proves two undos and two redos | Plite History | The laws exist separately; their composition is unasserted | No consumer change | Focused History test plus strict Plite check | A test may accidentally exercise two transactions instead of one extended transaction | keep |
| Consecutive soft-break geometry | Chromium proves one empty soft-break line is measurable and editable at `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:915` | Two consecutive breaks plus one trailing break allocate distinct physical lines and map clicks to offsets 6 and 18 | Plite React text rendering, DOM geometry, and `apps/plite` browser proof | Chrome needs one rendering-only newline after a model-ending newline | Internal DOM projection adds the character only to the final text child; all offset readers use the logical length | Focused package, forced Chromium, Browser, affected, and strict proof | Decorated text, DOM/model offsets, and native editing could diverge | repaired and proven |
| Nested wrapper and inline-void DOM points | Decorated text slices map at `packages/plitejs/test/dom/bridge.ts:1579`; React owns the inline-void zero-width anchor at `packages/plitejs/test/react/surface-contract.tsx:2066` | Compose actual nested custom wrappers and an inline-void anchor with `assertPlitePoint`/`assertDOMPoint` round trips | Plite DOM and React | Separate tests did not prove wrapper/anchor composition | No public surface change | Focused React surface contract | Asserting incidental markup would freeze implementation detail; assert public DOM APIs and only required shell markers | keep |
| Packed point/range/layer stores | Plite structural Anchor and node-keyed decoration sources map overlapping ranges at `packages/plitejs/src/core/anchor.ts:38` and `packages/plitejs/test/react/decoration-manager-contract.test.ts:24` | Keep current owners; add no container | Plite core and React | Wordgard's containers use linear document offsets; MultiSet is unconsumed, untested, and its `goto` loop ignores the requested position at `../wordgard/src/editor/decoration.ts:1119` | None | Existing Anchor, decoration, and Plate Comments tests | Copying it would add a second position model and a broken speculative abstraction | cut |
| Widget and node-shape conveniences | React void/component shells and compiled schema own view shape and inline/block semantics | Keep current owners | Plite React and schema | Wordgard's Widget class and node getters collapse responsibilities that Plite deliberately separates | None | Existing React surface and schema contracts | A convenience copy would create competing ownership | cut |
| Table and nested-list donor cases | Plate scans every logical table slot at `packages/platejs/src/features/table/lib/internal/grid.ts:236`; Plate lists use flat item properties at `packages/platejs/src/features/list/lib/BaseListPlugin.ts:700` | Keep Plate behavior and representation | Plate Table and List | Table cases are covered; Wordgard's multi-block nested list item has no Plate-model job | None | Current table mutation/selection tests | Inventing a nested-list container would be worse than the missing donor test | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. History composition | `packages/plitejs/test/history/integrity-contract.ts` | Add one extension-added edit across explicit batch boundaries; assert intermediate document and selection through undo/redo | User accepts this plan; frozen owner still matches | Red test is explained or passes without production changes | `pnpm --filter plitejs exec bun test --preload ../../config/plite-source-test-setup.ts ./test/history/integrity-contract.ts` |
| 2. DOM boundary composition | `packages/plitejs/test/react/surface-contract.tsx` | Add nested-wrapper and inline-void anchor DOM-to-model/model-to-DOM round trips against actual rendered shells | Slice 1 does not reveal a product defect | Public DOM API assertions pass; no new marker or bridge | `pnpm --filter plitejs test -- test/react/surface-contract.test.tsx` |
| 3. Consecutive soft breaks | `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts` | Add one real Chromium row with two adjacent breaks and a trailing break | Package contracts green | Trailing newline owns a physical line inside the editor and click/typing assertions pass | `pnpm --filter plite test:plite-browser:chromium donor/examples/richtext.test.ts --grep 'consecutive soft-break'` |
| 4. Runtime repair | Plite React text rendering | Add one rendering-only newline to a final text child ending in `\n`, with the model length on the DOM string | Slice 3 gives exact red | Plain and decorated package proof, DOM mapping, and native input remain correct | focused React package tests and Browser replay |
| 5. Closure | Plite verification | Run affected development and strict handoff lanes | Slice 4 green | No product failure and strict Chromium proof passes | `pnpm check:plite:dev` then `pnpm check:plite` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Extension-added edits remain one history unit | Separate extension and history laws exist at the cited owners | Exact undo/redo integration fixture passes 12/12 | complete |
| Consecutive and trailing breaks have stable physical lines | Single-break Chromium proof exists; Wordgard exact row is `test/webtest-coords.ts:101-115` | Exact row passes five forced Chromium runs, live Browser, and strict Chromium | complete |
| Nested wrappers and inline-void anchors round-trip | Bridge and shell laws existed separately | Composed React-rendered DOM API contract passes in the 66/66 focused React run | complete |
| No donor runtime mechanism is required | Anchor, decoration, schema, and React owners cover the jobs | Local trailing-text projection repair passes every required gate without Wordgard's integer-position machinery | complete |

Scale contract:

- applicability and source evidence: applies to the React text-rendering path.
- user operation, current owner, proposed owner: rendering an editable text
  child remains owned by `EditableText` and `TextString`.
- independent scale variables and cohorts: child count, decoration segment
  count, and text length remain unchanged; the repair runs only on the final
  segment of the final text child.
- frozen budget and noise rule: one child-position comparison, one suffix
  check, one DOM attribute, and at most one rendering-only character.
- baseline and target benchmark: no timing benchmark is justified for bounded
  constant work beneath existing render traversal.
- deterministic work indicators and timing: no new loop, scan, cache, index,
  allocation proportional to document size, or repeated projection.
- correctness/native guard: package DOM shape, DOM/model offsets, click mapping,
  input, live Browser geometry, and full Chromium proof.
- final production-path rerun: `pnpm check:plite` passed all 79 Chromium batches.

Conditional evidence:

- High-risk scenarios:
  1. The history fixture performs a follow-up commit rather than extending the
     original transaction and proves the wrong grouping law.
  2. The browser row uses absolute pixels and flakes across font/viewport
     variation instead of asserting relative line order and exact model state.
  3. The DOM row freezes private wrapper structure instead of testing the
     public DOM bridge across the required shell markers.
- External research: consumed the accepted incremental editor audit at
  `docs/plans/artifacts/wordgard-latest-diff-audit/audit-report.md`; no further
  external source is needed.
- Issue/PR provenance: Wordgard issue refresh is audit context only. This plan
  is not issue-backed and performs no tracker mutation.
- Browser owner: applies only to the soft-break row and desktop Chromium claim.
  WebKit, Firefox, mobile viewport, and physical devices remain unclaimed.
- Benchmark/docs/behavior-law owners: Benchmark, public docs, and a new
  behavior-law file are N/A because the repair is bounded, internal, and fully
  owned by existing package/browser contracts.
- Release owner: patch changesets cover `plitejs` and `@platejs/test`.
- Performance pack: N/A with source evidence; the runtime change is constant
  bounded work and makes no timing claim.

Findings:

- Wordgard's valuable delta is bug-shaped proof, not reusable architecture.
- Current Plite already owns structural anchors, overlapping decoration sources,
  inline-void deletion, grapheme-aware geometry, and React event boundaries.
- Plite does not currently give a trailing `\n` its own Chromium line. The live
  `<span data-plite-string>` has line rectangles for `alpha`, the consecutive
  empty line, and `beta`, while its final newline stays on the `beta` line.
- `EditableText` routes non-empty segments through `TextString` at
  `packages/plitejs/src/react/components/editable-text.tsx:391-405`.
  `TextString` owns the trailing rendering branch, while `EditableText` limits
  it to the last segment of the last text child. `data-plite-length` keeps the
  appended character outside model and native-input offsets, including the
  decorated-string path.
- Plate already owns complete logical table repair and uses a different list
  representation. A Plate plan would be cargo culting the donor.

Decisions and tradeoffs:

- Three precise tests beat importing four abstractions and another coordinate
  system.
- The browser row costs more than a unit test, but only a real layout engine can
  prove adjacent-break geometry.
- DOM wrapper/anchor proof stays at the public bridge boundary; it may reuse
  shell markers without declaring their entire tree shape permanent.

Review fixes:

- The hard-cut counterfactual removed PointSet, RangeSet, MultiSet, Widget,
  node getters, and all Plate implementation work from the target.
- Scale review narrowed the repair to constant bounded projection work, so no
  Benchmark packet is useful.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Bun treated `test/history/integrity-contract.ts` as a name filter and ran zero files | 1 | Use Bun's explicit `./test/...` path form and repair every affected focused command | resolved; generator, plan, and validator now require `./test/...`; focused run passed 12/12 |
| Inline-void model point exported DOM sentinel offset `0`, not the assumed mark-placeholder offset `1` | 1 | Assert the actual inline-void anchor contract, then continue both mapping directions | resolved; focused React contract passes 54/54 |
| Collapsed ranges at newline offsets inherit an adjacent line or owner fallback rect | 1 | Derive the real empty/trailing line centers from the visible first and `beta` line advance, then assert containment and exact click mapping | resolved as a test-fixture correction; the consecutive empty-line click maps to offset 6 |
| A manually started proof server occupied the runner-owned port | 1 | Stop the owned server before rerunning the focused browser command | resolved; the next run reached the exact test |
| Trailing soft break has no physical Chromium line | 2 | Repair the existing final-text projection owner without adding donor machinery | resolved; one rendering-only newline creates the physical line while `data-plite-length` preserves model offsets |
| Next dev output invalidated strict proof at `.next-plite/dev/logs/next-development.log` | 1 | Treat the app output as generated proof noise and add it to the existing ignored-directory contract | resolved; proof-input contract passes 21/21 while the dev server remains live |
| Existing browser `blockTexts` counted the rendering-only newline | 1 | Normalize cloned DOM strings by their declared logical length | resolved; both soft-break rows and all `@platejs/test` proof pass |
| Concurrent work updated `packages/platejs/src/migrations` during strict Chromium | 1 | Wait for the writer to finish and rerun strict on one stable source fingerprint | resolved; rerun passed 711/711 executed tests across 79 batches |

Verification evidence:

- Planning source audit: frozen Wordgard
  `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` and current local owners.
- Harvester receipt: 29 files, 6,382 lines, 675 call sites; fresh Wordgard build,
  594 Node tests, and 764 Chromium tests passed.
- Focused History:
  `pnpm --filter plitejs exec bun test --preload ../../config/plite-source-test-setup.ts ./test/history/integrity-contract.ts`
  passed 12/12.
- Focused React DOM:
  `pnpm --filter plitejs test -- test/react/rendered-dom-shape-contract.test.tsx test/react/surface-contract.test.tsx`
  passed 66/66, including decorated trailing text and unchanged model state.
- Focused Chromium: both soft-break rows passed together. The new exact row
  then passed five forced, retry-free runs with
  `PLITE_BROWSER_FORCE_PROOF=1`.
- Live Browser proof at `/examples/plite/richtext`: `alpha\n\nbeta\n`
  produces four physical lines at tops `193.5`, `215.8984375`, `238.296875`,
  and `260.6953125`, all inside the editor bottom `281.59375`. Clicking the
  trailing line maps to model offset 12; typing `tail` produces offset 16 and
  no console error.
- Proof-monitor contract: `node --test apps/plite/scripts/plite-proof-inputs.test.mjs`
  passed 21/21 with `.next-plite` output ignored.
- Shared browser helper: `@platejs/test` typecheck passed 32 tasks and package
  tests passed 35 tasks.
- Affected gate: `pnpm check:plite:dev` passed 85 typecheck tasks, 134 package
  test tasks, 232 tooling contracts, 25 benchmark contracts, public types, and
  3/3 browser smoke in 33,976 ms.
- Strict gate: `pnpm check:plite` passed typecheck, package tests, contracts,
  and Chromium with 711 passed, 8 skipped, and 79 bounded batches in 339,492 ms.
- Scoped Ultracite and `git diff --check` passed. The harvest validator
  reconciles 41
  families, 675 call sites, and 29 files; the incremental audit validator still
  reconciles 18 concepts, 336 declarations, 49 files, and 3 material candidates.
- Plan checker:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-wordgard-diff-proof-closure.md`
  passed.

Final handoff prepared:

- Ownership and target API/runtime: History, DOM/React, text rendering, browser
  assertion, and proof-monitor work are complete. No Plate owner or public API
  change is implicated.
- Public breaks and Plate/collaboration adoption: none.
- Browser/Benchmark/docs/provenance: focused and full Chromium plus live Browser;
  no Benchmark, public docs, or tracker mutation.
- Release artifacts: patch changesets for `plitejs` and `@platejs/test`.
- Scale applicability: constant bounded work only.
- Remaining risk: Firefox, WebKit, mobile viewport, and physical devices were
  outside this desktop-Chromium target and are not claimed.
- Execution order: complete.

Timeline:

- 2026-09-02 Plite Plan created from the current Wordgard diff audit and test harvest.
- 2026-09-02 Hard-cut pressure rejected donor mechanisms and all Plate work.
- 2026-09-02 Three proof-only slices prepared for user acceptance.
- 2026-09-02 User accepted the exact plan with `go`; one-shot execution goal
  created before test edits.
- 2026-09-02 History composition contract added; focused run passed 12/12 with
  one extended edit batch plus one isolated adjacent batch.
- 2026-09-02 Live React source showed inline voids own a zero-width anchor, not
  the block-void spacer shell; the corrected composed contract passed 54/54.
- 2026-09-02 Focused Chromium proved consecutive empty-line clicking works but
  a trailing newline allocates no fourth physical line.
- 2026-09-02 Repaired final-text projection for plain and decorated text while
  preserving logical DOM/model length; package React proof passed 66/66.
- 2026-09-02 Corrected logical browser block-text assertions and ignored
  `.next-plite` generated output in the proof monitor, each with owner tests.
- 2026-09-02 Exact Chromium passed five forced runs; live Browser proved the
  fourth line clickable and editable with no console error.
- 2026-09-02 Affected and strict Plite gates passed; strict Chromium completed
  79 batches with 711 passed and 8 skipped.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete; focused, affected, live Browser, and strict proof are green |
| Where am I going? | Final handoff only |
| What is the goal? | Close three exact Wordgard-derived Plite proof gaps with the smallest durable repair |
| What have I learned? | Wordgard's geometry test found a real Plite trailing-newline rendering defect; its new abstractions remain irrelevant |
| What have I done? | Added three regressions, repaired final-newline rendering and two proof owners, added changesets, and passed strict Chromium |

Open risks:

- No open risk blocks this target. Cross-browser and raw-device behavior remain
  outside the accepted desktop-Chromium claim; Plate work remains unjustified.
