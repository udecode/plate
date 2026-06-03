# code block language labels

Objective:
Show persisted code block language labels in read-only/static registry rendering for discussion #4988.

Goal plan:
docs/plans/2026-06-03-code-block-language-labels.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub discussion
- id / link: #4988 / https://github.com/udecode/plate/discussions/4988
- title: Add language label to code blocks in read-only modes
- acceptance criteria: code blocks with `element.lang` show a readable language
  label in read-only and static registry rendering; editable language selection
  remains intact; label visibility can be disabled at the component boundary.

Completion threshold:
- `apps/www/src/registry/ui/code-block-node.tsx` and
  `apps/www/src/registry/ui/code-block-node-static.tsx` render the current
  language label from persisted `element.lang` outside edit mode.
- Targeted registry tests cover read-only/static labels and opt-out behavior.
- The code block demo route renders the labels in a browser without relevant
  console/network errors.
- Registry changelog records the component-visible update.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-code-block-language-labels.md` passes.

Verification surface:
- `bun test apps/www/src/registry/ui/code-block-node.spec.tsx
  apps/www/src/registry/ui/code-block-node-static.spec.tsx`
- `pnpm turbo typecheck --filter=www`
- `pnpm lint:fix`
- Browser plugin proof on `/docs/examples/code-block` or the standalone code
  block demo route if available.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-03-code-block-language-labels.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Follow-up explicitly requested completing the rest of the task, so PR and
  tracker sync now apply.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub discussion #4988 body; no comments or video evidence.
- Allowed edit scope: code block registry UI/static components, focused tests,
  and component changelog.
- Browser surface: Plate code block example/demo route showing static/read-only
  code blocks with `lang`.
- Tracker sync: required after the verified PR exists.
- Non-goals: package data model changes, per-block persisted visibility flags,
  broad code block redesign, generated registry output, and `build:registry`.

Output budget strategy:
- Scope searches to `packages/code-block`, `apps/www/src/registry`, and relevant
  docs/changelog files; cap command output with tool token limits; avoid
  generated registry output.

Blocked condition:
- Stop only if the existing static/read-only rendering API cannot pass
  component props through enough to support opt-out without a public API change,
  or if repo-approved Browser usage is unavailable for required UI proof.

Task state:
- task_type: feature/bugfix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: `element.lang` is persisted, but read-only/static registry components
  do not render a replacement for the editable language combobox.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-code-block-language-labels.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, Browser, and `autoreview` workflows as required by scope. |
| Active goal checked or created | yes | Created active goal for discussion #4988 resolution. |
| Source of truth read before edits | yes | `gh api graphql` fetched discussion #4988 title/body/comments. |
| Tracker comments and attachments read | yes | Discussion comments list was empty; no attachments. |
| Video transcript evidence required | no | Discussion has no video or screen recording. |
| `docs/solutions` checked for non-trivial existing-code work | no | Existing code path was obvious and narrow; no repeated-domain solution needed. |
| TDD decision before behavior change or bug fix | yes | Add focused component tests around read-only/static label rendering. |
| Branch decision for code-changing task | yes | Created `codex/4988-code-block-language-labels` after follow-up requested publish work. |
| Release artifact decision | yes | Registry-only component changelog, no package changeset. |
| Browser tool decision for browser surface | yes | Use repo-approved Browser plugin after starting the relevant www dev server. |
| PR expectation decision | yes | Follow-up requested PR/tracker sync after local verification. |
| Tracker sync expectation decision | yes | Sync discussion #4988 after verified PR creation. |
| Output budget strategy recorded | yes | See output budget strategy above. |
| Browser pack selected | yes | Applied `browser` pack. |
| Browser route / app surface identified | yes | Code block example/demo route. |
| Browser tool decision recorded | yes | Browser plugin proof required unless blocked. |
| Console/network caveat policy recorded | yes | Check browser console/network for relevant new errors. |
| Package/API pack selected | yes | Applied because registry-only release-artifact gate applies. |
| Public surface or package boundary identified | yes | Registry UI component surface only; no package boundary/export change. |
| Release artifact path selected | yes | Registry changelog in `content/docs/components/changelog.mdx`. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package changeset required. |
| Barrel/export impact decision recorded | yes | N/A: no package exports or file layout changes. |

Work Checklist:
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
      requirements, PR body sync, and discussion sync now apply.
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
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Passed focused tests, `www` typecheck, lint, Browser viewing-mode proof, autoreview, and plan checker after this update. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Source proof: editable code block rendered language combobox; read-only path returned `null`; static component had no label. Focused tests lock the regression. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `bun test apps/www/src/registry/ui/code-block-node.spec.tsx apps/www/src/registry/ui/code-block-node-static.spec.tsx` passed, 4 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=www` passed after lint. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or exported package file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or install graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`; browser proof used `http://localhost:3003/docs/examples/code-block`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser switched demo from `Editing` to `Viewing`; labels rendered as plain spans for JavaScript, Python, and CSS. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Post-reinstall screenshot saved to `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/plate-code-block-readonly-labels-hydrated.png`. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: did not edit templates or run `build:registry`. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry component behavior only; no published package API/runtime changed. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Added June 3 component changelog row for `code-block-node` and `code-block-node-static`. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental changelog only; `www` typecheck docs source parity passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: read-only labels still interactive or absent. Proof: tests plus Browser viewing mode. Boundary: registry UI component, not persisted schema. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | Initial dev-server shutdown surfaced unrelated missing-module noise from package `dist` imports; ran `pnpm run reinstall`, reran tests/typecheck/lint/browser route, and the route log returned clean 200s. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local` clean, no accepted/actionable findings. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` required before PR creation; task-style PR body verified with `gh pr view --json body` during publish step. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | Verify with `gh pr view --json body` during publish step. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: PR body uses route/interaction proof, not local image embedding. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Sync discussion #4988 after PR creation. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; Biome fixed one new test formatting issue. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were scoped; one broad `rg` produced large output, then subsequent searches were narrowed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-code-block-language-labels.md` | Will rerun after this closure update. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Browser opened `/docs/examples/code-block`, selected `Viewing`, and verified labels are `SPAN` nodes, not combobox buttons. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser API did not expose console logs. After reinstall, dev-server log showed `HEAD` and `GET /docs/examples/code-block` 200, no missing-module output, no Next error overlay, and changed UI rendered. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Post-reinstall screenshot saved to `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/plate-code-block-readonly-labels-hydrated.png`. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No package exports/manifests changed; registry item includes new helper file. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Registry-only component visible delta. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: no package change. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | Updated `content/docs/components/changelog.mdx`. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifact path is registry changelog. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo typecheck --filter=www` passed; no package build beyond turbo dependency graph required. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no package exports changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Fetched discussion #4988 and empty comments with `gh api graphql`. | done |
| Implementation | complete | Added shared language helper, read-only/static labels, registry metadata, tests, and changelog. | done |
| Verification | complete | Reinstall, focused tests, `www` typecheck, lint, Browser proof, and autoreview passed. | done |
| PR / tracker sync | complete | Follow-up requested PR/tracker sync; `pnpm check`, task-style PR body verification, and discussion comment happen in publish step. | done |
| Closeout | complete | Plan checker rerun after closure update. | final response |

