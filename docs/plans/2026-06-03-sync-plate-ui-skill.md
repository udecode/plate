# sync plate ui skill

Objective:
Create sync-plate-ui skill; done when source rule, generated skill, plan gates,
and focused verification pass; plan
docs/plans/2026-06-03-sync-plate-ui-skill.md.

Goal plan:
docs/plans/2026-06-03-sync-plate-ui-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: plain task text in chat
- id / link: N/A: no tracker item
- title: Create `sync-plate-ui` skill with autogoal-backed workflow
- acceptance criteria: add a source-of-truth `sync-plate-ui` rule and matching
  goal template that let agents plan, review, and apply fork-aware Plate UI
  component syncs into downstream repos such as `../potion`; regenerate the
  generated skill mirror; verify discoverability and agent-native parity.

Completion threshold:
- Source rule `.agents/rules/sync-plate-ui.mdc` exists and defines an
  autogoal-backed, fork-aware downstream Plate UI sync workflow with status,
  planning, review, dashboard, and apply modes.
- Project template `docs/plans/templates/sync-plate-ui.md` exists and records
  the recurring gates for that workflow.
- Generated mirror `.agents/skills/sync-plate-ui/SKILL.md` exists after
  `pnpm install` and contains the same discoverable command contract.
- Focused source audits, generated sync proof, agent-native review, final lint,
  and `check-complete.mjs` pass or have explicit N/A evidence.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-sync-plate-ui-skill.md` passes.

Verification surface:
- Source audits: `.agents/rules/sync-plate-ui.mdc`,
  `.agents/skills/sync-plate-ui/SKILL.md`,
  `docs/plans/templates/sync-plate-ui.md`, and relevant command/package
  routing.
- Generated sync: `pnpm install` in `/Users/zbeyens/git/plate` and post-sync
  `rg` checks for the generated skill mirror.
- Review: `agent-native-reviewer` pass against the new workflow; `autoreview`
  pass for the local implementation diff.
- Final mechanical gate:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-sync-plate-ui-skill.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc` and project templates under
  `docs/plans/templates/**`; generated `.agents/skills/**/SKILL.md` is synced
  output.
- Allowed edit scope: `.agents/rules/sync-plate-ui.mdc`,
  `docs/plans/templates/sync-plate-ui.md`, generated skill mirrors produced by
  `pnpm install`, and this goal plan.
- Browser surface: N/A: skill/rule workflow only; no app route or UI changed.
- Tracker sync: N/A: no issue/Linear tracker source.
- Non-goals: no Potion code changes, no actual downstream sync run, no PR,
  no commits/pushes, no component changelog implementation in this slice.

Output budget strategy:
- Use focused `sed`/`rg` reads for rule/template/source layout. Cap generated
  skill and search output. Avoid broad repo scans except file lists needed to
  identify source-of-truth boundaries.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills after one concrete
  repair attempt, if the repo lacks a source-owned skiller path for the new
  skill, or if source/generator behavior contradicts the repo instruction not
  to hand-edit generated `SKILL.md` files.

Task state:
- task_type: agent tooling / skill creation
- task_complexity: normal, non-trivial
- current_phase: intake and plan fill
- current_phase_status: complete
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: high after source layout read
- next owner: task
- reason: source rule plus generated mirror path is established by
  `.agents/AGENTS.md`, `.agents/skiller.toml`, and prior repo memory.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-sync-plate-ui-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `task`, `skill-creator`, `sync-shadcn`, and user-provided `agent-native-reviewer` contract before edits. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active objective for this plan. |
| Source of truth read before edits | yes | Read `.agents/AGENTS.md` via prompt, `.agents/skiller.toml`, `.agents/rules/sync-shadcn.mdc`, and generated skill layout. |
| Tracker comments and attachments read | no | N/A: plain chat task, no tracker. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is workflow/skill creation; relevant durable memory checked instead. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug fix. |
| Branch decision for code-changing task | yes | Existing branch/checkouts left as-is per repo instruction; no proactive git state check. |
| Release artifact decision | yes | N/A: no package/public component release; no changeset or component changelog needed. |
| Browser tool decision for browser surface | no | N/A: no browser-visible route or UI changed. |
| PR expectation decision | no | N/A: user did not ask for PR/commit/push. |
| Tracker sync expectation decision | no | N/A: no tracker source. |
| Output budget strategy recorded | yes | See Output budget strategy above. |
| Agent-native pack selected | yes | Applied `agent-native` pack when creating this plan. |
| Agent-facing action surface identified | yes | New command-like skill surface: `sync-plate-ui status|plan|review|dashboard|apply`. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/sync-plate-ui.mdc`; run `pnpm install` to generate `.agents/skills/sync-plate-ui/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | User provided the full `agent-native-reviewer` contract in chat; final review will use that contract. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete; see sections
      above.
