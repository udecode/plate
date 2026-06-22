# Cut Apps WWW Playwright Proof

Objective:
Cut apps/www Playwright proof; done when active commands/rules/docs no longer run Playwright against apps/www and checks pass.

Goal plan:
docs/plans/2026-06-22-cut-apps-www-playwright-proof.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native

Task source:
- type: chat correction
- title: Hard-cut apps/www Playwright proof
- acceptance criteria: no active script, source rule, generated skill, CI row, or current docs guidance tells agents to run Playwright against `apps/www`; Slate browser proof remains under `apps/slate`.

First checkpoint:
- Requirement copied before implementation: cut the `/blocks/playground` Playwright proof path; do not run Playwright against the `apps/www` app; keep Slate Playwright under `apps/slate`.

Timed checkpoint:
- N/A: no duration requested.

Completion threshold:
- `apps/www/package.json` has no Playwright or Slate-browser test scripts.
- Active command/rule/generated-skill/doc surfaces have no `apps/www` Slate browser proof references.
- Stale source rules are patched and generated mirrors are synced.
- Final source audit passes.

Verification surface:
- `pnpm install`
- Literal active-surface scan for `apps/www` Playwright proof strings.
- Package-script assertion for `apps/www/package.json`.
- `check-complete.mjs` for this plan.

Constraints:
- Do not remove `apps/slate` Playwright proof.
- Do not add a replacement `apps/www` Playwright lane.
- Do not touch historical ledgers just to rewrite old evidence.
- No commit, push, PR, or changeset.

Boundaries:
- Allowed edits: `.agents/rules/**`, generated `.agents/skills/**` via `pnpm install`, this plan.
- Browser surface: N/A. This removes a proof command, not route behavior.
- Tracker sync: N/A.
- Non-goals: no Plate runtime migration, no `apps/www` browser proof replacement.

Output budget strategy:
- Use literal scans over active command/rule/app surfaces only. Exclude `.next`, `.next-slate`, `out`, `public`, generated docs output, and historical ledgers.

Blocked condition:
- None reached.

Task state:
- task_type: hard-cut cleanup
- task_complexity: small
- current_phase: complete
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: active surfaces no longer contain `apps/www` Playwright proof references.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records the hard cut: no Playwright against `apps/www`; keep `apps/slate`. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `hard-cut` and `task`; task routed to autogoal because this touches agent rules. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this packet. |
| Source of truth read before edits | yes | Read stale generated hits and source rules for editor-test-harvester, issue-harvester, resolve-slate-issue, and slate-patch. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no media. |
| TDD decision before behavior change or bug fix | no | N/A: command/rule cleanup only. |
| Branch decision for code-changing task | no | N/A: user asked to edit current checkout. |
| Release artifact decision | yes | N/A: agent/docs command guidance only. |
| Browser tool decision for browser surface | no | N/A: browser proof is being removed, not replaced. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Active-surface scan excludes generated and historical paths. |
| Agent-native pack selected | yes | `.agents/rules/**` changed. |
| Agent-facing action surface identified | yes | Slate-related skills that still pointed at `apps/www` Playwright. |
| Source rule versus generated mirror boundary identified | yes | Patched `.agents/rules/**`; regenerated `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | no | N/A: small literal command-path hard cut; source audit is the useful review. |

Work Checklist:
- [x] Prompt requirements copied into checkable rows before implementation.
- [x] Stale source rules patched instead of generated mirrors.
- [x] Generated mirrors synced with `pnpm install`.
- [x] Active command/rule/generated-skill/doc surfaces audited clean.
- [x] `apps/www/package.json` asserted to have no Playwright or Slate-browser script.
- [x] No replacement `apps/www` Playwright lane added.
- [x] Historical ledgers left alone as archival evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run active-surface audit and package-script assertion | Both passed. |
| Bug reproduced before fix | no | N/A | Command ownership cleanup, not bug fix. |
| Targeted behavior verification | no | N/A | No runtime behavior changed. |
| TypeScript or typed config changed | no | N/A | No TS/config runtime type surface changed. |
| Package exports or file layout changed | no | N/A | No exports. |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` run only for skill generation; lockfile already current. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated mirrors | `pnpm install` passed; generated mirrors now route to `apps/slate`. |
| Workspace authority proof | yes | Verify in current repo | Commands run from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | Browser proof path removed. |
| Browser final proof | no | N/A | Explicitly no `apps/www` Playwright proof. |
| CI-controlled template output changed | no | N/A | No CI-controlled template output touched. |
| Package behavior or public API changed | no | N/A | No changeset. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify source-backed command guidance | Active-surface audit passed. |
| High-risk mini gate | yes | Name realistic failure mode | Risk was agents reintroducing `apps/www` Playwright through stale skills; fixed by source-rule patch and mirror sync. |
| Agent-native review for agent/tooling changes | no | N/A | Literal command-path hard cut verified by source audit. |
| Local install corruption suspected | no | N/A | No env-rot signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Mechanical rule/docs cleanup with deterministic audit. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR image. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill fields below | Filled. |
| Final lint | no | N/A | Markdown/rule command text only; no code formatting needed. |
| Output budget discipline | yes | Record accidental generated-output scan | First scan hit `.next-slate`; rerun excluded generated dirs and passed. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run `check-complete.mjs` | Final gate runs after this update. |
| Agent source / generated sync | yes | Run `pnpm install` | Passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Generated skills contain only `apps/slate` browser proof commands. |
| Agent-native review | no | N/A | Waived for small literal command-path hard cut. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Stale generated hits mapped to four source rules. | implementation |
| Implementation | complete | Patched source rules and regenerated skill mirrors. | verification |
| Verification | complete | Active-surface audit and package-script assertion passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated. | final response |

