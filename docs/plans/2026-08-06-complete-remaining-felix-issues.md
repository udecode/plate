# Complete remaining Felix issues

Objective:
Process every open Felix-authored Plate issue in the live baseline; done when
each is proven fixed and commented/labeled or has a documented hard blocker.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-06-complete-remaining-felix-issues.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Maintainer source:
- mode: explicit broad issue batch
- repo: `udecode/plate`
- queue slice: every OPEN issue authored by `felixfeng33` at the baseline live
  query, excluding issues already labeled `completed`
- prompt / item link: user continuation after verified #5071
- acceptance criteria: every baseline row receives source-backed disposition;
  agent-ready bugs are fixed locally with durable proof, P2 review, a precise
  local-status comment, and `completed`; hard blockers are documented exactly
- standing orders: read before queue mutation; user explicitly authorizes the
  repeated proven-fix comments and `completed` labels established in this flow
- heartbeat trigger: broad batch explicitly requested by the user, overriding
  the normal one-item-per-heartbeat limit
- queue snapshot command: run the maintainer queue snapshot, then use a bounded
  live author query as final baseline truth
- queue artifact: `docs/maintainer/queue.md` and
  `.tmp/maintainer/queue-snapshot.json`, plus the live author-query output
- run artifact: this goal plan unless a separate run note would prevent
  material rediscovery

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Every open `felixfeng33` issue without `completed` in the baseline query has a
  candidate row, live intake and duplicate/claim guard, owner, and proof path.
- Every agent-ready non-security behavior issue is red-to-green locally, passes
  its owning tests/typecheck/browser gate and P2 autoreview, receives one exact
  local-only GitHub comment plus `completed`, and remains open.
- Any issue not safely executable has a hard-blocker row naming the missing
  evidence/authority and the exact next action; no row is silently deferred.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live `gh issue list/view`, issue timelines, PR searches, and final read-backs.
- Per-issue source audit, focused red-green tests, package typecheck/test, and
  Browser/Chromium proof for UI behavior.
- One scoped P2 autoreview per coherent issue packet or one final frozen-bundle
  review when packets share the same owner and invariant.
- Maintainer queue snapshot and final exhaustive live author query.

Constraints:
- GitHub mutation is limited to one verified-fix comment and adding
  `completed` for each proven-fixed baseline issue.
- Leave every issue open. Do not create branches, commits, pushes, PRs, merges,
  releases, or imply any local fix is shipped.
- Preserve all unrelated existing and untracked workspace changes, including
  the just-completed #5071 packet.
- Live GitHub state outranks archives and generated ledgers.
- VISION fit outranks queue pressure.
- Route to narrower owners for execution.
- Do not use internal Plite automation as a dodge when a public queue blocker
  remains.
- Maintainer Codex runs are local checkout runs. Do not assume hosted/API
  workers, crabbox, or private agent state can recover missing issue/PR context.
- The user explicitly requested the full remaining Felix batch, so process all
  baseline rows sequentially under one bounded activation.

Boundaries:
- Source of truth: live GitHub baseline and each issue body/timeline, then
  current owning source/tests; generated queue is ranking context only
- Allowed edit scope: smallest owning Plate packages, registry/docs/example
  surfaces, focused tests, required changesets/changelog artifacts, and this plan
- Public mutation authority: proven-fix comment plus `completed` per fixed row;
  no close/reopen/assignment/milestone/review or release mutation
- Security scope: any security-shaped row stops in maintainer-security without
  public processing
- Browser surface: issue-specific runnable registry/demo routes; record exact
  blocker if no runnable surface exists
- Non-goals: already completed Felix issues, non-Felix queue work, unrelated
  cleanup, compatibility aliases, branch/commit/PR/release work

Output budget strategy:
- First collect counts and compact JSON fields. Save broad snapshot data to its
  artifact, inspect one issue/body and one owner at a time, cap source output,
  and exclude `.next`, `.turbo`, `node_modules`, generated public registries,
  coverage, build output, and temp trees unless they are the named proof owner.

