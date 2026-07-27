# migrate five manual plugin generics

Objective:
Migrate exactly five redundant production plugin generics; done when all five
infer exact package declarations and owning checks pass; plan
docs/plans/2026-07-27-migrate-five-manual-plugin-generics.md.

Goal plan:
docs/plans/2026-07-27-migrate-five-manual-plugin-generics.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- package-api (docs/plans/templates/packs/package-api.md)

Task source:

- type: plain user request continuing the completed manual-generics audit
- id / link: N/A: no tracker
- title: Migrate five manual plugin generics
- acceptance criteria: migrate exactly five production usages, use inference
  instead of output shadow contracts, prove the result works, and make no sixth
  source migration

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
- initial confidence score: N/A: exact five-call and command threshold
- improvement loop: run typecheck/declaration emit after the five-call slice;
  repair only those five owners if inference regresses
- final score / loop closure: N/A: exact source audit and pass gates

Completion threshold:

- Exactly these five explicit output contracts are removed, with owned domain
  inputs typed locally where inference needs them:
  1. `packages/list/src/lib/BaseListPlugin.tsx` final `.extend<T>`
  2. `packages/core/src/lib/plugins/dom/DOMPlugin.ts` final `.extend<T>`
  3. `packages/media/src/react/placeholder/PlaceholderPlugin.tsx` API/selectors
     `.extend<T>`
  4. the same Placeholder owner's update `.extend<T>`
  5. `packages/media/src/lib/media/MediaPlugin.internal.ts`
     `defineMediaPlugin` inner `.extend<T>`
- No sixth production generic usage is migrated.
- Core, List, and Media source-first typechecks and declaration builds pass,
  with focused source/declaration checks proving no `any` or lost keyed
  capability.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-migrate-five-manual-plugin-generics.md` passes.

Verification surface:

- Before/after declaration emit for Core, List, and Media.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/list
--filter=./packages/media`.
- Focused package tests where an owning descriptor test exists.
- Targeted Biome check on the four source files.
- Exact AST/source audit proving five and only five contracts disappeared.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve runtime behavior and exported capability types.
- Do not add casts, `any`, callback-context annotations, or replacement
  aggregate output aliases.
- Preserve all concurrent shared-checkout work outside the exact five callsites.

Boundaries:

- Source of truth: the completed
  `docs/analysis/manual-plugin-generics-audit.md`, current Core builder types,
  and the four live package files named above.
- Allowed edit scope: the four source files above plus this plan. A changeset is
  allowed only if declaration proof shows a published user-visible delta.
- Browser surface: List, Media, and block-placeholder standalone demos.
- Browser strategy: render each package-facing demo and inspect console errors.
- Tracker sync: N/A: no tracker.
- Non-goals: no constructor/config generic migration, no capability-ferry
  migration, no sixth `.extend<T>`, no Core builder redesign, no docs/API
  rewrite, no export/file-layout change, no git/PR operation.

Output budget strategy:

- Read only the four owners and relevant Core declaration types; cap searches
  by exact files/patterns; keep declaration snapshots in `/tmp`; run only
  owning-package checks.

Blocked condition:

- Stop if any selected contract cannot preserve exact inferred declarations
  without a Core builder redesign, a cast/`any`, or migration of a sixth
  source usage.

Task state:

- task_type: bounded type/API refactor
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: migrate the five safest audited output contracts
- confidence: high before proof; List/DOM are direct inference and Media's
  generic factory already passed an isolated declaration probe
