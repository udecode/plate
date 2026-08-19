# Hard cut table renderer hooks

Objective:
Hard-cut Table renderer state hooks; done when package/registry/docs adopt the
DOM-only hook and focused proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-hard-cut-table-renderer-hooks.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser

Mode:
- `standard`; the user accepted the exact target in chat and said `go`.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Source audits for deleted exports, files, docs, and callers.
- `@platejs/table` typecheck and focused React/package tests.
- `www` typecheck, docs source build/parity, registry source/changelog checks,
  barrel generation, lint, and `git diff --check`.
- Browser proof prefers `/blocks/table-demo`; if CI-generated registry imports
  block it, use the sanctioned Plite host with unchanged real www source for
  table render, selection DOM/caret projection, press collapse, resize, and console.

Constraints:
- The user explicitly accepted the exact target and authorized execution.
- No public compatibility aliases or runtime shims.
- Preserve table selection DOM attributes, caret restoration, resize behavior,
  selector update filtering, schema inference, and current runtime behavior.
- Do not touch classic registry surfaces or CI-owned generated registry output.

Boundaries:
- In scope: `packages/table/src/react`, the copied registry `table.tsx`, Table
  EN/CN API docs, current Table changeset/changelog source, generated barrels,
  tests, and doctrine only if current rules contradict the accepted shape.
- Source owners: `TablePlugin` semantic reads, one package DOM lifecycle hook,
  registry Table component composition, and docs/release teaching.
- Non-goals: redesigning Table semantic API placement, classic tables, DnD,
  selection semantics, schema, persisted data, or unrelated registry UI.
- Direct Plite boundary owners: `useEditorSelector`, editor selection collapse,
  commit filtering, `useClaimEditableDOMCommit`, and `NodeKey`; these remain
  unchanged substrate.

Output budget strategy:
- Read named Table owners first; cap searches to Table/package/docs/registry
  paths; use `rg` counts and filenames before lines; exclude generated registry
  JSON, templates, build output, and unrelated packages.

Blocked condition:
- Block only if the DOM-selection lifecycle cannot be preserved without a
  public renderer-state bag, or the real Table demo cannot run after all safe
  local route/install recovery is exhausted.

