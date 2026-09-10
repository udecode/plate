# Table resize ownership

Objective:
Repair Plate UI extraction doctrine first, then move table resize semantics and
the minimal pointer lifecycle to the existing table package and simplify copied
table presentation. Complete local package, registry and browser proof.

Goal plan:
docs/plans/2026-09-07-table-resize-ownership.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- User: "ok repair the skill first, then go", accepting the preceding table
  ownership recommendation: resize constraints/commits, headless pointer
  lifecycle, local selection predicates, direct toolbar commands, compact border
  icons, removal of the pass-through renderer and disabled rounding helper.

Completion threshold:
- Doctrine sources and generated mirrors agree; all accepted table changes are
  adopted; focused package and browser checks pass; real table desktop/mobile
  interactions and installed registry output are verified; this plan passes its
  completion checker. No publication is part of completion.

Verification surface:
- Doctrine: `version.mjs validate`, `sync-resources.mjs --check`, source/mirror audit.
- Package: source-first table partition typechecks/tests, new meaningful resize
  contract tests, `pnpm brl`, focused lint.
- Registry: `pnpm --filter www build:registry`, www source typecheck, affected
  table browser runner and real `/blocks/table-demo` route (confirm inventory).
- Artifacts: `docs/plans/artifacts/table-resize-ownership/` with command logs,
  source fingerprints, browser actions/images, and append-only decisions.tsv.

Constraints:
- Work in current checkout on `next`; no commit, push, PR, worktree or external
  messages. Source rules own skill changes; regenerate instead of editing mirrors.
- Keep table document/selection behavior, live/deferred resize and presentation.
  Record and test any cancellation/correctness repair separately from refactoring.
- Package owns domain constraints and neutral lifecycle. Registry owns styles,
  labels, handles, hover affordances and transient rendering overrides.

Boundaries:
- Plate UI and its affected teaching chain; docs/vision/plate.md; immutable
  Plate Next doctrine history; existing `platejs/table` lib/React owners; table
  registry family, metadata/output, tests and current API teaching.
- No general helpers package, global workflow rewrite, other-project sync,
  whole-table redesign, complete package attestation or unrelated UI changes.

Timing:
- N/A: no deadline or minimum requested.

Blocked condition:
- Missing source or actual runtime capability that prevents all remaining
  authorized proof; preserve attempted evidence and continue independent work.

Task state:
- current_phase: complete
- next: optional named Plate UI sync to the sibling plate checkout
- status: complete

Work Checklist:
- [x] Read full Poteto Principles and matched refactoring/skill authoring methods;
  Task workflow and applicable Autogoal retention; use one plan. Source:
  `.agents/skills/poteto-mode/`, `.agents/rules/task/references/workflow.md`.
- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable proof and resolve verified in-scope findings.
- [x] Record the final outcome, evidence, material limits and next action.
- [x] Repair Plate UI canonical extraction test and all contradictory loaded
  ownership/component references; align Plugin Creator, Best API and smallest
  Vision owner. Source: Maintain Workflow and Best API self-maintenance.
- [x] Append next immutable doctrine version, preserve all older entries and
  package attestations, run `pnpm install`, validate exact mirrors before code.
- [x] Agent Native Reviewer: forward-test durable table constraints and adjacent
  one-off menu/label helper against the repaired rule; verify discovery/links.
- [x] Pin current table resize/toolbar behavior using existing tests and retain
  baseline source; record final semantic API, callers and performance scope.
- [x] Implement package resize calculation and coordinated mutation, adopt the
  single registry consumer, delete obsolete local algorithm; preserve inference,
  hard validation, undo and package source layering. Owner: Plugin Creator.
- [x] Implement minimal pointer lifecycle with owning window, active pointer and
  teardown, leaving preview styles and overrides local. Test completion/cancel/
  detach/read-only/removal as applicable; no generic event-hook framework.
- [x] Simplify table selection predicates, renderer wrapper, toolbar callbacks,
  disabled rounding helper and inline SVG bulk without new registry boundaries.
- [x] Update public JSDoc/current API docs and any affected registry metadata;
  run barrels, source-first typechecks, focused meaningful tests and lint.
- [x] Generate registry output; verify affected automated browser rows and actual
  desktop/narrow table route including resize, selection and toolbar follow-up.
- [x] Resolve scale contract: preserve large-table deferred strategy, record
  current/final correctness and work at normal/large table sizes; no speed claim.
- [x] Reconcile original obligations, inspect own diff, verify evidence exists,
  stop owned servers/tabs and run plan checker before marking native goal complete.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Extraction | Plate UI ownership | Semantic invariant or durable lifecycle qualifies with one current consumer | Generic helpers package; moving all renderer state to npm | Rule forward-test then actual table adoption |