Blocked condition:
- Stop only when an individual row has no safe autonomous proof path after
  three distinct in-scope attempts, or when the batch itself cannot continue
  because live GitHub/auth/tooling is unavailable. Record per-row blockers and
  continue other independent rows.

Maintainer state:
- current_phase: closure
- current_phase_status: complete
- selected_item: #5084-#5088 fixed, commented, labeled, and read back OPEN; #5064/#5065 label catch-ups complete
- selected_owner: `maintainer` closure after per-row `patch` execution
- goal_status: complete

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Baseline and intake | complete | Frozen live Felix query, templates, duplicate guards, and owner routes recorded | none |
| Per-issue repair | complete | #5084-#5088 passed focused model/browser proof and P2 review | none |
| Public status | complete | Required comments and `completed` labels applied; every row remains OPEN | none |
| Closure | complete | Final live query returned ten Felix rows, all `completed` | hand off local-only result |

Current verdict:
- verdict: complete; every frozen Felix row is proven locally, commented,
  labeled `completed`, and still OPEN
- confidence: high; final exhaustive live query returned ten OPEN Felix issues
  and every row carries `completed`
- next owner: none until a new issue is filed or the user authorizes commit/PR work
- reason: the broad baseline and every per-issue proof/mutation gate are closed

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Full remaining Felix baseline; fix/prove/comment/`completed`; leave open; no git/release actions; preserve unrelated work |
| Active goal checked or created | yes | Prior #5071 goal was complete; new batch goal created with this plan |
| Root VISION.md read | yes | Read current root doctrine; all issue work must be issue-by-issue and browser-visible claims need real proof |
| Relevant docs/vision detail read | yes | Read `docs/vision/common.md` and `docs/vision/plate.md`; stability, selection, tables, registry, and edge-case proof are current priorities |
| Repo resolved | yes | `udecode/plate` in `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | OPEN `felixfeng33` issues without `completed` at baseline query time |
| Queue snapshot plan recorded | yes | Refreshed 2026-08-06: 34 rows, 19 issues, 6 PRs, 9 advisories, 0 warnings; live author query defines the exhaustive baseline |
| Live GitHub read plan recorded | yes | Read list, each issue, timeline, matching PRs, then re-read before each mutation |
| Archive/gitcrawl freshness plan recorded | no | N/A unless live duplicate searches are ambiguous; live GitHub is current truth |
| Public mutation boundary recorded | yes | Proven-fix comment + `completed` only; leave OPEN |
| Public intake docs read when applicable | yes | Read `CONTRIBUTING.md`, bug form, PR template, and `SECURITY.md` before classifying rows |
| Local Codex model recorded | yes | Local checkout executes and proves; no hosted/private worker assumptions |
| Standing orders read | yes | Read current local authority, escalation, and report contract; user broad-batch request overrides only the item-count limit |
| Heartbeat runbook read | yes | Read queue snapshot, matrix, owner, proof, artifact, and handoff requirements |
| Output budget strategy recorded | yes | Compact JSON baseline; one issue/owner at a time; noisy trees excluded |
| Browser pack selected | yes | Remaining Felix issues are expected to include user-visible editor behavior |
| Browser route / app surface identified | yes | Resolve the smallest existing demo route per issue before implementation |
| Browser tool decision recorded | yes | Bundled Browser for DOM interaction; Chrome/Computer only for native browser/OS behavior |
| Console/network caveat policy recorded | yes | Check interaction-time state per browser row; separate unrelated route noise |

Work Checklist:
- [x] First checkpoint complete: every explicit user requirement and standing
      continuation rule is captured above.
- [x] Mode and repo are concrete: broad Felix issue batch in `udecode/plate`.
- [x] Root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` are read.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is read for `heartbeat`, `queue`, broad maintenance, or
      future scheduled-local-Codex invocations.
- [x] Queue snapshot command is run for heartbeat/broad queue work, or exact
      `gh` auth/network blocker is recorded.
