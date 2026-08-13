# Move Plate CLI transient state outside worktrees

Objective:
Keep Plate CLI transient state out of consumer worktrees; done when recovery/concurrency tests pass and no custom ignore entries remain; plan docs/plans/2026-08-13-move-plate-cli-transient-state-outside-worktrees.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-move-plate-cli-transient-state-outside-worktrees.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Move Plate CLI transient state outside consumer worktrees
- acceptance criteria: no Plate-specific ignore entries; no transient CLI files under consumer source; committed generated contracts stay colocated; crash recovery, last-good rollback, concurrent generation, watch ownership, and no-op publication remain proven.

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
- initial confidence score: N/A: binary proof gates are stronger
- improvement loop: implement, run focused failure/recovery proof, repair findings, then close package and agent-native gates
- final score / loop closure: N/A

Completion threshold:
- `@platejs/cli` creates zero `.plate-*` or `_plate-*` transient files in consumer working trees.
- Root and template Git ignores need zero Plate CLI patterns.
- Existing crash recovery, every-install-index rollback, concurrent invocation,
  watcher ownership, no-op mtime, disposable evaluation, cache fallback, and
  generated-contract tests pass.
- CLI typecheck/build, lint, skill sync, agent-native review, and P2 autoreview pass with zero accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-move-plate-cli-transient-state-outside-worktrees.md` passes.

Verification surface:
- Focused and full `@platejs/cli` tests, including filesystem assertions that transient state remains outside the worktree.
- `pnpm turbo typecheck --filter=./packages/cli`, package build, `pnpm lint:fix`.
- Source audit for `.plate-codegen`, `_plate-codegen`, `.plate-artifacts`, and Plate-only Git-ignore patterns.
- `pnpm install` skill regeneration, agent-native review, P2 autoreview, and final goal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve same-filesystem durable writes, crash-consistent rollback, last-good output, cross-process locks, watcher ownership, and deterministic no-op behavior.
- Do not add a public cache/config option or require Git for ordinary generation.
- Never edit generated `.agents/skills/**/SKILL.md` directly.

Boundaries:
- Source of truth: user correction, `packages/cli` publication owner, root/template Git ignores, `.agents/rules/best-api.mdc`, and `docs/vision/common.md`.
- Allowed edit scope: `packages/cli`, focused tests, root Git ignore, source agent rule plus generated sync, common Vision doctrine, active plan, and existing CLI changeset only if final release prose needs it.
- Browser surface: N/A: Node-only CLI filesystem behavior.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker source.
- Non-goals: public command changes, generated contract filenames, CLI performance redesign, registry/templates, commits, pushes, or PR creation.

Output budget strategy:
- Read exact CLI publication/test ranges and count/search named transient patterns only. Cap test and review output; exclude generated schema JSON, `node_modules`, `.next`, and audit artifacts from broad searches.

Blocked condition:
- Stop only if no writable same-filesystem state location can preserve the existing crash/atomicity laws across supported Git and non-Git projects after three distinct implementation attempts.

Task state:
- task_type: published CLI filesystem-behavior refactor plus reusable agent-rule repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: accepted hard cut: move transient state outside working trees; do not rename it into misleading standard suffixes
- confidence: high
- next owner: task
- reason: consumers should commit only intentional generated contracts and should never maintain tool-specific ignore patterns.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-move-plate-cli-transient-state-outside-worktrees.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, constraints, boundaries, non-goals, verification, and stop condition recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `autogoal`, `task`, `changeset`; prior accepted `best-api` target governs implementation. |
| Active goal checked or created | yes | Created active goal with this plan path. |
| Source of truth read before edits | yes | Read CLI temp/publication owner, root/template Git ignores, VISION/common/Plate doctrine, current CLI plan, and main-baseline package absence. |
| Tracker comments and attachments read | no | N/A: direct request. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused search found no solution owner; current generated-contract and TS7 plans define preserved publication laws. |
| TDD decision before behavior change or bug fix | yes | Add focused filesystem assertions before/with implementation; no fake legacy-removal test. |
| Branch decision for code-changing task | yes | Continue in current checkout under explicit user `go`; no branch/PR requested and no branch inspection needed. |
| Release artifact decision | yes | Existing unreleased `.changeset/generated-editor-contracts.md` already owns the new-from-main CLI; update only if final user-facing prose needs it. |
| Browser tool decision for browser surface | no | N/A: Node-only filesystem behavior. |
| PR expectation decision | no | N/A: user did not request PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact ranges and capped searches/tests only; generated and dependency trees excluded. |
| Package/API pack selected | yes | `package-api` pack covers published CLI behavior and release proof. |
| Public surface or package boundary identified | yes | `@platejs/cli` remains bin-only; only private transient-state placement changes. |
| Release artifact path selected | yes | Existing `.changeset/generated-editor-contracts.md`; no duplicate changeset. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded and main-baseline rule applied. |
| Barrel/export impact decision recorded | yes | No exports or public file layout change expected; `pnpm brl` N/A unless implementation changes that fact. |
| Agent-native pack selected | yes | `best-api` source doctrine changes. |
| Agent-facing action surface identified | yes | `.agents/rules/best-api.mdc` is source; generated `.agents/skills/best-api/SKILL.md` syncs through `pnpm install`. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`, never the generated skill directly. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Must load and run before closeout because agent doctrine changes. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: compiler scratch uses
      OS temp storage, durable publication state uses the artifact filesystem's
      deterministic project `node_modules/.cache`, and committed contracts
      remain beside the editor definition.
