# vision single source of truth

Objective:
Make root `VISION.md` the single vision source; shrink the `vision` skill to a
router and verify generated sync/references.

Goal plan:
docs/plans/2026-06-16-vision-single-source-of-truth.md

Task source:
- type: user instruction
- id / link: current chat
- title: Root `VISION.md` owns vision; `vision` skill routes to it
- acceptance criteria: root `VISION.md` carries the Common/Slate/Plate doctrine,
  `.agents/rules/vision.mdc` contains no duplicated doctrine and only routes to
  root `VISION.md`, generated `.agents/skills/vision/SKILL.md` matches, and
  stale source rules do not instruct agents to patch the skill as the doctrine
  owner.

First checkpoint:
- Explicit requirements captured before implementation: user rejects maintaining
  both root `VISION.md` and the `vision` skill; `vision` skill should just say
  to read `VISION.md`.

Completion threshold:
- Root `VISION.md` is the single doctrine source.
- `vision` source and generated skill are tiny routers to root `VISION.md`.
- `slate-auto`, `plate-plugin-creator`, and `.agents/AGENTS.md` point future
  reusable vision updates at root `VISION.md`.
- `pnpm install` regenerates skills.
- Source audits prove no `patch vision` / `update vision` / `vision profile`
  ownership wording remains.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-vision-single-source-of-truth.md`
  passes.

Verification surface:
- `pnpm install`
- `sed -n '1,40p' .agents/skills/vision/SKILL.md`
- `rg -n -e 'vision profile' -e 'patch \`vision\`' -e 'update \`vision\`' .agents/rules .agents/skills .agents/AGENTS.md VISION.md docs/plans/templates`
- `rg -n -F 'Root \`VISION.md\` is the only doctrine source' .agents/rules/vision.mdc .agents/skills/vision/SKILL.md`
- `rg -n -F '.agents/rules/vision.mdc' .agents/rules .agents/skills .agents/AGENTS.md VISION.md docs/plans/templates`

Constraints:
- Preserve runtime/package behavior.
- Do not commit, push, or PR.
- Do not hand-edit generated `.agents/skills/**/SKILL.md`.
- Do not maintain duplicated doctrine in the skill body.

Boundaries:
- Source of truth: `VISION.md`.
- Generated route source: `.agents/rules/vision.mdc`.
- Generated mirrors: `.agents/skills/**` through `pnpm install`.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: no runtime code, package API, docs-site route, release, PR, or
  external OpenClaw sync.

Output budget strategy:
- Use targeted `sed`, `wc`, and `rg`; cap command output and avoid broad dumps.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills or root `VISION.md`
  cannot be written.

Task state:
- task_type: docs plus agent-native skill routing
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: single source is root `VISION.md`
- confidence: high
- next owner: final response
- reason: keeping doctrine in both root doc and skill is duplicate ownership.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured "do not maintain both" and "vision skill should just say to read VISION.md". |
| Skill analysis before edits | yes | Read `autogoal`, `vision`, `docs-creator`, and `agent-native-reviewer`. |
| Active goal checked or created | yes | No active goal; goal created. |
| Source of truth read before edits | yes | Read existing root `VISION.md`, `.agents/rules/vision.mdc`, generated `.agents/skills/vision/SKILL.md`, `slate-auto`, `plate-plugin-creator`, and `.agents/AGENTS.md`. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no runtime behavior. |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior change. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Targeted audits only. |
| Docs pack selected | yes | Root `VISION.md` changed. |
| `docs-creator` loaded | yes | Loaded; current-state voice applied, no changelog prose. |
| Docs lane selected | yes | Root project vision doc, not docs-site MDX. |
| Target docs and nearest sibling docs read | yes | Existing root `VISION.md` and source `vision` rule read. |
| Docs style doctrine read | yes | `docs-creator` read; applied concise current-state style. |
| Documented source owner identified | yes | Root `VISION.md` is the owner. |
| Agent-native pack selected | yes | Skill routing changed. |
| Agent-facing action surface identified | yes | `$vision` now routes to root `VISION.md`. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/vision.mdc`; generated skill via `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; no app UI parity issue. |

Work Checklist:
- [x] First checkpoint complete: explicit prompt requirements copied into this
      plan before implementation.
- [x] Objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Task source classified.
- [x] Video evidence marked N/A.
- [x] Nearby repo instructions and implementation patterns read.
- [x] Implementation fixes the ownership boundary: root `VISION.md` owns
      doctrine; the skill routes.
- [x] Release artifact requirement marked N/A.
- [x] Final handoff shape decided.
- [x] Branch handling marked N/A.
- [x] Local-env-rot retry marked N/A.
- [x] Workspace authority recorded.
- [x] High-risk note recorded: duplicate doctrine owner removed.
- [x] Review target marked N/A for docs/skill routing only.
- [x] Agent-native review decision recorded.
- [x] Output budget discipline followed.
- [x] Docs pack: docs lane, target doc, and source owner recorded.
- [x] Docs pack: named claims are owner-policy claims, not API/runtime claims.
- [x] Docs pack: docs use current-state reference voice.
- [x] Docs pack: links/routes/previews are N/A.
- [x] Agent-native pack: source rule edited instead of generated mirror.
- [x] Agent-native pack: changed action is discoverable from skill text.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: no accepted review findings remain.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named audits and sync | `pnpm install` passed; audits below passed. |
| Bug reproduced before fix | no | N/A | Not a bug repro task. |
| Targeted behavior verification | yes | Verify generated skill route | `.agents/skills/vision/SKILL.md` is a router to root `VISION.md`. |
| TypeScript or typed config changed | no | N/A | Markdown/rule only. |
| Package exports or file layout changed | no | N/A | No package export changes. |
| Package manifests, lockfile, or install graph changed | no | N/A | Lockfile reported up to date during `pnpm install`. |
| Agent rules or skills changed | yes | Run `pnpm install` | Passed; Skiller applied rules. |
| Workspace authority proof | yes | Run proof in repo root | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | No browser surface. |
| Browser final proof | no | N/A | No browser surface. |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed. |
| Package behavior or public API changed | no | N/A | No package behavior/API changed. |
| Registry-only component work changed | no | N/A | No registry component work. |
| Docs or content changed | yes | Verify content owner and current-state wording | Root `VISION.md` owns doctrine; no changelog wording added. |
| High-risk mini gate | yes | Remove duplicate doctrine owner | `vision` skill is router; root `VISION.md` says not to maintain separate skill doctrine. |
| Agent-native review for agent/tooling changes | yes | Load reviewer | Loaded; PASS for skill routing. |
| Local install corruption suspected | no | N/A | No install corruption signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Docs/skill routing only; targeted audits are sufficient. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR/browser proof. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill final fields | Filled below. |
| Final lint | no | N/A | No code lint surface. |
| Output budget discipline | yes | Verify scoped outputs | Commands were scoped and capped. |
| Goal plan complete | yes | Run check-complete | Run after this update. |
| Docs source-backed claim audit | yes | Verify source owner | Source owner is root `VISION.md`; skill route audited. |
| Docs links / routes / previews | no | N/A | No docs-site route/preview links added. |
| Docs MDX/content parser | no | N/A | Root Markdown, not MDX/content route. |
| Plugin page specifics | no | N/A | Not a plugin page. |
| Agent source / generated sync | yes | Run `pnpm install` | Passed. |
| Agent action discoverability | yes | Verify generated skill | `vision` generated skill tells agents to read root `VISION.md`. |
| Agent-native review | yes | Load reviewer | Loaded; no action parity issue. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Root doc, source rule, generated skill, and relevant owner rules read. | implementation |
| Implementation | complete | Root doc consolidated; skill shrunk; owner references patched. | verification |
| Verification | complete | `pnpm install` and audits passed. | closeout |
| PR / tracker sync | skipped | N/A: no PR/tracker requested. | final response |
| Closeout | complete | Plan completed; completion script remains. | final response |

Findings:
- The previous design still had two practical doctrine owners: root `VISION.md`
  and the `vision` skill body.
- `slate-auto` still had wording that could teach future agents to patch the
  skill/rule instead of root `VISION.md`.

Decisions and tradeoffs:
- Root `VISION.md` is the single doctrine source.
- `.agents/rules/vision.mdc` remains only because Skiller needs a source file
  to generate the discoverable `$vision` skill.
- Generated `.agents/skills/vision/SKILL.md` is intentionally tiny.

Implementation notes:
- Replaced root `VISION.md` with consolidated Common/Slate/Plate doctrine.
- Replaced `.agents/rules/vision.mdc` with a router.
- Patched `slate-auto` reusable taste capture references to root `VISION.md`.
- Patched `plate-plugin-creator` handoff wording to `VISION.md updated` /
  `VISION.md reaffirmed`.
- Patched `.agents/AGENTS.md` to describe `vision` as a route to root
  `VISION.md`.

Review fixes:
- Removed stale `vision profile` wording from `slate-auto`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| One audit command used backticks in a double-quoted shell pattern, causing shell substitution noise | 1 | Use single-quoted/fixed patterns for literal backticks | Re-ran audits with safe patterns. |

Verification evidence:
- `pnpm install` passed and regenerated skills.
- `sed -n '1,40p' .agents/skills/vision/SKILL.md` shows a tiny router to root
  `VISION.md`.
- `rg -n -e 'vision profile' -e 'patch \`vision\`' -e 'update \`vision\`' .agents/rules .agents/skills .agents/AGENTS.md VISION.md docs/plans/templates`
  returned no matches.
- `rg -n -F 'Root \`VISION.md\` is the only doctrine source' .agents/rules/vision.mdc .agents/skills/vision/SKILL.md`
  found the router line in source and generated skill.
- `rg -n -F '.agents/rules/vision.mdc' ...` finds only generated metadata
  pointing back to the rule source, which is expected.
- `wc -l` showed `VISION.md` has 457 lines, `.agents/rules/vision.mdc` 18
  lines, and `.agents/skills/vision/SKILL.md` 22 lines.

Final handoff contract:
- PR line: N/A.
- Issue / tracker line: N/A.
- Confidence line: High.
- Flow table:
  - Reproduced: duplicate owner confirmed by root doc plus long skill body.
  - Verified: `pnpm install`, generated skill audit, stale ownership wording
    audit.
- Browser check: N/A.
- Outcome: root `VISION.md` is the single doctrine source; `$vision` only
  routes there.
- Caveat: `.agents/rules/vision.mdc` still exists as Skiller source, but it is
  a router, not doctrine.
- Design:
  - Chosen boundary: root `VISION.md`.
  - Why not keep both: duplicate doctrine owners drift.
  - Why not delete skill: agents need a discoverable `$vision` trigger.
- Verified: commands above.
- PR body verified: N/A.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: none blocking.

Timeline:
- 2026-06-16T09:26:59.101Z Task goal plan created.
- 2026-06-16 root `VISION.md` made single source.
- 2026-06-16 `pnpm install` regenerated skills.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Run check-complete, mark goal complete, final response. |
| What is the goal? | Single-source vision in root `VISION.md`. |
| What have I learned? | The skill must route only; otherwise doctrine splits. |
| What have I done? | Consolidated doc, shrunk skill, patched future-owner references, synced and audited. |

Open risks:
- None blocking.
