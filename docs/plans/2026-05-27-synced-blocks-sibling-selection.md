# synced blocks sibling selection

Objective:
Fix Slate v2 Synced Blocks selection/navigation so synced content roots behave
like ordinary sibling blocks for Shift+Arrow keyboard expansion and mouse
drag/click selection across root boundaries. Complete only when focused browser
repro rows for `/examples/synced-blocks` fail before the fix and pass after for
cross-boundary Shift+ArrowLeft/Right/Up/Down, Cmd/Meta+Shift boundary movement
where applicable, and mouse selection across before/synced/after blocks;
affected shared behavior remains green for `/examples/hidden-content-blocks`
and `/examples/multi-root-document`; focused Slate React/DOM package tests,
owning package typecheck/lint, Chromium Playwright proof, local autoreview, and
this plan's autogoal checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-27-synced-blocks-sibling-selection.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user bug report plus active autogoal
- id / link: latest user prompt, `/examples/synced-blocks`
- title: Synced Blocks must select like sibling blocks
- acceptance criteria: Shift+Arrow and mouse selection through Synced Blocks
  feel like selecting ordinary adjacent paragraph blocks; hidden-content and
  multi-root shared behavior does not regress; public API stays stable unless
  evidence proves it cannot carry the behavior.

Completion threshold:
- Focused Synced Blocks Playwright rows reproduce at least one pre-fix failure
  for Shift+Arrow and one pre-fix failure for mouse selection across content
  root boundaries.
- The same rows pass after the fix, including forward and backward selection
  paths through before paragraph, first shared synced block, between paragraph,
  separate synced block, second shared copy, and after paragraph.
- Existing hidden-content shifted-boundary behavior still passes.
- Existing multi-root document root navigation/selection/history focused rows
  still pass.
