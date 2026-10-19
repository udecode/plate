# Fix homepage table grid Enter crash

Objective:
Fix Plate #5064 locally; done when red proof turns green, homepage Browser
proof and table checks pass, changeset and P2 close.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5064-fix-homepage-table-grid-enter-crash.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Maintainer source:
- mode: one exact public issue; maintainer intake delegates one normalized local
  repair packet to `patch`
- repo: `udecode/plate`
- queue slice: issue #5064 only
- prompt / item link: https://github.com/udecode/plate/issues/5064
- acceptance criteria: pressing Enter in an ordinary non-table homepage heading
  inserts/splits a block without a runtime error; table rendering and column
  sizing remain correct; durable regression coverage, Browser proof, changeset,
  focused package verification, and P2 review pass
- standing orders: `docs/maintainer/standing-orders.md` read; local source/test
  repair is allowed, public and Git mutation are approval-gated
- heartbeat trigger: N/A: exact user-selected issue, not heartbeat/queue mode
- queue snapshot command: N/A: exact issue mode does not inspect or rank a broad queue
- queue artifact: N/A: live issue state is the source for this exact item
- run artifact: N/A planned: this issue-backed plan is sufficient durable state

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- #5064 is live-read, duplicate/claim guarded, and confirmed agent-ready.
- A focused pre-fix regression proof fails for the reported non-table input and
  passes after the fix at the durable table-package owner.
- The homepage interaction is reproduced and verified with Browser: click a
  normal heading, press Enter, no runtime overlay/console error, and editing
  continues; focused table rendering/column-size coverage stays green.
- `@platejs/table` package test/typecheck, scoped lint, changeset, and P2
  autoreview pass with zero accepted actionable findings.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live GitHub: `gh issue view 5064 --repo udecode/plate --json ...` plus bounded
  related issue/PR searches for duplicate and claim state.
- Video evidence: `video-transcripts` helper returns normalized XML for the
  attached GitHub recording; no tracker cache comment without public authority.
- Current source and tests under `packages/table`; focused failing/passing test,
  package test/typecheck, and scoped Biome check chosen after owner inspection.
- Browser route: homepage `http://localhost:3000/`; click an ordinary heading,
  press Enter, inspect overlay, continued editing, console, and relevant network state.
- Release/review: one `@platejs/table` patch changeset relative to `main`, then
  isolated P2 `autoreview --mode local --max-priority P2` until clean.

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
- Preserve ordinary table rendering and column sizing; do not make malformed
  table structure silently valid unless source proves that boundary owns it.
- Treat the Dosu diagnosis as an untrusted hypothesis until current source,
  red proof, and Browser behavior confirm the real owner.
- Preserve unrelated workspace changes; no branch switch, commit, push, PR,
  label, assignment, or close. The user later authorized one fix comment.

Boundaries:
- Source of truth: live issue #5064, attached recording, current checkout source,
  focused tests, root `VISION.md`, `docs/vision/common.md`, and
  `docs/vision/plate.md`
- Allowed edit scope: durable owner under `packages/table`, focused tests,
  necessary homepage/browser proof harness only if required, one `.changeset`,
  and this plan
- Public mutation authority: one evidence-backed fix comment on #5064; no
  other GitHub or Git mutation
- Security scope: N/A: ordinary runtime crash with no trust-boundary signal
- Browser surface: `apps/www` homepage `/`, ordinary non-table heading Enter flow
- Non-goals: labels, assignment, close, branch/commit/push/PR/release, public
  API redesign, template output edits, or unrelated table cleanup

Output budget strategy:
- Bound reads/searches to issue #5064, table owner files/tests, homepage route,
  and exact duplicate terms. Exclude dependencies, generated templates, build
  output, logs, `.next`, `.turbo`, and unrelated dirty files; request filenames
  or counts before broad line output.

Blocked condition:
- Stop only if the reported route cannot run after the repo's one install-repair
  attempt, Browser cannot connect after its documented recovery path, or current
  source cannot reproduce the issue and no equivalent focused red proof exists.

