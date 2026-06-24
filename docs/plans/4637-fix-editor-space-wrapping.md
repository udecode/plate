# fix editor space wrapping

Objective:
Fix issue 4637 editor inserted-space wrapping if Plate-owned; stop if proof shows Plite/browser ownership.

Goal plan:
docs/plans/4637-fix-editor-space-wrapping.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: GitHub issue
- id / link: [#4637](https://github.com/udecode/plate/issues/4637)
- title: Spaces do overflow, instead of getting moved to the next line
- acceptance criteria: In the Plate registry editor surface, a run of user-entered spaces inside a word must wrap within the editor width instead of extending horizontally past the right edge. If the behavior is owned by Plite or browser layout outside Plate styling, stop with evidence and no code.

Completion threshold:
- The issue is classified as Plate-owned, Plite-owned, invalid, or not reproduced with evidence.
- If Plate-owned, registry editor styling is fixed at the shared ownership boundary, focused regression evidence covers editable and static editor classes, relevant verification commands pass, Browser proof is captured, and the final handoff includes the screenshot.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/4637-fix-editor-space-wrapping.md` passes.

Verification surface:
- Source audit: `apps/www/src/registry/ui/editor.tsx`, `apps/www/src/registry/ui/editor-static.tsx`, and `packages/core/src/react/components/PlateContent.tsx`.
- Focused tests: registry UI class regression around `whitespace-break-spaces`.
- Type/lint: scoped `apps/www` or repo-approved equivalent.
- Browser proof: target Plate docs/registry editor route with inserted spaces using `[@Browser](plugin://browser@openai-bundled)`; do not substitute shell Playwright as repo proof.
- Tracker/PR sync: PR/issue sync completed under the task workflow.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #4637 plus local registry/core source.
- Allowed edit scope: shared registry editor styling, focused tests, registry changelog if required, and this goal plan.
- Browser surface: local Plate editor demo/docs route rendering `Editor` from `apps/www/src/registry/ui/editor.tsx`.
- Tracker sync: GitHub issue #4637 after PR exists, unless no PR is created.
- Non-goals: do not change Plite internals; do not change code-node whitespace; do not patch individual demos one by one; do not manually edit generated registry outputs.

Output budget strategy:
- Use focused `rg` patterns and `max_output_tokens`; the first broad whitespace/editor search was too noisy and is recorded under Error attempts.

Blocked condition:
- Stop without implementation if source/browser proof shows Plite or browser-native ownership, or if the issue cannot be reproduced at any honest level.

Task state:
- task_type: public GitHub bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_complete

Current verdict:
- verdict: valid Plate-owned styling bug, fixed and verified
- confidence: high
- next owner: PR / tracker sync
- reason: The registry editor and static editor used `whitespace-pre-wrap break-words`; `PlateContent` only forwards props to Plite `Editable`, so the durable boundary is registry styling, not Plite internals.

Pre-solution issue challenge:
- reporter claim: Inserting enough spaces inside a word on platejs.org causes the spaces to overflow the editor width instead of wrapping.
- suggested diagnosis or fix: Bot comment suggested missing `white-space: pre-wrap`; harsh verdict: that is backwards for this case because the registry already uses `whitespace-pre-wrap`, and preserved spaces can hang at line ends.
- repro ladder:
  - tests / source-level repro: source audit found shared editable/static registry classes use `whitespace-pre-wrap break-words`.
  - Playwright / automated browser: N/A; repo policy prefers Browser for visual proof, and shell Playwright was not used.
  - Browser plugin: later available through the Browser runtime; captured `/tmp/plate-4637-browser-proof-crop.png`.
  - screenshot / visual proof: captured with Browser; selected spaces wrap inside the editor width.
- reproduction verdict: source-level reproduced as a styling cause; the focused regression failed before the class change and passed after it.
- validity verdict: valid Plate-owned bug.
- best long-term fix boundary: shared `Editor` and `EditorStatic` registry variants should use a whitespace policy that preserves spaces while allowing wrap opportunities.
- harsh honest feedback: The issue is right; the suggested fix is bad because it asks for the current broken class.
- hard-stop decision: no Plite hard stop; proceed only within registry styling and keep code-node whitespace unchanged.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/4637-fix-editor-space-wrapping.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read task skill and autoreview skill; task requires pre-solution issue challenge. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Source of truth read before edits | yes | `gh issue view 4637 --json ...` and `gh issue view 4637 --comments`. |
| Tracker comments and attachments read | yes | Issue body and the only comment, from dosubot, were read. Screenshots showed editor-space overflow but no video/transcript. |
| Video transcript evidence required | no | N/A: issue has screenshots only, no video. |
| Pre-solution issue challenge required | yes | Recorded above. |
| Reproduction verdict before implementation | yes | Source-level reproduced as registry styling cause; Browser visual proof captured during follow-up. |
| Repro escalation ladder selected | yes | Source audit first, focused class regression next, Browser proof on `/blocks/editor-basic`. |
| Suggested fix reviewed against durable boundary | yes | Bot suggestion is rejected because `pre-wrap` is already present; durable boundary is registry editor whitespace policy. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `rg -n "space wrapping|whitespace|break-spaces|pre-wrap|overflow|spaces" docs/solutions .agents/rules docs/plans ...`; no directly applicable prior Plate registry fix. |
| TDD decision before behavior change or bug fix | yes | Add focused registry class regression before/with the styling change; browser layout is not JSDOM-provable. |
| Branch decision for code-changing task | yes | No proactive branch/status check at task start per repo rule; branch/PR only if task reaches PR handoff. |
| Release artifact decision | yes | Registry-only component work likely needs UI changelog, not package changeset; verify after diff. |
| Browser tool decision for browser surface | yes | Browser proof required; later captured through Browser runtime despite earlier tool discovery miss. |
| PR expectation decision | yes | Active task workflow may require PR after verification; decide at closeout after Browser/changelog state is known. |
| Tracker sync expectation decision | yes | Sync back to issue only after PR exists; otherwise N/A. |
| Output budget strategy recorded | yes | Recorded above; broad search mistake captured under Error attempts. |
| Browser pack selected | yes | Applied `browser` pack when creating this plan. |
| Browser route / app surface identified | yes | Local route using registry `Editor` component, preferably standalone demo route such as editor-basic. |
| Browser tool decision recorded | yes | Browser proof captured with `[@Browser](plugin://browser@openai-bundled)`; no shell Playwright substitution. |
| Console/network caveat policy recorded | yes | Browser visual and computed-style proof captured; console/network not material to this CSS wrapping bug. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason: no video evidence.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`.
- [x] Repro escalation ladder followed for bug/behavior claims: source audit and
      focused class regression reproduced the Plate-owned styling cause; Browser
      proof then captured the fixed visual behavior; standalone Playwright was
      not used as a substitute.
- [x] Hard-stop rule followed for bug/behavior claims: no hard stop because the
      bug reproduced at the Plate registry styling boundary.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: shared live/static
      registry editor styling.
- [x] Release artifact requirement recorded: registry changelog, no package
      changeset.
- [x] Final handoff shape decided: task-style PR, issue sync-back after PR,
      Browser proof screenshot.
- [x] Branch handling recorded for code-changing work: create
      `codex/4637-editor-space-wrapping` from `main` for PR.
- [x] Local-env-rot retry policy recorded: N/A, no install-corruption signature;
      repo-wide `pnpm check` passed after fixing a real fixture mismatch.
- [x] Workspace authority recorded: all proof commands ran in
      `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: browser behavior change; proof uses focused
      regression, Tailwind CSS build, source audit, full check, and Browser
      screenshot/computed-style proof.
- [x] Review/autoreview target selected: dirty local diff, `.agents/skills/autoreview/scripts/autoreview --mode local`.
- [x] Agent-native review decision recorded: N/A, no `.agents/**`, `.claude/**`,
      `.codex/**`, skill, hook, command, prompt, or user-action tooling change.
- [x] Output budget discipline recorded: broad searches were narrowed after two
      noisy outputs.
- [x] Browser pack: route, interaction path, and expected visible outcome are
      recorded.
- [x] Browser pack: browser proof uses the repo-approved Browser tool.
- [x] Browser pack: console/network check is N/A; the changed behavior is CSS
      wrapping with no network dependency.
- [x] Browser pack: final handoff screenshot is ready.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named checks and artifact generation | `bun test apps/www/src/registry/ui/editor.spec.tsx`; `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; `pnpm --filter www typecheck`; `pnpm --filter www build:tw`; `pnpm lint:fix`; `pnpm check`; autoreview clean. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Recorded above before edits. |
| Repro escalation ladder | yes | Record lower-to-higher outcomes | Source/test repro succeeded; Browser proof captured on `/blocks/editor-basic`; standalone Playwright intentionally not substituted. |
| Bug reproduced before fix | yes | Record failing test/repro | `bun test apps/www/src/registry/ui/editor.spec.tsx` failed before fix because editor/static editor still used `whitespace-pre-wrap`. |
| Targeted behavior verification | yes | Run focused test/proof | `bun test apps/www/src/registry/ui/editor.spec.tsx` passed after fix. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed; `pnpm check` passed. |
| Package exports or file layout changed | no | N/A | No package exports or barrel-owned file layout changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | No package manifests, lockfiles, or install graph changed. |
| Agent rules or skills changed | no | N/A | No agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in owning workspace | All commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | yes | Capture Browser proof or record blocker | Browser proof captured at `/tmp/plate-4637-browser-proof-crop.png`. |
| Browser final proof | yes | Attach screenshot or exact caveat | Screenshot captured: selected preserved spaces wrap inside the editor width. |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed. |
| Package behavior or public API changed | no | N/A | Registry UI only; no package changeset. |
| Registry-only component work changed | yes | Update registry changelog and generated entries | Updated `tooling/data/plate-ui-changelog.mdx`; ran `node tooling/scripts/generate-ui-changelog-entries.mjs --write`; updated generator test. |
| Docs or content changed | yes | Verify source-backed incidental plan/changelog docs | Changelog source generated expected JSON; goal plan records evidence. |
| High-risk mini gate | yes | Record realistic failure mode and proof plan | Failure mode: Tailwind utility missing or static/live editor diverging; proof: CSS build, focused class regression, source audit, full check. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling action surface changed. |
| Local install corruption suspected | no | N/A | No local corruption signature; `pnpm check` retry failure was a real fixture expectation and then passed. |
| Autoreview for non-trivial implementation changes | yes | Run structured autoreview | `.agents/skills/autoreview/scripts/autoreview --mode local` reported no accepted/actionable findings. |
| PR create or update | yes | Run `check` before PR work and sync task-style body | `pnpm check` passed; PR #5022 created: https://github.com/udecode/plate/pull/5022. |
| Task-style PR body verified | yes | Verify with `gh pr view --json body` | `gh pr view 5022 --json number,title,url,body` verified issue line, confidence line, required table, and required emoji sections. |
| PR proof image hosting | no | N/A | Browser screenshot is local Codex proof, not hosted in GitHub PR body. |
| Tracker sync-back | yes | Post concise issue sync after PR exists | Posted https://github.com/udecode/plate/issues/4637#issuecomment-4708266692. |
| Final handoff contract | yes | Fill exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content | Filled below except PR URL and issue comment until PR exists. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed. |
| Output budget discipline | yes | Record accidental output and recovery | Recorded below: broad `rg` and minified CSS output were noisy; subsequent searches were narrowed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/4637-fix-editor-space-wrapping.md` | Passed. |
| Browser interaction proof | yes | Exercise target route with approved browser tool or record blocker | Browser loaded `http://localhost:3000/blocks/editor-basic`, filled `word` + 140 spaces + `next`, selected the text, and captured the wrap screenshot. |
| Browser console/network check | no | Record console/network state or why not applicable | N/A: no network or JS action contract changed; proof is computed CSS plus visual wrap. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | `/tmp/plate-4637-browser-proof-crop.png`; computed `whiteSpace: break-spaces`, `clientWidth: 640`, `scrollWidth: 640`, `textLength: 148`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Issue #4637 body/comment read; source ownership audited. | implementation |
| Implementation | done | `editor` and `editor-static` switched to `whitespace-break-spaces`; regression and registry changelog added. | verification |
| Verification | done | Focused tests, generator test, typecheck, CSS build, lint, full `pnpm check`, and autoreview passed. | PR / tracker sync |
| PR / tracker sync | done | PR #5022 created and issue #4637 commented. | closeout |
| Closeout | done | PR body verified; goal checker passed. | final response |

Findings:
- The report is valid: preserved spaces in the shared editor surface can hang past the editor edge when the registry uses `white-space: pre-wrap`.
- This is not a Plite issue: `PlateContent` only forwards props to Plite `Editable`; the broken choice lives in registry UI classes.
- The bot suggestion was wrong because `pre-wrap` was already the active class. `break-spaces` is the browser CSS mode that preserves spaces while creating wrapping opportunities inside long space runs.

Decisions and tradeoffs:
- Fix the shared live/static registry editor variants instead of changing Plite, `PlateContent`, or individual demos.
- Keep `code-node` and `code-node-static` on `whitespace-pre-wrap`; code whitespace has different UX expectations.
- Use a class-level regression because JSDOM cannot prove final line wrapping honestly.

Implementation notes:
- Changed `apps/www/src/registry/ui/editor.tsx` and `apps/www/src/registry/ui/editor-static.tsx` from `whitespace-pre-wrap` to `whitespace-break-spaces`.
- Added `apps/www/src/registry/ui/editor.spec.tsx` to lock live/static editor classes.
- Added a registry changelog source row and regenerated changelog JSON/index artifacts.
- Rebuilt `apps/www/public/tailwind.css` so the `whitespace-break-spaces` utility is present in the static stylesheet.

Review fixes:
- Autoreview returned no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad source `rg` for whitespace/editor produced too much output | 1 | Narrow searches to owning files and capped output | Ownership confirmed in registry editor/static editor and core `PlateContent`. |
| `rg` against minified `apps/www/public/tailwind.css` streamed a huge line | 1 | Use class-specific source/test/CSS build proof instead of dumping minified CSS | Verified utility through `pnpm --filter www build:tw` and focused source checks. |
| `pnpm --filter www lint:fix` failed because ESLint parsed TS app files as JS | 1 | Run repo-approved root lint fixer | `pnpm lint:fix` passed. |
| First `pnpm check` failed in `generate-ui-changelog-entries.test.mjs` | 1 | Update the live-data fixture for the new June 15 changelog row | Generator test passed; `pnpm check` passed on retry. |
| Initial Browser discovery missed Browser runtime | 1 | Load Browser skill and use browser-client through Node REPL | Browser proof captured successfully; no shell Playwright substitute used. |

Verification evidence:
- `bun test apps/www/src/registry/ui/editor.spec.tsx` failed before the class change on the expected `whitespace-pre-wrap` mismatch, then passed after the fix.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs` passed after fixture update.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` generated the registry changelog artifacts.
- `pnpm --filter www typecheck` passed.
- `pnpm --filter www build:tw` passed and regenerated `apps/www/public/tailwind.css`.
- `pnpm lint:fix` passed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` reported no accepted/actionable findings.
- `pnpm check` passed after the changelog fixture was fixed.
- `[@Browser](plugin://browser@openai-bundled)` proof captured on `http://localhost:3000/blocks/editor-basic`: selected `word` + 140 spaces + `next` wrapped within the editor; computed `whiteSpace: break-spaces`, `clientWidth: 640`, `scrollWidth: 640`.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5022.
- Issue / tracker line: https://github.com/udecode/plate/issues/4637#issuecomment-4708266692.
- Confidence line: high; 🟢 95-100%.
- Flow table:
- Reproduced: 🟢 focused regression failed before fix on `whitespace-pre-wrap`; Browser follow-up captured fixed visual wrap.
  - Verified: 🟢 focused regression, generator test, typecheck, CSS build, lint, full check, autoreview, Browser proof.
- Browser check: Browser loaded `/blocks/editor-basic`, used a 640px viewport, filled a word plus a long space run plus a trailing word, selected the text, and captured a screenshot showing the selected space run wrapping inside the editor.
- Outcome: Editor and static editor registry surfaces now use `whitespace-break-spaces`, so preserved inserted spaces can wrap within editor width.
- Caveat: screenshot is local Codex proof, not hosted in GitHub PR body.
- Design:
  - Chosen boundary: shared registry editor styling.
  - Why not quick patch: individual demos would miss static/live registry consumers.
  - Why not broader change: Plite/core `Editable` is not the source, and code nodes need separate whitespace semantics.
- Verified: `bun test apps/www/src/registry/ui/editor.spec.tsx`; `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; `pnpm --filter www typecheck`; `pnpm --filter www build:tw`; `pnpm lint:fix`; `pnpm check`; autoreview local.
- PR body verified: `gh pr view 5022 --json number,title,url,body` verified the required task-style body.

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
- PR: https://github.com/udecode/plate/pull/5022.
- Issue / tracker: https://github.com/udecode/plate/issues/4637#issuecomment-4708266692.
- Browser proof: `/tmp/plate-4637-browser-proof-crop.png`.
- Caveats: screenshot is local Codex proof, not hosted in GitHub PR body.

Timeline:
- 2026-06-15T12:53:50.828Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | PR / tracker sync |
| Where am I going? | Branch, commit, push, PR, issue comment, final goal check |
| What is the goal? | Fix issue #4637 if Plate-owned and stop if Plite-owned |
| What have I learned? | Valid Plate registry styling bug; bot fix suggestion was stale/wrong |
| What have I done? | Implemented and verified shared registry editor whitespace fix |

Open risks:
- Remaining risk: screenshot is local proof only; PR body records the Browser evidence but does not embed a hosted image.
