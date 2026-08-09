# Fix inline equation ArrowLeft dismissal

Objective:
Fix Plate #5071 locally; done when the ArrowLeft edge repro is red-to-green,
focused browser/package proof passes, P2 review is clean, and the issue is
commented/labeled.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5071-fix-inline-equation-arrowleft-dismissal.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Maintainer source:
- mode: exact public issue selected from the sequential Felix queue
- repo: `udecode/plate`
- queue slice: lowest-numbered open Felix issue after completed issue #5070
- prompt / item link: https://github.com/udecode/plate/issues/5071
- acceptance criteria: ArrowLeft at the inline-equation input's left edge closes
  the popover, places the editor caret immediately before the equation, and has
  a focused keyboard regression test
- standing orders: read; local repair and the user-authorized issue comment and
  label are allowed, while git/release/closure actions remain forbidden
- heartbeat trigger: N/A: exact sequential item, not heartbeat or broad queue
- queue snapshot command: N/A: bounded live author query selected the exact item
- queue artifact: N/A: live `gh issue list/view` output is the source of truth
- run artifact: N/A unless investigation becomes complex; this goal plan is the
  durable single-issue ledger

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- A focused test reproduces the reported keyboard failure before the fix and
  passes after the fix.
- The popover closes and the caret lands immediately before the inline equation
  in real Browser interaction proof, with console/network state checked.
- Owning package/app checks and P2 autoreview pass with zero accepted actionable
  findings remaining.
- A concise issue comment states the exact local-only status, `completed` is
  added, and issue #5071 remains open.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live `gh issue view`, timeline, duplicate/claim searches, and final read-back.
- Focused source/unit or browser regression test for `useEquationInput` and the
  registry inline-equation UI.
- Relevant package/app typecheck and lint commands selected after owner audit.
- Browser route exercise of the exact ArrowLeft edge flow plus console/network
  inspection.
- Scoped P2 `autoreview` over only issue #5071 changes.

Constraints:
- User explicitly authorizes one verified-fix issue comment and adding the
  `completed` label, even for a local-only fix.
- Do not close the issue or create a branch, commit, push, PR, merge, release,
  or imply the fix is shipped.
- Preserve all unrelated existing and untracked workspace changes.
- Live GitHub state outranks archives and generated ledgers.
- VISION fit outranks queue pressure.
- Route to narrower owners for execution.
- Do not use internal Plite automation as a dodge when a public queue blocker
  remains.
- Maintainer Codex runs are local checkout runs. Do not assume hosted/API
  workers, crabbox, or private agent state can recover missing issue/PR context.
- Standing orders authorize one local heartbeat activation, not a daemon. Pick
  at most one autonomous item, then verify and report.

Boundaries:
- Source of truth: live issue #5071 plus current math package/registry source and
  tests; bot diagnosis is a lead, not proof
- Allowed edit scope: smallest durable owner under `packages/math`, affected
  registry equation UI/test surface, required changelog source/output, and this
  plan
- Public mutation authority: final verified-fix comment plus `completed` label
  only
- Security scope: N/A: ordinary keyboard behavior regression with no disclosed
  security boundary
- Browser surface: editable Plate route containing an inline equation and its
  equation popover
- Non-goals: later Felix issues, unrelated dirty files, compatibility aliases,
  commits, pushes, PRs, issue closure, and release claims

Output budget strategy:
- Use exact issue/file reads and focused `rg`; exclude generated/build/dependency
  trees from searches; cap ordinary output near 6k tokens and inspect slices of
  larger artifacts.

Blocked condition:
- Stop only if three distinct in-scope repro/proof attempts hit the same tooling
  or environment blocker and no source-level or browser alternative remains.

Maintainer state:
- current_phase: verified local repair
- current_phase_status: complete
- selected_item: issue #5071
- selected_owner: `patch` after maintainer intake
- goal_status: complete after final plan validation

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and claim guard | complete | Live #5071 and closed PR #5073 audited | none |
| Reproduce and repair | complete | Red component proof and owner-level fix | none |
| Verify and review | complete | Package, Chromium, changelog, lint, and P2 gates passed | none |
| Public handoff | complete | Local-only comment, `completed`, issue remains OPEN | #5084 on next activation |