Plate Plan state:
- status: complete
- phase: prove-and-handoff
- next: final response
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Hard-cut `useTable`/`useTableCell`; keep only a void DOM lifecycle hook; compose pure reads and events in registry; no aliases. |
| Active goal and plan verified | yes | Active goal points to this exact plan. |
| Current owners read | yes | `useTable.ts`, `useTableCell.ts`, specs, barrel, `BaseTablePlugin.ts`, registry `table.tsx`, Table EN/CN docs. |
| Best API target resolved | yes | `best-api review`: delete both state-bag hooks; keep required `useTableSelectionDOM(tableRef): void`. |
| Mode and execution boundary resolved | yes | Standard one-shot execution explicitly authorized by `go`. |
| Docs pack selected | yes | Plugin/API docs change in EN and CN. |
| `docs-creator` loaded | yes | Full skill and target/sibling docs read. |
| Docs lane selected | yes | Plugin/feature page, API reference section. |
| Target docs and nearest sibling docs read | yes | Full Table EN/CN pages and DnD sibling page read. |
| Docs style doctrine read | yes | `docs-creator` current-state and plugin-page rules loaded. |
| Documented source owner identified | yes | `@platejs/table/react` owns only the DOM lifecycle hook; `TablePlugin` owns reads; copied `table.tsx` owns render composition. |
| Package/API pack selected | yes | Public React exports/files are hard-cut. |
| Public surface or package boundary identified | yes | `@platejs/table/react` barrel and Table docs. |
| Release artifact path selected | yes | Update existing major `.changeset/table-block-insert.md` relative to `main`; update current registry changelog entry for copied `table`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; `main` audit shows the current two hooks are branch-only but the main-era hook family is public. |
| Barrel/export impact decision recorded | yes | Exported files change; run `pnpm brl`. |
| Browser pack selected | yes | Interactive table DOM/resize behavior changes. |
| Browser route / app surface identified | yes | Prefer `/blocks/table-demo`; use the existing Plite host only if CI-generated www registry imports block it. |
| Browser tool decision recorded | yes | In-app Browser for ordinary UI interaction. |
| Console/network caveat policy recorded | yes | Final fresh-tab console errors/warnings must be empty; unrelated external media/network is out of scope. |
| Observable browser case captured | yes | N/A: architecture/API hard cut, not a report-backed bug. Prove render, resize, multi-cell DOM projection/caret, press collapse, and follow-up interaction. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption/deletion answers; no private bridge remains.
- [x] Execution slices and focused proof matrix are concrete and complete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API/import is source-backed; no route, component, transform, demo, or preview changed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: existing links, anchors, and previews remain valid.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: mixed work updates the existing Table changeset and registry changelog event.
- [x] Package/API pack: `.changeset` work loaded `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: N/A: this is mixed package+registry work, so both release owners apply.
- [x] Package/API pack: N/A: published package and registry deltas both have artifacts.
- [x] Package/API pack: hard cut is explicit; no compatibility alias or deprecated path remains.
- [x] Package/API pack: Table typecheck/build and 230/230 tests are recorded.
- [x] Package/API pack: `pnpm brl` and changelog generation/check passed.
- [x] Browser pack: render, selection drag/collapse, caret projection, resize, and console outcomes were recorded before proof.
- [x] Browser pack: Browser is the correct surface; Chrome/Computer are N/A because no native browser/OS behavior is involved.
- [x] Browser pack: fresh-tab warnings/errors are empty; external network is irrelevant.
- [x] Browser pack: screenshot N/A because DOM attributes, caret style, and measured geometry are authoritative.
- [x] Browser pack: N/A: user-directed architecture cut, not a report-backed bug.
- [x] Browser pack: fresh final page rechecked Table DOM, selection, caret, interaction, resize geometry, and errors; source/test fingerprints are recorded.
- [x] Browser pack: N/A: unpushed local candidate, not a shipped fixed claim; a fresh process exercised final source.
- [x] Browser pack: structural selection/caret lifecycle passed 5/5 warm runs without retry.
- [x] Browser pack: the temporary Plite host was removed; no stub, alias, generated registry edit, or unshipped scaffold remains.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Source, adoption, proof, review, and artifacts complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final old/new symbol and file audits pass. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Exact target implemented; doctrine already rejects state-to-props hooks and permits durable DOM lifecycle hooks. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Package, registry, docs, browser, changeset, and changelog complete; provenance N/A. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Commands, counts, Browser ledger, ref, and hashes recorded. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff fields completed below. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Isolated 86,111-byte bundle: clean, zero actionable findings, correctness 0.92. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-hard-cut-table-renderer-hooks.md` | Command passes after final evidence update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN hook contract matches source/barrel exactly. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No links/routes/previews changed; `table-demo` remains registered. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed directly and in full www typecheck. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing topology preserved; API section teaches the sole hook. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Barrel exports Table plugins plus `useTableSelectionDOM`; old files/symbols absent. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Mixed package API plus copied registry install-shape change. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `@platejs/table` major changeset updated relative to main. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Existing 2026-08-17 event updated; generator write/check pass. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: both release artifacts apply. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Table typecheck/build and 230/230 tests pass. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed; barrel exports only final hook. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Real www source mounted in Plite host; selection/collapse/caret/resize passed. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Fresh-tab errors/warnings `[]`; external network N/A. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | DOM/geometry ledger recorded; screenshot N/A. |
| Exact case replay | no | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | N/A: not report-backed. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | HEAD `a18bab5bba2d73e446523cbd848c5baeb19935f4`; four hashes below. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: unpushed local candidate in a shared dirty checkout; fresh process/final source used, no shipped claim. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Browser 5/5: selected 6/caret 1 then collapsed 0/caret 0. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live package/registry/tests/docs/main baseline and doctrine read | Decide |
| Decide | completed | Exact hard-cut target accepted by user | Prove and hand off |
| Prove and hand off | completed | All focused proof, P2 review, and handoff evidence complete | Final handoff |

Decision brief:
- outcome: one honest package DOM lifecycle hook and registry-owned renderer composition.
- chosen shape: `useTableSelectionDOM(tableRef): void`; direct `TablePlugin`
  reads and event handlers in registry `table.tsx`.
- strongest rejected alternative: keep `useTable`/`useTableCell` as reusable
  state bags because Table semantics are complex.
- consequence: smaller public API and copied code that exposes its actual
  composition, while the package still owns imperative DOM synchronization.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Table renderer hook | Layout, DOM sync, and `onMouseDown` in `useTable` | Delete; compose layout/events locally and call `useTableSelectionDOM` | package + registry | Event props and transient overrides are renderer policy | caller/export/docs/tests hard cut | package + browser | selection DOM lifecycle regression | rearchitect |
