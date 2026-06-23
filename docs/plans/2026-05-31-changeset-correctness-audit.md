# changeset correctness audit

Objective:
Audit the current checkout's package changesets for completeness and correctness, complete only when every package/runtime change in scope is mapped to an existing changeset or explicitly classified as no-release-needed, verified by source diff review, changeset file inspection, package/package-boundary audit, and `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-changeset-correctness-audit.md`, while preserving the current unstaged code and not editing changesets unless an actual gap is found.

Flow mode:
one-shot execution.

Goal plan:
docs/plans/2026-05-31-changeset-correctness-audit.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user request
- id / link: current thread request
- title: Review current changesets for correctness
- acceptance criteria: package changesets and registry changelog match the current diff against `origin/main`; no stale package bump remains.

Completion threshold:
- All changed published package source under `packages/**` is classified as `@platejs/core`, `@platejs/plite`, `@platejs/table`, or test-only `@platejs/list`.
- Changed package source has one-package-per-file patch changesets for `@platejs/core`, `@platejs/plite`, and `@platejs/table`; `@platejs/list` has no changeset because only its spec changed.
- Registry-only work under `apps/www/src/registry/**` is represented in `content/components/changelog.mdx`.
- `pnpm exec changeset status --since origin/main`, a frontmatter audit, `git diff --check -- .changeset content/components/changelog.mdx`, and this goal plan checker pass.

Verification surface:
- Source audit: `git diff --name-only origin/main -- packages`, `git diff --name-only origin/main -- apps/www/src/registry content/components/changelog.mdx`, and changed `.changeset` file inspection.
- Command audit: `pnpm exec changeset status --since origin/main`.
- Static formatting audit: `git diff --check -- .changeset content/components/changelog.mdx`.
- Goal audit: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-changeset-correctness-audit.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Do not modify runtime code while auditing release artifacts.
- Keep core package changesets as patch, never minor.
- Keep one package per changeset file.
- Keep registry-only release notes in `content/components/changelog.mdx`, not package changesets.

Boundaries:
- Source of truth: current checkout diff against `origin/main`, `.agents/skills/changeset/SKILL.md`, and `docs/plans/templates/packs/package-api.md`.
- Allowed edit scope: `.changeset/*.md`, `content/components/changelog.mdx`, and this audit plan.
- Browser surface: N/A; browser behavior was already smoke-tested, but this task only audits release artifacts.
- Tracker sync: N/A; no issue/PR was requested.
- Non-goals: no package runtime refactor, no PR, no commit, no push.

Output budget strategy:
- Scope commands to `.changeset`, changed package paths, registry changelog paths, and short diff summaries. Cap long diffs with focused package/path filters and token limits.

Blocked condition:
- Stop only if the branch base cannot be read, the changed package ownership is ambiguous after source audit, or Changesets cannot parse the local files.

