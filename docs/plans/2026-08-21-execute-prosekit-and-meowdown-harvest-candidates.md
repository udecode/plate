# execute prosekit and meowdown harvest candidates

Objective:
Execute all actionable ProseKit/Meowdown harvest candidates; done when 5 packets have red/green proof and package, browser, review gates pass; plan docs/plans/2026-08-21-execute-prosekit-and-meowdown-harvest-candidates.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-21-execute-prosekit-and-meowdown-harvest-candidates.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: local harvest reports accepted by the user's `go all` instruction
- id / link: `docs/editor-test-harvester/prosekit/report.md` and
  `docs/editor-test-harvester/meowdown/report.md`
- title: execute all actionable ProseKit and Meowdown harvest candidates
- decision to make: choose the smallest truthful Plate/Plite implementation for
  each accepted behavior candidate and prove it in its owning package/browser
  surface
- decision criteria: all five actionable packets are implemented or proven
  already correct without manufacturing a diff; package and browser proof pass;
  deferred raw-iOS/product-specific rows remain explicitly out of scope

Major lane:
- lane: mixed architecture/public API plus code-changing execution
- output type: production fixes, durable behavior tests, browser proof,
  changesets when published behavior changes, and updated execution evidence
- implementation expected: yes
- affected packages / surfaces: `packages/selection`, `packages/markdown`,
  `packages/dnd`, `apps/plite/tests/plite-browser`, the cursor-overlay demo,
  harvest reports, and this goal plan
- dominant risk: importing donor-specific ProseMirror/hidden-Markdown machinery,
  changing DnD public shape without a better owner contract, or overstating
  desktop/synthetic browser proof as raw iOS

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Prompt requirement ledger:
| Requirement | Scope / stop rule | Deliverable | Verification | Status |
|-------------|-------------------|-------------|--------------|--------|
| `go all` after the two harvests | Execute every actionable `Next Slice` row; do not reinterpret covered/rejected/deferred rows as implementation requests | Five owner-level behavior packets | Packet ledger, focused tests, browser proof, review | captured |
| ProseKit selection candidate | Nested editable pointer/focus ordering only | Selection test and minimal owner fix | Focused selection test plus real demo replay | captured |
| Meowdown Markdown fragment candidate | Open fragments; no ProseMirror slice/API copy | Markdown test and minimal codec/plugin fix | Focused Markdown test | captured |
| Meowdown DnD candidate | Captured-source authority/revision safety; no speculative public machinery | DnD behavior test and minimal contract change | Focused DnD test, source/API audit, two-editor browser proof when runnable | captured |
| Meowdown CommonMark candidate | Bounded deterministic corpus; AST stability, not byte equality | Corpus/property test and necessary Markdown fixes | Focused Markdown test with stable seed/cases | captured |
| Meowdown checklist candidate | Leading checklist at document edge | Plite browser regression row and minimal raw-owner fix if red | Focused Chromium and WebKit row, 5/5 warm when native focus/selection applies | captured |
| Raw iOS boundary | Do not satisfy with desktop WebKit, mobile viewport, or synthetic touch | Explicit defer remains | Direct iOS Appium receipt is the only closure proof; not required for this goal | captured |
| Final handoff | No commit/push/PR; report exact files, tests, browser scope, review, changesets, and residual risks | Concise completion report | Evidence in this plan and final response | captured |
| Timing | No duration or hard stop requested | N/A | Outcome gates control stop | captured |

Timed checkpoint:
- requested duration: none
- semantics: N/A: the user requested outcome completion, not a timebox
- initial confidence score: N/A: exact five-packet and command gates replace a
  subjective score
- improvement loop: iterate one vertical behavior slice at a time until its
  owner tests pass, then close browser and review gates
- final score / loop closure: N/A: completion is binary across the five packets

Completion threshold:
- All five actionable harvest packets have durable tests and the smallest
  owner-level implementation required by the evidence:
  1. Cursor overlay nested-editable pointer/focus ordering.
  2. Markdown open-fragment clipboard serialization.
  3. Cross-editor DnD captured-source authority/revision guard, with
     `best-api` ownership review before any reusable contract change.
  4. A bounded deterministic CommonMark/property roundtrip corpus proving AST
     stability rather than byte equality.
  5. Leading-checklist document-edge navigation in the Plite browser matrix.
