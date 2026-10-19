# Hide native table highlight during drag

Objective:
Hide native text highlight while dragging across multiple table cells; done
when the exact browser repro fails before, passes 5 warm runs after, focused
tests and review pass.

Goal plan:
docs/plans/2026-08-26-hide-native-table-highlight-during-drag.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct local bug report with screenshot
- id / link: `local:table-cell-drag-native-highlight` and
  `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-7ab94995-01c2-4de2-a691-a23af352e3b2.png`
- title: Hide native text highlight during multi-cell pointer drag
- acceptance criteria: while the pointer is down and the Table selection grows
  beyond one cell, no native text-selection highlight is visible; pointer-up
  keeps the existing correct exact multi-cell selection.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary regression proof is stronger
- improvement loop: red repro, durable owner fix, focused proof, 5 warm Browser
  replays
- final score / loop closure: N/A

Completion threshold:
- The exact `/blocks/table-demo` case proves a visible/native text selection
  during multi-cell pointer drag before the fix and none during the same drag
  after the fix, while the model still selects more than one exact cell and
  pointer-up preserves the selection.
- A durable regression test passes, the owning package source-first typecheck
  passes, the relevant registry output is regenerated when registry source
  changes, and Browser passes 5/5 retry-free warm runs with no relevant console
  error.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-hide-native-table-highlight-during-drag.md` passes.

Verification surface:
- Exact Browser repro and 5-run stability ledger on `/blocks/table-demo`,
  checking native DOM selection during pointer-down and after pointer-up.
- Focused Table/Plite React test at the event or projection owner, Table package
  test/typecheck, scoped format/lint, changeset status, registry generation when
  applicable, and final source/diff audit.
- P1 autoreview only when the branch policy permits it; `next` explicitly
  forbids autoreview, so a current-source manual P1 audit owns that case.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep Plite NodeSelection as the only editor selection authority. Do not
  restore Table or block-selection state.
- Preserve single-cell caret/text selection, exact multi-cell selection,
  pointer-up behavior, keyboard selection, clipboard, and focus.

Boundaries:
- Source of truth: user screenshot and exact current `/blocks/table-demo`
  behavior, then the literal Table pointer/DOM projection owners and tests.
- Allowed edit scope: owning Table/Plite React package source and focused tests,
  canonical `apps/www` table registry source/demo when required, one changeset,
  generated barrels/registry only through owning commands, and this plan.
- Browser surface: `http://localhost:3000/blocks/table-demo`.
- Browser strategy: use Browser because the user did not name an exact browser
  and this is ordinary app selection paint. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or tracker was named.
- Non-goals: public API redesign, selection-state changes, document migration,
  unrelated table styling, PR/commit/push/release, and `templates/**` edits.

Output budget strategy:
- Read exact Table pointer/DOM owners and focused tests first. Scope searches to
  `packages/table`, `packages/plite-react`, `apps/www` table registry source,
  and `apps/plite` browser tests. Exclude generated output until regeneration;
  cap every command to a few thousand tokens.

Blocked condition:
- Block only if a fresh exact route cannot reproduce the reported pointer-down
  paint and no deterministic native-selection signal can be observed, or the
  required Browser surface cannot run after safe in-scope recovery.

Task state:
- task_type: local Plate selection/navigation browser regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: keep the conditional registry-cell paint suppression
- confidence: high from exact red/green test, 5/5 Browser replay, and source audit
- next owner: none; return the local candidate to the user
- reason: the held native Range is required until `TablePlugin.mouseUp`, while
  `useTableSelectionDOM` already identifies every selected cell during drag.
  Hiding only those cells' `::selection` paint fixes the visible defect without
  creating another selection authority.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-hide-native-table-highlight-during-drag.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact during-pointer-down suppression and preserved pointer-up multi-cell selection are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `patch` owns the local behavior repair; `autogoal` owns closure; Browser owns visible proof |
