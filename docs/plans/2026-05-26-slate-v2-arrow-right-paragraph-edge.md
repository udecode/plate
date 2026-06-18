# slate v2 arrow right paragraph edge

Objective:
Fix the Slate v2 hidden-content regression where ArrowRight from the end of the
first paragraph did not advance. Keep the default safe policy: ArrowRight at a
visible tab edge must not activate hidden tab content unless the example
explicitly selects `selectionPolicy="materialize"`.

Goal plan:
docs/plans/2026-05-26-slate-v2-arrow-right-paragraph-edge.md

Template:
docs/plans/templates/task.md

Applied packs:
- browser
- package-api

Task source:
- type: user-reported browser regression
- route: `/examples/hidden-content-blocks`
- acceptance: p1-end ArrowRight advances to the next visible editable point;
  inactive tabs stay inactive by default; materialize remains opt-in.

Completion threshold:
- Focused harness reproduces and covers the freeze class.
- Package-owned fix lands in `Plate repo root`.
- Route Playwright proves p1-end movement and hidden-tab policy behavior.
- `@Browser` proves the actual route interaction.
- Slate React, Slate DOM, and site typechecks pass.
- Scoped format/lint is clean; full lint caveat recorded.
- Autoreview reports no accepted/actionable slice findings.
- This plan passes the autogoal completion checker.

Verification surface:
- `packages/slate-react`: focused Vitest contract for keyboard
  boundary movement.
- `Plate repo root`: hidden-content Playwright route test.
- `Plate repo root`: Slate React, Slate DOM, and site typechecks.
- `@Browser`: hidden-content route interaction proof.
- `Plate repo root`: scoped format/lint plus autoreview.
- `plate-2`: autogoal plan checker.

Constraints:
- Preserve the default boundary policy: inactive tab content stays inactive and
  hidden during ArrowRight unless `materialize` is explicitly selected.
- Keep the fix package-owned; no route-local keydown workaround.
- Do not create commits, pushes, PRs, or tracker comments.
- Do not edit unrelated dirty files.

Boundaries:
- Source of truth: user report and live route behavior.
- Allowed edit scope: `Plate repo root` package/runtime code, route test, and
  matching changeset; this plan file records evidence.
- Browser surface: `@Browser` on the hidden-content example route.
- Tracker sync: N/A, no tracker or PR requested.
- Non-goals: broad keyboard rewrite, hidden-content API redesign, PR.

Blocked condition:
- Only blocked if the hidden-content route cannot run in any Browser-accessible
  local URL after three fresh server attempts, or if package tests reveal a
  contradictory desired behavior that requires a user product decision.

Task state:
- task_type: browser-visible regression fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: implemented
- confidence: high
- next owner: final response
- reason: tests, typechecks, `@Browser` proof, release artifact, and slice
  review are complete

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `task`, `debug`, `autogoal`, `Browser:browser`, and `autoreview` used |
| Active goal checked or created | yes | active goal created for this file |
| Source of truth read before edits | yes | user report and live hidden-content files inspected |
| TDD decision before behavior fix | yes | failing focused contract added before the durable fix |
| Browser tool decision | yes | `@Browser` used for final route proof |
| Package/API pack selected | yes | Slate DOM/React runtime behavior changed |
| Release artifact selected | yes | `Plate repo root/.changeset/slate-react-hidden-tab-navigation.md` updated |
| Barrel/export impact decision | yes | no exported file layout changed; no barrel generation needed |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocker rule.
- [x] Task source classified with route, acceptance criteria, likely packages,
      browser surface, and root-cause layer.
- [x] Nearby implementation patterns read before edits.
- [x] Implementation fixes the package-owned boundary instead of route-local
      key handling.
- [x] Release artifact requirement recorded and satisfied with a changeset.
- [x] Workspace authority recorded for each command.
- [x] High-risk note recorded for keyboard runtime and browser behavior.
- [x] Autoreview target selected from the local slice and closed.
- [x] Browser pack route, interaction path, and expected visible outcome
      recorded.
- [x] Package/API typecheck proof recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused unit, route, type, browser, review, checker | all recorded below |
| Bug reproduced before fix | yes | Add failing focused harness | `keyboard-input-strategy-contract.test.ts` first failed p1-end ArrowRight by snapping back |
| Targeted behavior verification | yes | Run focused contract and route tests | contract 14 passed; route 3 passed |
| TypeScript changed | yes | Run package and site typechecks | `bun --filter slate-react typecheck`, `bun --filter slate-dom typecheck`, `bun typecheck:site` passed |
| Package exports or file layout changed | no | N/A | no barrel/export layout changes |
| Package manifests or install graph changed | no | N/A | no manifest or lockfile changes in this slice |
| Workspace authority proof | yes | Run commands in `Plate repo root` | all package/site/playwright commands ran there |
| Browser surface changed | yes | Use `@Browser` | final Browser proof recorded below |
| Package behavior changed | yes | Update changeset | `.changeset/slate-react-hidden-tab-navigation.md` includes `slate-react` and `slate-dom` patch entries |
| Local install corruption suspected | no | N/A | no React/install corruption signature |
| Autoreview | yes | Run structured review until clean | final slice-diff Claude review exited 0, no accepted/actionable findings |
| PR create/update | no | N/A | no PR requested |
| Tracker sync-back | no | N/A | no tracker requested |
| Final lint | yes | Run scoped equivalent | `bunx biome check ...` clean; `bun eslint ...` returned only config-ignore warnings; full `bun lint` stopped on unrelated `projected-collab-substrate-contract.test.ts` formatting |
| Browser interaction proof | yes | Exercise p1-end and tab policy in `@Browser` | proof JSON recorded below |
| Browser console/network check | yes | Check route proof state | no route error in final Browser proof; Browser used network URL because pane could not load `localhost` directly |
| Goal plan complete | yes | Run autogoal checker | final checker gate next |