| Table cell hook | Eight-field `TableCellState`; sole registry caller uses five | Delete; compose existing plugin reads/selectors in `TableCellElement` | registry + `TablePlugin` | State-to-props wrapper hides source and computes unused state | caller/export/docs/tests hard cut | typecheck + Table tests/browser | selector invalidation drift | cut |
| Table DOM selection | Hidden inside broad `useTable` | Export required void hook with required ref | package React | Subscription, attributes, caret restoration, and cleanup are durable DOM lifecycle | rename focused behavior spec and docs | focused hook tests + browser | caret/attribute regression | keep |
| Resize rounding | Public top-level helper in hook file | Private registry helper | registry Table family | Three calls in one family are one owner | remove export/spec; cover through resize behavior | registry tests/browser | rounding regression | move |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Package API | `plate-plugin-creator` | Rename/extract DOM hook; delete state hooks/types/spec debt | Target locked | barrel exposes only Table plugins plus DOM hook | package typecheck/tests + declaration/barrel audit |
| Registry adoption | `plate-ui` | Inline layout/cell selector/event composition | Package target available | no rejected imports; behavior unchanged | registry tests + Browser |
| Teaching/release | `docs-creator` + changeset/changelog | Rewrite current-state API docs and release artifacts | Final source shape | zero stale names/claims | docs source/parity + generator checks |
| Closure | task/autogoal | lint, typechecks, review, browser, stale sweep | all slices complete | checker passes, goal complete | exact commands recorded |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Rejected hooks disappear | Current public files/barrel/docs/callers identified | source audit leaves only the final DOM hook; old main spelling appears only in migration prose | complete |
| DOM lifecycle survives | `useTable` spec proved selected attributes/caret cleanup | `useTableSelectionDOM.spec.tsx` passes; Browser selection/collapse 5/5 | complete |
| Renderer composition remains typed | current Table registry call sites and plugin reads inspected | Table typecheck/build and www source TypeScript pass | complete |
| Resize behavior survives | current registry uses private rounding at three resize paths | full Table suite passes; Browser drag 100px -> 140px | complete |

Conditional evidence:
- High-risk scenarios: selection attributes fail to update after structural
  changes; caret color is not restored; cell indices stale after row/column
  changes; ordinary mouse press no longer collapses multi-cell selection.
- External research: N/A; accepted shape is grounded in current Plate doctrine
  and live source, with no unresolved external architecture question.
- Issue/PR provenance: N/A; user-directed current-tree architecture cut.
- Docs/registry/browser/release/behavior-law owners: Table EN/CN docs, existing
  Table major changeset, current UI changelog event, package tests, real demo.

Findings:
- `useTable` has one production consumer and returns renderer-owned transient
  state plus an event handler; only its imperative selection DOM effect has an
  independent package owner.
- `useTableCell` has one production consumer, which ignores `isSelectingCell`,
  `minHeight`, `selected`, and `width`; existing `TablePlugin` reads already
  provide the consumed semantics.
- `roundCellSizeToStep` has three calls inside one registry Table family and no
  independent owner.
- `main` does not contain the branch-only `useTable.ts`/`useTableCell.ts`, but
  does expose the older public Table renderer-hook family; the existing major
  changeset is the release artifact and currently teaches the rejected shape.

Decisions and tradeoffs:
- Preserve one imperative package hook because React subscription, editable DOM
  ownership, attribute diffing, caret restoration, and cleanup cannot be made
  honest as pure registry helpers.
- Do not add standalone getters/setters: registry uses existing scoped
  `TablePlugin` reads/API and core selectors directly.
- Keep the trivial rounding calculation private to the registry owner rather
  than replacing one bad public hook with a bad public helper.

Review fixes:
- Browser found that `usePluginStore(TablePlugin, 'disableMarginLeft')` cannot
  subscribe to an optional key omitted from initial defaults. Restored
  construction-time `store.get()` instead of adding a fake default.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Concurrent Table artifact build and dependency-building typecheck raced on `dist` | 1 | Run the release build sequentially | `pnpm turbo build --filter=./packages/table` passed |