Findings:
- Remaining active stale hits were generated skill mirrors.
- Source owners were `.agents/rules/editor-test-harvester.mdc`, `.agents/rules/issue-harvester.mdc`, `.agents/rules/resolve-slate-issue.mdc`, and `.agents/rules/slate-patch.mdc`.
- `apps/www/package.json` already had the Playwright scripts removed from the previous packet.

Decisions and tradeoffs:
- Keep all Slate Playwright proof under `apps/slate`.
- Do not run any Playwright proof against `apps/www`.
- Do not rewrite historical ledgers that mention old paths as evidence.

Implementation notes:
- Replaced stale `pnpm --filter www test:slate-browser` guidance with `pnpm --filter slate test:slate-browser`.
- Replaced stale focused `pnpm --filter www exec playwright ... playwright.slate.config.ts` guidance with `pnpm --filter slate test:slate-browser:chromium ...`.
- Ran `pnpm install` to regenerate skill mirrors.

Review fixes:
- N/A.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First literal scan included `apps/www/.next-slate` generated output | 1 | Exclude generated dirs from active-surface scan | Rerun passed. |

Verification evidence:
- `pnpm install` passed.
- Active-surface scan passed with `no active apps/www Playwright proof references`.
- `apps/www package scripts have no Playwright/Slate-browser lane`.
- Positive scan shows all current Slate browser proof guidance routes through `pnpm --filter slate ...`.

Final handoff contract:
- PR line: N/A.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: stale generated skill references found before fix
  - Verified: active-surface audit clean after fix
- Browser check: N/A; the point is to remove `apps/www` Playwright.
- Outcome: no active `apps/www` Playwright proof path remains.
- Caveat: historical ledgers may still mention old paths as old evidence.
- Design:
  - Chosen boundary: `apps/slate` owns Slate Playwright; `apps/www` has no Playwright proof lane.
  - Why not quick patch: generated skills would have been stale unless source rules were patched.
  - Why not broader change: no runtime or docs route behavior changed.
- Verified: install, source audit, package-script assertion.
- PR body verified: N/A.

Task-style PR body contract:
- N/A: no PR.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A; explicitly removed.
- Caveats: historical ledgers may still mention old paths.

Timeline:
- 2026-06-22 Task goal plan created.
- 2026-06-22 Found stale generated skill hits pointing at `apps/www` Playwright.
- 2026-06-22 Patched source rules and regenerated generated skill mirrors.
- 2026-06-22 Verified active surfaces no longer contain `apps/www` Playwright proof references.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Cut `apps/www` Playwright proof. |
| What have I learned? | Stale hits were skill mirrors generated from four source rules. |
| What have I done? | Patched source rules, regenerated mirrors, and verified active surfaces are clean. |

Open risks:
- None for active command surfaces. Historical ledgers can still mention old paths as old evidence.