Maintainer state:
- current_phase: verification
- current_phase_status: complete
- selected_item: `udecode/plate#5064`
- selected_owner: `patch` -> Plate `@platejs/table`
- goal_status: complete

Current verdict:
- verdict: locally fixed, proven, and reported on the public issue
- confidence: high
- next owner: user, if commit or PR creation is wanted
- reason: Browser red/green proof, a durable hook regression, the 236-test table
  suite, scoped Biome, and clean P2 review all agree on the stale-path root cause

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact issue, local fix, reproduction, proof, review, authority, and handoff requirements are recorded above |
| Active goal checked or created | yes | Goal created for this exact plan and threshold |
| Root VISION.md read | yes | Read before owner classification |
| Relevant docs/vision detail read | yes | Read `docs/vision/common.md` and `docs/vision/plate.md` |
| Repo resolved | yes | `udecode/plate`, current local checkout `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | Issue #5064 only |
| Queue snapshot plan recorded | no | N/A: exact issue mode, no broad queue selection |
| Live GitHub read plan recorded | yes | Exact `gh issue view` and bounded duplicate/claim searches named above |
| Archive/gitcrawl freshness plan recorded | no | N/A: live GitHub search is sufficient for one exact current issue |
| Public mutation boundary recorded | yes | None; local repair and handoff only |
| Public intake docs read when applicable | yes | Read CONTRIBUTING, PR template, SECURITY, and all issue templates |
| Local Codex model recorded | yes | Local Codex, GPT-5.6-sol |
| Standing orders read | yes | `docs/maintainer/standing-orders.md` read in full |
| Heartbeat runbook read | no | N/A: exact issue URL mode, not heartbeat/queue mode |
| Output budget strategy recorded | yes | Owner-scoped searches and capped reads recorded above |
| Browser pack selected | yes | Visible homepage editor crash requires real Browser proof |
| Browser route / app surface identified | yes | `apps/www` homepage `/`, ordinary heading Enter interaction |
| Browser tool decision recorded | yes | In-app Browser for ordinary app QA; no Chrome-native surface |
| Console/network caveat policy recorded | yes | Check console and relevant network state; record any unrelated baseline noise |
| Package/API pack selected | yes | Published `@platejs/table` runtime behavior is in scope |
| Public surface or package boundary identified | yes | Plate table plugin/package behavior; no public API shape change expected |
| Release artifact path selected | yes | One `@platejs/table` patch changeset relative to `main` |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before runtime edits |
| Barrel/export impact decision recorded | yes | Expected N/A unless owner inspection proves export/file-layout changes |

Work Checklist:
- [x] First checkpoint complete.
- [x] Mode and repo are concrete.
- [x] Root VISION.md and relevant detail file are read.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is N/A: exact issue mode, not heartbeat/queue work.
- [x] Queue snapshot is N/A: user selected one exact issue.
- [x] Queue ledger freshness is N/A: live issue state is read directly.
- [x] Live GitHub state is read or exact auth blocker recorded.
- [x] Public issue/PR/security intake is complete enough for a local Codex run,
      or the missing public evidence is named.
- [x] gitcrawl/archive data is N/A: live exact-item reads/searches own current state.
- [x] Candidate matrix records every item considered.
- [x] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [x] Rejected/skipped candidates are N/A: user selected exactly one item.
- [x] Duplicate/claim guard is run for selected item: no assignee, human claim,
      linked/searchable PR, or matching remote branch.
- [x] VISION fit is recorded: table stability and real browser behavior are
      explicit Plate priorities.
- [x] Selected item is at most one autonomous item unless the user explicitly
      requested a broader batch.
- [x] Owner route is selected with reason.
- [x] Proof path or proof blocker is recorded.
- [x] Public mutation authority is recorded as none, explicit, or blocked.
- [x] Execution owner is invoked, or a decision-ready brief is produced.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix selects one `@platejs/table` patch changeset.
- [x] Package/API pack: `.changeset` work loaded `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work is N/A: package runtime owner is expected.
- [x] Package/API pack: no-artifact decision is N/A: published runtime behavior changes.
- [x] Package/API pack: compatibility/migration is N/A unless source inspection exposes public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the scoped fix and record broad-check blockers | Browser red/green, focused red/green, 236 tests, Biome, changeset, and clean P2; package typecheck blocker recorded below |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Plate stability, table behavior, and real Browser proof fit directly |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | Local repair allowed; user explicitly authorized one issue comment; all other Git/public mutations withheld |
| Live GitHub truth | yes | Read issue current state | Before comment: open, unassigned, no closing PR, no human fix comment; posted comment verified live |
| Queue snapshot | no | Exact-item mode | N/A: no broad queue ranking |
| Duplicate/claim guard | yes | Check related PRs/branches/assignees/recent claims | Passed before work and final live refresh remained clear |
| Owner route | yes | Name selected owner skill/package/docs surface and why | `maintainer` -> `patch` -> `@platejs/table` React hook |
| Proof path | yes | Run proof or record blocker | Exact Browser interaction and owner regression both fail before and pass after |
| Public mutation boundary | yes | Confirm authority | User authorized one fix comment; posted and verified at `#issuecomment-5184552262`; no other mutation performed |
| Public intake completeness | yes | Read public templates and classify | Agent-ready with deterministic steps, stack, video, environment, expected/actual |
| Rejected candidates | no | Exact-item mode | N/A: user selected #5064 |
| Next heartbeat | yes | Name next useful slice | None until user authorizes commit or PR creation |
| Run artifact | no | Write or explicitly skip | N/A: issue-backed goal plan contains the durable run state |
| Agent-native review | no | Workflow files changed? | N/A: no skill/rule/prompt/command file changed |
| P2 autoreview | yes | Run scoped P2 | Clean: no findings; correctness 0.97 |
| Final handoff contract | yes | Report owner, fix, proof, mutations, changed, attention, next | Recorded here and in final response |
| Goal plan complete | yes | Run `check-complete.mjs` | Run after this update |
| Browser interaction proof | yes | Exercise homepage heading Enter | Before: Next runtime `forEach` overlay; after: heading split and editor stayed active with table rendered |
| Browser console/network check | yes | Record state or N/A | No Next runtime issue overlay after fix; dev server emitted no request/runtime failure. Network is not part of this synchronous editor crash |
| Browser final proof artifact | yes | Record semantic or visual proof | DOM snapshot shows `Welcome to the Plate` plus new `Playground!` block, active editor, intact comparison table, and no runtime dialog; screenshot unnecessary for non-visual behavior |
| Public API / package boundary proof | yes | Audit public shape and exports | Hook implementation only; no signature, export, or file-layout change |
| Release artifact classification | yes | Classify delta | Published `@platejs/table` runtime bug fix |
| Published package changeset | yes | Add one package changeset | `.changeset/fuzzy-tables-wait.md`, patch for `@platejs/table` |
| Registry changelog | no | Registry-only? | N/A: package runtime owner changed |
| No release artifact | no | No-artifact case? | N/A: published package behavior changed |
| Package typecheck/build/test | yes | Run checks or record blocker | 236/236 package tests and scoped Biome pass. Typecheck reaches two pre-existing errors in the unrelated table schema refactor: `BaseTablePlugin.selection.slow.tsx:470` and `BaseTablePlugin.ts:3072` |
| Barrel/export generation | no | Run only for export/layout changes | N/A: no exports or files moved |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5064 homepage Enter crash | user-selected public issue | open; unassigned; bug + plugin:table; no linked closing PR | Plate table crash | yes: stability and table behavior are priorities | agent-ready: deterministic route, trace, environment, expected/actual, recording | pass: no assignee/human claim, linked/searchable PR, or matching remote branch | `maintainer` -> `patch` -> `@platejs/table` | focused red test + homepage Browser | local source/test only | route and execute |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| N/A | Exact issue mode; no alternate queue candidate inspected | N/A |