- next owner: task
- reason: this slice tests constructor, staged descriptor, and generic factory
  inference without broad adoption

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-migrate-five-manual-plugin-generics.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact-five ceiling, proof intent, and non-goals recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `best-api`, and `changeset` read; no broader migration owner needed |
| Active goal checked or created | yes | `get_goal` returned none; creation follows this filled plan |
| Source of truth read before edits | yes | Audit plus all four live owners and package manifests read |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused inference/generic search returned no solution owner |
| TDD decision before behavior change or bug fix | no | N/A: behavior-neutral type refactor; declaration/type proof is the regression surface |
| Branch decision for code-changing task | no | N/A: user requested current shared checkout; no git operation |
| Release artifact decision | yes | No changeset if emitted public declarations remain equivalent; add one only if proof shows a user-visible delta from `main` |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: user did not request a PR |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact-file reads/searches and owning-package commands only |
| Package/API pack selected | yes | Package declaration inference is the dominant risk |
| Public surface or package boundary identified | yes | Core, List, and Media emitted plugin descriptors |
| Release artifact path selected | no | N/A expected: authoring-only generic deletion with equivalent emitted public types; declaration proof decides |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded for release classification; no artifact unless declarations expose a user-visible delta |
| Barrel/export impact decision recorded | no | N/A: no export or file-layout changes |

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
| Named verification threshold | yes | Run named proof | Exactly five removed; four production `.extend<T>` remain |
| Bug reproduced before fix | no | N/A | N/A: behavior-neutral authoring-type cleanup |
| Targeted behavior verification | yes | Run focused proof | 150 tests pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | Core/List/Media 16/16 tasks pass |
| Package exports or file layout changed | no | N/A | N/A: no export/layout change |
| Package manifests, lockfile, or install graph changed | no | N/A | N/A: untouched |
| Agent rules or skills changed | no | N/A | N/A: untouched |
| Workspace authority proof | yes | Use owning checkout | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Verify package-facing behavior | Three standalone demos rendered |
| Browser final proof | yes | Inspect routes and console | List, Media, Placeholder: one editor each, zero errors |
| CI-controlled template output changed | no | N/A | N/A: untouched |
| Package behavior or public API changed | no | Classify release impact | Equivalent emitted contracts; no runtime delta |
| Registry-only component work changed | no | N/A | N/A: untouched |
| Docs or content changed | yes | Verify plan | Task ledger formatted and checked |
| High-risk mini gate | yes | Prove package types | Declaration emit plus exact compile proof passed |
| Agent-native review for agent/tooling changes | no | N/A | N/A: no agent tooling changes |
| Local install corruption suspected | no | Rerun isolated failure | Parallel slow-test resolution collision passed alone; reinstall unnecessary |
| Autoreview for non-trivial implementation changes | yes | Run scoped local review | Final review clean, no findings |
| PR create or update | no | N/A | N/A: user did not request PR |
| Task-style PR body verified | no | N/A | N/A: no PR |
| PR proof image hosting | no | N/A | N/A: no PR |
| Tracker sync-back | no | N/A | N/A: no tracker |
| Final handoff contract | yes | Fill fields | Filled below |
| Final lint | yes | Run scoped equivalent | Biome checked four source files |
| Output budget discipline | yes | Record exceptions | Two compile-probe attempts and one browser snapshot were noisy; recovery recorded |
| Timed checkpoint | no | N/A | N/A: no duration requested |
| Goal plan complete | yes | Run checker | Final checker command recorded below |
| Public API / package boundary proof | yes | Audit declarations | Mutual assignability and no-`any` proof pass |
| Release artifact classification | yes | Classify | No published user-visible delta |
| Published package changeset | no | N/A | N/A: equivalent authoring declarations |
| Registry changelog | no | N/A | N/A: no registry-only change |
| No release artifact | yes | Record reason | No runtime or externally observable type delta from these five removals |
| Package typecheck/build/test | yes | Run owning checks | All named checks pass |
| Barrel/export generation | no | N/A | N/A: no exports/layout changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Exact five owners and Core types read | done |
| Implementation | complete | Five generics removed; no sixth | done |
| Verification | complete | Type/build/test/declaration/browser proof | done |
| PR / tracker sync | complete | N/A: neither requested | done |
| Closeout | complete | Autoreview clean; ledger checker next | final response |

Findings:

- Inference preserves the five old output contracts when domain inputs remain
  typed at their owning methods.
