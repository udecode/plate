# Centralize v54 migration tests

Objective:
Centralize Plate v54 migration coverage; done when package-local contract specs
are gone, equivalent central cases pass, and stale references are zero.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-centralize-v54-migration-tests.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: current Codex task
- title: Centralize v54 migration tests
- acceptance criteria: delete the Basic Nodes, Media, and Table v54 contract
  specs; preserve their meaningful coverage under one central migration owner;
  remove obsolete test dependencies; prove the central suite and affected
  packages remain green.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary test and source-audit threshold
- improvement loop: N/A: one-shot execution
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- The three package-local `v54MigrationContract.spec.ts` files do not exist.
- `packages/plate/src/migrations` owns the surviving Script, Media, and Table
  migration cases without depending on those feature packages.
- No source or manifest references remain to the deleted specs or obsolete
  `platejs` dev dependencies in those packages.
- The central Plate migration suite, affected package tests/typechecks, barrel
  generation, install graph, and lint pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-centralize-v54-migration-tests.md` passes.

Verification surface:
- Focused Plate migration spec.
- Basic Nodes, Media, Table, and Plate package tests and typechecks.
- `pnpm brl`, `pnpm install`, scoped lint, and `rg` stale-reference audit.
- P2 local autoreview because the move consolidates a non-trivial regression
  matrix.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/plate/src/migrations/migratePlateV54.spec.ts`,
  `packages/plate/src/migrations/index.ts`, and the three package-local specs.
- Allowed edit scope: central migration tests, deleted package-local specs,
  affected package manifests/lockfile, generated barrels if changed, this plan.
- Browser surface: N/A: test ownership only; runtime behavior is unchanged.
- Browser strategy: N/A: no browser surface. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: changing migration runtime behavior, public API, docs, registry,
  or feature package production schemas.

Output budget strategy:
- Read exact specs/manifests and cap repo searches with path filters and
  `head`; exclude generated/build dependency trees. Keep test output scoped to
  the four affected packages.

Blocked condition:
- Stop only if preserving the existing coverage requires a production package
  dependency cycle or if the central owning suite cannot exercise editor load
  paths without changing runtime behavior.

Task state:
- task_type: test architecture hard cut
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: centralize in `packages/plate/src/migrations`; use migration-owned
  schema fixtures instead of feature-package imports that create a dependency
  cycle
- confidence: high
- next owner: task
- reason: Plate owns `migratePlateV54`; the feature packages should neither
  import Plate migrations in tests nor become reverse dependencies of Plate.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-centralize-v54-migration-tests.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance rows above copy the centralization and deletion request. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `hard-cut` governs deletion; `autogoal` governs the measurable closeout. |
| Active goal checked or created | yes | Goal created with this plan path. |
| Source of truth read before edits | yes | Read central migration implementation/profile test, all three package-local specs, and affected manifests. |
| Tracker comments and attachments read | no | N/A: direct request has no tracker or attachments. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read hard-cut explicit-contract and workspace package-test guidance. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change; existing regression cases are being relocated before deletion. |
| Branch decision for code-changing task | no | N/A: user did not request branch, commit, push, or PR. |
| Release artifact decision | no | N/A: tests and dev-only dependency cleanup need no changeset or registry entry. |
| Browser tool decision for browser surface | no | N/A: no browser-facing change. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact-file reads, scoped searches, capped output, and four-package proof recorded above. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: none requested.
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
      N/A: no recording exists.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Plate migrations own both migration code and
      regression coverage; feature packages retain only their current-schema tests.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
      Use one `pnpm run reinstall` only if failures match known install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
      All commands run in `/Users/zbeyens/git/plate-2`; package filters name the
      owning Plate, Basic Nodes, Media, and Table workspaces.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
      N/A: test ownership and dev-only dependency cleanup; no public/package runtime contract changes.
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
      Use a temporary scoped local snapshot containing the three deletions, new
      central spec, manifests, and lockfile because the shared checkout contains
      unrelated work.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent-native files change.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 18 deleted package cases equal 18 central editor-load cases; all named commands pass. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: regression coverage relocation, not a behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Central migration files pass 26 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Plate, Basic Nodes, Media, and Table typechecks pass. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm brl` passes 57 tasks. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Install completes; lockfile drops three obsolete dev dependencies; four package suites pass. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran in `/Users/zbeyens/git/plate-2` against the owning four packages. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: test topology only. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no production behavior or public API change; test/dev-dependency cleanup only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this internal goal plan changed. |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: no public/runtime contract changed; the test dependency boundary improved. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal; ordinary install and all package proof passed. |
| P2 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Scoped `autoreview --mode local --max-priority P2` is clean, 0 accepted findings, 0.96 correctness. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below with ownership decision, proof, and caveat. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Four-package scoped `lint:fix` passes with zero fixes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches were exact or capped; test/review output stayed scoped. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-centralize-v54-migration-tests.md` | Exact command passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Sources, manifests, instructions, and relevant solutions read. | implementation |
| Implementation | complete | Added one central editor-load suite, deleted three package specs, removed three obsolete dev dependencies, refreshed lockfile. | verification |
| Verification | complete | 26 focused central tests; 4-package typecheck and 395 package tests pass; install, barrels, lint, and source audit pass. | review |
| PR / tracker sync | complete | N/A: neither requested. | closeout |
| Closeout | complete | Clean P2 review, exact 18-to-18 case count, all gates resolved. | final response |