- [x] `docs/maintainer/queue.md` freshness is recorded before selecting an
      item, or stale-use caveat is explicit.
- [x] Live GitHub list, bodies, comments, labels, assignees, timelines, and
      issue-number PR searches are read for #5084-#5088; #5064/#5065 comments
      prove their prior local packets.
- [x] Public issue/PR/security intake is complete enough for a local Codex run,
      or the missing public evidence is named.
- [x] gitcrawl/archive data is N/A: exact live timelines and PR searches are
      current and unambiguous.
- [x] Candidate matrix records every baseline item considered.
- [x] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [x] Rejected/skipped candidates are recorded with concrete reasons.
- [x] Duplicate/claim guards are clear for #5084-#5088: no matching PRs,
      assignees, linked claims, or human comments.
- [x] VISION fit is recorded: all five are current Plate stability, selection,
      DnD, registry, or edge-case behavior priorities with browser proof paths.
- [x] Selected item is at most one autonomous item unless the user explicitly
      requested a broader batch.
- [x] Owner route is selected per row with reason; #5084 was table keydown ownership and #5085 is registry floating-toolbar focus/selection.
- [x] Proof path is recorded per candidate and #5084 completed model, package, Browser, and captured-frame proof.
- [x] Public mutation authority is recorded as one verified-fix comment plus
      `completed` per proven row, with every issue left open.
- [x] `patch` execution is active; #5084 completed its local worker packet.
- [x] Changed list is recorded.
- [x] Needs-user-attention items are ranked: none; only commit/PR work remains
      outside the granted authority.
- [x] Next heartbeat recommendation is recorded: none for the frozen slice;
      rerun only after a new Felix issue or explicit ship request.
- [x] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [x] Agent-native/P2 autoreview decision is recorded when skills, prompts,
      commands, or local workflow files change.