| Active goal checked or created | yes | Goal points at this plan and the exact red/green plus 5-run threshold |
| Source of truth read before edits | yes | Screenshot, `TablePlugin.mouseUp`, `useTableSelectionDOM`, registry `TableElement`/`TableCellElement`, existing native-selection solutions, and www Browser test patterns read |
| Tracker comments and attachments read | yes | User screenshot read; no tracker thread exists |
| Video transcript evidence required | no | N/A: the attachment is a still screenshot |
| `docs/solutions` checked for non-trivial existing-code work | yes | Native Table selection must remain browser-owned during drag; mouse-up is the final model import point, so the fix must suppress paint without deleting the DOM Range |
| TDD decision before behavior change or bug fix | yes | Exact Browser red first, then the narrowest durable automated regression at the event/projection owner |
| Branch decision for code-changing task | no | N/A: edit the user-authorized current checkout; no branch operation or Git publication |
| Release artifact decision | yes | Add a Table changeset if the published package owns the fix; registry-only changelog is N/A unless the fix stays registry-only |
| Browser tool decision for browser surface | yes | Browser was used for the exact pointer drag; no Chrome-only native UI was involved |
| PR expectation decision | no | N/A: user did not request a PR |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Owner-scoped reads and capped output are recorded above |
| Browser pack selected | yes | Browser pack is materialized in this plan |
| Browser route / app surface identified | yes | `/blocks/table-demo` exact table interaction |
| Browser tool decision recorded | yes | Use Browser for pointer drag and native DOM selection inspection |
| Console/network caveat policy recorded | yes | Relevant runtime errors fail proof; expected dev/fallback noise is recorded separately |
| Observable browser case captured | yes | `local:table-cell-drag-native-highlight`; screenshot; `/blocks/table-demo`; pointer down in one cell, drag into a second or more, inspect native highlight before pointer-up, then verify exact selection after pointer-up; Browser/macOS scope; dirty current checkout and final production/test fingerprints will be recorded |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: the report contains a
      still screenshot and an exact written pointer-down condition.
- [x] Nearby repo instructions and implementation patterns read before edits:
      Table mouse-up import, DOM projection, registry cell styles, and www
      Browser harness patterns were inspected.
- [x] Implementation fixes the right ownership boundary: conditional paint
      suppression belongs to the rendered registry cell; core selection state
      and the native Range remain unchanged.
- [x] Release artifact requirement recorded: registry-only UI repair uses the
      canonical Table registry changelog entry; no package changeset applies.
- [x] Final handoff shape decided: local bug-fix handoff with tests, Browser
      proof, design rationale, and no PR/tracker mutation.
- [x] Branch handling recorded: N/A; the authorized current checkout on `next`
      was edited without a branch operation, commit, push, or PR.
- [x] Local-env-rot retry policy recorded: the unexpected missing Playwright
      module triggered one `pnpm run reinstall`, then the exact test and final
      typecheck passed.
- [x] Workspace authority recorded: repo commands ran in
      `/Users/zbeyens/git/plate-2`; app proof ran against www's
      `/blocks/table-demo` with Browser and the www Playwright project.
- [x] High-risk note recorded: clearing or collapsing the held native Range
      would break mouse-up import. The fix changes paint only and proves the
      Range remains present during drag and is cleared only after mouse-up.
- [x] Review/P1 autoreview decision recorded: N/A because the current branch is
      `next`, where repo policy forbids `autoreview`; a manual current-source P1
      audit found no blocker.
- [x] Agent-native review decision recorded: N/A; no agent, rule, skill, hook,
      command, prompt, or user-action tooling source changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Browser is
      the selected surface for this ordinary app interaction.
- [x] Browser pack: console errors were checked and the final ledger was empty;
      network was not material because the interaction is local and fully loaded.
- [x] Browser pack: Browser captured the visible held-drag state directly; no
      Chrome or Computer fallback was needed.
- [x] Browser pack: the exact held multi-cell drag failed before the fix with
      four non-transparent cell `::selection` backgrounds.
- [x] Browser pack: final proof used a fresh server and page on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: N/A for shipped fixed/completed proof because this is an
      uncommitted local candidate in a shared checkout, not a pushed immutable
      ref. A fresh final process was used, but no clean-checkout claim is made.
      The general fixed/completed rule starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection paint and focus passed 5/5 retry-free warm
      runs in Browser: held Range count 1, four selected cells, transparent
      paint; after mouse-up Range count 0, four selected cells, editor focused.
      The general exact-Chrome clause is N/A because no exact browser was named.
      Native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, direct generated-file edit, route
      bypass, or unshipped proof scaffolding was counted. Registry output came
      only from the owning generator.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact red, focused green, 5/5 Browser, typecheck, lint, generation, and source audit passed |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Exact test failed at the four non-transparent selected-cell backgrounds; Browser screenshot confirmed blue native paint while held |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `table-selection.spec.ts` passed 1/1 on final code |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=www`: 59/59 passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A as a product change; one policy-required `pnpm run reinstall` recovered missing Playwright and passed |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate-2`; Browser and www Playwright exercised `/blocks/table-demo` |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser exact held drag proved transparent paint and preserved selection |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Fresh server/page, screenshot, empty console ledger, and 5/5 warm runs recorded below |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edit |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry component CSS only; no published package/API changed |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Current canonical source is `apps/www/src/registry/changelog/entries`; Table fix entry generated and `--check` passed 82 events |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental registry changelog source and generated JSON agree; no docs route claim needed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode is destroying the Range needed by mouse-up; test proves Range 1 while held and 0 only after mouse-up |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling source changed |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | Missing `@playwright/test/cli.js` recovered after one reinstall; exact test and typecheck passed |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: branch is `next`, where repo policy forbids autoreview; manual P1 source audit found no blocker |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR exists |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR body |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker named |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `pnpm exec ultracite check` passed both source and regression test |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One parallel final scan overflowed the tool budget; every proof was rerun as a narrow capped command |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-hide-native-table-highlight-during-drag.md` | Passed on the final plan state |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Exact pointer-down multi-cell drag exercised on `/blocks/table-demo` |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Console/warning ledger was empty; no interaction-relevant network error |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser screenshot captured held selection with no blue text paint; metrics are recorded below |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | While held: Range 1, four selected cells, transparent paint; mouse-up: Range 0, four selected cells, editor focused |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Dirty local candidate on `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; hashes below |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: uncommitted local candidate in shared checkout; fresh server proof passed, but no pushed/clean-ref claim |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | 5/5 Browser warm runs passed without retry |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Exact report, source owners, acceptance case, skills, and red proof recorded | implementation |
