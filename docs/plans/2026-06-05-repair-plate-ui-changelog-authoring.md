# repair plate ui changelog authoring

Objective:
Repair Plate UI changelog authoring workflow; done when dev-facing skill/template rules route registry changes to source MDX plus generator; plan docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md.

Goal plan:
docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current thread
- title: patch dev-agent Plate UI changelog authoring rules
- acceptance criteria: dev agents making Plate UI registry changes know to
  author `tooling/data/plate-ui-changelog.mdx`, run the generator, and keep
  `sync-plate-ui` as downstream-consumer tooling only.

Completion threshold:
- `.agents/rules/changeset.mdc` names
  `tooling/data/plate-ui-changelog.mdx` as the Plate UI registry changelog
  source and names the generator command.
- Goal templates that mention registry changelog artifacts no longer point to
  `docs/components/changelog.mdx`.
- Agent-facing rules/templates clarify that `sync-plate-ui` consumes public
  JSON in user apps; it does not produce upstream Plate changelog entries.
- Generated skill mirrors are synced from source rules.
- Source audits prove old stale authoring path is gone from dev-facing
  authoring rules/templates, except downstream sync docs where public JSON
  consumption is expected.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md` passes.

Verification surface:
- Source audits with `rg` over `.agents/rules`, `.agents/skills`, and
  `docs/plans/templates`.
- `pnpm install` after `.agents/rules/**` edits to regenerate skill mirrors.
- `pnpm lint:fix` for repo formatting.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `docs/plans/templates/**`, and
  `tooling/scripts/generate-ui-changelog-entries.mjs`.
- Allowed edit scope: `changeset`, task/package-api template release gates,
  narrowly relevant docs-creator release-doc guidance, and generated mirrors
  from `pnpm install`.
- Browser surface: N/A, rule/template authoring only.
- Tracker sync: N/A, no external issue.
- Non-goals: do not make `sync-plate-ui` generate upstream changelog data; do
  not wire GitHub workflow automation in this patch unless separately asked.

Output budget strategy:
- Use focused `rg` matches for changelog-path strings and short file slices.
  Exclude broad generated/build output. Cap command output to targeted source
  files and summarize large sync output.

Blocked condition:
- Stop only if generated skill sync fails from unrelated install corruption
  that remains after the repo-documented reinstall path, or if source rules
  contradict which artifact should own Plate UI changelog production.

Task state:
- task_type: agent-workflow repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: in_progress
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: source-rule and template drift needs repair
- confidence: high
- next owner: task
- reason: current rules still name `docs/components/changelog.mdx`, but the
  implemented source/generator path is `tooling/data/plate-ui-changelog.mdx`
  -> `apps/www/src/registry/changelog`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded user-provided `autogoal`, `changeset`, and `docs-creator` skill text; read `agent-native-reviewer` before closeout |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this active goal |
| Source of truth read before edits | yes | Read `.agents/rules/changeset.mdc`, docs-creator rule snippets, templates, and generator constants with focused `rg`/`sed` |
| Tracker comments and attachments read | no | N/A: no external tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: workflow-rule repair, source rules/templates are direct authority |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug repro |
| Branch decision for code-changing task | no | N/A: user did not ask for branch/PR |
| Release artifact decision | yes | Rule/template repair only; no package changeset, but release-artifact guidance is the changed surface |
| Browser tool decision for browser surface | no | N/A: no rendered app surface changed |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | See Output budget strategy |
| Agent-native pack selected | yes | `--with agent-native` used because `.agents/rules/**` and skill mirrors are changed |
| Agent-facing action surface identified | yes | `changeset` skill and goal templates are the dev-agent action surface |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; run `pnpm install` to regenerate `.agents/skills/**` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md`; review scope is skill/template discoverability |

Work Checklist:
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `rg` audit shows dev rules/templates route to `tooling/data/plate-ui-changelog.mdx` plus generator and no stale `docs/components/changelog` path remains |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: workflow-rule repair, not a runtime bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `rg` audit over `.agents/rules`, `.agents/skills`, and `docs/plans/templates`; generated mirrors include new text |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript or typed config changed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file layout changed |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed in `/Users/zbeyens/git/plate`; lockfile already up to date; skiller and fumadocs postinstall passed |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` regenerated `.agents/skills/**`; `rg` confirmed generated skill copies use new paths |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate`, the owning repo for these rules/templates |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no app UI or content route changed |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface changed |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled template output touched |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/public API changed |
| Registry-only component work changed | no | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | N/A: no registry component source changed; this patch changes authoring rules only |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no `content/**` docs page changed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: agents could keep writing stale changelog path or use downstream sync as producer. Boundary fixed in `changeset`, templates, `docs-creator`, and consumer-only `sync-plate-ui` note |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; accepted finding was stale consumer path in `sync-plate-ui`; fixed to generated JSON paths |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install corruption signal; `pnpm install` and lint passed |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: scoped rule/template wording repair; agent-native review was the relevant specialized review |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR requested |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof image |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields resolved below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; Biome checked 3254 files and applied no fixes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used focused `rg`, short `sed`, and capped outputs; no unbounded scans |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md` | Passed after closeout row update |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed twice; generated `.agents/skills/{changeset,docs-creator,sync-plate-ui}/SKILL.md` contain the new rules |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` shows `changeset` and package-api/task templates point to `tooling/data/plate-ui-changelog.mdx` plus generator; `sync-plate-ui` points to public JSON |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Review completed; no remaining accepted findings after source-path repair |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read relevant rules, templates, generator constants, and current changelog source | implementation complete |
| Implementation | complete | Patched source rules/templates and regenerated skill mirrors | verification complete |
| Verification | complete | `pnpm install`, `pnpm lint:fix`, generator dry-runs, and `rg` audits run | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | Plan evidence finalized; final checker rerun follows | final response |

Findings:
- `changeset` and task/package-api templates still pointed registry-only work at
  `docs/components/changelog.mdx`, which is stale.
- Current Plate UI changelog source is `tooling/data/plate-ui-changelog.mdx`;
  generated public JSON lives under `apps/www/src/registry/changelog` and
  `/registry/changelog/*`.
- `sync-plate-ui` had stale downstream evidence paths; it now consumes
  generated JSON and explicitly does not produce upstream entries.

Decisions and tradeoffs:
- Put upstream authoring in `changeset` because dev agents already consult it
  when deciding `.changeset` versus registry changelog.
- Put recurring goal-plan enforcement in `docs/plans/templates/task.md` and
  `docs/plans/templates/packs/package-api.md` so future autogoal plans inherit
  the right release-artifact gate.
- Add only a topology boundary to `docs-creator`; it should keep
  `/docs/releases` organized, not own changelog data production.

Implementation notes:
- Edited `.agents/rules/changeset.mdc`,
  `.agents/rules/docs-creator.mdc`, `.agents/rules/sync-plate-ui.mdc`,
  `docs/plans/templates/task.md`,
  `docs/plans/templates/packs/package-api.md`, and
  `docs/plans/templates/sync-plate-ui.md`.
- Ran `pnpm install` to regenerate generated `.agents/skills/**` mirrors.

Review fixes:
- Agent-native review found one relevant risk: downstream `sync-plate-ui` would
  still read dead changelog paths. Fixed by pointing it at generated JSON.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `check-complete.mjs` failed before plan rows were resolved | 1 | Resolve plan rows with exact evidence | This update resolves the rows; final rerun follows |
| `check-complete.mjs` failed after evidence update because Closeout was still in_progress | 1 | Mark Closeout complete and rerun exactly | This update marks Closeout complete |
| Generator dry-run reports current changelog JSON drift unrelated to this patch | 1 | Treat as pre-existing generator/provenance warning, do not write unrelated JSON | Recorded as caveat; no changelog source changed |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate`: passed; skiller regenerated
  Codex/Claude skill mirrors and fumadocs MDX postinstall passed.
- `pnpm lint:fix` in `/Users/zbeyens/git/plate`: passed; Biome checked 3254
  files and applied no fixes.
- `rg -n "docs/components/changelog|content/docs/components/changelog|generate-ui-changelog-entries|tooling/data/plate-ui-changelog|registry/changelog" .agents/rules .agents/skills docs/plans/templates`:
  no stale `docs/components/changelog` authoring path remains; new source and
  JSON paths are discoverable.
- `node tooling/scripts/generate-ui-changelog-entries.mjs`: dry-run completed;
  reports a pre-existing write target change for generated changelog JSON.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --no-provenance`:
  dry-run completed and parsed 10 source rows.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-repair-plate-ui-changelog-authoring.md`:
  passed.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: high
- Flow table:
  - Reproduced: N/A: no runtime bug; source drift reproduced by `rg`
  - Verified: `pnpm install`, `pnpm lint:fix`, `rg` audits; browser N/A
- Browser check: N/A: no browser surface changed
- Outcome: dev agents now write Plate UI changelog source via `changeset` and
  generated JSON; downstream `sync-plate-ui` consumes JSON only.
- Caveat: generator dry-run currently wants to write unrelated changelog JSON
  changes; this repair did not write those artifacts.
- Design:
  - Chosen boundary: `changeset` owns release-artifact authoring; autogoal
    templates enforce the gate; `docs-creator` owns `/docs/releases` topology;
    `sync-plate-ui` is downstream consumer tooling.
  - Why not quick patch: updating only generated `SKILL.md` would be overwritten
    by `pnpm install`.
  - Why not broader change: GH workflow automation is a separate producer/check
    step and was not requested in this patch.
- Verified: `pnpm install`, `pnpm lint:fix`, `rg` source audit
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
- Caveats: generator dry-run drift is unrelated and left untouched

Timeline:
- 2026-06-05T10:32:20.981Z Task goal plan created.
- 2026-06-05 Read skill/rule/template/generator sources.
- 2026-06-05 Patched source rules/templates for Plate UI changelog authoring.
- 2026-06-05 Ran `pnpm install` twice to regenerate skill mirrors.
- 2026-06-05 Ran generator dry-runs and `pnpm lint:fix`.
- 2026-06-05 Recorded agent-native review outcome and final evidence.
- 2026-06-05 First checker rerun failed only because Closeout was still
  `in_progress`; marked it complete.
- 2026-06-05 Final `check-complete.mjs` run passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal complete |
| Where am I going? | Final response |
| What is the goal? | Repair Plate UI changelog authoring workflow so dev agents use source MDX plus generator and downstream sync consumes JSON |
| What have I learned? | Old `docs/components/changelog.mdx` authoring path was stale in rules/templates and generated skills |
| What have I done? | Patched source rules/templates, regenerated mirrors, linted, and source-audited discoverability |

Open risks:
- Generator dry-run reports unrelated current JSON drift; this patch deliberately
  did not run `--write` because it would change changelog artifacts outside the
  rule/template repair.
