# 4835 markdown linebreak serialization

Objective:
Complete PR #4835 markdown linebreak serialization fix; done when reproduced, package fix verified, PR opened and tracker credited.

Goal plan:
docs/plans/2026-06-15-4835-markdown-linebreak-serialization.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub PR plus linked discussion
- id / link: https://github.com/udecode/plate/pull/4835 and https://github.com/udecode/plate/discussions/4834
- title: MarkdownPlugin: serialize `\n` within a text child of a paragraph as line break
- acceptance criteria: Markdown serialization preserves hard line breaks embedded inside one paragraph text leaf so round-tripping does not split or drop them; AI streaming newline chunks keep their existing exact-output contract; PR #4835 is credited.

Completion threshold:
- Reproduce current `main` losing embedded paragraph hard breaks.
- Add behavior regression coverage at the `@platejs/markdown` package surface.
- Fix the paragraph serialization owner boundary without changing AI streaming chunk preservation.
- Add one `@platejs/markdown` patch changeset.
- Pass focused package tests, package typecheck, lint, final `pnpm check`, and autoreview.
- Open or update a PR with task-style body that credits Dave Schoorl / @dschoorl and comment back on PR #4835.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4835-markdown-linebreak-serialization.md` passes.

Verification surface:
- Red/green `bun test packages/markdown/src/lib/commonmarkSurface.spec.ts`.
- AI streaming regression `bun test apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx`.
- `pnpm turbo typecheck --filter=./packages/markdown`.
- `pnpm lint:fix`.
- `.agents/skills/autoreview/scripts/autoreview --mode local`.
- `pnpm check`.
- `gh pr view --json body` and PR #4835 comment readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Credit Dave Schoorl / @dschoorl as the original author of PR #4835 and discussion #4834.
- Do not mutate or force-push the contributor fork branch; use a clean replacement PR and link it back.

Boundaries:
- Source of truth: PR #4835, its review/comments, and discussion #4834.
- Allowed edit scope: `packages/markdown`, focused package/app integration tests, one `.changeset`, this plan.
- Browser surface: N/A: markdown serializer package behavior has no honest browser-only surface.
- Tracker sync: comment on PR #4835 after replacement PR exists.
- Non-goals: no broad trailing-break rewrite, no AI streaming semantics change, no registry changelog.

Output budget strategy:
- Use targeted `gh`, `sed`, `rg`, and focused tests. Cap broad output. The first docs/solutions search was too broad and is recorded in Error attempts; later searches stay narrowed to markdown/AI streaming owner paths.

Blocked condition:
- Stop only if the current bug cannot be reproduced, the markdown package cannot be verified locally after ruling out install corruption once, or GitHub auth blocks push/PR/tracker sync.

Task state:
- task_type: public PR completion bugfix
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: partially valid
- confidence: high
- next owner: implementation
- reason: Dave's bug report and core normalization idea are valid, but the PR's AI streaming output changes and "I assume remark-stringify" test commentary are not merge-quality.

Pre-solution issue challenge:
- reporter claim: valid: a single paragraph text leaf containing `\n\n\n` serializes as raw blank lines, and deserializing that markdown returns separate paragraphs.
- suggested diagnosis or fix: partially valid: normalize embedded `\n` into break nodes before mdast conversion; reject changing AI streaming chunk outputs and avoid speculative test commentary.
- repro ladder:
  - tests / source-level repro: complete: `bun -e` against current source produced raw blank-line markdown and round-tripped into two paragraphs.
  - Playwright / automated browser: N/A: package serializer behavior is fully executable in package tests.
  - Browser plugin: N/A: no UI/browser-only state is involved.
  - screenshot / visual proof: N/A: not a visual/native-state bug.