- [x] Task source classified: plain chat task, agent tooling/skill creation,
      no tracker, no browser surface, no downstream Potion edits in this slice.
- [x] Required video or screen-recording evidence is N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read:
      `.agents/AGENTS.md`, `.agents/skiller.toml`,
      `.agents/rules/sync-shadcn.mdc`, generated skill layout, and relevant
      memory notes.
- [x] Implementation fixes the ownership boundary: source rule
      `.agents/rules/sync-plate-ui.mdc` plus reusable template
      `docs/plans/templates/sync-plate-ui.md`; generated mirrors came from
      `pnpm install`.
- [x] Release artifact requirement is N/A: no package, registry component, or
      public release artifact changed.
- [x] Final handoff shape decided: concise local implementation summary,
      verification commands, no PR/tracker sync.
- [x] Branch handling recorded: no branch change, no proactive git-state check,
      no commit/push/PR requested.
- [x] Local-env-rot retry policy N/A: no surprising install/test failure.
- [x] Workspace authority recorded: all proof commands ran in
      `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: this changes an agent command contract; proof is
      source rule, generated mirror, AGENTS discoverability, reviewer, and sync
      checks.
- [x] Review/autoreview target selected: local diff reviewed with
      `.agents/skills/autoreview/scripts/autoreview --mode local`.
- [x] Agent-native review decision recorded: required because `.agents/**`
      changed; completed with no remaining accepted findings.
- [x] Output budget discipline followed: reads were capped with focused `sed`
      and `rg`; no full registry tree or broad diff streamed.
- [x] Agent-native pack: edited source-of-truth rule files instead of generated
      skill mirrors.
- [x] Agent-native pack: changed agent action is discoverable from
      `.agents/rules/sync-plate-ui.mdc`,
      `.agents/skills/sync-plate-ui/SKILL.md`, `.claude/skills`, and `AGENTS.md`.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: accepted review findings fixed: added AGENTS
      discoverability, added template Autoreview gate, and closed this plan.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audits, sync proof, reviewer, lint, and final plan check | `pnpm install` passed twice; `rg` source audit found rule, generated mirrors, template, and AGENTS routing; `pnpm lint:fix` passed; autoreview findings accepted/fixed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: feature/workflow creation, not bug fix. |
| Targeted behavior verification | yes | Run focused proof for changed behavior | Source audit proved `sync-plate-ui` command text, state model, three-way classification, dashboard/apply payloads, and Potion example exist in rule and generated mirrors. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown/rule/template changes only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or package file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` completed successfully; lockfile was already up to date; skiller applied rules. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` generated `.agents/skills/sync-plate-ui/SKILL.md` and `.claude/skills/sync-plate-ui/SKILL.md`; `rg` verified source metadata. |
| Workspace authority proof | yes | Run verification in owning repo/package/app/route/tool | All commands ran in `/Users/zbeyens/git/plate`, the owning repo for `.agents/**` and templates. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser route or UI surface changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/API changed. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component source changed. |
| Docs or content changed | no | Verify source-backed claims or record N/A | N/A: goal plan/template are workflow artifacts, not docs content. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and chosen boundary | Failure mode: generated skill missing or agents lack discoverability. Proof: source rule, generated `.agents`/`.claude` mirrors, AGENTS entry, reviewer. Boundary: source rule plus template, not downstream Potion mutation. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close accepted/actionable findings | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no remaining accepted findings after adding AGENTS discoverability and structured command/state contract. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun exact failing command, or record N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Run autoreview until no accepted/actionable findings | Four autoreview runs found actionable workflow issues; all accepted and fixed. Final rerun exited clean with no accepted/actionable findings. |
| PR create or update | no | Run `check` before PR work and sync PR body | N/A: user did not ask for PR. |
| Task-style PR body verified | no | Verify PR body with `gh pr view --json body` | N/A: no PR created or updated. |
| PR proof image hosting | no | Replace local image paths with hosted URLs or record N/A | N/A: no PR/browser proof image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields below | Filled below with local files and verification. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed | Focused reads/searches only; autoreview bundle output was bounded by helper. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-sync-plate-ui-skill.md` | Passed after plan closure and evidence update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` completed after rule and AGENTS edits; `.agents` and `.claude` mirrors verified. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg -n "sync-plate-ui|.plate-ui-sync|Agent-Native Requirements"` found source rule, generated mirrors, AGENTS entry, and template. |
| Agent-native review | yes | Load reviewer and close accepted findings | PASS after source review: action parity, context parity, shared workspace, primitives/artifacts, and noun coverage present. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | created plan; read relevant skills, source layout, memory, Potion evidence | implementation |
| Implementation | complete | added `.agents/rules/sync-plate-ui.mdc`, `docs/plans/templates/sync-plate-ui.md`, and AGENTS discoverability | verification |
| Verification | complete | `pnpm install`, source audits, `pnpm lint:fix`, autoreview findings fixed; final rerun/check recorded below | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan rows closed; final response after mechanical gate | final response |

Findings:
- Potion is the right stress example: copied `src/registry/**`, app wrappers,
  pinned `@platejs/*` packages, and existing sync scripts that are not enough
  for Plate UI inbound sync.
- Existing Potion `sync:plate` filters `@udecode` packages while Potion uses
  `@platejs/*` and `platejs`; the new skill correctly treats target scripts as
  evidence, not authority.
- Generated skill mirrors are created by `pnpm install` / skiller, not by
  editing `.agents/skills/**/SKILL.md` directly.
- Agent-native review first exposed a discoverability gap in AGENTS; fixed by
  adding `sync-plate-ui` to `.agents/AGENTS.md` and regenerating root
  `AGENTS.md`.

Decisions and tradeoffs:
- Keep `sync-plate-ui` planning-first. Harsh reason: downstream product repos
  contain mixed local forks; direct micro-merges during planning would train
  agents to overwrite product code.
- Use target-owned `.plate-ui-sync/**` state instead of Plate-owned
  `docs/sync/**`; downstream repos need resumable local artifacts.
- Add JSON/Markdown dashboard output in the first skill version, not an HTML
  script. The workflow is agent-actionable now without adding a fragile new UI
  generator.
- Add a reusable goal template because the workflow is a derived autogoal lane,
  not just a one-off prompt.

Implementation notes:
- Added `.agents/rules/sync-plate-ui.mdc` with command parsing, target state,
  source inputs, target mapping, three-way classification, planning/dashboard/
  apply/review/status modes, Potion example, and agent-native requirements.
- Added `docs/plans/templates/sync-plate-ui.md` with recurring gates for
  downstream sync planning/apply runs.
- Added AGENTS discoverability rule for `sync-plate-ui`.
- Ran `pnpm install` after source rule and AGENTS edits to regenerate
  `.agents/skills/sync-plate-ui/SKILL.md`, `.claude/skills/sync-plate-ui/SKILL.md`,
  and root `AGENTS.md`.

Review fixes:
- Agent-native review: accepted discoverability gap; fixed by adding
  `sync-plate-ui` to `.agents/AGENTS.md` and regenerating.
- Autoreview P2: "Add the missing Autoreview gate to the new primary template";
  accepted and fixed in `docs/plans/templates/sync-plate-ui.md`.
- Autoreview P2: "Close or remove the unfinished goal plan before shipping";
  accepted and fixed by completing this plan with evidence rows.
- Autoreview P2: second run still found the phase table open; accepted and
  fixed by marking verification and closeout complete after evidence was
  recorded.
- Autoreview P3: the old timestamp placeholder was not substituted by the
  scratchpad renderer; accepted and fixed to `{{CREATED_AT}}`.
- Autoreview P2: the template blocked missing-base bootstrap planning even
  though the skill allows bootstrap artifacts before apply; accepted and fixed
  by limiting that blocker to apply mode or unmappable bootstrap evidence.
- Autoreview P2: fourth run found this plan still described final gates as
  future work; accepted and fixed by running `check-complete.mjs` and recording
  concrete evidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial autoreview found actionable findings | 1 | Fix accepted template/plan issues, rerun review | Template Autoreview gate added; active plan closed with evidence. |
| Second autoreview found template placeholder and open phase rows | 1 | Fix placeholder and close phase table, rerun review | Template uses `{{CREATED_AT}}`; phase table is complete. |
| Third autoreview found bootstrap blocker contradiction | 1 | Align template blocked condition with skill bootstrap mode, rerun review | Unknown base now starts bootstrap planning; it blocks only apply mode without accepted baseline or unmappable evidence. |
| Fourth autoreview found stale final-gate wording | 1 | Run mechanical plan check, record result, rerun review | `check-complete.mjs` passed and stale future-work wording was removed. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate` completed successfully and ran
  `bun x skiller@latest apply`.
- `rg -n "sync-plate-ui|source: .agents/rules/sync-plate-ui.mdc|template sync-plate-ui|\\.plate-ui-sync|Agent-Native Requirements" ...`
  verified source rule, generated `.agents`/`.claude` mirrors, AGENTS entry,
  and template.
- `pnpm lint:fix` in `/Users/zbeyens/git/plate` passed; Biome checked 3239
  files and applied no fixes.
- `.agents/skills/autoreview/scripts/autoreview --mode local` first run found
  two P2 findings, both accepted and fixed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` second run found
  one P2 and one P3 finding, both accepted and fixed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` third run found
  one P2 finding, accepted and fixed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` fourth run found
  one P2 finding, accepted and fixed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` final rerun
  exited clean with no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-sync-plate-ui-skill.md`
  passed after final clean autoreview in `/Users/zbeyens/git/plate`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker source.
- Confidence line: high; source, generated mirrors, lint, and review gates
  verify the workflow contract.
- Flow table:
  - Reproduced: N/A for bug repro, browser N/A.
  - Verified: `pnpm install`, source audits, `pnpm lint:fix`, autoreview fixes,
    final plan check.
- Browser check: N/A: no browser surface changed.
- Outcome: `sync-plate-ui` is a generated skill with source rule, template,
  AGENTS discoverability, and fork-aware downstream sync contract.
- Caveat: this creates the workflow skill, not the structured component
  changelog JSON implementation or an actual Potion sync run.
- Design:
  - Chosen boundary: source `.agents/rules/sync-plate-ui.mdc` plus
    `docs/plans/templates/sync-plate-ui.md`.
  - Why not quick patch: generated `SKILL.md` files are mirrors and would drift.
  - Why not broader change: downstream Potion source and component changelog
    JSON implementation are separate execution goals.
- Verified: source/generated sync, lint, review, final plan check.
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: no actual downstream sync or changelog schema implementation in
  this slice.

Timeline:
- 2026-06-03T12:07:45.615Z Task goal plan created.
- 2026-06-03 Source rule and template created.
- 2026-06-03 `pnpm install` regenerated skills after source rule creation.
- 2026-06-03 Agent-native discoverability gap fixed in `.agents/AGENTS.md`.
- 2026-06-03 `pnpm install` regenerated skills and root AGENTS after
  discoverability fix.
- 2026-06-03 `pnpm lint:fix` passed.
- 2026-06-03 Initial autoreview found two P2 workflow defects; both accepted
  and fixed.
- 2026-06-03 Second autoreview found open phase rows and a bad template
  placeholder; both accepted and fixed.
- 2026-06-03 Third autoreview found a bootstrap blocker contradiction; accepted
  and fixed.
- 2026-06-03 Fourth autoreview found stale final-gate wording; accepted and
  fixed.
- 2026-06-03 Final autoreview rerun was clean.
- 2026-06-03 Final `check-complete.mjs` passed for this plan.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal complete and ready for final response |
| Where am I going? | Final response |
| What is the goal? | Create `sync-plate-ui` skill with generated mirrors and verified agent-native workflow |
| What have I learned? | Source rule plus template is the right boundary; downstream direct mutation belongs to later accepted apply runs |
| What have I done? | Created rule/template, regenerated mirrors, added discoverability, fixed review findings |

Open risks:
- Structured component changelog JSON files are still future work; the new
  skill correctly treats prose-only changelog evidence as weak fallback.