- A structural `(...args: any[])` witness leaked into the Media helper
  declaration path. `never[]` expresses "some callable" without weakening the
  exported declaration with direct `any`.

Decisions and tradeoffs:

- Keep exactly four remaining production `.extend<T>` usages for later work.
- Keep Media's lightweight structural input witness. Direct `BasePlugin<C>` and
  `Pick<BasePluginMethods<C>, 'extend'>` constraints trigger TS2589 at Audio,
  File, and Video callers.
- No changeset: these five changes are runtime-erased and the emitted capability
  contracts are mutually assignable with the previous contracts.
- No barrel run: exports and file layout are unchanged.

Implementation notes:

- Removed one List, one DOM, two Placeholder, and one Media factory output
  contract.
- Typed only genuine domain inputs at their methods; inferred output groups
  remain readonly and key-correlated.

Review fixes:

- Accepted P2: replaced Media's direct `any[]` callable witness with `never[]`.
- Final scoped `autoreview --mode local --engine codex --thinking high` returned
  no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Compile proof inherited root include/source paths | 2 | Use dist-only paths and empty include | Exact proof passed |
| Slow test path omitted leading `./` | 1 | Use explicit relative path | 63/63 passed |
| Direct `BasePlugin<C>` Media constraint | 1 | Avoid recursive full descriptor constraint | TS2589 removed |
| `Pick<BasePluginMethods<C>, 'extend'>` constraint | 1 | Keep lightweight callable witness | TS2589 removed |
| Slow List test raced parallel workspace builds | 1 | Rerun after build completed | 63/63 passed |
| Browser navigation timeout/full snapshot overflow | 2 | Inspect bounded DOM facts | Three demos proved clean |

Verification evidence:

- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/list
--filter=./packages/media`: 16/16 tasks pass.
- `pnpm --filter @platejs/core build`, `pnpm --filter @platejs/list build`, and
  `pnpm --filter @platejs/media build`: pass.
- Focused Core/List/Media tests: 87/87 pass.
- `bun test ./packages/list/src/lib/BaseListPlugin.slow.tsx`: 63/63 pass.
- Temporary dist-only TypeScript proof: exact mutual assignability and no-`any`
  assertions pass for List, DOM, Placeholder, and all five Media descriptors.
- `pnpm exec biome check` on the four source owners: pass.
- Targeted source audit finds zero `.extend<T>` in the four owners and exactly
  four remaining production usages elsewhere: Suggestion, Comment, Base Link,
  and React Link.
- Browser:
  - `/blocks/list-demo`: editor and list content rendered.
  - `/blocks/media-demo`: editor and Image/Upload/Embed content rendered.
  - `/blocks/block-placeholder-demo`: editor and placeholder content rendered.
  - All three logged zero console errors.

Final handoff contract:

- PR line: N/A: not requested.
- Issue / tracker line: N/A: none.
- Confidence line: high; all named gates pass.
- Flow table:
  - Reproduced: N/A: behavior-neutral type cleanup.
  - Verified: 150 tests, three-package typecheck/builds, exact declarations,
    Biome, source audit, and three browser demos.
- Browser check: List, Media, and Placeholder demos render with zero errors.
- Outcome: exactly five manual output generics removed; no sixth.
- Caveat: four production `.extend<T>` usages intentionally remain.
- Design:
  - Chosen boundary: infer each contribution from its owner callback.
  - Why not quick patch: callback annotations or casts would hide builder
    inference failures.
  - Why not broader change: user explicitly capped this probe at five.
- Verified: all completion evidence above.
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
- Issue / tracker: N/A: none.
- Browser proof: three standalone demos, zero errors.
- Caveats: four production manual output generics remain for a later batch.

Open risks:

- None for this five-call slice.

Timeline:

- 2026-07-27T10:07:15.838Z Task goal plan created.
- 2026-07-27T10:28:16Z Final scoped autoreview clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response |
| What is the goal? | Migrate exactly five redundant plugin output generics and prove inference |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- Pending.
