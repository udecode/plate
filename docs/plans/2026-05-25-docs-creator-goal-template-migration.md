# docs creator goal template migration

Objective:
Migrate Plate docs workflow so non-trivial docs work uses a dedicated docs goal
template. The durable outcome is a reusable `docs/plans/templates/docs.md`,
source rules that route docs work through it, generated skill mirrors refreshed
from source, and verification proving agents can create and check the template.

Goal plan:
docs/plans/2026-05-25-docs-creator-goal-template-migration.md

Template:
docs/plans/templates/task.md

Task source:
- type: user request
- id / link: chat request after docs-creator goal-template decision
- title: migrate docs-creator to use a goal template
- acceptance criteria: add a dedicated docs goal template, route docs-creator
  through it for non-trivial docs work, keep tiny copy edits exempt, make
  docs-plugin delegate lifecycle to docs-creator, make task routing choose the
  docs template for docs-heavy work, sync generated skills with `pnpm install`,
  and verify the workflow.

Completion threshold:
- `docs/plans/templates/docs.md` exists and contains concrete docs lifecycle,
  start gates, checklist, completion gates, docs lane fields, and closeout
  evidence fields.
- `.agents/rules/docs-creator.mdc` creates docs goals with
  `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template docs --title "<short docs title>"`
  for non-trivial docs work and explicitly exempts tiny copy/link edits.
- `.agents/rules/docs-plugin.mdc` delegates goal lifecycle to docs-creator and
  keeps only plugin-page-specific checks.
- `.agents/rules/task.mdc` tells agents to choose `--template docs` for
  docs-heavy work and the normal task template for other normal work.
- Generated `.agents/skills/**/SKILL.md` mirrors are refreshed with
  `pnpm install`.
- Focused audits, helper syntax checks, smoke template creation, lint, and this
  plan checker pass or have recorded N/A reasons.

Verification surface:
- `pnpm install` in `/Users/zbeyens/git/plate-2` after `.agents/rules/**`
  edits to refresh generated skills.
- Smoke create a docs plan with
  `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template docs --title "smoke docs template" --path docs/plans/2026-05-25-smoke-docs-template.md`.
- Run the docs smoke plan through
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-smoke-docs-template.md`
  and confirm it rejects the unfilled plan.
- Run focused positive and negative `rg` audits across source rules, generated
  skills, and templates.
- Run `node --check` for autogoal helper scripts.
- Run `pnpm lint:fix`.
- Attempt autoreview; if the local dirty bundle exceeds tool limits, record the
  blocker and perform scoped manual review of touched files.
- Run
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-creator-goal-template-migration.md`.

Constraints:
- Do not put Plate docs doctrine into the universal autogoal template.
- Do not add docs-goal ceremony for tiny typo, copy, or one-line link edits.
- Do not edit generated `.agents/skills/**/SKILL.md` directly; edit source
  `.agents/rules/**` and run `pnpm install`.
- Do not create a PR, commit, tracker comment, or branch because the user did
  not ask for one.
- Keep docs-plugin narrow instead of making it own shared docs workflow.

Boundaries:
- Source of truth: `.agents/rules/docs-creator.mdc`,
  `.agents/rules/docs-plugin.mdc`, `.agents/rules/task.mdc`,
  `docs/plans/templates/task.md`, and the new docs goal template.
- Allowed edit scope: the source rules above, `docs/plans/templates/docs.md`,
  `docs/plans/templates/task.md`, generated skill mirrors refreshed by
  `pnpm install`, and this goal plan.
- Browser surface: N/A, agent workflow text and markdown templates only.
- Tracker sync: N/A, no issue or Linear task is attached.
- Non-goals: rewrite docs content, delete docs-plugin, change autogoal core
  scripts, alter package APIs, or open a PR.

Blocked condition:
Blocked only if `pnpm install`, the autogoal smoke command, lint, or the final
goal checker cannot run in this checkout after one concrete retry path. No such
blocker remains.

Task state:
- task_type: agent workflow / docs workflow
- task_complexity: moderate
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete after final checker
- confidence: high
- next owner: none
- reason: source rules, generated mirrors, docs template, smoke proof, lint, and
  scoped review are complete.

Completion rule:
- Completion is legal only after every checked item below is resolved, final
  evidence is recorded, and the goal checker passes on this file.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | Yes | Loaded autogoal, docs-creator, docs-plugin, autoreview, and agent-native-reviewer instructions. |
