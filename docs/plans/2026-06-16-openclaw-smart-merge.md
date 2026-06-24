# OpenClaw Smart Merge

Objective:
Sync high-signal OpenClaw agent setup into local owners without importing product-specific plumbing.

Goal plan:
docs/plans/2026-06-16-openclaw-smart-merge.md

Task source:
- type: local agent workflow sync
- id / link: /Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md
- title: OpenClaw smart merge into Plate/Plite agent setup
- acceptance criteria: run the OpenClaw report, inspect high-signal source files, classify candidates, patch only accepted local owners, sync generated skill mirrors when needed, and verify the plan.

First checkpoint:
- Run `openclaw-sync` against `/Users/zbeyens/git/openclaw` with `--refresh` and bounded output.
- Inspect actual OpenClaw source files for accepted candidates; do not patch from row titles alone.
- Start from high-signal `smart-merge` and `new` rows, especially VISION, AGENTS, autoreview, clawsweeper, maintainer, and triage workflows.
- Prefer smart-merge into existing owners. Create a new skill only when no current owner fits.
- Keep root `VISION.md` as the doctrine source. The `vision` skill remains a router only.
- Reject crabbox, Discord, cloud automation, release plumbing, and OpenClaw product-specific workflow unless it maps cleanly to this repo.
- Patch local source owners only: `.agents/AGENTS.md`, `.agents/rules/**`, root `VISION.md`, `docs/vision/**`, plan templates, or global `/Users/zbeyens/.agents/skills/**` when the workflow is cross-repo.
- Run `pnpm install` if `.agents/AGENTS.md` or `.agents/rules/**` changes.
- Run an agent-native source audit for changed agent action surfaces.
- Do not commit, push, or create a PR.

Timed checkpoint:
- requested duration: N/A.
- semantics: This is a bounded sync pass, not an hour soak.
- initial confidence score: 60%; local sync skill exists, but OpenClaw candidate quality is unknown until report inspection.
- improvement loop: classify candidates, patch accepted owners, verify generated mirrors, reject noisy rows explicitly.
- final score / loop closure: 88%; accepted reusable maintainer-loop and skill-topology rules are patched and verified, while one autoreview smart-merge candidate is quarantined until its source owner is clarified.