| Real `/blocks/table-demo` compilation blocked by stale CI-generated registry imports | 1 | Use the sanctioned Plite host with real www source; do not run `build:registry` | Real Table family passed in Browser; route blocker recorded |
| `usePluginStore` rejected omitted optional `disableMarginLeft` | 1 | Read construction policy through scoped `store.get()` | Fresh route rendered and Browser proof passed |
| In-app browser contenteditable follow-up typing could not retain the resolved text locator | 3 | Stop retrying; use model/DOM selection-collapse and package behavior proof | Selection attributes/caret/collapse passed 5/5; typing is not changed by this API cut |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/table` -> pass.
- `pnpm turbo build --filter=./packages/table` -> pass after sequential rerun.
- `pnpm --filter @platejs/table test` -> 230/230 pass.
- Focused DOM/border files -> 6/6 pass.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.json` -> pass.
- Full `pnpm --filter www typecheck` -> pass, including package-integration TypeScript.
- Docs source build, API-reference check, docs parity, registry source check,
  barrel generation, and registry changelog write/check -> pass.
- Browser via temporary Plite host importing real www source: 4 rows, 16 cells,
  16 resize handles; selection/collapse 5/5 with 6 selected/one transparent
  caret then zero/zero; resize 100px -> 140px; fresh-tab warnings/errors `[]`.
- Temporary host files and dev servers removed.
- Final fingerprints:
  - `useTableSelectionDOM.ts`: `db8c4560770c377beb193ed8226f3fbcc90b9e2fa86f51f5e4ed188d2347143a`
  - `useTableSelectionDOM.spec.tsx`: `252179e0f008f62caeb1c5e1030975504c44205dc5298f77c3abee4c428c130b`
  - `BaseTablePlugin.borders.spec.tsx`: `3887ac0af87daf8a7a78acf4c38833db93ccaca9658bf3f83bb9b61aefd2dd1b`
  - registry `table.tsx`: `7fc243edb7e08d254fdbb255c01330e425c43b74cda7f97717c5c158fd2b01a0`
- P2 autoreview: isolated 86,111-byte bundle, TruffleHog clean,
  `autoreview clean`, zero actionable findings, correctness 0.92.

Final handoff prepared:
- Ownership and target API: package retains only
  `useTableSelectionDOM(tableRef): void`; copied registry owns renderer layout,
  cell derivation, rounding, and mouse policy.
- Public breaks and adoption: `useTable`, `useTableCell`, `TableCellState`,
  helper exports/files, stale tests, and docs are gone with no alias; barrel,
  EN/CN docs, changeset, and registry changelog adopt the final hook.
- Applicable runtime/package/docs/browser decisions: DOM selection/caret
  lifecycle remains package-owned; renderer composition is local and visible;
  docs are current-state only.
- Proof and execution risks: all Table-owned gates pass; the real www block
  route remains locally unavailable only because CI-generated registry imports
  are stale from broader colocation work, so Browser used the sanctioned Plite
  host with unchanged real www source.
- Execution order and user attention: local implementation is complete; CI
  must regenerate registry output before the normal block route can run.

Timeline:
- 2026-08-17T14:39:27.148Z Plate Plan created.
- 2026-08-17 Grounded the public hook graph, main release baseline, docs,
  doctrine, target API, adoption slices, risks, and proof surface before edits.
- 2026-08-17 Hard-cut `useTable`, `useTableCell`, `TableCellState`, their helper
  exports/files, and stale hook tests; added the focused DOM lifecycle hook.
- 2026-08-17 Moved renderer layout, cell reads, rounding, and mouse policy into
  copied `table.tsx`; updated EN/CN docs, the Table major changeset, registry
  changelog source/generated data, tests, and barrels.
- 2026-08-17 Passed package/source/docs/registry proof and five warm Browser
  selection/collapse runs plus resize proof; recorded unrelated route/typecheck
  blockers separately.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Local implementation complete |
| Where am I going? | Mechanical goal-plan check and final handoff |
| What is the goal? | Delete Table renderer state bags while preserving the true DOM lifecycle |
| What have I learned? | Both hooks are single-registry-owner wrappers; only selection DOM synchronization survives package ownership |
| What have I done? | Hard cut, adoption, docs/release, 230 tests, build/typechecks, 5/5 Browser, clean P2 review |

Open risks:
- The normal `/blocks/table-demo` route is locally blocked by stale CI-generated
  registry imports from the broader colocation migration. Source/metadata checks
  pass, and CI owns regenerating that output.
- No unresolved Table API, behavior, or proof risk remains.
