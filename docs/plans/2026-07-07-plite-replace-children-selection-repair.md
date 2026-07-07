# plite replace children selection repair

Objective:
Repair Plite replaceChildren selection defaults; done when focused Plite/basic-nodes tests pass and blockquote no longer owns custom remapping.

Goal plan:
docs/plans/2026-07-07-plite-replace-children-selection-repair.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-accepted Plite substrate execution
- id / link: latest chat request, "go"
- title: Plite `replaceChildren` should preserve selection by default when reused descendants move under replacement children.
- acceptance criteria:
  - `tx.nodes.replaceChildren` computes safe default `newSelection` when omitted.
  - Selection outside the replaced child range still transforms normally.
  - Selection inside the replaced child range remaps when the selected node object is reused inside `newChildren`.
  - Selection inside the replaced child range becomes `null` when no identity remap is possible.
  - `BaseBlockquotePlugin` removes custom `pathMap` / `mapBlockquoteSelection` code and relies on Plite.
  - Focused Plite and basic-nodes tests pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed request
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Plite `replaceChildren` has a default selection remap that removes the
  blockquote-local selection mapper, preserves current behavior, and is covered
  by focused tests.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plite-replace-children-selection-repair.md` passes.

Verification surface:
- `pnpm --filter @platejs/plite test test/editor-methods-contract.ts`
- `pnpm --filter @platejs/basic-nodes test src/lib/BaseBlockquotePlugin.spec.ts`
- focused source audit proving `mapBlockquoteSelection` and `pathMap` are gone
  from `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: Plite node transform semantics and blockquote package diff.
- Allowed edit scope: `packages/plite/src/transforms-node/replace-children.ts`,
  focused Plite tests, and
  `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts` plus focused tests if
  needed.
- Browser surface: N/A, no browser route/UI change.
- Browser strategy: N/A: package runtime behavior only.
- Tracker sync: N/A.
- Non-goals: no PR, no package sweep, no unrelated blockquote redesign, no
  broad Plate migration.

Output budget strategy:
- Use focused file reads/diffs and focused `rg`; cap command output; no broad
  repo test output unless focused tests fail in a way that needs expansion.

Blocked condition:
- Block only if Plite cannot infer the active selection type from current
  interfaces or focused tests reveal a wider operation contract conflict.

Task state:
- task_type: Plite runtime/API repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implement Plite identity-remap default, then delete blockquote mapper
- confidence: 0.86 before patch; expected 0.95+ after focused tests
- next owner: task
- reason: current Plite defaults `newSelection` to stale current selection
  when callers omit it; feature plugins should not hand-map paths.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plite-replace-children-selection-repair.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria copied from latest "go" and preceding Plite decision. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `plite-plan` and `autogoal`. |
| Active goal checked or created | yes | `get_goal` returned `null`; using plan-led execution without creating thread goal for this narrow packet. |
| Source of truth read before edits | yes | Read `BaseBlockquotePlugin.ts`, Plite `replace-children.ts`, operation/path/point/range transform code. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: direct source-owner repair; no docs/solutions owner named. |
| TDD decision before behavior change or bug fix | yes | Add/repair focused tests around `replaceChildren` default selection remap before closeout. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch/PR. |
| Release artifact decision | yes | No changeset in this packet unless broader release policy later requires; current branch is unreleased migration work. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Focused file reads, focused rg/tests only. |
| Package/API pack selected | yes | `package-api` pack selected because Plite runtime/API behavior changes. |
| Public surface or package boundary identified | yes | `@platejs/plite` node transform behavior; `@platejs/basic-nodes` blockquote normalizer consumes it. |
| Release artifact path selected | yes | N/A: no published artifact for this uncommitted migration packet. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | yes | No export/barrel layout change expected. |

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
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Runtime behavior risk: selection remap must not corrupt
      outside-range selections or explicit `newSelection`.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: focused packet, no
      autoreview unless final diff expands.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exported file layout change expected.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Plite focused test, basic-nodes focused test, package typecheck, scoped lint, source audit all recorded below. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: user accepted substrate design gap; added focused contract tests during fix. A first run failed due test setup using pre-clone object, then passed after using the live node. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/editor-methods-contract.ts` -> 6 pass. `pnpm --filter @platejs/basic-nodes test src/lib/BaseBlockquotePlugin.spec.ts` -> 38 pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/basic-nodes` -> 12 successful. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export/barrel file changed in this packet; existing untracked Plite transform file is part of broader migration state. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest/lockfile edit. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands run from `/Users/zbeyens/git/plate-2`, owning packages `@platejs/plite` and `@platejs/basic-nodes`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: runtime/package tests only. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser route/UI surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset: current branch is unreleased Plate/Plite migration work and user did not request release artifact. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: selection remaps to wrong node or stale path. Proof: identity-remap and null-selection tests, plus blockquote normalization spec. Boundary: Plite owns default transform selection, feature plugin owns only quote semantics. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: transient parallel build/test resolution failure passed when rerun alone; no reinstall needed. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: narrow interactive packet under user review; focused tests/typecheck/lint run. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm --filter @platejs/plite lint` and `pnpm --filter @platejs/basic-nodes lint` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused reads/tests; no broad output. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plite-replace-children-selection-repair.md` | Passed. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `replaceChildren` behavior lives in `@platejs/plite`; blockquote caller no longer owns mapping. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Runtime behavior in unreleased migration branch; no release artifact for this packet. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: unreleased migration work, no changeset requested. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No release artifact: internal migration branch runtime/test cleanup before public release packaging. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Plite test, basic-nodes test, combined package typecheck passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no barrel/export file edit in this packet. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source owners read: Plite `replace-children`, operation transform helpers, and `BaseBlockquotePlugin`. | implementation |
