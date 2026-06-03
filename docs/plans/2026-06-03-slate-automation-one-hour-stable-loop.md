# slate automation one hour stable loop

Objective:
Run a 1h Slate automation timed loop on default stable Slate v2 behavior/API/browser proof, patching safe regressions and oracle/workflow gaps.

Goal plan:
docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat
- title: `slate-automation 1h`
- acceptance criteria:
  - use `slate-automation`;
  - invocation mode: timed 1h;
  - no explicit surface, so choose the default stable/current Slate v2 supervisor surface;
  - run safe proof/repair packets while the 1h loop-start budget remains;
  - finish, revert, or quarantine the active packet before handoff even if this exceeds the wall-clock;
  - stack soft stopping checkpoints for final handoff;
  - patch safe bugs, safe oracles, and safe workflow misses;
  - avoid commit, PR, branch, ship/release/publish, and broad experimental pagination/virtualization architecture unless explicitly requested later;
  - final handoff must include changed list, workflow slowdowns, needs-your-attention, stopping checkpoints, residual risks, exact proof commands, and next owner.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- The loop may complete only after the 1h timed mode loop-start budget is spent or no safe owner remains, with the current packet kept/reverted/quarantined.
- At least one stable Slate v2 behavior proof packet runs from `.tmp/slate-v2`.
- At least one API/DX/oracle/workflow proof or scan packet runs and is kept, repaired, queued, or recorded no-change.
- Any safe bug/oracle/workflow miss found during the loop is patched and reverified; broad architecture is queued rather than improvised.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md` passes.

Verification surface:
- `.tmp/slate-v2` focused Playwright suites for stable editor routes.
- `.tmp/slate-v2` package/API checks for touched packages or proof helpers.
- In-app Browser or Playwright screenshots/geometry for visible route smoke when useful.
- Parent repo `pnpm install` and generated mirror audit only if `.agents/rules/**` changes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/slate-v2` source/tests/examples for Slate runtime; `docs/slate-v2/agent-start.md` and `slate-north-star` for current claim/taste; `.agents/rules/**` for skills if workflow repair is needed; this plan for run state.
- Allowed edit scope: safe runtime/test/oracle fixes in `.tmp/slate-v2`; safe `slate-browser` helper/API improvements; safe workflow rule fixes in `.agents/rules/**`; this plan.
- Browser surface: stable examples under `http://localhost:3100/examples/*`.
- Tracker sync: N/A; no issue/PR/tracker requested in this prompt.
- Non-goals: commit/PR/push; release/publish/changeset/ship readiness; broad pagination optimization; broad virtualization architecture; parent dirty-state review outside Slate-v2-related `docs/**`.

Output budget strategy:
- Use focused `rg`, `sed`, Playwright `--grep`, capped output, and plan rows. Do not broad-stream generated bundles, source maps, or all test names. Save long artifacts outside chat and summarize evidence.

Blocked condition:
- Stop only when the 1h loop-start budget is spent after the current packet is kept/reverted/quarantined, no safe owner remains, all meaningful proof is blocked by tool/server access after retry, or the next move needs a user-only taste/architecture/authority decision.

Task state:
- task_type: slate-automation timed stable-feature loop
- task_complexity: major
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: high
- next owner: remaining automation closure / quarantined IME stress owner
- reason: user requested timed `slate-automation` with no surface, so default stable Slate v2 proof/repair ladder applies.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint captured skill, timed 1h mode, default stable surface, non-goals, stop policy, verification surfaces, and final handoff sections. |
| Skill analysis before edits | yes | Used user-provided `slate-automation`; read `slate-north-star`; read `docs/slate-v2/agent-start.md`; compared prior stable automation plan. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` started this timed loop objective. |
| Source of truth read before edits | yes | `slate-north-star`, `docs/slate-v2/agent-start.md`, and prior loop plan read; target source/tests will be read before any patch. |
| Tracker comments and attachments read | N/A: no tracker | Prompt is `slate-automation 1h`. |
| Video transcript evidence required | yes | 2026-06-03 selection follow-up videos transcribed: v2 restores text but loses native selected text after undo; upstream Slate restores the selected word after undo. |
| `docs/solutions` checked for non-trivial existing-code work | deferred | Use live proof first; search solutions only when a concrete failure/root cause appears. |
| TDD decision before behavior change or bug fix | yes | Add/repair the smallest honest oracle before or with any runtime fix. |
| Branch decision for code-changing task | N/A: stay current checkout | No branch/PR request. |
| Release artifact decision | yes | Continuous private alpha; no release/publish/changeset unless user asks or a later explicit ship skill is invoked. |
| Browser tool decision for browser surface | yes | Use Playwright for replayable behavior; use in-app Browser for visual smoke only when useful. |
| PR expectation decision | N/A: no PR | No commit, push, or PR authority. |
| Tracker sync expectation decision | N/A: no tracker | No issue/Linear sync. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Browser pack selected | yes | Browser pack applies to stable examples. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/*` stable routes. |
| Browser tool decision recorded | yes | Playwright first for behavior; Browser for visual/console smoke if route proof needs it. |
| Console/network caveat policy recorded | yes | Record console state only for Browser smoke; network is out of scope unless a route failure points there. |
| Package/API pack selected | yes | Package/API pack applies if helper/runtime/API surfaces are touched. |
| Public surface or package boundary identified | yes | Potential surfaces: `slate-react`, `slate`, `slate-history`, `slate-browser` proof APIs. |
| Release artifact path selected | yes | `N/A: continuous private alpha; no published artifact in ordinary automation loop`. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset/release work in this prompt. |
| Barrel/export impact decision recorded | yes | N/A unless an exported file/path changes. |
| Agent-native pack selected | yes | Skill repair may be needed if workflow misses recur. |
| Agent-facing action surface identified | yes | `.agents/rules/slate-automation.mdc` source and generated skill mirror if changed. |
| Source rule versus generated mirror boundary identified | yes | Patch source rule only, run `pnpm install` if `.agents/rules/**` changes. |
| `agent-native-reviewer` loaded or waiver recorded | deferred | Load only if agent rules/skills change in this run. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Browser final proof | pending | Attach screenshot or exact browser verification caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md` | pending |
| Browser interaction proof | pending | Exercise the target route/interaction with the approved browser tool or record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route proof or exact caveat | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | created plan; read `slate-automation`, `slate-north-star`, video evidence, and selection-runtime owner | implementation |
| Implementation | paused | issue #12 undo fix plus DOM selection export follow-up packet kept; broad automation paused by user | resume from remaining automation closure rows when requested |
| Verification | in_progress | focused package/browser gates and `bun check` passed for kept packet; selection-oracle skill repair synced | closeout/update remaining gates |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- Issue #12 interruption superseded the 1h loop: the prior mouse-drag undo rows
  were false positives because they used one synthetic `insertText(...)` event.
  The manual Chrome path types multiple real keys after selecting text, and
  current v2 reproduced `This is editable stext...` after undo.
- 2026-06-03 selection follow-up video evidence:
  - v2 video: after selecting `plain `, typing `simple`, and undoing, text
    returns to `This is editable plain text, just like a <textarea>!`, but
    native selected text is gone while the OS Translate selection affordance
    remains.
  - upstream Slate video: after the same replacement/undo class, the restored
    word `plain` remains visibly selected.
- Repro probe after the issue #12 text fix: model text restored correctly,
  model selection restored to `[0,0] 17..23`, native selected text was `""`,
  and DOM selection collapsed at `[0,0] offset 0`.
- Root cause: `selection-runtime` skipped DOM export for synced text-only
  commits. That is correct for native typing/caret repair but wrong for
  command-owned history undo commits that restore an expanded selection.

Decisions and tradeoffs:
- Pause the generic automation loop until issue #12 is fixed and synced.
- Fix the durable `slate-history` merge rule instead of adding example-local
  workarounds.
- For the follow-up selection issue, fix `slate-react` selection export rather
  than history or example glue. History already restored the model selection;
  the broken layer was native DOM selection export after command-owned undo.
- The oracle now checks user-visible native selected text with
  `slate-browser` helpers. Exact DOM node assertions stay on plaintext, where
  the route is single text-node stable; rich/inline routes assert selected text
  to avoid brittle node-split coupling.

Implementation notes:
- In `.tmp/slate-v2`, selected-text replacement typing now stays in one undo
  unit when the previous batch is a same-root/same-path text replacement ending
  in an inserted character.
- Issue-named Playwright rows now type replacement text with real keyboard
  events instead of `page.keyboard.insertText(...)`.
- `selection-runtime` now treats command-owned text-only commits as DOM export
  candidates, so history undo/redo can restore an expanded model selection to
  the browser selection.
- Added a `slate-react` unit contract for command-owned text-only selection
  export.
- Added native selected-text assertions to the issue-backed Playwright rows in
  plaintext, inlines, styling, and code-highlighting.
- Patched `slate-automation` so future selection/editing packets require both
  model selection and native selected-text / DOM-selection proof; upstream Slate
  examples are an allowed parity reference when expected native behavior is
  disputed.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun direct path filter did not match `selection-runtime-contract.test.ts` | 2 | Use owning package Vitest command | `bun --filter slate-react test:vitest -- selection-runtime-contract.test.ts` passed. |
| Generated stress `ime-composition-undo` failed in WebKit while closing unrelated stress packet | 1 | Quarantine as separate IME/synthetic transport owner, not part of selection fix | Pending remaining automation handoff; do not mix with issue #12/selection packet. |

Verification evidence:
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts --test-name-pattern "merges typing after selected text replacement"`: pass.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/styling.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium --grep "mouse drag undo restores"`: 5 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-history typecheck`: pass.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-history/test`: 14 passed, 1 skipped.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun check`: pass; known pagination hook warning remains.
- Red proof after adding the native-selection oracle:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "mouse drag undo restores manual typed replacement"` failed with expected selected text `plain ` and received `""`.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-react test:vitest -- selection-runtime-contract.test.ts`: 13 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/styling.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium --grep "mouse drag undo restores"`: 5 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-react typecheck`: pass.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun check`: pass; known pagination hook warning remains.
- `cd /Users/zbeyens/git/plate-2 && pnpm install`: pass; synced generated `slate-automation` skill mirror.

Packet ledger:
| Packet | Status | Files | Evidence | Next |
|--------|--------|-------|----------|------|
| Issue #12 text undo false-positive repair | kept | `packages/slate-history/src/history-extension.ts`; `packages/slate-history/test/history-contract.ts`; issue-backed Playwright rows | history unit, focused Chromium rows, `slate-history` typecheck, `bun check` | done |
| Selection undo native export repair | kept | `packages/slate-react/src/editable/selection-runtime.ts`; `packages/slate-react/test/selection-runtime-contract.test.ts`; issue-backed Playwright rows | red native-selection Playwright proof, package Vitest, focused Chromium rows, `slate-react` typecheck, `bun check` | broaden only if a new route reproduces |
| Automation selection-oracle rule repair | kept | `.agents/rules/slate-automation.mdc`; `.agents/skills/slate-automation/SKILL.md` | `pnpm install` synced the generated mirror; rule now requires native selected-text / DOM-selection proof for selection-editing packets | done |
| Generated stress hovering-toolbar budget alignment | kept | `playwright/stress/generated-editing.test.ts` | toolbar stress passed in Chromium/WebKit after aligning to route budget | pending broader stress rerun due separate IME row |
| Generated stress WebKit IME composition undo | quarantined | no runtime change | failed after toolbar packet with model text missing `すし` before undo | next owner: synthetic IME transport/runtime, not issue #12 |

Changed list for this run:
- Fixed `slate-history` selected-text replacement typing merge so real key typing after a selected replacement undoes as one batch.
- Repaired issue-backed Playwright tests to use real keyboard typing instead of synthetic `insertText`.
- Fixed `slate-react` DOM selection export after command-owned history undo.
- Added package and browser oracles for native selected text restoration after undo.
- Patched `slate-automation` so future selection tests cannot stop at model-only
  proof.
- Aligned generated hovering-toolbar stress budget with the dedicated route budget.
- Updated this plan with video transcripts, red/green evidence, packet ledger, workflow slowdowns, and review-attention notes.

Workflow slowdowns:
- The original issue #12 test was a false positive because it did not use real
  key events and did not assert native/browser selection after undo.
- The automation skill had selection proof language, but it was too vague; it
  now explicitly requires native selected-text / DOM-selection proof.
- Direct `bun test <path>` was noisy for the Vitest-owned `slate-react`
  contract; use `bun --filter slate-react test:vitest -- <file>` for this
  package.
- The generated stress row had an over-tight `total: 0` toolbar render budget
  that contradicted the dedicated route budget.

Needs review / attention:
- Selection export fix is small but central: review
  `packages/slate-react/src/editable/selection-runtime.ts` for whether all
  command-owned text-only commits should export DOM selection, or whether this
  should be narrowed to `history_undo` / `history_redo`.
- WebKit synthetic IME composition undo stress remains quarantined as a
  separate packet.
- No release/publish/changeset decision needed during continuous private alpha.
- Broad `slate-automation` is intentionally paused by user request; do not
  resume IME or pagination work until a new owner is requested.

Stopping checkpoints queued:
- Should command-owned text-only DOM export stay broad, or narrow to history
  commands only? Current take: broad is correct because command-owned means the
  model owns the post-commit selection.
- Should the WebKit synthetic IME stress be fixed in `slate-browser` transport
  first or in runtime composition handling? Current take: prove transport first.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-03T18:11:02.709Z Task goal plan created.
- 2026-06-03T20:13:02 User interrupted with issue #12 false-positive report and video evidence; automation loop paused.
- 2026-06-03T20:21 Issue #12 reproduced with repaired real-key Playwright row, fixed in `slate-history`, and verified with focused browser/package gates plus `bun check`.
- 2026-06-03T18:35:37Z Selection follow-up from videos reproduced as DOM/native selection export loss after undo, fixed in `slate-react`, and verified with focused browser/package gates plus `bun check`.
- 2026-06-03T20:44Z User paused the broader loop and called out the testing miss. Quarantined unrelated IME work, synced `slate-automation` with explicit native selection-oracle requirements, and reran focused selection gates plus `bun check`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Paused after keeping issue #12 and selection-export packets, plus selection-oracle skill repair |
| Where am I going? | Wait for next owner; remaining automation closure rows, quarantined IME owner, and optional browser visual smoke stay queued |
| What is the goal? | Timed stable Slate v2 automation loop with safe proof/repair packets and durable handoff |
| What have I learned? | See Findings and packet ledger |
| What have I done? | See Timeline and changed list |

Open risks:
- Overall automation closeout is not complete; many generic completion rows
  still need final N/A/evidence cleanup before `check-complete.mjs`.
- Generated WebKit IME stress row remains quarantined.
- Browser visual smoke across richtext/plaintext/editable-voids/hidden routes
  is still a remaining automation owner if the loop resumes beyond this
  selection packet.