Heartbeat handoff:
- selected item: `udecode/plate#5064`
- selected owner: `patch`, Plate `@platejs/table`
- selected proof path: focused red/passing package test plus homepage Browser interaction
- queue snapshot: N/A: exact issue mode
- run artifact: N/A planned: this plan prevents duplicate rediscovery
- public mutations: one verified issue comment:
  https://github.com/udecode/plate/issues/5064#issuecomment-5184552262
- changed files: `packages/table/src/react/useTableElement.ts`, its focused spec,
  `.changeset/fuzzy-tables-wait.md`, and this issue plan
- needs user attention: package-wide typecheck is blocked by two unrelated
  pre-existing table-refactor errors; no action is needed for the #5064 fix
- next heartbeat recommendation: none until commit or PR creation is authorized

Findings:
- Live #5064 is open, unassigned, labeled `bug` and `plugin:table`, and has no
  linked closing PR. The issue pins `next` commit
  `2938677d265c6fb385f68b5ceefe10ee30243eec` and reports the crash at
  `packages/table/src/lib/internal/grid.ts:138`.
- Normalized video evidence confirms: click a normal heading, press Enter,
  Next.js error overlay appears with `Cannot read properties of undefined
  (reading 'forEach')`, and the stack points at `compileTableElement`.
- Dosu proposes guarding `useTableColSizes`, but that is only a hypothesis;
  current source and a red proof must decide whether the hook, plugin selector,
  or grid compiler owns the invariant.