Current verdict:
- verdict: route for local repair
- confidence: high after red-green source, package, Chromium, and P2 review proof
- next owner: `patch`
- reason: one public Plate behavior regression with explicit browser and test
  acceptance criteria

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Sequential next Felix issue; comment even if local; add `completed`; leave open; no git/release mutation; preserve unrelated changes; all captured above and below |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path |
| Root VISION.md read | yes | Read 2026-08-06; favors durable owner, red proof, and real browser selection/caret evidence |
| Relevant docs/vision detail read | yes | Read `docs/vision/common.md` and `docs/vision/plate.md`; behavior is Plate math/registry product ownership |
| Repo resolved | yes | `udecode/plate` in `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | Lowest-numbered open Felix issue after #5070; live query selected only #5071 |
| Queue snapshot plan recorded | no | N/A: exact sequential item; bounded live query replaces broad heartbeat snapshot |
| Live GitHub read plan recorded | yes | Read issue body/comments/timeline before implementation; re-read before mutation |
| Archive/gitcrawl freshness plan recorded | no | N/A: live issue includes duplicate searches; run focused live GitHub duplicate/claim guard |
| Public mutation boundary recorded | yes | Final local-status comment and `completed` label only; issue remains open |
| Public intake docs read when applicable | yes | Read `CONTRIBUTING.md`, bug form, PR template, and `SECURITY.md`; issue is sufficient for local repro despite missing public URL/version fields |
| Local Codex model recorded | yes | Local checkout owns implementation and proof; no hosted/private context assumed |
| Standing orders read | yes | Local repair allowed; user explicitly authorized final comment and `completed`; git/release/closure remain forbidden |
| Heartbeat runbook read | no | N/A: exact sequential issue invocation, not heartbeat/broad maintenance |
| Output budget strategy recorded | yes | Exact reads/searches, bounded output, noisy trees excluded |
| Browser pack selected | yes | `browser` pack materialized because acceptance is UI keyboard behavior |
| Browser route / app surface identified | yes | Editable Plate route containing registry inline equation; exact route to resolve from source |
| Browser tool decision recorded | yes | Bundled Browser for ordinary DOM/keyboard interaction; Chrome only if Browser cannot prove exact behavior |
| Console/network caveat policy recorded | yes | Check both after interaction; record unrelated failures separately and do not overclaim |

Work Checklist:
- [x] First checkpoint complete: every explicit user requirement and issue
      acceptance criterion is captured above.
- [x] Mode and repo are concrete: exact issue mode in `udecode/plate`.
- [x] Root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` are
      read; the fix must stay with the Plate math/registry owner.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is N/A: this is an exact issue selected from a bounded
      sequential query.
- [x] Queue snapshot command is N/A: exact sequential issue, not a heartbeat or
      broad queue.
- [x] `docs/maintainer/queue.md` freshness is N/A: selection used a bounded live
      author query, not the generated queue ledger.
- [x] Live GitHub issue body, comments, labels, assignees, state, and timeline
      were read on 2026-08-06.
- [x] Public intake is sufficient: deterministic keyboard steps, expected and
      actual behavior, comparison videos, affected owners, and test acceptance
      criterion are present; local current-tree repro must fill missing versions.
- [x] gitcrawl/archive data is N/A: live GitHub is current and focused live
      duplicate/claim searches are the relevant guard.
- [x] Candidate matrix records every item considered.
- [x] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [x] Rejected/skipped candidates are recorded with concrete reasons.
- [x] Duplicate/claim guard found closed PR #5073. Its `onClose` call would move
      ArrowLeft's caret after the equation, so it does not satisfy acceptance.
- [x] VISION fit is recorded: durable behavior proof and explicit ownership at
      the math navigation and registry presentation boundaries.
- [x] Selected item is exactly one: #5071.
- [x] Owner route is `patch`: this is a concrete Plate behavior regression.
- [x] Proof path is focused red-green keyboard test, package/app checks, Browser
      interaction, and P2 autoreview.
- [x] Public mutation authority is explicit: verified-fix comment plus
      `completed` label; no issue closure or shipping action.
- [x] Execution owner `patch` was invoked and completed the local repair loop.
- [x] Changed list is recorded below.
- [x] Needs-user-attention items are ranked below.
- [x] Next heartbeat recommendation is #5084, the next open Felix issue.
- [x] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [x] Agent-native/P2 autoreview decision is recorded when skills, prompts,
      commands, or local workflow files change.
- [x] Browser pack: route, interaction path, and expected visible outcome were
      recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: interaction-time console, page, and request failures were
      checked in Chromium; none occurred across three runs.
