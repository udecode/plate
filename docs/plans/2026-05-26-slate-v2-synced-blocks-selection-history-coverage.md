# slate v2 synced blocks selection history coverage

Objective:
Expand Slate v2 Synced Blocks selection/history coverage and list the current
browser bugs around full-document keyboard navigation, Shift selection,
Cmd/Meta+Arrow behavior, and history focus across repeated content-root
projections.

Goal plan:
docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user prompt
- id / link: local chat request
- title: Synced Blocks full selection/history coverage
- acceptance criteria: list the bugs; cover Arrow navigation through the whole
  document in both directions; cover Shift and Cmd/Meta+Arrow behavior; cover
  history focus/selection across synced copies; update
  `/examples/synced-blocks` fixture if more coverage needs another synced block
  from a different document.

Completion threshold:
- `/examples/synced-blocks` has enough fixture data to prove repeated synced
  copies and a different synced document root.
- Focused browser tests cover ArrowDown and ArrowUp through the logical
  document, active-copy history undo/redo, Shift+Arrow, and Cmd/Meta+Arrow rows.
- Safe root-owned bugs found by those rows are fixed in `Plate repo root`; larger
  bugs are listed with exact repro and owner.
- Targeted Synced Blocks browser tests and relevant `slate-react` package tests
  pass, or unresolved rows are intentionally marked as known failing/skipped
  with reasons.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md` passes.

Verification surface:
- `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts`
- `packages/slate-react/test/content-root-navigation-contract.test.ts`
- Targeted Playwright on `http://localhost:3100/examples/synced-blocks`
- Focused `slate-react` Vitest when runtime/navigation code changes.
- Completion checker for this plan.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user prompt in this turn plus existing Synced Blocks code.
- Allowed edit scope: `packages/slate-react/**`,
  `apps/www/src/app/(app)/examples/slate/_examples/synced-blocks.tsx`,
  `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts`, and
  this plan.
- Browser surface: `http://localhost:3100/examples/synced-blocks`.
- Tracker sync: N/A, no tracker requested.
- Non-goals: Notion server sync, permissions, cross-page persistence,
  slate-yjs, and a broad selection engine rewrite beyond bugs proven here.

Blocked condition:
- Block only if the current selection model cannot represent a requested
  cross-root browser behavior without a larger architecture change; in that
  case record the exact failing row and owner instead of hiding it.

Task state:
- task_type: testing / browser regression coverage
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_complete

Current verdict:
- verdict: complete for safe root-owned fixes and coverage expansion; one larger
  cross-root expanded-selection row remains listed with repro and owner.
- confidence: 0.86
- next owner: selection architecture follow-up for cross-root expanded ranges.
- reason: full-document ArrowUp/ArrowDown, ArrowLeft/ArrowRight repeated-copy
  traversal, Cmd/Meta+Arrow document boundary movement, root isolation, and
  history focus are covered by focused Playwright/package rows.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `task`, `testing`, and `autogoal` loaded before edits. |
