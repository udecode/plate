# plite safe read api completion

Objective:
Complete Plite safe read APIs; done when missing-path public reads are safe, strict reads stay loud, and core checks pass.

Goal plan:
docs/plans/2026-06-27-plite-safe-read-api-completion.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: chat follow-up
- id / link: current thread
- title: Complete missed Plite error-throwing read APIs
- acceptance criteria: public `editor.read` convenience APIs return safe defaults for missing content; strict `required: true` remains loud where available; malformed paths still throw; focused contracts and `check:core` pass.

First checkpoint:
- User said `go` after review found more throwing Plite read APIs.
- Scope: public `editor.read` convenience layer in `packages/plite`, focused on missing-path behavior.
- Non-goals: do not make low-level primitives safe; do not hide malformed paths, mutation invariants, runtime lifecycle errors, schema/extension errors, or transaction rollback errors.
- Success: missing-path `state.nodes.children/first/leaf`, `state.points.*`, `state.ranges.*`, and `state.fragment.get` stop throwing by default where they are app-facing reads.
- Strict mode: `required: true` should remain the explicit path for loud reads where the API supports it.
- Verification: focused Plite tests, typecheck/lint, `pnpm check:core`, and a source/probe audit.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Public `editor.read` missing-path behavior is safe by default for the missed read APIs.
- Required/strict query behavior and malformed path errors are still tested.
- Focused Plite query contracts and `pnpm check:core` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-safe-read-api-completion.md` passes.

Verification surface:
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/state-query-contract.ts ./test/upstream-slate-helper-loss-contract.ts`
- `pnpm --filter @platejs/plite typecheck`
- `pnpm --filter @platejs/plite lint:fix`
- `pnpm check:core`
- focused source/probe audit for missing-path `editor.read` APIs

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/plite/src/core/public-state.ts`, Plite editor helper implementations, and Plite query contract tests.
- Allowed edit scope: Plite public read layer and tests; plan ledger.
- Browser surface: N/A, package runtime API behavior only.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: public docs, Plate/Core migration, low-level primitive API redesign, browser proof, release artifact.

Output budget strategy:
- Scope searches to `packages/plite/src`, `packages/plite/test`, and exact public read symbols. Cap command output and use focused files/grep rather than broad repo dumps.

Blocked condition:
- Block only if a read API cannot be made safe without breaking existing strict behavior or types, and no narrower API design fits.

Task state:
- task_type: package API behavior cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: verification-passed

Current verdict:
- verdict: valid
- confidence: high
- next owner: final response
- reason: public `editor.read` safe defaults, strict `required: true`, focused contracts, source audit, and `pnpm check:core` are green.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-safe-read-api-completion.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records safe-read API requirement, scope, non-goals, and proof. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `task` and `autogoal`; package API pack applied. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is prepared before `create_goal`. |
| Source of truth read before edits | yes | Read `public-state.ts`, editor helper files, and query contract tests. |
| Tracker comments and attachments read | no | N/A: chat task, no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current source/tests are the owner for a narrow active migration packet. |
| TDD decision before behavior change or bug fix | yes | Add/extend behavior contract before relying on implementation. |
| Branch decision for code-changing task | yes | N/A: no branch action requested; work in current checkout. |
| Release artifact decision | yes | N/A: unreleased beta migration cleanup, no changeset requested. |
| Browser tool decision for browser surface | yes | N/A: package runtime API only. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Output budget strategy recorded | yes | Searches scoped to Plite package and exact read APIs. |
| Package/API pack selected | yes | Applied `package-api` pack. |
| Public surface or package boundary identified | yes | Public `editor.read` API behavior in `@platejs/plite`. |
| Release artifact path selected | no | N/A: no published user-visible artifact in this uncommitted beta cleanup. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | yes | No exports or file layout expected. |

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
      is recorded with reason. Boundary: fix Plite public `editor.read` state
      view semantics once, not caller-by-caller try/catch wrappers.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: unreleased cleanup, no artifact.
- [x] Final handoff shape decided: concise changed files, proof, caveat, no PR/tracker.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch action requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no local-env-shaped
      failure occurred; `pnpm check:core` passed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. CWD: `/Users/zbeyens/git/plate-2`; owning
      packages: `@platejs/plite`, `@platejs/core`, `@platejs/plite-dom`,
      `@platejs/plite-react`, `@platejs/table`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: changing read helpers can hide true model bugs.
      Mitigation: safe defaults only for public `editor.read`; static runtime
      helpers and explicit `{ required: true }` remain loud.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: no precommit review
      requested; focused contract tests plus `pnpm check:core` are the closure
      gate for this package API packet.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling files changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Safe default reads; strict mode retained.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason. `pnpm check:core` passed in `/Users/zbeyens/git/plate-2`.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no export/file layout change expected.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check:core` passed; focused query contracts passed; try/catch and `required: true` source audits completed. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Runtime probe before fix showed `nodes.levels`, `nodes.next`, `nodes.previous`, and `points.positions` still unsafe; tests now cover these rows. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused Plite query suite passed: 117 pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm check:core` passed Core + Plite typecheck and type contracts. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or exported file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifests, lockfile, or install graph changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent files changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran in `/Users/zbeyens/git/plate-2`; owning package gate was `pnpm check:core`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: package runtime API only. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser route/UI changed. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset: unreleased beta migration cleanup; no release lane requested. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only plan ledger changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: hiding real model bugs. Boundary: safe defaults only in public `editor.read`; strict and static paths stay loud. Proof: targeted tests + `pnpm check:core`. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no env-rot failure shape. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: not a precommit/review request; package contracts and `check:core` are the proof gate. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm check:core` passed Core/Plite lint; scoped `plite`, `core`, and `table` lint fix passed. `plite-react`/`plite-dom` standalone lint has unrelated existing debt outside touched files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Commands used scoped paths or capped output; `check:core` output was capped/truncated by tool budget. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-safe-read-api-completion.md` | Ready to run after closeout patch. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Source audit confirmed safe defaults live in Plite public state view; static runtime helper wrappers pass `{ required: true }`; no export shape change. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package behavior/type surface in unreleased beta migration lane; no changeset for this checkpoint. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A per current no-changeset migration lane. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No release artifact added: unreleased beta migration cleanup with no release lane requested. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm check:core` passed typecheck, lint, Core tests, Plite tests, and type contracts. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export/file-layout change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plan captured scope and source owners. | implementation |
