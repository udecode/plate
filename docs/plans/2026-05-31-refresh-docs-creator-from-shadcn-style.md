# refresh docs creator from shadcn style

Objective:
Refresh Plate docs-creator doctrine from the local shadcn docs corpus so future Plate docs inherit the useful shadcn MDX/page-writing patterns without losing Plate's source-backed ownership rules.

Goal plan:
docs/plans/2026-05-31-refresh-docs-creator-from-shadcn-style.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user chat request
- id / link: N/A
- title: Refresh docs-creator from shadcn docs style
- acceptance criteria: inventory all local shadcn docs MDX pages, extract recurring writing and MDX-component patterns into a source-backed artifact, update `.agents/rules/docs-creator.mdc`, sync generated mirrors through `pnpm install`, run verification, and close with `autoreview`.

Completion threshold:
Task closure is legal only when every shadcn docs MDX page under `../shadcn/apps/v4` is counted and sampled by script, a source-backed style artifact is written, `.agents/rules/docs-creator.mdc` contains the accepted shadcn-derived authoring rules, generated docs-creator skill mirrors are synced, verification commands pass, `autoreview` has no accepted/actionable findings, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-refresh-docs-creator-from-shadcn-style.md` passes.

Verification surface:
- Shadcn corpus inventory artifact under `docs/sync/shadcn/`.
- Source audit for added docs-creator style rules in `.agents/rules/docs-creator.mdc` and generated mirrors.
- `pnpm install` to regenerate skill mirrors after source-rule edits.
- `pnpm lint:fix`.
- `pnpm --filter www build:source` for docs/MDX source generation sanity.
- `.agents/skills/autoreview/scripts/autoreview --mode local` until no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-refresh-docs-creator-from-shadcn-style.md`.

Constraints:
- Edit source-of-truth `.agents/rules/docs-creator.mdc`; do not hand-edit generated `SKILL.md` mirrors.
- Preserve Plate-specific docs rules for source-backed claims, ownership maps, packages, demos, previews, and no changelog voice.
- Add shadcn-derived style doctrine as authoring guidance, not as a blind rewrite mandate.
- Do not run `build:registry`.
- Do not create commits, pushes, PRs, or tracker updates.

Boundaries:
- Source of truth: local shadcn docs corpus under `../shadcn/apps/v4`, current `.agents/rules/docs-creator.mdc`, generated docs-creator mirrors, and Plate repo instructions.
- Allowed edit scope: `.agents/rules/docs-creator.mdc`, generated mirrors produced by `pnpm install`, the instantiated goal plan, and a source-backed shadcn style artifact under `docs/sync/shadcn/`.
- Browser surface: N/A unless verification reveals a docs rendering regression; this is authoring-rule work.
- Tracker sync: N/A; no issue or PR target.
- Non-goals: rewriting Plate docs pages now, broad shadcn docs migration, registry output, changing docs app runtime.

Output budget strategy:
- Use `rg --files` and script summaries for corpus inventory instead of streaming all MDX content.
- Exclude `node_modules`, `.next`, generated build output, images, lockfiles, and source maps from corpus scans.
- Save aggregate shadcn style findings to an artifact, then inspect only representative short slices.
- Cap shell output on reads and audits; use counts, filenames, and top examples before opening files.

Blocked condition:
Blocked only if the local shadcn checkout is missing/unreadable, `pnpm install` cannot sync generated skill mirrors, or `autoreview` cannot complete after the documented retry/timeout policy.

