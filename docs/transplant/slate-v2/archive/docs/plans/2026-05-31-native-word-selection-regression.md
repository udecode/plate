# native word selection regression

Objective:
Slate Patch fixes native word-selection regressions in `.tmp/slate-v2`:
reproduce double-click word selection failure with real mouse input, add
behavior coverage for the native selection class, fix the shared owner, verify
focused Slate v2 gates, run autoreview from `.tmp/slate-v2`, and hand off root
cause plus proof.

Flow mode:
one-shot execution

Goal plan:
`docs/plans/2026-05-31-native-word-selection-regression.md`

Completion threshold:
- Double-clicking a word selects that word in pagination and a non-pagination
  editor surface.
- Tests assert DOM/native selection text and model selection text/range.
- Single-click caret placement and relevant text selection behavior do not
  regress for the touched owner.
- Fix lands in shared Slate React/browser selection ownership unless source
  audit proves the example is the owner.
- Focused package/browser tests, relevant typecheck, Evidence Kit decision,
  autoreview, and autogoal checker pass.

Verification surface:
- Browser reproduction and Playwright behavior tests with real mouse input.
- Source audit of Slate React selection/import/native event ownership.
- Focused package tests/typecheck for changed owners.
- Autoreview helper from `.tmp/slate-v2`.

Constraints:
- Work in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.
- Do not patch only pagination unless it is truly the owner.
- Preserve prior pagination performance and margin-click fixes.
- No commit, PR, or staging requested.

Boundaries:
- Owners changed: `packages/slate-react/src/editable/root-interaction-controller.ts`,
  root-interaction tests, pagination browser tests, and richtext browser tests.
- Excluded: generated output, broad release sweeps, unrelated root checkout
  files.

Blocked condition:
Block only if the only correct fix requires a public API/product decision or if
real browser selection behavior remains nondeterministic after three distinct
instrumented attempts.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-patch` loaded from prompt; selection matrix required |
| Active goal checked or created | yes | Goal created for native word-selection regression |
| Source of truth read before edits | yes | Read `root-interaction-controller`, `root-interaction-resolver`, `selection-reconciler`, pagination tests, and richtext tests |
| Reproduction before patching | yes | Richtext double-click selected `text`; pagination staged double-click collapsed at `[0,0]` offset 4 with empty native selection |
| Browser route identified | yes | `/examples/pagination?page_layout=single&strategy=staged` and `/examples/richtext` |

Work Checklist:
- [x] Objective includes measurable thresholds and constraints.
- [x] Reproduce double-click failure with real mouse input.
- [x] Classify bug class and selection matrix slice.
- [x] Add red behavior coverage.
- [x] Patch shared owner.
- [x] Run architecture pressure review.
- [x] Verify focused package/browser gates.
- [x] Record Evidence Kit decision.
- [x] Run autoreview and fix accepted findings.
- [x] Run autogoal checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Double-click word selection | yes | Browser/test proof | Pagination Playwright row passed and asserts selected text `Premirror` plus model range `[0,0] 0..9` |
| Non-pagination surface | yes | Browser/test proof | Richtext native-word toolbar row passed and now asserts selected text `text` plus model range `[1,0] 16..20` |
| Single-click/drag regression | yes | Focused proof | Pagination drag-from-margin and line-start margin placement rows passed; richtext triple-click block selection passed |
| Shared owner | yes | Source audit | Fixed `useRootInteractionController`; no example-only behavior branch |
| Typecheck/tests | yes | Run focused gates | `slate-react` typecheck passed; root-interaction vitest passed; focused Playwright rows passed |
| Evidence Kit | yes | Decide refresh/candidate/N/A | Candidate benchmark needed: native mouse word selection in projected/paginated layout; existing registry has broad selection/browser families but no exact artifact |
| Autoreview | yes | Run helper | Autoreview clean from `.tmp/slate-v2` with no accepted/actionable findings |
| Goal plan complete | yes | Run checker | Mechanical checker passes after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Reproduce | completed | Pagination double-click failed while richtext passed | closed |
| Red coverage | completed | New pagination row failed before the fix with selected text `""` instead of `Premirror` | closed |
| Implementation | completed | Native text multi-clicks now bypass coordinate placement, blank-click suppression, and projected drag setup | closed |
| Verification | completed | Focused unit, typecheck, lint, browser rows, and autoreview passed | closed |
| Closeout | completed | Goal checker ready and final handoff next | final |

Selection/navigation matrix slice:
- command family: mouse double-click word selection, plus single-click/margin
  placement, mouse drag selection, and triple-click block sanity for touched
  owner overlap
- direction: native word expansion at clicked point
- topology: plain richtext blocks and paginated projected DOM
- starting state: collapsed/no selection before click
- assertions: exact DOM selected text, model selection range, focus/native
  selection sanity

Findings:
- Reproduction: `/examples/richtext` double-click at `[1,0]` offset 18 selected
  `text`, but `/examples/pagination?page_layout=single&strategy=staged`
  double-click at `[0,0]` offset 4 left native selection empty and model
  selection collapsed at offset 4.
- Root cause: `useRootInteractionController` treats projected text as a
  coordinate-placement surface. On native text mousedown it prevented default
  and wrote a collapsed range, which is correct for single-click coordinate
  correction but wrong for browser-owned multi-click word selection.
- Fix: native editable multi-clicks inside real text targets now use the
  browser path. They skip coordinate placement, blank native editable click
  suppression, and projected drag setup; mouseup then imports the expanded DOM
  selection through the existing ignored-action path.

Architecture pressure verdict:
- keep: the owner is shared root interaction, not pagination. The fix preserves
  coordinate placement for single clicks and margin/chrome targets while
  restoring browser ownership for native multi-click text selection.

Evidence Kit:
- Candidate benchmark needed: native mouse word selection in projected or
  paginated layout. Registry search found broad selection/browser families
  (`core-text-selection`, browser trace, rich-text replay coverage), but no
  exact native mouse projected-layout artifact to refresh.

Review fixes:
- Autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First patch still prevented second mousedown | 1 | Instrument `preventDefault` stack and event target/detail | Found blank native editable suppression still active; excluded multi-click |
| Unit test exposed projected drag setup after multi-click | 1 | Disable projected drag endpoint for native multi-click | Root-interaction unit tests passed |

Verification evidence:
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "selects projected pagination words on native double click"`: 1 passed after failing red first.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "selects projected pagination words on native double click|selects virtualized pagination text when dragging from the page line margin|places virtualized pagination selection at line start from the page margin"`: 3 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "keeps browser caret valid after native word selection toolbar mark then clicking elsewhere|selects the current block on browser triple click"`: 2 passed.
- `bun run test:vitest -- ./test/root-interaction-controller.test.tsx ./test/root-interaction-resolver.test.ts` from `packages/slate-react`: 17 passed.
- `bun --filter slate-react typecheck` from `.tmp/slate-v2`: exited 0.
- `bun lint:fix` from `.tmp/slate-v2`: exited 0.
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --engine codex --thinking high`: clean, no accepted/actionable findings.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response after checker and goal completion | Restore native double-click word selection without regressing mouse selection | Root interaction over-owned native multi-clicks in projected layout | Shared owner fixed and focused proof passed |

Open risks:
- None for the reported class. Broader native mouse behavior still deserves a
  dedicated benchmark artifact for projected layouts.