| Implementation | complete | Safe-read behavior implemented in Plite state view and strict runtime paths preserved. | verification |
| Verification | complete | Focused query contracts, source audit, and `pnpm check:core` passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Plan ledger updated; check-complete ready. | final response |

Findings:
- Public `editor.read` missing-path APIs had more throwy rows than the first patch covered: `nodes.levels`, `nodes.next`, `nodes.previous`, and `points.positions`.
- Safe defaults now cover app-facing missing content reads; malformed paths and explicit strict reads still throw.
- Remaining Plite try/catch sites are runtime lifecycle, transaction rollback, extension/query middleware, DOM/React/browser defensive paths, or transform normalization paths; no `packages/plite/src/editor/*` helper still uses the safe-read shim try/catch pattern.

Decisions and tradeoffs:
- Chosen shape: default public `editor.read` convenience methods are safe for missing content, while `{ required: true }` opts into loud behavior for callers that own the invariant.
- Static/low-level query wrappers in `editor-query-runtime.ts` stay strict by passing `{ required: true }`; runtime/core bugs should still fail loudly.
- No changeset: this is still inside the unreleased Plate/Plite migration lane and the user explicitly does not want changesets for these packets.

Implementation notes:
- Added read option overloads for `nodes.first`, `nodes.leaf`, `nodes.parent`, `points.get/start/end`, and `ranges.get/edges`.
- Centralized safe missing-path handling in `packages/plite/src/core/public-state.ts`.
- Updated strict Core/React/DOM callsites to pass `{ required: true }` where missing data is a bug.
- Changed table grid range lookup to tolerate safe `undefined` from `state.ranges.edges`.

Review fixes:
- N/A: no autoreview requested or run.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm check:core` exposed optional type fallout after safe-read overloads | 1 | Patch strict callsites to pass `{ required: true }` or guard optional results | Resolved; final `pnpm check:core` passed |
| Runtime probe showed more safe-read misses after the first implementation | 1 | Extend state-view helpers beyond initial get/path/above cases | Resolved; probe rows now return safe defaults |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/state-query-contract.ts ./test/upstream-slate-helper-loss-contract.ts ./test/query-extension-contract.ts ./test/query-contract.ts ./test/read-update-contract.ts` passed: 117 pass.
- Runtime probe confirmed missing-path safe defaults for fragment, nodes, points, ranges, and text reads; `ranges.unhang` remains non-throwing and returns the input range.
- `pnpm check:core` passed in `/Users/zbeyens/git/plate-2`: Core + Plite typecheck, type contracts, Core lint, Plite lint, Core tests, and Plite tests (`1008 pass`, `85 skip`, `0 fail`).
- Source audit: `rg` found no leftover try/catch in `packages/plite/src/editor/*`; remaining catches are runtime/DOM/React/lifecycle boundaries.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: chat follow-up, no tracker.
- Confidence line: high; package runtime tests and core gate are green.
- Flow table:
  - Reproduced: tests covered missing-path rows; browser N/A.
  - Verified: focused Plite contracts and `pnpm check:core`; browser N/A.
- Browser check: N/A, package runtime API only.
- Outcome: Public `editor.read` app-facing missing content reads are safe by default; strict reads stay explicit and loud.
- Caveat: Standalone `plite-react`/`plite-dom` lint still has unrelated existing debt outside touched files; `check:core` package lint passed for this closure.
- Design:
  - Chosen boundary: Plite public state view owns safe app-facing read semantics; static/runtime wrappers own strict invariant reads.
  - Why not quick patch: caller try/catch would copy the same mistake and hide inconsistent API semantics.
  - Why not broader change: malformed paths, mutation invariants, transaction rollback, and DOM/browser exception boundaries are not app-facing missing-content reads.
- Verified: focused tests, source/probe audit, `pnpm check:core`.
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
- Browser proof: N/A, no browser surface.
- Caveats: Standalone lint debt in untouched `plite-react`/`plite-dom` files remains outside this packet; `check:core` passed.

Timeline:
- 2026-06-27T10:13:49.334Z Task goal plan created.
- Implemented Plite safe-read overloads and state-view defaults.
- Updated strict Core/React/DOM callsites to use `{ required: true }`.
- Added contract coverage for safe defaults, strict reads, and malformed paths.
- Ran focused Plite query contract suite: 117 pass.
- Ran `pnpm check:core`: pass.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | check-complete, complete goal, final response |
| What is the goal? | Complete Plite safe read APIs while preserving strict reads |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None blocking.