- Focused package tests for changed Slate React/DOM internals pass.
- Owning package typecheck and scoped lint/format pass.
- Local autoreview for `Plate repo root` reports no accepted/actionable findings.
- Release artifact decision is closed with patch changesets if published
  package behavior changed.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-synced-blocks-sibling-selection.md` passes.

Verification surface:
- `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts`
  failing-then-passing rows for Shift+Arrow and mouse selection.
- `apps/www/tests/slate-browser/donor/examples/hidden-content-blocks.test.ts`
  shifted-boundary focused row.
- `apps/www/tests/slate-browser/donor/examples/multi-root-document.test.ts`
  affected focused rows.
- Focused `packages/slate-react/test/*` contract tests for view-boundary,
  content-root navigation, keyboard input, selection, projected commands, or
  mouse/import behavior changed by this task.
- `Plate repo root`: owning package typecheck, build if needed, scoped lint/format,
  and local autoreview.
- `plate-2`: this plan and final autogoal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve public API: `<Editable root>`, `slots.contentRoot`, and
  `slots.contentBoundary`.
- Keep one runtime editor with many views. Do not implement one editor per
  synced block.
- Fix shared root-boundary selection ownership, not only the Synced Blocks
  example fixture.
- Keep native-affordance claims honest. If a browser-native affordance cannot
  match sibling blocks, record the capability gap with proof.

Boundaries:
- Source of truth: latest user prompt, active goal, prior unified
  view-boundary plan, and live `Plate repo root` source/tests.
- Allowed edit scope: `packages/slate-react/**`,
  `packages/slate-dom/**` if DOM selection/root helpers require
  it, `apps/www/tests/slate-browser/donor/examples/**`,
  `apps/www/src/app/(app)/examples/slate/_examples/synced-blocks.tsx` only if fixture coverage
  genuinely needs more data, `Plate repo root/.changeset/**`, and this plan.
- Browser surface: `/examples/synced-blocks`, plus regression proof on
  `/examples/hidden-content-blocks` and `/examples/multi-root-document`.
- Tracker sync: N/A, no tracker item.
- Non-goals: PR creation, Notion permission/server sync, slate-yjs adapter
  compatibility, product synced-block UI kits, and arbitrary public
  `ViewSelection` API exposure.

Blocked condition:
- Block only if three distinct implementation/proof attempts show the current
  Slate model cannot make Synced Blocks match sibling block selection without a
  new public API or an unavoidable browser-native limitation, or if required
  `Plate repo root` verification cannot run because of a persistent environment
  blocker that survives the repo-approved retry.

Task state:
- task_type: browser-visible runtime bug / selection architecture fix
- task_complexity: normal-to-major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for checker

Current verdict:
- verdict: fixed in `Plate repo root`
- confidence: high for covered desktop Chromium behavior; mobile/native
  affordance gaps remain explicitly classified by existing test matrix.
- next owner: final response
- reason: Synced Blocks now keeps one runtime editor with many mounted views,
  shares projected selection state across view editors, resolves repeated synced
  roots by visible owner, and passes keyboard, mouse, history, focus, package,
  typecheck, lint, browser, and autoreview gates.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-synced-blocks-sibling-selection.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User invoked `autogoal`; loaded `autogoal`, `changeset`, and review rules during the lane. |
| Active goal checked or created | yes | `get_goal` confirmed active Synced Blocks sibling-selection goal for `docs/plans/2026-05-27-synced-blocks-sibling-selection.md`. |
| Source of truth read before edits | yes | Read latest prompt, active goal, prior unified view-boundary context, Synced Blocks example/tests, hidden-content tests, multi-root tests, and shared selection/navigation files. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Searched solution notes for content-root, view-selection, Shift+Arrow, mouse selection, multi-root, and DOM selection ownership. |
| TDD decision before behavior change or bug fix | yes | Add failing Synced Blocks Playwright rows before runtime edits; browser proof is the primary behavior guard. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested and repo says no proactive git hygiene. |
| Release artifact decision | yes | Published `slate-react` runtime behavior changed; added `Plate repo root/.changeset/synced-block-selection.md`. |
| Browser tool decision for browser surface | yes | Use owning `Plate repo root` Playwright Chromium rows for route proof. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Browser pack selected | yes | `browser` pack applied. |
| Browser route / app surface identified | yes | `/examples/synced-blocks`, with hidden-content and multi-root regression routes. |
| Browser tool decision recorded | yes | Playwright integration tests are the owning browser proof for `Plate repo root`. |
| Console/network caveat policy recorded | yes | Runtime/page errors fail targeted rows when relevant; final evidence records console/network caveat. |
| Package/API pack selected | yes | `package-api` pack applied. |
| Public surface or package boundary identified | yes | `slate-react` runtime behavior is in scope; `slate-dom` only if DOM selection bridge needs edits. Public API should stay stable. |
| Release artifact path selected | yes | `Plate repo root/.changeset/**` if package runtime behavior changes. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `/Users/zbeyens/git/plate-2/.agents/skills/changeset/SKILL.md`; changeset uses one package, patch bump, user-impact wording. |
| Barrel/export impact decision recorded | yes | No package export or exported file-layout change; `pnpm brl` N/A. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the shared runtime/view ownership boundary, not only
      the Synced Blocks fixture.
- [x] Release artifact requirement recorded: `slate-react` patch changeset.
- [x] Final handoff shape decided: concise bug-fix summary with tests,
      browser proof, autoreview result, and no PR/tracker sync.
- [x] Branch handling recorded as N/A: no branch, commit, push, or PR requested.
- [x] Local-env-rot retry policy recorded as N/A: no corruption-shaped failure.
- [x] Workspace authority recorded: all runtime/browser proof ran in
      `Plate repo root`; autogoal checker runs in `plate-2`.
- [x] High-risk note recorded: runtime selection/focus/history behavior changed;
      proof covers package contracts, typecheck, lint, and browser routes.
- [x] Autoreview target selected from actual dirty local `Plate repo root` diff.
- [x] Agent-native review marked N/A: no `.agents`, `.claude`, `.codex`, skill,
      hook, command, prompt, or user-action tooling changed.
- [x] Browser pack: route, interaction path, and visible outcomes recorded.
- [x] Browser pack: proof uses repo-owned Playwright Chromium integration rows.
- [x] Browser pack: runtime/page error patterns covered by existing rows where
      relevant; final sweep had 37 passing rows.
- [x] Browser pack: exact browser command and pass count recorded below.
- [x] Package/API pack: public API stayed stable; package runtime behavior and
      release-artifact impact recorded.
- [x] Package/API pack: `.changeset/synced-block-selection.md` added for
      `slate-react` patch behavior delta.
- [x] Package/API pack: `changeset` skill loaded and prose checked.
- [x] Package/API pack: registry changelog N/A because no registry-only work.
- [x] Package/API pack: compatibility decision explicit: no public API or
      migration change.
- [x] Package/API pack: package-owned tests/typecheck recorded below.
- [x] Package/API pack: generated barrels N/A because no exports or exported
      file layout changed.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused Synced Blocks rows passed; full affected Chromium sweep passed 37/37; package contracts, typecheck, lint, autoreview, changeset, and plan checker are recorded. |
| Bug reproduced before fix | yes | Pre-fix browser rows failed: repeated Shift+ArrowDown stayed at `[0,0]` instead of moving to `[1,0]`; mouse drag across root boundary produced native `"\n"`/no view selection; Cmd+Shift reverse wrote selection to the child copy instead of shared runtime. |
| Targeted behavior verification | yes | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "keeps ordinary Shift\\+Arrow|extends Shift\\+Arrow through synced|extends Shift\\+ArrowLeft|Cmd\\+Shift\\+Arrow|mouse selection across synced"` passed 5/5. |
| TypeScript or typed config changed | yes | `bun --filter slate-react typecheck && bun typecheck:site` passed in `Plate repo root`. |
| Package exports or file layout changed | no | N/A: no exports or exported file layout changed; `pnpm brl` not needed. |
| Package manifests, lockfile, or install graph changed | no | N/A: no manifests, lockfile, or install graph changed. |
| Agent rules or skills changed | no | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | All Slate runtime/browser checks ran from `Plate repo root`; autogoal checker runs from `plate-2`. |
| Browser surface changed | yes | Synced Blocks example changed; Chromium integration proof passed on target and sibling-risk routes. |
| Browser final proof | yes | Exact browser command below passed 37/37; no screenshot needed because repo-owned Playwright is the authoritative interaction proof. |
| CI-controlled template output changed | no | N/A: no template output touched. |
| Package behavior or public API changed | yes | Runtime behavior changed without public API change; `slate-react` patch changeset added. |
| Registry-only component work changed | no | N/A: no registry-only component work. |
| Docs or content changed | yes | This plan only; claims are command-backed and route-backed. |
| High-risk mini gate | yes | Failure mode was stale or wrong projected selection across root views; proof covers view selection, focus, history, keyboard, mouse, typecheck, browser, and autoreview. |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | N/A: no local-env-rot failure shape appeared. |
| Autoreview for non-trivial implementation changes | yes | `PYTHONUNBUFFERED=1 /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --no-web-search --thinking low --output /tmp/slate-v2-autoreview.txt --json-output /tmp/slate-v2-autoreview.json` passed clean after accepted findings were fixed. |
| PR create or update | no | N/A: no PR requested. |
| PR proof image hosting | no | N/A: no PR body. |
| Tracker sync-back | no | N/A: no tracker item. |
| Final handoff contract | yes | Filled below with outcome, proof, review, and caveats. |
| Final lint | yes | `bun biome check --fix` on 15 touched files passed with no fixes on final run. |
| Goal plan complete | yes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-synced-blocks-sibling-selection.md` to run after this update. |
| Browser interaction proof | yes | Full affected Chromium sweep passed 37/37. |
| Browser console/network check | yes | Existing runtime-error guards cover relevant Synced Blocks focus/path failures; final sweep reported no failing browser/runtime rows. |
| Browser final proof artifact | yes | Command output is the final proof artifact; no visual screenshot required for this behavior test. |
| Public API / package boundary proof | yes | Source audit: public `<Editable root>`, `slots.contentRoot`, and `slots.contentBoundary` stay intact; no exported barrels changed. |
| Release artifact classification | yes | Published runtime behavior delta in `slate-react`; not registry-only, docs-only, or agent-only. |
| Published package changeset | yes | `Plate repo root/.changeset/synced-block-selection.md` uses `"slate-react": patch`; no forbidden minor on core packages. |
| Registry changelog | no | N/A: no registry-only work. |
| No release artifact | no | N/A: release artifact exists. |
| Package typecheck/build/test | yes | 64 Slate React contract tests passed; `slate-react` and site typechecks passed. |
| Barrel/export generation | no | N/A: no exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read prompt, active goal, prior plans, examples, tests, and selection/navigation internals. | implementation complete |
| Implementation | complete | Shared view-selection store, owner-aware content-root navigation, mouse projected selection import, focus preservation, root-chrome cleanup, Synced Blocks fixture, tests, and changeset landed. | verification complete |
| Verification | complete | Unit/typecheck/lint/browser/autoreview gates passed. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | complete | Plan updated; checker is the final remaining command. | final response |

Findings:
- Existing tests covered one-step projected Shift+Arrow but not repeated
  Shift+Arrow extension, Shift+ArrowLeft/Right, Cmd+Shift boundary movement, or
  mouse drag across root boundaries.
- Synced Blocks repeated shared roots need owner identity from the current view,
  not the first owner of a shared child root.
- Native mouse drag across separate contenteditable roots can resolve as newline
  or root-local DOM selection unless Slate imports DOM endpoints into a projected
  visible-order selection.
- Ordinary Shift+Arrow inside a normal paragraph must remain native/model-local;
  root-local projected fallback is valid only while an existing projected view
  selection is being extended.
- Direct focus after projected selection can export the collapsed model
  selection over the sidecar view selection unless focus avoids DOM model-sync
  while a projected selection exists.

Decisions and tradeoffs:
- Keep the long-term architecture: one runtime editor, many root/view editors.
- Store projected view selection by owning runtime editor so root clones and
  repeated synced copies share the same sidecar state.
- Resolve content-root movement through the current mounted owner view before
  falling back to first owner for a child root.
- Keep public API stable; Synced Blocks remains ordinary `<Editable root>` plus
  content-root slots.
- Make nested content-root editors focusable by default (`tabIndex = 0`) because
  mouse and keyboard parity requires real focusable editing surfaces.
- Clear projected sidecar selection whenever root chrome writes an ordinary root
  selection.
- Preserve projected selections during internal focus by focusing the DOM element
  without running model-selection DOM export.

Implementation notes:
- `view-selection.ts` keys read/write through `setSlateViewSelectionStoreKey`.
- `SlateRuntimeView` and `useSlateRootEditor` register view editors under their
  runtime editor key.
- `content-root-navigation.ts` supports repeated-root owner identity, horizontal
  and vertical projected extension, document-boundary Meta+Shift movement, and
  disables fresh root-local projected fallback unless extending an existing
  projected selection.
- `selection-controller.ts` imports cross-root mouse DOM endpoints into
  projected selections before nested-focus early returns.
- `browser-handle.ts` refocuses the attached editor element after model-owned
  insert/undo/redo commands so active synced copies keep focus.
- `focus-slate-editable.ts`, `keyboard-input-strategy.ts`, and
  `runtime-before-input-events.ts` preserve projected selections during internal
  focus repair.
- `site/examples/ts/synced-blocks.tsx` lets the block shell stay selectable and
  makes toolbar chrome `user-select: none`.

Review fixes:
- Autoreview P1: ordinary Shift+Arrow inside paragraphs was intercepted by
  root-local projected movement. Fixed with `allowRootLocalMovement` gated on an
  existing projected selection; added normal paragraph Shift+Arrow browser row.
- Autoreview P2: root chrome could restore a model selection while leaving a
  projected sidecar armed. Fixed by clearing view selection before root
  interaction writes normal selections; added `useSlateRootChrome` contract.
- Autoreview P2: internal focus could export model selection over a projected
  selection on cloned root editors. Fixed focus helper to element-focus only
  while view selection exists; routed internal redirects through the helper; added
  `focusSlateEditable` contract.
- Autoreview P2: shifted word-selection hotkeys ignored existing projected
  selections and fell through to stale collapsed model selection. Fixed
  projected word/line selection actions and added unit/browser coverage.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Synced Blocks padding-coordinate Playwright row did not hit root interaction controller | 1 | Move stale-sidecar proof to `useSlateRootChrome` unit contract | Removed brittle row; unit contract now covers actual branch. |
| Default autoreview hung with no structured output | 2 | Keep Codex engine but lower reasoning effort and write output files | `--thinking low` produced one P2, then clean after fix. |

Verification evidence:
- `packages/slate-react`: `bun test:vitest test/content-root-navigation-contract.test.ts test/focus-slate-editable-contract.test.ts test/keyboard-input-strategy-contract.test.ts test/view-boundary-graph-contract.test.ts test/view-selection-contract.test.ts test/projected-command-contract.test.ts test/projected-clipboard-contract.test.ts test/use-slate-history.test.tsx test/root-interaction-resolver.test.ts test/browser-handle-contract.test.ts test/target-runtime-contract.tsx test/use-slate-root-chrome.test.tsx` passed: 11 files, 64 tests.
- `Plate repo root`: `bun --filter slate-react typecheck && bun typecheck:site` passed.
- `Plate repo root`: `bun biome check --fix packages/slate-react/src/editable/browser-handle.ts packages/slate-react/src/editable/content-root-navigation.ts packages/slate-react/src/editable/root-interaction-controller.ts packages/slate-react/src/editable/selection-controller.ts packages/slate-react/src/editable/keyboard-input-strategy.ts packages/slate-react/src/editable/runtime-before-input-events.ts packages/slate-react/src/hooks/focus-slate-editable.ts packages/slate-react/src/view-selection.ts packages/slate-react/src/components/slate.tsx packages/slate-react/src/hooks/use-slate-runtime.tsx packages/slate-react/src/components/editable-text-blocks.tsx packages/slate-react/test/focus-slate-editable-contract.test.ts packages/slate-react/test/use-slate-root-chrome.test.tsx site/examples/ts/synced-blocks.tsx playwright/integration/examples/synced-blocks.test.ts` passed: 15 files checked, no fixes on final run.
- `Plate repo root`: debug-marker scan over touched files returned no matches.
- `Plate repo root`: focused Synced Blocks parity grep passed 5/5; additional word-extension row passed 1/1.
- `Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/synced-blocks.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/multi-root-document.test.ts --project=chromium` passed 37/37.
- `Plate repo root`: `PYTHONUNBUFFERED=1 /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --no-web-search --thinking low --output /tmp/slate-v2-autoreview.txt --json-output /tmp/slate-v2-autoreview.json` passed clean: no accepted/actionable findings.
- `Plate repo root`: `.changeset/synced-block-selection.md` added for `slate-react` patch.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high for covered desktop Chromium keyboard/mouse/history/focus behavior.
- Flow table:
  - Reproduced: Shift+Arrow, mouse drag, and Cmd+Shift root-boundary failures were reproduced by new Synced Blocks rows before fixes.
  - Verified: package contracts, typecheck, scoped lint, focused Synced Blocks rows, and 37-row affected browser sweep passed.
- Browser check: 37/37 Chromium rows on Synced Blocks, Hidden Content Blocks, and Multi Root Document.
- Outcome: Synced Blocks projected selection/navigation behaves like visible sibling blocks for covered keyboard and mouse flows while keeping shared state/history/focus.
- Caveat: Native browser affordance limitations for projected selections remain classified by the existing affordance matrix; this task did not claim full native find/IME/mobile/screen-reader parity.
- Design:
  - Chosen boundary: shared runtime view-selection plus content-root navigation and selection controllers.
  - Why not quick patch: example-only handlers would miss hidden-content, multi-root, history, repeated-copy, and command focus paths.
  - Why not broader change: one runtime/many views already supports the product model; no public API rewrite was needed.
- Verified: tests and review listed above.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker item.
- Browser proof: 37/37 Chromium rows on affected examples.
- Caveats: projected-selection native affordances stay explicitly degraded where browsers cannot expose a true single native selection.

Timeline:
- 2026-05-26T23:16:21.598Z Task goal plan created.
- 2026-05-27T02:52:19+02:00 Replaced brittle root-padding Playwright row with `useSlateRootChrome` stale-sidecar contract.
- 2026-05-27T02:52:29+02:00 Focused Synced Blocks parity rows passed 5/5.
- 2026-05-27T02:53:00+02:00 Slate React contract suite passed 61 tests before focus-review fix.
- 2026-05-27T02:54:45+02:00 Affected browser sweep passed 36/36 before final focus-review fix.
- 2026-05-27T03:06:00+02:00 Autoreview accepted P2 for cloned-editor focus ignoring projected selection.
- 2026-05-27T03:08:01+02:00 Added and passed `focusSlateEditable` contract.
- 2026-05-27T03:09:05+02:00 Final Slate React contract suite passed 63 tests.
- 2026-05-27T03:09:40+02:00 `slate-react` and site typechecks passed.
- 2026-05-27T03:10:25+02:00 Final affected browser sweep passed 36/36.
- 2026-05-27T03:11:55+02:00 Final autoreview passed clean.
- 2026-05-27T03:19:50+02:00 Added projected word-selection unit coverage after autoreview finding.
- 2026-05-27T03:20:55+02:00 Final Slate React contract suite passed 64 tests.
- 2026-05-27T03:21:30+02:00 Final affected browser sweep passed 37/37.
- 2026-05-27T03:23:00+02:00 Final autoreview passed clean after word-selection fix.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout, after implementation and verification. |
| Where am I going? | Run the autogoal checker, mark goal complete, final response. |
| What is the goal? | Make Synced Blocks select/navigate like sibling blocks while preserving hidden-content and multi-root behavior. |
| What have I learned? | See Findings and Decisions. |
| What have I done? | Implemented shared projected selection ownership, owner-aware navigation, mouse import, focus preservation, root-chrome cleanup, tests, changeset, and review fixes. |

Open risks:
- None known for covered desktop Chromium behavior. Residual browser-native
  affordance limitations remain intentionally documented by the projected
  affordance matrix.
