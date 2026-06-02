# consolidate slate v2 agent docs

Objective:
One-shot execution: consolidate Slate v2 agent-facing docs and workflow rules
for the already-large 4k-prompt development history.

Goal plan:
docs/plans/2026-05-30-consolidate-slate-v2-agent-docs.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current Codex thread, 2026-05-30
- title: Consolidate Slate v2 agent docs and workflow modes
- acceptance criteria:
  - add `docs/slate-v2/agent-start.md` with <=120 lines
  - make `docs/slate-v2` entrypoints prefer summaries/indexes over giant
    ledgers
  - update stale current API snippets in Slate v2 docs
  - keep `slate-patch` mostly intact
  - split `slate-plan` rule behavior into `--quick`, `--standard`, and
    `--deep`
  - add a repeatable doc-audit check for stale Slate v2 API snippets
  - sync generated skills after `.agents/rules/**` edits

Completion threshold:
- Done when all acceptance criteria above are implemented, stale-doc audit
  passes, generated skills are synced, focused source audits prove the intended
  entrypoints/rules exist, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-30-consolidate-slate-v2-agent-docs.md` passes.

Verification surface:
- `node tooling/scripts/check-slate-v2-docs.mjs`
- `pnpm install`
- `pnpm lint:fix`
- source audits for `agent-start`, `slate-plan` modes, generated skill sync,
  and stale API snippet cleanup
- goal-plan mechanical closeout check

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `docs/slate-v2/**`,
  `tooling/scripts/**`, `package.json`, and the generated `.agents/skills/**`
  mirrors after `pnpm install`.
- Allowed edit scope: agent-facing docs/rules/scripts/package scripts and this
  goal plan.
- Browser surface: N/A, no UI/runtime route behavior changed.
- Tracker sync: N/A, no issue/Linear/PR requested.
- Non-goals: do not touch `.tmp/slate-v2` implementation; do not split giant
  ledgers physically unless references require it; do not rewrite
  `slate-patch`.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills, the doc-audit cannot
  be made deterministic from current public-surface contracts, or a required
  source file is unavailable.

Task state:
- task_type: docs + agent-native workflow cleanup
- task_complexity: normal
- current_phase: intake
- current_phase_status: complete
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: implement
- confidence: high
- next owner: task
- reason: current docs/rules are useful but too large for frequent 4k-prompt
  agent loops; a thin entrypoint and mode split reduce review bandwidth without
  weakening deep gates.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-30-consolidate-slate-v2-agent-docs.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | used `autogoal`; reviewed pasted `slate-plan`/`slate-patch` context and loaded `agent-native-reviewer` for agent-facing changes |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this lane |
| Source of truth read before edits | yes | read `docs/slate-v2/overview.md`, `master-roadmap.md`, `ledgers/README.md`, `absolute-architecture-release-claim.md`, `.agents/rules/slate-plan.mdc`, `.agents/rules/slate-patch.mdc`, package scripts, and live `.tmp/slate-v2` public API/test snippets |
| Tracker comments and attachments read | yes | user provided pasted orchestration-tax text and explicit acceptance criteria |
| Video transcript evidence required | no | N/A: no video/browser repro in this task |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: docs/agent workflow cleanup, no product code implementation |
| TDD decision before behavior change or bug fix | no | N/A: no Slate runtime behavior changed; doc-audit script gets direct command proof |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR |
| Release artifact decision | no | N/A: no package release behavior changed |
| Browser tool decision for browser surface | no | N/A: no browser surface changed |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker sync requested |
| Docs pack selected | yes | docs pack applied to this plan |
| `docs-creator` loaded | no | N/A: internal agent docs, not Plate public docs lane |
| Docs lane selected | yes | internal Slate v2 agent docs consolidation |
| Target docs and nearest sibling docs read | yes | read Slate v2 overview, roadmap, ledgers README, release claim, architecture contract snippets |
| Docs style doctrine read | yes | AGENTS docs current-state rule read in prompt |
| Documented source owner identified | yes | current API owner is `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts` plus live docs/examples |
| Agent-native pack selected | yes | agent-native pack applied to this plan |
| Agent-facing action surface identified | yes | `.agents/rules/slate-plan.mdc`, generated `.agents/skills/slate-plan/SKILL.md`, `docs/slate-v2/agent-start.md` |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/*.mdc`, then run `pnpm install`; do not hand-edit generated skills |
| `agent-native-reviewer` loaded or waiver recorded | yes | loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no accepted/actionable findings for this agent-facing docs/rule cleanup |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm docs:slate-v2:audit`, `pnpm install`, `pnpm lint:fix`, source audits recorded below |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: docs/agent workflow cleanup, not a runtime bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm docs:slate-v2:audit` proves stale API snippet cleanup; source audits prove mode split and indexes |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS typed config or package code changed; script syntax checked with `node --check` |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or barrels changed |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed and regenerated skills through skiller |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` verified mode text in generated `.agents/skills/slate-plan/SKILL.md` |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | docs/rules checks ran in `plate-2`; current API evidence read from `.tmp/slate-v2` public-surface contract/source |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser or UI runtime changed |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface changed |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no templates output changed |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no published package behavior changed |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | docs pack applied; source-backed claims verified by `pnpm docs:slate-v2:audit` and source audits |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: quick mode could under-review release-grade plans. Mitigation: standard/deep triggers retained for durable plans, release/API/collab/issue-risk lanes. Proof: generated skill contains trigger text. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | loaded reviewer skill; no accepted/actionable findings because changes are directly discoverable from generated skill and npm script |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local-env-rot signal |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: docs/agent rule cleanup; agent-native review and mechanical audits are the correct closeout |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof images |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | final handoff fields completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed, Biome fixed formatting |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-30-consolidate-slate-v2-agent-docs.md` | to run after this plan update |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `pnpm docs:slate-v2:audit` passed; stale old API grep returned no matches in release claim/architecture contract |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | source audit read overview and ledger README with new links; paths point to created files |
| Docs MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: internal markdown docs outside www contentlayer |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: not plugin docs |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `.agents/skills/slate-plan/SKILL.md` includes mode split |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found `--quick`, `--standard`, `--deep`, and orchestration-tax text in source and generated skill |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | loaded; no accepted/actionable findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read user text, Slate v2 docs, current `.tmp/slate-v2` public API surface, slate-plan/slate-patch rules | implementation |
| Implementation | complete | added agent-start, issue-dossier index, doc audit script, package script, stale API doc cleanup, slate-plan mode split | verification |
| Verification | complete | audit, install/sync, lint, source audits, script syntax check | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | final plan update plus check-complete | final response |

Findings:
- The old docs were useful but too expensive for frequent agent work:
  `docs/slate-v2/**` had about 21k lines, with `fork-issue-dossier.md` at
  7,864 lines.
- `absolute-architecture-release-claim.md` and `architecture-contract.md`
  still taught stale `editor.getSelection()` / `editor.getChildren()` and
  direct editor write snippets while live `.tmp/slate-v2` public examples and
  contracts teach `editor.read((state) => ...)` and `editor.update((tx) => ...)`.
- `slate-patch` already has the right shape for bug work: one-pass repro,
  behavior test, owner fix, pressure review, focused verification, autoreview.

Decisions and tradeoffs:
- Add a thin `agent-start.md` instead of rewriting all long docs. This lowers
  cold-start cost without deleting evidence.
- Keep giant dossiers but put them behind an index. Physical splitting can wait
  until a specific ledger edit needs it.
- Make `slate-plan --quick` the default for lightweight architecture questions,
  while keeping `--standard` and `--deep` for durable/release-grade work.
- Keep `slate-patch` unchanged except generated sync, because it already avoids
  Slate Plan ceremony for bug fixes.
- Add a doc-audit script instead of relying on humans to remember the latest
  public-surface contract.

Implementation notes:
- Added [agent-start.md](/Users/zbeyens/git/plate-2/docs/slate-v2/agent-start.md).
- Added [issue-dossier-index.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/issue-dossier-index.md).
- Updated [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md) and [ledgers/README.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/README.md) to make indexes first-read.
- Updated current API snippets in [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/slate-v2/absolute-architecture-release-claim.md) and [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md).
- Updated `decorate` claim width in [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md).
- Added [check-slate-v2-docs.mjs](/Users/zbeyens/git/plate-2/tooling/scripts/check-slate-v2-docs.mjs) and `pnpm docs:slate-v2:audit`.
- Updated `.agents/rules/slate-plan.mdc` and synced generated `.agents/skills/slate-plan/SKILL.md`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm docs:slate-v2:audit` from `plate-2`: passed.
- `node --check tooling/scripts/check-slate-v2-docs.mjs` from `plate-2`: passed.
- `wc -l docs/slate-v2/agent-start.md`: 83 lines.
- `pnpm install` from `plate-2`: passed; skiller regenerated agent skills.
- `rg "Mode Selection|--quick|--standard|--deep|orchestration tax" .agents/skills/slate-plan/SKILL.md`: generated skill includes mode split.
- `rg "Slate Patch|Goal Setup|Do not create a Slate Plan pass schedule" .agents/skills/slate-patch/SKILL.md`: slate-patch remains one-pass bug lane.
- `pnpm lint:fix` from `plate-2`: passed.
- `rg 'editor\\.getSelection|editor\\.getChildren|editor\\.insertNodes|editor\\.setNodes|editor\\.moveNodes|editor\\.delete\\(' docs/slate-v2/absolute-architecture-release-claim.md docs/slate-v2/references/architecture-contract.md`: no matches.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no issue/tracker sync requested.
- Confidence line: high; all named artifact checks passed.
- Flow table:
  - Reproduced: N/A, docs/agent workflow cleanup.
  - Verified: docs audit passed, install/sync passed, lint passed, source audits passed.
- Browser check: N/A, no browser surface changed.
- Outcome: Slate v2 docs now have a short agent entrypoint, stale API snippets were updated, giant issue dossier is indexed, and Slate Plan has quick/standard/deep modes.
- Caveat: giant ledgers were not physically split; they are indexed and demoted from first-read. Physical splitting should be a later ledger-maintenance task if it becomes useful.
- Design:
  - Chosen boundary: docs/rules/scripts, not Slate runtime code.
  - Why not quick patch: stale docs and mode-selection pressure were systemic.
  - Why not broader change: deleting or physically splitting giant ledgers risks losing issue evidence; indexing gives the review-bandwidth win with lower risk.
- Verified: commands listed in Verification evidence.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: giant ledgers remain as references, not first-read docs.

Timeline:
- 2026-05-30T08:42:25.822Z Task goal plan created.
- 2026-05-30T09:00Z Added agent entrypoint, issue index, docs audit script, stale API cleanup, and slate-plan mode split.
- 2026-05-30T09:05Z Ran `pnpm install`, `pnpm docs:slate-v2:audit`, `node --check`, and `pnpm lint:fix`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after goal-plan check |
| What is the goal? | Consolidate Slate v2 agent-facing docs/rules for low-orchestration 4k-prompt development |
| What have I learned? | See Findings |
| What have I done? | See Timeline and Implementation notes |

Open risks:
- Giant ledgers are still large; they are indexed, not physically split.
