# vision domain split

Objective:
Split vision doctrine into domain docs while keeping root essentials; done when
vision/sync-vision skills, generated mirrors, and checks pass.

Goal plan:
docs/plans/2026-06-16-vision-domain-split.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat request 2026-06-16
- title: Split vision doctrine into domain docs
- acceptance criteria:
  - create `docs/vision/*` for granular doctrine that can scale by package or
    project later;
  - keep root `VISION.md` with the essential vision for each domain because
    agents may not read every `docs/vision/*` file;
  - update the `vision` skill/source rule so root is mandatory and domain docs
    are read only when relevant;
  - update `sync-vision` so it can promote reusable doctrine to root or the
    right `docs/vision/*` owner;
  - update the sync helper scope so `docs/vision/**` is collected;
  - run required skill sync and verification;
  - Correction: timed checkpoint semantics do not belong in vision or
    sync-vision. They belong in dotai `autogoal`.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done when `VISION.md` stays a compact mandatory index with essential Common,
  Slate, Plate, and sync doctrine; `docs/vision/*` contains detailed domain
  doctrine; `.agents/rules/vision.mdc` and `.agents/rules/sync-vision.mdc`
  describe the root-plus-domain read/promotion policy; the sync helper includes
  `docs/vision/**`; `pnpm install` regenerates skill mirrors; source/mirror
  audits and helper smoke pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-vision-domain-split.md` passes.

Verification surface:
- `pnpm install`
- `node --check .agents/rules/sync-vision/scripts/collect-vision-diff.mjs`
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --status`
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --dry-run`
- `rg -n "docs/vision|sync-vision|VISION.md|lastSyncedCommit" VISION.md docs/vision .agents/rules/vision.mdc .agents/rules/sync-vision.mdc .agents/skills/vision/SKILL.md .agents/skills/sync-vision/SKILL.md`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-vision-domain-split.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/**`, `.agents/rules/*.mdc`,
  `docs/plans/templates/sync-vision.md`, and generated mirrors after
  `pnpm install`.
- Allowed edit scope: `VISION.md`, `docs/vision/**`, `.agents/rules/vision.mdc`,
  `.agents/rules/sync-vision.mdc`,
  `.agents/rules/sync-vision/scripts/collect-vision-diff.mjs`,
  generated `.agents/skills/{vision,sync-vision}/SKILL.md`,
  `docs/plans/templates/sync-vision.md`, sync artifacts, and this plan.
- Browser surface: N/A, no app route/UI behavior changed.
- Tracker sync: N/A, no tracker.
- Non-goals: no runtime Slate/Plate code changes, no public package API change,
  no commit/PR, no broad taste rewrite beyond splitting existing doctrine.

Output budget strategy:
- Read focused source files with capped `sed`; use `rg` audits and sync
  artifacts instead of dumping full diffs or all candidate lines into chat.

Blocked condition:
- Block only if generated skill sync fails, the sync helper cannot collect
  `docs/vision/**`, or the root/domain split creates a contradiction where root
  can no longer be the mandatory essential read.

Timed checkpoint:
- User correction: timed checkpoint semantics are owned by dotai `autogoal`,
  not `VISION.md` or `sync-vision`.
- Minimum active-work interpretation is now documented in dotai autogoal and
  propagated to installed autogoal mirrors plus project-owned generic
  templates.
- Initial confidence: 82/100 after root/detail split; risk was template
  shadowing because project-owned `docs/plans/templates/**` overrides installed
  dotai seed templates.
- Confidence lift: 96/100 after source audit proved no timed-checkpoint wording
  in vision/sync-vision, dotai validation passed, downstream installed mirrors
  updated, and all downstream project generic templates gained timed rows.
- Confidence lift: 98/100 after the timed-checkpoint pass found and fixed a
  real sync-vision blind spot: untracked `docs/vision/*.md` files were not
  collected by the working-tree overlay.

