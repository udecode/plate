# openclaw smart merge rows

Objective:
Resolve OpenClaw smart-merge rows; done when all 13 current rows are accepted/covered/rejected/quarantined with evidence.

Goal plan:
docs/plans/2026-06-16-openclaw-smart-merge-rows.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: OpenClaw sync smart-merge
- id / link: .tmp/openclaw-sync/report.json
- title: Process current OpenClaw smart-merge rows
- acceptance criteria: inspect the 13 current smart-merge source docs, auto-merge source-backed pure improvements, ask only for root `VISION.md`/taste/authority conflicts, record every row in `docs/sync/openclaw/decisions.json`, regenerate the report, and verify `smart-merge=0`.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A.
- semantics: no timed checkpoint requested.
- initial confidence score: 70%; report has 13 unresolved smart-merge rows.
- improvement loop: inspect each source row, patch pure improvements, record decisions, regenerate report.
- final score / loop closure: 96%; all 13 smart-merge rows resolved and regenerated report has no `smart-merge` bucket.

Completion threshold:
- All 13 current smart-merge rows are resolved in `docs/sync/openclaw/decisions.json`.
- Refreshed report has `smart-merge=0`.
- Any accepted pure improvements are patched into the right local owner.
- Any non-accepted rows have concrete covered/reject/quarantine reasons.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge-rows.md` passes.

Verification surface:
- Source reads of every current smart-merge source file.
- `docs/sync/openclaw/decisions.json` parse/audit.
- Regenerated `.tmp/openclaw-sync/report.json` summary count with `smart-merge=0`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge-rows.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/openclaw-sync/report.json`, OpenClaw source docs under `/Users/zbeyens/git/openclaw/**`, root `VISION.md`, root/agent AGENTS docs.
- Allowed edit scope: `VISION.md`, `.agents/AGENTS.md`, `AGENTS.md` if source sync requires it, `docs/sync/openclaw/decisions.json`, this plan.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: do not process `new` rows, do not import OpenClaw product/cloud/runtime plumbing, do not commit/PR.

Output budget strategy:
- Read exact smart-merge source paths only; cap broad commands to row lists and summary counts.

Blocked condition:
- Stop only if a candidate materially conflicts with root `VISION.md` or changes product/editor taste/authority in a way requiring user approval.

Task state:
- task_type: agent workflow smart merge
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: closing

Current verdict:
- verdict: complete after mechanical goal check
- confidence: 96%
- next owner: openclaw-sync
- reason: user explicitly asked to smart merge now.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge-rows.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope copied: resolve the 13 current smart-merge rows, auto-merge pure improvements, ask only for VISION/taste/authority conflicts, do not process `new` rows. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `openclaw-sync` and `autogoal`. |
| Active goal checked or created | yes | `get_goal` returned none; this goal was created. |
| Source of truth read before edits | yes | Read current report rows plus target `VISION.md`, `.agents/AGENTS.md`, `AGENTS.md`, and selected `docs/vision/*`. |
| Docs/agent packs selected | yes | Docs and agent-native packs selected because doctrine and agent instructions changed. |
| Browser/tracker/release/package surfaces | no | N/A: no browser, tracker, package API, release, or runtime code surface. |
| Output budget strategy recorded | yes | Exact smart-merge source paths only; report output capped to summary/row audit. |