- Current checkout is `next` at `a146a3e7bbc8976da01437eb7636ab84814ce0cd`;
  the issue's reported commit is an ancestor, so no branch switch is needed.
- Root cause: `ElementProvider` publishes a changed table path in a layout
  effect, while `useEditorSelector` can rerun during the editor transaction.
  A root insertion therefore made the old path point at the inserted heading.
- Fix: `useTableColSizes` reads the rendered table element from
  `useElement(TablePlugin)`. The grid compiler remains strict, column overrides
  are unchanged, and a path-only move cannot substitute an unrelated node.
- Browser red proof reproduced the issue exactly. Browser green proof split the
  heading into `Welcome to the Plate` and `Playground!`, kept the editor active,
  retained the comparison table, and showed no runtime dialog.
- The focused test was red with the same `grid.ts:141` `forEach` failure and is
  green after the fix. The full table package is 236/236 green.
- P2 autoreview was clean with no findings and 0.97 correctness confidence.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Live issue/video, vision, public templates, duplicate guard, and source owner read | none |
| Implementation | complete | Provider-owned table element replaces stale path lookup; regression and changeset added | none |
| Verification | complete | Browser red/green, 236 tests, scoped Biome/diff check, typecheck blocker recorded, clean P2 | none |
| Closeout | complete | Final live issue refresh, verified fix comment, and handoff evidence recorded | user decides whether to commit or open a PR |

Timeline:
- 2026-08-04: live issue, comments, labels, assignees, linked PR state, and
  attached video were read; normalized transcript produced.
- 2026-08-04: maintainer, patch, autogoal, video-transcripts, Browser, and
  changeset protocols loaded; root/common/Plate vision and public intake docs read.
- 2026-08-04: bounded live duplicate/claim searches found no assignee, human
  claim, linked/searchable PR, or matching remote branch; current checkout is
  `next` and contains the reported commit.
- 2026-08-04: Browser reproduced the exact runtime overlay, the owner regression
  failed on `grid.ts:141`, and the hook was repaired at the table element owner.
- 2026-08-04: focused and 236-test package proof, scoped Biome, Browser green
  proof, patch changeset, final live issue refresh, and clean P2 review completed.
- 2026-08-04: user authorized one GitHub comment; posted the root cause, fix,
  proof, changeset, and no-PR caveat, then verified the live comment body.