| Active goal checked or created | yes | Active goal created for this coverage slice. |
| Source of truth read before edits | yes | User prompt plus Synced Blocks source/test files read. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is live browser coverage on new local feature surface. |
| TDD decision before behavior change or bug fix | yes | Add browser/unit regression rows before or with fixes. |
| Branch decision for code-changing task | yes | No PR/commit requested; keep current checkout as-is. |
| Release artifact decision | yes | Existing synced content-root changeset covers public slot/API; this slice adds tests/bugfix unless public API changes. |
| Browser tool decision for browser surface | yes | Use Playwright for committed browser rows and in-app Browser/browser-use for final route proof if code changes affect visible behavior. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Browser pack selected | yes | Browser pack selected by scratchpad helper. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/synced-blocks`. |
| Browser tool decision recorded | yes | Playwright plus in-app Browser final proof if needed. |
| Console/network caveat policy recorded | yes | Runtime error guard for known Slate errors in browser tests; final browser proof records console caveat. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Done: run the named browser/package/typecheck/lint/check commands | `bun check`, focused Vitest, focused Playwright, all-project Synced Blocks Playwright, and completion checker close this threshold. |
| Bug reproduced before fix | yes | Done: encode rows in package/browser tests before closeout | Repeated-root exit/entry and history-focus bugs are covered by new regression rows; Shift+Arrow cross-root expansion is recorded as a larger follow-up. |
| Targeted behavior verification | yes | Done: run focused test/proof for changed behavior | Synced Blocks Playwright: 25 passed, 15 intentionally skipped outside Chromium; navigation contract Vitest passed. |
| TypeScript or typed config changed | yes | Done: run relevant typecheck | `Plate repo root`: `bun --filter slate-react typecheck` passed; `bun check` typecheck stage passed. |
| Package exports or file layout changed | no | N/A: no package export or file layout changes. | N/A: no `pnpm brl` required. |
| Package manifests, lockfile, or install graph changed | no | N/A: no manifest, lockfile, or install graph changes. | N/A: install not required. |
| Agent rules or skills changed | no | N/A: no `.agents` source edits. | N/A: generated skill sync not required. |
| Workspace authority proof | yes | Done: run verification in `Plate repo root`. | All package/browser commands were run with cwd `/Users/zbeyens/git/plate-2/Plate repo root` except the root autogoal checker for this plan. |
| Browser surface changed | yes | Done: exercise route by Playwright browser rows. | `PLAYWRIGHT_BASE_URL=http://localhost:3100 ... synced-blocks.test.ts` passed on Chromium and all configured projects. |
| Browser final proof | yes | Done: use exact browser verification caveat. | Proof is automated Playwright route interaction coverage, not a manual screenshot. |
| CI-controlled template output changed | no | N/A: no template output changed. | N/A. |
| Package behavior or public API changed | yes | Done: add changeset. | `Plate repo root/.changeset/synced-content-root-slots.md` covers editable content-root slot and active-copy navigation/history behavior. |
| Registry-only component work changed | no | N/A: not registry-only component work. | N/A. |
| Docs or content changed | yes | Done: source-backed plan only. | This plan records evidence; no user docs changed. |
| High-risk mini gate | yes | Done: record failure mode and boundary. | Runtime/browser behavior risk is root-owner identity drift; fixed at runtime context/navigation boundary and proved by repeated-copy tests. |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling changes. | N/A. |
| Local install corruption suspected | no | N/A: no failure matched local install corruption. | N/A: reinstall not run. |
| Autoreview for non-trivial implementation changes | yes | Attempted and blocked by tool/runtime failure. | Claude no-tools run hung and was killed; Codex no-tools rejected `--no-tools`; bounded Codex scoped run timed out after 180s with exit code 124 and no output. |
| PR create or update | no | N/A: no PR requested. | N/A: no `check` or PR body sync required. |
| PR proof image hosting | no | N/A: no PR body. | N/A. |
| Tracker sync-back | no | N/A: no tracker. | N/A. |
| Final handoff contract | yes | Done: fill fields below. | Final handoff records bugs, tests, caveats, and no PR/commit. |
| Final lint | yes | Done: run lint fixer and lint. | `Plate repo root`: `bun lint:fix` passed; `bun lint` passed. |
| Goal plan complete | yes | Done. | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md` passed. |
| Browser interaction proof | yes | Done: exercise route interactions. | Full keyboard paths covered by Playwright on `http://localhost:3100/examples/synced-blocks`. |
| Browser console/network check | yes | Done by test failure policy. | Playwright route tests would fail on runtime errors; no separate network assertion was needed for local static example. |
| Browser final proof artifact | yes | Done: exact caveat recorded. | Automated Playwright proof only; no screenshot artifact. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Synced Blocks example/tests and runtime navigation/history paths inspected. | implementation complete |
| Implementation | complete | Runtime content-root owner registry, active-copy navigation repair, history focus repair, and expanded fixture/tests added. | verification complete |
| Verification | complete | Focused package/browser gates and `bun check` passed. | closeout complete |
| PR / tracker sync | complete | N/A: no PR, commit, push, or tracker requested. | final response |
| Closeout | complete | Plan evidence recorded; autogoal checker run before final. | final response |