- [x] Release artifact requirement recorded: existing CLI changeset owns the unreleased package; update only if user-facing final prose needs it.
- [x] Final handoff shape decided: concise outcome, changed owner, tests/typecheck/build/lint/reviews, browser N/A, no PR/tracker.
- [x] Branch handling recorded for code-changing work: current checkout under explicit user authority; no PR branch requested.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only if failures show unrelated workspace-resolution or mixed-install corruption.
- [x] Workspace authority recorded: `/Users/zbeyens/git/plate-2`, `@platejs/cli`, repo agent-rule generator.
- [x] High-risk note recorded: moving journals/staging can break crash recovery or atomic rename; focused every-index recovery, concurrency, watcher, filesystem-location, and package tests must pass before closeout. The CLI publication owner remains the correct boundary because callers must not manage private state.
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
      implementation work: exact task files copied over a `HEAD` baseline in a
      temporary Git repository because unrelated checkout files exceeded the
      helper's safe local-review input limit.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling:
      required because `best-api` doctrine changed; capability/source/proof map
      closed with no actionable finding.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded: bin-only API unchanged; private filesystem behavior changes inside `@platejs/cli`; no export or barrel change.
- [x] Package/API pack: release artifact matrix is applied: existing `.changeset/generated-editor-contracts.md` owns the complete new-from-main CLI release.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules; the existing major entry is updated without adding a duplicate.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry source changed.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: published CLI behavior does change and the existing changeset covers it.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes: hard cut private `.plate-*` state; command/config/generated filenames stay unchanged.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded below.
- [x] Package/API pack: generated barrels or release notes are updated when required: changeset updated; barrels N/A because exports and exported layout are unchanged.
- [x] Agent-native pack: source-of-truth `.agents/rules/best-api.mdc` was edited instead of the generated skill mirror.
- [x] Agent-native pack: the changed storage law is discoverable in the owning best-api rule and Vision doctrine.
- [x] Agent-native pack: `pnpm install` regenerated `.agents/skills/best-api/SKILL.md`, and source audit proves parity.
- [x] Agent-native pack: agent-native review found no missing human/agent capability or proof path.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | 58/58 CLI tests, typecheck, build, lint, source audits, performance, and diff check pass. |
| Bug reproduced before fix | yes | Record repro | P2 review exposed recursive ancestor watching; focused deep-missing-dependency regression test covers it. |
| Targeted behavior verification | yes | Run focused proof | Deep missing dependency ignores unrelated siblings and recovers when created; focused test passes. |
| TypeScript or typed config changed | yes | Run typecheck | `pnpm turbo typecheck --filter=./packages/cli` passes. |
| Package exports or file layout changed | no | N/A | Internal `state.ts` is bundled through an internal import; public exports/file layout unchanged, so `pnpm brl` is N/A. |
| Package manifests, lockfile, or install graph changed | yes | Install and package checks | `pnpm install`, CLI typecheck/build/test pass. |
| Agent rules or skills changed | yes | Sync generated skill | `pnpm install` passes; best-api source/generated wording matches. |
| Workspace authority proof | yes | Verify owning workspace | All proof ran in `/Users/zbeyens/git/plate-2` against `@platejs/cli`. |
| Browser surface changed | no | N/A | Node-only filesystem and compiler behavior. |
| Browser final proof | no | N/A | No runnable browser surface owns this behavior. |
| CI-controlled template output changed | no | N/A | No template output edited. |
| Package behavior or public API changed | yes | Release artifact | Existing `.changeset/generated-editor-contracts.md` updated. |
| Registry-only component work changed | no | N/A | No registry component work. |
| Docs or content changed | yes | Verify prose | Incidental Vision/changeset claims source-audited; no rendered docs route. |
| High-risk mini gate | yes | Record risk and proof | Same-filesystem atomic publication, crash rollback, concurrency, watch ownership, no-op mtime, check recovery, and private-location assertions pass in the full suite. |
| Agent-native review for agent/tooling changes | yes | Close review | Capability/source/proof map passes; source rule and generated mirror are discoverable. |
| Local install corruption suspected | no | N/A | No mixed-install or resolution-corruption signal. |
| P2 autoreview for non-trivial implementation changes | yes | Pass exact patch review | Final exact-bundle rerun is recorded below after accepted findings were repaired. |
| PR create or update | no | N/A | User did not request PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR/browser proof. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill contract | Completed below. |
| Final lint | yes | Run scoped lint | `pnpm --filter @platejs/cli lint:fix` passes with final formatting applied. |
| Output budget discipline | yes | Audit output | Searches were scoped; one reviewer refusal on unrelated large checkout input was recovered with an exact task bundle. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run goal checker | Run after final P2 result is recorded. |
| Public API / package boundary proof | yes | Audit exports | Public command/config/generated filenames unchanged; storage implementation remains private to CLI. |
| Release artifact classification | yes | Classify | Published CLI filesystem behavior; existing major CLI changeset owns it. |
| Published package changeset | yes | Update changeset | Existing major `@platejs/cli` entry updated; no forbidden core/plite minor. |
| Registry changelog | no | N/A | No registry-only delta. |
| No release artifact | no | N/A | A release artifact is required and present. |
| Package typecheck/build/test | yes | Run checks | 58/58 tests, Turbo typecheck, package build pass. |
| Barrel/export generation | no | N/A | No export or exported-layout change. |
| Agent source / generated sync | yes | Run install | `pnpm install` passes and generated best-api skill matches source. |
| Agent action discoverability | yes | Audit rule path | Storage law appears in best-api source, generated skill, and common Vision. |
| Agent-native review | yes | Close findings | No actionable capability/parity finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Prompt, owner, release, agent, and proof boundaries recorded. | implementation |
| Implementation | completed | Compiler scratch virtual/OS-temp; durable publication state in conventional cache; watcher filtering repaired. | verification |
| Verification | completed | 58 tests, typecheck, build, lint, audits, performance, review. | closeout |
| PR / tracker sync | completed | N/A: neither requested nor linked. | final response |
| Closeout | completed | Final handoff recorded and goal checker is the last gate. | final response |

