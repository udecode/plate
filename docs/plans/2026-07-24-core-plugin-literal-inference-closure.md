# Core plugin literal inference closure

Objective:
Restore Core plugin literal-option inference; done when four failures, focused
tests, Core typecheck and exact-file lint pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-core-plugin-literal-inference-closure.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: parent-agent bounded implementation task
- id / link: N/A: no tracker
- title: Core plugin literal inference closure
- acceptance criteria:
  - Fix the four literal-option narrowing errors at
    `internal/plugin/resolvePlugin.spec.ts:24`,
    `internal/plugin/resolvePlugins.spec.tsx:1226`, and
    `lib/plugin/createBasePlugin.spec.ts:677,710`.
  - Diagnose and fix the owning `createBasePlugin` / extension / configure
    generic or API regression.
  - Do not annotate callback parameters explicitly and do not widen tests with
    casts.
  - Preserve C05 hard-cut types and files unless the owning fix genuinely
    requires them.
  - Run Core typecheck, focused create/resolve tests, and lint the exact edited
    files.
  - Report the root cause and exact edits.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact failing-count threshold exists
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- The four named compile errors are absent without callback annotations or test
  casts. If the current checkout reproduces the owner regression, repair it and
  run exact-file lint; otherwise follow the parent's explicit no-speculative-edit
  direction and report current typecheck plus focused test proof. Preserve C05
  hard-cut source.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-core-plugin-literal-inference-closure.md` passes.

Verification surface:
- Reproduce with `pnpm --filter @platejs/core typecheck`.
- Focused Bun tests for the three named spec files.
- Repeat `pnpm --filter @platejs/core typecheck`.
- Exact-file Biome lint on every edited Core source/test file.
- Source audit confirms no explicit callback parameter annotations, test casts,
  C05 file drift, export changes, or unrelated edits.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve C05 hard-cut types and files unless genuinely required.
- Fix inference at its owner; no explicit callback annotations and no test
  casts/widening.
- Do not stage, commit, push, create a PR, or add a standalone changeset.

Boundaries:
- Source of truth: the parent task and the four named current Core type errors.
- Allowed edit scope: owning Core plugin generic/type files and only the named
  specs when stronger compile-time assertions are necessary.
- Browser surface: N/A: compile-time API inference only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: C05 HTML hard-cut implementation, runtime behavior changes,
  callback annotations, test casts, broad plugin API redesign, docs, registry,
  release metadata, git operations, and browser work.

Output budget strategy:
- Read only the four failing ranges and exact owning generic declarations.
  Cap typecheck/test output and use targeted `rg` by symbol; exclude generated
  output, templates, node_modules, build artifacts, and unrelated packages.

Blocked condition:
- Stop only if all four failures cannot be reproduced or the owning repair
  necessarily conflicts with active C05 hard-cut edits and no non-overlapping
  type owner exists.

Task state:
- task_type: compile-time generic/API regression
- task_complexity: normal, bounded
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: non-reproducible in the current shared checkout
- confidence: high
- next owner: root
- reason: Core typecheck and all three focused specs pass; root explicitly
  confirmed no owner-generic edit and directed no speculative patch.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-core-plugin-literal-inference-closure.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All parent requirements copied into Task source, threshold, constraints, boundaries, and verification |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `task`, `typescript-advanced-types`, and required `autogoal` read before implementation |
| Active goal checked or created | yes | `get_goal` returned null; goal created with this plan |
| Source of truth read before edits | yes | Parent task names all four failing locations and proof commands |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read `docs/solutions/test-failures/core-type-tests-need-built-exports.md`; it covers package-export resolution, not the reported source-first literal narrowing failures |
| TDD decision before behavior change or bug fix | yes | Existing four compile-time specs are the red-capable regression; add only an owner type assertion if they do not cover the fix |
| Branch decision for code-changing task | no | N/A: parent assigned work in the shared active checkout; no branch operation authorized |
| Release artifact decision | yes | No standalone artifact: repair belongs to the active Core/C05 release packet |
| Browser tool decision for browser surface | no | N/A: compile-time-only |
| PR expectation decision | no | N/A: no PR authorization |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact files/symbols and capped command output only |
| Package/API pack selected | yes | `package-api` protects public plugin type inference |
| Public surface or package boundary identified | yes | `@platejs/core` plugin authoring generic and literal option inference |
| Release artifact path selected | no | N/A: no standalone changeset; active Core/C05 packet owns release metadata |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset edit in this bounded task |
| Barrel/export impact decision recorded | yes | No file/export movement expected; rerun `pnpm brl` only if that changes |

Work Checklist:
- [x] N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording.
- [x] Nearby repo instructions and the exact `createBasePlugin`, `configure`,
      `extend`, and option-inference declarations were read before any possible
      source edit.
- [x] N/A: no implementation. The failure did not reproduce, and root explicitly
      directed no speculative owner-generic patch.
- [x] Release artifact requirement recorded: active Core/C05 packet owns release
      metadata; no standalone artifact.
- [x] Final handoff shape decided: concise root cause, exact edits, exact proof,
      and constraints preserved; no PR or tracker work.
- [x] Branch handling recorded: N/A, shared parent checkout and no git
      authorization.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only
      for unrelated missing-module or mixed-install signals.
- [x] Workspace authority recorded: all proof runs in
      `/Users/zbeyens/git/plate-2`, owned by `@platejs/core`.
- [x] High-risk note: option literals may become incorrectly widened or frozen
      after `.extend*()` / `.configure()`; prove all four call shapes plus Core
      typecheck and fix the owning generic.
- [x] N/A: no implementation diff exists, so autoreview would have no bounded
      task-owned source patch to review.
- [x] Agent-native review N/A: no agent or tooling file is in scope.
- [x] Output budget discipline recorded: exact symbol/file reads only; one
      accidental broad docs hit is recorded below with a bounded recovery.
- [x] Package/API pack: public `@platejs/core` plugin authoring type inference; no export/file movement; release metadata remains in active Core/C05 packet.
- [x] Package/API pack: no standalone changeset or registry changelog; active Core/C05 release packet owns the type correction.
- [x] N/A: no `.changeset` work in this bounded task.
- [x] N/A: not registry work.
- [x] Package/API pack: no separate artifact because this repairs the already-active Core/C05 public type packet rather than adding an independent user feature.
- [x] Package/API pack: preserve the hard-cut public shape and repair inference only; no compatibility alias or broader migration.
- [x] Package/API pack: Core typecheck and 88 focused create/resolve tests pass.
- [x] Package/API pack: N/A, no export, file-layout, barrel, or release-note
      change was made.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named package and focused proof | Core typecheck passed; 88/88 focused tests passed |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: current Core typecheck passed before any source edit; parent narrowed closure to non-reproduction proof |
| Targeted behavior verification | yes | Run focused test/proof | 88 tests across the three named specs passed with 227 assertions |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A for task-owned edits; Core typecheck still passed |
| Package exports or file layout changed | no | Run `pnpm brl` when required | N/A: no source or export edit |
| Package manifests, lockfile, or install graph changed | no | Run install/package checks when required | N/A: no manifest or install edit |
| Agent rules or skills changed | no | Run skill sync when required | N/A: no agent-rule or skill edit |
| Workspace authority proof | yes | Verify in owning workspace/package | Both commands ran in `/Users/zbeyens/git/plate-2` against `@platejs/core` |
| Browser surface changed | no | Capture browser proof when required | N/A: compile-time and unit-test surface only |
| Browser final proof | no | Attach browser proof when applicable | N/A: no browser surface |
| CI-controlled template output changed | no | Restore or justify | N/A: no template output edit |
| Package behavior or public API changed | no | Add changeset or justify | N/A: no Core source edit by this task |
| Registry-only component work changed | no | Update registry changelog when required | N/A: no registry work |
| Docs or content changed | yes | Verify incidental plan content | This source-backed goal ledger is the only task-owned file |
| High-risk mini gate | yes | Record failure mode and proof | Literal widening/freezing risk was checked with the full Core typecheck and focused call-site tests; no patch was justified |
| Agent-native review for agent/tooling changes | no | Review agent changes when required | N/A: no agent/tooling edit |
| Local install corruption suspected | no | Reinstall once when matching signals appear | N/A: both commands passed without install errors |
| Autoreview for non-trivial implementation changes | no | Review a bounded implementation diff | N/A: no implementation patch |
| PR create or update | no | Run checks and sync body when authorized | N/A: no PR authorization |
| Task-style PR body verified | no | Verify PR body when applicable | N/A: no PR |
| PR proof image hosting | no | Host proof when required | N/A: no PR or browser image |
| Tracker sync-back | no | Sync tracker when applicable | N/A: no tracker |
| Final handoff contract | yes | Fill exact handoff fields | Filled below with non-reproduction result and proof |
| Final lint | no | Run scoped lint when files are edited | N/A: no Core source/test edit; running write lint would mutate concurrent work |
| Output budget discipline | yes | Record accidental output and recovery | One broad docs hit is recorded; recovery excluded raw artifacts and capped output |
| Timed checkpoint | no | Close requested duration | N/A: no duration requested |
| Goal plan complete | yes | Run the goal checker | Passed |
| Public API / package boundary proof | yes | Audit current owner types and exports | Exact create/configure/extend declarations read; Core contract/typecheck passes; no task-owned surface change |
| Release artifact classification | yes | Classify the task delta | No published delta from this task because no Core source changed |
| Published package changeset | no | Add when users receive a package delta | N/A: no package delta from this task |
| Registry changelog | no | Add for registry-only work | N/A: no registry work |
| No release artifact | yes | Record exact reason | No task-owned user-visible or package delta |
| Package typecheck/build/test | yes | Run owning package checks | Core typecheck passed; 88 focused tests passed |
| Barrel/export generation | no | Run `pnpm brl` when required | N/A: no exports or exported file layout changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirements, exact call sites, owner declarations, and one relevant solution note read | verification |
| Implementation | complete | N/A: no failure reproduced; root prohibited speculative source edits | verification |
| Verification | complete | Core typecheck and 88 focused tests pass | closeout |
| PR / tracker sync | complete | N/A: neither authorized nor applicable | closeout |
| Closeout | complete | plan resolved for final checker | final response |

Findings:
- The reported four literal-option errors do not exist in the current checkout:
  `pnpm --filter @platejs/core typecheck` passed before any task-owned source
  edit.
- All three named spec files pass together: 88 tests, 227 assertions, zero
  failures.
- Root confirmed it did not repair the `createBasePlugin` generic after
  delegation and directed no speculative edit. Concurrent shared-checkout
  declarations/build state is the only supported explanation; no persistent
  owner regression can be diagnosed from a green compiler.

Decisions and tradeoffs:
- Do not manufacture a generic change when both the owning typecheck and focused
  tests are green. This avoids destabilizing the active C05/C08 work for an
  unobservable failure.
- Exact-file lint is N/A because this task made no Core source/test edit; a
  write-mode formatter could interfere with concurrent work.

Implementation notes:
- No Core implementation or test file was edited.
- The task-owned edit is this goal ledger only.

Review fixes:
- N/A: no implementation diff exists.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` crossed `docs/research/raw` and emitted a huge embedded TypeScript source line | 1 | Exclude `raw/**`, restrict to Markdown, cap matches/output | Recovery search returned one bounded solution note; read and classified as unrelated to literal inference |
| Goal checker found `Closeout=in_progress` | 1 | Resolve the closeout phase after all evidence is recorded, then rerun | Closeout marked complete |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` — pass, exit 0.
- `bun test ./packages/core/src/internal/plugin/resolvePlugin.spec.ts ./packages/core/src/internal/plugin/resolvePlugins.spec.tsx ./packages/core/src/lib/plugin/createBasePlugin.spec.ts`
  — 88 pass, 0 fail, 227 assertions.
- Core lint — N/A: no Core source/test file was edited.
- Source constraints — preserved by making no source edit: no callback
  annotation, cast, C05 hard-cut change, export change, barrel update, or
  changeset.

Final handoff contract:
- PR line: N/A: no PR authorized or created
- Issue / tracker line: N/A: no tracker
- Confidence line: high confidence in current green state; no supported
  persistent root-cause claim
- Flow table:
  - Reproduced: compile failure did not reproduce; browser N/A
  - Verified: Core typecheck pass; 88/88 focused tests pass; browser N/A
- Browser check: N/A: compile-time/unit surface only
- Outcome: current Core literal-option inference compiles and focused behavior
  passes; no source patch made
- Caveat: the transient failing state was not captured, so attributing an owner
  generic root cause would be speculation
- Design:
  - Chosen boundary: current `createBasePlugin` / `extend` / `configure` type
    surface, verified without mutation
  - Why not quick patch: no red compiler or focused test exists to prove it
  - Why not broader change: broader API work is outside scope and would risk
    active concurrent Core work
- Verified: Core typecheck plus all three focused specs
- PR body verified: N/A: no PR

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
- Caveats: transient shared-checkout failure not captured; no persistent owner
  regression found

Timeline:
- 2026-07-24T19:04:19.411Z Task goal plan created.
- 2026-07-24 Source search recovered with raw research excluded; the only
  matching solution note concerns built package exports, not this inference
  regression.
- 2026-07-24 Core typecheck passed before any source edit.
- 2026-07-24 Root confirmed no generic repair and directed no speculative edit.
- 2026-07-24 Focused create/resolve suite passed 88/88 with 227 assertions.
- 2026-07-24 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final checker, goal completion, parent handoff |
| What is the goal? | Restore Core plugin literal-option inference and close the four named failures with package proof |
| What have I learned? | Current Core inference is green; the reported transient failure has no reproducible owner regression |
| What have I done? | Read exact owners, passed Core typecheck, passed 88 focused tests, avoided speculative edits |

Open risks:
- The original transient compiler output is unavailable, so its precise
  shared-checkout timing cause cannot be proven.