- [x] Browser pack: #5084 used `/blocks/table-demo`, repeated plain vertical arrows, and expected direct same-column cell movement with native default suppressed.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: #5084 recorded no page/console errors during the interaction-time Playwright row; per-row checks continue.
- [x] Browser pack: #5084 used animation-frame selection capture instead of a static screenshot because the symptom is transient; per-row visual proof continues.
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the completion threshold above | All frozen rows have local proof, comments, `completed`, and OPEN read-back |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Root/common/Plate doctrine read; all rows are stability and editor-behavior work |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | User authorized full batch, fix comments, and labels; no ship mutation performed |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | Final live author query returned ten OPEN rows, all `completed` |
| Queue snapshot | yes | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | Snapshot refreshed before the frozen baseline |
| Duplicate/claim guard | yes | Check related PRs/branches/assignees/recent claims for selected item | #5084-#5088 had no PR, assignee, linked claim, or human claim comment |
| Owner route | yes | Name selected owner skill/package/docs surface and why | `patch` per behavior owner, then `maintainer` for public status |
| Proof path | yes | Run proof, name command, or record proof blocker | Per-row tests, package checks, browser rows, and clean P2 reviews recorded below |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | Only concise fix comments and `completed`; every issue remains OPEN |
| Public intake completeness | yes | Read relevant issue/PR/security template and classify whether the item is agent-ready | Contribution docs/templates/security policy read; all rows were non-security and agent-ready |
| Rejected candidates | yes | Record skipped/rejected candidates with concrete reasons | Already-completed #5066/#5070/#5071 skipped |
| Next heartbeat | yes | Name the next useful heartbeat slice or say none safe | None for this frozen slice |
| Run artifact | yes | Write or explicitly skip `docs/maintainer/runs/*` | N/A: this durable goal plan contains the full matrix, proof, and mutations |
| Agent-native review | yes | Run/review when agent workflow files changed, else N/A | N/A: this issue batch did not change skills, rules, or command contracts |
| P2 autoreview | yes | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | Every implementation packet passed isolated P2; #5088 passed after fixing two accepted findings |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Recorded in heartbeat handoff and final response |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-06-complete-remaining-felix-issues.md` | Closure check is the final local gate |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Issue-specific real-pointer/keyboard Chromium proof passed for #5084-#5088 |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Interaction rows reported no runtime errors; unrelated www type errors are recorded separately |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Captured-frame table proof plus repeatable focused Playwright rows for remaining UI behaviors |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5084 table vertical caret flicker | Live Felix baseline | OPEN 2026-08-05; no assignee | Plate table selection/navigation | yes | agent-ready; recordings, prior law, acceptance | clear; no PR/claim | `patch` / table | 245 table tests, typecheck, red/green Chromium frame row, Browser, clean P2 | comment + `completed` after proof | fixed locally; commented and labeled; OPEN |
| 2 | #5085 floating Bold loses selection | Live Felix baseline | OPEN 2026-08-06; no assignee | registry toolbar focus/selection | yes | agent-ready; route, fixture, 2/2 evidence | clear; no PR/claim | `patch` / registry toolbar | real-pointer Chromium x4, Browser, changelog check, clean P2 | comment + `completed` after proof | current-tree fixed; commented and labeled; OPEN |
| 3 | #5086 suggestion accept crashes | Live Felix baseline | OPEN 2026-08-06; no assignee | suggestion/React DOM crash | yes | agent-ready; exact homepage action and crash | clear; no PR/claim | `patch` / suggestion + registry | homepage Chromium acceptance x3, 9 focused package cases, clean P2 | comment + `completed` after proof | current-tree fixed; commented and labeled; OPEN |
| 4 | #5087 mention drag missing | Live Felix baseline | OPEN 2026-08-06; no assignee | inline DnD | yes | agent-ready; hosted route and visible acceptance | clear; no PR/claim | `patch` / DnD + mention registry | Chromium pointer drag x3, 30 tests, package checks, clean P2 | comment + `completed` after proof | fixed locally; commented and labeled; OPEN |
| 5 | #5088 mouse block selection missing | Live Felix baseline | OPEN 2026-08-06; no assignee | block selection | yes | agent-ready; docs authority and visible acceptance | clear; no PR/claim | `patch` / selection + registry | Chromium gutter drag x3, 92 tests, package typecheck, clean final P2 | comment + `completed` after proof | fixed locally; commented and labeled; OPEN |
| catch-up | #5064 table grid Enter crash | Prior sequential packet | OPEN; proven local fix comment | table rendering/grid | yes | already proved and commented | prior packet complete | maintainer | re-read source/comment before label | add `completed` only | labeled `completed`; OPEN |
| catch-up | #5065 table Tab navigation | Prior sequential packet | OPEN; proven local fix comment | keyboard selection/navigation | yes | already proved and commented | prior packet complete | maintainer | re-read source/comment before label | add `completed` only | labeled `completed`; OPEN |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| Already `completed` Felix issues | Outside “remaining” baseline; retain as historical context only | none |
| #5066, #5070, #5071 | Already labeled `completed`; no repeat work or comments | none |