Completion threshold:
Done when the OpenClaw report is refreshed, high-signal candidates are classified with keep/merge/reject rationale, accepted changes are applied to the right owner, generated skill mirrors are synced if source rules changed, source audits and helper checks pass, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge.md` passes.

Verification surface:
- `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --refresh --max 300 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json`
- Source reads for every accepted OpenClaw candidate and target owner.
- `pnpm install` if local agent rules or `.agents/AGENTS.md` change.
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --dry-run`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge.md`

Constraints:
- Preserve root `VISION.md` as the single doctrine source.
- Keep `vision` as a router only.
- Merge only durable workflow ideas, not OpenClaw product assumptions.
- Do not browse GitHub files; use local clones and local sources.
- Do not check git state proactively.
- Do not commit, push, or create a PR.

Boundaries:
- Source of truth: `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`, root `VISION.md`, local `.agents/AGENTS.md`, `.agents/rules/**`, and inspected `/Users/zbeyens/git/openclaw/**` files.
- Allowed edit scope: local agent workflow docs/rules/plans/vision files and global skills only if a cross-repo owner is required.
- Browser surface: N/A; agent workflow/docs only.
- Tracker sync: N/A.
- Non-goals: runtime package changes, release/PR automation rollout, crabbox/cloud/Discord plumbing, broad issue-processing automation setup.

Output budget strategy:
Save broad OpenClaw report output to `.tmp/openclaw-sync/report.{md,json}`; inspect summaries and bounded slices instead of streaming every candidate row.

Blocked condition:
Stop if `/Users/zbeyens/git/openclaw` is unavailable, the sync script cannot refresh or read local sources, or a candidate requires a user authority decision outside agent workflow policy.

Task state:
- task_type: agent workflow sync
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: closing

Current verdict:
- verdict: complete after final autogoal check
- confidence: 88%
- next owner: openclaw-sync
- reason: reusable OpenClaw maintainer-loop and skill-topology rules were merged into the right owners; product-specific and generated-skill-risk candidates were rejected or quarantined.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists OpenClaw sync scope, non-goals, owner boundaries, verification, and no-commit constraint. |
| Timed checkpoint parsed | no | No duration requested for this sync pass. |
| Skill analysis before edits | yes | `openclaw-sync`, `autogoal`, and `vision` skill instructions read before implementation. |
| Active goal checked or created | yes | Active goal created for this plan. |
| Source of truth read before edits | yes | Root `VISION.md` read before edits. |
| Tracker comments and attachments read | no | No tracker task. |
| Video transcript evidence required | no | No video input. |
| `docs/solutions` checked for non-trivial existing-code work | no | Agent workflow sync does not modify product code. |
| TDD decision before behavior change or bug fix | no | No runtime behavior or bug fix. |
| Branch decision for code-changing task | no | No commit/PR requested. |
| Release artifact decision | no | No package release artifact applies. |
| Browser tool decision for browser surface | no | No browser surface. |
| PR expectation decision | no | User did not request PR. |
| Tracker sync expectation decision | no | No tracker sync. |
| Output budget strategy recorded | yes | Report saved to `.tmp/openclaw-sync/report.{md,json}` and inspected in slices. |
| Docs pack selected | yes | This is docs/agent workflow policy, not public package docs. |
| `docs-creator` loaded | no | Public docs style work is not the owner; this is internal agent workflow text. |
| Docs lane selected | yes | Internal agent workflow docs/rules only. |
| Target docs and nearest sibling docs read | yes | Read root `VISION.md`, `docs/vision/common.md`, `.agents/AGENTS.md`, `AGENTS.md`, local `clawsweeper`, global `openclaw-sync`, global `github-triage`, and OpenClaw source candidates. |
| Docs style doctrine read | yes | Root `VISION.md` read; public current-state docs doctrine noted. |
| Documented source owner identified | yes | Owners: `.agents/AGENTS.md`, `docs/vision/common.md`, `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`, and `/Users/zbeyens/.agents/skills/github-triage/SKILL.md`. |
| Agent-native pack selected | yes | `.agents/**` changes are possible. |
| Agent-facing action surface identified | yes | `openclaw-sync` selection rules, `github-triage` maintainer automation loop, and AGENTS skill routing changed. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` and `.agents/AGENTS.md`, then run `pnpm install`; do not hand-edit generated skills. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; source audit found changed action surfaces discoverable. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless explicitly marked hard stop; N/A because no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A because no video was provided.
- [x] Nearby repo instructions and implementation patterns read before edits: root `VISION.md`, `.agents/AGENTS.md`, local/generated `AGENTS.md`, local `clawsweeper`, OpenClaw AGENTS/VISION, OpenClaw `gh-issues`, `clawdtributor`, `tag-duplicate-prs-issues`, `technical-documentation`, `agent-transcript`, and `control-ui-e2e`.
- [x] Implementation fixes the right ownership boundary: repo routing in `.agents/AGENTS.md`, reusable doctrine in `docs/vision/common.md`, sync policy in global `openclaw-sync`, and GitHub maintainer loop in global `github-triage`.
- [x] Release artifact requirement is N/A because agent workflow docs/rules do not need a changeset.
- [x] Final handoff shape decided: include accepted patches, rejected candidates, verification, risks, changed files, and next OpenClaw sync owner.
- [x] Branch handling is N/A because no commit/PR was requested.
- [x] Local-env-rot retry policy is N/A unless verification failures show install corruption.
- [x] Workspace authority recorded for every proof command: OpenClaw report and repo sync checks ran from `/Users/zbeyens/git/plate-2`; global skill source audits used absolute global paths.
- [x] High-risk note recorded: agent-action changes are docs/skill routing only; no automation writes, commits, PRs, or cloud dispatch were enabled.
- [x] Review/autoreview target selected: autoreview N/A for markdown-only workflow text; focused source audit used instead.
- [x] Agent-native review decision recorded: `agent-native-reviewer` loaded; manual audit confirms changed actions are discoverable in the skill/rule text and mutation gates stay explicit.
- [x] Output budget discipline recorded and followed by saving broad report artifacts.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded in findings and implementation notes below.
- [x] Docs pack: named APIs/imports/routes/previews are N/A; commands and paths are source-backed by OpenClaw and local skill reads.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews are N/A because no public docs links/routes were added.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from `.agents/AGENTS.md`, generated `AGENTS.md`, `openclaw-sync`, and `github-triage`.
- [x] Agent-native pack: generated mirrors are synced by `pnpm install`; root `AGENTS.md` contains the new `openclaw-sync` routing.
- [x] Agent-native pack: accepted agent-native review findings are N/A; manual audit found no action parity gap.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the report, source audits, sync checks, and autogoal check-complete. | OpenClaw report, `pnpm install`, source `rg` audit, sync-vision dry-run, and final autogoal check run. |
| Bug reproduced before fix | no | No bug fix. | N/A |
| Targeted behavior verification | no | No runtime behavior change. | N/A |
| TypeScript or typed config changed | no | No TS/config package change planned. | N/A |
| Package exports or file layout changed | no | No package exports/file layout change. | N/A |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` only if agent source changes require mirror sync. | `pnpm install` passed; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and source audit if `.agents/**` changes. | `pnpm install` passed; `rg` verified source/generated routing and global skill sections. |
| Workspace authority proof | yes | Run commands in `/Users/zbeyens/git/plate-2`. | Report, install, sync-vision, and plan checks run from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | No browser surface. | N/A |
| Browser final proof | no | No browser surface. | N/A |
| CI-controlled template output changed | no | No template output expected. | N/A |
| Package behavior or public API changed | no | No package API change. | N/A |
| Registry-only component work changed | no | No registry component work. | N/A |
| Docs or content changed | yes | Verify source-backed claims and current-state voice for changed docs/rules. | Focused diff/source audit passed; no public docs links or API examples added. |
| High-risk mini gate | yes | Agent workflow changes need source-owner proof and generated mirror sync. | Source-owner proof recorded; no automatic GitHub mutation or cloud worker dispatch enabled. |
| Agent-native review for agent/tooling changes | yes | Load reviewer if agent action files are changed. | `agent-native-reviewer` loaded; changed agent actions are discoverable and permission-gated. |
| Local install corruption suspected | no | No evidence of install corruption. | N/A |
| Autoreview for non-trivial implementation changes | no | Decide after diff scope; likely N/A or narrow source audit for docs/rules-only patch. | N/A: markdown-only workflow docs/skill routing; source audit used instead. |
| PR create or update | no | No PR requested. | N/A |
| Task-style PR body verified | no | No PR requested. | N/A |
| PR proof image hosting | no | No PR/browser proof. | N/A |
| Tracker sync-back | no | No tracker sync. | N/A |
| Final handoff contract | yes | Summarize accepted patches, rejected candidates, verification, risks, changed files, and next owner. | Final response will include changed files, accepted/rejected candidates, verification, and attention items. |
| Final lint | no | Docs/agent-rule text only unless a script changes. | N/A |
| Output budget discipline | yes | Verify broad output stayed artifacted. | Broad report saved to `.tmp/openclaw-sync/report.{md,json}`; only bounded slices were inspected after the initial report output. |
| Timed checkpoint | no | No duration requested. | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge.md`. | Final command run after this plan update. |
| Docs source-backed claim audit | yes | Source-read OpenClaw and local owners for accepted text. | Read OpenClaw AGENTS/VISION, `gh-issues`, `clawdtributor`, `tag-duplicate-prs-issues`, `technical-documentation`, `agent-transcript`, `control-ui-e2e`, and local owners. |
| Docs links / routes / previews | no | No public docs links/routes. | N/A |
| Docs MDX/content parser | no | No MDX/content docs planned. | N/A |
| Plugin page specifics | no | No plugin page. | N/A |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changes. | `pnpm install` ran after `.agents/AGENTS.md` changed and regenerated root `AGENTS.md`. |
| Agent action discoverability | yes | Source-audit changed skill/rule path. | `rg` verified `openclaw-sync`, skill topology authority, maintainer automation loop, and maintainer vision text. |
| Agent-native review | yes | Load `agent-native-reviewer` if `.agents/**` changes. | Reviewer loaded; no separate findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | plan, root vision, skills read | implementation |
| Implementation | done | accepted patches applied to `.agents/AGENTS.md`, `docs/vision/common.md`, global `openclaw-sync`, and global `github-triage` | verification |
| Verification | done | OpenClaw report, `pnpm install`, source audits, sync-vision dry-run | closeout |
| PR / tracker sync | done | N/A: no PR/tracker requested | final response |
| Closeout | done | plan updated; final autogoal check next | final response |

Findings:
- OpenClaw report refreshed 7 repos and 254 rows: 155 `new`, 19 `smart-merge`, 80 `reject`.
- Accepted `gh-issues` plus `clawdtributor` maintainer-loop invariants into global `github-triage`: live state, duplicate/claim guard, candidate matrix, explicit mutation gate.
- Accepted OpenClaw AGENTS/VISION maintainer proof doctrine into `docs/vision/common.md`: live-state-first, duplicate/owner guard, source-backed skill topology.
- Accepted explicit skill topology authority into global `openclaw-sync`: update/create skills only after source-backed owner classification.
- Accepted repo routing into `.agents/AGENTS.md` and fixed the broken `clawsweeper` bullet text.
- Rejected `control-ui-e2e` as product-specific; local Browser/plite-browser proof owners already cover the reusable visual-proof invariant.
- Rejected `technical-documentation` as overlapping with local `docs-creator`, `sync-vision`, and AGENTS/VISION doctrine; imported only the governance-doc audit idea through current workflow.
- Rejected `agent-transcript` for now: useful for PR provenance, but PR creation/update was out of scope and no local owner was requested.
- Rejected `clawsweeper` direct copy: local `.agents/rules/clawsweeper.mdc` already contains archive-first, duplicate-proof, small-fix, and live-state bars.
- Quarantined `autoreview` smart-merge: OpenClaw has useful scope-governor/release-freeze text, but local `autoreview` has no source rule; hand-editing a generated/local skill would violate the source-owner rule.

Decisions and tradeoffs:
- Root `VISION.md` stays doctrine source; no doctrine in `vision` skill.
- OpenClaw product plumbing is rejected unless it maps to a local owner.

Implementation notes:
- Changed `.agents/AGENTS.md`; `pnpm install` regenerated root `AGENTS.md`.
- Changed `docs/vision/common.md` for maintainer automation doctrine.
- Changed `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md` because it is a global hand-written skill and the right owner for create/update skill topology rules.
- Changed `/Users/zbeyens/.agents/skills/github-triage/SKILL.md` because it is the existing global owner for GitHub issue triage and agent-ready issue queues.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Node JSON slice used shell-sensitive template syntax | 1 | Reran with single-quoted `node -e` and tab-joined fields | Resolved; report counts printed successfully. |

Verification evidence:
- OpenClaw report: `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --refresh --max 300 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json` passed.
- `pnpm install` passed and ran Skiller successfully.
- Source/generated audit passed: `rg -n "openclaw-sync|Skill Topology Authority|Maintainer Automation Loop|Maintainer automation is live-state-first|clawsweeper for Plite|f\\[text\\]" ...` found expected new text and no broken `f[text]` typo.
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --dry-run` passed and did not advance the baseline.
- Focused diff/source audit read changed local and global workflow files.

Reboot status:
- Fresh plan created in this turn. No reboot needed.

Open risks:
- `autoreview` has a good OpenClaw scope-governor candidate, but the local owner path needs a source-rule decision before patching.
- Global `github-triage` now has the loop shape, but no recurring automation scheduler is installed; this remains skill-driven until the user sets up automations.

Final handoff contract:
- Changed files: `.agents/AGENTS.md`, generated `AGENTS.md`, `docs/vision/common.md`, `docs/plans/2026-06-16-openclaw-smart-merge.md`, `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`, `/Users/zbeyens/.agents/skills/github-triage/SKILL.md`.
- Accepted OpenClaw ideas: source-backed skill topology authority, live-state-first maintainer automation, duplicate/claim guard, candidate matrix, explicit no-hidden-worker mutation gate.
- Rejected OpenClaw ideas: crabbox/cloud/Discord/release plumbing, product-specific Control UI lane, direct ClawSweeper copy, standalone technical-docs wrapper, PR transcript insertion for this pass.
- Verification: OpenClaw report, `pnpm install`, source `rg` audit, sync-vision dry-run, final autogoal check.
- Needs attention: decide later whether to create a source rule or global owner for `autoreview` scope-governor text; no action needed before using `openclaw-sync`.