Task state:
- task_type: agent workflow and doctrine docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_update_goal

Current verdict:
- verdict: ready_for_final_mechanical_check
- confidence: 98/100
- next owner: task
- reason: root/detail doctrine split, sync-vision scope, dotai autogoal timed
  checkpoint ownership, and downstream template propagation are all proven by
  current source audits and commands.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-vision-domain-split.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria copied; user correction recorded that timing belongs in autogoal, not vision |
| Skill analysis before edits | yes | Read `autogoal` from user-provided skill body plus `vision` and `sync-vision` generated/source rules |
| Active goal checked or created | yes | `get_goal` returned null; created active goal for this plan |
| Source of truth read before edits | yes | Read `VISION.md`, `.agents/rules/vision.mdc`, `.agents/rules/sync-vision.mdc` |
| Tracker comments and attachments read | N/A | No tracker |
| Video transcript evidence required | N/A | No video |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Doctrine/skill split only |
| TDD decision before behavior change or bug fix | N/A | No product behavior change |
| Branch decision for code-changing task | N/A | No branch/PR requested |
| Release artifact decision | N/A | No package release artifact |
| Browser tool decision for browser surface | N/A | No browser surface |
| PR expectation decision | N/A | No PR requested |
| Tracker sync expectation decision | N/A | No tracker |
| Output budget strategy recorded | yes | Capped reads, source audits, and sync artifacts |
| Docs pack selected | yes | Docs touched, but not public docs |
| `docs-creator` loaded | N/A | Internal doctrine docs, not Plate public docs |
| Docs lane selected | yes | Internal doctrine/docs lane |
| Target docs and nearest sibling docs read | yes | Read `VISION.md`; no `docs/vision/**` exists yet |
| Docs style doctrine read | yes | Current-state doctrine from `VISION.md` and repo AGENTS docs rule |
| Documented source owner identified | yes | Root `VISION.md` plus domain docs |
| Agent-native pack selected | yes | Skills/source rules changed |
| Agent-facing action surface identified | yes | `vision` and `sync-vision` skill behavior |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; generate `.agents/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Previously loaded this turn context; will apply source/mirror audit |

Work Checklist:
- [x] First checkpoint complete: acceptance criteria and the user correction
      about timed checkpoint ownership were copied into this plan before closeout.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete in this plan.
- [x] Task source classified: chat request, agent workflow/doctrine docs,
      no browser route, no tracker, no product runtime change.
- [x] Required video evidence N/A: no video or screen recording was part of
      this task.
- [x] Nearby repo instructions and implementation patterns read: root
      `AGENTS.md`, `vision`, `sync-vision`, `sync-skills`, and `autogoal`.
- [x] Implementation fixes the right ownership boundary: root `VISION.md` owns
      essentials; `docs/vision/*.md` owns detail; dotai `autogoal` owns timed
      checkpoints; project templates own local plan shells.
- [x] Release artifact requirement N/A: no package runtime/public API release.
- [x] Final handoff shape decided: changed list, dotai commit, downstream sync,
      verification, caveats.
- [x] Branch handling N/A: no PR/branch requested.
- [x] Local-env-rot retry policy N/A: no suspicious install/type/runtime rot.
- [x] Workspace authority recorded: plate-2 verifies local doctrine/skills;
      dotai verifies shared autogoal; downstream repos verify installed copies
      and project templates.
- [x] High-risk note recorded: agent-action and command-contract behavior
      changed; proof is source rule, installed mirror, template, and validation
      audit.
- [x] Review/autoreview target selected: agent-native source/mirror/template
      audit, not code autoreview, because changes are docs/skills/templates.
- [x] Agent-native review decision recorded: source rules edited, mirrors
      generated/installed, discoverability audited.
- [x] Output budget discipline followed: broad scans used `rg` counts/matches
      and sync artifacts, not unbounded dumps.
- [x] User correction honored: timed checkpoint semantics are absent from
      `VISION.md`, `docs/vision/**`, `vision`, and `sync-vision`; they are in
      dotai `autogoal`.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner
      recorded.
- [x] Docs pack: API/import/route/demo claims N/A; this is internal doctrine
      and skill behavior, not API docs.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links/routes/previews N/A; only local markdown paths.
- [x] Agent-native pack: source-of-truth rule files and dotai source were
      edited instead of hand-editing generated mirrors.
- [x] Agent-native pack: changed agent actions are discoverable from
      `vision`, `sync-vision`, `sync-skills`, and `autogoal` skill text.
- [x] Agent-native pack: generated mirrors are synced or installed, and
      project-owned templates are merged separately where installed seeds do
      not apply.
- [x] Agent-native pack: no accepted actionable review findings remain after
      source/mirror/template audits.
- [x] Timed-confidence repair: `sync-vision` collector now includes relevant
      untracked files so new `docs/vision/*.md` detail docs are visible before
      commit.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audits, helper checks, dotai validation, downstream propagation checks, and final plan check | Evidence recorded below |
| Bug reproduced before fix | N/A | No product bug or repro lane | Doctrine/skill repair only |
| Targeted behavior verification | yes | Verify skill/router/template behavior through source audits | `rg` audits recorded below |
| TypeScript or typed config changed | N/A | No TypeScript/config runtime code | Markdown and one checked `.mjs` helper only |
| Package exports or file layout changed | N/A | No package export/file layout | No `pnpm brl` needed |
| Package manifests, lockfile, or install graph changed | yes | Run sync/install where source rules changed | `pnpm install` and Skills CLI update evidence recorded |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` plus source/mirror audits |
| Workspace authority proof | yes | Verify each owning workspace separately | plate-2, dotai, better-convex, plate, informed-fe-v3 commands recorded |
| Browser surface changed | N/A | No app/browser route changed | Browser proof not relevant |
| Browser final proof | N/A | No browser surface | No screenshot needed |
| CI-controlled template output changed | N/A | Edited project-owned plan templates, not CI registry/template output | Preserved as source templates |
| Package behavior or public API changed | N/A | No package behavior/API change | No changeset |
| Registry-only component work changed | N/A | No registry component work | No changelog |
| Docs or content changed | yes | Verify internal doctrine docs and source-backed skill claims | Source audits recorded |
| High-risk mini gate | yes | Agent-action and command-contract behavior changed | Owner split and timed-checkpoint ownership recorded |
| Agent-native review for agent/tooling changes | yes | Close source/mirror/template discoverability findings | No accepted findings remain after audits |
| Local install corruption suspected | N/A | No failure shape suggested install rot | Reinstall not needed |
| Autoreview for non-trivial implementation changes | N/A | No runtime implementation patch | Agent-native/source audit is the relevant review surface |
| PR create or update | N/A | No PR requested | No PR |
| Task-style PR body verified | N/A | No PR requested | No PR body |
| PR proof image hosting | N/A | No PR/browser proof | No image |
| Tracker sync-back | N/A | No tracker | No sync-back |
| Final handoff contract | yes | Final response will include changed list, dotai commit, downstream commands, verification, caveats | Contract recorded here |
| Final lint | N/A | Markdown/skill docs only; focused validations used | No lint-fix needed |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed | Used focused `sed`, `rg`, counts, and sync summary |
| Goal plan complete | yes | Run final `check-complete.mjs` after this update | Command recorded below |
| Docs source-backed claim audit | yes | Verify root/detail docs and skill references | `rg` and `sed` audits recorded |
| Docs links / routes / previews | N/A | Local markdown paths only, no site routes | No route proof |
| Docs MDX/content parser | N/A | Internal markdown docs, not MDX/contentlayer route | No contentlayer build |
| Plugin page specifics | N/A | No plugin page | No docs-creator plugin lane |
| Agent source / generated sync | yes | Run source sync/install and verify mirrors | `pnpm install`; `npx skills update autogoal --project -y` in downstream repos |
| Agent action discoverability | yes | Source-audit skill text an agent reads | `rg` audits recorded |
| Agent-native review | yes | Apply source/mirror/template audit | No accepted findings remain |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read root instructions plus `vision`, `sync-vision`, `sync-skills`, and `autogoal` | implementation |
| Implementation | complete | Root/detail vision split, sync-vision scope update, dotai autogoal timed checkpoints, downstream template merges | verification |
| Verification | complete | Source audits, dotai validation, sync helper dry-run, downstream propagation counts | final check |
| PR / tracker sync | complete | N/A: no PR or tracker requested | closeout |
| Closeout | complete | `check-complete.mjs` passed after plan update | final response |

Findings:
- Root `VISION.md` must stay the mandatory first read. Detailed doctrine now
  lives in `docs/vision/common.md`, `docs/vision/slate.md`,
  `docs/vision/plate.md`, and `docs/vision/sync.md`.
- `vision` should stay a router, not a second doctrine copy.
- `sync-vision` must collect `docs/vision/**` and classify candidates as root
  or detail doctrine.
- `git diff` alone does not see brand-new untracked doctrine files, so the
  collector needed explicit `git ls-files --others --exclude-standard` support.
- Installed dotai autogoal template seeds are not enough: project-owned
  `docs/plans/templates/**` files shadow those seeds and need section-level
  merges.
- Timed checkpoint semantics belong in dotai `autogoal`; vision docs should
  only capture reusable taste or supervisor doctrine, not duration mechanics.

Decisions and tradeoffs:
- Keep root `VISION.md` concise enough to be read every time, but still
  essential enough that agents do not need every detail doc for basic taste.
- Put detailed Slate, Plate, common, and sync doctrine in `docs/vision/*.md`.
- Keep timed checkpoint behavior out of vision and sync-vision after the user
  correction; move it to shared autogoal and local plan templates.
- Commit and push dotai because `sync-skills dotai` mode requires it. Do not
  commit downstream repos because the user did not ask.

Implementation notes:
- Updated root/detail vision docs and `vision`/`sync-vision` source rules.
- Updated `collect-vision-diff.mjs` to include `docs/vision/**`.
- Updated `collect-vision-diff.mjs` to include relevant untracked files in the
  working-tree overlay and scan their lines for candidate categories.
- Updated `docs/plans/templates/sync-vision.md` for root/detail doctrine.
- Added dotai autogoal timed checkpoint rules and template rows.
- Refreshed installed autogoal copies in plate-2, better-convex, plate, and
  informed-fe-v3.
- Merged timed checkpoint rows into each repo's project-owned generic autogoal
  templates: `goal.md`, `task.md`, `docs.md`, `major-task.md`,
  `goal-repair.md`.

Review fixes:
- Fixed ownership error from the user correction: no timed checkpoint doctrine
  remains in vision or sync-vision.
- Fixed template-shadowing risk by patching project-owned plan templates, not
  just dotai installed seed templates.
- Fixed sync-helper blind spot found during timed confidence work: untracked
  `docs/vision/*.md` files now appear in `changed-files.tsv` and
  `candidate-lines.tsv`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell quote audit with backticks caused zsh command substitution noise | 1 | Use single quotes or avoid backtick patterns | Re-ran audits with safe patterns |
| Initial template merge script missed older/forked template anchors | 2 | Add fallback anchors and verify counts per repo | All four repos now show 5 timed sections and 5 parsed gates |
| Looked for non-existent `candidate-files.tsv` artifact | 1 | Audit actual collector outputs | Confirmed artifacts are `changed-files.tsv`, `candidate-lines.tsv`, `run.json`, and `summary.md` |
| Working-tree overlay missed untracked detail docs | 1 | Add untracked file discovery and line scanning | `docs/vision/common.md`, `plate.md`, `slate.md`, and `sync.md` now appear as `??` rows |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` passed after source-rule
  edits and regenerated skill mirrors.
- `node --check .agents/rules/sync-vision/scripts/collect-vision-diff.mjs`
  passed.
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --dry-run`
  passed and wrote `docs/sync/vision/runs/2026-06-16-9e36837-to-9e36837`;
  latest summary reports 103 working-tree changed files and more than 5k
  candidate lines after untracked overlay support.
- `awk` audit of `changed-files.tsv` proves untracked detail docs are collected:
  `?? docs/vision/common.md`, `?? docs/vision/plate.md`,
  `?? docs/vision/slate.md`, `?? docs/vision/sync.md`.
- `sync-vision` source and generated skill text now state that working-tree
  overlays include relevant untracked files, while baseline advancement remains
  commit-only.
- `scripts/validate-skills` in `/Users/zbeyens/git/dotai` passed.
- Dotai committed and pushed `dc003df Add timed checkpoint rules to autogoal`.
- Downstream install commands succeeded with warnings about deleted-skill
  checks but ended in `Updated autogoal`:
  `/Users/zbeyens/git/plate-2`, `/Users/zbeyens/git/better-convex`,
  `/Users/zbeyens/git/plate`, `/Users/zbeyens/git/informed-fe-v3`.
- Propagation audit: each of the four repos has `## Timed Checkpoints` in both
  `.agents/skills/autogoal/SKILL.md` and `.claude/skills/autogoal/SKILL.md`;
  each has timed rows in all five project templates.
- Negative audit passed: no `Timed Checkpoint`, `Timed checkpoint`,
  `minimum active-work`, `initial confidence scorecard`, or `hour checkpoint`
  matches in `VISION.md`, `docs/vision/**`, `vision`, or `sync-vision`.
- Stale-name audit passed for removed skill identity: no `slate-north-star`
  matches in `.agents`, `VISION.md`, `docs/vision`, `docs/plans/templates`,
  or `docs/sync/vision`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-vision-domain-split.md`
  passed.
- Column-aware artifact audit passed: generated mirrors, `.changeset/**`, and
  `docs/sync/vision/runs/**` do not appear as collected file rows.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: 98/100.
- Flow table:
  - Reproduced: N/A, workflow expectation repair.
- Verified: source audits, dotai validation, installed mirror/template
    propagation, sync helper dry-run with untracked detail-doc coverage.
- Browser check: N/A, no browser surface.
- Outcome: root/detail vision split plus autogoal timed checkpoint repair.
- Caveat: downstream repos are modified locally but intentionally not committed.
- Design:
  - Chosen boundary: root `VISION.md` essentials, `docs/vision/*.md` detail,
    dotai `autogoal` timing semantics, project-owned templates for local plan
    shells.
  - Why not quick patch: installed autogoal seed templates alone would miss
    project-owned template forks.
  - Why not broader change: no runtime package/API behavior is involved.
- Verified: commands and audits listed in Verification evidence.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: downstream repos have local skill/template updates from sync; no
  downstream commits were made.

Timeline:
- 2026-06-16T10:55:47.862Z Task goal plan created.
- 2026-06-16T12:52:48.870Z Sync helper dry-run regenerated vision summary.
- 2026-06-16T12:53:00Z Dotai autogoal timed checkpoint patch validated.
- 2026-06-16T12:53:00Z Downstream autogoal installed mirror/template
  propagation audited across four repos.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final mechanical check |
| Where am I going? | Close goal, hand off |
| What is the goal? | Split vision doctrine into root essentials and domain docs, while moving timed checkpoint semantics to autogoal |
| What have I learned? | Project-owned plan templates shadow installed skill seed templates |
| What have I done? | Updated vision docs/skills, sync-vision scope/untracked collection, dotai autogoal, installed mirrors, and project templates |

Open risks:
- Downstream repos have uncommitted local skill/template sync changes by design.
- No runtime/product behavior was tested because none changed.