Findings:
- Existing Synced Blocks browser coverage does not exercise exiting the second
  mounted copy of a shared root. Source currently uses first-owner lookup for
  `owner.childRoot === currentRoot`, so repeated copies can exit at the wrong
  document position.
- Existing fixture has only one shared synced body root. Add a different synced
  document root so tests prove root isolation, not just repeated projection.
- Fixed bug: exiting a repeated shared content root used the first matching
  owner, so ArrowRight/ArrowDown/ArrowLeft/ArrowUp from the later copy could
  land beside the first copy instead of the active copy.
- Fixed bug: entering a later shared-root copy from the main document could
  focus the previously active or first mounted projection because target lookup
  was root-only instead of owner-path-aware.
- Fixed bug: keyboard undo/redo across main and synced roots restored content
  but could leave focus in the hotkey editor instead of the root whose operation
  was undone/redone.
- Fixed test bug: the synced body offset used a hard-coded `39`; the current
  text length is `43`, so tests now use the actual body string length.
- Larger bug left listed: `Shift+ArrowDown` across a root boundary creates a
  native newline selection while the Slate model selection stays collapsed in
  main and the synced root receives no selection. Owner: cross-root expanded
  selection / DOM-selection export architecture.

Decisions and tradeoffs:
- Put the fix in runtime content-root ownership and navigation/history repair,
  not in the Synced Blocks example. The example should be a consumer of the
  abstraction, not a pile of local focus patches.
- Add one separate synced document root to the example fixture. This is enough
  to prove repeated projection and root isolation without turning the example
  into a fake product.
- Do not force Shift+Arrow cross-root expansion into this slice. The model does
  not currently project a multi-root expanded range cleanly; hiding that under a
  local keyboard patch would be a bad fix.

Implementation notes:
- `packages/slate-react/src/hooks/use-slate-runtime.tsx` and
  `components/slate.tsx` now expose runtime content-root owner registration,
  active-owner lookup, and owner-path-to-view-editor lookup.
- `packages/slate-react/src/components/editable-text-blocks.tsx`
  registers each mounted content-root view against the owning element path.
- `packages/slate-react/src/editable/content-root-navigation.ts`
  uses active owner state on root exit and owner-specific view lookup on root
  entry; it also covers Cmd/Meta+Arrow document boundary movement.
- `packages/slate-react/src/editable/keyboard-input-strategy.ts`
  and `runtime-keyboard-events.ts` pass owner lookup into keyboard history
  repair.
- `packages/slate-react/src/hooks/use-slate-history.ts` restores
  focus to the latest non-selection commit operation root before falling back to
  selection-root repair.
- `apps/www/src/app/(app)/examples/slate/_examples/synced-blocks.tsx` now renders two copies of
  one shared body root plus a separate synced document root.
- `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` covers
  full ArrowDown and ArrowUp traversal, left/right repeated-copy traversal,
  Cmd/Meta+Arrow document boundaries, cross-root undo/redo focus, shared-root
  updates, separate-root isolation, duplicate, and unsync behavior.

Review fixes:
- Autoreview could not complete because the local review engines hung/timed out;
  no accepted autoreview findings were produced.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Claude no-tools scoped autoreview hung silently | 1 | Kill and try Codex variant | Killed after roughly 2m47s. |
| Codex no-tools autoreview rejected `--no-tools` | 1 | Try bounded scoped Codex run without that flag | Immediate CLI rejection. |
| Bounded Codex scoped autoreview timed out | 1 | Record review blocker and rely on direct tests/checks | Timed out after 180s with exit code 124 and no output. |