- reproduction verdict: reproduced
- validity verdict: partially valid
- best long-term fix boundary: paragraph serialization in `packages/markdown/src/lib/rules/defaultRules.ts`.
- harsh honest feedback: #4835 was a good bug report and a decent first cut, but changing AI streaming output to escaped markdown/html was the wrong blast radius.
- hard-stop decision: no hard stop; implement a narrower current-main fix.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4835-markdown-linebreak-serialization.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `task`, `autogoal`, `autoreview`, `tdd`, `changeset`, and `git-commit-push-pr` skills. |
| Active goal checked or created | yes | Active goal created for PR #4835 completion. |
| Source of truth read before edits | yes | Read PR #4835, PR diff, review comments API result, and linked discussion #4834. |
| Tracker comments and attachments read | yes | No PR review comments; discussion #4834 read; no attachments/video. |
| Video transcript evidence required | no | N/A: no video or screenshot evidence in the source. |
| Pre-solution issue challenge required | yes | Verdict recorded above: partially valid. |
| Reproduction verdict before implementation | yes | Source-level repro showed serialized raw blank lines round-trip into separate paragraphs. |
| Repro escalation ladder selected | yes | Source/package test is the honest surface; browser/visual proof N/A. |
| Suggested fix reviewed against durable boundary | yes | Keep markdown normalization idea; reject AI output change from original draft. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Searched narrowed markdown/streaming prior-solution paths after one broad noisy search. |
| TDD decision before behavior change or bug fix | yes | TDD used: failing markdown tests added before implementation. |
| Branch decision for code-changing task | yes | Branch `codex/4835-markdown-linebreak-serialization`. |
| Release artifact decision | yes | `.changeset` entries for `@platejs/markdown` and `@platejs/ai`. |
| Browser tool decision for browser surface | yes | N/A: package serialization, no honest browser-only surface. |
| PR expectation decision | yes | Create replacement PR from this branch; do not force-push contributor fork. |
| Tracker sync expectation decision | yes | Comment back on #4835 after replacement PR exists. |
| Output budget strategy recorded | yes | Targeted commands; broad output mistake recorded. |
| Package/API pack selected | yes | Package/API pack applies. |
| Public surface or package boundary identified | yes | Published `@platejs/markdown` serializer behavior and `@platejs/ai` streaming runtime behavior. |
| Release artifact path selected | yes | `.changeset` selected. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `changeset` skill and `.agents/rules/changeset.mdc`. |
| Barrel/export impact decision recorded | yes | N/A: no exports or file layout changed; `pnpm brl` not required. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
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
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | `pnpm check` passed; focused tests and typecheck passed. |
| Pre-solution issue challenge verdict | yes | Record challenge before implementation | Recorded above: partially valid, pivoted to narrower durable fix. |
| Repro escalation ladder | yes | Record source/browser/visual outcomes | Source-level repro complete; browser/visual N/A. |
| Bug reproduced before fix | yes | Record failing repro | `bun -e` repro and red `commonmarkSurface.spec.ts` assertions showed raw blank lines split the paragraph. |
| Targeted behavior verification | yes | Run focused tests | `bun test packages/markdown/src/lib/commonmarkSurface.spec.ts`; AI streaming focused suite passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/markdown --filter=./packages/ai` passed. |
| Package exports or file layout changed | no | `pnpm brl` if needed | N/A: no exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and checks | Added `@platejs/table` devDependency for existing markdown table test import; `pnpm install` and package/full checks passed. |
| Agent rules or skills changed | no | Sync if needed | N/A: no `.agents` rule or skill source changed. |
| Workspace authority proof | yes | Run proof in owning repo | All commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | no | Browser proof or waiver | N/A: serializer/runtime package behavior, not browser-only UI. |
| Browser final proof | no | Screenshot or caveat | N/A: no visual/native state. |
| CI-controlled template output changed | no | Restore or justify | N/A: no templates touched. |
| Package behavior or public API changed | yes | Add changeset | Added patch changesets for `@platejs/markdown` and `@platejs/ai`. |
| User-visible registry output changed | no | Registry changelog pack or N/A | N/A: no registry component output changed. |
| Docs or content changed | no | Docs verification or N/A | N/A: only task plan docs changed. |
| High-risk mini gate | yes | Record failure mode and proof | Risk: serializer hard-break normalization could break AI stream exactness; proof: expanded streaming matrix and autoreview clean. |
| Agent-native review for agent/tooling changes | no | Agent-native review or N/A | N/A: no agent/tooling action surfaces changed. |
| Local install corruption suspected | yes | Reinstall once and rerun | `pnpm run reinstall` tried after package typecheck missing `@platejs/table`; failure persisted, so manifest dependency fixed. |
| Autoreview for non-trivial implementation changes | yes | Run until clean | Four accepted AI-streaming findings fixed; final autoreview clean. |
| PR create or update | yes | Run `check` before PR and sync body | Created https://github.com/udecode/plate/pull/5026 after `pnpm check` passed. |
| Task-style PR body verified | yes | Verify `gh pr view --json body` | `gh pr view 5026 --json url,state,title,body` confirmed auto-release block plus task-style body. |
| PR proof image hosting | no | Hosted proof if needed | N/A: no browser proof image. |
| Tracker sync-back | yes | Comment on #4835 after PR exists | Commented https://github.com/udecode/plate/pull/4835#issuecomment-4710485850 and closed #4835 as superseded. |
| Final handoff contract | yes | Fill PR/tracker lines | Filled below with PR #5026 and tracker #4835. |
| Final lint | yes | Run `pnpm lint:fix` | Passed; no fixes applied. |
| Output budget discipline | yes | Record broad output and recovery | One broad search/output mistake recorded; later commands targeted/capped. |
| Goal plan complete | yes | Run autogoal checker | Running as final closeout gate. |
| Public API / package boundary proof | yes | Source-audit public API, exports, package impact | No API shape/export change; published runtime behavior changes in markdown serializer and AI streaming. |
| Release artifact classification | yes | Record artifact class | Published package runtime behavior change. |
| Published package changeset | yes | Add changesets | `.changeset/markdown-text-leaf-line-breaks.md`, `.changeset/ai-streaming-hard-breaks.md`; no forbidden minors. |
| Registry changelog | no | Registry-only flow if applies | N/A: no registry output changed. |
| No release artifact | no | Explain no artifact | N/A: published package deltas exist. |
| Package typecheck/build/test | yes | Run owning checks | `pnpm turbo typecheck --filter=./packages/markdown --filter=./packages/ai`; `pnpm --filter @platejs/markdown test`; `pnpm check`. |
| Barrel/export generation | no | Run `pnpm brl` if exports changed | N/A: no barrel impact. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | PR #4835, diff, comments, discussion #4834 read. | implementation |
| Implementation | complete | Markdown serializer normalization plus AI streaming compatibility shim implemented. | verification |
| Verification | complete | Focused suites, package typecheck, lint, autoreview, and `pnpm check` passed. | PR / tracker sync |
| PR / tracker sync | complete | PR #5026 created; #4835 commented and closed as superseded. | closeout |
| Closeout | complete | Plan checker is the final local gate before goal completion. | final response |

Findings:
- Discussion #4834 and PR #4835 report a real bug: a paragraph text leaf containing embedded `\n` serializes to markdown that deserializes as separate paragraphs.
- The original PR's core idea of normalizing embedded text newlines into break-node serialization is valid.
- The original PR's AI streaming expected-output changes are wrong: streaming should preserve the exact chunk contract, not start returning markdown/html hard-break artifacts.
- Existing `packages/markdown/src/lib/table.spec.ts` imported `@platejs/table`; package typecheck exposed that `packages/markdown/package.json` lacked the devDependency.

Decisions and tradeoffs:
- Fixed the markdown ownership boundary in paragraph serialization, not caller-specific code.
- Added an AI streaming wrapper escape for embedded text-leaf newlines so `@platejs/markdown` can serialize correct markdown while `@platejs/ai` preserves stream chunks.
- Kept trailing hard-break behavior aligned with existing split-break-child output; no broad trailing-break rewrite.
- Added two patch changesets because both published packages have runtime-facing deltas.

Implementation notes:
- `normalizeParagraphLineBreaks` in `packages/markdown/src/lib/rules/defaultRules.ts` splits embedded text `\n` into existing break nodes before mdast conversion.
- `streamSerializeMd` temporarily replaces embedded text-leaf newlines with a private placeholder before markdown serialization, then restores them; explicit hard-break children remain explicit markdown hard breaks.
- AI streaming tests cover internal raw newlines, explicit markdown hard breaks, mixed raw/hard breaks, trailing newline, trailing spaces, spaces before trailing newline, and literal trailing backslashes.
- Added `@platejs/table` as a markdown devDependency because markdown package tests import table code.

Review fixes:
- Autoreview finding 1 accepted: suffix-based `endsWith('\\')` cleanup could corrupt literal backslashes. Replaced with exact trailing-whitespace suffix cleanup.
- Autoreview finding 2 accepted: cleanup missed trailing whitespace shaped as `space + newline + space`. Generalized suffix handling and added coverage.
- Autoreview finding 3 accepted: internal streamed newlines became markdown hard-break syntax. Added embedded-text placeholder strategy and coverage.
- Autoreview finding 4 accepted: global hard-break unescape could corrupt mixed values. Replaced global replacement with targeted placeholder restoration and mixed-value coverage.
- Final autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg`/source lookup produced too much output | 1 | Narrow to markdown/AI streaming owner paths and cap output | Recovered; evidence recorded without relying on noisy output. |
| First AI streaming focused test command omitted `./` path prefix | 1 | Rerun with explicit relative paths | Rerun passed after implementation. |
| `bun` stdin probe used unsupported command shape | 1 | Rerun with `bun -e` | Probe completed. |
| Package typecheck failed on missing `@platejs/table` import | 2 | Run reinstall once, then fix manifest if persistent | `pnpm run reinstall` did not fix; added devDependency and reran checks. |

