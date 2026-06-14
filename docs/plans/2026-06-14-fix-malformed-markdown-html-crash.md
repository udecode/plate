# fix malformed markdown html crash

Objective:
Fix #5005 malformed markdown HTML crash; done when @platejs/markdown falls back to text with tests, changeset, PR, and tracker sync.

Goal plan:
docs/plans/2026-06-14-fix-malformed-markdown-html-crash.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (implicit checkout scope: existing `.agents/**` workflow changes are dirty and repo policy requires PRing the whole checkout)

Task source:
- type: GitHub issue
- id / link: #5005 https://github.com/udecode/plate/issues/5005
- title: [Bug]: Markdown error when Invalid HTML passed
- acceptance criteria: `deserializeMd` must not crash when MDX-enabled markdown input contains invalid HTML/XML such as `</ph\><`; it should degrade to plain editable markdown text.

Completion threshold:
- #5005 is fixed at the `@platejs/markdown` deserializer boundary, with a failing-before/passing-after regression test for the reported input.
- Valid MDX/HTML fallback behavior covered by existing `deserializeMd` and `markdownToSlateNodesSafely` tests remains passing.
- Published package delta is recorded in one `@platejs/markdown` patch changeset.
- PR is created with task-style body and issue #5005 is synced after PR creation.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-fix-malformed-markdown-html-crash.md` passes.

Verification surface:
- Repro: direct `deserializeMd(createTestEditor(), String.raw\`</ph\\><\`)` throws before fix.
- Targeted tests: `bun test packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts`.
- Package check: `pnpm turbo typecheck --filter=./packages/markdown`.
- Lint: `pnpm lint:fix`.
- Browser: only if package fix also changes docs/demo UI behavior beyond parser output; otherwise N/A with reason.
- PR/tracker: `gh pr view --json body` and concise #5005 comment after PR exists.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #5005 title/body/comment, plus local parser repro.
- Allowed edit scope: `packages/markdown/src/lib/deserializer/**`, focused tests, `.changeset/**`, this goal plan, and PR/issue metadata.
- Browser surface: Issue says browser surface `No`; docs route is only the reporter's convenient repro shell. Package API tests own the behavior unless UI changes become necessary.
- Tracker sync: PR first, then #5005 comment with fix and verification.
- Non-goals: No markdown spec redesign, no disabling MDX by default, no caller-level try/catch in docs/demo code.

Output budget strategy:
- Use scoped `rg`, `sed`, and targeted test commands with capped tool output. Avoid full test/build output unless a focused command points to a broader gate.

Blocked condition:
- Stop only if local package tests/typecheck are blocked by unrelated install corruption after one `pnpm run reinstall` retry, or GitHub auth blocks PR/tracker sync.