Findings:
- The old design created `.plate-codegen-*` bundles plus journal, transaction,
  watch, lock, staging, and backup files beside editor definitions/artifacts.
- Product-specific ignore patterns do not belong in consumer repos; crash-safe
  tool state must live in an already-ignored conventional location.
- `origin/main`/`main` has no CLI package; the existing major CLI changeset owns the complete release delta.

Decisions and tradeoffs:
- Keep intentional `editor.generated.ts` and `editor.schema.json` beside source; relocate only private transient state.
- Put compiler bundles in unique OS temp directories and TypeScript inference
  helpers in the TypeScript 7 virtual filesystem.
- Put durable journals, locks, ownership, staging, and rollback data in one
  deterministic project `node_modules/.cache` root on the artifact filesystem.
  Git metadata, user-environment caches, and writable-first selection were
  rejected because concurrent processes can select different roots.
- Preserve all publication laws rather than simplifying the journal during this task.
- Filter missing-dependency ancestor watches to source paths and their ancestor
  chain; recursively watching the nearest existing directory without filtering
  was rejected as a monorepo CPU/file-descriptor regression.

Implementation notes:
- `readDefinition` bundles into a unique `mkdtemp` directory and preserves
  entry-relative `import.meta.url` plus entry-relative module resolution.
- `NativeTypeScriptSession` injects helper source through TS7 host callbacks,
  preserving configured-project and path-alias inference without disk scratch.
- Publication no-op checks and `--check` recovery execute under the same
  artifact locks as writes.
- State placement verifies writable, same-device storage before atomic staging.
- Watchers ignore artifacts/private state and path-filter missing dependency
  ancestors while retaining recovery when nested directories appear.

Review fixes:
- Replaced shared compiler temp directories with unique private `mkdtemp` roots.
- Preserved configured-project inference for virtual helpers.
- Removed dynamic Git/cache root selection to prevent split-brain locks.
- Moved no-op decisions and check recovery under publication gates.
- Preserved source entry `import.meta.url` and relative module resolution.
- Ignored private state roots in watch mode.
- Replaced unrestricted recursive ancestor watches with path-aware filtering and
  added a deep missing-dependency regression test.
- Restored a disposable process boundary for bundled definition evaluation so
  long-lived watch sessions do not retain cache-busted ESM module graphs.
