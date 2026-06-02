# slate v2 shift boundary selection

Objective:
Fix Slate v2 hidden-content-blocks shifted caret movement so `Shift+ArrowRight`
and `Shift+Option+ArrowRight` from the end of the first paragraph never project
a native DOM selection through shadcn accordion/tabs chrome or inactive hidden
content.

Goal plan:
docs/plans/2026-05-26-slate-v2-shift-boundary-selection.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user browser bug report
- id / link: local route
- title: Shifted selection leaks through hidden-content shadcn chrome
- acceptance criteria: from `/examples/hidden-content-blocks`, shifted right and shifted word-right at the end of `p1` keep inactive hidden content closed and do not select accordion/tab/collapsible controls in the native DOM selection.

Completion threshold:
- Browser repro is confirmed before the fix.
- Package-level regressions cover reconciler export, shifted caret movement, word-selection hotkeys, clipboard policy preservation, and the hidden-content-blocks route.
- Browser proof on `http://100.102.180.93:3100/examples/hidden-content-blocks` shows empty native selection text, active Overview tab, inactive Details tab, and no hidden accordion/details text after both shifted key paths.
- `slate-react` and `slate-dom` typecheck pass.
- Changesets exist for the published `slate-react` and `slate-dom` behavior changes.

Verification surface:
- Browser: in-app Browser on `http://100.102.180.93:3100/examples/hidden-content-blocks`.
- Playwright: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium`.
- Unit: `bun test:vitest -- keyboard-input-strategy-contract.test.ts selection-reconciler-contract.test.tsx`.
- Unit: `cd packages/slate-dom && bun test ./test/dom-coverage.test.ts ./test/hotkeys.test.ts ./test/clipboard-boundary.test.ts`.
- Types: `bun --filter slate-react typecheck`; `bun --filter slate-dom typecheck`.
- Lint: scoped `bunx biome check ...`; scoped `bunx eslint ...`.

Constraints:
- Work in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.
- Preserve current boundary, materialize, and model-backed policies.
- Do not create commits, pushes, PRs, or tracker comments.

Boundaries:
- Source of truth: user report plus attached screenshot showing native selection over non-editable shadcn chrome.
- Allowed edit scope: Slate v2 `slate-dom`, `slate-react`, hidden-content-blocks Playwright coverage, package changesets, and this plan.
- Browser surface: `/examples/hidden-content-blocks`.
- Tracker sync: N/A, no tracker item.
- Non-goals: visible projected selection overlay for model-backed hidden ranges; broad redesign of DOM coverage policy.

Blocked condition:
Blocked only if the in-app Browser cannot load the route or package tests cannot run due unrelated local install corruption after one reinstall retry. No blocker remains.

Task state:
- task_type: bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: browser repro is fixed, route regression is green, package tests and typechecks pass.

Completion rule:
- Completion is legal after this plan passes `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-shift-boundary-selection.md`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `debug`, `task`, `autogoal`, `browser`, and `changeset`; used bug-first repro and package release rules. |
| Active goal checked or created | yes | `create_goal` created objective `019e63f8-9985-75c0-ae68-33575e324b41`. |
| Source of truth read before edits | yes | User bug report and screenshot inspected; route `/examples/hidden-content-blocks` used. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: static screenshot, no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: local source and prior memory had the route/tooling context; no solution note owned this exact regression. |
| TDD decision before behavior change or bug fix | yes | Added route, unit, DOM coverage, hotkey, and reconciler regression rows. |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR; repo says do not check git state. |
| Release artifact decision | yes | Published package behavior changed; split package changesets added. |
| Browser tool decision for browser surface | yes | Used in-app Browser as requested. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Browser pack selected | yes | Applied browser pack. |
| Browser route / app surface identified | yes | `/examples/hidden-content-blocks`. |
| Browser tool decision recorded | yes | In-app Browser only for manual proof; Playwright only for automated regression. |
| Console/network caveat policy recorded | yes | Browser console errors checked after proof: `[]`. |
| Package/API pack selected | yes | Applied package-api pack for `slate-react` and `slate-dom`. |
| Public surface or package boundary identified | yes | Runtime behavior of published `slate-react` and `slate-dom`; no export/barrel change. |
| Release artifact path selected | yes | `.changeset/slate-react-hidden-boundary-selection.md` and `.changeset/slate-dom-hidden-boundary-selection.md`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `.agents/skills/changeset/SKILL.md`; split one package per file. |
| Barrel/export impact decision recorded | no | N/A: added internal file only; no public export or exported folder layout change. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: screenshot-only bug report.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: DOM coverage selection export and hotkey ownership.
- [x] Release artifact requirement recorded: package changesets.
- [x] Final handoff shape decided: concise bug fix summary plus verification.
- [x] Branch handling recorded: N/A, no branch/PR requested.
- [x] Local-env-rot retry policy recorded: N/A, no env-rot failure.
- [x] Workspace authority recorded: commands ran in `.tmp/slate-v2`; Browser route proof used live app.
- [x] High-risk note recorded: native DOM selection cannot safely represent hidden boundary-spanning model ranges, so Slate keeps them model-backed instead of projecting through UI chrome.
- [x] Review/autoreview target selected: local checkout with scoped prompt for this hidden-content shifted boundary selection fix.
- [x] Agent-native review decision recorded: N/A, no agent/tooling changes.
- [x] Browser pack: route, interaction path, and expected visible outcome recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool.
- [x] Browser pack: console errors checked.
- [x] Browser pack: exact verification evidence ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact recorded.
- [x] Package/API pack: release artifact matrix applied with package changesets.
- [x] Package/API pack: changeset skill loaded and one-package-per-file changesets added.
- [x] Package/API pack: registry-only changelog N/A.
- [x] Package/API pack: compatibility decision explicit; no public API break.
- [x] Package/API pack: package-owned typecheck/test proof recorded.
- [x] Package/API pack: generated barrels N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named tests, typechecks, lint, and browser proof | All commands in Verification evidence passed. |
| Bug reproduced before fix | yes | Record failing browser repro | Browser before fix: `Shift+ArrowRight` native selection text was `Accordion body`, `Overview`, `Details`. |
| Targeted behavior verification | yes | Run focused route and package tests | Unit tests and Playwright route passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter slate-react typecheck`; `bun --filter slate-dom typecheck` passed. |
| Package exports or file layout changed | no | N/A | No public export/barrel layout change. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile change. |
| Agent rules or skills changed | no | N/A | No agent/tooling change. |
| Workspace authority proof | yes | Run proof in owning workspace | All commands ran in `.tmp/slate-v2`; plan/check in `plate-2`. |
| Browser surface changed | yes | Browser proof | In-app Browser proof passed on live route. |
| Browser final proof | yes | Record exact browser outcome | Empty native selection, active Overview, inactive Details, no hidden secrets for both key paths. |
| CI-controlled template output changed | no | N/A | No template output touched. |
| Package behavior or public API changed | yes | Add changesets | `slate-react` and `slate-dom` patch changesets added. |
| Registry-only component work changed | no | N/A | No registry-only component work. |
| Docs or content changed | yes | Verify plan only | This plan documents execution; no user docs changed. |
| High-risk mini gate | yes | Record failure mode and proof plan | Failure mode: native DOM range leaks through non-editable chrome; proof: Browser + Playwright + package tests. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling files changed. |
| Local install corruption suspected | no | N/A | No install-corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Run repo autoreview helper until scoped findings are clean | Final scoped run: `autoreview clean: no accepted/actionable findings reported`. |
| PR create or update | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | No tracker item. |
| Final handoff contract | yes | Fill concise final response | Ready. |
| Final lint | yes | Run scoped lint | Scoped Biome passed; scoped ESLint had no errors and ignored-file warnings only. |
| Goal plan complete | yes | Run autogoal checker | Checker passes after this file update. |
| Browser interaction proof | yes | Exercise route in Browser | Browser proof passed after keyboard movement to `p1` end. |
| Browser console/network check | yes | Check console errors | Browser error logs: `[]`; network not separately inspected because route rendered and proof completed. |
| Browser final proof artifact | yes | Record exact proof | Native selection text `""`; hidden secret booleans false. |
| Public API / package boundary proof | yes | Source-audit package boundary impact | No public API/export change; behavior-only patch. |
| Release artifact classification | yes | Classify release artifact | Published package behavior patch for `slate-react` and `slate-dom`. |
| Published package changeset | yes | Add one changeset per package | `.changeset/slate-react-hidden-boundary-selection.md`; `.changeset/slate-dom-hidden-boundary-selection.md`. |
| Registry changelog | no | N/A | Not registry-only. |
| No release artifact | no | N/A | Release artifact required and added. |
| Package typecheck/build/test | yes | Run package checks | Typechecks and focused package tests passed. |
| Barrel/export generation | no | N/A | No export changes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Browser repro and screenshot source read | complete |
| Implementation | complete | Package fix and tests added | complete |
| Verification | complete | Unit, Playwright, Browser, typecheck, lint complete | complete |
| PR / tracker sync | complete | N/A, no PR/tracker requested | complete |
| Closeout | complete | Plan checker and final response | final response |