Task state:
- task_type: bug
- task_complexity: non-trivial
- current_phase: implementation
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: issue valid; fix at parser recovery boundary
- confidence: high
- next owner: task
- reason: reported input throws through `deserializeMd`; the fallback reparses the split complete prefix with MDX still enabled.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-fix-malformed-markdown-html-crash.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `task`, `autogoal`, `tdd`, `changeset`, `autoreview`, `agent-native-reviewer`, and Browser skill instructions |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan |
| Source of truth read before edits | yes | `gh issue view 5005 --json ...` read issue body and Dosu comment |
| Tracker comments and attachments read | yes | One issue comment read; no attachments in issue output |
| Video transcript evidence required | no | N/A: issue has no video or screen recording |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read `docs/solutions/logic-errors/2026-03-25-markdown-split-incomplete-mdx-must-not-treat-a-final-closing-angle-as-incomplete.md` |
| TDD decision before behavior change or bug fix | yes | Add focused regression test first, run it red, then fix |
| Branch decision for code-changing task | yes | Defer actual branch command until PR phase; use current non-main branch or create `codex/5005-markdown-invalid-html` if on `main` |
| Release artifact decision | yes | `.changeset` for `@platejs/markdown` patch |
| Browser tool decision for browser surface | yes | N/A unless UI changes are needed; issue marks browser surface `No` and package API owns behavior |
| PR expectation decision | yes | Task skill requires PR after verified code change |
| Tracker sync expectation decision | yes | Sync #5005 after PR exists |
| Output budget strategy recorded | yes | See Output budget strategy |
| Package/API pack selected | yes | `--with package-api` applied |
| Public surface or package boundary identified | yes | `@platejs/markdown` public `deserializeMd`/`MarkdownPlugin` deserialize path |
| Release artifact path selected | yes | `.changeset` |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/rules/changeset.mdc` read |
| Barrel/export impact decision recorded | yes | No exported file layout or package export changes expected; `pnpm brl` N/A unless implementation changes that |

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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `tooling/data/plate-ui-changelog.mdx` and generated `/registry/changelog/*` JSON instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Targeted repro red, focused tests, full markdown package tests, package typecheck, lint, changeset, package build for browser proof, and `pnpm install` sync passed; review/check/PR rows remain below |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | New `deserializeMd` regression failed before code change with MDX parser `Unexpected character \`\\\`` |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `bun test packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts` passed: 31 tests |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/markdown` passed |
| Package exports or file layout changed | N/A: no export or file layout change | Run `pnpm brl` before final verification and keep generated barrel updates | No public export files moved/added/removed |
| Package manifests, lockfile, or install graph changed | N/A: no manifest or lockfile change | Run `pnpm install` and relevant package checks | `pnpm install` still ran for agent skill sync and left lockfile up to date |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Existing checkout includes `.agents/rules/task.mdc` and generated `.agents/skills/task/SKILL.md`; `pnpm install` ran `skiller apply` successfully |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All command proofs ran in `/Users/zbeyens/git/plate`; package tests/typecheck own `@platejs/markdown` behavior |
| Browser surface changed | N/A: package API fix; browser proof attempted | Capture Browser Use proof or record explicit waiver/blocker | Docs app started on `http://localhost:3010`; initial browser test used stale package build and showed old error, after `@platejs/markdown` build the Browser runtime reset reported `Browser is not available: iab` |
| Browser final proof | N/A: Browser unavailable after reset | Attach screenshot or exact browser verification caveat when browser proof applies | Browser proof caveat recorded above; package API tests are the authoritative proof for issue's affected entry point |
| CI-controlled template output changed | N/A: no `templates/**` output | Restore generated template output or record why it is intentionally kept | No `templates/**` edits |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/markdown-invalid-html-fallback.md` added for `@platejs/markdown` patch |
| Registry-only component work changed | N/A: not registry-only component work | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | No `apps/www/src/registry/**` change |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Goal plans and pack files are workflow artifacts; `pnpm install` and prior security-pack plan evidence cover existing agent docs |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: MDX parser errors escaping fallback crash consumers. Proof: repro red, parser tests green, package tests/typecheck green. Boundary: deserializer recovery path, not docs caller |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | `agent-native-reviewer` instructions read because existing checkout includes `.agents/**`; structured autoreview passed clean after accepted markdown fix |
| Local install corruption suspected | N/A: no install rot | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No local-corruption failure occurred |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | First run found accepted P2 on MDX member tags; fixed with `$`/`.` scanner support and regression tests. Second run passed clean: no accepted/actionable findings |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed; PR #5016 created |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5016 --json body` verified required task-style sections and no current-PR self-link |
| PR proof image hosting | N/A: no proof images | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | PR body records browser caveat in text; no local images |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | #5005 comment posted: https://github.com/udecode/plate/issues/5005#issuecomment-4702973114 |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes applied |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Broad outputs were capped; package test output was long but bounded to markdown package proof |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-fix-malformed-markdown-html-crash.md` | Final rerun passed: `[autogoal] complete` |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `packages/markdown/package.json` exports unchanged; behavior change is runtime fallback for existing `deserializeMd`/MarkdownPlugin API |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime behavior fix for `@platejs/markdown` |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/markdown-invalid-html-fallback.md` uses `"@platejs/markdown": patch`; no forbidden core minor |
| Registry changelog | N/A: not registry-only | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | Package change uses changeset instead |
| No release artifact | N/A: release artifact required | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Changeset added |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter @platejs/markdown test`, `pnpm turbo typecheck --filter=./packages/markdown`, and `pnpm --filter @platejs/markdown build` passed |
| Barrel/export generation | N/A: no export layout change | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No exported files moved/added/removed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | issue #5005, task/autogoal/tdd/changeset rules, parser files, tests, and prior splitIncompleteMdx solution read | implementation |
| Implementation | complete | Fixed `splitIncompleteMdx` malformed tag boundary handling and hardened `markdownToSlateNodesSafely` fallback; added tests and changeset | verification |
| Verification | complete | Focused tests, package tests, typecheck, build, lint, install sync, autoreview, and `pnpm check` passed | closeout |
| PR / tracker sync | complete | PR #5016 created and issue #5005 comment posted | final response |
| Closeout | complete | PR, tracker sync, final handoff fields, and open risks recorded | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- Fix the deserializer recovery boundary instead of adding a caller try/catch in the docs demo.
- Keep MDX enabled by default; malformed MDX/HTML falls back to markdown-without-MDX parsing only after MDX parsing fails.
- No public API shape change; compatibility impact is safer runtime behavior.

Implementation notes:
- Likely files: `packages/markdown/src/lib/deserializer/deserializeMd.ts`, `packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts`, focused specs.
- Actual code fix: `splitIncompleteMdx` now cuts at tag start when a parsed tag name is followed by an invalid non-boundary character, and `markdownToSlateNodesSafely` reparses failed complete prefixes without MDX instead of letting MDX parser errors escape.

Review fixes:
- Accepted autoreview P2: initial scanner boundary rejected valid MDX member tags like `<Foo.Bar>`. Fixed by supporting `$` and `.` in scanned MDX tag names and adding split/safe-deserializer regression tests that preserve a completed member tag before an incomplete tail.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Repro before fix: `bun - <<'EOF' ... deserializeMd(createTestEditor(), String.raw\`</ph\\><\`) ... EOF` threw `Unexpected character \`\\\` (U+005C) in name...`.
- New regression red: `bun test packages/markdown/src/lib/deserializer/deserializeMd.spec.ts` failed on `falls back to editable text for malformed html-like mdx` before parser changes.
- Focused tests green: `bun test packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts` passed: 31 tests, 37 expects.
- Package typecheck green: `pnpm turbo typecheck --filter=./packages/markdown` passed.
- Lint green: `pnpm lint:fix` passed; no fixes applied.
- Package tests green: `pnpm --filter @platejs/markdown test` passed: 229 tests, 4 snapshots, 364 expects.
- Package build green for browser proof setup: `pnpm --filter @platejs/markdown build` passed.
- Agent sync green for existing `.agents/**` checkout files: `pnpm install` passed and ran `skiller apply`.
- Browser caveat: docs dev server ran at `http://localhost:3010`; browser proof was attempted, but after package build the in-app Browser reset reported `Browser is not available: iab`.
- Review fix focused tests green: `bun test packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts` passed: 33 tests, 39 expects.
- Review fix package tests green: `pnpm --filter @platejs/markdown test` passed: 232 tests, 4 snapshots, 367 expects.
- Review fix package typecheck green: `pnpm turbo typecheck --filter=./packages/markdown` passed.
- Final lint green: `pnpm lint:fix` passed; no fixes applied.
- Autoreview clean: `.agents/skills/autoreview/scripts/autoreview --mode local` rerun passed with no accepted/actionable findings.
- PR gate green: `pnpm check` passed, including lint, root typecheck/build, `test:all`, and `test:slowest`.
- Goal checker green: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-fix-malformed-markdown-html-crash.md` passed.

Final handoff contract:
- PR line: PR #5016 https://github.com/udecode/plate/pull/5016
- Issue / tracker line: Fixes #5005; comment posted https://github.com/udecode/plate/issues/5005#issuecomment-4702973114
- Confidence line: 95-100% confidence
- Flow table:
  - Reproduced: tests red before fix; browser route reproduced old built-output error before package rebuild
  - Verified: tests/check green; browser proof caveat recorded because Browser `iab` became unavailable after package rebuild
- Browser check: attempted on `http://localhost:3010/docs/markdown`; final browser proof unavailable due Browser runtime `iab` error after reset
- Outcome: `@platejs/markdown` malformed HTML-like MDX input falls back to editable text instead of crashing
- Caveat: PR includes prior security-advisory workflow pack because repo policy stages the whole checkout for PR work
- Design:
  - Chosen boundary: deserializer recovery path in `@platejs/markdown`
  - Why not quick patch: docs/caller try-catch would leave package consumers crashing
  - Why not broader change: disabling MDX by default would break valid MDX behavior; fix keeps MDX and hardens fallback only
- Verified: focused parser tests, markdown package tests, package typecheck/build, lint, install sync, autoreview, `pnpm check`
- PR body verified: `gh pr view 5016 --json body`

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
- PR: https://github.com/udecode/plate/pull/5016
- Issue / tracker: https://github.com/udecode/plate/issues/5005#issuecomment-4702973114
- Browser proof: attempted; final proof unavailable because Browser `iab` was unavailable after package rebuild
- Caveats: PR includes prior security-advisory workflow pack from the current checkout

Timeline:
- 2026-06-14T20:10:15.490Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Fix #5005 malformed markdown HTML crash without disabling valid MDX behavior |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None beyond the recorded browser-proof caveat; package API proof owns #5005.
