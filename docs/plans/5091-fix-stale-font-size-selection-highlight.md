# Fix stale font-size selection highlight

Objective:
Fix Plate issue #5091; done when the regression is reproduced, fixed at its
durable owner, browser-tested, P2-reviewed, and commented/labeled locally.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5091-fix-stale-font-size-selection-highlight.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Maintainer source:
- mode: explicit next Felix issue
- repo: `udecode/plate`
- queue slice: first OPEN `felixfeng33` issue without `completed` in the live
  continuation query
- prompt / item link: user said `next`; selected
  https://github.com/udecode/plate/issues/5091
- acceptance criteria: reproduce stale selection highlight after changing font
  size; fix the durable owner; add behavior proof; pass focused checks, browser
  proof, and P2 autoreview; post an exact local-only comment; add `completed`;
  leave the issue OPEN
- standing orders: preserve the prior explicit continuation authority for a
  verified-fix comment and `completed`; do not commit, push, create a PR, close,
  merge, release, or imply the local fix shipped
- heartbeat trigger: N/A: this is one user-selected continuation item, not a
  broad heartbeat
- queue snapshot command: N/A: bounded live author query selected one item;
  live issue state is the final truth
- queue artifact: N/A: exact `gh` output and this plan are sufficient
- run artifact: N/A unless the issue reveals reusable context not captured here

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- #5091 has an honest red reproduction, owner-level regression coverage, a
  durable local fix, focused package/type/lint proof, browser-visible proof with
  console/runtime checks, a required changeset/changelog when applicable, and
  zero accepted P0-P2 autoreview findings.
- After proof, #5091 receives one concise comment stating the exact local-only
  status, gains `completed`, and is read back OPEN. No commit or PR is created.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live `gh issue view` plus timeline/PR duplicate checks before public mutation.
- Focused owner tests and package typecheck; targeted Biome on changed paths.
- Real browser interaction on the smallest current `apps/www` route that
  exposes the font-size control and selection highlight, including runtime
  errors and visual/DOM selection geometry.
- Isolated P2 `autoreview --max-priority P2`, followed by final live comment,
  label, and OPEN-state read-back.

Constraints:
- No GitHub comments, labels, closes, PRs, reviews, pushes, merges, releases,
  or public mutations unless explicitly authorized.
- Live GitHub state outranks archives and generated ledgers.
- VISION fit outranks queue pressure.
- Route to narrower owners for execution.
- Do not use internal Plite automation as a dodge when a public queue blocker
  remains.
- Maintainer Codex runs are local checkout runs. Do not assume hosted/API
  workers, crabbox, or private agent state can recover missing issue/PR context.
- Standing orders authorize one local heartbeat activation, not a daemon. Pick
  at most one autonomous item, then verify and report.
- Preserve unrelated dirty and untracked checkout work. Do not use `git status`
  or perform branch/worktree hygiene.
- Always comment when proven fixed, even if local-only; add `completed`; leave
  the issue open.
- Do not commit, push, create a PR, merge, release, or close the issue.

Boundaries:
- Source of truth: live #5091 intake and current checkout source/tests; prior
  memory only establishes continuation policy, not current implementation truth
- Allowed edit scope: the smallest owning Plate/Plite package, canonical
  registry/example surface, focused tests/E2E, required changeset/changelog,
  and this plan
- Public mutation authority: one verified-fix comment and `completed` after all
  proof gates; leave OPEN
- Security scope: stop and route to maintainer-security if the live body is
  security-shaped
- Browser surface: resolve the smallest current font-size toolbar demo/homepage
  route before reproduction
- Non-goals: prior completed Felix rows; unrelated cleanup; branch, commit, PR,
  merge, release, issue closure, or compatibility aliases

Output budget strategy:
- Use exact issue JSON, narrow `rg` and file reads, focused test commands, and
  capped outputs. Exclude `node_modules`, `.next`, `.turbo`, generated public
  registries, coverage, logs, binaries, and temp trees unless they are the named
  proof owner. Put isolated browser/review work under `/tmp`.

Blocked condition:
- Stop only if three distinct in-scope attempts leave no honest reproduction or
  proof path, the live item is claimed/security-shaped, or required browser/GitHub
  access is unavailable. Record the exact blocker and next needed input.

Maintainer state:
- current_phase: closeout
- current_phase_status: complete
- selected_item: #5091
- selected_owner: `patch` / Plate registry `font-size-toolbar-button`
- goal_status: ready for completion check