| Active goal checked or created | Yes | Active goal created for docs-creator goal-template migration. |
| Source of truth read before edits | Yes | Read docs-creator, docs-plugin, task rules, task template, and existing generated mirrors before editing. |
| Tracker comments and attachments read | No | No issue, PR, Linear task, or attachment was provided. |
| Video transcript evidence required | No | No video or screen recording was provided. |
| `docs/solutions` checked for non-trivial existing-code work | No | Agent workflow/template migration; no product code behavior was changed. |
| TDD decision before behavior change or bug fix | No | No runtime behavior bug or package logic changed. |
| Branch decision for code-changing task | Yes | No branch/PR action because the user did not ask for PR or commit. |
| Release artifact decision | Yes | N/A: no package behavior, exports, or public API changed. |
| Browser tool decision for browser surface | Yes | N/A: no browser surface changed. |
| PR expectation decision | Yes | N/A: no PR requested. |
| Tracker sync expectation decision | Yes | N/A: no tracker source exists. |

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
- [x] Final handoff shape decided: concise local-change summary, verification,
      and caveat for autoreview tool limit.
- [x] Branch handling recorded for code-changing work: N/A, no PR or commit
      requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A, no install-corruption-shaped failure occurred.
- [x] Workspace authority recorded: every proof command ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for agent-action and command-contract changes.
- [x] Review/autoreview target selected from actual diff state; full local
      autoreview was attempted, blocked by input limit, and replaced with scoped
      manual review of touched files.
