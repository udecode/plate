# openclaw selected new merges

Objective:
Merge selected OpenClaw new rows; done when `security-triage`, `gitcrawl`, and `browser-automation` are accepted or covered with evidence in the local workflow system.

Completion threshold:
- The selected OpenClaw `security-triage` row has a durable local owner.
- The selected OpenClaw `gitcrawl` row has archive-first discovery/freshness/live-mutation discipline in the right local owner.
- The selected OpenClaw `browser-automation` row has stable-page, read-before-action, stale-ref, and blocker discipline in local browser owners.
- `docs/sync/openclaw/decisions.json` records all three decisions.
- Regenerated `.tmp/openclaw-sync/report.json` shows all three selected rows as not `new`.

Verification surface:
- Source reads: OpenClaw `security-triage`, `gitcrawl`, and `browser-automation` skill files; local `github-triage`, `dev-browser`, `.agents/rules/dev-browser.mdc`, and `.agents/AGENTS.md`.
- Sync command: `pnpm install`.
- JSON parse: `node -e 'JSON.parse(require("fs").readFileSync("docs/sync/openclaw/decisions.json","utf8")); console.log("decisions json ok")'`.
- Report regeneration: `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --max 300 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json`.
- Row audit: Node script over `.tmp/openclaw-sync/report.json`.
- Source audit: `rg` over changed owners for security, gitcrawl, and browser-loop terms.
- Agent-native review: loaded `.agents/skills/agent-native-reviewer/SKILL.md` and reviewed changed action surfaces.

Constraints:
- Do not process unrelated OpenClaw `new` rows.
- Do not import OpenClaw product/runtime plumbing.
- Do not create PRs, comments, commits, or pushes.
- Prefer patching the existing owner over adding wrapper skills.

Boundaries:
- New global owner: `/Users/zbeyens/.agents/skills/security-triage/SKILL.md`.
- Existing global owner: `/Users/zbeyens/.agents/skills/github-triage/SKILL.md`.
- Existing browser owners: `/Users/zbeyens/.agents/skills/dev-browser/SKILL.md` and `.agents/rules/dev-browser.mdc`.
- Decision ledger: `docs/sync/openclaw/decisions.json`.
- Generated mirrors: synced by `pnpm install`.

Blocked condition:
Stop only if a selected row requires a product/API/authority decision beyond source-backed workflow improvement. No blocker hit.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope narrowed to `security-triage`, `gitcrawl`, and `browser-automation`; no timing requested. |
| Timed checkpoint parsed | no | No duration in prompt. |
| Source of truth read before edits | yes | Read all three OpenClaw source skills and local owners before patching. |
| Agent source/generated boundary identified | yes | Edited `.agents/rules/dev-browser.mdc`; synced generated `.agents/skills/dev-browser/SKILL.md` with `pnpm install`. |
| PR/commit expectation | no | User did not ask for commit, push, PR, GitHub mutation, or issue comments. |

Work Checklist:
- [x] First checkpoint copied the prompt scope, non-goals, verification surface, and completion criteria into this plan.
- [x] Source rows and local owners were read before edits.
- [x] `security-triage` was created as a generic global skill, not copied as OpenClaw-specific ritual.
- [x] `gitcrawl` was merged into `github-triage` as archive-first discovery, not mutation truth.
- [x] `browser-automation` was merged into global and repo-local dev-browser guidance.
- [x] `docs/sync/openclaw/decisions.json` records accepted decisions for all three rows.
- [x] `.agents/rules/**` changes were synced through `pnpm install`.
- [x] Agent-native review was performed for the changed agent action surface.
- [x] OpenClaw report was regenerated and all three selected rows audit as `accepted`.
- [x] No browser proof, release artifact, changeset, PR, or tracker sync applies because this is agent workflow documentation/skill plumbing only.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | All selected rows audit as `accepted` in `.tmp/openclaw-sync/report.json`. |
| Agent rules or skills changed | yes | `pnpm install` completed and generated dev-browser mirror contains the new loop rules. |
| Agent-native review | yes | Loaded `agent-native-reviewer`; no parity gap because these are agent-only workflow surfaces and discoverability was added. |
| Decision ledger valid | yes | JSON parse command returned `decisions json ok`. |
| Source audit | yes | `rg` found the expected repo-scoped security, gitcrawl, stable-page, stale-ref, and blocker text in changed owners. |
| Browser surface changed | no | No app/browser UI changed. |
| Typecheck/lint/package tests | no | No TypeScript/package/runtime files changed. |
| Changeset/release artifact | no | No package behavior or public package API changed. |
| PR/tracker sync | no | No PR or GitHub mutation requested. |
| Goal plan complete | yes | This plan is ready for `check-complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | OpenClaw and local owner files read | done |
| Implementation | complete | Security skill added; GitHub/browser owners patched; ledger updated | done |
| Verification | complete | `pnpm install`, JSON parse, report regen, row audit, source audit | done |
| Closeout | complete | Final response will list changes and evidence | done |

Findings:
- `security-triage` had enough reusable value to become a global skill.
- `gitcrawl` is best as a discovery/freshness layer inside GitHub triage. A standalone wrapper would add routing noise.
- `browser-automation` maps to dev-browser operating discipline. OpenClaw CLI-specific syntax was rejected.

Decisions and tradeoffs:
- Accepted `security-triage` as a new global skill because no current owner covered GHSA/CVE advisory triage with shipped-state proof.
- Accepted `gitcrawl` into `github-triage` because mutation must stay live-`gh` backed.
- Accepted `browser-automation` into dev-browser owners because it strengthens every browser loop without making OpenClaw browser syntax local doctrine.

Verification evidence:
- `pnpm install` completed and ran Skiller successfully.
- `decisions.json` parsed successfully.
- OpenClaw report regenerated with counts: `accepted=18`, `covered=4`, `new=146`, `quarantine=4`, `reject=82`.
- Selected row audit:
  - `security-triage`: `accepted`, raw `smart-merge`, owner `/Users/zbeyens/.agents/skills/security-triage/SKILL.md + .agents/AGENTS.md`.
  - `gitcrawl`: `accepted`, raw `new`, owner `/Users/zbeyens/.agents/skills/github-triage/SKILL.md`.
  - `browser-automation`: `accepted`, raw `new`, owner `.agents/rules/dev-browser.mdc + /Users/zbeyens/.agents/skills/dev-browser/SKILL.md`.
- Source audit found the new repo-scoped advisory, shipped-state, gitcrawl archive-first, stable-page, stale-ref, and blocker guidance in the changed owners and generated mirror.

Open risks:
- Remaining OpenClaw report still has 146 unrelated `new` rows; intentionally out of scope for this selected merge.
- Current Codex session skill list may not show the new global `security-triage` until a new session/tool skill refresh, but the global skill file exists and `.agents/AGENTS.md` routes to it.

Reboot status:
- If resumed, no implementation remains. Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-selected-new-merges.md` and close the active goal if it passes.