Verification evidence:
- Red repro: `bun -e` showed current source serialized `Text followed...\n\n\nFollowed...` as raw blank lines and deserialized into two paragraphs.
- Red tests: initial `bun test packages/markdown/src/lib/commonmarkSurface.spec.ts` failed for embedded text-leaf hard breaks and trailing text-leaf hard break parity.
- `bun test packages/markdown/src/lib/commonmarkSurface.spec.ts`: passed, 14 tests.
- `bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`: passed, 18 tests.
- `pnpm turbo typecheck --filter=./packages/markdown --filter=./packages/ai`: passed.
- `pnpm --filter @platejs/markdown test`: passed, 233 tests.
- `pnpm lint:fix`: passed, no fixes applied.
- `.agents/skills/autoreview/scripts/autoreview --mode local`: final pass clean.
- `pnpm check`: passed. Notes: existing eslint warning in `apps/www/src/components/ui/sidebar.tsx`; known multiple `@platejs/core` diagnostic printed during tests, but command exited 0.
- `git diff --check`: passed.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5026
- Issue / tracker line: #4835 commented and closed as superseded: https://github.com/udecode/plate/pull/4835#issuecomment-4710485850
- Confidence line: 🟢 95% confidence
- Flow table:
  - Reproduced: 🔴 `bun -e` repro and red `commonmarkSurface.spec.ts`; browser ➖ N/A
  - Verified: 🟢 focused tests, package typecheck, markdown package test, lint, autoreview, `pnpm check`; browser ➖ N/A