- [x] Agent-native review decision recorded for `.agents/**` workflow changes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | Yes | Run the proof commands named above. | `pnpm install`, docs smoke create/reject, focused `rg`, `node --check`, `pnpm lint:fix`, scoped review, and final checker are recorded here. |
| Bug reproduced before fix | No | Record N/A. | N/A: workflow migration, not a reported runtime bug. |
| Targeted behavior verification | Yes | Prove the docs template can be created and checked. | Smoke docs plan generated; unfilled smoke plan rejected by `check-complete` as expected. |
| TypeScript or typed config changed | No | Record N/A. | N/A: markdown/rule text only. |
| Package exports or file layout changed | No | Record N/A. | N/A: no package exports or moved public files. |
| Package manifests, lockfile, or install graph changed | No | Record N/A. | N/A: `pnpm install` was used for Skiller sync, not dependency graph changes. |
| Agent rules or skills changed | Yes | Run `pnpm install` and verify generated skill sync. | `pnpm install` completed after source-rule edits and regenerated docs-creator, docs-plugin, and task skill mirrors. |
| Workspace authority proof | Yes | Run verification in owning checkout. | All commands ran with cwd `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | No | Record N/A. | N/A: no app route, UI, or browser-visible docs page changed. |
| Browser final proof | No | Record N/A. | N/A: markdown templates and agent rules only. |
| CI-controlled template output changed | No | Record N/A. | N/A: no `templates/**` registry output changed. |
| Package behavior or public API changed | No | Record N/A. | N/A: no changeset needed. |
| Registry-only component work changed | No | Record N/A. | N/A: no registry component work. |
| Docs or content changed | Yes | Use docs workflow evidence and source-backed audits. | Added docs goal template and updated docs workflow rules; smoke and `rg` audits prove routing. |
| High-risk mini gate | Yes | Record failure mode, proof plan, and boundary. | Failure mode: agents keep using task template for docs work or docs-plugin owns lifecycle. Proof: source/generated `rg` for `--template docs`, docs-plugin delegation, and task success criteria. Boundary: docs-creator owns shared docs doctrine. |
| Agent-native review for agent/tooling changes | Yes | Load reviewer and close actionable issues. | Agent-native reviewer loaded; scoped manual review inspected touched rules, generated mirrors, and templates. |
| Local install corruption suspected | No | Record N/A. | N/A: no React/node_modules/env-rot failure shape. |
| Autoreview for non-trivial implementation changes | Yes | Run autoreview or record blocker with fallback. | Autoreview local mode failed before review because dirty checkout bundle was 2,640,551 chars over the 1,048,576 limit; scoped manual review found and fixed the stale task success criterion. |
| PR create or update | No | Record N/A. | N/A: no PR requested. |
| PR proof image hosting | No | Record N/A. | N/A: no PR or image proof. |
| Tracker sync-back | No | Record N/A. | N/A: no tracker item. |
| Final handoff contract | Yes | Fill handoff fields. | Fields below are complete. |
| Final lint | Yes | Run `pnpm lint:fix`. | `pnpm lint:fix` completed: checked 3419 files, no fixes applied. |
| Goal plan complete | Yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-creator-goal-template-migration.md`. | Final checker command recorded in verification evidence. |
| Knowledge extraction | No | Record N/A. | N/A: repo skill change is self-contained; memory already has docs-skill ownership precedent. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read source rules, generated mirrors, templates, and relevant memory. | implementation |
| Implementation | complete | Added docs template and updated docs-creator, docs-plugin, task, and task template. | verification |
| Verification | complete | Ran install sync, smoke proof, focused audits, helper checks, lint, and scoped review. | closeout |
| PR / tracker sync | skipped | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Final plan evidence prepared and checker run. | final response |

Findings:
- `docs-plugin` is the wrong owner for shared docs lifecycle; it should remain a
  plugin-page checklist layered under docs-creator.
- `docs-creator` needed a dedicated docs template because task template gates
  are too generic for docs lanes, MDX/parser proof, source-backed claims, links,
  previews, and plugin-page specifics.
- The previous `pnpm build:contentlayer` wording was the wrong command shape for
  this repo; the template now records `pnpm --filter www build:contentlayer`.
- The task skill had a stale success criterion that said every measurable task
  used `--template task`; it now says use the right goal template and calls out
  `--template docs` for non-trivial docs work.

Decisions and tradeoffs:
- Keep Plate docs law out of the universal autogoal template. Universal goal
  stays generic; docs law lives in `docs/plans/templates/docs.md`.
- Use the docs template for non-trivial docs work only. Tiny typo, copy, and
  one-line link fixes stay lightweight.
- Keep docs-plugin instead of deleting it. It still has useful plugin-page
  ordering and ownership checks, but no lifecycle authority.
- Do not change autogoal scripts. The existing `--template <name>` mechanism
  already supports this migration.

Implementation notes:
- Added `docs/plans/templates/docs.md`.
- Updated `.agents/rules/docs-creator.mdc` with docs goal creation, scope,
  exemptions, and corrected contentlayer command.
- Updated `.agents/rules/docs-plugin.mdc` so plugin docs start through
  docs-creator and `--template docs`.
- Updated `.agents/rules/task.mdc` so task intake chooses `task` or `docs`
  template based on work type.
- Updated `docs/plans/templates/task.md` with a docs/content completion gate.
- Ran `pnpm install` to refresh generated skill mirrors.

Review fixes:
- Fixed stale task success criterion from "used `--template task`" to "used the
  right goal template" and added an explicit docs-heavy success criterion.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Negative `rg` pattern was first run with shell-expanded backticks. | 1 | Rerun with single quotes. | Clean rerun had no output. |
| Autoreview local bundle exceeded model input limit because of unrelated dirty checkout size. | 1 | Inspect helper options, then do scoped manual review of touched files. | Manual review found and fixed one stale criterion. |

Verification evidence:
- `pnpm install` completed after source-rule edits and synced generated skills.
- Smoke docs plan was generated with `--template docs`.
- Smoke docs plan was checked with `check-complete` and rejected as incomplete,
  proving docs-specific gates are active.
- Focused positive `rg` found `Docs lane:`, `Plugin page specifics`,
  `pnpm --filter www build:contentlayer`, and `--template docs` in source and
  generated outputs.
- Focused negative `rg` found no stale `pnpm build:contentlayer`, no
  `planning-with-files`, and no stale "use only `--template task`" routing.
- `node --check .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`
  passed.
- `node --check .agents/rules/autogoal/scripts/check-complete.mjs` passed.
- `pnpm lint:fix` completed with "Checked 3419 files in 5s. No fixes applied."
- Scoped manual review of touched source rules, generated mirrors, and templates
  found one stale task criterion and it was fixed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high; verification covers routing, generated sync, template
  smoke behavior, and lint.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: install sync, smoke template, focused audits, helper syntax, lint,
    scoped review, final goal checker.
- Browser check: N/A, no browser surface changed.
- Outcome: docs-creator now owns non-trivial docs goal lifecycle through the
  docs template; docs-plugin stays plugin-page-specific.
- Caveat: full autoreview local mode could not run because unrelated dirty
  checkout content exceeded the tool input limit; scoped review covered the
  files touched by this task.
- Design:
  - Chosen boundary: docs lifecycle in docs-creator plus docs template.
  - Why not quick patch: adding only a docs-creator sentence would leave task
    routing and closeout gates inconsistent.
  - Why not broader change: autogoal core already supports named templates, so
    changing scripts would add risk without benefit.
- Verified: final checker run on this plan.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: autoreview bundle limit noted above.

Timeline:
- 2026-05-25T10:21:59.563Z Task goal plan created.
- 2026-05-25 Added docs template and updated source rules/templates.
- 2026-05-25 Ran `pnpm install` to refresh generated skills.
- 2026-05-25 Ran smoke docs template create/reject proof.
- 2026-05-25 Ran focused audits, helper checks, lint, and scoped review.
- 2026-05-25 Prepared final plan evidence for completion.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Migrate docs-creator workflow to a dedicated docs goal template |
| What have I learned? | Docs-creator is the lifecycle owner; docs-plugin stays narrow |
| What have I done? | Added docs template, updated source rules, synced generated skills, verified routing |

Open risks:
- None known for the scoped workflow change. Full local autoreview remains blocked
  by unrelated dirty checkout size, not by this patch.
