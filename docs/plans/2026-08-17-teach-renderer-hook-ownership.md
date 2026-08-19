# Teach renderer hook ownership

Objective:
Sync skill doctrine to the renderer-hook ownership pattern; done when
sources/mirrors/version checks and agent-native review pass.

Goal plan:
docs/plans/2026-08-17-teach-renderer-hook-ownership.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user correction after an implemented Table public API hard cut
- id / link: N/A
- title: Keep package hooks lifecycle-sized and renderer composition local
- acceptance criteria: every affected source skill and durable Vision owner
  teaches the split; Plate Next doctrine is versioned; generated mirrors are
  synchronized; stale examples are absent; agent-native and P2 reviews pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary source/mirror/version checks apply
- improvement loop: audit each ownership layer and repair only contradictions
- final score / loop closure: N/A: close on zero stale teaching and green checks

Completion threshold:
- `best-api`, Plate Vision, `plate-ui` plus ownership/cross-platform/audit
  adjuncts, `plate-plugin-creator` plus authoring audit, and `plate-next` teach
  the accepted mixed-hook split without duplicating whole doctrine.
- Plate Next advances from v96 to v97 with immutable migration checks and the
  exact post-edit doctrine fingerprint; package attestations remain unchanged.
- `pnpm install`, doctrine validation, source/generated parity, stale-shape
  audits, agent-native review, P2 autoreview, lint, and plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-teach-renderer-hook-ownership.md` passes.

Verification surface:
- `pnpm install` and generated skill/resource parity.
- `node .agents/rules/plate-next/scripts/version.mjs validate` and
  `doctrine-fingerprint`.
- Exact `rg` audits across source rules and generated skills for the retained
  lifecycle hook, rejected renderer state/handlers, and purity ownership law.
- Agent-native capability map plus P2 autoreview of the bounded doctrine diff.
- `pnpm lint:fix` and `git diff --check`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Edit `.agents/rules/**` and the smallest Vision owner only; never hand-edit
  generated `.agents/skills/**/SKILL.md` mirrors.
- Do not turn the Table-specific spelling into a universal API; preserve the
  reusable responsibility split.
- Do not mass-attest tracked packages during the doctrine bump.

Boundaries:
- Source of truth: `.agents/rules/best-api.mdc`, `docs/vision/plate.md`,
  `.agents/rules/plate-ui*`, `.agents/rules/plate-plugin-creator*`,
  `.agents/rules/plate-next.mdc`, and `plate-next/versions.json`.
- Allowed edit scope: those source owners, this goal plan, and generated skill
  mirrors/resources produced by `pnpm install`.
- Browser surface: N/A; agent doctrine only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR.
- Non-goals: package source changes, another Table migration, public docs,
  registry output, package attestations, browser behavior, commits, or PRs.

Output budget strategy:
- Search only named doctrine owners and their generated mirrors; cap output to
  relevant excerpts/counts; exclude packages, generated registry data,
  artifacts, and unrelated skills.

Blocked condition:
- Block only if the version helper cannot produce a stable doctrine fingerprint
  after source regeneration, or source/mirror ownership cannot be reconciled
  without changing unrelated skill topology.

Task state:
- task_type: agent-doctrine repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: repair the responsibility split in existing owners; create no skill
- confidence: high from live Table correction and existing partial doctrine
- next owner: `best-api` source doctrine, then worker/adoption owners
- reason: current rules reject prop bags but do not explicitly require splitting
  durable DOM lifecycle from renderer state, handlers, and trivial pure helpers.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-teach-renderer-hook-ownership.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Update every affected skill to the latest responsibility split; version, regenerate, audit, and review. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `skill-creator`, `best-api`, `plate-ui`, `plate-plugin-creator`, `plate-next`, and `agent-native-reviewer` read. |
| Active goal checked or created | yes | New active goal points to this plan. |
| Source of truth read before edits | yes | Target source rules, adjuncts, Plate Vision, generated skills, and v96 registry read. |
| Tracker comments and attachments read | no | N/A: direct user correction, no tracker. |
| Video transcript evidence required | no | N/A: no recording. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused search found no reusable renderer-hook doctrine owner there. |
| TDD decision before behavior change or bug fix | no | N/A: agent doctrine only; forward/source audits are the proof. |
| Branch decision for code-changing task | no | N/A: no branch/commit requested; edit shared checkout in place. |
| Release artifact decision | no | N/A: agent rules and Vision are not package or registry release output. |
| Browser tool decision for browser surface | no | N/A: no UI behavior changes. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Named owner searches and capped excerpts only. |
| Agent-native pack selected | yes | `.agents/**` source and generated mirrors change. |
| Agent-facing action surface identified | yes | Package-hook ownership decisions during design, implementation, and Plate Next sync/review. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full reviewer skill loaded; capability map required before closeout. |

Work Checklist:
- [x] N/A: no duration requested; binary source/mirror/version checks apply.
- [x] First checkpoint captured every explicit requirement, scope boundary,
      non-goal, proof surface, completion threshold, and handoff requirement
      before edits.
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition are concrete.
- [x] Task source is classified as a direct reusable user correction with named doctrine owners and no browser/tracker surface.
- [x] N/A: no video or screen recording.
- [x] Root instructions, relevant skills, source rules, adjuncts, Plate Vision, and v96 history were read.
- [x] Implementation repairs the durable source chain instead of patching generated mirrors.
- [x] N/A: agent doctrine has no package changeset or registry changelog.
- [x] Final handoff reports owners, v97, mirror proof, reviews, and the deliberate stale Table attestation.
- [x] N/A: no branch/commit requested.
- [x] N/A: no local environment corruption signal.
- [x] All proof commands run in `/Users/zbeyens/git/plate-2`, the owning repo.
- [x] Agent-action risk: stale mirrors or contradictory worker rules could reintroduce bad APIs; regeneration, parity validation, and forward review cover it.
- [x] P2 autoreview used an isolated source-doctrine bundle because the shared checkout contains unrelated changes.
- [x] Agent-native review capability map is recorded below; no actionable gap remains.
- [x] Searches stayed scoped to named rules/mirrors with capped excerpts.
- [x] Agent-native pack: only source rules/Vision/version registry were authored directly.
- [x] Agent-native pack: `best-api`, `plate-ui`, `plate-plugin-creator`, and `plate-next` expose the changed action explicitly.
- [x] Agent-native pack: `pnpm install` regenerated skills/resources and v97 validation proves parity.
- [x] Agent-native pack: agent-native and P2 reviews found zero accepted/actionable findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | All named checks pass. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: doctrine correction from a proven implementation review, not runtime bug work. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source/generated stale audits and capability map pass. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown/JSON doctrine only; JSON parsed by version validator. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A for manifests; `pnpm install` still ran for skill generation. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` and resource sync passed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All checks ran at `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: agent doctrine only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Internal Plate Vision only; source-backed against implemented Table pattern. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure is agents preserving mixed bags or editing mirrors; source ownership, generation, parity, and review prevent it. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Capability map PASS; zero findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| P2 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Isolated 16,088-byte doctrine bundle clean; zero actionable findings; correctness 0.94. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Passed with existing oversized-artifact warnings only. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were scoped/capped; no accidental broad output. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-teach-renderer-hook-ownership.md` | Command passes after final evidence update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | v97 validation confirms exact source/mirror/resource parity. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | All four generated entry skills contain the new rule. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS capability map; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Rules, adjuncts, Vision, generated skills, v96 history, and correction read | implementation |
| Implementation | completed | Five doctrine owners plus four adjuncts repaired; v97 appended | verification |
| Verification | completed | Install/sync, v97 validation, stale audits, lint, agent-native review, P2 review pass | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested | final response |
| Closeout | completed | Plan evidence complete | final response |

Findings:
- Existing main rules already rejected one-renderer prop bags and allowed
  durable DOM systems, but they did not say how to split a hook containing
  both responsibilities.
- Plate UI adjuncts still named the pre-colocation `registry/ui`,
  `registry-kits.ts`, and `registry-ui.ts` owners even though the main skill
  correctly teaches flat `components/editor` plus current metadata files.
- Plate Next doctrine changes make every package stale by design. Table remains
  v50/fingerprint-changed until a full `plate-next sync table`; this task must
  not forge a v97 package attestation.

Agent-native capability map:

| User action | Agent route | Source owner | Mirror / ledger | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Decide whether a mixed renderer hook survives | `best-api review` | `.agents/rules/best-api.mdc` + `docs/vision/plate.md` | generated `best-api` skill | exact rule grep + P2 review | pass |
| Implement package/registry responsibility split | `plate-ui` + `plate-plugin-creator` | main rules plus ownership/cross-platform/audit adjuncts | generated skills/resources | `pnpm install`, v97 parity validation | pass |
| Detect and migrate stale packages | `plate-next` review/sync | `.agents/rules/plate-next.mdc` | `versions.json` v97 and generated skill | `version.mjs validate/status` | pass |
| Repair future skill drift | source rule edit then `pnpm install` | `.agents/rules/**` | `.agents/skills/**` mirrors | source/generated stale-path audit | pass |

Decisions and tradeoffs:
- Keep the principle generic rather than freezing `useTableSelectionDOM` as a
  universal name. Required input plus `void` applies only to side-effect-only
  lifecycle adapters.
- Update every rule that makes the decision, but keep full API doctrine in
  `best-api`; worker skills receive only their implementation/audit slice.
- Append Plate Next v97 because fingerprinted worker doctrine changed. Do not
  update any package ledger without its full review and proof.

Implementation notes:
- Added the mixed-hook split to Best API and Plate Vision.
- Added component/package implementation rules and adjunct audit checks to
  Plate UI and Plate Plugin Creator.
- Added field-level migration detection, unused-return evidence, purity law,
  and current flat registry references to Plate Next v97.
- Ran `pnpm install`; Skiller and resource sync regenerated mirrors.

Review fixes:
- Adjunct audit repaired three stale pre-colocation registry paths.
- A generated-rule grep was narrowed from exact punctuation to semantic text
  after `plate-plugin-creator` used equivalent non-hyphenated wording.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generated-rule grep required exact `side-effect-only` punctuation | 1 | Match the actual semantic sentence per owner | All four generated skills pass the corrected audit |

Verification evidence:
- `pnpm install` -> Skiller apply and required resource sync pass.
- `version.mjs validate` -> Plate Next v97 valid, 44 active / 2 retired.
- `version.mjs doctrine-fingerprint` ->
  `sha256:030195177e3ddeea82ba8d099add65ae6b88676f7a2d29b5987c588d36c8a572`.
- Source/generated audits -> all four entry skills contain the new split;
  zero old `registry/ui`, `registry-kits.ts`, or `registry-ui.ts` references in
  Plate UI source/mirrors.
- `pnpm lint:fix` -> pass with existing oversized-artifact warnings only.
- `git diff --check` -> pass.
- Agent-native capability map -> four actions pass, zero gaps.
- P2 autoreview -> isolated 16,088-byte doctrine bundle, TruffleHog clean,
  zero actionable findings, correctness 0.94.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct user correction
- Confidence line: 100% for source/mirror/version synchronization
- Flow table:
  - Reproduced: source gap and stale adjunct paths confirmed; browser N/A
  - Verified: generation/version/audits/reviews pass; browser N/A
- Browser check: N/A: agent doctrine only
- Outcome: affected skill chain teaches the latest renderer-hook ownership pattern
- Caveat: Table remains stale in the package ledger until full package sync
- Design:
  - Chosen boundary: Best API + Plate Vision own taste; UI/plugin workers apply it; Plate Next audits adoption
  - Why not quick patch: one generated skill edit would be overwritten and leave contradictions
  - Why not broader change: no new skill or package migration is required
- Verified: v97 parity, stale audits, lint, agent-native review, P2 review
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
- Caveats: Table package attestation deliberately remains v50/stale until a future full sync

Timeline:
- 2026-08-17T15:14:01.599Z Task goal plan created.
- 2026-08-17 Repaired Best API, Plate Vision, Plate UI, Plate Plugin Creator,
  Plate Next, and their required adjuncts for the mixed renderer-hook split.
- 2026-08-17 Appended Plate Next v97, regenerated skill mirrors/resources, and
  validated fingerprint/source/mirror parity.
- 2026-08-17 Completed agent-native capability review, lint, stale-path audits,
  and clean P2 autoreview.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Mechanical checker and final handoff |
| What is the goal? | Synchronize every affected skill owner to the mixed renderer-hook split |
| What have I learned? | Main doctrine was partial; adjunct paths also lagged the flat registry migration |
| What have I done? | Repaired sources/adjuncts/Vision, appended v97, regenerated mirrors, and passed reviews |

Open risks:
- Table and every other tracked package become stale after v97 until their own
  full `plate-next sync`; this is expected and prevents forged attestations.
- No remaining skill-source, generated-mirror, or discoverability gap.