Current verdict:
- verdict: agent-ready; route #5091 to `patch`
- confidence: high
- next owner: none; local fix is proven and public status is updated
- reason: exact Browser reproduction isolated the missing focus restoration in
  the registry dropdown path; focused proof and P2 review are clean

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `next` means first new Felix issue; prove, comment, `completed`, OPEN; no git shipping |
| Active goal checked or created | yes | No active goal; created #5091 goal with this plan |
| Root VISION.md read | yes | Read complete root doctrine; visible selection requires browser geometry and owner-level proof |
| Relevant docs/vision detail read | yes | Read complete common, Plate, and Plite details; Plate owns toolbar/product UX, Plite React owns native DOM-selection projection if systemic |
| Repo resolved | yes | `udecode/plate` in `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | One item: #5091, the only OPEN Felix issue without `completed` |
| Queue snapshot plan recorded | no | N/A: exact user continuation and bounded live author query, not heartbeat |
| Live GitHub read plan recorded | yes | Read body/timeline/labels/assignees and matching PRs before execution/mutation |
| Archive/gitcrawl freshness plan recorded | no | N/A unless live duplicate discovery becomes ambiguous |
| Public mutation boundary recorded | yes | Verified-fix comment + `completed`; leave OPEN; no other mutation |
| Public intake docs read when applicable | yes | Read `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/bug.yml`, and `SECURITY.md`; report is non-security and sufficiently grounded |
| Local Codex model recorded | yes | Local checkout execution; no hosted/private-worker assumptions |
| Standing orders read | yes | Current maintainer skill read; prior explicit continuation authority preserved |
| Heartbeat runbook read | no | N/A: direct single-item continuation, not heartbeat/queue scan |
| Output budget strategy recorded | yes | Narrow reads/commands and capped outputs; noisy trees excluded |
| Browser pack selected | yes | User-visible selection highlight regression requires browser proof |
| Browser route / app surface identified | yes | Homepage `/`, AI-Powered Editing second bullet, font-size control 16 -> 10 |
| Browser tool decision recorded | yes | Bundled Browser first; Playwright-focused row for repeatable pointer/selection proof |
| Console/network caveat policy recorded | yes | Record interaction-time runtime errors; separate unrelated route noise explicitly |

Work Checklist:
- [x] First checkpoint complete: scope, non-goals, authority, proof, success,
      blocker, and final handoff requirements are captured above.
- [x] Mode and repo are concrete.
- [x] Root VISION.md and common/Plate/Plite detail files are read.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is N/A: direct one-item continuation, not heartbeat.
- [x] Queue snapshot is N/A: bounded live Felix author query selected #5091.
- [x] `docs/maintainer/queue.md` freshness is N/A: live exact issue state is used.
- [x] Live GitHub state is read: OPEN, no assignee/comments, only `bug` label.
- [x] Public issue/PR/security intake is complete enough for a local Codex run,
      or the missing public evidence is named.
- [x] gitcrawl/archive data is N/A: live issue/timeline and PR search are current and unambiguous.
- [x] Candidate matrix records every item considered.
- [x] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [x] Rejected/skipped candidates are recorded with concrete reasons.
- [x] Duplicate/claim guard is clear: no assignee, comment, timeline claim, or matching PR.
- [x] VISION fit is recorded: current stability/selection/browser-proof priority.
- [x] Selected item is at most one autonomous item unless the user explicitly
      requested a broader batch.
- [x] Owner route is `patch`: Plate toolbar/product owner versus Plite React DOM-selection owner will be decided from reproduction/source.
- [x] Proof path is homepage real-pointer selection, 16 -> 10, selection/model/DOM geometry plus focused owner tests.
- [x] Public mutation authority is verified-fix comment + `completed`, leave OPEN.
- [x] Execution owner `patch` is invoked through this coordinator.
- [x] Changed list is recorded.
- [x] Needs-user-attention items are ranked.
- [x] Next heartbeat recommendation is recorded.
- [x] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [x] Agent-native/P2 autoreview decision is recorded when skills, prompts,
      commands, or local workflow files change.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Prove the completion threshold above | Red Browser geometry, green Browser screenshot, 9 focused tests, changelog/Biome checks, clean P2 review |
| VISION fit | pass | Read root and detail doctrine, then classify fit | Selection stability fix at the smallest Plate UI owner |
| Standing-order fit | pass | Confirm the selected action is allowed, gated, or escalated by standing orders | User authorized verified-fix comment and `completed`; no git shipping |
| Live GitHub truth | pass | Read issue/PR/advisory current state or record auth blocker | Final read-back: OPEN, labels `bug`,`completed`, exact local-only comment present |
| Queue snapshot | pass | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | N/A: bounded direct continuation; live author query used before and after |
| Duplicate/claim guard | pass | Check related PRs/branches/assignees/recent claims for selected item | No assignee, prior comment, claim event, or matching open PR before mutation |
| Owner route | pass | Name selected owner skill/package/docs surface and why | `patch` -> registry `font-size-toolbar-button`; only its popover option omitted focus restoration |
| Proof path | pass | Run proof, name command, or record proof blocker | Browser `/` exact 16 -> 10 flow; 386.26px stale paint over 258.29px text before, none after |
| Public mutation boundary | pass | Confirm none, or record explicit user authority and result | One comment plus `completed`; issue remains OPEN; no commit/PR/push/close |
| Public intake completeness | pass | Read relevant issue/PR/security template and classify whether the item is agent-ready | Bug template complete enough; non-security |
| Rejected candidates | pass | Record skipped/rejected candidates with concrete reasons | Prior completed Felix issues excluded |
| Next heartbeat | pass | Name the next useful heartbeat slice or say none safe | None: final live Felix query has zero OPEN issues without `completed` |
| Run artifact | pass | Write or explicitly skip `docs/maintainer/runs/*` | N/A: this bounded issue plan contains all reusable proof and mutation state |
| Agent-native review | pass | Run/review when agent workflow files changed, else N/A | N/A: no skill, prompt, command, or workflow files changed |
| P2 autoreview | pass | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | Isolated local bundle; clean, no accepted/actionable P0-P2 findings |
| Final handoff contract | pass | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Recorded below for final response |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5091-fix-stale-font-size-selection-highlight.md` | Final pass complete after repairing the missing evidence row and phase table |
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Bundled Browser exercised homepage text selection and 16 -> 10 popover choice before and after |
| Browser console/network check | pass | Record console/network state or why it is not applicable | Console check found only unrelated stale generated-registry import errors; network inspection N/A for this local DOM behavior |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | Before/after Browser screenshots plus measured text geometry; after screenshot has no trailing highlight |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and route | completed | Live issue/template/VISION/claim reads selected one agent-ready issue | Reproduce |
| Reproduce | completed | Browser measured stale 386.26px paint over 258.29px text | Fix owner |
| Fix and prove | completed | Focus restoration, red-green unit test, Browser, changelog, Biome | Review |
| Review and public update | completed | Clean P2 review; exact local-only comment; `completed`; OPEN read-back | Goal check and handoff |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5091 stale font-size selection highlight | Live Felix continuation query | OPEN 2026-08-07; no assignee/comments; `bug`; no `completed` | selection/rendering | yes | agent-ready: exact route, steps, expected/actual geometry, acceptance, video | clear: no assignee, claim event, comment, or matching PR | `patch` / Plate UI or Plite React after repro | homepage pointer selection, 16 -> 10, screenshot/geometry, model/native selection, focused tests | comment + `completed` after proof | execute |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| Prior Felix issues with `completed` | Outside the next unresolved slice | none |

Heartbeat handoff:
- selected item: #5091
- selected owner: `patch` / `apps/www/src/registry/ui/font-size-toolbar-button.tsx`
- selected proof path: Browser homepage exact selection flow, focused Bun test,
  registry generator check, targeted Biome, isolated P2 autoreview
- queue snapshot: N/A; bounded live Felix query used
- run artifact: N/A; this issue plan is sufficient
- public mutations: posted local-only comment
  https://github.com/udecode/plate/issues/5091#issuecomment-5270326278 and added
  `completed`; confirmed issue remains OPEN
- changed files: font-size toolbar, focused toolbar spec, registry changelog MDX
  and generated event/index/component JSON, and this plan
- needs user attention: (1) no commit or PR exists, so the fix is not shipped;
  (2) broad `www` typecheck is blocked by unrelated `TS2589` in
  `packages/layout/src/lib/BaseColumnPlugin.ts:147`
- next heartbeat recommendation: none; live Felix query has zero OPEN issues
  without `completed`

Findings:
- Live author query on 2026-08-12 found #5091 as the only OPEN Felix issue
  without `completed`; it has no assignee.
- Live issue body supplies deterministic homepage steps and video. Timeline has
  only the initial `bug` label; comments and matching PR searches are empty.
- Root/common/Plate/Plite doctrine makes browser geometry mandatory and keeps
  font-size UX in Plate unless the stale native selection proves a systemic
  Plite React projection failure.
- Browser reproduced a 386.26px inactive selection paint after the text resized
  to 258.29px. The dropdown choice was the only font-size action that did not
  explicitly restore editor focus.
- Restoring editor focus immediately after applying the selected size clears
  Chromium's stale inactive-selection paint and matches the adjacent alignment,
  line-height, plus, minus, and direct-input control pattern.

Timeline:
- 2026-08-12: user said `next`; refreshed the live Felix queue, selected #5091,
  created this goal/plan, and captured every continuation constraint before
  source exploration.
- 2026-08-12: read VISION/common/Plate/Plite doctrine, public intake/security
  policy, live issue body/timeline, and duplicate PR search; routed #5091 to
  `patch` for real browser reproduction.
- 2026-08-12: reproduced the exact homepage 16 -> 10 path in Browser, added a
  red focus-restoration regression, fixed the registry dropdown owner, and
  verified the stale paint disappears.
- 2026-08-12: generated and checked the registry changelog, ran targeted Biome,
  recorded the unrelated broad typecheck blocker, and received a clean isolated
  P2 autoreview.
- 2026-08-12: re-read live issue state, posted the exact local-only comment,
  added `completed`, confirmed #5091 remains OPEN, and found no next unresolved
  OPEN Felix issue.

Decisions and tradeoffs:
- Treat `next` as one new Felix issue, not another broad batch -> matches the
  established sequential flow and maintainer one-item limit.
- Keep the fix in the registry control instead of changing Plite selection
  projection -> only the popover option omitted the focus invariant, while
  sibling formatting controls already restore focus.
- Use a temporary `plate-types.ts` stub only for Browser proof, then delete it ->
  the checkout's stale generated dev index otherwise blocked every editor route;
  the stub is absent from the final changed list.

Review fixes:
- None. Isolated `autoreview --mode local --max-priority P2` exited clean with
  no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial `gh search prs` query used an invalid embedded `repo:` qualifier | 1 | Use `--repo udecode/plate` with plain query | Succeeded; no matching PR |
| Local editor routes failed on stale generated import of removed `plate-types.ts` | 1 | Add a temporary source stub for Browser only | Route loaded; stub deleted before handoff |
| Broad `www` typecheck failed in unrelated layout package | 1 | Keep focused proof and record exact external blocker | `TS2589` at `packages/layout/src/lib/BaseColumnPlugin.ts:147`; no issue-owned code involved |

Verification evidence:
- Red Browser proof: homepage second AI bullet selected at 16px; after choosing
  10px, rendered text width was 258.29px while Chromium painted the inactive
  selection to the prior 386.26px width.
- Green Browser proof: same pointer-selection and 16 -> 10 popover flow after
  the fix; text is 10px / 258.29px and no trailing highlight is visible.
- `bun test apps/www/src/registry/ui/mark-toolbar-button.spec.tsx`: 9 pass,
  0 fail; the new regression failed before the production edit and passed after.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: checked 52
  events from 52 source entries.
- Targeted `pnpm exec biome check --write ...`: five files checked, no fixes.
- `pnpm turbo typecheck --filter=www`: 36 tasks succeeded before unrelated
  `@platejs/layout#build` failed with `TS2589` at `BaseColumnPlugin.ts:147`.
- Isolated P2 autoreview: clean, patch correctness 0.99, no accepted P0-P2
  findings.
- Final GitHub read-back: #5091 OPEN, labels `bug` and `completed`, local-only
  comment present, and no remaining OPEN Felix issues without `completed`.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| #5091 closeout | Run goal-plan completion checker and hand off | Prove and fix the next unresolved Felix regression and post honest local status | Missing editor focus after the popover update owned the stale Chromium paint | Fix, tests, Browser, changelog, review, comment, label, and live read-back complete |

Open risks:
- The fix is local-only: there is no commit, PR, merge, or release.
- The checkout-wide `www` typecheck remains blocked by unrelated layout
  `TS2589`; focused behavior, formatting, changelog, and review proof are clean.