Findings:
- Root cause: reconciler export projected model ranges crossing DOM coverage boundaries as native DOM ranges, which selected non-editable shadcn chrome.
- Secondary gap: shifted word movement was not Slate-owned, so `Shift+Option+Right` could fall through to native browser selection.

Decisions and tradeoffs:
- Keep hidden boundary-spanning selections model-backed instead of forcing unsafe native DOM ranges.
- Add `opt+shift+left/right` and `ctrl+shift+left/right` word-extension hotkeys to Slate ownership.
- Do not build a visible projected selection overlay in this bug slice.

Implementation notes:
- Added `applyDOMCoverageSelectionPolicy` and used it from both selection export paths.
- Kept raw DOM range projection intact for clipboard policies; verified with clipboard-boundary tests.
- Added route and package regression coverage.

Review fixes:
- Accepted autoreview finding: lower-level DOM range guard would break `summary-only` clipboard copy; removed that guard and added clipboard-boundary verification.
- Accepted autoreview finding: Playwright used Apple-only Option word-selection unconditionally; switched automated route row to `Control+Shift+ArrowRight` and kept Option coverage in platform/unit plus in-app Browser proof.
- Split changeset into one file per package.
- Ran scoped Biome fix for import/order/format issues.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Playwright `Alt+Shift+ArrowRight` row moved into hidden text on non-Apple Chromium | 1 | Use cross-platform `Control+Shift+ArrowRight` in Playwright | Fixed; Playwright passed. |
| In-app Browser direct end-coordinate click landed at paragraph start | 1 | Move to `p1` end with repeated ArrowRight before shifted proof | Browser proof passed. |
| Autoreview found lower-level DOM range guard would break `summary-only` clipboard copy | 1 | Keep fix at React selection export layer and verify clipboard policy | Fixed; clipboard-boundary tests passed. |
| Autoreview found Playwright Option hotkey was platform-specific | 1 | Use `Control+Shift+ArrowRight` in cross-platform Playwright; keep Option in Browser proof | Fixed; scoped autoreview clean. |

