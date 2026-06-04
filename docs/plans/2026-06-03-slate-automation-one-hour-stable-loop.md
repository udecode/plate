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
- current_phase: closeout
- current_phase_status: complete
- next_phase: handoff
- goal_status: active

Current verdict:
- verdict: complete-ready
- confidence: high
- next owner: final handoff; quarantined IME stress is a separate follow-up owner
- reason: timed stable loop ran behavior, browser smoke, package, generated stress, and workflow-repair packets; remaining IME transport work is quarantined outside this packet.

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
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules, or N/A reason is recorded.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset, or N/A reason is recorded.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused behavior rows, browser smoke, generated stress, package checks, and `bun check` all recorded below. Timed-loop completion uses "no safe in-scope owner remains"; IME is quarantined as separate follow-up. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Issue #12 real-key repro, native-selection red proof, and multi-leaf red proof recorded in Findings and Verification evidence. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `history-contract`, `selection-runtime-contract`, six-row Chromium browser sweep, and `bun check` passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter slate-history typecheck`, `bun --filter slate-react typecheck`, and `bun check` passed. |
| Package exports or file layout changed | N/A: no export or file layout changes | Run `pnpm brl` before final verification and keep generated barrel updates | No public export path, barrel, or file-layout change. |
| Package manifests, lockfile, or install graph changed | N/A: install graph unchanged | Run `pnpm install` and relevant package checks | Parent `pnpm install` reported lockfile up to date; `.tmp/slate-v2` package checks passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Parent `pnpm install` synced generated `slate-patch` and `slate-automation`; `rg` found new rules in source and mirrors. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | Runtime/browser proof ran from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`; agent sync proof ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | In-app Browser control tool was not exposed by `tool_search`; route Playwright smoke covered richtext, plaintext, editable-voids, hidden-content-blocks. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Screenshots saved under `.tmp/slate-v2/tmp/automation-smoke-stable/*.png`; report JSON has empty console/page errors. |
| CI-controlled template output changed | N/A: no templates changed | Restore generated template output or record why it is intentionally kept | No `templates/**` or registry output touched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Runtime package behavior changed in continuous private alpha; no public API/export shape changed and user explicitly deferred release/publish. |
| Registry-only component work changed | N/A: no registry component work | Update `docs/components/changelog.mdx` or record N/A | No registry files touched. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | This plan and skill rules changed; claims are source-backed by commands and `rg`; no user-facing docs/content changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risks recorded under Needs review: history merge heuristic and selection export breadth; proof commands recorded. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded `agent-native-reviewer`; diff is skill/rule text only, no UI action/tool parity feature. Source/mirror discoverability audited with `rg`; no actionable parity gap. |
| Local install corruption suspected | N/A: no env-rot signature | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | Failures were real regressions or formatter-only; no React hook/module corruption signature. |
| Autoreview for non-trivial implementation changes | N/A: user stopped autoreviews | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Manual harsh diff review found and fixed the `statePatches` merge guard; formal autoreview intentionally skipped per prior user direction. |
| PR create or update | N/A: no PR authority | Run `check` before PR work and sync PR body to the task-style final handoff | No commit/push/PR requested. |
| Task-style PR body verified | N/A: no PR | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR exists for this local loop. |
| PR proof image hosting | N/A: no PR | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | Screenshots remain local artifacts. |
| Tracker sync-back | N/A: no tracker | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Prompt had no issue/Linear sync target for this loop. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff section filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `.tmp/slate-v2 bun check` ran lint/typecheck/tests and passed; formatter issue was fixed before rerun. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Commands were focused with capped output; one tsbuildinfo `rg` over-included generated output earlier but was capped and not repeated. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md` | Pass: `[autogoal] complete: docs/plans/2026-06-03-slate-automation-one-hour-stable-loop.md`. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Playwright smoke selected text/clicked editors on richtext, plaintext, editable-voids, hidden-content-blocks; screenshots saved. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Smoke report recorded zero console errors and zero page errors; network audit out of scope because route loads were successful. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | `.tmp/slate-v2/tmp/automation-smoke-stable/report.json` plus per-route screenshots. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Runtime behavior changed in `slate-history` and `slate-react`; no exports, manifests, or public API types changed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime behavior changed, but current state is continuous private alpha and release artifacts are intentionally deferred. |
| Published package changeset | N/A: no release/publish in private alpha | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | User explicitly said no release/publish soon; no changeset added. |
| Registry changelog | N/A: no registry work | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | No registry files touched. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No release artifact because current state is continuous private alpha; package runtime fixes remain local/unpublished. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `slate-history`/`slate-react` focused checks and `.tmp/slate-v2 bun check` passed. |
| Barrel/export generation | N/A: no exports or exported file layout changed | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No barrel generation needed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Parent `pnpm install` passed and regenerated skills. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found new rules in `.agents/rules/slate-patch.mdc`, `.agents/skills/slate-patch/SKILL.md`, `.agents/rules/slate-automation.mdc`, and `.agents/skills/slate-automation/SKILL.md`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded skill; no UI/tool parity changes, and generated mirrors make the workflow repair agent-readable. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | created plan; read `slate-automation`, `slate-north-star`, video evidence, and selection-runtime owner | implementation |
| Implementation | done | issue #12 undo fix, multi-leaf history fix, selection export fix, generated stress budget, and skill repairs kept | verification complete |
| Verification | done | focused package/browser gates, stable prior-failure rows, generated stress, browser smoke, and `bun check` passed | closeout |
| PR / tracker sync | N/A | no PR/tracker authority in prompt | final response |
| Closeout | done | completion gates filled; `check-complete` rerun after this edit | final response |

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
- 2026-06-03 20:44 video evidence showed the previous history fix was too
  narrow: selecting `editable rich text` across normal/bold/normal leaves,
  typing `example`, and pressing one undo left broken text (`This is s, much
  better...`) with no visible selection. The first fix only covered same-path
  text replacement, not structural multi-leaf replacement.
- Repro probe for the multi-leaf case: first typed character produced
  `remove_text`, `remove_node`, `remove_text`, `merge_node`, then
  `insert_text`. Subsequent typed characters were saved as a separate batch, so
  one undo only removed the tail of the typed word.

Decisions and tradeoffs:
- Pause the generic automation loop until issue #12 is fixed and synced.
- Fix the durable `slate-history` merge rule instead of adding example-local
  workarounds.
- Extend the history merge rule to the operation class, not the screenshot:
  expanded-selection replacement batches that delete across one root and end in
  inserted text should merge follow-up typing, even when the replacement spans
  multiple leaves and structural delete operations.
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
- The history merge rule now also recognizes expanded-selection replacement
  batches that delete text/nodes in one root and end with inserted text, so
  follow-up typing after a multi-leaf replacement stays in the same undo unit.
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
- Patched `slate-patch` and `slate-automation` so future selection/history
  packets cannot stop at a single-DOM-text-node row when the selected phrase can
  cross marks, links, inline boundaries, or multiple leaves.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun direct path filter did not match `selection-runtime-contract.test.ts` | 2 | Use owning package Vitest command | `bun --filter slate-react test:vitest -- selection-runtime-contract.test.ts` passed. |
| Generated stress `ime-composition-undo` failed in WebKit while closing unrelated stress packet | 1 | Quarantine as separate IME/synthetic transport owner, not part of selection fix | Pending remaining automation handoff; do not mix with issue #12/selection packet. |
| `dragTextRange` could not express `editable rich text` because it spans many DOM text nodes | 1 | Use explicit Slate path endpoints and record the helper limitation in skill rules | Multi-leaf Playwright row added with exact DOM endpoint assertions. |
| `bun check` failed formatter only after the multi-leaf patch | 1 | Apply formatter's exact requested shape with `apply_patch` | Rerun `bun check` passed. |

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
- Multi-leaf red proof:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 bun - <<'TS' ... select [0,0] offset 8 to [0,2] offset 5, type example, Meta+Z ...` showed one undo left `This is e, much better...` with collapsed native selection.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts --test-name-pattern "multi-leaf selected text replacement|selected text replacement"`: 3 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-history typecheck`: pass.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/styling.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium --grep "mouse drag undo restores"`: 6 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-history/test`: 14 passed, 1 skipped.
- `cd /Users/zbeyens/git/plate-2 && pnpm install`: pass; synced generated `slate-patch` and `slate-automation` skill mirrors.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun check`: pass; known pagination hook warning remains.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 bun - <<'TS' ... stable route smoke ...`: pass. Routes loaded: `/examples/richtext`, `/examples/plaintext`, `/examples/editable-voids`, `/examples/hidden-content-blocks`. Console errors: none. Page errors: none. Screenshots/report saved under `tmp/automation-smoke-stable/`.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/query-controls.test.ts playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium --project=firefox --project=webkit --grep "keeps hidden content out of native find|merges a markdown-created list before an existing list|applies beforeinput target ranges|stores DOM coverage boundary controls|stores huge-document perf controls|materializes hidden block keyboard selection matrix vertically"`: 17 passed, 1 intentional Firefox skip.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && STRESS_FAMILIES=paste-normalize-undo,mouse-selection-toolbar,webkit-backward-selection PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/stress/generated-editing.test.ts --project=chromium --project=webkit`: 10 passed.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && STRESS_FAMILIES=paste-normalize-undo,mouse-selection-toolbar,webkit-backward-selection PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/stress/generated-editing.test.ts --project=firefox`: 5 passed.

Packet ledger:
| Packet | Status | Files | Evidence | Next |
|--------|--------|-------|----------|------|
| Issue #12 text undo false-positive repair | kept | `packages/slate-history/src/history-extension.ts`; `packages/slate-history/test/history-contract.ts`; issue-backed Playwright rows | history unit, focused Chromium rows, `slate-history` typecheck, `bun check` | done |
| Multi-leaf selected replacement undo repair | kept | `packages/slate-history/src/history-extension.ts`; `packages/slate-history/test/history-contract.ts`; `playwright/integration/examples/richtext.test.ts` | multi-leaf red proof, package unit, focused Chromium six-row sweep, `slate-history` typecheck, `bun check` | done |
| Selection undo native export repair | kept | `packages/slate-react/src/editable/selection-runtime.ts`; `packages/slate-react/test/selection-runtime-contract.test.ts`; issue-backed Playwright rows | red native-selection Playwright proof, package Vitest, focused Chromium rows, `slate-react` typecheck, `bun check` | broaden only if a new route reproduces |
| Automation selection-oracle rule repair | kept | `.agents/rules/slate-automation.mdc`; `.agents/skills/slate-automation/SKILL.md` | `pnpm install` synced the generated mirror; rule now requires native selected-text / DOM-selection proof for selection-editing packets | done |
| Self-repair: multi-leaf selection proof rule | kept | `.agents/rules/slate-patch.mdc`; `.agents/skills/slate-patch/SKILL.md`; `.agents/rules/slate-automation.mdc`; `.agents/skills/slate-automation/SKILL.md` | `pnpm install` synced mirrors; `rg` found rule in source and generated skills | done |
| Generated stress hovering-toolbar budget alignment | kept | `playwright/stress/generated-editing.test.ts` | toolbar stress passed in Chromium/WebKit after aligning to route budget | pending broader stress rerun due separate IME row |
| Stable route browser smoke | kept | no source changes; `tmp/automation-smoke-stable/*` artifacts | richtext/plaintext/editable-voids/hidden-content-blocks loaded; screenshots saved; console/page errors empty | done |
| Prior-failure desktop stable proof | kept | no source changes | 17 passed, 1 intentional Firefox skip across dom-coverage-boundaries, hidden-content-blocks, markdown-shortcuts, plaintext, query-controls | done |
| Generated paste/selection stress proof | kept | no source changes | 15 passed across Chromium/WebKit/Firefox for paste-normalize-undo, mouse-selection-toolbar, and backward selection | done |
| Generated stress WebKit IME composition undo | quarantined | no runtime change | failed after toolbar packet with model text missing `すし` before undo | next owner: synthetic IME transport/runtime, not issue #12 |

Changed list for this run:
- Fixed `slate-history` selected-text replacement typing merge so real key typing after a selected replacement undoes as one batch.
- Generalized the Slate history fix from same-path text replacement to
  multi-leaf expanded-selection replacement batches with structural delete
  operations.
- Added a richtext Playwright row for `editable rich text` across
  normal/bold/normal leaves: real keyboard typing, one undo, model selection,
  native selected text, and exact DOM endpoints.
- Repaired issue-backed Playwright tests to use real keyboard typing instead of synthetic `insertText`.
- Fixed `slate-react` DOM selection export after command-owned history undo.
- Added package and browser oracles for native selected text restoration after undo.
- Patched `slate-automation` so future selection tests cannot stop at model-only
  proof.
- Patched `slate-patch` and `slate-automation` so future selection/history
  fixes cannot stop at single-DOM-text-node coverage when rich leaves are in
  scope.
- Aligned generated hovering-toolbar stress budget with the dedicated route budget.
- Updated this plan with video transcripts, red/green evidence, packet ledger, workflow slowdowns, and review-attention notes.
- Added stable route smoke screenshots/report under `.tmp/slate-v2/tmp/automation-smoke-stable/`.

Workflow slowdowns:
- The original issue #12 test was a false positive because it did not use real
  key events and did not assert native/browser selection after undo.
- The first history repair was too narrow: same-path text replacement covered
  plaintext but missed multi-leaf richtext replacement. Future fixes must cover
  the operation topology, not only the easiest route.
- The automation skill had selection proof language, but it was too vague; it
  now explicitly requires native selected-text / DOM-selection proof.
- `dragTextRange` only works for one DOM text node. It cannot be the only
  reporter-style selection helper for rich editor tests.
- Direct `bun test <path>` was noisy for the Vitest-owned `slate-react`
  contract; use `bun --filter slate-react test:vitest -- <file>` for this
  package.
- The generated stress row had an over-tight `total: 0` toolbar render budget
  that contradicted the dedicated route budget.
- First browser smoke attempt expected `This` on hidden-content-blocks, but the
  first selected text there is `Intr`; reran with a route-agnostic non-empty
  selection assertion.

Needs review / attention:
- Selection export fix is small but central: review
  `packages/slate-react/src/editable/selection-runtime.ts` for whether all
  command-owned text-only commits should export DOM selection, or whether this
  should be narrowed to `history_undo` / `history_redo`.
- History merge fix is central: review the expanded-selection replacement merge
  heuristic in `packages/slate-history/src/history-extension.ts`, especially
  the decision to merge follow-up typing after structural deletes when the
  previous batch is one-root and ends in `insert_text`.
- WebKit synthetic IME composition undo stress remains quarantined as a
  separate packet.
- No release/publish/changeset decision needed during continuous private alpha.
- The loop has no remaining safe in-scope owner except the quarantined IME
  transport/runtime packet, which should be a dedicated `slate-patch` or
  `slate-automation` follow-up instead of being reopened during closeout.

Stopping checkpoints queued:
- Should command-owned text-only DOM export stay broad, or narrow to history
  commands only? Current take: broad is correct because command-owned means the
  model owns the post-commit selection.
- Should `slate-browser` promote a reusable multi-leaf drag helper? Current
  take: yes if a second test needs real pointer drag across leaves; for this
  packet explicit DOM selection by Slate path is the cleanest replayable proof.
- Should the WebKit synthetic IME stress be fixed in `slate-browser` transport
  first or in runtime composition handling? Current take: prove transport first.

Final handoff contract:
- PR line: N/A: no commit, push, or PR requested.
- Issue / tracker line: N/A: no tracker target in prompt.
- Confidence line: high for kept packets; medium residual risk because WebKit synthetic IME remains quarantined.
- Flow table:
  - Reproduced: red real-key issue #12 probe, red native-selection proof, red multi-leaf replacement proof.
  - Verified: package/unit/typecheck/browser/stress/smoke gates listed in Verification evidence.
- Browser check: stable route Playwright smoke loaded richtext/plaintext/editable-voids/hidden-content-blocks; screenshots/report saved in `.tmp/slate-v2/tmp/automation-smoke-stable/`; no console/page errors.
- Outcome: timed stable automation loop kept selection/history/oracle/workflow fixes and expanded stable proof coverage.
- Caveat: WebKit synthetic IME composition undo is still quarantined; no release/publish/changeset by private-alpha policy; known pagination hook warning remains.
- Design:
  - Chosen boundary: history batching in `slate-history`, DOM selection export in `slate-react`, reusable proof rules in source `.agents/rules/**`.
  - Why not quick patch: example-only or single-node fixes already failed; the final history rule covers the operation topology.
  - Why not broader change: pagination/virtualization architecture and IME transport are separate owners outside this stable-loop closeout.
- Verified: `bun check`, focused package tests/typechecks, six-row Chromium undo sweep, prior-failure desktop rows, generated stress, stable route smoke.
- PR body verified: N/A: no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: `.tmp/slate-v2/tmp/automation-smoke-stable/report.json` and screenshots.
- Caveats: quarantined WebKit synthetic IME; no formal autoreview per user direction; no release artifact by private-alpha policy.

Timeline:
- 2026-06-03T18:11:02.709Z Task goal plan created.
- 2026-06-03T20:13:02 User interrupted with issue #12 false-positive report and video evidence; automation loop paused.
- 2026-06-03T20:21 Issue #12 reproduced with repaired real-key Playwright row, fixed in `slate-history`, and verified with focused browser/package gates plus `bun check`.
- 2026-06-03T18:35:37Z Selection follow-up from videos reproduced as DOM/native selection export loss after undo, fixed in `slate-react`, and verified with focused browser/package gates plus `bun check`.
- 2026-06-03T20:44Z User paused the broader loop and called out the testing miss. Quarantined unrelated IME work, synced `slate-automation` with explicit native selection-oracle requirements, and reran focused selection gates plus `bun check`.
- 2026-06-03T20:51Z Multi-leaf selection replacement bug reproduced from video, fixed in `slate-history`, covered by package and richtext Playwright rows, `slate-patch`/`slate-automation` self-repaired, and `bun check` passed.
- 2026-06-03T21:00Z Stable route browser smoke passed, prior-failure desktop rows passed, generated paste/selection stress passed across Chromium/WebKit/Firefox, closeout gates were filled, and `check-complete.mjs` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete for the timed stable loop; `check-complete.mjs` passed |
| Where am I going? | Final handoff; next optional owner is quarantined WebKit synthetic IME transport/runtime |
| What is the goal? | Timed stable Slate v2 automation loop with safe proof/repair packets and durable handoff |
| What have I learned? | See Findings and packet ledger |
| What have I done? | See Timeline and changed list |

Open risks:
- Generated WebKit IME stress row remains quarantined.
- No formal autoreview was run because the user previously stopped autoreviews;
  manual review did add the `statePatches` guard before final verification.
- No release artifact was added because the current state is continuous private
  alpha and the user explicitly said no release/publish soon.