Verification evidence:
- `Plate repo root`: `bun lint:fix` passed.
- `Plate repo root`: `bun lint` passed.
- `Plate repo root`: `bun --filter slate-react typecheck` passed.
- `packages/slate-react`: `bun test:vitest -- test/use-slate-history.test.tsx test/content-root-navigation-contract.test.ts` passed: 2 files, 15 tests.
- `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium` passed: 10 tests.
- `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts` passed: 25 passed, 15 skipped. Skips are intentional non-Chromium skips for geometry/focus rows.
- `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "content root|vertically|clicking outside"` passed: 3 tests.
- `Plate repo root`: `bun check` passed: lint, package/site/root typecheck, package tests, `slate-layout`, and `slate-react` Vitest.
- `/Users/zbeyens/git/plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md` passed.
- Cleanup scan: `rg -n "console\\.log|test\\.only|\\.only\\(|debugger" ...` found only the pre-existing android input manager debug comment.
- Shift+Arrow probe: from main `p1` at `[0,0]` offset `2`, `Shift+ArrowDown` produced native selected text `"\n"`, kept outer Slate selection collapsed at `[0,0]` offset `2`, and left the first synced root selection `null`.

Final handoff contract:
- PR line: no PR, commit, or push requested.
- Issue / tracker line: no tracker requested.
- Confidence line: high for navigation/history fixes and coverage; medium for
  the broader Shift+Arrow follow-up because it needs explicit multi-root range
  model design.
- Flow table:
  - Reproduced: repeated-root exit/entry and history focus rows are reproduced
    by package/browser tests; Shift+Arrow bug reproduced by one-off browser
    probe.
  - Verified: focused package tests, Synced Blocks Playwright, editable-voids
    regression subset, lint, typecheck, and `bun check` passed.
- Browser check: automated Playwright proof on
  `http://localhost:3100/examples/synced-blocks`.
- Outcome: example fixture and coverage now exercise repeated shared roots, a
  separate synced document root, full keyboard traversal, Cmd/Meta+Arrow, and
  cross-root history focus.
- Caveat: cross-root expanded Shift selection remains a real bug and is not
  papered over.
- Design:
  - Chosen boundary: runtime-owned content-root owner/view registry plus
    navigation/history repair.
  - Why not quick patch: example-local keyboard code would still break the same
    abstraction for the next synced/rooted element.
  - Why not broader change: full multi-root expanded selection is a larger
    selection architecture task; this slice fixes safe owner identity bugs and
    records the remaining row.
- Verified: see verification evidence.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker requested.
- Browser proof: Playwright interaction proof on the Synced Blocks route; no
  screenshot artifact.
- Caveats: autoreview tool blocked; Shift+Arrow cross-root expansion remains.

Timeline:
- 2026-05-26T10:47:23.099Z Task goal plan created.
- 2026-05-26T12:50:00Z Added repeated shared-root and separate synced-document
  fixture coverage.
- 2026-05-26T13:25:00Z Fixed active owner lookup for repeated content-root
  projections.
- 2026-05-26T13:45:00Z Fixed history focus repair across main/synced roots.
- 2026-05-26T14:20:00Z Ran focused and full verification gates.
- 2026-05-26T14:45:00Z Recorded remaining Shift+Arrow cross-root selection bug
  and autoreview blocker.
- 2026-05-26T14:50:00Z Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; waiting for final response. |
| Where am I going? | Run the mechanical autogoal checker, mark the active goal complete, then hand off. |
| What is the goal? | Synced Blocks selection/history/browser coverage with bugs listed and safe owner bugs fixed. |
| What have I learned? | Repeated content-root projection needs active owner identity; Shift+Arrow across roots needs a larger expanded-selection design. |
| What have I done? | Added fixture coverage, package tests, Playwright coverage, runtime/navigation/history fixes, and verification evidence. |

Open risks:
- Cross-root expanded Shift selection is still broken by design gap, not a local
  Synced Blocks fixture bug.
- Autoreview did not finish because local review engine runs hung or timed out.