Verification evidence:
- Browser pre-fix repro: from `p1` end, `Shift+ArrowRight` produced native selection text containing `Accordion body`, `Overview`, and `Details`.
- Browser final proof: after keyboard movement to exact `p1` end, `Shift+ArrowRight` and `Alt+Shift+ArrowRight` produced native selection text `""`, kept Overview active, Details inactive, and did not reveal accordion/details hidden text.
- Browser console errors after proof: `[]`.
- `bun test:vitest -- keyboard-input-strategy-contract.test.ts selection-reconciler-contract.test.tsx` passed: 2 files, 18 tests.
- `cd packages/slate-dom && bun test ./test/dom-coverage.test.ts ./test/hotkeys.test.ts ./test/clipboard-boundary.test.ts` passed: 59 tests.
- `cd packages/slate-dom && bun test ./test/hotkeys.test.ts` passed after Playwright hotkey change: 15 tests.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium` passed: 4 tests.
- `bun --filter slate-react typecheck` passed.
- `bun --filter slate-dom typecheck` passed.
- Scoped `bunx biome check ...` passed.
- Scoped `bunx eslint ...` had no errors; ignored-file warnings only for files outside current ESLint config match.
- Autoreview final scoped command passed: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --no-web-search --prompt "Scope this review to the hidden-content shifted boundary selection fix only: slate-dom hotkeys, slate-react caret/selection DOM coverage policy, related tests, Playwright hidden-content-blocks row, and changesets. Ignore unrelated local diffs such as mutation-controller projected-selection replacement work."`

Reboot status:
- Not rebooted; no running blocker remains.

Open risks:
- None for the reported bug. Future work: visible projected selection overlay for model-backed hidden boundary ranges if product wants a visible highlight instead of an empty native selection.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high.
- Flow table:
  - Reproduced: Browser pre-fix native selection leaked through shadcn chrome.
  - Verified: Browser, Playwright, unit tests, typecheck, and scoped lint pass.
- Browser check: passed on `http://100.102.180.93:3100/examples/hidden-content-blocks`.
- Outcome: shifted right and shifted word-right no longer select non-editable tab/accordion chrome or inactive hidden content.
- Caveat: model-backed hidden-boundary selections intentionally do not project a visible native highlight across missing DOM.
