# slate gate split

Objective:
Split Plite gates; keep `check:plite` as the full release/deletion gate, add a fast daily lane, update agent guidance, and verify the new focused commands.

Goal plan:
docs/plans/2026-06-19-slate-gate-split.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user follow-up after Plite deletion-readiness timing review
- id / link: N/A: local repo command-contract repair
- title: Split Plite daily and closure gates without weakening `check:plite`
- acceptance criteria:
  - `check:plite` remains the full release/deletion gate.
  - A faster daily Plite lane exists for packages plus Chromium smoke/focused browser rows.
  - WebKit, mobile, and full browser matrix stay closure gates.
  - No runtime optimization or editor behavior code is changed.
  - Agent/docs guidance points future loops at the right gate.
  - Focused verification proves the fast lane scripts run.

First checkpoint:
- Captured explicit requirements before implementation: keep `check:plite` full; add fast daily lane; daily lane covers package checks plus Chromium smoke and focused browser rows; WebKit/mobile/full matrix closure-only; update guidance; verify scripts; do not optimize runtime code.

Timed checkpoint:
- requested duration: N/A: no duration requested for this command-contract patch.
- semantics: N/A
- initial confidence score: N/A: binary gate-shape repair.
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Root package scripts expose a fast Plite daily command while preserving `check:plite` as the full gate.
- `apps/www` exposes Chromium smoke and focused Chromium browser commands.
- `.agents/AGENTS.md` and relevant plan/template docs describe the split correctly.
- `pnpm install` syncs generated agent mirrors after `.agents/AGENTS.md` edits.
- Focused verification commands pass or a real blocker is recorded with owner.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-slate-gate-split.md` passes.

Verification surface:
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('apps/www/package.json','utf8'))"`
- `pnpm install`
- `pnpm check:plite:fast`
- `pnpm --filter www test:plite-browser:chromium-smoke`
- `pnpm --filter www test:plite-browser:chromium tests/plite-browser/slate-examples.spec.ts -g "plaintext loads"`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-slate-gate-split.md`

Constraints:
- Preserve current Plite runtime, package API, examples, and browser behavior.
- Do not rename or weaken `check:plite`; it remains the broad release/deletion gate.
- Do not add fake changed-file intelligence. Focused browser rows are exposed as an explicit command that accepts Playwright file/grep args directly; do not insert a literal `--` after the script name.
- Do not create PRs, comments, commits, or pushes.

Boundaries:
- Source of truth: root `package.json`, `apps/www/package.json`, `.agents/AGENTS.md`, `docs/plans/templates/auto.md`, and `docs/plans/2026-06-18-plite-deletion-readiness.md`.
- Allowed edit scope: command scripts and docs/agent guidance only.
- Browser surface: no app UI change; browser proof is Playwright command-contract proof only.
- Browser strategy: use repo-owned Playwright commands, not Browser/Chrome, because this task changes test scripts rather than rendered UI.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: no runtime optimization, no Plite behavior change, no package export/API change, no full browser-matrix run unless the fast command reveals a gate-contract issue.

Output budget strategy:
- Read package/config/guidance files with `sed` and focused `rg`; cap long outputs; run only named verification commands instead of streaming the full `check:plite` matrix.

Blocked condition:
- Stop if the repo cannot express a fast lane without weakening `check:plite`, if Playwright project names do not match the proposed commands, or if `pnpm install`/JSON parse proves the command wiring invalid.

Task state:
- task_type: command-contract and agent-guidance repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: done
- confidence: high
- next owner: auto
- reason: `check:plite` remains full, `check:plite:fast` passed, focused Chromium row invocation is proven, and generated agent guidance is synced.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-slate-gate-split.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists every explicit user requirement and non-goal. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | `autogoal` and `task` were selected; plan template packs applied. |
| Active goal checked or created | yes | Created active goal for Plite gate split. |
| Source of truth read before edits | yes | Read root scripts, app scripts, Plite Playwright config, agent guidance, auto template, and deletion-readiness plan. |
| Tracker comments and attachments read | N/A | No tracker or media input. |
| Video transcript evidence required | N/A | No video input. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Command-contract patch, not implementation architecture. |
| TDD decision before behavior change or bug fix | N/A | No behavior code change. |
| Branch decision for code-changing task | N/A | User did not request branch/commit/PR. |
| Release artifact decision | N/A | Internal command/docs/agent-only change; no package user-visible delta. |
| Browser tool decision for browser surface | yes | Use Playwright command proof; no Browser plugin needed for script wiring. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker requested. |
| Output budget strategy recorded | yes | Broad outputs capped; no full matrix unless necessary. |
| Docs pack selected | yes | Plan uses docs pack for guidance updates. |
| `docs-creator` loaded | N/A | Internal command guidance, not public docs prose. |
| Docs lane selected | yes | Internal agent/plan docs lane. |
| Target docs and nearest sibling docs read | yes | Read `.agents/AGENTS.md`, auto plan template, deletion-readiness plan. |
| Docs style doctrine read | N/A | Not user-facing docs. |
| Documented source owner identified | yes | Command owner is root/app package scripts; agent guidance owner is `.agents/AGENTS.md`. |
| Package/API pack selected | yes | Package scripts changed, but package API/export surface is N/A. |
| Public surface or package boundary identified | yes | No public package API; only repo command surface. |
| Release artifact path selected | N/A | No published user-visible package delta. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset needed. |
| Barrel/export impact decision recorded | yes | No export or barrel change. |
| Agent-native pack selected | yes | `.agents/AGENTS.md` guidance changes affect agents. |
| Agent-facing action surface identified | yes | Plite command guidance and `auto` proof lane wording. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/AGENTS.md`; run `pnpm install` to sync generated output. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Waived unless command/guidance proof reveals ambiguous agent action; this is a narrow wording/script patch. |