| Structure | Model the Domain, Laziness Protocol | One resize request/result contract and existing plugin commands; delete wrappers | A bag of UI props behind multiple hooks | Focused behavior proof and reader-load audit |
| Throughput | Task and Poteto | Sequential source edits; batch independent reads/tests; one proof owner | Delegated edits contrary to current instructions | Commands and decisions trail |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Doctrine repaired first | yes | Canonical teaching, regeneration, version validation and forward-test | v162 validates; mirrors exact; skill quick_validate passes; previous versions/packages unchanged; table semantics qualify and menu state remains local under the repaired rule |
| Package and adopted copied table | yes | Source types, semantic/lifecycle tests and focused lint | Table React source partition typecheck and Plate package build pass; 17 focused resize tests pass; nine changed TS/TSX files and final consumer runner lint pass |
| Registry and real interaction | yes | Registry generation, affected browser rows, desktop/mobile route proof | 367 canonical payloads plus 15 overlays; five resize/toolbar cases and four selection cases pass; actual source and Base/Nova plus Radix/Luma consumer interactions verified |
| Runtime scale | yes | Preserve deferred large-table behavior and compare scoped work/correctness | Original and candidate pass normal resize/undo and 301-by-4 deferred layout; package preview returns only the affected widths for 2000 columns; no speed claim |
| Structured Autoreview | N/A | Never on next; no publication requested | Source and behavior self-review remains required |
| Other projects and publication | N/A | No authority granted | Suggest named Plate UI sync to plate only after checking installation |
| Plan and cleanup | yes | Reconcile sources, preserve evidence, clean owned processes, check-complete | Obligation reconciliation below; fingerprints, installed sources, screenshots and logs saved; cleanup.txt confirms owned tabs/servers/workspaces removed; run the completion checker against this final plan |

Select proof from the actual change. Verify Plate owns package, browser,
native-device, CLI and artifact claims; Testing owns test value. Generated
skills use the source generator. Public API adoption, registry/changelog,
security and release mechanics stay with their domain owners. Link their
existing receipts here instead of copying their full checklists.

Task's shared review budget applies only to an explicit review request or
actual PR closeout and never runs Autoreview on `next`. A budget cap does not
end useful authorized repairs. Record an actual review or its N/A reason.
For authorized PRs use the real repository template and Task's PR-body contract.
For authorized tracker messages read back the result. Neither follows merely
from creating this file.

Verification evidence:

- Source repair preceded all product edits. `pnpm install`, doctrine validation,
  resource parity and quick_validate passed. Plate UI is project-owned; no
  corresponding shared Dotai skill exists. Configured sibling `plate` has a
  Plate UI rule and is a named sync candidate, not an updated destination.
- Baseline resize-hover browser row passed before refactoring. Headless table
  partition: 235 tests/18860 assertions passed. React table partition:
  46 tests/190 assertions passed. New core/lifecycle files: 17 tests pass (657 assertions).
- Full www source typecheck passed, including docs/registry source checks.
- Final registry build emitted 367 canonical payloads and 15 overlays. Generated
  table payload imports useTableResize; the color control declares @types/lodash.
- New browser owner `apps/www/tests/browser/table-resize.spec.ts`: 5/5 pass;
  desktop/narrow column and row resize/undo, cancellation, toolbar/border/focus,
  301 x 4 deferred table. Screenshots and log are in the artifact directory.
- Actual in-app browser on `/blocks/table-demo`: drag first boundary +30px;
  DOM widths changed from 100/100/100/100 to 130/70/100/100.
- Existing selection browser file: 4/5 pass. `paint-only-selected-cells` fails
  its positive pixel control with 0 changed pixels (expected >200). Replayed
  the exact case with saved original table source: identical failure. Baseline
  screenshot was inspected. Original source was then restored to the candidate.
  This is a pre-existing selection-paint proof gap, not evidence of resize drift;
  do not claim full selection-paint closure or weaken that test.
- `pnpm brl` skips the React subtree because its root is authored `index.tsx`;
  the existing barrelsby CLI generated the table leaf barrel directly. The
  actual source browser confirms the new export resolves.
- `test:profile` matched no new partition tests and printed an old shared JUnit
  artifact. Those stale timings are rejected. Direct Bun JUnit for the exact two
  files is the current profile source; keep the failed command log.


- Final package artifact build and Table React partition typecheck pass. The
  final www scripts typecheck and docs source generation pass. Full www source
  typecheck passed earlier in the task; final installed builds separately check
  copied consumer types, prerendering and production bundling.
- `resize-tests-final.log` and `resize-tests.junit.xml`: 17 tests, 657 assertions,
  2.95s runner time / 1.832s in test bodies. The 2000-column fixture accounts for
  1.067s. These are test-cost observations, not editor performance measurements.
- `resize-baseline.log`: original normal and large-table cases pass; cancellation
  fails (48/152 committed instead of the original 100/100). `resize-final.log`:
  all five final cases pass, including cancellation, desktop/narrow, undo and scale.
