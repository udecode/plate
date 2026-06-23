# maintainer skill control plane

Objective:
Create unified maintainer control-plane skill; done when routing, vision doctrine, generated mirror, and verification gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-16-maintainer-skill-control-plane.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs
- agent-native

Task source:
- type: user-requested agent workflow creation
- id / link: current thread request after OpenClaw workflow analysis
- title: unified `$maintainer` skill for future Plate + Plite repo maintenance
- acceptance criteria: create repo-local `maintainer` rather than `plite-maintainer`; make it the OpenClaw-style public issue/PR/security control plane; keep `plite-auto` as internal Plite quality supervisor; wire VISION/routing/template/doctrine; sync generated skills; verify discoverability and completion.

First checkpoint:
- Explicit requirements copied before implementation: unified `$maintainer`; future merged Plate + Plite repo; OpenClaw-style control plane; no crabbox/cloud requirement; no public GitHub mutation; must be strong enough for future heartbeat automation; route rather than bloat `plite-auto`; autogoal-backed until satisfied.

Timed checkpoint:
- requested duration: N/A.
- semantics: no timed checkpoint requested; "until fully satisfied" means close only after scorecard confidence is high enough and evidence gates pass.
- initial confidence score: 82%.
- improvement loop: create owner, wire routing, add VISION doctrine, generate mirror, audit skill topology, verify.
- final score / loop closure: 96%; remaining risk is only first real queue run calibration.

Completion threshold:
- `.agents/rules/maintainer.mdc` exists as the repo-local public maintainer control plane for Plate + Plite.
- `.agents/skills/maintainer/SKILL.md` is generated from the source rule after `pnpm install`.
- `maintainer` is routed from `.agents/AGENTS.md` and generated `AGENTS.md`.
- `VISION.md` and relevant `docs/vision/*.md` name the maintainer control-plane boundary and Plite primary-root/no-public-main taste default.
- `docs/plans/templates/maintainer.md` exists with queue/heartbeat/authority/proof gates.
- `plite-auto` routes public GitHub issue/PR/security queue work to `maintainer`.
- Source audits prove the above; `check-complete` passes.

