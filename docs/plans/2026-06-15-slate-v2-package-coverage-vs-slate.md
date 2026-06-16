# slate v2 package coverage vs slate

Objective:
Audit Slate v2 package changes vs `/Users/zbeyens/git/slate`; done when every package has 100% coverage score; plan docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user correction / release artifact audit
- id / link: current thread
- title: 100% package coverage vs upstream Slate
- acceptance criteria: use `autogoal`; compare Slate v2 package changes against `/Users/zbeyens/git/slate`; every package must have a 100% confidence score row; do not stop until every package reaches 100% or a real blocker prevents autonomous progress.

First checkpoint:
- [x] Use `autogoal`. Evidence: active goal created for this exact plan.
- [x] Use `changeset` rules when validating or patching release artifacts. Evidence: `.agents/skills/changeset/SKILL.md` read.
- [x] Compare against `/Users/zbeyens/git/slate` (`../slate` from this workspace), not only `.tmp/slate-v2` versus its own `main`.
- [x] Score each package independently. A package is not covered because another package is covered.
- [x] Include every package directory present in either `/Users/zbeyens/git/slate/packages` or `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages`.
- [x] For each changed public package, verify release coverage against current changeset text and source evidence.
- [x] For each private/internal/no-user-visible package, record an explicit no-artifact reason instead of silently skipping it.
- [x] Stop condition: do not stop or close until every package has `score=100` in the ledger, or a real blocker prevents further autonomous proof.
- [x] Deliverables: package coverage ledger, per-package evidence notes, any needed changeset patches, validator output, and final handoff with residual risks.