- `selection-final.log`: all four non-pixel selection interaction cases pass.
- `create-install-table-composed.log`: both Base/Nova and Radix/Luma consumers
  install, build, typecheck and prerender successfully. Actual in-app browser
  drives change 120/180 to 150/150 and insert a third row in each; no console
  errors. Screenshots, copied source/configs, build IDs and package fingerprints
  are retained under the artifact directory.
- `source-fingerprints.json`, `installed-package-fingerprints.json`,
  `consumer-interactions.json` and `cleanup.txt` bind final sources, installed
  artifacts, actions and cleanup. The source route served this checkout's www
  directory at port 3297, confirmed by the listener process's cwd.

Obligation reconciliation:

- Task/Autogoal/Poteto/Show Me Your Work: one authorized local plan and native
  goal; full Principles plus matched refactoring/skill-authoring methods loaded;
  source authority and decisions captured in this plan and decisions.tsv.
  No delegation or publication. All accepted responsibilities are adopted.
- Maintain Workflow/Skill Creator/Agent Native Reviewer: canonical project-owned
  Plate UI source and affected teaching repaired first, named sibling installation
  checked, generated mirrors verified, and adjacent semantic/presentation cases
  forward-tested. No shared Dotai owner exists for this project-specific rule;
  no generic method/helper changed, so no helper fixture or cross-project write.
- Best API/Plate Plan/Plugin Creator: existing lib/React table owners reused;
  captured pure calculation, atomic command and minimal lifecycle retain distinct
  jobs. Public callback inference, validation, undo, teardown, owning-window
  behavior, source layering, docs, exports and copied consumer adoption verified.
  Doctrine v162 is appended; all earlier entries and package attestations match
  the saved pre-edit registry. No package-wide attestation is claimed.
- Plate UI: selection predicates, direct toolbar commands, renderer wrapper,
  disabled rounding and repeated SVGs were all addressed. Rendering overrides,
  hover/layout/threshold choices and local context remain in the copied family.
  Registry metadata/output and both selected primitive families are verified.
- Technical Writing/Task docs: current call shapes and mandatory kit composition
  are documented in English and Chinese; docs source generation passes. Existing
  independent setColumnWidth/setRowHeight APIs remain valid and retained.
- Verify Plate/Testing: source-first partition tests/types, fresh built consumer
  artifacts, actual controlled browsers and current JUnit provide the evidence.
  Broad Plite/native-device/release gates do not apply to this Plate table scope.
  Existing selection-paint failure is preserved and baseline-replayed; no test
  thresholds were weakened. Deterministic scale checks preserve deferred layout;
  no benchmark campaign or speed claim is made.
- Task review budget: Autoreview does not run on next. Direct source review and
  in-scope defect repair are complete. The inherited source rules, original
  checklist and accepted recommendation have been reconciled before closure.

Findings and remaining work:

- Final API: `api.createResize(table, target)` captures sizes and returns a pure
  delta projection; `update.resize(preview, { at })` commits coordinated sizes;
  `useTableResize` owns the primary pointer, exact owner window, teardown and
  live edit authority. Its caller owns preview paint and rendering overrides.
- Correctness changes are explicit: pointercancel/blur discard, non-positive row
  deltas clamp to 1px, undersized imported columns retain positive starting
  lower bounds, other pointers cannot finish the gesture, stale table/read-only/
  unmount cancels. Headless tests prove atomic commit/undo and finite validation.
- Installed consumer proof exposed missing lodash type metadata and the copied
  row controls' mandatory DndKit composition. Fixed the canonical color registry
  metadata and English/Chinese setup examples; the proof fixture explicitly
  installs and composes TableKit with DndKit. Core sizing remains DnD-independent.
- Early package declaration failures came from dependency output predating
  concurrent schema source changes. Refreshing Plite then Plate produced a
  successful final package build. No unrelated schema code was changed here.
- Source review found one more imported-width invariant: zero left-edge delta
  must preserve an undersized first column. The new test failed with width 48
  and margin 12 instead of width 20 and margin 40; the fixed lower bound passes.
- No required implementation or verification work remains in this scope.

Final handoff:

- Outcome and owning fix: repaired extraction doctrine before implementation;
  table semantics and pointer lifetime live in the existing package; copied
  presentation shrank from 2452 to 1191 lines.
- Proof and limits: package build/types, 17 focused tests, 9 focused browser
  cases, registry output and two installed consumers pass. The pre-existing
  selection paint positive-control failure remains baseline-reproduced.
- Local / integrated / published state: current checkout only; no commit, push,
  PR, release or other-project sync.
- Next action or completion: local task complete. A named Plate UI sync to the
  sibling plate checkout is a separate suggested action.

Timeline:

- 2026-09-07T14:15:34.708Z Plan created.

Open risks:

- The existing table selection paint positive control fails identically on the
  original source. This task does not claim full selection-paint closure.
- Narrow browser viewport proof is not a native-device claim.
- Public artifacts and other checkouts have not been updated.