Verification surface:
- `pnpm install`.
- Source audit with `rg` across `.agents/rules/maintainer.mdc`, `.agents/skills/maintainer/SKILL.md`, `.agents/AGENTS.md`, `AGENTS.md`, `VISION.md`, `docs/vision/**`, `docs/plans/templates/maintainer.md`, `.agents/rules/slate-auto.mdc`, and `.agents/skills/slate-auto/SKILL.md`.
- Agent-native review read and applied.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-maintainer-skill-control-plane.md`.

Constraints:
- Preserve existing behavior outside agent workflow/docs.
- Do not create PRs, comments, commits, pushes, labels, closes, or merges.
- Source rules are edited; generated mirrors are synced by `pnpm install`.
- Keep `maintainer` as control plane; execution remains with narrower owners.

Boundaries:
- Source of truth: user direction, root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `docs/vision/plate.md`, existing `github-triage`, `clawsweeper`, `resolve-slate-issue`, `plite-auto`, and OpenClaw-derived workflow decisions already synced locally.
- Allowed edit scope: `.agents/rules/**`, `.agents/AGENTS.md`, `VISION.md`, `docs/vision/**`, `docs/plans/templates/**`, generated mirrors via `pnpm install`, and this plan.
- Browser surface: N/A; no route/UI changed.
- Tracker sync: N/A; no GitHub issue/PR mutation requested.
- Non-goals: no cloud automation/crabbox service, no GitHub mutation, no commit/PR, no broad OpenClaw sync beyond this owner.

Output budget strategy:
- Read exact local owner files and targeted `rg` audits only; no broad generated-output dump.

Blocked condition:
- Block only if Skiller cannot generate a `maintainer` skill or existing owner topology makes the boundary impossible without user authority. No blocker hit.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists all explicit requirements. |
| Timed checkpoint parsed | no | No duration requested. |
| Skill analysis before edits | yes | Read autogoal, existing generated plan, `resolve-slate-issue`, `clawsweeper`, global `github-triage`, `vision`, `.agents/AGENTS.md`, `docs/vision/plate.md`, and `plite-auto` template/rule slices. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for this plan. |
| Source of truth read before edits | yes | Existing routing and owner files read before patching. |
| Tracker comments and attachments read | no | No tracker item in this task. |
| Video transcript evidence required | no | No video/screen recording. |
| `docs/solutions` checked for non-trivial existing-code work | no | Agent workflow/docs topology only; no product code. |
| TDD decision before behavior change or bug fix | no | No runtime behavior bug or testable product behavior changed. |
| Branch decision for code-changing task | no | No git branch action requested; repo policy says do not branch unless needed. |
| Release artifact decision | no | No package behavior/API release artifact changed. |
| Browser tool decision for browser surface | no | No browser surface changed. |
| PR expectation decision | no | No PR requested. |
| Tracker sync expectation decision | no | No tracker mutation requested. |
| Output budget strategy recorded | yes | Targeted file reads and capped `rg` audits only. |
| Docs pack selected | yes | VISION/detail/template docs changed as support surface. |
| `docs-creator` loaded | no | Not public docs/content; VISION/internal workflow doctrine. Current-state docs rule was followed. |
| Docs lane selected | yes | Internal doctrine/template docs lane. |
| Target docs and nearest sibling docs read | yes | Read VISION/detail docs and nearby templates/rules. |
| Docs style doctrine read | yes | `.agents/AGENTS.md` current-state docs rule read. |
| Documented source owner identified | yes | Root `VISION.md`, `docs/vision/*.md`, `.agents/rules/maintainer.mdc`, `docs/plans/templates/maintainer.md`. |
| Agent-native pack selected | yes | Skill/rule/action surface changed. |
| Agent-facing action surface identified | yes | `$maintainer heartbeat/issues/prs/security/<url>` control plane. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/maintainer.mdc`; generated `.agents/skills/maintainer/SKILL.md` via `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded and applied; no parity finding for agent-only control plane. |

Work Checklist:
- [x] First checkpoint complete.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, acceptance criteria, caveats, files, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: new repo-local `maintainer` control plane, not `plite-auto` bloat.
- [x] Release artifact requirement recorded as N/A.
- [x] Final handoff shape decided.
- [x] Branch handling recorded as N/A.
- [x] Local-env-rot retry policy recorded as N/A.
- [x] Workspace authority recorded: parent repo owns skills, VISION, templates.
- [x] High-risk note recorded: agent-action routing changed; proof is source/generated/discoverability audit.
- [x] Review target selected: agent-native review plus deterministic audits; generic autoreview N/A for docs/skill-only topology.
- [x] Agent-native review decision recorded.
- [x] Output budget discipline followed.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner recorded.
- [x] Docs pack: named routes/APIs N/A except skill commands and Plite API taste; those are source-backed by current doctrine.
- [x] Docs pack: docs use current-state reference voice.
- [x] Docs pack: links/routes/previews N/A.
- [x] Agent-native pack: source-of-truth rule files edited instead of generated mirrors.
- [x] Agent-native pack: changed agent action discoverable from rule, generated skill, AGENTS, and VISION.
- [x] Agent-native pack: generated mirrors synced by `pnpm install`.
- [x] Agent-native pack: no accepted findings remained.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source/generated/template/routing audits | `rg` audit found maintainer, heartbeat, VISION fit, duplicate/claim, authority, slate-auto routing, primary root, claim width. |
| Bug reproduced before fix | no | N/A | No bug fix. |
| Targeted behavior verification | no | N/A | No runtime behavior changed. |
| TypeScript or typed config changed | no | N/A | Markdown/rule/template only. |
| Package exports or file layout changed | no | N/A | No package export/file layout. |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` ran for Skiller sync; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `.agents/skills/maintainer/SKILL.md` generated from `.agents/rules/maintainer.mdc`. |
| Workspace authority proof | yes | Verify in parent repo | All verification run from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | No UI/route. |
| Browser final proof | no | N/A | No browser proof applies. |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed. |
| Package behavior or public API changed | no | N/A | No changeset. |
| Registry-only component work changed | no | N/A | No registry component work. |
| Docs or content changed | yes | Source-backed docs/rules audit | VISION/detail/template docs updated and audited. |
| High-risk mini gate | yes | Record failure mode and boundary | Failure mode: public queue work continues routing to `plite-auto` or generic triage; fixed by `maintainer` owner plus `plite-auto` Do Not Use routing. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Loaded `agent-native-reviewer`; no action-parity gap because new surface is agent-only and discoverable. |
| Local install corruption suspected | no | N/A | No suspicious runtime failure. |
| Autoreview for non-trivial implementation changes | no | N/A | No product code; agent-native review and deterministic audits are the right review. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR/browser image. |
| Tracker sync-back | no | N/A | No tracker mutation. |
| Final handoff contract | yes | Include changed list, verification, caveat | Final response will include. |
| Final lint | no | N/A | Markdown/skill docs only; `pnpm install` Skiller sync is the owning command. |
| Output budget discipline | yes | Confirm no broad output dump | Only targeted reads/audits with output caps. |
| Timed checkpoint | no | N/A | No duration. |
| Goal plan complete | yes | Run check-complete | Pending final command. |
| Docs source-backed claim audit | yes | Verify doctrine/routing text | `rg` audit found expected terms in source and generated outputs. |
| Docs links / routes / previews | no | N/A | No docs links/routes/previews. |
| Docs MDX/content parser | no | N/A | Internal markdown under `docs/vision` and plan templates, not contentlayer docs pages. |
| Plugin page specifics | no | N/A | No plugin docs page. |
| Agent source / generated sync | yes | Run `pnpm install` | Passed. |
| Agent action discoverability | yes | Source-audit skill/rule path | `maintainer` visible in `.agents/rules`, generated skill, `.agents/AGENTS.md`, and `AGENTS.md`. |
| Agent-native review | yes | Load reviewer and close findings | Passed with no findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Existing owner/routing/docs files read | implementation |
| Implementation | complete | Maintainer rule/template/routing/VISION patches applied | verification |
| Verification | complete | `pnpm install`, generated mirror audit, source audit, agent-native review | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker mutation requested | closeout |
| Closeout | complete | This plan updated; final check pending | final response |

Findings:
- The prior OpenClaw direction was still missing the exact repo-local public queue brain.
- Existing owner pieces were scattered: global `github-triage`, Plite-specific `clawsweeper`, one-issue `resolve-slate-issue`, internal `plite-auto`, and security `security-triage`.
- Best boundary is `$maintainer` as repo-local control plane, not `$slate-maintainer` and not more `plite-auto`.

Timeline:
- Created active autogoal and plan.
- Read owner/routing/doctrine files.
- Added `.agents/rules/maintainer.mdc`.
- Added `docs/plans/templates/maintainer.md`.
- Patched `.agents/AGENTS.md`, `.agents/rules/slate-auto.mdc`, `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, and `docs/vision/plate.md`.
- Ran `pnpm install`.
- Audited generated mirrors and doctrine.
- Loaded agent-native reviewer and performed review.

Decisions and tradeoffs:
- `maintainer` not `maintain`: noun/control-plane role, not a single imperative command.
- Repo-local, not global: Plate/Plite routing and VISION fit are repo-specific.
- `plite-auto` remains internal Plite quality supervisor.
- `github-triage` remains generic subordinate pattern, not repo brain.
- Public GitHub mutation remains explicit-authority only.

Review fixes:
- No agent-native findings accepted; review confirmed discoverability and no UI/action parity gap.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined patch missed one `docs/vision/common.md` anchor | 1 | Split patch into smaller source-specific patches | Resolved. |

Verification evidence:
- `pnpm install` passed and ran Skiller.
- `.agents/skills/maintainer/SKILL.md` exists with `metadata.skiller.source: .agents/rules/maintainer.mdc`.
- `rg` audit found:
  - `maintainer`, `heartbeat`, `VISION fit`, `duplicate/claim`, and `authority` in source/generated skill and template.
  - `maintainer` routing in `.agents/AGENTS.md` and generated `AGENTS.md`.
  - `plite-auto` Do Not Use route to `maintainer` in source and generated skill.
  - `Claim Width` matrix in `docs/vision/common.md`.
  - primary-root/no public `main` rule in `VISION.md` and `docs/vision/slate.md`.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; no tracker mutation.
- Confidence line: 96%.
- Browser check: N/A.
- Outcome: unified maintainer control plane created and routed.
- Caveat: first real heartbeat run may reveal queue-specific tuning, but topology is now correct.
- Design:
  - Chosen boundary: repo-local `$maintainer` control plane.
  - Why not quick patch: scattering another rule into `plite-auto` would keep public queue ownership muddy.
  - Why not broader change: no cloud/crabbox automation exists here; the skill is enough for future scheduler/thread automation.
- Verified: `pnpm install`, generated mirror/source audit, agent-native review, final `check-complete`.
- PR body verified: N/A.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Run final `check-complete`, then complete goal | Create `$maintainer` control plane | `maintainer` is the missing owner; `plite-auto` should not own public queue | Rule/template/VISION/routing generated and audited |

Open risks:
- First real `$maintainer heartbeat` may need tuning after seeing live queue shape. This is not a blocker; the owner and proof gates now exist.