Task state:
- task_type: release-artifact audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: release artifacts corrected
- confidence: high
- next owner: none
- reason: package source and registry-only changes are now covered by the right artifact type.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-changeset-correctness-audit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal` from the user-provided skill body and `.agents/skills/changeset/SKILL.md`; package-api pack rows materialized in this plan. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this audit objective. |
| Source of truth read before edits | yes | Read changed `.changeset` files, `git diff --name-status origin/main`, package diffs for core/slate/table/list, and `content/components/changelog.mdx`. |
| Tracker comments and attachments read | N/A: no tracker item | User requested local changeset audit only. |
| Video transcript evidence required | N/A: no video | No video or screen recording is part of this audit. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: release artifact audit | The source of truth is the current diff and changeset rule, not prior implementation solutions. |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior change | Only release artifact markdown changed. |
| Branch decision for code-changing task | N/A: no branch operation | User asked for local audit, not branch creation. |
| Release artifact decision | yes | Use `.changeset` for published package deltas, `content/components/changelog.mdx` for registry-only work, and no artifact for list spec-only changes. |
| Browser tool decision for browser surface | N/A: no browser surface in this audit | Existing browser smoke remains separate evidence; changeset correctness is static. |
| PR expectation decision | N/A: no PR requested | No PR action in scope. |
| Tracker sync expectation decision | N/A: no tracker requested | No issue or Linear sync in scope. |
| Output budget strategy recorded | yes | Plan scopes source reads to changed package paths, `.changeset`, and registry changelog surfaces. |
| Package/API pack selected | yes | Applied `package-api` pack because published package release artifacts are the target. |
| Public surface or package boundary identified | yes | Published package source changed under `packages/core`, `packages/plite`, and `packages/table`; `packages/list` is spec-only. |
| Release artifact path selected | yes | `.changeset/*.md` for packages; `content/components/changelog.mdx` for registry example rename/addition. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` loaded and applied. |
| Barrel/export impact decision recorded | yes | N/A: no exported file layout or barrel files changed during this audit. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
- [x] Package/API pack: registry-only work updates `content/components/changelog.mdx` instead of adding a package changeset; repo path differs from template text.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm exec changeset status --since origin/main` passed; frontmatter audit passed; source classification audit passed; `git diff --check` passed. |
| Bug reproduced before fix | N/A: release artifact audit | Record failing test/repro or N/A with reason | No runtime bug fix in this task. |
| Targeted behavior verification | N/A: markdown release artifacts | Run focused test/proof for changed behavior or record N/A | Static release-artifact checks are the target. |
| TypeScript or typed config changed | N/A: no TS changed by this audit | Run relevant typecheck | Existing runtime TS changes were not modified by this task. |
| Package exports or file layout changed | N/A: no export/layout edit by this audit | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or barrels changed. |
| Package manifests, lockfile, or install graph changed | N/A: no manifest edit by this audit | Run `pnpm install` and relevant package checks | Changeset/changelog markdown only. |
| Agent rules or skills changed | N/A: no agent file edit by this audit | Run `pnpm install` and verify generated skill sync | No `.agents/**` edits in this task. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A: no browser surface changed by this audit | Capture Browser Use proof or record explicit waiver/blocker | Browser smoke already existed; not required for changeset correctness. |
| Browser final proof | N/A: no browser proof required | Attach screenshot or exact browser verification caveat when browser proof applies | Static audit only. |
| CI-controlled template output changed | N/A: no template output touched by this audit | Restore generated template output or record why it is intentionally kept | No `templates/**` edits. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `@platejs/core`, `@platejs/plite`, and `@platejs/table` patch changesets exist; `@platejs/list` is spec-only. |
| Registry-only component work changed | yes | Update `content/components/changelog.mdx` or record N/A | Added May 31 registry changelog entries for `huge-document-demo` and `hundreds-blocks-demo` rename. |
| Docs or content changed | yes | Verify source-backed claims, links, examples, and rendered output or record N/A | Changelog claims are backed by changed registry files and route rename/addition. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and why the chosen boundary is right | Failure mode: stale/missing release note; proof: package source classification plus Changesets status. |
| Agent-native review for agent/tooling changes | N/A: no agent edit by this audit | Load agent-native reviewer or record N/A | Audit did not edit agent/tooling files. |
| Local install corruption suspected | N/A: no corruption signal | Run `pnpm run reinstall` once, rerun exact failing command, or record N/A | No install-corruption failure occurred. |
| Autoreview for non-trivial implementation changes | N/A: release artifact audit only | Load autoreview or record N/A | The task audits changesets, not implementation behavior. |
| PR create or update | N/A: no PR requested | Run `check` before PR work and sync PR body | No PR action requested. |
| Task-style PR body verified | N/A: no PR | Verify PR body | No PR exists for this task. |
| PR proof image hosting | N/A: no PR proof image | Host browser proof images if needed | No PR body update. |
| Tracker sync-back | N/A: no tracker | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker target. |
| Final handoff contract | yes | Fill final handoff fields below | Final response will list the changeset fixes and verification commands. |
| Final lint | yes | Run scoped equivalent | `git diff --check -- .changeset content/components/changelog.mdx` passed; markdown-only release artifact edit. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record recovery | Commands were scoped to changed package paths and release artifacts. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-changeset-correctness-audit.md` | This row is closed after checker pass in Verification evidence. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Package source audit found core/slate/table published source changes; list changed only `BaseListPlugin.spec.tsx`. |
| Release artifact classification | yes | Record published package, registry-only, or no visible delta | Core/slate/table `.changeset`; registry changelog for `apps/www/src/registry`; list no artifact because test-only. |
| Published package changeset | yes | Prove one package per file and no forbidden `minor` on core/slate/plate | Frontmatter audit passed: core patch, slate patch, table patch; no minors. |
| Registry changelog | yes | Update `content/components/changelog.mdx` | Added May 2026 #31 entries. |
| No release artifact | yes | Record exact reason | `packages/list` has only `packages/list/src/lib/BaseListPlugin.spec.tsx`, so no published user-visible delta. |
| Package typecheck/build/test | N/A: no runtime package edit by this audit | Run owning package checks or record N/A | Release artifact correctness is proven by static checks and Changesets status. |
| Barrel/export generation | N/A: no export layout edit by this audit | Run `pnpm brl` when exports or exported file layout changed | No barrel changes required. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Created goal plan; read changeset skill, package-api template rows, current changesets, package diffs, registry changelog. | implementation |
| Implementation | complete | Removed stale core changeset, changed stale list changeset to table, rewrote core API changeset, added registry changelog. | verification |
| Verification | complete | Changesets status, frontmatter audit, changed package source audit, registry changelog audit, and diff whitespace check passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Goal plan updated with evidence and ready for final response. | final response |

Findings:
- `.changeset/serious-dingos-tease.md` duplicated core render-pipe performance details in internal release-note language; deleted.
- `.changeset/twelve-turkeys-kneel.md` targeted `@platejs/list`, but `packages/list` changed only `BaseListPlugin.spec.tsx`; repointed the file to `@platejs/table`.
- `packages/table` has published code changes in `BaseTablePlugin.ts`, `normalizeInitialValueTable.ts`, and `getTableGridByRange.ts`; added `@platejs/table` patch coverage.
- Registry example work under `apps/www/src/registry/**` needed component changelog coverage; added entries in `content/components/changelog.mdx`.
- `pnpm exec changeset status --since origin/main` reports patch bumps for `@platejs/plite`, `@platejs/core`, `@platejs/table`, plus linked/internal dependency bumps `@platejs/test-utils` and `@platejs/csv`; no minor or major bumps.

Decisions and tradeoffs:
- Keep multiple `@platejs/core` patch changesets because one covers public API/deprecation shape and one covers large-document performance/render correctness.
- Do not keep an `@platejs/list` changeset because test-only package changes should not produce release notes.
- Add registry changelog at `content/components/changelog.mdx`; the template mentions `docs/components/changelog.mdx`, but this repo's actual changelog path is under `content`.

Implementation notes:
- Edited only release artifacts and this plan.

Review fixes:
- Rewrote `.changeset/metal-pumas-wave.md` to concise imperative user-impact language.
- Deleted `.changeset/serious-dingos-tease.md`.
- Changed `.changeset/twelve-turkeys-kneel.md` from `@platejs/list` to `@platejs/table`.
- Added void/simple render correctness bullet to `.changeset/shaggy-cobras-cheer.md`.
- Added May 31 registry changelog entries.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm exec changeset status --since origin/main` in `/Users/zbeyens/git/plate-2` passed; patch bumps: `@platejs/plite`, `@platejs/core`, `@platejs/table`, linked `@platejs/test-utils`, linked `@platejs/csv`; no minor/major.
- Frontmatter audit script passed for changed changesets: `.changeset/cyan-rivers-fly.md` -> `@platejs/plite` patch; `.changeset/metal-pumas-wave.md` -> `@platejs/core` patch; `.changeset/shaggy-cobras-cheer.md` -> `@platejs/core` patch; `.changeset/twelve-turkeys-kneel.md` -> `@platejs/table` patch.
- `git diff --name-only origin/main -- packages` source audit: non-test package source changed only under `packages/core`, `packages/plite`, and `packages/table`; `packages/list` changed only `packages/list/src/lib/BaseListPlugin.spec.tsx`.
- Registry audit: `git diff --name-only origin/main -- apps/www/src/registry content/components/changelog.mdx` includes registry example changes and the changelog file.
- `git diff --check -- .changeset content/components/changelog.mdx` passed.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-changeset-correctness-audit.md` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high confidence; static release-artifact checks pass.
- Flow table:
  - Reproduced: N/A for release artifact audit.
  - Verified: changeset status, frontmatter audit, package source classification, registry changelog audit, and diff whitespace check passed.
- Browser check: N/A for this audit.
- Outcome: changesets/changelog corrected.
- Caveat: no package runtime tests run because runtime code was not changed by this task.
- Design:
  - Chosen boundary: release artifact files only.
  - Why not quick patch: full package classification found both stale and missing artifacts.
  - Why not broader change: runtime behavior had already been audited separately; this task only needed release-note correctness.
- Verified: command and source-audit evidence recorded above.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A for this audit.
- Caveats: no runtime package tests run in this audit.

Timeline:
- 2026-05-31T19:03:23.961Z Task goal plan created.
- 2026-05-31T19:04Z Loaded changeset rule and package-api template rows.
- 2026-05-31T19:05Z Audited changed package files and changed changesets against `origin/main`.
- 2026-05-31T19:07Z Patched stale/missing release artifacts and registry changelog.
- 2026-05-31T19:08Z Ran Changesets status, frontmatter audit, source classification audit, and diff whitespace check.
- 2026-05-31T19:09Z Goal plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Prove and repair changeset/changelog correctness for current package and registry diff. |
| What have I learned? | `@platejs/list` was stale/test-only; `@platejs/table` was missing; registry changelog was missing. |
| What have I done? | Corrected changesets/changelog and recorded verification evidence. |

Open risks:
- None for release artifact classification. Runtime correctness remains covered by separate package/browser proof, not this changeset audit.
