# unified extend list hard cut

Objective:
Prove unified `.extend()` in `packages/list/src/lib/BaseListPlugin.tsx` only; done when its four specialized usages are gone with no type, declaration, runtime, or browser regression.

Goal plan:
docs/plans/2026-07-24-unified-extend-list-hard-cut.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user correction in the active API-design task
- id / link: N/A
- title: unified extend packages/list canary
- acceptance criteria:
  - `packages/list/src/lib/BaseListPlugin.tsx` uses repeated `.extend()` for
    plugin API, update, and editor-extension stages.
  - Remove only the two `.extendApi`, one `.extendTx`, and one named
    `.extendExtension` usages in that file.
  - Keep every specialized Core builder and every usage outside that file.
  - Stop and retain the specialized builders if unified `.extend()` cannot
    preserve current inferred editor/plugin/transaction contracts without
    casts, `any`, callback parameter annotations, `satisfies`, or ferry types.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; no timed request
- initial confidence score: N/A; exact binary source/type/runtime gates exist
- improvement loop: migrate capability families, typecheck, repair owner
  generic, then delete surface and prove zero matches
- final score / loop closure: N/A; close only on exact gates

Completion threshold:
- Zero `.extendApi`, `.extendTx`, or `.extendExtension` builder usages remain
  in `packages/list/src/lib/BaseListPlugin.tsx`.
- No file outside that owner changes for this canary except this plan.
- `@platejs/list` source-first typecheck, package tests, declaration build,
  scoped lint, Browser proof, autoreview, and goal checker pass or any
  pre-existing/shared failure is exact old/new A/B classified.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unified-extend-list-hard-cut.md` passes.

Verification surface:
- Scoped `rg` audit for the four removed usages in the one file.
- `@platejs/list` source-first typecheck, tests, and declaration build.
- Browser `/blocks/playground-demo` list interaction plus console/network
  inspection; `/blocks/list-classic-demo` remains the prior canary.
- Scoped Biome, final autoreview, and goal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- No compatibility aliases, deprecated builders, forwarding wrappers, casts,
  `any`, explicit callback parameter annotations, `satisfies` patches, or
  helper/config types created only to ferry inference.
- Preserve shared WIP, every Core builder, every outside usage, and existing
  codec-specific builders.

Boundaries:
- Source of truth: the full 1,741-line list owner and already-proven unified
  Core builder contract.
- Allowed edit scope: only
  `packages/list/src/lib/BaseListPlugin.tsx` and this plan.
- Browser surface: `/blocks/playground-demo` using `ListKit`.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; direct local request.
- Non-goals: Core API deletion, any other package/caller migration, skill/rule
  edits, codec builder consolidation, git/PR actions, and unrelated repairs.

Output budget strategy:
- Read the one complete owner and use scoped searches/tests only. Exclude
  unrelated packages, generated output, and shared diffs.

Blocked condition:
- Stop and restore the four usages if the package type/declaration contract
  regresses and cannot be repaired in the existing unified Core generic without
  a workaround; do not begin a hard cut.

Task state:
- task_type: one-file inference canary
- task_complexity: normal
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Current verdict:
- verdict: migrate only the four package/list usages
- confidence: high; list-classic already proved the same own API/update/raw
  extension route
- next owner: `packages/list/src/lib/BaseListPlugin.tsx`
- reason: newest user correction explicitly forbids the hard cut

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unified-extend-list-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Newest correction narrows work to four usages in one file, forbids hard cut, and retains the stop-on-type-regression rule |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded autogoal, hard-cut, plate-plugin-creator plus its three required rules, and changeset |
| Active goal checked or created | yes | Goal `019f89e5-1b47-7f02-b27b-293bbd49566d` created for this exact plan |
| Source of truth read before edits | yes | Read full 1,741-line list owner plus Core unified/specialized types and runtime owners |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read Core type-test build/export solution; migration must update its stale specialized-builder example |
| TDD decision before behavior change or bug fix | yes | No behavior change; existing list tests/type/declaration are preservation gates |
| Branch decision for code-changing task | no | N/A: no git/PR action requested |
| Release artifact decision | no | N/A: internal authoring-call migration with no package consumer delta |
| Browser tool decision for browser surface | yes | Browser plugin on `/blocks/playground-demo`; no native Chrome surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Count/list-first AST audit and bounded failed-owner reads recorded above |
| Package/API pack selected | yes | Package declaration inference is the risk even though public Core surface stays unchanged |
| Public surface or package boundary identified | yes | `@platejs/list` emitted plugin/editor contracts must remain identical |
| Release artifact path selected | no | N/A: no published delta from main |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset |
| Barrel/export impact decision recorded | yes | No file/export topology expected; run `pnpm brl` only if final diff changes generated exports |
| Browser pack selected | yes | Package source changes require browser proof |
| Browser route / app surface identified | yes | `/blocks/playground-demo`, registry `ListKit` |
| Browser tool decision recorded | yes | In-app Browser |
| Console/network caveat policy recorded | yes | Record every error and A/B any failure that overlaps known shared list/schema baseline |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A, no published delta.
- [x] Final handoff shape decided: hard-cut outcome, exact source audit,
      type/runtime/declaration/browser proof, baseline caveats, no PR/tracker.
      Bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A, no git action.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command runs in
      `/Users/zbeyens/git/plate-2` or its package/browser owner.
      Every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: staged API/update/extension declaration
      inference can regress even when runtime behavior is unchanged.
      Public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected: dirty local current checkout, accept
      only current-line findings for Core builders and migrated callers.
- [x] Agent-native review decision recorded: N/A, no agent source may change.
      `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: `@platejs/list` declaration-inference impact recorded; Core API remains unchanged.
- [x] Package/API pack: release artifact matrix selects N/A because final public behavior/types remain unchanged.
- [x] Package/API pack: changeset work is N/A.
- [x] Package/API pack: registry-only rule is N/A; this changes package source.
- [x] Package/API pack: no artifact because consumer-facing editor/plugin behavior and types remain unchanged.
- [x] Package/API pack: hard cut is explicitly forbidden in this canary.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: `/blocks/playground-demo`; focus a paragraph, apply list
      toggle, verify list DOM and no new console/network error.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unified-extend-list-hard-cut.md` | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Full 1,741-line list owner, Core unified/specialized types/runtime, plugin rules, and 644-call count | Core contract |
| Scope correction | complete | User explicitly said no hard cut; reverted the only out-of-scope Core type-test edit | one-file migration |
| One-file migration | in_progress | Four exact specialized usages identified | verification |
| Verification | pending | | closeout |
| PR / tracker sync | N/A | No PR or tracker requested | closeout |
| Closeout | pending | | final response |

Findings:
- `packages/list/src/lib/BaseListPlugin.tsx` contains two `.extendApi`, one
  `.extendTx`, and one named `.extendExtension`; these were missed because the
  previous packet deliberately stopped at the list-classic canary.
- A broad audit found many outside usages, but the newest correction makes
  every one of them out of scope. No Core or skill source may change.
- This list owner needs only plugin-scoped API, own update, and a named raw
  extension. The previous list-classic canary already proved those unified
  runtime destinations; package-specific declaration inference remains the
  decisive gate.

Decisions and tradeoffs:
- Newest user scope wins: prove only this second canary and leave the dual
  builder surface intact.
- Convert the named extension to unified `extension` with `key: 'behavior'`;
  this preserves its normalized runtime identity without touching Core.
- If package type/declaration output regresses, restore the four usages and
  report the exact missing generic. No local workaround.

Implementation notes:
- Perform four direct structural edits in the one file; no codemod and no
  outside edits.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-07-24T21:55:15.573Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
