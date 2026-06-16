# openclaw public intake alignment

Objective:
Align Plate/Slate public intake with OpenClaw; done when accepted docs/templates/rules are patched, CODEOWNERS/API assumptions excluded, and audits pass.

Goal plan:
docs/plans/2026-06-16-openclaw-public-intake-alignment.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request + OpenClaw reference import
- id / link: local OpenClaw corpus at `/Users/zbeyens/git/openclaw`
- title: OpenClaw-style public intake alignment for Plate/Slate
- acceptance criteria:
  - Be closest to OpenClaw while staying relevant to Slate/Plate.
  - Do not add CODEOWNERS.
  - Explicitly adapt the model to local Codex maintainers; no hosted/API/cloud bot assumption.
  - Patch public intake docs and maintainer workflow owners where useful.
  - Reject product-specific OpenClaw plumbing.
  - Verify docs/templates/rules/decision ledger without code/package/browser work.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration in prompt
- initial confidence score: N/A: artifact checklist is the metric
- improvement loop: N/A: close when checklist and audits pass
- final score / loop closure: N/A: no timed loop requested

Completion threshold:
- Done state: accepted OpenClaw public-intake invariants are imported into Plate/Slate docs/templates/rules, with CODEOWNERS excluded and local-Codex/no-hosted-automation wording explicit.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-public-intake-alignment.md` passes.

Verification surface:
- Source-backed audit of OpenClaw reference files and local owner files.
- YAML/JSON syntax checks for GitHub templates and decision ledger.
- `pnpm install` after `.agents/rules/**` / `.agents/AGENTS.md` changes to sync generated skills.
- Generated mirror/source audit for maintainer and AGENTS rule changes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-public-intake-alignment.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: OpenClaw reference files plus local `VISION.md`, `docs/vision/*.md`, `.agents/rules/maintainer.mdc`, `.agents/AGENTS.md`, and public GitHub templates.
- Allowed edit scope: `CONTRIBUTING.md`, `.github/**` templates/policy, `SECURITY.md`, `docs/vision/**`, `.agents/AGENTS.md`, `.agents/rules/maintainer.mdc`, `docs/plans/templates/maintainer.md`, `docs/sync/openclaw/decisions.json`, and this plan.
- Browser surface: N/A: no content/app/package UI surface touched.
- Tracker sync: N/A: no GitHub issue/PR mutation requested.
- Non-goals: no CODEOWNERS, no hosted/API automation design, no cloud daemon/crabbox import, no product-specific OpenClaw docs, no package/runtime changes.

Output budget strategy:
- Use focused `sed -n` reads on exact OpenClaw/local files. Do not stream broad repo scans. Use `rg` counts/audits and capped command output for validation.

Blocked condition:
- Block only if OpenClaw source files are missing, template syntax cannot be validated locally, or a candidate import requires a product/authority decision that conflicts with root `VISION.md` or the user's `no CODEOWNERS` / local-Codex constraints.

Task state:
- task_type: docs + agent workflow import
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: proceed with scoped import
- confidence: high
- next owner: task + openclaw-sync + maintainer
- reason: OpenClaw reference strengthens public intake and maintainer proof without requiring hosted automation or CODEOWNERS.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-public-intake-alignment.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copied OpenClaw relevance, Slate/Plate scope, no CODEOWNERS, local Codex/no API-hosted automation, edit scope, non-goals, and verification. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal` and `openclaw-sync` skills before durable edits. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this active objective. |
| Source of truth read before edits | yes | Read local `CONTRIBUTING.md`, GitHub templates, `VISION.md`, `docs/vision/*`, maintainer rule/template, `.agents/AGENTS.md`, decision ledger, and OpenClaw reference files. |
| Tracker comments and attachments read | no | N/A: no issue/PR tracker item in prompt. |
| Video transcript evidence required | no | N/A: no video evidence in prompt. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: docs/agent workflow import, no runtime-code problem. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior bug fix or runtime change. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package/runtime/public API release artifact changed. |
| Browser tool decision for browser surface | no | N/A: no `content/**`, `apps/www/**`, or `packages/**` UI surface touched. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no issue/PR mutation requested. |
| Output budget strategy recorded | yes | Focused `sed` reads and capped `rg`/validation output recorded above. |
| Docs pack selected | yes | Applied `docs` pack because public docs/templates changed. |
| `docs-creator` loaded | no | N/A: not Plate docs site/content; public repo intake docs and templates only. |
| Docs lane selected | yes | Public contributor/security intake lane. |
| Target docs and nearest sibling docs read | yes | Read target local docs/templates plus OpenClaw equivalents. |
| Docs style doctrine read | yes | Read root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and `.agents/AGENTS.md` docs policy. |
| Documented source owner identified | yes | Owners: public GitHub docs/templates, maintainer rule/template, root/detail vision, OpenClaw decision ledger. |
| Agent-native pack selected | yes | Applied `agent-native` pack because `.agents/**` and skill routing changed. |
| Agent-facing action surface identified | yes | `maintainer` read order, local Codex model, and generated `maintainer` skill mirror. |
| Source rule versus generated mirror boundary identified | yes | Patched `.agents/rules/maintainer.mdc` and `.agents/AGENTS.md`; `pnpm install` regenerated `.agents/skills/maintainer/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no app action parity issue because only agent docs/rules changed. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Boundary: public intake docs/templates plus maintainer/vision owners.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no package release artifact.
- [x] Final handoff shape decided: changed files, verification, rejected imports, caveat.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no commit/PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot failure.
- [x] Workspace authority recorded: verification commands run in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: maintainer/agent routing and public intake wording; mitigated by source audit and generated mirror sync.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: docs/rules/template import, agent-native review used.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. N/A: no API/demo claims.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. No actionable findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`; YAML/JSON checks; no CODEOWNERS audit; generated maintainer mirror/source audit; check-complete passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no runtime behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript/config code changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: lockfile/install graph unchanged; `pnpm install` still ran for agent sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` found local Codex rule in `.agents/rules/maintainer.mdc` and `.agents/skills/maintainer/SKILL.md`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Verification commands ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no app/content/package browser surface touched. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` CI output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: contributor docs/rules only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Docs pack used; source-backed by OpenClaw/local reads; no docs site parser needed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: over-importing OpenClaw hosted automation. Mitigation: explicit local Codex/no hosted/API wording, reject CODEOWNERS/cloud rows. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer skill; no app action parity finding; discoverability verified in source and generated mirror. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption failure. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: docs/rules/templates only; no runtime implementation diff. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR created or updated. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no source code lint surface changed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One OpenClaw report streamed 272 lines with truncation; recovered by using exact source reads and artifact `.tmp/openclaw-sync/report.*`. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-public-intake-alignment.md` | Passed after phase-status repair. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `rg` audit found local Codex/intake/security/proof text in all target owners. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | GitHub advisory/discussion/Discord/Slate links are static external links; no local route render needed. |
| Docs MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: no MDX/content docs changed. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin docs page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `.agents/skills/maintainer/SKILL.md` contains new local Codex rules. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found new public-intake/local-Codex language in `.agents/rules/maintainer.mdc`, `.agents/skills/maintainer/SKILL.md`, and `.agents/AGENTS.md`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no actionable parity findings for docs/rule-only change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read local and OpenClaw source docs plus sync report. | implementation |
| Implementation | complete | Patched public docs/templates, maintainer rule/template, vision docs, AGENTS, decision ledger, and plan. | verification |
| Verification | complete | `pnpm install`, YAML/JSON checks, source audits, no CODEOWNERS audit passed. | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker mutation requested. | final response |
| Closeout | complete | First check-complete found only open phase statuses; repaired and rerun passed. | final response |

Findings:
- Existing Plate `CONTRIBUTING.md` and bug template already had useful OpenClaw-style intake, but needed explicit local-Codex/no-hosted-context wording.
- Existing PR template was the weakest surface: pre-checked commands and no durable state for intent, real behavior proof, risk, or review status.
- No `SECURITY.md` existed locally; OpenClaw's private disclosure/trust-boundary pattern is relevant when adapted to framework/editor ownership.
- CODEOWNERS is intentionally rejected by current user instruction.

Decisions and tradeoffs:
- Import OpenClaw's proof/intake invariant, not product-specific OpenClaw names, crabbox, hosted/API worker, Discord/team, beta-label, or CODEOWNERS mechanics.
- Keep local maintainer loop as local Codex sessions in maintainer checkouts.
- Add feature request template because Plate lacked the structured owner/problem/solution/tradeoff intake surface.

Implementation notes:
- Public-facing docs patched: `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/bug.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `SECURITY.md`.
- Agent/doctrine owners patched: `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `.agents/AGENTS.md`, `.agents/rules/maintainer.mdc`, `docs/plans/templates/maintainer.md`, `docs/sync/openclaw/decisions.json`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First check-complete found open phase statuses | 1 | Close phase rows with actual evidence, then rerun. | Repaired Verification and Closeout phase rows. |

Verification evidence:
- `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --refresh --max 300 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json` passed and wrote report artifacts.
- Reran OpenClaw sync report without refresh after ledger key repair; counts changed to accepted=22, covered=4, new=143, quarantine=4, reject=81.
- `pnpm install` passed and regenerated skill mirrors.
- `node -e "JSON.parse(...decisions.json...)"` passed.
- `ruby -e "require 'yaml'; ... YAML.load_file(...)"` passed for issue templates.
- `test ! -e .github/CODEOWNERS` passed.
- `rg` source audit found local-Codex/intake/security/proof text in the public docs, maintainer rule, generated maintainer skill, AGENTS, and vision docs.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no issue/tracker mutation requested.
- Confidence line: High confidence for docs/rules/template import; no runtime behavior changed.
- Flow table:
  - Reproduced: N/A: not a bug fix.
  - Verified: `pnpm install`, YAML/JSON syntax, no CODEOWNERS audit, generated mirror/source audit, final check-complete passed.
- Browser check: N/A: no browser surface touched.
- Outcome: Plate/Slate public intake now mirrors the useful OpenClaw pattern while staying local-Codex and no-CODEOWNERS.
- Caveat: Did not import OpenClaw cloud/crabbox/taskflow, CODEOWNERS, release, Discord/team, or product-specific security model.
- Design:
  - Chosen boundary: public intake docs/templates plus maintainer/vision owners.
  - Why not quick patch: PR template alone would not make future maintainer loops read or enforce the intake contract.
  - Why not broader change: hosted/API automation and CODEOWNERS conflict with the requested local setup.
- Verified: Commands and source audits listed above; check-complete passed after status repair.
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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no issue/tracker mutation requested.
- Browser proof: N/A: no browser surface touched.
- Caveats: CODEOWNERS and hosted/API automation intentionally rejected.

Timeline:
- 2026-06-16T20:52:11.488Z Task goal plan created.
- 2026-06-16 OpenClaw sync report refreshed and read.
- 2026-06-16 Public intake docs/templates patched.
- 2026-06-16 Maintainer/vision/AGENTS owners patched.
- 2026-06-16 `pnpm install` synced generated skills.
- 2026-06-16 YAML/JSON/source audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal verified and ready to close. |
| Where am I going? | Close goal and hand off. |
| What is the goal? | Align Plate/Slate public intake with OpenClaw while excluding CODEOWNERS and hosted/API automation. |
| What have I learned? | OpenClaw's strongest relevant pattern is public intake as durable maintainer-agent state. |
| What have I done? | Patched public docs/templates, maintainer/vision/AGENTS owners, decision ledger, and verification plan. |

Open risks:
- None for this scope. Remaining OpenClaw `new` rows are intentionally outside this public-intake pass unless reopened.