Findings:
- Discussion #4988 is valid: read-only/static rendering discarded persisted `element.lang`.
- No accepted/actionable autoreview findings.

Decisions and tradeoffs:
- Kept language visibility as a component prop (`showLanguageLabel`) instead of a persisted node field. That avoids schema churn for a display concern.
- Moved the label list into a registry helper so editable, read-only, and static components share the same mapping.

Implementation notes:
- Added `apps/www/src/registry/ui/code-block-languages.ts`.
- `CodeBlockCombobox` renders a plain label in read-only mode and the existing combobox in editable mode.
- `CodeBlockElementStatic` renders the same label by default.
- `registry-ui.ts` includes the new helper in the `code-block-node` registry item.

Review fixes:
- None required; autoreview was clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm run reinstall`: completed once after unrelated dev-server package-resolution noise.
- `bun test apps/www/src/registry/ui/code-block-node.spec.tsx apps/www/src/registry/ui/code-block-node-static.spec.tsx`: 4 pass, 0 fail after reinstall.
- `pnpm turbo typecheck --filter=www`: 52 successful tasks after reinstall, including docs source parity and registry source checks.
- `pnpm lint:fix`: passed after reinstall; Biome checked 3240 files with no fixes.
- Browser: post-reinstall `http://localhost:3003/docs/examples/code-block`, switched mode from `Editing` to `Viewing`; JavaScript/Python/CSS labels rendered as plain `SPAN` nodes with `flex h-6 select-none...`, not `role="combobox"` buttons; no error overlay.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local` clean, no accepted/actionable findings.

Final handoff contract:
- PR line: create a task-style PR from `codex/4988-code-block-language-labels`.
- Issue / tracker line: sync discussion #4988 after the PR exists.
- Confidence line: high.
- Flow table:
  - Reproduced: source read showed read-only combobox returned `null`; static component had no language label.
  - Verified: focused tests passed; Browser viewing mode shows plain language labels.
- Browser check: post-reinstall route served 200 and rendered labels; console logs unavailable in Browser API, no Next error overlay visible.
- Outcome: read-only/static code blocks show persisted language labels with `showLanguageLabel={false}` opt-out.
- Caveat: local screenshot path is not embedded in the PR body; the body records
  route/interaction proof instead.
- Design:
  - Chosen boundary: registry UI component and shared registry language helper.
  - Why not quick patch: duplicating labels in static and live components would drift from the editable combobox list.
  - Why not broader change: persisted schema/API changes are unnecessary for a display toggle.
- Verified: reinstall, focused tests, `www` typecheck, lint, Browser proof, autoreview.
- PR body verified: N/A, no PR.

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
- PR: N/A, not requested.
- Issue / tracker: Discussion #4988 source read; no public sync-back without PR.
- Browser proof: post-reinstall `/docs/examples/code-block` in Viewing mode shows plain JavaScript/Python/CSS labels; screenshot at `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/plate-code-block-readonly-labels-hydrated.png`.
- Caveats: Browser console logs unavailable through exposed Browser API; route 200 and no error overlay after reinstall.

Timeline:
- 2026-06-03T10:48:49.612Z Task goal plan created.
- 2026-06-03 Implemented read-only/static language labels and registry helper.
- 2026-06-03 Focused tests, `www` typecheck, lint, Browser proof, and autoreview passed.
- 2026-06-03 Ran `pnpm run reinstall` for unrelated dev-server package-resolution noise, then reran tests, typecheck, lint, and Browser route proof successfully.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Show persisted code block language labels in read-only/static registry rendering for discussion #4988. |
| What have I learned? | The stored `lang` exists; only the read-only/static UI path dropped the label. |
| What have I done? | See Timeline and Verification evidence. |

Open risks:
- None.