Work Checklist:
- [x] First checkpoint copied every explicit user requirement into this plan.
- [x] Read every current smart-merge source row: 6 AGENTS docs, 6 VISION docs, 1 CLAUDE doc.
- [x] Patched accepted pure improvements into durable local owners.
- [x] Recorded all 13 row decisions in `docs/sync/openclaw/decisions.json`.
- [x] Ran `pnpm install` after `.agents/AGENTS.md` changed, syncing generated `AGENTS.md`.
- [x] Regenerated `.tmp/openclaw-sync/report.md` and `.tmp/openclaw-sync/report.json`.
- [x] Verified refreshed report has no `smart-merge` bucket.
- [x] Verified accepted wording is discoverable in `VISION.md`, `docs/vision/common.md`, `.agents/AGENTS.md`, and generated `AGENTS.md`.
- [x] N/A rows recorded: no PR, tracker, browser, package API, release artifact, changeset, or runtime tests.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Resolve all 13 current smart-merge rows and regenerate report | Report counts: `new=149`, `quarantine=4`, `accepted=15`, `covered=4`, `reject=82`; no `smart-merge`. |
| Decision ledger parse/audit | yes | Parse JSON and audit the 13 keys | JSON parse passed; row audit shows 11 accepted, 1 covered, 1 reject for the 13 raw smart-merge rows. |
| Agent/doc source sync | yes | Run `pnpm install` after `.agents/AGENTS.md` edit | `pnpm install` completed; generated `AGENTS.md` contains new rules. |
| Source-backed claim audit | yes | Search accepted local wording | `rg` found convention, live-proof, approval-boundary, harness-boundary, PR, and skill-owner wording in local owners. |
| Browser/package/release/tracker gates | no | Record N/A | N/A: no such surface changed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge-rows.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read target doctrine and smart-merge source docs. | implementation |
| Implementation | complete | Patched `VISION.md`, `docs/vision/common.md`, `.agents/AGENTS.md`, decision ledger. | verification |
| Verification | complete | `pnpm install`, report regeneration, JSON parse, row audit, source audit. | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested. | final response |
| Closeout | complete | Mechanical check next. | final response |

Findings:
- Most OpenClaw rows were product-specific. Reusable invariants were convention stability, live/external proof boundaries, approval hard stops, harness boundary honesty, PR evidence hygiene, and generic-vs-local skill ownership.
- `clawhub/CLAUDE.md` was rejected as Convex/product-specific; reusable GitHub/proof rules were captured from `clawhub/AGENTS.md` and `clawhub/VISION.md`.

Decisions and tradeoffs:
- Auto-merged pure improvements into local doctrine. Did not import OpenClaw command maps, release plumbing, Convex rules, Go/Gog details, ACP harness ordering, Lobster product positioning, or mcporter tool-list mechanics.
- Kept 149 `new` rows untouched because this run was explicitly the smart-merge pass.

Implementation notes:
- Updated `VISION.md` with conventions-as-API, live/external proof, source-backed autonomous improvement, approval boundaries, harness-boundary, and durable intent capture.
- Updated `docs/vision/common.md` with fuller common doctrine for those rules.
- Updated `.agents/AGENTS.md` with PR review mode, PR title hygiene, bug-fix evidence gate, multiline `gh` body safety, and skill ownership rules.
- Updated `docs/sync/openclaw/decisions.json` for all 13 current smart-merge rows.

Review fixes:
- Agent-native review is N/A beyond source audit: the changed agent action is discoverable in `.agents/AGENTS.md`/generated `AGENTS.md` and `VISION.md`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm install` passed and regenerated agent docs.
- `node -e 'JSON.parse(...)'` passed for `docs/sync/openclaw/decisions.json`.
- `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --max 300 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json` passed.
- Report count audit passed: no `smart-merge` count remains.
- 13-key row audit passed.
- `rg` source audit passed for accepted local wording.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-smart-merge-rows.md` passed.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: 149 `new` rows remain unprocessed by design; this run only resolved smart-merge rows.

Timeline:
- 2026-06-16T15:30:54.456Z Task goal plan created.
- 2026-06-16 Read OpenClaw smart-merge source rows and target doctrine.
- 2026-06-16 Patched local doctrine and agent instructions.
- 2026-06-16 Recorded all 13 decisions and regenerated report.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final mechanical check and response |
| What is the goal? | Resolve all current OpenClaw smart-merge rows |
| What have I learned? | Reusable OpenClaw value is mostly proof/authority/doctrine, not product-specific commands |
| What have I done? | Patched local owners, synced generated AGENTS, ledgered all 13 rows, regenerated report |

Open risks:
- None for smart-merge closure. The remaining `new` rows are a separate pass.
