# Slate v2 editable void keyboard click navigation

Objective:
Add focused Playwright coverage for click plus keyboard navigation in the
editable-void example's same-runtime child root, reproduce the boundary bug,
fix the example/schema ownership, and close only when focused browser,
package/site, lint, and review gates pass.

Goal plan:
docs/plans/2026-05-25-slate-v2-editable-void-keyboard-click-navigation.md

Template:
docs/plans/templates/task.md

Applied packs:
- browser
- package-api

Task source:
- type: user request
- title: Add Playwright keyboard/click navigation tests for editable voids
- acceptance criteria:
  - Add Playwright coverage for click plus arrow-key navigation inside the
    editable-void child root.
  - Add Playwright coverage for arrow-key entry and exit across the mixed
    editable-void child-root boundary.
  - Fix reproduced bugs at the right ownership boundary.
  - Verify with focused and full editable-voids browser proof plus relevant
    package/site gates and autoreview.

Completion threshold:
- The new Playwright rows fail before the ownership fix or otherwise expose the
  missing behavior.
- The accepted fix makes both new rows pass and the full editable-voids
  Chromium route pass.
- Relevant typecheck, lint, focused package tests, and autoreview pass.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-editable-void-keyboard-click-navigation.md`
  passes.

Verification surface:
- `.tmp/slate-v2` Playwright editable-voids route.
- `.tmp/slate-v2` site typecheck.
- `.tmp/slate-v2` Slate React focused contract tests.
- `.tmp/slate-v2` lint.
- `.tmp/slate-v2` autoreview local diff.

Constraints:
- Do not change ordinary void semantics.
- Keep native controls inside the editable void browser-owned.
- Keep the fix scoped to the example/schema opt-in unless runtime code proves
  broken.
- Do not commit, push, or open a PR.

Boundaries:
- Source of truth: user request in this thread.
- Allowed edit scope: `.tmp/slate-v2` editable-voids example, Playwright test,
  and only the runtime code needed if tests prove runtime ownership is wrong.
- Browser surface: `site/examples/ts/editable-voids.tsx` through
  `playwright/integration/examples/editable-voids.test.ts`.
- Tracker sync: N/A, no tracker item.
- Release artifact: N/A, example/test-only follow-up; no published package
  delta from this slice.

Blocked condition:
- Block only if the editable-voids route cannot build/run after three distinct
  attempts and no smaller source/test route remains available.

Task state:
- task_type: browser behavior / regression coverage
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- goal_status: ready-to-close

Current verdict:
- verdict: complete
- confidence: high
- reason: The missing behavior was not leaf-level arrowing inside a focused
  child root; that already passed. The real bug was boundary navigation for the
  mixed editable void: the example had a child root but did not declare it as a
  `contentRoot`, so the navigation bridge ignored it. The example now opts the
  `editable-void` body into `contentRoot: { slot: 'body' }`, while native
  controls remain wrapped in `contentEditable={false}`.

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition recorded.
- [x] Task source classified.
- [x] Nearby implementation patterns read.
- [x] TDD/browser repro used before fix.
- [x] Browser route and interaction path recorded.
- [x] Release artifact decision recorded: N/A, no published package delta.
- [x] Review/autoreview selected from dirty local diff and passed.
- [x] Agent-native review decision recorded: N/A, no agent/tooling changes.
- [x] Workspace authority recorded: all behavior proof ran in `.tmp/slate-v2`.
- [x] Final handoff evidence recorded.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Bug reproduced before fix | yes | New boundary Playwright row failed before the fix: child-root selection stayed `null` after `ArrowRight` from the previous sibling into the mixed editable void. |
| Targeted behavior verification | yes | Focused new-row rerun passed: `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium -g "child-root (arrow navigation usable after clicks\|boundaries with keyboard)"`, 2 passed. |
| Full browser route proof | yes | `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium`, 19 passed with fresh Next build. |
| TypeScript / typed config | yes | `bun typecheck:site` passed. |
| Focused package tests | yes | `bun --filter ./packages/slate-react test:vitest -- content-root-navigation-contract selection-controller-contract keyboard-input-strategy-contract`, 32 passed. |
| Lint | yes | `bun lint` passed after Biome formatting. |
| Package behavior / public API changed | no | N/A: this slice changed example schema usage and Playwright tests only; no package exports or published API changed. |
| Autoreview | yes | `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` passed with no accepted/actionable findings. |
| PR / tracker sync | no | N/A: user did not ask for PR/tracker work. |
| Goal plan complete | yes | Final checker must pass before goal close. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User request identified missing keyboard/click navigation coverage in editable-void example. Existing tests/source read for child-root click, editor-only content-root navigation, and example schema. | implementation |
| Repro test | complete | Added mixed editable-void boundary Playwright row; focused run failed before the fix because child-root selection stayed `null` after outer `ArrowRight`. | fix |
| Implementation | complete | Added `contentRoot: { slot: 'body' }` to the example's `editable-void` schema entry and kept native controls noneditable. | verification |
| Verification | complete | Focused rows, full route, typecheck, lint, focused unit tests, and autoreview passed. | closeout |
| Closeout | complete | Final evidence and reboot state recorded; checker rerun pending. | final response |

Implementation notes:
- Added Playwright row:
  `keeps same-runtime child-root arrow navigation usable after clicks`.
- Added Playwright row:
  `moves across editable void child-root boundaries with keyboard`.
- Reproduced the boundary bug: `ArrowRight` from the paragraph before the mixed
  editable void did not enter the void child root.
- Fixed the example by declaring:

```ts
{
  type: 'editable-void',
  contentRoot: { slot: 'body' },
  void: 'editable-island',
}
```

Design:
- Chosen boundary: schema opt-in on the example's rich child-root slot.
- Why not quick patch: forcing all `editable-island` roots into navigation would
  make native-control islands behave like document flow without an explicit
  contract.
- Why not broader change: the runtime bridge already supports any element with
  `contentRoot`; the bug was the example failing to declare the slot.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high after focused and full browser proof.
- Browser check: 19/19 editable-voids Chromium tests passed.
- Outcome: mixed editable void rich child root is navigable by click and arrow
  keys, including entry from previous sibling and exit to previous/next sibling.
- Caveat: mobile/raw-device proof is still not claimed.

Timeline:
- 2026-05-25: Goal and task plan created.
- 2026-05-25: Added click plus arrow navigation Playwright row; it passed
  before runtime changes, proving basic focused child-root arrowing was already
  healthy.
- 2026-05-25: Added mixed editable-void boundary Playwright row; it failed
  because the child root was not declared as a content root.
- 2026-05-25: Added `contentRoot: { slot: 'body' }` to the `editable-void`
  example spec.
- 2026-05-25: Focused rows, full editable-voids browser route, site typecheck,
  focused Slate React tests, lint, and autoreview passed.

Open risks:
- Mobile/raw-device keyboard behavior is not claimed.

Verification evidence:
- Repro: `.tmp/slate-v2` focused Playwright row
  `moves across editable void child-root boundaries with keyboard` failed before
  the fix with expected child-root selection `[0,0]` offset `0` but received
  `null`.
- Browser focused: `.tmp/slate-v2`
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium -g "child-root (arrow navigation usable after clicks|boundaries with keyboard)"`
  passed, 2 tests.
- Browser full route: `.tmp/slate-v2`
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium`
  passed, 19 tests.
- Typecheck: `.tmp/slate-v2` `bun typecheck:site` passed.
- Focused package tests: `.tmp/slate-v2`
  `bun --filter ./packages/slate-react test:vitest -- content-root-navigation-contract selection-controller-contract keyboard-input-strategy-contract`
  passed, 32 tests.
- Lint: `.tmp/slate-v2` `bun lint` passed.
- Review: `.tmp/slate-v2`
  `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
  passed with no accepted/actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after checker and goal close. |
| What is the goal? | Add Playwright keyboard/click navigation coverage for editable-void child roots, fix reproduced bugs, and verify. |
| What have I learned? | Basic arrowing inside an already focused child root worked; boundary navigation into the mixed editable void failed because the example child root was not declared as a content root. |
| What have I done? | Added two Playwright rows, declared `editable-void` body as `contentRoot`, verified browser/site/unit/lint/review gates. |