- Each packet records a genuine failing-before/passing-after test when behavior
  is missing. If current behavior already passes a correctly targeted new test,
  keep the coverage-only result and do not manufacture production churn.
- Focused package tests, owning typechecks, required Browser proof, P1
  `autoreview`, lint, release-artifact classification, and final goal-plan check
  pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-execute-prosekit-and-meowdown-harvest-candidates.md`
  passes.

Verification surface:
- Focused selection, Markdown, and DnD package tests plus source-first package
  typechecks.
- Focused Plite Chromium/WebKit browser rows and Browser replay of the durable
  hidden `/examples/plite/cursor-overlay-ordering` fixture; 5/5 warm runs for
  native focus/selection cases.
- Source audit of DnD public exports and contracts; `best-api` verdict recorded.
- One changeset per published package with a user-visible delta from `main`, or
  an exact no-artifact reason.
- `pnpm lint:fix`, scoped diff hygiene, P1 `autoreview`, and the autogoal
  completion checker.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute implementation: the user's `go all` instruction authorizes all five
  actionable rows.
- Preserve native selection, focus, clipboard, Markdown AST, and DnD safety
  laws; prefer behavior tests through public owners over donor implementation
  copies.
- Never describe desktop WebKit, mobile viewport, or synthetic touch as raw iOS
  or iPhone proof.
- Do not implement Meowdown's hidden-syntax editor, virtual caret, smart-dash
  policy, or image/software-keyboard behavior without a Plate owner and direct
  iOS Appium receipt.
- Do not hand-edit generated barrels, templates, or generated skill mirrors.
- Do not commit, push, or create a PR without a new explicit user instruction.

Boundaries:
- Source of truth: the two harvest reports, captured local donor commits,
  `VISION.md`, relevant `docs/vision/**`, current Plate/Plite owners, tests, and
  exports.
- Allowed edit scope: the owning selection, Markdown, DnD, and Plite browser
  test surfaces; minimal demo/fixture support; changesets; harvest execution
  evidence; this plan.
- External sources: local `../prosekit` and `../meowdown` only unless current
  repository and captured donor source cannot settle a narrow contract.
- Browser surface: the hidden `/examples/plite/cursor-overlay-ordering` fixture
  and focused Plite browser example rows; Browser is the normal QA surface.
- Tracker sync: N/A: no issue or PR is in scope.
- Non-goals: copy ProseMirror machinery; build a hybrid Markdown source editor;
  claim raw-device proof; broaden unrelated package APIs; release or publish.

Output budget strategy:
- Read exact owner files and bounded test/donor ranges first. Use `rg --files`,
  `rg -n`, counts, and targeted test filters; cap command output. Exclude
  `node_modules`, build output, coverage, `.next`, `.turbo`, and broad donor
  inventories already captured in the harvest artifacts.

Blocked condition:
- Stop only if an actionable packet requires a new product contract with no
  truthful owner, Browser/device tooling cannot execute the required final
  proof after supported recovery, or the same owner-level verification blocker
  recurs three consecutive goal turns with no safe alternative.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: execute the five accepted owner-level packets; preserve the raw-iOS
  and product-specific deferrals
- confidence: 0.97 from owner tests, engine rows, retry-free stability, Browser
  replay, package checks, and source audit
- next owner: user for any commit or PR request
- reason: all five actionable packets have local proof; only unrelated broad
  checkout failures and the deliberately deferred raw-iOS row remain

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-execute-prosekit-and-meowdown-harvest-candidates.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The nine-row prompt requirement ledger captures five packets, the raw-iOS boundary, timing, stop rule, deliverables, proof, and handoff. |
| Timed checkpoint parsed | no | N/A: no duration or hard stop was requested. |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read before the execution plan was created. |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path before implementation. |
| Source of truth read before analysis | yes | Both harvest `Next Slice` and matrix sections, donor files, root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read. |
| Major lane selected | yes | Mixed architecture/public-boundary review plus code-changing execution. |
| Decision criteria stated | yes | Five-packet threshold and coverage-only exception are explicit above. |
| Existing repo patterns / prior decisions checked | yes | Current owner tests, package exports, ContentSlice law, snapshot version/index, image document-edge browser proof, and existing CommonMark surface were inspected. |
| Helper stack selected | yes | `autogoal`, `major-task`, `best-api`, `tdd`, `docs-creator`, `changeset`, Browser, and final P1 `autoreview`; no panel or external research. |
| External research decision recorded | no | N/A: captured local donor commits and current repository source settle the contracts. |
| Implementation expectation recorded | yes | User's `go all` authorizes all five actionable rows; covered/rejected/deferred donor rows remain out of scope. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` owns edits and proof; `../prosekit` and `../meowdown` are read-only evidence. |
| Branch / PR expectation decided | no | N/A: no commit, push, or PR was requested; use the current checkout as-is. |
| Output budget strategy recorded | yes | Exact-file reads and capped searches are recorded above; one accidental broad search is logged below. |
| Docs pack selected | yes | Supporting internal behavior reports and this execution ledger may change; public docs are not required. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read. |
| Docs lane selected | yes | Internal spec/law/behavior evidence only; no public page topology change. |
| Target docs and nearest sibling docs read | yes | Both donor reports, inventories/index conclusions, and the completed harvest goal plan were read. |
| Docs style doctrine read | yes | Main `docs-creator` rule read; its extra public-page references are N/A because no MDX/public docs are planned. |
| Documented source owner identified | yes | Behavior truth lives in owner tests/source; harvest reports only record execution status and proof width. |
| Browser pack selected | yes | Native focus/selection and document-edge behavior require browser proof. |
| Browser route / app surface identified | yes | Hidden `/examples/plite/cursor-overlay-ordering` plus `apps/plite/tests/plite-browser/donor/examples/check-lists.test.ts` on `/examples/plite/check-lists`. The general block loader is independently broken by a missing generated-index import. |
| Browser tool decision recorded | yes | Browser for both real example fixtures; repository Playwright scripts for durable Chromium/WebKit rows. Chrome/Computer are N/A. |
| Console/network caveat policy recorded | yes | Final Browser replay records console errors; network is checked only for failed route/assets because both cases are local. |
| Observable browser case captured | yes | `PSK-VIRTUAL-SELECTION-001`: ProseKit `3fbfe79`, nested editable primary pointer clears before focus; exact package test plus general overlay route. `MEOWDOWN-DOC-EDGE-001`: Meowdown `5b99629`, leading checklist, collapse from tail, document-start shortcut, expect model and DOM caret `[0,0]:0` in Chromium/WebKit. Final local fingerprints are recorded after all edits. |
| Package/API pack selected | yes | Three published Plate packages may change behavior; DnD public boundary needs explicit review. |
| Public surface or package boundary identified | yes | `ElementDragItemNode` is exported; best API is no new public field—capture drag-source authority behind the existing hook. Markdown and selection behavior stay inside existing plugin contracts. |
| Release artifact path selected | yes | Patch changesets for every published package with a final user-visible production delta; test-only Plite browser coverage gets no changeset. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read; one package per file and delta from `main`. |
| Barrel/export impact decision recorded | no | N/A: no export or exported file layout change is planned; rerun `pnpm brl` only if that changes. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Checklist closure notes:
- Duration, external web research, Chrome/Computer, public MDX parsing, plugin
  page rules, clean pushed-ref proof, and registry changelog are N/A. The user
  requested local outcome completion without a timebox, external source, native
  browser/OS surface, public docs page, commit, push, PR, or registry-source
  change.
- Browser screenshots are not the cursor oracle; observable store state and
  focus ownership are. The checklist route also has a captured final-state
  screenshot, while its exact caret endpoints come from native selection.
- The hidden cursor route is permanent source-backed proof scaffolding shared by
  `apps/www` and `apps/plite`, not a temporary stub or generated-file bypass.
- The local checkout is the only claimed boundary. Nothing is described as
  pushed, merged, released, shipped, or raw-iOS proven.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Execute five packets with owner and browser proof | Five packets have red/green coverage and the exact evidence below. |
| Current-state source audit | yes | Map owners and boundaries | Selection, Markdown, DnD, Plite browser, reports, and release artifacts are mapped. |
| Decision criteria closure | yes | Close every accepted row | Five actionable rows are complete locally; raw iOS and hidden-source product policy remain deferred. |
| Options / tradeoffs / rejection record | yes | Record chosen and rejected shapes | Private DnD authority, recursive open-fragment Markdown, and durable hidden browser fixtures won; donor transport/API copies lost. |
| Review / pressure pass | yes | Run P1 review | Three scoped P1 invocations completed after the full bundle exceeded the pass limit. No fourth invocation is legal. |
| Review findings closure | yes | Resolve current findings | Two Markdown findings were fixed red/green; one DnD finding was rejected by source branch plus exact test; the final Browser finding was resolved by real Chromium/WebKit/Browser proof. |
| External-source audit | no | N/A | Local captured donor commits and current repo source settled every contract. |
| Implementation gates | yes | Close code, browser, docs, and package gates | Owner tests, typechecks, browser engines, lint, changesets, reports, and diff hygiene are recorded below. |
| Final handoff contract | yes | Record outcome and limits | Contract below distinguishes local completion from delivery and raw-device proof. |
| Final lint | yes | Run root and scoped lint | Task files pass scoped Ultracite. Root `pnpm lint:fix` reaches only unrelated `tooling/e2e/font-size-selection.test.ts` `no-promise-executor-return` failures. |
| Output budget discipline | yes | Bound output and record misses | Exact-file/capped commands were used after the logged broad-output misses. |
| Timed checkpoint | no | N/A | No duration or hard stop was requested. |
| Goal plan complete | yes | Run the named checker | Final checker command is the last plan gate after this closure record. |
| Docs source-backed claim audit | yes | Audit report claims | Every execution claim below maps to current source, owner tests, or Browser output. |
| Docs links / routes / previews | yes | Verify referenced local leaves | Both report links, inventory links, plan path, and example routes resolve locally. |
| Docs MDX/content parser | no | N/A | Only internal Markdown reports and this plan changed. The combined www typecheck still ran `build:source` and passed docs parity. |
| Plugin page specifics | no | N/A | No public plugin page changed. |
| Browser interaction proof | yes | Exercise both final routes | Fresh Browser sessions replayed cursor state/focus and checklist document-edge selection. |
| Browser console/network check | yes | Check final local pages | Both final Browser tabs reported zero warnings/errors; no failed requests or asset gaps appeared. |
| Browser final proof artifact | yes | Record observable evidence | Cursor `present -> cleared`, nested focus; checklist `Finish here.` offset 12 -> `Start here.` offset 0, collapsed and editor-focused. |
| Exact case replay | yes | Recheck all applicable claim fields | Final Browser and engine rows cover cursor store/focus and checklist text/native caret endpoints. |
| Final ref and fingerprints | yes | Record HEAD and SHA-256 | `HEAD` is `1fb72c581095f23ddba3f597f41e8b10608283ef`; runtime fingerprints are below. |
| Clean final runtime | no | N/A | This is an uncommitted local candidate on the current checkout. No pushed-ref or shipped claim is made. |
| Retry-free stability | yes | Run 5/5 per reported engine | Final cursor and checklist rows each passed 5/5 in Chromium and 5/5 in WebKit, all with retries disabled. |
| Public API / package boundary proof | yes | Audit exports and contract shape | No export or public item field changed. DnD source authority is a private symbol-backed hook snapshot. |
| Release artifact classification | yes | Classify each surface | Selection, Markdown, and DnD are published runtime behavior; Plite examples/tests and reports are test/internal support. |
| Published package changeset | yes | Add one patch changeset per package | `.changeset/nested-cursor-focus.md`, `open-markdown-fragments.md`, and `safe-cross-editor-drag.md`; no forbidden minor. |
| Registry changelog | no | N/A | No `apps/www/src/registry/**` source changed. Example registry wiring is outside copied registry UI. |
| No release artifact | yes | Classify non-package files | Browser examples/tests and harvest reports are test/internal evidence with no separate release artifact. |
| Package typecheck/build/test | yes | Run owner checks | Selection, Markdown, DnD, and Plite targets pass; combined Turbo reached 63/64 and stopped only at the unrelated www error below. |
| Barrel/export generation | no | N/A | No export or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt ledger, donors, Vision, owners, skills | current-state map |
| Current-state map | complete | Owner/source/test/API audit | options |
| Options and recommendation | complete | Private authority and native-owner choices recorded | review |
| Review / pressure pass | complete | Three P1 invocations; cap exhausted | implementation |
| Implementation or plan artifact | complete | Five packets, three changesets, reports, durable fixtures | verification |
| Verification | complete | Owner tests, engines, Browser, lint, hashes | closeout |
| Closeout | complete | This record and final checker | final response |

Findings:
- Fact: `ContentSlice` open depths needed recursive wrapper removal while using
  the existing Markdown codec to retain inline marks.
- Fact: a cross-editor drag must carry drag-start content, but deletion remains
  legal only while the source document children identity is unchanged.
- Fact: the general www block loader is independently broken because the
  committed generated index imports missing `registry/ui/ai-menu.tsx`.
- Fact: raw iOS image/software-keyboard behavior still has no direct Appium
  receipt and is outside this goal.
- Inference: source-private DnD authority is safer than extending the exported
  drag item with a version contract that consumers could misuse.
- Recommendation: keep all five packets and the durable cursor fixture; do not
  import ProseMirror transport, hidden-Markdown UI, or synthetic iOS claims.

Decisions and tradeoffs:
- Keep the cursor fix in `CursorOverlayPlugin` and a hidden shared proof example;
  do not repair or regenerate the unrelated registry loader.
- Serialize Markdown fragments recursively by open depth. Preserve canonical
  AST semantics, not donor byte layout.
- Keep drag-source children identity and captured elements private to
  `useDndNode`; same-editor moves retain the existing branch.
- Use a fixed 12-case CommonMark corpus. Unbounded fuzz would add runtime and
  flake surface without better ownership evidence.
- Add the leading checklist as a query fixture so the normal example stays
  unchanged and the browser row is deterministic.

Implementation notes:
- `packages/selection`: primary nested-editable mousedown removes only the
  stored selection cursor; controls and secondary presses remain unchanged.
- `packages/markdown`: open fragments remove every unselected structural
  wrapper, retain inline marks, and fall back to raw child text for code lines.
- `packages/dnd`: drag-start elements are inserted cross-editor; edited sources
  are retained, while selection-only changes still permit source deletion.
- `apps/plite` and `apps/www`: hidden cursor fixture plus browser row, and a
  leading checklist query case plus document-start row.

Review fixes:
- Accepted: nested open fragments lost inline formatting. Added a red/green
  bold case and retained Markdown serialization for inline children.
- Accepted: multi-depth open fragments unwrapped only one structural level.
  Added a red/green blockquote-plus-heading case and recursive depth handling.
- Rejected: same-editor DnD would duplicate after an unrelated edit. The
  same-editor branch exits before the cross-editor guard; an exact regression
  test passes.
- Accepted: cursor proof was synthetic only. Added the hidden browser fixture,
  focused Chromium/WebKit rows, 5/5 engine repeats, and final Browser replay.
  This was resolved after invocation 3; the three-invocation cap forbids a
  fourth review, so no claim of reviewer-clean status is made.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generated registry demo failed on missing imports | 2 | Restart once, audit HEAD, then use an owner-direct durable fixture | Fresh compile exposed missing `ai-menu.tsx`; no generated file changed. |
| Cursor fixture exposed schema, optional-plugin, test-id, and native-focus differences | 4 | Fix each owning fixture contract rather than weaken the oracle | Added `ParagraphPlugin`, real `BlockSelectionPlugin`, configured test id, and explicit nested focus ownership. |
| Managed runner rejected repeat arguments | 1 | Use documented direct mode | Final direct Chromium/WebKit repeats passed. |
| Full P1 review bundle exceeded eight passes | 1 | Use coherent scoped bundle | Three allowed scoped invocations completed. |
| Broad `check:plite:dev` failed outside this packet | 1 | Rerun exact failures directly | Same two pre-existing `@platejs/plite-react` failures reproduced; no scope expansion. |
| Combined typecheck stopped in unrelated www source | 1 | Preserve passing target results and record exact owner | Only `src/lib/block-preview-page.tsx(80,41)` failed after 63 successful tasks. |
| Root lint stopped in unrelated e2e source | 2 | Run scoped task-file lint | Task files pass; only `tooling/e2e/font-size-selection.test.ts` remains. |
| Broad searches/check output exceeded the intended budget | 2 | Switch to exact files, caps, and focused commands | All later reads and proof commands were bounded. |

Verification evidence:
- Selection: full package `95` passed.
- Markdown: focused plugin file `23` passed; full package `200` passed with four
  snapshots and `356` expects; CommonMark slow file `27` passed.
- DnD: full package `23` passed with `34` expects.
- Checklist: full file `4/4` Chromium and `4/4` WebKit; exact final row `5/5`
  Chromium and `5/5` WebKit, retry-free.
- Cursor: focused row `1/1` Chromium and `1/1` WebKit; exact final row `5/5`
  Chromium and `5/5` WebKit, retry-free.
- Final Browser cursor: state `present -> cleared`; focus owner
  `data-test-id=nested-editable`, label `Nested cursor editor`; zero logs.
- Final Browser checklist: collapsed native caret moved from `Finish here.`
  offset `12` to `Start here.` offset `0`; editor remained active; zero logs.
- Typechecks: selection, Markdown, DnD, and Plite passed. Combined Turbo ran 63
  successful tasks before the unrelated www `block-preview-page.tsx(80,41)`
  error. Docs source and registry parity passed inside that command.
- `pnpm check:plite:dev` passed affected typecheck/integration phases, then hit
  two unrelated existing `@platejs/plite-react` rows: `forced model selection
  export rebuilds an unchanged native range` and `forced DOM coverage export
  rebuilds a fresh native range`. Focused rerun reproduced both.
- Lint: scoped task files pass Ultracite. Root lint is blocked only by unrelated
  `tooling/e2e/font-size-selection.test.ts` promise-executor returns.
- Diff hygiene: scoped `git diff --check HEAD -- <task files>` passed.
- Final ref: `1fb72c581095f23ddba3f597f41e8b10608283ef` plus uncommitted local changes.
- Runtime SHA-256:
  - selection source `5de3575d23dece777f1a3628d2b03610f9a4c27127bd2398be98104827abd4ce`,
    test `dffa651db2e00e24176ecb70a6b094d5ec2720c1c3416ab69f6ad2d878e69b1b`
  - Markdown source `90200c9727b30044197e31f02e2ef235dcf84687004841643fb2de2482ecddc2`,
    test `43eda7e156e8fb98dff82ec38fb0f7ab41ba8d4fd9398770279e2c7d6681c2a9`,
    corpus `48fb47d3827046cd5d0f879ab2b67ed7a341947d71b4b5b370ac52ee73a7a973`
  - DnD source `034e323fa7292d38b33c60b2ddcc6bd3ea34624ebff7a139d50c9c240af97cc6`,
    test `766983620573aacc46202f3bfe8d82fcd0aa9af8082db2282f2244b8f9540a0e`
  - checklist fixture `26eafc4d0738723f807a35a279a275e72f6e45f4ec647d5bccd6c177afc4bcee`,
    test `cddcd7031b43679d446bf415d096c72074e11aa1df056efc1ff0c95ca6ffb863`
  - cursor fixture `602141b64a826057411cac7e1352263549a16502b153c7d4746e1f2c959d4c2f`,
    loader `c194ecac2fe9f54567a7ffeb7f66d01e832faff95cd5a9e2992b62e0122db145`,
    registry `67d86c67283a2f6736f53d7003f50ac299a5668910a4c8d4d03df6b80bc34311`,
    test `c01a2d1a14dc46d5dff3d8d7acf78ea8943e85670a8e7f7f8c12d0ccfb1c5008`

Final handoff contract:
- Recommendation: keep all five local packets.
- Confidence: `0.97` for local behavior; no delivery claim.
- Evidence: owner tests, source-first checks, two browser engines, retry-free
  repeats, fresh Browser replay, P1 review, changesets, and exact fingerprints.
- Tests / commands: listed above.
- Browser proof: final shared Plite export, fresh tabs, exact state/focus/caret,
  and zero logs.
- PR / tracker: N/A; no commit, push, PR, or public issue mutation was requested.
- Caveats: unrelated root www/typecheck/lint and Plite React failures remain;
  raw iOS is deliberately deferred; review cap prevents a fourth P1 invocation.
- Next owner: user, if a commit or PR is wanted.

Timeline:
- 2026-08-21T10:49:15.064Z Major-task goal plan created.
- 2026-08-21 Five behavior packets implemented and verified locally.
- 2026-08-21 Final Chromium, WebKit, Browser, lint, typecheck, changeset,
  fingerprint, and review evidence recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response; user owns any delivery request |
| What is the goal? | Execute all five actionable ProseKit/Meowdown harvest packets with owner and browser proof |
| What have I learned? | Private DnD authority, recursive fragment depth, and durable native browser fixtures are the truthful shapes |
| What have I done? | Implemented five packets, added three changesets, updated reports, and closed local proof |

Open risks:
- The checkout-wide www typecheck, root lint, and `check:plite:dev` are not green
  for unrelated pre-existing files/tests named above.
- Raw iOS image/software-keyboard behavior remains unproven and deferred.
- The local work is uncommitted and undelivered.
