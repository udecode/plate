# openclaw evidence and contract imports

Objective:
Import OpenClaw evidence review and fake-runtime contract-test invariants; done when source owners sync and audits pass; plan docs/plans/2026-06-16-openclaw-evidence-and-contract-imports.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-16-openclaw-evidence-and-contract-imports.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Completion threshold:
- Only the two approved OpenClaw imports are captured: evidence-validated AI review and fake-runtime contract testing.
- Source owners are patched, generated skill mirrors are synced, OpenClaw decisions are recorded, audits pass, and check-complete passes.

Verification surface:
- `pnpm install`
- `rg -F` audits for source and generated skill text
- JSON parse for `docs/sync/openclaw/decisions.json`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-evidence-and-contract-imports.md`

Constraints:
- Do not import debugger, release, taskflow, video-frame, or broad worker-orchestration rows.
- Do not create a new wrapper skill.
- Edit `.agents/AGENTS.md` and `.agents/rules/*.mdc`, then sync generated skills.
- Do not hand-edit generated `SKILL.md` mirrors.
- Do not commit, push, create PRs, or mutate GitHub.

Boundaries:
- Source of truth: OpenClaw `clawpatch/docs/code-review.md`, `acpx/docs/2026-02-19-mock-agent-testing.md`, and local `.agents` source rules.
- Allowed edit scope: `.agents/AGENTS.md`, `.agents/rules/{slate-patch,testing,editor-test-harvester,slate-auto}.mdc`, `docs/sync/openclaw/decisions.json`, generated mirrors via `pnpm install`, and this plan.
- Browser surface: N/A, no app/browser UI changed.
- Tracker sync: N/A, no issue/PR lane.
- Non-goals: debugger installs, release verification import, taskflow import, video-frame import, public API/runtime code changes.

Output budget strategy:
- Use focused `sed` and `rg -F` reads with capped output.
- Save broad OpenClaw comparison output to `.tmp/openclaw-sync/report.*`; do not stream full unresolved row analysis into the plan.

Blocked condition:
- Stop if the source owner for the two accepted invariants cannot be identified without hand-editing generated skills. This did not occur.

Task state:
- task_type: agent workflow import
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until tool close

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: source rules, generated mirrors, decision ledger, and audits agree.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User narrowed to "only 1 and 2"; plan records exactly those two imports and non-goals. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal`, `openclaw-sync`, OpenClaw source docs, local `autoreview`, `plite-auto`, `plite-patch`, `testing`, `editor-test-harvester`, and `agent-native-reviewer`. |
| Active goal checked or created | yes | `get_goal` returned none; created goal for this import. |
| Source of truth read before edits | yes | Read OpenClaw `docs/code-review.md`, `docs/2026-02-19-mock-agent-testing.md`, and `docs/plugins/sdk-testing.md`. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no runtime implementation code changed. |
| TDD decision before behavior change or bug fix | no | N/A: policy-only import, no behavior bug fix. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package/runtime release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync requested. |
| Output budget strategy recorded | yes | Focused reads/audits only; broad report stored under `.tmp/openclaw-sync/`. |
| Agent-native pack selected | yes | Applied `agent-native` pack because `.agents/**` changed. |
| Agent-facing action surface identified | yes | Autoreview validation and Plite/editor testing supervisor rules. |
| Source rule versus generated mirror boundary identified | yes | Patched `.agents/AGENTS.md` and `.agents/rules/*.mdc`; generated `SKILL.md` through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no parity gap from policy-only edits. |

Work Checklist:
- [x] Duration decision recorded: N/A, no duration requested.
- [x] First checkpoint complete: only evidence-validated AI review and fake-runtime contract testing are in scope.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified as OpenClaw source-backed agent workflow import.
- [x] Video evidence marked N/A because no media was provided for this task.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Durable ownership boundary used: source rules and AGENTS, not generated mirrors.
- [x] Release artifact requirement marked N/A because no package behavior changed.
- [x] Final handoff shape decided: changed list, verification, caveats.
- [x] Branch handling marked N/A because no commit/PR requested.
- [x] Local-env-rot retry policy marked N/A because commands did not fail with install-corruption signals.
- [x] Workspace authority recorded: all proof commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: agent workflow policy changed; proof is generated mirror audit plus agent-native review.
- [x] Autoreview target marked N/A because this is policy-only and the requested improvement is itself review-gate hardening.
- [x] Agent-native review decision recorded and applied.
- [x] Output budget discipline recorded and followed.
- [x] Source-of-truth rule files edited instead of generated skill mirrors.
- [x] Changed agent action is discoverable from source and generated skill text.
- [x] Generated mirrors synced with `pnpm install`.
- [x] Agent-native review produced no accepted actionable finding.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source/generated audits and check-complete | `rg -F` audits, JSON parse, `check-complete` final gate. |
| Bug reproduced before fix | no | Record N/A | N/A: no bug fix. |
| Targeted behavior verification | no | Record N/A | N/A: no runtime behavior changed. |
| TypeScript or typed config changed | no | Record N/A | N/A: Markdown/JSON policy only. |
| Package exports or file layout changed | no | Record N/A | N/A: no package exports or layout changed. |
| Package manifests, lockfile, or install graph changed | no | Record N/A | N/A: `pnpm install` ran for generated skill sync, lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated skill `rg -F` audits passed. |
| Workspace authority proof | yes | Run verification in owning repo | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Record N/A | N/A: no UI/browser surface changed. |
| Browser final proof | no | Record N/A | N/A: no browser proof applies. |
| CI-controlled template output changed | no | Record N/A | N/A: no CI-controlled template output edited. |
| Package behavior or public API changed | no | Record N/A | N/A: no package behavior or API changed. |
| Registry-only component work changed | no | Record N/A | N/A: no registry component work. |
| Docs or content changed | yes | Verify source-backed claims | This plan and sync decision ledger cite local source reads and exact owner files. |
| High-risk mini gate | yes | Record failure mode and boundary | Failure mode: agents accept stale review hallucinations or keep writing one-off fake smokes. Boundary: source rules and AGENTS, not runtime code. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Loaded reviewer; no actionable parity gap from policy-only edits. |
| Local install corruption suspected | no | Record N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Record N/A | N/A: no runtime implementation change; this task hardens autoreview policy itself. |
| PR create or update | no | Record N/A | N/A: no PR requested. |
| Task-style PR body verified | no | Record N/A | N/A: no PR body. |
| PR proof image hosting | no | Record N/A | N/A: no PR/browser image. |
| Tracker sync-back | no | Record N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill outcome, caveats, verification | Final response will list changed files, verification, and caveat. |
| Final lint | no | Record N/A | N/A: Markdown/JSON policy change; `pnpm install` generated mirrors. |
| Output budget discipline | yes | Verify no unbounded output was relied on | Broad report saved under `.tmp/openclaw-sync/`; final audits used focused `rg -F`. |
| Timed checkpoint | no | Record N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run check-complete | Final mechanical gate before goal close. |
| Agent source / generated sync | yes | Run sync and audit generated mirrors | `pnpm install`; `rg -F` found generated `testing`, `editor-test-harvester`, `plite-auto`, and `plite-patch` text. |
| Agent action discoverability | yes | Source-audit skill/rule path | `rg -F` audits show source and generated mirrors carry the rules. |
| Agent-native review | yes | Load reviewer and close findings | Reviewer loaded; no accepted finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | OpenClaw and local owner files read | implementation |
| Implementation | complete | `.agents/AGENTS.md`, source rules, decision ledger patched | verification |
| Verification | complete | `pnpm install`, `rg -F`, JSON parse passed | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | complete | Plan resolved; check-complete final gate remains recorded in verification evidence | final response |

Findings:
- OpenClaw `clawpatch/docs/code-review.md` has a stronger review finding gate: findings are not valid unless evidence still matches current files.
- OpenClaw/acpx mock-agent docs and plugin testing docs point to fake peers and contract helpers as better proof than one-off smokes.
- Local `autoreview` skill exists without a repo-local source rule, so durable local enforcement belongs in `.agents/AGENTS.md` and the Plite rules that call review.

Decisions and tradeoffs:
- Imported evidence validation into `.agents/AGENTS.md` and `plite-patch` closeout, not by editing generated `autoreview/SKILL.md`.
- Imported fake-runtime contract testing into `testing`, `editor-test-harvester`, and `plite-auto`, not by creating a new wrapper skill.
- Rejected broader OpenClaw imports in this pass because the user said only items 1 and 2.

Implementation notes:
- `.agents/AGENTS.md`: AI review findings require current checkout scope, live line range, and quote match.
- `.agents/rules/slate-patch.mdc`: accepted review findings need the same validation before fixes.
- `.agents/rules/testing.mdc`: added Fake Runtime Contracts section.
- `.agents/rules/editor-test-harvester.mdc`: portable runtime-boundary invariants route to fake-runtime/contract helpers.
- `.agents/rules/slate-auto.mdc`: repeated host/browser/peer/service proof gaps route to fake runtime or contract helper before optimization/coverage claims.
- `docs/sync/openclaw/decisions.json`: records both accepted source rows.

Review fixes:
- No accepted actionable review findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Piped OpenClaw report through an over-narrow `rg` filter and got no stdout | 1 | Inspect report JSON directly by `sourceRel` | Confirmed both target rows now resolve as `accepted` |

Verification evidence:
- `pnpm install` -> passed and regenerated Codex/Claude skill mirrors.
- `rg -F "AI review findings are actionable only when grounded in the current checkout" .agents/AGENTS.md AGENTS.md` -> source and generated root AGENTS contain the rule.
- `rg -F "line range still exists" .agents/AGENTS.md AGENTS.md .agents/rules .agents/skills` -> AGENTS plus generated `plite-patch` mirror contain the review validation rule.
- `rg -F "Fake Runtime Contracts" .agents/rules/testing.mdc .agents/skills/testing/SKILL.md` -> source and generated mirror contain the section.
- `rg -F "runtime-boundary problem" .agents/rules/editor-test-harvester.mdc .agents/skills/editor-test-harvester/SKILL.md` -> source and generated mirror contain the harvest rule.
- `rg -F "Runtime-boundary oracle gap" .agents/rules/slate-auto.mdc .agents/skills/slate-auto/SKILL.md` -> source and generated mirror contain the supervisor rule.
- `node -e "JSON.parse(require('fs').readFileSync('docs/sync/openclaw/decisions.json','utf8')); console.log('decisions json ok')"` -> passed.
- `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --max 40 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json` plus JSON `sourceRel` inspection -> `docs/code-review.md` and `docs/2026-02-19-mock-agent-testing.md` now resolve as `accepted`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; source/generated audits passed.
- Flow table:
  - Reproduced: N/A, policy import.
  - Verified: `pnpm install`, `rg -F` audits, JSON parse, check-complete.
- Browser check: N/A, no browser surface.
- Outcome: only the two requested OpenClaw ideas were imported.
- Caveat: local `autoreview` has no repo-local `.mdc` source, so the durable rule is in AGENTS and callers rather than generated autoreview text.
- Design:
  - Chosen boundary: source AGENTS/rules plus decision ledger.
  - Why not quick patch: generated `SKILL.md` hand edits would be lost.
  - Why not broader change: user explicitly limited scope to items 1 and 2.
- Verified: see Verification evidence.
- PR body verified: N/A, no PR.

Task-style PR body contract:
- N/A: no PR requested or created.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response after check-complete and goal close | Import only OpenClaw items 1 and 2 | Best owner is AGENTS/source rules, not new wrapper skills | Source rules patched, mirrors synced, audits passed |

Open risks:
- `autoreview` itself still lacks a repo-local source `.mdc`; if we later own the upstream/global source, move the current-checkout evidence validation into that skill directly.