Task state:
- task_type: agent docs-rule repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete after autogoal mechanical check
- confidence: high
- next owner: final response
- reason: corpus artifact, source rule update, generated mirror sync, verification commands, agent-native audit, and autoreview are complete.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-refresh-docs-creator-from-shadcn-style.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User explicitly invoked `autogoal`, `docs-creator`, and `autoreview`; their pasted skill bodies and repo instructions define the workflow. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this active goal. |
| Source of truth read before edits | yes | Read `.agents/rules/docs-creator.mdc`, generated `.agents/skills/docs-creator/SKILL.md`, representative shadcn docs, and generated full corpus artifact. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: memory points to the durable shadcn comparison artifact; no solution doc was named. |
| TDD decision before behavior change or bug fix | yes | N/A: agent-rule/docs doctrine repair is verified by source audit, sync, lint, build:source, and review. |
| Branch decision for code-changing task | yes | N/A: no branch operation requested; repo says do not inspect git state proactively. |
| Release artifact decision | yes | N/A: no package or registry release artifact. |
| Browser tool decision for browser surface | yes | N/A unless rule changes reveal rendered docs regression. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker target. |
| Output budget strategy recorded | yes | Recorded above before broad corpus scan. |
| Docs pack selected | yes | Docs authoring doctrine is the subject of the change. |
| `docs-creator` loaded | yes | User provided the `docs-creator` skill body; source rule still to be read. |
| Docs lane selected | yes | Authoring-doctrine lane for all Plate docs. |
| Target docs and nearest sibling docs read | yes | Read docs-creator source/generated skill plus shadcn representative component, install, registry, and MDX component files. |
| Docs style doctrine read | yes | Read and updated `.agents/rules/docs-creator.mdc`; generated mirror synced through `pnpm install`. |
| Documented source owner identified | yes | `.agents/rules/docs-creator.mdc` is source of truth; generated `SKILL.md` mirrors are sync output. |
| Agent-native pack selected | yes | Rule/skill changes affect agent action. |
| Agent-facing action surface identified | yes | Agents read generated `.agents/skills/docs-creator/SKILL.md`; humans/editors maintain `.agents/rules/docs-creator.mdc`. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/docs-creator.mdc`, then run `pnpm install` to sync mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; reviewed changed agent action surface as source-rule/generated-skill discoverability, no accepted findings. |

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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Passed corpus inventory audit, source/mirror marker audit, `pnpm install`, `pnpm lint:fix`, `pnpm --filter www build:source`, and final `autoreview`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: docs-rule refresh, not a runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source audit confirms docs-creator rule and generated skill include corrected shadcn style doctrine and package-manager command guidance. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS or typed config changed for this goal. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed after removing stale external `orchestrator` lock conflict. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated `.agents/skills/docs-creator/SKILL.md` mirrors source rule markers. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All verification ran in `/Users/zbeyens/git/plate`, the owning repo for `.agents` and `apps/www` docs source generation. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no rendered app/browser surface changed by this goal. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: authoring-rule and corpus artifact change only. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package/API behavior changed. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Used docs pack with source-backed corpus artifact; `pnpm --filter www build:source` passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Agent-action risk was stale or wrong docs-agent doctrine; proof used source/mirror sync audit, command-renderer source check, agent-native review, and autoreview. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; manual review found the generated skill is discoverable and source-backed, no accepted findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: initial install failure was a Skiller lock ownership conflict, not local env rot. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final `autoreview --mode local` passed clean after fixing accepted findings. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR created or updated. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker target. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled final handoff fields with no PR/tracker/browser and exact verification commands. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; Biome checked 3155 files, no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used capped reads and artifacted corpus summaries; one broad `rg` returned truncated output but did not block. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-refresh-docs-creator-from-shadcn-style.md` | To run after this evidence update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Verified corpus inventory, preview counts, CodeTabs source contract, and source/mirror doctrine markers. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Corpus artifact represents upstream docs inventory; no new rendered Plate doc page or preview name was added. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source` passed. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: docs-creator doctrine changed, no plugin page authored. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed and source/mirror audit passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/skills/docs-creator/SKILL.md` includes the new shadcn style layer and corrected command-tab guidance. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded and applied; no accepted/actionable agent-native findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Created active autogoal plan; read repo docs-creator source, generated skill, and shadcn upstream references. | implementation done |
| Implementation | complete | Created shadcn corpus artifact, updated `.agents/rules/docs-creator.mdc`, removed stale `orchestrator` external lock conflict, and synced generated skills. | verification done |
| Verification | complete | `pnpm install`, corpus/source audits, `pnpm lint:fix`, `pnpm --filter www build:source`, agent-native review, and final `autoreview` passed. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | complete | Plan evidence filled; final autogoal check remains the last mechanical command. | final response |

Findings:
- `CodeTabs` in Plate is keyed by `installationType: cli | manual`, so docs-creator must not tell agents to use it for package-manager variants.
- Shadcn corpus preview count is 879 `<ComponentPreview>` tags across 128 pages.

