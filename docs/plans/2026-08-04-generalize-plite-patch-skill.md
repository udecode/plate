# Generalize Plite patch skill

Objective:
Generalize `plite-patch` into `patch`; done when source/routing rename,
generated sync, stale-symbol audit, and agent-native review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-04-generalize-plite-patch-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user request
- id / link: current conversation
- title: Generalize `plite-patch` to `patch`
- acceptance criteria: rename the source skill to `patch`, generalize its local
  repair protocol across Plate and Plite, update related skills and routing,
  regenerate installed mirrors, and prove the old route is no longer active.

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
- initial confidence score: N/A: binary artifact and review gates are stronger
- improvement loop: N/A: one-shot execution closes named gates
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- `.agents/rules/patch.mdc` is the sole local Plate/Plite behavior-bug and
  regression repair owner, and `.agents/rules/plite-patch.mdc` no longer
  exists.
- Related source routing names `patch`; generated skill mirrors are regenerated
  by `pnpm install`; no active rule/skill route still names `plite-patch`.
- Agent-native review reports no accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-generalize-plite-patch-skill.md` passes.

Verification surface:
- `pnpm install` in `/Users/zbeyens/git/plate-2`.
- Focused `rg` audits across `.agents/AGENTS.md`, `.agents/rules`, and
  `.agents/skills` for `patch` ownership and stale `plite-patch` routes.
- Agent-native capability map and review of the actual changed source/mirrors.
- Scoped lint/format audit or explicit N/A evidence when the repo ignores the
  changed Markdown/rule paths.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve the existing reproduce, red-proof, durable-owner, architecture
  pressure, verification, changeset, Browser, and P2 autoreview protocol.
- Keep public GitHub lifecycle with coordinators such as `maintainer` and
  `resolve-slate-issue`; `patch` owns local code and proof only.
- Do not keep a compatibility alias or wrapper named `plite-patch`.
- Keep generated skill discovery only under `.agents` and `.claude`; remove
  task-created mirrors under `.adal`, `.augment`, `.bob`, `.codebuddy`,
  `.commandcode`, `.continue`, `.cortex`, `.crush`, `.factory`, `.goose`,
  `.iflow`, `.junie`, `.kilocode`, `.kiro`, `.kode`, `.mcpjam`, `.mux`,
  `.neovate`, `.openhands`, `.pi`, `.pochi`, `.qoder`, `.qwen`, `.roo`,
  `.trae`, `.vibe`, `.windsurf`, and `.zencoder`.

Boundaries:
- Source of truth: `.agents/AGENTS.md` and `.agents/rules/*.mdc`.
- Allowed edit scope: repo-local agent rules, patch-related generated mirrors,
  current command references, and this goal plan. Preserve unrelated generated
  or dirty workspace changes.
- Browser surface: N/A: agent routing only; no app/runtime behavior changes.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no public issue mutation requested.
- Non-goals: fixing Plate issue #5065, changing runtime code, creating a PR,
  committing, pushing, or changing external/global skills.

Output budget strategy:
- Use `rg -l` and counts before line output; scope reads to `.agents` source and
  directly related generated mirrors; cap command output and exclude package,
  build, dependency, and historical-plan trees unless a direct reference
  requires inspection.

Blocked condition:
- Stop only if the repo generator cannot produce a discoverable `patch` mirror
  from source or if existing routing has an irreconcilable Plate/Plite authority
  split that requires a user product decision.

Task state:
- task_type: repo-local agent skill rename and generalization
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: skill-creator
- reason: one recurring local repair protocol should own both Plate and Plite;
  coordinators retain public lifecycle authority.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-generalize-plite-patch-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Rename/generalize to `patch`; update related skills/routing; regenerate and verify |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | Read `plite-patch`, `autogoal`, `skill-creator`, and `agent-native-reviewer` contracts |
| Active goal checked or created | yes | Goal created with this plan path |
| Source of truth read before edits | yes | Read `.agents/AGENTS.md`, `.agents/rules/plite-patch.mdc`, and matching contexts in `auto`, `maintainer`, `resolve-slate-issue`, `autoclosure`, and `architecture-cleanup` |
| Tracker comments and attachments read | no | N/A: no tracker mutation; #5065 scope was already read in prior turn |
| Video transcript evidence required | no | N/A: no runtime issue repair in this task |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent workflow source change, not product code |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change |
| Branch decision for code-changing task | no | N/A: user did not request branch/commit/PR |
| Release artifact decision | no | N/A: no published package change |
| Browser tool decision for browser surface | no | N/A: no browser surface change |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker mutation requested |
| Output budget strategy recorded | yes | Scoped `rg -l`/counts and capped direct source reads |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan |
| Agent-facing action surface identified | yes | `$patch` invocation and coordinator-to-local-repair routing |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/AGENTS.md`/`.agents/rules`; regenerate `.agents/skills` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits |
| Docs pack selected | yes | Supporting current-route references under `docs/plite` and `docs/vision` changed |
| `docs-creator` loaded | yes | Loaded before docs closeout audit |
| Docs lane selected | yes | Spec/law/behavior and agent-navigation references; mechanical owner-name update only |
| Target docs and nearest sibling docs read | yes | Read every changed command reference with its current Plate/Plite routing owner |
| Docs style doctrine read | yes | `docs-creator` loaded in full |
| Documented source owner identified | yes | `.agents/rules/patch.mdc` plus `.agents/AGENTS.md` routing |
| Docs pack selected | yes | Supporting command references changed under `docs/plite/**` and `docs/vision/plite.md` |
| `docs-creator` loaded | yes | Loaded before docs closeout |
| Docs lane selected | yes | Spec/law and agent-routing reference maintenance |
| Target docs and nearest sibling docs read | yes | Read every changed match with surrounding owner/routing context |
| Docs style doctrine read | yes | Loaded `docs-creator` current-state and ownership rules |
| Documented source owner identified | yes | `.agents/rules/patch.mdc` and related routing rules own the command name |

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
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, strict stale/parity audit, forward test, agent-native review, and clean P2 autoreview passed |
| Bug reproduced before fix | no | N/A: workflow ownership rename, not runtime bug repair | N/A: no product behavior changed |
| Targeted behavior verification | yes | Prove the generalized lane selects the right Plate owner | Fresh table-regression forward test selected Plate table plugin, package/Browser proof, and public coordinator boundary |
| TypeScript or typed config changed | no | N/A: Markdown/rule/generated skill changes only | N/A: no typed source changed |
| Package exports or file layout changed | no | N/A: no package export surface changed | N/A: skill folder rename is generated by Skiller, not a package barrel |
| Package manifests, lockfile, or install graph changed | no | N/A: no manifest or lockfile change from this task | `pnpm install` still ran for required agent generation and reported lockfile up to date |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Skiller applied Codex/Claude rules; source/body parity and symlink target passed |
| Workspace authority proof | yes | Run verification in owning repo | All commands ran in `/Users/zbeyens/git/plate-2`; P2 used an isolated exact-file bundle |
| Browser surface changed | no | N/A: no app/runtime surface changed | N/A: skill forward test only; no product claim |
| Browser final proof | no | N/A: no browser surface changed | N/A: no browser proof required |
| CI-controlled template output changed | no | N/A: `templates/**` untouched | N/A: no template output changed |
| Package behavior or public API changed | no | N/A: no package behavior/API change | N/A: no changeset required |
| Registry-only component work changed | no | N/A: no registry component work | N/A: no registry changelog required |
| Docs or content changed | yes | Verify incidental current command references | Docs pack resolved; command references point to current `patch` owner; no routes/examples changed |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Final stale audit and generated `patch` source pointer passed |
| Docs links / routes / previews | no | N/A: no links/routes/previews changed | N/A: command-name substitutions only |
| Docs MDX/content parser | no | N/A: no `content/**` or MDX changed by this task | N/A: plain Markdown command references only |
| Plugin page specifics | no | N/A: no plugin page changed | N/A: no plugin page changed |
| High-risk mini gate | yes | Record agent-action failure mode, proof, and boundary | Risk: Plate regression misrouted to Plite or public mutation leaked into worker; forward test, route audit, agent-native map, and P2 prove the chosen boundary |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Capability map passes for direct `patch`, `auto`, public Plate via `maintainer`, and public Slate via `resolve-slate-issue`; no open gap |
| Local install corruption suspected | no | N/A: no install-corruption signals | N/A: all required generation commands passed |
| P2 autoreview for non-trivial implementation changes | yes | Run isolated local bundle with `--max-priority P2` until clean | Final Codex P2: no findings, patch correct, confidence 0.93 |
| PR create or update | no | N/A: user did not request PR | N/A: no PR created or updated |
| Task-style PR body verified | no | N/A: no PR exists | N/A: no PR body |
| PR proof image hosting | no | N/A: no PR/browser image | N/A |
| Tracker sync-back | no | N/A: no tracker mutation requested | N/A: issue #5065 not changed |
| Final handoff contract | yes | Fill exact result/proof/caveat fields | Filled below; no PR/tracker/browser action |
| Final lint | no | N/A: scoped Biome ignored all changed `.md`/`.mdc` paths; broad fixer would mutate unrelated work | `pnpm exec biome check --fix <exact paths>` processed zero files; P2 required safe changed-path lint law |
| Output budget discipline | yes | Verify searches/reads stayed scoped | Used bounded `rg`, direct source reads, and isolated review bundle; one large dirty-file listing was capped and not repeated |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-generalize-plite-patch-skill.md` | Passed: `[autogoal] complete` |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Passed after every source fix; source/body parity, Claude symlink, old-mirror deletion, and unsupported-folder absence passed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Root AGENTS, auto, task, maintainer, resolve-slate, generated `$patch`, and docs all name the current route |
| Agent-native review | yes | Load reviewer and close accepted findings | PASS; all user-action → route → source → mirror → proof links present |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Command references match generated `.agents/skills/patch/SKILL.md`; final stale-symbol audit passed |
| Docs links / routes / previews | no | N/A: no links, routes, anchors, demos, or previews changed | N/A: command-name substitutions only |
| Docs MDX/content parser | no | N/A: no `content/**` or MDX changed by this task | N/A: plain Markdown command references only |
| Plugin page specifics | no | N/A: no plugin page changed | N/A: Plite research/spec and Vision references only |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | requirements, source owner, related routes, and review contracts recorded | implementation |
| Implementation | completed | `patch.mdc` generalized; old source removed; related source/docs routes updated; mirrors regenerated | verification |
| Verification | completed | stale-symbol/parity/diff-check audits, Plate forward test, agent-native map, and final P2 clean | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker mutation requested | final response |
| Closeout | completed | final evidence, handoff, reboot status, and risk closure recorded | final response |

Findings:
- `plite-patch` contains the right local repair protocol but hard-codes Plite
  authority and sends Plate plugin behavior to an unnamed owner.
- The requested generalized `patch` route closes that named owner gap without
  moving public issue lifecycle out of `maintainer`/`resolve-slate-issue`.
- Fresh Plate-lane forward test classified issue #5065-shaped behavior as
  Plate selection/navigation plus browser-event ownership, selected the table
  plugin instead of Plite, required package and Browser proof, and preserved
  the public coordinator boundary.
- Skiller initially exposed task-created symlinks under unsupported agent
  folders; the scoped symlinks and their empty parent directories were removed
  and did not return after repeated `pnpm install` generation.

Decisions and tradeoffs:
- Rename without compatibility alias -> one discoverable owner and no duplicate
  wrapper; risk is stale routing, closed by generated sync and source audit.
- Generalize the protocol with Plate/Plite lane selection -> preserve strong
  proof while choosing surface-specific packages, tests, Browser routes, and
  planning escalation.
- Keep only `.agents` and `.claude` mirrors -> match the repo's actual clients
  and avoid advertising unsupported agent runtimes.

Implementation notes:
- Renamed the source owner to `.agents/rules/patch.mdc` and generalized only
  lane ownership/proof; the reproduce/red-proof/architecture/P2 protocol stays
  intact.
- Updated `auto`, `maintainer`, `resolve-slate-issue`, `task`,
  `architecture-cleanup`, `autoclosure`, `plate-plugin-creator`, Plite workers,
  AGENTS routing, and current command references.

Review fixes:
- Forward test: explicit `task <public issue>` could bypass coordination ->
  accepted; direct public issues and PRs route to `maintainer` or
  `resolve-slate-issue`, while normalized delegated packets are accepted by the
  local worker without public authority.
- P2: coordinator-delegated provenance could loop, `patch` hard-coded `next`,
  push authority leaked, and behavior bugs were narrower than the claimed
  regression owner -> accepted; packets, current-checkout authority,
  never-push law, and behavior-bug/regression terminology are explicit.
- P2: direct public issue/PR prompts and harvested ClawSweeper/issue-harvester
  rows could bypass coordinators -> accepted; every direct or harvested public
  item routes through the public coordinator before local delegation.
- P2: `task` could bounce normalized maintainer packets back to the coordinator
  -> accepted; delegated packets retain provenance but carry no public
  authority.
- P2: move `patch repair` to `task` -> rejected; self-repair is the protocol the
  rename intentionally preserves. The rule now limits that exception to the
  patch workflow's reproduction, proof, routing, review, and handoff contract.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generic `quick_validate.py` rejects Skiller-only frontmatter keys | 1 | Use repo generator and structural source audit | Incompatible validator; `pnpm install` generated valid repo mirrors with required metadata |
| Scoped Biome lint processed zero `.md`/`.mdc` files | 1 | Record unsupported lint surface; rely on generator/source audits | No code/config lint surface in this task |
| P2 Codex subprocess exited before JSON | 2 | Retry with the supported model and bounded exact-file bundle | Subsequent reviews returned structured findings and the final clean verdict |
| Initial review setup command contained a disallowed removal command | 1 | Rebuild the exact-file bundle without destructive cleanup | Review bundle created successfully |
| Review bundle omitted generated files or refreshed from its own stale copy | 2 | Include source plus `.agents`/`.claude` mirrors and overlay from the real checkout | Reviewer saw the actual generated artifacts and current rules |
| Untracked Claude symlink was omitted by bundle collection | 1 | Stage only the symlink inside the disposable review repo | Reviewer confirmed the Claude mirror migration |
| First goal checker run rejected the still-pending final-gate evidence | 1 | Close the named final row and rerun | Expected mechanical guard; final rerun passed |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> Skiller applied Codex and
  Claude rules successfully; required resources synced.
- Structural audit -> `.agents/rules/patch.mdc`,
  `.agents/skills/patch/SKILL.md`, and `.claude/skills/patch` exist; old source,
  generated skill, and Claude route are absent; no unsupported generated skill
  folder exists on disk or appears in scoped status.
- Stale audit -> no old skill name remains outside this goal's historical task
  text.
- Fresh `$patch` Plate table regression forward test -> correct Plate owner,
  red proof, Browser/package verification, escalation, and public authority.
- Agent-native capability map -> direct `$patch`, `auto`, public Plate through
  `maintainer`, and public Slate through `resolve-slate-issue` all reach the
  same source owner, generated mirror, proof contract, and safe handoff.
- Isolated `autoreview --mode local --max-priority P2` -> accepted routing and
  authority findings were repaired and regenerated; final pass reported no
  findings, patch correct, confidence 0.93.
- Final `diff`/`rg`/`git diff --check` audit -> source/generated body parity,
  Claude symlink, hard deletion, discoverability, stale-route absence, and
  whitespace checks passed.
- Final autogoal checker -> `[autogoal] complete`.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: no public mutation requested; #5065 unchanged
- Confidence line: high; final P2 reviewer confidence 0.93
- Flow table:
  - Reproduced: N/A runtime; Plate-lane routing forward test passed
  - Verified: generator, stale/parity/source audits, agent-native map, and P2 clean
- Browser check: N/A: no runtime/browser behavior changed
- Outcome: one generalized `$patch` owner covers local Plate and Plite behavior
  bugs and regressions
- Caveat: generic `quick_validate.py` and Biome do not support this repo's generated frontmatter/Markdown rule surface; repo generation and structural audits passed
- Design:
  - Chosen boundary: local repair worker owns code/proof; public coordinators own GitHub state
  - Why not quick patch: renaming without related routing would leave stale and conflicting owners
  - Why not broader change: public coordinator and planning owners already fit and remain intact
- Verified: `pnpm install`, hard stale audit, generated parity, forward test, agent-native PASS, final P2 clean
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
- PR: N/A: not requested
- Issue / tracker: N/A: no mutation
- Browser proof: N/A: no browser surface changed
- Caveats: incompatible generic validator and ignored Markdown lint surface recorded above

Timeline:
- 2026-08-04T17:33:52.395Z Task goal plan created.
- 2026-08-04 Requirement extraction, skill analysis, and agent-native reviewer
  contract completed before source edits.
- 2026-08-04 Read source skill, root routing source, and every related active
  rule reference before choosing the generalized ownership boundary.
- 2026-08-04 Loaded `docs-creator` and materialized the docs pack after
  supporting Plite/Vision command references entered scope.
- 2026-08-04 Plate forward test passed; isolated P2 findings closed direct and
  harvested public-item bypasses, delegated-packet loops, checkout/push leaks,
  and owner terminology before the final clean verdict.
- 2026-08-04 Goal checker correctly rejected the pending final-gate row; all
  evidence is closed for the final mechanical rerun.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Generalize `plite-patch` into the sole Plate/Plite local `patch` repair owner and update related routing |
| What have I learned? | General protocol survives generalization when lane classification precedes red proof |
| What have I done? | Renamed/generalized source, updated related routes/docs, regenerated mirrors, passed audits/forward test, fixed P2 finding, and closed final P2 |

Open risks:
- None. Lane-specific authority/proof remains explicit, the hard stale audit
  passed, and final P2 reported no actionable findings.