- Select project `node_modules/.cache` canonically from the real project path.
  An unwritable or cross-filesystem canonical root fails clearly instead of
  silently splitting locks.
- Preserved generation `cwd`, explicitly terminates disposable evaluators even
  with live handles, and keeps unlinked editor definitions in their watch sets.
- Canonicalized entry and artifact identities through real paths before output,
  lock, journal, ownership, and batch fingerprints are derived.
- Preserved `import.meta.url`, `dirname`, `filename`, and ESM `resolve` semantics
  while evaluating the bundle outside the worktree.
- Final exact-bundle P2 autoreview: clean, zero actionable findings; overall
  correctness `patch is correct`, confidence 0.87.
- Rejected three reviewer concerns as verified pre-existing shared WIP outside
  this storage task: non-path-alias type-only discovery, failed-editor
  last-good dependency retention, and coarse startup revision metadata.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Virtual helper under `node_modules` joined the wrong inferred TS project | 1 | Use TS7 virtual filesystem beside the logical entry | Configured-project regression passes. |
| Performance fixture under `node_modules` could not resolve workspace imports | 1 | Use standard ignored `apps/www/tmp/cli-performance` | Final 10-run median 6.577s/p95 7.338s, under 12s. |
| Direct local autoreview included an unrelated 1.6 MB registry artifact | 1 | Review exact task files over a temporary `HEAD` baseline | Exact-bundle P2 review runs safely. |
| First watch repair used unrestricted nearest-ancestor recursion | 1 | Filter watched traversal to source candidates/ancestors and test unrelated siblings | Full 52-test suite passes. |

Verification evidence:
- `bun test packages/cli/test/generate.test.ts`: 58 pass, 0 fail, 182 expectations.
- Focused missing-deep-dependency watch regression: 1 pass; unrelated sibling
  does not regenerate and later dependency creation recovers generation.
- `pnpm turbo typecheck --filter=./packages/cli`: 11/11 Turbo tasks pass.
- `pnpm --filter @platejs/cli build`: pass.
- `pnpm --filter @platejs/cli test:performance`: 10-run median 6.577s,
  p95 7.338s, under the 12-second budget.
- `pnpm --filter @platejs/cli lint:fix`: pass; final run applied formatting only.
- `pnpm install`: pass and generated skill sync verified.
- Source audits find no `.plate-codegen`, `_plate-codegen`, `.plate-artifacts`,
  `.plate-cli`, or Plate-only `.gitignore` pattern in the scoped sources.
- `git diff --check HEAD -- <task files>`: pass.
- Browser: N/A, Node-only behavior.
- Agent-native capability map: human and agent both run `plate generate`; source
  owner is `packages/cli`; doctrine owner is best-api source rule; tests/build/
  typecheck and generated-skill audit provide proof. No finding.

Final handoff contract:
- PR line: N/A: not requested.
- Issue / tracker line: N/A: direct request.
- Confidence line: 98%.
- Flow table:
  - Reproduced: old filenames/ignore burden source-audited; unrestricted watch regression reproduced by review/test.
  - Verified: 58 CLI tests plus package/performance proof; browser N/A.
- Browser check: N/A: Node-only CLI filesystem behavior.
- Outcome: only committed generated contracts remain beside source; all private
  compiler/publication/watch state uses standard ignored storage.
- Caveat: canonical project `node_modules/.cache` must be writable and on the
  artifact filesystem; the implementation validates this before publication.
- Design:
  - Chosen boundary: CLI compiler and publication owners.
  - Why not quick patch: renaming scratch files or adding ignore patterns keeps private tool state in product source.
  - Why not broader change: public commands, config, and generated contract names are already correct.
- Verified: exact commands and results listed above; P2 final result below.
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
- Issue / tracker: N/A: direct request.
- Browser proof: N/A: Node-only behavior.
- Caveats: the canonical same-device cache is validated and fails clearly when unwritable; dynamic fallback is forbidden because it would split locks.

Timeline:
- 2026-08-13T08:26:09.885Z Task goal plan created.
- 2026-08-13 Requirements captured; accepted target and verification gates locked before implementation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final review/checker are the last proof gates. |
| Where am I going? | Final response. |
| What is the goal? | Keep every Plate CLI transient outside consumer worktrees with safety parity. |
| What have I learned? | Disposable compiler work belongs in OS temp; durable publication state needs one canonical realpath-derived project cache, never a dynamic fallback. |
| What have I done? | Read owners, created goal/plan, captured the complete accepted contract. |

Open risks:
- Relocating staging files across filesystems could break atomic rename; implementation must select a writable state directory on the same device as artifacts or preserve an equivalent durable replacement law.
- Git worktrees use indirection; resolve the actual Git path rather than assuming `.git` is a directory.
