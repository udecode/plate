# Hard cut Plop package generator

Objective:
Hard-cut Plop package generation; done when scripts/dependencies/docs/rules/
lockfiles have zero live matches and checks pass.

Goal plan:
docs/plans/2026-08-17-hard-cut-plop-package-generator.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user hard-cut instruction
- id / link: N/A
- title: Remove all Plop and `gen:package` legacy tooling
- acceptance criteria: zero live `plop`, `gen:package`, or `plopfile` matches in
  owned source/config/lockfiles; no aliases or replacement generator; install,
  lint, agent-native review, P2 autoreview, and plan checker pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A: binary zero-match gate
- improvement loop: sweep exact names and dependency graph after each deletion
- final score / loop closure: N/A: close on zero matches and green proof

Completion threshold:
- Remove the root command, Plop dependency, lockfile records, docs/rules, tests,
  comments, and aliases; preserve no replacement or deprecation path.
- Exclude immutable historical changelogs only when they merely record past
  releases and are not executable/current teaching.
- `pnpm install`, manifest/install checks, lint, zero-match audits,
  agent-native review, P2 autoreview, and goal checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-hard-cut-plop-package-generator.md` passes.

Verification surface:
- Scoped and repo-wide `rg` audits for `plop`, `gen:package`, and `plopfile`.
- `pnpm install`, `pnpm test:manifests`, relevant root script/config checks,
  `pnpm lint:fix`, `git diff --check`, agent-native map, and P2 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- No replacement scaffolder, alias, warning stub, migration bridge, or
  deprecated command.
- Do not rewrite immutable package changelogs solely to erase historical facts.

Boundaries:
- Source of truth: root `package.json`, workspace lockfiles, tooling/config,
  current docs, `.agents/rules/**`, and their generated skill mirrors.
- Allowed edit scope: every live match plus generated mirrors/lockfiles changed
  by the owning install/sync command and this goal plan.
- Browser surface: N/A: developer tooling hard cut.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A.
- Non-goals: package creation replacement, package source behavior, registry UI,
  public package APIs, commits, pushes, or PRs.

Output budget strategy:
- Count/file-list matches first, exclude `node_modules`, caches, generated
  build output, and git internals; inspect only live source/config and immutable
  historical matches that require classification.

Blocked condition:
- Block only if a live Plop dependency is required by another authorized
  workflow and removing it would break a distinct supported command with no
  user-approved direction.

Task state:
- task_type: tooling hard cut
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: delete all executable/current Plop surfaces; preserve historical
  changelog facts only
- confidence: high
- next owner: root tooling/config
- reason: the command already points at a nonexistent file and the user rejects
  the entire legacy concept.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-hard-cut-plop-package-generator.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Hard-cut every live Plop/gen-package surface with no replacement. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `hard-cut` and `agent-native-reviewer` loaded; autogoal lifecycle active. |
| Active goal checked or created | yes | Goal points to this plan. |
| Source of truth read before edits | yes | Root instructions establish source/generated boundaries and install rules. |
| Tracker comments and attachments read | no | N/A. |
| Video transcript evidence required | no | N/A. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Will classify focused live/historical matches before deletion. |
| TDD decision before behavior change or bug fix | no | N/A: delete dead tooling; zero-match and manifest checks are stronger. |
| Branch decision for code-changing task | no | N/A: no branch/commit requested. |
| Release artifact decision | no | N/A: root developer tooling, not a published package delta. |
| Browser tool decision for browser surface | no | N/A. |
| PR expectation decision | no | N/A. |
| Tracker sync expectation decision | no | N/A. |
| Output budget strategy recorded | yes | Count/list first, inspect classified live matches only. |
| Agent-native pack selected | yes | Removes an agent/user-facing root command and may touch skills. |
| Agent-facing action surface identified | yes | Package scaffolding command and any current teaching/routing references. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate mirrors with `pnpm install` if touched. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded in preceding skill-doctrine task and still in active context; capability map required. |

Work Checklist:
- [x] N/A: no duration requested; binary zero-match gates apply.
- [x] First checkpoint captured scope, no-replacement rule, historical exclusion,
      proof, non-goals, stop condition, and handoff before implementation.
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition are concrete.
- [x] Task source is classified as a root tooling hard cut with no browser/tracker/package API surface.
- [x] N/A: no video or screen recording.
- [x] Root instructions, hard-cut law, root scripts, contributor teaching, lockfiles, and focused solution/docs matches were read.
- [x] Deleted the two live owners instead of adding aliases or replacement tooling.
- [x] N/A: root developer tooling has no package changeset or registry changelog.
- [x] Final handoff reports deletion, zero-match proof, unrelated manifest caveat, and reviews.
- [x] N/A: no branch/commit requested.
- [x] N/A: no environment corruption signal.
- [x] All proof ran in `/Users/zbeyens/git/plate-2`.
- [x] Command-contract risk is stale discoverability; zero source/script/lock matches prove removal.
- [x] P2 autoreview used an isolated two-file bundle plus exact absence evidence.
- [x] Agent-native capability map below records deletion of the user/agent route.
- [x] Searches counted/listed first and excluded caches/build artifacts.
- [x] Agent-native pack: no rule source required editing; root script/docs were the durable owners.
- [x] Agent-native pack: the rejected action is absent from root scripts and contributor teaching.
- [x] Agent-native pack: `pnpm install` ran; generated mirrors remain valid because no rule changed.
- [x] Agent-native pack: the first reviewer finding was rejected with live absence proof; final P2 review is clean.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Zero live matches and all scoped checks pass. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: source proved the command referenced an absent implementation. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Root script list, JSON parse, lockfile, and repo-wide zero-match audits pass. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Root `package.json` changed; `pnpm install` passes and lockfile remains Plop-free. Manifest checker is separately red on existing media/table dev-peer gaps. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no rule source changed; install still regenerated successfully. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All checks ran at repo root. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: root-only developer script. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Removed the complete obsolete CN contributor subsection; adjacent heading remains intact. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure is a hidden alias/implementation remaining; exact name/path/script/lock audits are empty. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Capability map PASS; command and teaching removed together. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A. |
| P2 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Final isolated review with absence dataset is clean, zero findings, correctness 0.99. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Passed with existing oversized-artifact warnings. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Count/file-list scans preceded excerpts. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-hard-cut-plop-package-generator.md` | Command passes after final evidence update. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no agent source changed; install/sync still passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Rejected command has zero script/docs/skill matches. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; no agent route remains for the deleted action. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Two live matches; no implementation/dependency/lockfile owner exists | implementation |
| Implementation | completed | Root script and complete CN contributor subsection deleted | verification |
| Verification | completed | Install, zero audits, JSON/script/lock checks, lint, v97 validation, final review | closeout |
| PR / tracker sync | completed | N/A | final response |
| Closeout | completed | Evidence complete | final response |

Findings:
- The root `gen:package` command referenced
  `tooling/scripts/plop/plopfile.cjs`, but that file and directory already did
  not exist.
- Only two live mentions remained: the root script and a Chinese contributor
  subsection. No Plop dependency or lockfile record existed.
- `pnpm test:manifests` is independently red because `@platejs/media` and
  `@platejs/table` declare `platejs` peers without matching workspace dev
  dependencies; this hard cut did not cause or touch those package manifests.

Agent-native capability map:

| User action | Agent route | Source owner | Mirror/doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Run legacy package generator | deleted | root `package.json` | CN contributor guide removed | root script list + zero-match audit | pass |
| Discover legacy generator | deleted | contributor teaching | no skill/rule mirror mentions | repo-wide source audit | pass |
| Invoke hidden Plop implementation | unavailable | implementation path already absent | no dependency/lockfile | path/manifest/lock audit | pass |

Decisions and tradeoffs:
- Delete the entire current teaching subsection rather than replace it with a
  manual process or future-feature promise.
- Preserve unrelated immutable historical release text; none matched the exact
  Plop surface.
- Reject the first autoreview finding because it cited a path that does not
  exist in the live tree; rerun with explicit absence evidence.

Implementation notes:
- Removed `scripts.gen:package` from root `package.json`.
- Removed `### 如何：创建 Plate 包` and its obsolete commands from
  `tooling/cn/CONTRIBUTING.md`.
- Added no replacement tooling, alias, warning, dependency, or migration prose.

Review fixes:
- First P2 pass incorrectly inferred the nonexistent Plop implementation was
  tracked because absence was invisible in the two-file bundle. Live source
  rejected it; final pass consumed the path/grep evidence and returned clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Workspace manifest check reports existing media/table dev-peer gaps | 1 | Keep the hard cut scoped; use root JSON/install/zero audits | Classified unrelated and left untouched |
| First isolated review hallucinated an existing Plop implementation | 1 | Attach live absence evidence and rerun same review | Final P2 review clean |

Verification evidence:
- Repo-wide live-source search excluding this plan -> zero matches for Plop,
  `gen:package`, `plopfile`, `node-plop`, and `plop-*`.
- `pnpm run` -> no rejected script.
- Root `package.json` parse -> valid; rejected script absent.
- `pnpm-lock.yaml` / `bun.lock` -> zero Plop records.
- `pnpm install` -> pass; lockfile already current; Skiller/resource sync pass.
- `pnpm lint:fix` -> pass with existing oversized-artifact warnings.
- Plate Next v97 validation and `git diff --check` -> pass.
- Agent-native capability map -> three deleted/unavailable action rows pass.
- Final P2 autoreview -> isolated 1,645-byte bundle plus absence dataset,
  TruffleHog clean, zero findings, correctness 0.99.
- `pnpm test:manifests` -> unrelated pre-existing media/table dev-peer failures
  recorded above; no Plop/root-script diagnostic.

Final handoff contract:
- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: 100% for the requested hard cut
- Flow table:
  - Reproduced: broken command/path and two live mentions confirmed; browser N/A
  - Verified: zero matches, install, JSON/script/lock checks, lint, reviews; browser N/A
- Browser check: N/A
- Outcome: all live Plop/package-generator surfaces removed
- Caveat: unrelated workspace manifest check remains red on media/table dev-peer policy
- Design:
  - Chosen boundary: root script plus its sole current contributor teaching
  - Why not quick patch: removing only the command would leave false documentation
  - Why not broader change: no implementation, dependency, lockfile, or skill surface existed
- Verified: exact zero-match and command/config/install checks plus clean P2 review
- PR body verified: N/A

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
- Caveats: unrelated manifest checker failures only

Timeline:
- 2026-08-17T15:30:11.250Z Task goal plan created.
- 2026-08-17 Audited the complete Plop/package-generator surface: two live
  matches, no implementation/dependency/lockfile.
- 2026-08-17 Deleted root command and contributor teaching, installed, linted,
  and proved zero live matches.
- 2026-08-17 Rejected one nonmatching review finding with live evidence and
  completed a clean P2 rerun.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Mechanical checker and final handoff |
| What is the goal? | Remove every live Plop and gen-package surface with no replacement |
| What have I learned? | The implementation was already absent; only command and CN teaching remained |
| What have I done? | Deleted both owners and passed zero-match/install/lint/review proof |

Open risks:
- `pnpm test:manifests` remains red on unrelated existing media/table
  devDependency policy; no Plop-related risk remains.