Heartbeat handoff:
- selected item: frozen Felix slice complete (#5064-#5066, #5070-#5071, #5084-#5088)
- selected owner: none; per-row `patch` work and `maintainer` status updates complete
- selected proof path: final exhaustive live query plus the per-row evidence below
- queue snapshot: refreshed before selection; live author query is final truth
- run artifact: N/A; this goal plan is the durable run ledger
- public mutations: fix comments on #5084-#5088, label catch-ups on #5064/#5065,
  and `completed` on every frozen row; all issues left OPEN
- changed files: issue-owned table, toolbar, suggestion, Plite DnD/mention,
  selection, registry, focused test/E2E, changeset, changelog, and this plan
  surfaces only; unrelated dirty checkout files were neither adopted nor reverted
- needs user attention: none for diagnosis; commit/PR/shipping remains unrequested
- next heartbeat recommendation: none until a new Felix issue or explicit ship request

Findings:
- The previous #5071 packet is complete locally and publicly labeled; it is not
  part of this remaining baseline.
- Root/common/Plate doctrine explicitly requires issue-by-issue accounting when
  the prompt says “all”; the broad request expands count, not proof or mutation
  authority.
- Live query found ten open Felix issues. #5066/#5070/#5071 are already
  `completed`; #5064/#5065 have verified local comments but predate the label
  convention; #5084-#5088 are the five new implementation rows.
- #5084-#5088 have no matching PR, assignee, linked claim, or human comment.
- #5084 regressed during the Plite migration because the table handler checked
  platform line-movement hotkeys but not plain vertical arrows. Native movement
  stayed enabled and painted/moved through horizontal cells before correction.
- #5084 now routes strict plain ArrowUp/ArrowDown predicates through the same
  table-owned visual-boundary move while retaining Option+Arrow behavior.
- #5085's historical reporter build is not reconstructible from the current
  mid-migration checkout. The current tree passes the exact user contract and
  replaces raw mark-property active-state reads with plugin-owned `isActive`.

Timeline:
- 2026-08-06: user expanded the sequential flow to every remaining Felix issue;
  created one broad maintainer/autogoal ledger before queue exploration.
- 2026-08-06: read root/common/Plate vision, repo authority rules, contribution
  intake, bug/PR templates, security policy, standing orders, and heartbeat.
- 2026-08-06: refreshed maintainer snapshot and froze five implementation rows
  plus two label catch-ups from the exhaustive live Felix query.
- 2026-08-06: reproduced #5084 red in unit and Chromium rows, fixed table
  keydown ownership, added a package changeset, passed all local proof, and
  completed an isolated clean P2 review after unrelated local secrets blocked
  the unscoped review bundle.
- 2026-08-06: posted the exact local-only #5084 fix comment, added `completed`,
  and read back OPEN state; re-read the existing #5064/#5065 proof comments,
  added their missing `completed` labels, and read both back OPEN.
- 2026-08-06: closed #5085 as a current-tree packet with real pointer proof,
  registry changelog source/generated checks, clean isolated P2 review, an
  explicit historical-cause caveat, local-only comment, `completed`, and OPEN
  read-back.
- 2026-08-06: repaired #5086 suggestion acceptance, passed the homepage
  acceptance three times plus nine focused cases and P2 review, then commented,
  labeled, and read the issue back OPEN.
- 2026-08-06: repaired #5087 mention drag identity, targeting, and atomic move
  ownership; passed three Chromium drags, 30 focused tests, typechecks, and a
  clean P2 review; then commented, labeled, and read the issue back OPEN.
- 2026-08-06: repaired #5088 editable-root selection defaults, gutter start,
  marquee ownership, active-selection preservation, and native-range
  suppression. The first P2 review found two valid regressions; both were fixed,
  all proof was rerun, and the second P2 review was clean. Commented, labeled,
  and read the issue back OPEN.
- 2026-08-06: final live Felix query returned ten OPEN issues, all with
  `completed`; no post-baseline Felix issue appeared.

Decisions and tradeoffs:
- Freeze a live baseline once, then process its rows sequentially -> prevents
  an endless moving queue while preserving exhaustive proof for “all others.”

Review fixes:
- Rejected one P2 modified-arrow finding after reading the compiled hotkey
  matcher: unspecified modifiers are strictly `false`. A second isolated P2
  review received that verified contract and returned clean with 0 findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Unscoped local P2 review failed closed on secret-like values in unrelated dirty files | 1 | Build an exact temporary #5084 baseline/current bundle without weakening the scan | Isolated bundle passed TruffleHog and final P2 review |
| Exact-HEAD #5085 browser replay could not compile against current installed migration packages | 1 | Prove the current-tree contract and avoid a false historical cause claim | Current tree passed real-pointer proof; comment records the historical limit |
| Broad `www` typecheck failed on unrelated in-progress table/suggestion schema errors | 1 | Keep focused generator, lint, Browser, Chromium, and isolated review proof; report the blocker exactly | `editor:check`, API reference, docs parity, registry source checks passed before unrelated TypeScript failures |
| #5088 explicit slow-hook test initially missed Bun's filename filter | 1 | Use an explicit `./` path | Three slow-hook cases ran and passed |
| #5088 slow-hook fixtures lacked the new editable DOM mock | 1 | Update the test boundary to provide `editable`/`scroll` owners | Three slow-hook cases passed |
| #5088 first P2 review found pre-threshold `preventDefault` and an accidental `read.first` removal | 1 | Preserve ordinary clicks until the threshold and restore the public read helper | All proof rerun; second P2 review clean |
| Broad #5088 www checks reached unrelated Excalidraw and schema typing failures | 2 | Rely on the clean selection package check, focused tests, registry generator, browser proof, and isolated review | Changed #5088 files had no reported type error; blocker remains outside this packet |

Verification evidence:
- #5084 red unit: `bun test packages/table/src/react/TablePlugin.onKeyDown.spec.tsx` failed because plain ArrowDown did not call `preventDefault`.
- #5084 red Chromium: repeated vertical arrows moved `heading-name -> heading-element -> heading-inline` with `defaultPrevented: false`.
- #5084 green Chromium: repeated Down, Down, Up, Up produced `image-name`, `mention-name`, `image-name`, `heading-name`, every captured frame with `defaultPrevented: true`.
- #5084 package: 245 table tests passed; `pnpm turbo typecheck --filter=./packages/table` passed; `pnpm lint:fix` passed with only pre-existing oversize-file warnings.
- #5084 Browser: `/blocks/table-demo` accepted repeated arrows with the editor focused; animation-frame Playwright proof recorded the transient invariant and no runtime errors.
- #5084 final isolated `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P2 ...`: clean, 0 accepted/actionable findings.
- #5085 Chromium real-pointer row passed four consecutive executions: Bold
  rendered, identical expanded selection remained, editor focus remained, and
  `aria-checked=true`; runtime error list stayed empty.
- #5085 registry changelog source generated 49 events and `--check` passed;
  lint passed with only existing oversized-artifact warnings.
- #5085 isolated P2 autoreview: clean, patch correct, confidence 0.95.
- #5085 live comment: https://github.com/udecode/plate/issues/5085#issuecomment-5207512608; read back `completed` and OPEN.
- #5086 homepage suggestion acceptance passed three consecutive Chromium runs;
  nine focused cases and final isolated P2 review passed. Live comment:
  https://github.com/udecode/plate/issues/5086#issuecomment-5207724036.
- #5087 mention drag passed three consecutive Chromium runs, 30 focused tests,
  affected typechecks, targeted Biome, and isolated P2 review. Live comment:
  https://github.com/udecode/plate/issues/5087#issuecomment-5208108765.
- #5088 block selection passed three consecutive fresh Chromium runs after the
  review fixes; each rendered the marquee, kept native text selection empty,
  produced at least two whole-block indicators, and reported no runtime errors.
- #5088 focused proof: 89 core cases plus 3 explicit slow-hook cases passed;
  selection package typecheck, targeted Biome, registry changelog generation
  and check, and final isolated P2 review passed. Live comment:
  https://github.com/udecode/plate/issues/5088#issuecomment-5208204363.
- Final `gh issue list --author felixfeng33 --state open`: ten rows, every row
  labeled `completed`, no new row beyond the frozen baseline.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| All frozen Felix rows complete | Hand off local-only result | Process every remaining Felix issue with honest proof and public status | The last bug was multi-owner: editable-root discovery, DOM-owned marquee placement, selection-commit preservation, and threshold-scoped suppression all mattered | Ten OPEN Felix issues are labeled `completed`; #5084-#5088 have exact local-only fix comments |

Open risks:
- None inside the authorized diagnosis/fix/status scope.
- All fixes remain local and unshipped. Commit, push, PR, merge, and issue
  closure require separate authority.
- Broad www typecheck remains blocked by unrelated current-tree Excalidraw and
  schema typing failures; focused owning checks and browser proof are green.