Work Checklist:
- [x] Duration requirement recorded as N/A.
- [x] First checkpoint captures every explicit requirement, scope boundary, stop condition, deliverable, verification surface, and success criterion.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, title, acceptance criteria, browser surface, and root-cause layer.
- [x] Video/screen evidence marked N/A.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation boundary selected: command scripts and guidance, not runtime code.
- [x] Release artifact requirement recorded as N/A with reason.
- [x] Final handoff shape decided: changed files, proof commands, caveats, and next gate usage.
- [x] Branch handling recorded as N/A.
- [x] Local-env-rot retry policy recorded as N/A unless verification hits install-corruption signals.
- [x] Workspace authority recorded for package/app commands.
- [x] High-risk note recorded: wrong gate split would weaken deletion/release confidence.
- [x] Review/autoreview target marked N/A unless implementation grows beyond script/guidance wiring.
- [x] Agent-native review waived with reason for narrow source guidance update.
- [x] Output budget discipline recorded.
- [x] Docs pack rows resolved for internal docs/guidance.
- [x] Package/API pack rows resolved: repo command surface only; no package API/export release artifact.
- [x] Agent-native pack rows resolved: source guidance will be synced, generated mirrors not hand-edited.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run JSON parse, install sync, fast Plite gate, Chromium smoke, and plan check. | JSON parse passed; install passed; `pnpm check:plite:fast` passed; focused row passed; plan check pending after this update. |
| Bug reproduced before fix | N/A | Record reason. | No bug fix; command-contract repair. |
| Targeted behavior verification | N/A | Record reason. | No editor behavior changed. |
| TypeScript or typed config changed | N/A | Record reason. | No TS/config type surface changed. |
| Package exports or file layout changed | N/A | Record reason. | No package export/file layout change. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` because package scripts and `.agents/AGENTS.md` sync are touched. | `pnpm install` passed from `/Users/zbeyens/git/plate-2`; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` after `.agents/AGENTS.md` edit. | `pnpm install` regenerated Codex/Claude mirrors successfully. |
| Workspace authority proof | yes | Run commands from `/Users/zbeyens/git/plate-2`. | All verification commands ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A | Record reason. | No UI route changed; Playwright command surface only. |
| Browser final proof | yes | Run focused Plite Chromium smoke command. | `pnpm check:plite:fast` ran 13 Chromium app smoke rows; explicit focused row ran 1 Chromium test. |
| CI-controlled template output changed | N/A | Record reason. | No `templates/**` edits. |
| Package behavior or public API changed | N/A | Record reason. | Internal scripts/guidance only. |
| Registry-only component work changed | N/A | Record reason. | No registry output. |
| Docs or content changed | yes | Verify source-backed internal guidance and sync generated AGENTS output. | `rg` verified `.agents/AGENTS.md`, generated `AGENTS.md`, generated `auto` skill, and auto template reference the new commands. |
| High-risk mini gate | yes | Prove `check:plite` remains full and fast lane is additive. | `package.json` still keeps full `check:plite`; new `check:plite:fast` and `check:plite:browser-matrix` are additive. |
| Agent-native review for agent/tooling changes | N/A | Narrow agent guidance update; verification is source sync plus command proof. | waiver recorded |
| Local install corruption suspected | N/A | Record reason. | No corruption signal yet. |
| Autoreview for non-trivial implementation changes | N/A | Record reason. | Script/guidance patch only; no runtime code. |
| PR create or update | N/A | Record reason. | No PR requested. |
| Task-style PR body verified | N/A | Record reason. | No PR requested. |
| PR proof image hosting | N/A | Record reason. | No PR requested. |
| Tracker sync-back | N/A | Record reason. | No tracker requested. |
| Final handoff contract | yes | Fill changed list, commands, caveats, next usage. | Changed list, commands, caveat, and next usage recorded in final handoff sections below. |
| Final lint | N/A | Record reason. | JSON parse and focused commands are the relevant proof for scripts/docs. |
| Output budget discipline | yes | Keep command output scoped. | active |
| Timed checkpoint | N/A | Record reason. | No duration requested. |
| Goal plan complete | yes | Run autogoal completion script. | Run after this plan update. |
| Docs source-backed claim audit | yes | Verify guidance references actual scripts. | `rg` verified guidance command names against source files and generated mirrors. |
| Docs links / routes / previews | N/A | Record reason. | No links/routes/previews changed. |
| Docs MDX/content parser | N/A | Record reason. | No MDX/content changed. |
| Plugin page specifics | N/A | Record reason. | No plugin pages changed. |
| Public API / package boundary proof | N/A | Record reason. | No package API or exports changed. |
| Release artifact classification | yes | Classify as internal command/docs/agent-only. | no changeset |
| Published package changeset | N/A | Record reason. | No published package delta. |
| Registry changelog | N/A | Record reason. | No registry change. |
| No release artifact | yes | Record exact reason. | Internal scripts and agent guidance only. |
| Package typecheck/build/test | yes | Fast Plite gate runs package typecheck/test and browser package tests. | `pnpm check:plite:fast` passed source parity, package typecheck, package tests, browser package tests, and Chromium app smoke. |
| Barrel/export generation | N/A | Record reason. | No exports changed. |
| Agent source / generated sync | yes | Run `pnpm install`. | `pnpm install` passed and regenerated `AGENTS.md` / `.agents/skills/auto/SKILL.md`. |
| Agent action discoverability | yes | Source-audit `.agents/AGENTS.md` guidance. | `.agents/AGENTS.md` and `.agents/rules/auto.mdc` both name fast, focused, and closure Plite commands. |
| Agent-native review | N/A | Narrow waiver. | waiver recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Requirements captured; source files read. | implementation |
| Implementation | done | Root/app scripts and guidance updated. | verification |
| Verification | done | JSON parse, install sync, fast gate, and focused Chromium row passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | done | Plan evidence recorded; completion check next. | final response |