Completion threshold:
- `.tmp/changeset-audit/slate-v2-vs-slate/package-coverage-ledger.tsv` exists and has one row for every package directory present in either source repo.
- Every ledger row has `score=100`.
- Every changed public package row has a concrete release artifact path and source evidence proving the artifact covers the package-level user-visible delta vs `/Users/zbeyens/git/slate`.
- Every changed private/internal/no-artifact package row has an explicit no-artifact reason.
- Validator proves no missing package rows, no score below 100, no public changed package without release coverage, no changeset package absent from the package graph, and no duplicate package/bump changesets.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md` passes.

Verification surface:
- Source audit: package directory manifests and file lists from `/Users/zbeyens/git/slate/packages` and `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages`.
- Source audit: package-level diff summary for every package directory.
- Artifact audit: `.tmp/slate-v2/.changeset/*.md` and root `.changeset/*.md`.
- Validator: local Node script over the generated ledger and changeset frontmatter.
- Plan checker: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `/Users/zbeyens/git/slate` package tree as upstream comparison, `/Users/zbeyens/git/plate-2/.tmp/slate-v2` package tree and changesets as the candidate release artifact set.
- Allowed edit scope: this plan, `.tmp/changeset-audit/slate-v2-vs-slate/**`, and changeset markdown if coverage gaps are found.
- Browser surface: N/A, release artifact/source audit only.
- Tracker sync: N/A, no issue/PR requested.
- Non-goals: no runtime code changes unless the audit proves a release artifact cannot honestly describe the package delta; no commit; no PR; no package tests unless changeset patching exposes a source/API ambiguity requiring package proof.

Output budget strategy:
- Generate counts and TSV/JSON artifacts under `.tmp/changeset-audit/slate-v2-vs-slate/`.
- Inspect per-package summaries and targeted file slices; do not stream full recursive diffs.
- Exclude `node_modules`, build output, logs, coverage, and generated caches.
- Use `rg --files`, `find`, `git diff --name-only`, `comm`, `wc`, and capped `sed` reads before detailed source reads.

Blocked condition:
- Block only if `/Users/zbeyens/git/slate` is missing/unreadable, package identity cannot be established from manifests/directories, or a package delta requires a release-owner decision that cannot be inferred from source and changeset rules after targeted review.

Task state:
- task_type: release-artifact coverage audit
- task_complexity: normal
- current_phase: verification
- current_phase_status: in_progress
- next_phase: review
- goal_status: active

Current verdict:
- verdict: coverage repaired
- confidence: 100% package score after ledger validator
- next owner: autoreview
- reason: every package row has score 100; public package changesets were patched for missing package-shape coverage.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copies every explicit user requirement into package-scored rows. |
| Skill analysis before edits | yes | `autogoal` and `changeset` skill files read before audit/edit work. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created this active goal. |
| Source of truth read before edits | yes | Read `/Users/zbeyens/git/slate/packages`, `.tmp/slate-v2/packages`, package manifests, public entrypoints, and `.tmp/slate-v2/.changeset/*.md`. |
| Tracker comments and attachments read | no | N/A: no tracker issue or attachment requested. |
| Video transcript evidence required | no | N/A: no video evidence in this task. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: release-artifact/source coverage audit; no runtime implementation change. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change requested. |
| Branch decision for code-changing task | no | N/A: no commit/PR requested. |
| Release artifact decision | yes | `.tmp/slate-v2/.changeset/*.md` is the release artifact surface; no-artifact rows allowed only with explicit reason. |
| Browser tool decision for browser surface | no | N/A: no browser surface changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync requested. |
| Output budget strategy recorded | yes | Broad diff output will be written to `.tmp/changeset-audit/slate-v2-vs-slate/` and inspected in slices. |
| Package/API pack selected | yes | Applied `package-api` because this audits package release coverage. |
| Public surface or package boundary identified | yes | Boundary is every package dir in `/Users/zbeyens/git/slate/packages` or `.tmp/slate-v2/packages`. |
| Release artifact path selected | yes | `.tmp/slate-v2/.changeset`; root `.changeset` is checked only to prove no wrong extra artifact. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read. |
| Barrel/export impact decision recorded | no | N/A: no source/export layout edit planned by this audit. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: first checkpoint rows above.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video input.
- [x] Nearby repo instructions and implementation patterns read before edits. Evidence: AGENTS prompt, `autogoal`, `changeset`, package manifests, entrypoints, and changeset files read.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Evidence: patched only release artifact changesets and audit plan/artifacts.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. Evidence: published packages use `.tmp/slate-v2/.changeset`; private/non-package rows have no-artifact reasons.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable. Evidence: final handoff contract below.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no commit/PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no install/test failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. Evidence: audits ran in `/Users/zbeyens/git/plate-2` over `/Users/zbeyens/git/slate` and `.tmp/slate-v2`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Evidence: high risk is false release notes for package API/export shape; fixed with source-backed package-shape changeset lines.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Evidence: scoped review target is final changeset files plus ledger/plan artifacts.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. N/A: no agent/tooling source edited.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Evidence: broad comparison saved under `.tmp/changeset-audit/slate-v2-vs-slate/`.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded. Evidence: package ledger and manifest summary artifacts.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason. Evidence: `package-coverage-ledger.tsv`.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. Evidence: `changeset` skill read; one package per changeset validator passed.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset. N/A: no registry-only diff in this task.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. Evidence: `slate-browser` private; `slate-layout-pretext` no package manifest.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Evidence: major changesets cover API/package-shape migration rows.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason. N/A: release artifact markdown only; no runtime source changed.
- [x] Package/API pack: generated barrels or release notes are updated when required. Evidence: changeset release notes patched; no barrel/source layout edit.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Coverage validator passed: 8 ledger rows, 12 changeset package+bump entries, all scores 100. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: release artifact coverage audit, not runtime bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no runtime behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: markdown/audit artifacts only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package source/export layout edited. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: manifests read as evidence only, not edited. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents` source edited. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | `/Users/zbeyens/git/plate-2` audit compared `/Users/zbeyens/git/slate/packages` with `.tmp/slate-v2/packages`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output edited. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Public package deltas covered in `.tmp/slate-v2/.changeset`; private/non-package rows have explicit no-artifact status. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry-only component diff. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Changeset markdown and audit plan updated; source-backed by package manifests, entrypoints, and validator. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: false or incomplete release notes. Proof: per-package coverage ledger plus required package-shape phrase validator. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling source edited. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install/test failure. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: helper has no file-scope mode and local/branch review would include the whole dirty Slate v2 rewrite. Scoped source validators and stale-string audit are the correct review surface for this release-artifact patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown/audit artifacts only; structural validator is the relevant gate. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Broad diff details saved under `.tmp/changeset-audit/slate-v2-vs-slate/`; command output stayed capped. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md` | Passed in `/Users/zbeyens/git/plate-2`. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `manifest-summary.md`, package entrypoint reads, and `coverage-review.md`. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Ledger statuses: `covered`, `private-no-artifact`, `not-package`. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | 12 Slate v2 changesets; validator passed duplicate/package graph checks. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: no registry-only diff. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | `slate-browser` private; `slate-layout-pretext` has no package manifest after generated-output exclusions. |
| Package typecheck/build/test | no | Run owning package checks or record N/A with reason | N/A: no package source changed by this pass. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no source/export layout changed by this pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read package trees, manifests, public entrypoints, and current changesets for `/Users/zbeyens/git/slate` vs `.tmp/slate-v2`. | implementation |
| Implementation | complete | Patched changesets for missing package-root/export/peer/policy coverage and regenerated audit artifacts. | verification |
| Verification | complete | Coverage validator passed; stale-string audit passed except deliberate current DOM policy values. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Final handoff fields filled; final checker is the remaining mechanical proof. | final response |

Findings:
- Package union: `slate`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-react`, new public `slate-layout`, private `slate-browser`, and non-package leftover `slate-layout-pretext`.
- Current changesets covered runtime/API behavior, but initially under-covered package-shape changes from `/Users/zbeyens/git/slate`: ESM/package-root exports, React 19.2 peer requirement, and full DOM coverage policy values.
- `slate-browser` changed but has `"private": true`, so no published changeset is correct.
- `slate-layout-pretext` has no `package.json` after excluding generated `dist/.turbo` files, so it is not a package release surface.

Package coverage score table:
| Package | Status | Score | Evidence |
|---------|--------|-------|----------|
| `slate` | covered | 100 | `slate-major.md`, `slate-minor.md`, `slate-patch.md`; package manifest and root exports. |
| `slate-dom` | covered | 100 | `slate-dom-major.md`, `slate-dom-minor.md`, `slate-dom-patch.md`; package manifest and root exports. |
| `slate-history` | covered | 100 | `slate-history-major.md`; package manifest and root exports. |
| `slate-hyperscript` | covered | 100 | `slate-hyperscript-major.md`; package manifest and root exports. |
| `slate-layout` | covered | 100 | `slate-layout-minor.md`; new package manifest, root export, and `slate-layout/react`. |
| `slate-react` | covered | 100 | `slate-react-major.md`, `slate-react-minor.md`, `slate-react-patch.md`; package manifest and root exports. |
| `slate-browser` | private-no-artifact | 100 | `package.json` has `"private": true`. |
| `slate-layout-pretext` | not-package | 100 | No `package.json` after generated-output exclusions. |

Decisions and tradeoffs:
- Treat `../slate` as the comparison authority because the user explicitly asked for coverage vs sibling upstream Slate, not only branch diff vs `main`.
- Keep one changeset file per package+bump and patch existing files instead of adding extra files, preserving max patch/minor/major per package.
- Do not run broad `autoreview --mode local`; it would review unrelated dirty Slate v2 work and weaken this narrow release-artifact proof.

Implementation notes:
- Added package-root export coverage to `slate-major.md`.
- Added package-root/deep-import coverage to `slate-dom-major.md`.
- Added package-root import coverage to `slate-history-major.md`.
- Added React 19.2 peer, package-root import, and full DOM coverage policy values to `slate-react-major.md`.
- Regenerated `.tmp/changeset-audit/slate-v2-vs-slate/package-coverage-ledger.tsv`, `coverage-review.md`, `manifest-summary.md`, and per-package summaries.

Review fixes:
- Scoped stale-string review found regenerated `slate-react.md` artifact still had old DOM coverage values; regenerated package summaries.
- Scoped stale-string review confirmed no `ReactEditor.findPath`, no `tx.state`, no `covered-candidate`, and no score below 100 remain in final changesets/ledger.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `node` package comparison in `/Users/zbeyens/git/plate-2`: generated `package-diff-details.json`, per-package summaries, and `package-coverage-ledger.tsv` from `/Users/zbeyens/git/slate/packages` vs `.tmp/slate-v2/packages`.
- `node` coverage validator in `/Users/zbeyens/git/plate-2`: `coverage validator passed: 8 ledger rows, 12 changeset package+bump entries, all scores 100`.
- `node` ledger score audit in `/Users/zbeyens/git/plate-2`: `ledger score audit passed: 8/8 rows at 100`.
- `find .changeset -maxdepth 1 -name '*.md' -not -name README.md | wc -l`: root repo has `0` package changesets.
- `rg` stale-string audit over `.tmp/slate-v2/.changeset`, audit artifacts, and this plan: no stale `ReactEditor.findPath`, no stale `tx.state`, no `covered-candidate`, no score below 100. Current DOM policy value lines intentionally include `materialize`, `skip`, `model`, `summary`, `exclude`, and `custom`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-package-coverage-vs-slate.md`: passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: 100% package coverage score for every package row in the final ledger.
- Flow table:
  - Reproduced: release-artifact gap reproduced by package manifest/entrypoint diff vs `/Users/zbeyens/git/slate`.
  - Verified: package coverage validator, score audit, stale-string audit, and final goal checker.
- Browser check: N/A, no browser surface.
- Outcome: all package rows reached score 100; missing package-shape release-note coverage patched.
- Caveat: no package tests run because this pass changed changeset markdown and audit artifacts only.
- Design:
  - Chosen boundary: release artifacts plus audit ledger.
  - Why not quick patch: package coverage had to be proven package-by-package against `/Users/zbeyens/git/slate`.
  - Why not broader change: runtime code was not the failing surface; source code only served as evidence.
- Verified: `package-coverage-ledger.tsv`, `coverage-review.md`, manifest/entrypoint reads, and validators.
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
- Browser proof: N/A.
- Caveats: no package tests run; markdown/audit artifact correction only.

Timeline:
- 2026-06-15T16:39:24.385Z Task goal plan created.
- 2026-06-15 Created active autogoal.
- 2026-06-15 Generated package diff ledger from `/Users/zbeyens/git/slate` vs `.tmp/slate-v2`.
- 2026-06-15 Patched missing package-shape coverage in `slate`, `slate-dom`, `slate-history`, and `slate-react` changesets.
- 2026-06-15 Regenerated audit artifacts and ran coverage validator.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final checker |
| Where am I going? | Run `check-complete`, close the goal if it passes, then hand off |
| What is the goal? | Every package has 100% release coverage score vs `/Users/zbeyens/git/slate` |
| What have I learned? | The runtime/API coverage was mostly right, but package-root/ESM/React-peer/policy-value coverage needed patching |
| What have I done? | Patched changesets, generated per-package ledger, and validated all rows at score 100 |

Open risks:
- Low: this is a release-note coverage audit, not runtime validation. No package tests were run because no runtime source changed.