Root Cause:
- The caret boundary guard restored the previous selection whenever a collapsed
  movement entered a `selectionPolicy="boundary"` hidden range.
- That kept inactive tab content safe, but it also froze legitimate forward
  navigation over closed hidden blocks, such as p1-end ArrowRight before a
  closed accordion.

Implementation:
- `slate-dom` now owns `DOMCoverage.getPointOutsideBoundary`, which walks past
  same-policy hidden boundary ranges in the movement direction and handles
  multiple ranges from the same boundary with `boundaryId:rangeIndex` visited
  keys.
- `slate-react` caret movement now collapses to that outside point for normal
  movement and preserves the original anchor only for Shift/extend movement.
- The hidden-content route test now proves p1-end ArrowRight skips the closed
  accordion without opening hidden content.
- The existing hidden tab test still proves default boundary/model-backed
  navigation does not activate inactive tabs, while materialize does.
- The changeset records the Slate React and Slate DOM package behavior change.

Review fixes:
- Fixed Shift+Arrow boundary crossing so it preserves the selection anchor.
- Fixed same-boundary multi-range skipping so it does not self-block.
- Fixed plain line-move boundary crossing so it remains collapsed.

Verification evidence:
- `packages/slate-react`: `bun test:vitest -- keyboard-input-strategy-contract.test.ts` passed, 14 tests.
- `Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium` passed, 3 tests.
- `Plate repo root`: `bun --filter slate-react typecheck` passed.
- `Plate repo root`: `bun --filter slate-dom typecheck` passed.
- `Plate repo root`: `bun typecheck:site` passed.
- `Plate repo root`: `bunx biome check packages/slate-dom/src/plugin/dom-coverage.ts packages/slate-react/src/editable/caret-engine.ts packages/slate-react/test/keyboard-input-strategy-contract.test.ts playwright/integration/examples/hidden-content-blocks.test.ts` passed.
- `Plate repo root`: `bun eslint packages/slate-dom/src/plugin/dom-coverage.ts packages/slate-react/src/editable/caret-engine.ts packages/slate-react/test/keyboard-input-strategy-contract.test.ts playwright/integration/examples/hidden-content-blocks.test.ts` had zero errors; three files are ignored by ESLint config.
- `Plate repo root`: full `bun lint` was attempted and stopped on unrelated formatting in `packages/slate-react/test/projected-collab-substrate-contract.test.ts`.
- `Plate repo root`: final slice-diff autoreview exited 0 with no accepted/actionable findings.

Browser proof:
- Tool: `@Browser` / Codex in-app Browser.
- Route: `http://100.102.180.93:3100/examples/hidden-content-blocks`.
- p1-end state before ArrowRight: `Intro visible before hidden blocks.`, offset `35`.
- p1-end ArrowRight result: selection moved to `Overview tab visible text`, offset `0`; accordion secret absent; Details tab inactive.
- Boundary default result: policy `boundary`, Overview active, Details inactive, Details hidden text absent.
- Materialize opt-in result: policy `materialize`, Overview inactive, Details active, Details hidden text present.

Error attempts:
| Attempt | Count | Resolution |
|---------|-------|------------|
| `@Browser` to `localhost:3100` hit stale empty response | 1 | restarted `bun serve`, used Browser-accessible network URL |
| Codex autoreview hung silently | 1 | killed exact helper process and used scoped Claude no-tools review |
| First slice review found extend/multi-range defects | 1 | fixed and reran tests/review |
| Second slice review found plain line-move defect | 1 | fixed and reran tests/review |

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue/tracker line: N/A, no tracker requested.
- Confidence line: high.
- Outcome: fixed p1-end ArrowRight freeze while preserving hidden-tab safe
  default and materialize opt-in.
- Caveat: full repo lint remains blocked by unrelated formatting outside this
  slice.
- Design: DOM coverage owns boundary skip resolution; React caret handling owns
  whether movement collapses or preserves anchor.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | user report, route, caret, DOM coverage, tests read | implementation |
| Implementation | complete | Slate DOM helper, Slate React caret handling, tests, changeset | verification |
| Verification | complete | unit, Playwright, typechecks, Browser, scoped lint | review |
| Review | complete | final slice autoreview clean | closeout |
| PR / tracker sync | complete | N/A, not requested | final response |
| Closeout | complete | plan ready for checker | final response |

Timeline:
- 2026-05-26 Created goal plan.
- 2026-05-26 Added failing p1-end ArrowRight contract.
- 2026-05-26 Moved boundary skip logic to Slate DOM and wired Slate React caret movement to skip hidden boundary ranges.
- 2026-05-26 Added coverage for collapsed skip, Shift+Arrow anchor preservation, same-boundary multi-range skip, plain line movement, and route behavior.
- 2026-05-26 Proved final behavior with `@Browser`.
- 2026-05-26 Closed accepted review findings and reran verification.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autogoal checker, mark goal complete, final response |
| What is the goal? | Fix p1-end ArrowRight without weakening hidden-tab default |
| What have I learned? | Snap-back was the wrong boundary behavior; skipped movement needs separate collapsed vs extend handling |
| What have I done? | Implemented package-owned boundary skipping and verified it in tests and Browser |

Open risks:
- No open risk for this slice.