- [x] Browser pack: visual waiver is recorded because the proof target is DOM
      focus/selection state, which a screenshot cannot show; the route DOM was
      inspected with Browser and the exact state was asserted in Chromium.
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the completion threshold above | Red-green component proof, 2 focused tests, 16 math tests, math typecheck, 3 Chromium runs, changelog check, scoped lint, and clean P2 autoreview |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Stability/selection regression fits current Plate priorities; package/runtime ownership and browser proof required |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | Local patch is allowed; final comment/label explicitly authorized; no git/release/closure mutation |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | Re-read #5071 and closed competing PR #5073 immediately before mutation |
| Queue snapshot | no | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | N/A: exact issue selected with bounded live author query, not broad queue work |
| Duplicate/claim guard | yes | Check related PRs/branches/assignees/recent claims for selected item | Closed PR #5073 found; rejected because its `onClose` path moves selection after the equation and it has no browser acceptance proof |
| Owner route | yes | Name selected owner skill/package/docs surface and why | `patch`; math hook owns selection/focus, registry renderer owns controlled popover state |
| Proof path | yes | Run proof, name command, or record proof blocker | Exact evidence recorded below |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | Posted exact local-only comment https://github.com/udecode/plate/issues/5071#issuecomment-5207049570 and added `completed`; read-back confirms OPEN; no git/release/closure mutation |
| Public intake completeness | yes | Read relevant issue/PR/security template and classify whether the item is agent-ready | Agent-ready locally; absent public URL/version fields do not block the named current-checkout route and deterministic flow |
| Rejected candidates | yes | Record skipped/rejected candidates with concrete reasons | #5084-#5088 are later in the sequential Felix queue and remain untouched |
| Next heartbeat | yes | Name the next useful heartbeat slice or say none safe | #5084 is the next open Felix issue after #5071 |
| Run artifact | no | Write or explicitly skip `docs/maintainer/runs/*` | N/A: this issue-prefixed goal plan contains the complete bounded run ledger |
| Agent-native review | no | Run/review when agent workflow files changed, else N/A | N/A: no skill, prompt, rule, or workflow owner changed |
| P2 autoreview | yes | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | Clean; no accepted/actionable P0-P2 findings, confidence 0.91 |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Recorded in final handoff below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5071-fix-inline-equation-arrowleft-dismissal.md` | Passed |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/equation-demo`: Chromium page-level ArrowLeft sequence passed 3/3; popover hidden, editor focused, caret on preceding text path |
| Browser console/network check | yes | Record console/network state or why it is not applicable | No interaction-time console errors, page errors, or failed requests across 3 runs; pre-interaction hydration warning is unrelated random drag-handle SSR data |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser DOM snapshot confirmed the route/input surface; Playwright asserts hidden popover plus exact DOM selection/focus. Screenshot waived because it cannot encode caret path/focus |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5071 | User's sequential Felix queue request + live author query | OPEN; updated 2026-08-05; no assignee; one bot comment | Plate math UI regression | yes: current stability/selection priority; package owner plus browser proof | Sufficient steps, expected/actual, videos, affected owner, and test criterion; public URL/version omitted but local path is reproducible | Closed PR #5073 attempted the issue but fails the before-caret acceptance path; no live claim remains | `patch` / `packages/math` + registry UI | Red-green keyboard test and Browser proof | Comment + `completed` only | selected and fixed locally |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| #5084-#5088 | Later numbers in the same live Felix queue; sequential order makes #5071 first | maintainer on next user activation |
| PR #5073 | Closed unmerged on 2026-08-05. Its added `onClose()` calls the registry callback that selects after the equation, overriding ArrowLeft's before-equation point; it also lacks the required browser proof | none; superseded by the verified local repair |

Heartbeat handoff:
- selected item: #5071
- selected owner: `patch`, with `packages/math` navigation/focus and registry UI
  popover ownership
- selected proof path: red-green component test, math unit/package proof,
  Chromium DOM caret/focus proof, scoped lint/typecheck, and P2 autoreview
- queue snapshot: N/A, bounded exact-item live query
- run artifact: N/A, this goal plan is the complete run ledger
- public mutations: posted local-only verified-fix comment, added `completed`,
  and read back the issue as OPEN
- changed files: `packages/math/src/react/useEquation.ts`, its spec, registry
  `equation-node.tsx` and spec, focused E2E, math changeset, registry changelog
  source/generated event plus aggregate indexes, and this plan
- needs user attention: P2 app typecheck is blocked only by unrelated dirty table
  `id` errors; no #5071 correctness decision is needed
- next heartbeat recommendation: #5084, the next open Felix issue

Findings:
- Live issue #5071 reports a non-security keyboard regression and names
  `@platejs/math/react` `useEquationInput` plus registry equation UI.
- Dosu proposes stale open-state handling in `InlineEquationElement`; treat this
  as an unverified hypothesis until current source and red proof confirm it.
- Source proof confirmed two connected owners: selection changed without a DOM
  focus call, while registry popover state stayed open after deselection.
- Closed PR #5073 is not reusable: calling `onClose` after selecting before the
  equation moves the selection after it in the current registry callback.

Timeline:
- 2026-08-06: selected #5071 from bounded live Felix issue query; read issue,
  comments, labels, assignees, and timeline; created the active goal and plan.
- 2026-08-06: read root/common/Plate vision, repo instructions, contribution
  guide, bug form, PR template, security policy, standing orders, `patch`, and
  Browser protocols; classified as Plate selection/navigation behavior.
- 2026-08-06: reproduced the stale popover in Browser and red component proof;
  repaired selection focus, controlled popover dismissal, and Radix close-focus
  restoration at their owning boundaries.