Findings:
- The only non-production imports of `platejs/migrations` in Basic Nodes,
  Media, and Table are the three contract specs being deleted.
- Importing real feature plugins from Plate's own tests would create a reverse
  test dependency onto packages that peer-depend on Plate.
- `migratePlateV54` dispatches by installed plugin names, schema types, and
  property ownership, so central migration-owned schema fixtures exercise the
  relevant contract without copying feature production code.

Decisions and tradeoffs:
- Central owner is `packages/plate/src/migrations` -> it owns the production
  migration and frozen v53 manifest -> keep all regression cases there.
- Use local schema fixtures -> avoids a package cycle -> risk is fixture drift;
  mitigate by testing migration inputs/outputs and keeping feature schema tests
  responsible only for their current schemas.
- Delete obsolete `platejs` dev dependencies -> prevents dead test coupling.

Implementation notes:
- Added `migratePlateV54.editor.spec.ts` beside the production migration.
- Central fixtures model only identities and schema ownership read by the
  migration: script mark, five media owners, table hierarchy, properties, and
  named roots.
- Deleted the Basic Nodes, Media, and Table v54 contract specs.
- Removed `platejs` dev dependencies from those three packages and refreshed
  `pnpm-lock.yaml`.

Review fixes:
- None. The scoped P2 review returned zero accepted/actionable findings and
  rated the patch correct at 0.96.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm turbo lint:fix ...` targeted a task not declared in Turbo | 1 | Run the four package `lint:fix` scripts through pnpm filters. | Corrected command passed with zero fixes. |
| First review snapshot used `HEAD`, but the package specs existed in the index | 1 | Build the baseline with `git checkout-index`. | Scoped P2 review completed cleanly. |
| A shell loop variable named `path` shadowed zsh's command path | 1 | Rename it to `file_name`. | Exact case-count and stale-reference audit passed. |

Verification evidence:
- `bun test packages/plate/src/migrations/migratePlateV54.spec.ts packages/plate/src/migrations/migratePlateV54.editor.spec.ts` -> 26 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/plate --filter=./packages/basic-nodes --filter=./packages/media --filter=./packages/table` -> 17 tasks pass.
- `pnpm turbo test --filter=./packages/plate --filter=./packages/basic-nodes --filter=./packages/media --filter=./packages/table` -> Plate 27, Basic Nodes 53, Media 76, Table 239; 395 total, 0 fail.
- `pnpm install` -> lockfile refreshed, install/prepare complete.
- `pnpm brl` -> 57 barrel tasks pass.
- `pnpm --filter platejs --filter @platejs/basic-nodes --filter @platejs/media --filter @platejs/table lint:fix` -> clean, zero fixes.
- Source audit -> zero `v54MigrationContract` or `platejs/migrations` matches in the three feature packages; zero `devDependencies.platejs` entries in their manifests.
- Case-count audit -> deleted Basic Nodes 4 + Media 11 + Table 3 = 18; central editor-load suite = 18.
- Scoped `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P2` -> clean, zero accepted/actionable findings, 0.96 correctness.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: no tracker supplied.
- Confidence line: High; focused proof and P2 review are clean.
- Flow table:
  - Reproduced: 18 package-local cases inventoried, browser N/A
  - Verified: 18 central cases, 26 focused tests, 395 package tests, browser N/A
- Browser check: N/A: no browser-facing change.
- Outcome: Plate migrations centrally own Script, Media, and Table v54 regression coverage; package-local migration specs and dev dependencies are gone.
- Caveat: Central fixtures intentionally model migration-observed schema identity and property ownership, while feature packages keep current-schema tests.
- Design:
  - Chosen boundary: `packages/plate/src/migrations` owns migration implementation, frozen manifest, and regression suite.
  - Why not quick patch: leaving any package-local contract would preserve the ownership split the user rejected.
  - Why not broader change: importing production feature plugins into Plate creates reverse dependency pressure and changes no migration behavior.
- Verified: focused tests, four package suites/typechecks, install, barrels, lint, source audit, case count, and P2 review.
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
- PR: N/A: not requested.
- Issue / tracker: N/A: not supplied.
- Browser proof: N/A: no browser surface.
- Caveats: fixture drift is bounded by migration-observed schema inputs; current feature schema behavior remains covered by feature-local schema tests.

Timeline:
- 2026-08-17T13:10:20.760Z Task goal plan created.
- 2026-08-17 Source read complete; central Plate migration suite selected as owner.
- 2026-08-17 Central suite added; three feature specs and dependencies deleted.
- 2026-08-17 Focused tests, four-package typechecks/tests, install, barrels, lint, and stale-reference audit passed.
- 2026-08-17 Scoped P2 review returned clean at 0.96 correctness; 18 deleted cases match 18 central cases.
- 2026-08-17 Goal-plan mechanical completion check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Delete package-local v54 migration specs without losing regression coverage. |
| What have I learned? | Plate is the migration owner; real feature imports would create reverse dependency pressure. |
| What have I done? | Centralized all 18 package cases, removed three specs/dependencies, and passed every planned proof gate. |

Open risks:
- Central fixtures could drift from feature schemas; the migration contract is
  deliberately limited to installed identity/type/property ownership, while
  feature-local schema specs continue to cover current feature schemas.