Decisions and tradeoffs:
- Route public intake through `maintainer`, then delegate local code/proof to
  `patch`; this preserves duplicate/claim and public-authority boundaries.
- Treat this as Plate table-package behavior, not Plite substrate, unless the
  red proof demonstrates a shared editor primitive failure.
- Prefer a caller/selector invariant fix over teaching the grid compiler to
  accept arbitrary non-table nodes; owner inspection decides the exact boundary.
- Keep the grid compiler strict. A malformed table should still fail; the React
  table hook owns choosing the currently rendered table element.
- Do not patch unrelated package type errors discovered in the existing table
  schema refactor; record them as a checkout-wide verification blocker.

Review fixes:
- None. Final scoped P2 reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `gh issue view` used unsupported field `closedByPullRequests` | 1 | Use CLI-advertised `closedByPullRequestsReferences` | Live issue read succeeded |
| Initial global video-transcripts path did not exist | 1 | Use repo-local generated skill path from the active skill catalog | Skill read and transcript helper succeeded |
| `gh search --state all` is unsupported | 3 | Query open and closed states separately | Duplicate search completed with no match |
| Homepage initially loaded a stale generated-registry module error | 1 | Run the repo-authorized install repair once | `pnpm run reinstall` cleared it; Browser reproduced #5064 |
| First regression fixture used unknown element type `p` | 1 | Use the installed `paragraph` schema type | Test then failed on the exact reported table-grid crash |
| Package tests raced dependency builds and briefly missed `@platejs/core/react/internal` | 1 | Rerun the package suite sequentially after builds | 236/236 tests passed |
| Package typecheck found unrelated schema-refactor errors | 1 | Preserve unrelated work and record exact files/lines | Scoped proof passed; blocker documented |
| Bundled Codex CLI was too old for Sol autoreview | 1 | Use a temporary latest CLI with the same model and scope | P2 review completed cleanly |

Verification evidence:
- External source: live `gh issue view 5064 --repo udecode/plate` confirms
  current open/unassigned state, exact intake, labels, and no closing PR.
- External source: `video-transcripts` helper returned well-formed normalized
  XML matching the reported Enter-to-error-overlay interaction.
- External/source audit: bounded `gh search`, `gh pr list`, and branch API
  queries found no duplicate/claim conflict; `git merge-base --is-ancestor`
  confirms the reported commit is present in the current `next` checkout.
- Red Browser proof: homepage heading Enter opened the Next runtime overlay with
  the reported `grid.ts:141` stack through `useTableColSizes`.
- Red/green test: `bun test packages/table/src/react/useTableElement.spec.tsx`
  failed on the same `forEach` call before the fix and passes 2/2 after it.
- Package proof: `pnpm --filter @platejs/table test` passes 236/236; scoped
  `pnpm exec biome check` and `git diff --check` pass.
- Package typecheck blocker: `pnpm turbo typecheck --filter=./packages/table`
  reaches unrelated current-tree errors at
  `BaseTablePlugin.selection.slow.tsx:470` and `BaseTablePlugin.ts:3072`.
- Green Browser proof: the heading splits, editor stays active, the table stays
  rendered, and no Next runtime dialog appears.
- P2: scoped `autoreview --mode local --max-priority P2` with Codex Sol is clean,
  zero findings, overall correctness 0.97.
- External artifact: GitHub comment `5184552262` is live under `zbeyens` with
  the exact root cause, fix, regression/package/Browser/P2 proof, changeset,
  and no-PR caveat.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Verification complete | User handoff | Fix #5064 locally and report the proven fix once authorized | Stale provider paths, not malformed grid tolerance, caused the crash | Fix, regression, changeset, Browser, tests, lint, live comment verification, and P2 complete |

Open risks:
- The current checkout's unrelated table schema refactor prevents a green
  package-wide typecheck. The #5064 owner files pass runtime tests and lint.
- No commit, push, PR, label, assignment, or close was requested or performed.