| Implementation | complete | Conditional selected-cell `::selection` paint suppression plus focused Browser regression | verification |
| Verification | complete | Focused test, typecheck, lint, registry generation/check, manual P1 audit, and 5/5 Browser passed | closeout |
| PR / tracker sync | complete | N/A: neither requested nor named | final response |
| Closeout | complete | Final plan evidence, hashes, and checker recorded | final response |

Findings:
- Screenshot shows blue native text selection across multiple Table cells while
  the pointer is still down; the highlight disappears on pointer-up.
- Exact Browser red on `/blocks/table-demo`: held native drag from `Plugin` to
  `Void` yields one DOM Range, text `ugin\nElement\nInline\nVoid`, four
  `data-table-cell-selected=true` cells, and a non-transparent
  `::selection` background on all four cells before mouse-up.
- `useTableSelectionDOM` already projects the multi-cell state during the held
  drag. The registry can therefore suppress only the selection paint on cells
  carrying that attribute while preserving the native Range used by
  `TablePlugin.mouseUp`.

Decisions and tradeoffs:
- Treat native paint suppression as a transient pointer/DOM concern; do not
  change or duplicate the core NodeSelection model unless reproduction disproves
  that classification.
- Keep the browser's native Range intact while the pointer is held because
  `TablePlugin.mouseUp` imports that Range into the editor's NodeSelection.
- Use the existing `data-table-cell-selected` projection as the selector. This
  avoids plugin state, event interception, and a second selection lifecycle.
- Reject global `user-select: none` and unconditional transparent selection:
  both would break ordinary caret/text selection inside a cell.

Implementation notes:
- Added conditional transparent `::selection` styles to `TableCellElement` for
  the selected cell itself and descendants.
- Added `table:hide-native-highlight-during-multi-cell-drag` to the www Browser
  suite with a real held pointer drag, native Range/paint assertions, mouse-up
  state, focus, and runtime-error checks.
- Added the canonical Table registry changelog entry and regenerated the
  registry/changelog output through owning commands.
- A same-file arrow callback was normalized only to satisfy the scoped final
  lint pass; no behavior changed.

Review fixes:
- Spaced real mouse moves and waited for the editor harness so the test reaches
  the same browser gesture deterministically instead of starting on the handle.
- Removed an unused test variable and formatted the new test.
- Manual P1 review confirmed the selector is conditional, preserves the native
  Range, covers descendants, and does not change editor selection state.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial dev-server start found an existing listener | 1 | Use the live owner for red proof, then restart after reinstall | Final proof used the newly started server |
| First automated drags did not create the native Range | 2 | Wait for the editor harness and move from cell text in spaced steps | Exact pre-fix transparency assertion failed, then passed after the fix |
| Playwright CLI disappeared from local install | 1 | Apply the required local-env recovery once | `pnpm run reinstall`, exact test, and final typecheck passed |
| First scoped lint found formatting, unused test data, and arrow style | 1 | Fix only the reported source/test issues | Final scoped Ultracite check passed |
| Manual same-cell CDP drag did not create a native Range | 1 | Do not claim that gesture; prove normal paint remains enabled through computed style before the multi-cell drag | Regression test asserts the pre-drag selection background is non-transparent |
| Parallel final scan exceeded the tool output budget | 1 | Rerun each final proof as a narrow capped command | Branch, ref, hashes, generated selector, changeset status, and diff check were recovered |

Verification evidence:
- Exact pre-fix Browser red: held drag `Plugin` to `Void` produced Range count
  1, native text `ugin\nElement\nInline\nVoid`, four projected selected cells,
  and four non-transparent `::selection` backgrounds.