| Implementation | complete | Plite default selection remap implemented; blockquote mapper removed. | verification |
| Verification | complete | Focused tests, typecheck, lint, source audit passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Final handoff fields filled; check-complete rerun after metadata patch. | final response |

Findings:
- `replaceChildren` should not default to stale current selection. When callers
  omit `newSelection`, Plite can remap reused selected nodes by identity,
  transform outside-range selections, and clear unresolvable inside-range
  selections.
- `BaseBlockquotePlugin` no longer needs `pathMap` or
  `mapBlockquoteSelection`; its normalizer reuses the original inline text
  nodes and lets Plite compute the new selection.

Decisions and tradeoffs:
- Keep explicit `newSelection` support for replay/collab and specialized
  transforms.
- Add safe default only when `newSelection` is omitted.
- Use node identity remap, not deep equality. Deep equality could remap to the
  wrong duplicate node.

Implementation notes:
- Added Plite selection remap logic in the existing untracked
  `packages/plite/src/transforms-node/replace-children.ts` migration owner.
- Added Plite contract tests for reused-node remap and non-reused selection
  clearing.
- Removed blockquote-local selection mapper and path map.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/plite test test/editor-methods-contract.ts` treated the path as a Bun filter | 1 | Rerun with `./test/editor-methods-contract.ts` through `bun test` | Passed |
| New Plite remap test reused pre-clone setup object, not the live editor node | 1 | Read live node from `editorGetChildren(editor)` before replacement | Passed |
| Basic-nodes test failed during parallel typecheck/build/test with transient module resolution | 1 | Rerun focused command alone after builds settled | Passed |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/editor-methods-contract.ts` -> 6 pass.
- `pnpm --filter @platejs/basic-nodes test src/lib/BaseBlockquotePlugin.spec.ts` -> 38 pass.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/basic-nodes` -> 12 successful.
- `pnpm --filter @platejs/plite lint` -> passed.
- `pnpm --filter @platejs/basic-nodes lint` -> passed.
- `rg -n 'mapBlockquoteSelection|pathMap|BlockquoteChildrenNormalization' packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts packages/plite/src/transforms-node/replace-children.ts` -> no matches.

Final handoff contract:
- PR line: N/A, no PR requested
- Issue / tracker line: N/A
- Confidence line: 95%
- Flow table:
  - Reproduced: Plite contract gap covered by new tests; browser N/A
  - Verified: Plite focused test, basic-nodes focused test, package typecheck, scoped lint
- Browser check: N/A, package runtime behavior only
- Outcome: Plite owns default `replaceChildren` selection remap; blockquote no longer owns path remapping.
- Caveat: `packages/plite/src/transforms-node/replace-children.ts` is an untracked migration file already exported by tracked Plite code in this checkout.
- Design:
  - Chosen boundary: Plite transform default, because stale selection after structural child replacement is generic substrate behavior.
  - Why not quick patch: blockquote-local path maps would repeat in every normalizer that wraps/reuses descendants.
  - Why not broader change: explicit `newSelection` remains available for transforms with semantic replacement that identity remap cannot infer.
- Verified: focused Plite/basic-nodes tests, typecheck, lint, source audit.
- PR body verified: N/A.

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: Plite transform owner is currently untracked in this migration branch; keep it when staging this packet.

Timeline:
- 2026-07-07T11:01:21.405Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Repair Plite `replaceChildren` default selection remap and remove blockquote-local selection mapping. |
| What have I learned? | See Findings |
| What have I done? | Implemented Plite remap, removed blockquote mapper, added focused tests, ran focused package proof. |

Open risks:
- Remaining caveat: `packages/plite/src/transforms-node/replace-children.ts`
  is untracked in this checkout but is already exported by tracked migration
  code; include it when staging this packet.