- 2026-08-06: passed focused/unit/package tests, math typecheck, scoped lint,
  registry changelog check, three Chromium runs, and clean P2 autoreview.
- 2026-08-06: posted the verified local-only comment, added `completed`, and
  confirmed issue #5071 remains OPEN.

Decisions and tradeoffs:
- Sequential order chooses #5071 over later Felix issues -> honors repeated user
  workflow and prevents queue hopping -> later issues remain untouched.
- Use `patch` for repair while maintainer retains live claim and mutation
  authority -> separates implementation proof from public status claims.
- Do not call `onClose` from ArrowLeft navigation -> the registry callback is a
  Done action that selects after the equation and would violate the issue's
  before-equation caret acceptance criterion.
- Keep the cross-owner fix -> math owns selection plus DOM focus; registry owns
  popover visibility and prevents Radix from stealing restored editor focus.

Review fixes:
- None. P2 autoreview found no accepted/actionable findings and rated the patch
  correct with confidence 0.91.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad source search traversed generated output | 1 | Narrow `rg` to exact owners and globs | Source owner resolved without further noisy scans |
| Initial GitHub query syntax and title-only PR guard missed #5073 | 2 | Use bounded issue search, then exact issue-number PR search before mutation | Closed competing PR found and audited |
| Main browser route imported a missing generated `plate-types.ts` from unrelated current-tree drift | 1 | Use a temporary current-tree snapshot with a temp-only empty type stub | Exact route ran without modifying tracked product source |
| Clean HEAD snapshot could not compile against current API/export migrations | 1 | Overlay the exact current checkout into the temporary snapshot | Browser proof matched the real current working source |
| First E2E showed model selection without DOM focus | 1 | Audit the `focus` tag consumer, then call the DOM focus owner explicitly | Caret path and root focus both pass |
| Global app typecheck first read a malformed generated `.next/dev/types/routes.d.ts` | 1 | Move that one disposable file to `/tmp` and rerun | Rerun reached TypeScript and failed only in unrelated dirty table `id` code |
| Interaction error recorder captured pre-existing random drag-handle hydration warnings | 1 | Start recording after route hydration, before the issue interaction | Three runs report no interaction-time console/page/request errors |
| Browser locator refocused the textarea between individual `press` calls | 1 | Use page-level uninterrupted keyboard events in Chromium | Exact two-key acceptance sequence passes 3/3 |

Verification evidence:
- Red proof: registry component test expected a deselected open popover to close
  and failed before the fix (`true` received instead of `false`).
- `bun test packages/math/src/react/useEquation.spec.tsx apps/www/src/registry/ui/equation-node.spec.tsx`: 2 pass, 11 assertions.
- `pnpm --filter @platejs/math test`: 16 pass, 36 assertions.
- `pnpm turbo typecheck --filter=./packages/math`: 12 tasks pass.
- Scoped Biome: 5 files pass with no fixes remaining.
- Registry changelog generator `--check`: 48/48 events consistent.
- Chromium exact route/test with `--repeat-each=3`: 3/3 pass, with popover
  hidden, editor root focused, collapsed caret on the immediately preceding
  `data-plite-path`, and no interaction-time console/page/request errors.
- `pnpm --filter www typecheck`: relevant editor/API/source/parity/registry
  checks pass, then global TypeScript fails only in unrelated dirty table files
  because `TableCellElement` lacks `id` in those paths.
- P2 autoreview: clean, no accepted/actionable findings, confidence 0.91.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Verified local repair for #5071 | Post exact local-only issue comment, add `completed`, read back OPEN state, close goal | Fix the inline equation ArrowLeft edge regression locally with durable proof and exact public status | Closed PR #5073's `onClose` path would violate before-caret placement; current fix passes exact browser focus/caret proof | Source/test/changelog changes complete; all scoped proof and P2 review green; global app typecheck has unrelated table-only failures |

Open risks:
- The entire app typecheck remains blocked by unrelated current-tree table
  typing errors. The affected registry source checks, math typecheck, focused
  tests, and browser behavior are all proven.

Final handoff:
- repo/mode: `udecode/plate`, exact sequential Felix issue #5071
- matrix/verdict: selected #5071; skipped later #5084-#5088; audited and rejected
  closed PR #5073 because it violates before-caret placement
- owner/fix: `patch`; math hook restores DOM focus after setting the boundary
  point, registry UI closes on deselection and suppresses close autofocus
- proof: red-green component test, 2/2 focused tests, 16/16 math tests, math
  typecheck, scoped lint, changelog check, Chromium 3/3, clean P2 autoreview
- mutations: local files only plus the authorized issue comment and `completed`
  label; no commit, push, PR, merge, release, or issue closure
- attention: global `www` typecheck has unrelated current-tree table `id` errors
- next heartbeat: #5084