Decisions and tradeoffs:
- Kept shadcn as a style/MDX grammar reference, not behavior authority; Plate source remains the authority for package names, command rendering, registry source, examples, demos, and ownership.
- Removed the stale external `orchestrator` entry from `skills-lock.json` through Skiller because `.agents/rules/orchestrator.mdc` is already local source-of-truth and the lock conflict blocked required generated skill sync.
- Did not rewrite any Plate docs pages in this goal; the request was to update docs-creator doctrine.

Implementation notes:
- Wrote `docs/sync/shadcn/docs-style-corpus-2026-05-31.md` from all 220 markdown/MDX files under `../shadcn/apps/v4`.
- Added the shadcn style layer and Component / Registry Item lane to `.agents/rules/docs-creator.mdc`.
- Ran `pnpm install` to sync `.agents/skills/docs-creator/SKILL.md`.

Review fixes:
- Autoreview P2: fixed wrong autogoal closeout path in the plan from `.agents/rules/autogoal/...` to `.agents/skills/autogoal/...`.
- Autoreview P2: corrected docs-creator guidance so package-manager variants use plain command fences, while `<CodeTabs>` stays CLI/manual only.
- Autoreview P3: corrected corpus preview count to 879 previews across 128 pages.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm install` failed on Skiller conflict: local `orchestrator` rule plus external `skills-lock.json` entry | 1 | Remove stale external lock ownership through `bun x skiller@latest remove orchestrator -y` | Resolved; `pnpm install` passed afterward. |
| `autoreview` found incorrect autogoal script path in plan | 1 | Patch plan command path and rerun review | Resolved; later review moved to next issues. |
| `autoreview` found invalid package-manager `CodeTabs` guidance and stale preview counts | 1 | Patch docs rule and corpus artifact, sync generated skill, rerun checks | Resolved; final autoreview clean. |

Verification evidence:
- `node` corpus inventory audit: 220 markdown/MDX files under `../shadcn/apps/v4` represented in `docs/sync/shadcn/docs-style-corpus-2026-05-31.md`.
- `node` source/mirror audit: `.agents/rules/docs-creator.mdc` and `.agents/skills/docs-creator/SKILL.md` include shadcn style doctrine and corrected package-manager command guidance.
- `node` preview count audit: 879 `<ComponentPreview>` tags across 128 pages match the corpus artifact.
- `pnpm install`: passed; Skiller applied Claude Code/Codex rules and `apps/www` postinstall generated MDX source.
- `pnpm lint:fix`: passed; Biome checked 3155 files, no fixes applied.
- `pnpm --filter www build:source`: passed; Fumadocs MDX generated files.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...`: final rerun passed clean with no accepted/actionable findings.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker target.
- Confidence line: High: corpus, sync, lint, MDX source generation, agent-native audit, and autoreview passed.
- Flow table:
  - Reproduced: N/A for runtime bug; Skiller install conflict reproduced during `pnpm install`.
  - Verified: local verification passed; browser N/A.
- Browser check: N/A, no rendered browser surface changed.
- Outcome: docs-creator now encodes source-backed shadcn writing/MDX style, with Plate command-rendering and ownership rules preserved.
- Caveat: `autoreview --mode local` reviewed a checkout that also contains earlier local UI work; the prompt scoped findings to this goal unless interactions existed.
- Design:
  - Chosen boundary: source `.agents/rules/docs-creator.mdc`, generated skill via `pnpm install`, and source-backed corpus artifact.
  - Why not quick patch: generated `SKILL.md` is not source-of-truth and would drift.
  - Why not broader change: no Plate docs page rewrite was requested; doctrine update is the right reusable boundary.
- Verified: `pnpm install`, corpus/source audits, `pnpm lint:fix`, `pnpm --filter www build:source`, agent-native audit, and clean autoreview.
- PR body verified: N/A, no PR.

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
- Caveats: local checkout contains earlier app UI work outside this goal; review prompt scoped the goal-specific review.

Reboot status:
- Current state is recoverable from this plan, the corpus artifact, synced generated skill, and verification evidence. No reboot/blocker remains.

Open risks:
- None for the requested doctrine update. Future `.agents/rules/**` edits still need `pnpm install` to keep generated skills synced.

Timeline:
- 2026-05-31T07:26:24.640Z Task goal plan created.
- 2026-05-31T07:36:00Z Corpus artifact written for 220 upstream markdown/MDX files.
- 2026-05-31T07:46:00Z Skiller lock conflict resolved and `pnpm install` sync passed.
- 2026-05-31T08:07:00Z Final autoreview passed clean.

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