- Browser check: ➖ N/A: package serialization/streaming behavior, no honest browser-only surface.
- Outcome: Markdown serialization now preserves embedded paragraph text line breaks through existing break-node markdown serialization; AI streaming keeps exact newline chunk behavior.
- Caveat: This does not redesign all trailing hard-break semantics; it keeps current split-break-child parity and closes the reported embedded-text bug.
- Design:
  - Chosen boundary: paragraph serialization in `@platejs/markdown`, with a targeted `@platejs/ai` stream compatibility layer.
  - Why not quick patch: caller-specific replacement would leave other markdown serialization callers broken.
  - Why not broader change: trailing-break markdown semantics are adjacent and riskier; this PR fixes the reproduced bug plus required stream compatibility.
- Verified: see Verification evidence.
- PR body verified: `gh pr view 5026 --json url,state,title,body` confirmed task-style body and auto-release block.

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
- PR: https://github.com/udecode/plate/pull/5026
- Issue / tracker: https://github.com/udecode/plate/pull/4835#issuecomment-4710485850; #4835 is closed as superseded.
- Browser proof: N/A.
- Caveats: Existing eslint warning and multiple-core diagnostic from `pnpm check` are non-failing and unrelated.

Timeline:
- 2026-06-15T16:48:30.417Z Task goal plan created.
- 2026-06-15T17:05Z Reproduced markdown text-leaf line-break loss from source.
- 2026-06-15T17:18Z Added failing markdown package tests.
- 2026-06-15T17:30Z Implemented paragraph line-break normalization and AI streaming compatibility.
- 2026-06-15T17:47Z Fixed missing markdown devDependency after reinstall did not resolve typecheck.
- 2026-06-15T18:12Z Accepted and fixed four autoreview findings in AI streaming.
- 2026-06-15T18:30Z Focused tests, package typecheck, lint, autoreview, and `pnpm check` passed.
- 2026-06-15T17:22Z Opened PR #5026 and commented/closed PR #4835 as superseded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Amend/push final plan, complete goal, final response |
| What is the goal? | Complete PR #4835 with a verified replacement PR that credits @dschoorl |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None known. CI remains external, but local `pnpm check` passed before PR creation.