Findings:
- Current root `check:plite` is the full source/package/build/test/docs/bench/browser matrix and should remain the release/deletion gate.
- The previous deletion-readiness plan contains stale wording suggesting a future fast `check:plite`; that must be corrected.
- `apps/www/playwright.slate.config.ts` defines a `chromium` project, so focused Chromium script aliases can be precise.
- `pnpm --filter www test:plite-browser:chromium -- ...` is wrong in this workspace because the literal `--` reaches Playwright; direct args are required.

Decisions and tradeoffs:
- Add a new fast lane instead of changing the semantics of `check:plite`.
- Expose focused Chromium browser rows as a command that accepts Playwright file/grep arguments rather than inventing unreliable changed-file mapping.
- Keep full browser matrix, WebKit, and mobile out of the fast daily lane.
- Do not include docs, benchmark, package build, WebKit, mobile, or full app matrix in the daily fast lane. Those stay in `check:plite` or `check:plite:browser-matrix`.

Implementation notes:
- Added root `check:plite:fast` and `check:plite:browser-matrix`.
- Added `apps/www` `test:plite-browser:chromium` and `test:plite-browser:chromium-smoke`.
- Updated `.agents/AGENTS.md`, `.agents/rules/auto.mdc`, `docs/plans/templates/auto.md`, and stale deletion-readiness wording.
- Ran `pnpm install` to sync generated `AGENTS.md` and `.agents/skills/auto/SKILL.md`.

Review fixes:
- N/A

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused Chromium command was first invoked with `--`, which ran all 13 smoke rows instead of one grep row | 1 | Rerun without `--`; update guidance | Direct-args command ran exactly 1 Chromium row. |

Verification evidence:
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('apps/www/package.json','utf8'))"` passed.
- `pnpm install` passed twice; Skiller sync and Fumadocs postinstall completed.
- `pnpm check:plite:fast` passed:
  - source parity check passed with `2157/2157` donor rows accounted
  - Plite package typecheck passed for 8 packages
  - Plite package tests passed
  - `@platejs/browser` tests passed
  - Chromium smoke passed: `13 passed (24.5s)`
- `pnpm --filter www test:plite-browser:chromium tests/plite-browser/slate-examples.spec.ts -g "plaintext loads"` passed: `1 passed (6.5s)`.
- `rg` verified command names in `package.json`, `apps/www/package.json`, `.agents/AGENTS.md`, generated `AGENTS.md`, `.agents/skills/auto/SKILL.md`, and `docs/plans/templates/auto.md`.

Reboot status:
- Ready for final response. No active command sessions remain.

Open risks:
- `check:plite:fast` intentionally skips package build, docs audit, benchmark audit, www typecheck, WebKit, mobile viewport, and the full app browser matrix. That is the point: those remain release/deletion/closure gates.