- Focused final test:
  `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www test:www-browser:chromium tests/browser/table-selection.spec.ts`
  passed 1/1 without retry.
- Browser final stability on a fresh server/page: 5/5 held drags produced
  `paintTransparent=true`, `rangeCount=1`, and `selectedCount=4`; every
  mouse-up produced `rangeCount=0`, `nativeText=''`, `selectedCount=4`, and
  `focused=true`. Console/warning ledger: `[]`.
- `pnpm turbo typecheck --filter=www`: 59/59 tasks passed in 1m4.836s.
- `pnpm exec ultracite check apps/www/src/registry/components/editor/table.tsx apps/www/tests/browser/table-selection.spec.ts` passed.
- `pnpm --filter www build:registry` generated 380 canonical payloads and 15
  sparse overlays; `apps/www/public/r/table.json` contains both conditional
  transparent-selection classes.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` passed all
  82 events; `git diff HEAD --check` passed.
- `pnpm changeset status` passed. Its existing package bump ledger is unrelated;
  this registry-only CSS repair needs no package changeset.
- Manual current-source P1 audit: no blocker. `autoreview` is forbidden on
  current branch `next`.
- Final ref and SHA-256 fingerprints:
  - base HEAD: `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`
  - production source `table.tsx`:
    `d0526222569905e6750d76dee6afec693adde3e93e1c31fcbe96d7b6cff12179`
  - Browser test `table-selection.spec.ts`:
    `e635553f15337721bf13fb3910f2c54b58892af634bc133614c8d63918cd7e05`
  - changelog entry:
    `e988391f95b537ebe08ca2b60e77b0d031c5943b0a674b23568c159cf6f601f0`
  - generated registry `table.json`:
    `ca9fba5a9fad6a24e2645ccd7885be1445cd181957fe29c84e71a18507a88cb3`

Final handoff contract:
- PR line: N/A: no PR, commit, or push requested.
- Issue / tracker line: N/A: no issue or tracker named.
- Confidence line: high for this uncommitted local candidate; exact red/green,
  final typecheck/lint/generation, manual review, and 5/5 Browser passed.
- Flow table:
  - Reproduced: test and Browser both observed the held native paint leak.
  - Verified: focused test 1/1 and Browser 5/5 passed on final local code.
- Browser check: fresh `/blocks/table-demo` page; no native blue text paint
  while held across four cells; exact multi-cell selection survives mouse-up;
  editor remains focused; no runtime console error.
- Outcome: native text paint is hidden only while projected multi-cell Table
  selection is active.
- Caveat: this is an uncommitted candidate in the shared checkout, not proof of
  a pushed clean ref. Browser could not synthesize a same-cell Range manually;
  the test instead proves normal selection paint is enabled before the gesture.
- Design:
  - Chosen boundary: registry `TableCellElement` paint tied to the existing DOM
    projection attribute.
  - Why not quick patch: preventing default or clearing the Range would erase
    the mouse-up input that creates the exact editor selection.
  - Why not broader change: core NodeSelection and Table plugin behavior are
    already correct; another state owner would add the bug-prone layer the
    selection cut deliberately removed.
- Verified: exact held and released states, 5/5 stability, focused test,
  typecheck, scoped lint, generated registry/changelog parity, and manual P1
  source audit.
- PR body verified: N/A: no PR exists.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested.
- Issue / tracker: N/A: none named.
- Browser proof: exact red; final fresh-page 5/5 with screenshot, native state,
  focus, selected-cell count, paint, and empty console ledger.
- Caveats: local uncommitted candidate only; no clean pushed-ref claim.

Timeline:
- 2026-08-26T08:05:47.534Z Task goal plan created.
- 2026-08-26 Exact Browser/CDP held-drag repro confirmed the native paint leak
  before mouse-up; current selection state and package/UI ownership were read.
- 2026-08-26 Added conditional selected-cell selection-paint suppression and
  the exact real-pointer Browser regression; pre-fix test failed at paint.
- 2026-08-26 Final candidate passed focused Browser 1/1, fresh-page Browser 5/5,
  www typecheck 59/59, scoped lint, registry generation, changelog check, diff
  check, and manual P1 audit.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final local-candidate handoff |
| What is the goal? | Hide native text highlight during multi-cell drag while preserving exact Table selection |
| What have I learned? | See Findings |
| What have I done? | Implemented the conditional paint fix and closed the exact red/green, generated-output, review, and 5/5 Browser gates |

Open risks:
- No behavior blocker remains in the verified case. The only delivery caveat is
  that the candidate is uncommitted in a shared dirty checkout, so no pushed-ref
  or release claim is made.
