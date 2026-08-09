# Fix homepage block drag crash

Objective:
Fix Plate #5070 homepage block drag crash; done when behavior, order,
follow-up interaction, review, and issue-update gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5070-fix-homepage-block-drag-crash.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Maintainer source:
- mode: selected public issue repair
- repo: `udecode/plate` in `/Users/zbeyens/git/plate-2`
- queue slice: lowest-numbered open Felix issue after completed issue #5066
- prompt / item link: https://github.com/udecode/plate/issues/5070
- acceptance criteria: drag the Welcome block to the target position without
  `removeChild` or another runtime error; prove resulting document order;
  prove follow-up typing and selection; add durable browser regression coverage
- standing orders: one issue only; route local repair to `patch`; proof before
  public mutation; comment exact local status; add `completed`; leave open
- heartbeat trigger: N/A: user requested the next Felix issue, not a heartbeat
- queue snapshot command: N/A: bounded live author query selected the next item
- queue artifact: N/A: live issue and PR reads are the source of truth
- run artifact: N/A unless findings would prevent duplicate future work

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Native homepage drag repro is red before the fix and green after the fix.
- The dragged Welcome block lands at the target document position with no
  runtime/console error; follow-up typing and selection still work.
- Durable browser regression coverage asserts document order and the absence
  of runtime errors.
- Owning package checks and P2 autoreview pass with zero accepted actionable
  findings.
- Issue #5070 receives one verified concise local-status fix comment and the
  `completed` label, remains open, and no commit/PR/shipping claim is made.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live `gh issue view`, timeline, author queue, assignee/label state, and
  matching open-PR query.
- Focused source audit and regression test in the owning DnD/browser surface.
- Browser proof on `/`: native drag, document order, console/runtime state,
  follow-up typing, and selection.
- Owning package typecheck/test, relevant lint, P2 `autoreview`, and final live
  GitHub read-back.

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
- Do not commit, push, open a PR, merge, release, or close the issue.
- Preserve unrelated checkout changes and do not rewrite user-owned files.
- Do not mutate sibling issue #5086; use it only as related root-cause evidence.

Boundaries:
- Source of truth: live issue #5070, current checkout, executable regression,
  and Browser proof
- Allowed edit scope: smallest durable DnD/runtime owner, focused regression
  coverage, required package release artifact, and this goal plan
- Public mutation authority: after all proof gates, comment issue #5070, add
  `completed`, and leave it open; no other public mutation
- Security scope: N/A: public non-security behavior regression
- Browser surface: homepage `/`, Welcome block drag handle and editor follow-up
- Non-goals: no sibling issue mutation, no API redesign absent owning evidence,
  no commit/push/PR/release/issue closure, no broad Felix queue batch

Output budget strategy:
- Use exact issue/file reads and capped `rg` filename/count queries; exclude
  generated output, `node_modules`, `.next`, `.turbo`, logs, and coverage.
  Keep ordinary reads under 8,000 output tokens; save large test/review output
  to artifacts or inspect only failing slices.

Blocked condition:
- Stop only if the crash cannot be exercised after Browser/Chrome fallbacks,
  the relevant owner cannot be isolated with source and test evidence, or
  GitHub auth prevents the authorized final update after three distinct checks.

Maintainer state:
- current_phase: proof-and-public-closeout
- current_phase_status: complete
- selected_item: issue #5070
- selected_owner: `patch`; registry `block-draggable` owns the transient drop-line DOM
- goal_status: active

Current verdict:
- verdict: execute one local regression repair, then update issue #5070
- confidence: high after automated and native Chrome red/green proof
- next owner: maintainer public closeout
- reason: concrete public behavior regression with no assignee or matching PR

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan records issue order, acceptance, proof, public comment/label authority, open-state requirement, and non-goals |
| Active goal checked or created | yes | `get_goal` returned null; goal created for this plan |
| Root VISION.md read | yes | `VISION.md`: package/runtime owner over example glue; browser and replayable test proof required |
| Relevant docs/vision detail read | yes | `docs/vision/common.md` and `docs/vision/plate.md`: local behavior repair belongs to `patch`; Plate owns plugin/runtime DnD behavior |
| Repo resolved | yes | `udecode/plate`, current checkout `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | Open issues authored by `felixfeng33`, lowest number greater than #5066 |
| Queue snapshot plan recorded | no | N/A: user selected sequential next-item mode, not broad heartbeat |
| Live GitHub read plan recorded | yes | Issue, timeline, labels/assignee, related cross-reference, and matching PR query |
| Archive/gitcrawl freshness plan recorded | no | N/A: live GitHub is available and authoritative |
| Public mutation boundary recorded | yes | Final verified comment plus `completed`; leave open; no commit/PR/push/release/close |
| Public intake docs read when applicable | yes | Read `CONTRIBUTING.md`, bug form, PR template, and `SECURITY.md`; #5070 is complete non-security browser intake |
| Local Codex model recorded | yes | Primary Codex agent plus scoped Codex `gpt-5.6-sol` P2 autoreview |
| Standing orders read | yes | Root AGENTS public issue, Git, browser, package, and fixed-issue rules copied into this plan |
| Heartbeat runbook read | no | N/A: single user-selected issue, not heartbeat/queue maintenance |
| Output budget strategy recorded | yes | Exact and capped reads; noisy/generated trees excluded |
| Browser pack selected | yes | Homepage editor interaction needs native browser proof |
| Browser route / app surface identified | yes | `/`, Welcome block drag, then typing and selection |
| Browser tool decision recorded | yes | Browser first; Chrome only if native drag cannot be exercised |
| Console/network caveat policy recorded | yes | Runtime/console error is an acceptance criterion; network is checked for blockers but is not the defect owner |
| Package/API pack selected | yes | Package/runtime owner and release-artifact impact must be classified after isolation |
| Public surface or package boundary identified | yes | Copied registry UI `block-draggable`; no published package API or export change |
| Release artifact path selected | yes | Registry changelog entry `2026-08-06-stabilize-block-drag-drop`; no package changeset |
| `changeset` skill loaded when `.changeset` is required | no | N/A: registry-only behavior change uses `registry-changelog` |
| Barrel/export impact decision recorded | no | N/A: no exported package file or barrel changed |

Work Checklist:
- [x] First checkpoint complete.
- [x] Mode and repo are concrete.
- [x] Root VISION.md and relevant detail file are read.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is read for `heartbeat`, `queue`, broad maintenance, or
      future scheduled-local-Codex invocations. N/A: this is one sequentially
      selected issue.
- [x] Queue snapshot command is run for heartbeat/broad queue work, or exact
      `gh` auth/network blocker is recorded. N/A: not heartbeat/broad queue.
- [x] `docs/maintainer/queue.md` freshness is recorded before selecting an
      item, or stale-use caveat is explicit. N/A: bounded live GitHub query.
- [x] Live GitHub state is read or exact auth blocker recorded.
- [x] Public issue/PR/security intake is complete enough for a local Codex run,
      or the missing public evidence is named.
- [x] gitcrawl/archive data is used only for discovery or marked N/A.
- [x] Candidate matrix records every item considered.
- [x] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [x] Rejected/skipped candidates are recorded with concrete reasons.
- [x] Duplicate/claim guard is run for selected item or marked N/A.
- [x] VISION fit is recorded for selected item.
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
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no package delta.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: registry changelog is required and present.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public API shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the completion threshold above | Playwright direct drag red before fix and green after; three-repeat run, native Chrome, typing, selection, checks, and review pass |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Smallest durable owner is registry `block-draggable`; model/package behavior is unchanged |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | Local fix and proof are authorized; final comment plus `completed` is explicitly authorized; no commit/PR/close |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | Final read: open, unassigned, no matching open PR; read-back remains OPEN after update |
| Queue snapshot | no | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | N/A: bounded sequential Felix issue selection, not heartbeat |
| Duplicate/claim guard | yes | Check related PRs/branches/assignees/recent claims for selected item | Open, unassigned, no matching open PR; #5086 remains separate |
| Owner route | yes | Name selected owner skill/package/docs surface and why | `patch` -> copied registry `block-draggable`; conditional drop-line DOM is the failing owner |
| Proof path | yes | Run proof, name command, or record proof blocker | Focused Playwright, three-repeat Chromium, native Chrome, www typecheck, lint, changelog check, P2 autoreview |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | Posted one exact local-only comment and added `completed`; no close, commit, PR, push, merge, release, or sibling mutation |
| Public intake completeness | yes | Read relevant issue/PR/security template and classify whether the item is agent-ready | Complete non-security bug intake with route, gesture, error, browser, version, and acceptance |
| Rejected candidates | yes | Record skipped/rejected candidates with concrete reasons | Later Felix issues and sibling #5086 are recorded below |
| Next heartbeat | yes | Name the next useful heartbeat slice or say none safe | Next lowest open Felix issue after #5070, only after this closeout |
| Run artifact | no | Write or explicitly skip `docs/maintainer/runs/*` | N/A: one bounded issue; this durable goal plan prevents duplicate work |
| Agent-native review | no | Run/review when agent workflow files changed, else N/A | N/A: no skill, prompt, rule, or workflow file changed for #5070 |
| P2 autoreview | yes | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | Scoped local bundle, Codex `gpt-5.6-sol` high: clean, 0.94, no P0-P2 findings |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Recorded below; final response will lead with local-only status, root cause, proof, tracker state, changed files, risk, and next queue slice |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5070-fix-homepage-block-drag-crash.md` | Passed |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser loaded `/`; Chrome exact two-point drag is red before and green after; moved block remains editable and selectable |
| Browser console/network check | yes | Record console/network state or why it is not applicable | No new Chrome error logs after final drag/edit; Dark Reader hydration errors are pre-drag extension baseline; network is N/A for the local DOM-only path after successful page load |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Chrome DOM read-back: first IDs `static-0004`, `static-0001`; text `Welcome...!!`; selected `!`; no new error logs |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Registry component markup/state only; no package exports, API, or types changed |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | User-visible registry-only behavior fix |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no package delta |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Draft source entry plus generated event/index/components; generator `--check` passes |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: registry changelog is the selected artifact |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter www typecheck` passed; focused Chromium test passed and passed three repeats |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export or file-layout change |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5070 homepage block drag crashes | live Felix issue queue | open, unassigned, no matching open PR | DnD regression | yes: durable registry owner and browser proof | complete reproduction and acceptance detail | no assignee/PR; #5086 is related but separate | `patch` -> registry `block-draggable` | Browser/Chrome red-green plus regression test | comment + `completed` after proof; leave open | selected and locally fixed |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| #5071, #5084-#5088 | Later open Felix issues; not the requested next item | future maintainer heartbeat |
| #5086 | Cross-reference only; similar exception but different trigger and no mutation authority | future maintainer/patch run |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and live state | complete | #5070 selected, read live, claim/duplicate guard clear, scope and authority recorded. | reproduction |
| Reproduction and isolation | complete | Browser fallback plus exact Chrome and Playwright red proof isolated conditional drop-line deletion. | implementation |
| Implementation | complete | Stable inert drop-line DOM, accessible drag handle, focused E2E, and registry changelog added. | verification |
| Verification and review | complete | Chromium single/three-repeat, native Chrome edit/select, www typecheck, lint, changelog check, and P2 autoreview pass. | public closeout |
| Public closeout | complete | Local-only comment and `completed` label verified; issue remains OPEN. | goal check and final response |

Heartbeat handoff:
- selected item: #5070
- selected owner: patch -> copied registry `block-draggable`
- selected proof path: Browser/Chrome red-green, durable Chromium regression, www checks, P2 review
- queue snapshot: N/A: bounded live author query
- run artifact: N/A: this goal plan is the durable one-issue record
- public mutations: comment https://github.com/udecode/plate/issues/5070#issuecomment-5206465509 plus `completed`; verified OPEN
- changed files: registry block draggable; focused E2E; registry changelog source/generated event/index/components; this goal plan
- needs user attention: none
- next heartbeat recommendation: lowest open Felix issue after #5070 only after this run closes

Findings:
- Live #5070 describes a homepage Welcome block drag/release crash with DOM
  `removeChild` NotFoundError and requires order plus follow-up interaction proof.
- In-app Browser loaded the homepage but two coordinate drags only selected the
  block. Chrome exercised the native HTML5 DnD path and reproduced the exact
  `removeChild` NotFoundError in React's deletion commit after dropping Welcome
  below the intro paragraph.
- Chrome's Dark Reader and another extension add unrelated hydration/console
  noise. A clean Playwright Chromium row is required to separate the product
  regression from extension-only mutation before choosing the fix owner.
- Removing the block-selection `add` call from `onDropHandler` did not prevent
  the crash. The experiment was reverted.
- A temporary Plite React renderer test moved the first root block to the third
  position without a DOM exception. That diagnostic test was removed because
  it did not cover the failing Plate DnD wrapper.
- Four investigation reads exceeded the intended output cap: one broad E2E
  grep and three noisy dev-server polls/stops. Subsequent reads were exact-file
  or capped, but the PTY returned its accumulated buffer on shutdown.
- Issue #5086 cross-references the same exception through suggestion acceptance;
  it is sibling evidence, not part of the authorized public mutation scope.
- #5070 is open, unassigned, and has no matching open PR.
- Public intake is complete enough for local execution: route, deterministic
  gesture, observed error, expected behavior, acceptance criteria, version,
  browser, and affected DnD surface are present.
- Vision rejects homepage-only glue if the defect is systemic; owner isolation
  must distinguish registry rendering from Plate DnD/runtime behavior.
- In-app Browser reached the correct handle and drop target but could not start
  the React DnD native drag state after two coordinate paths; Chrome is the
  required fallback, not a waiver.
- Chrome native drag from the Welcome handle to the lower half of the next
  paragraph reproduces the exact fourth Next.js error: React DOM
  `commitDeletionEffectsOnFiber` calls `removeChild`, then the page becomes
  unavailable. The first three overlay rows are Dark Reader hydration noise.
- The DnD model move already has focused package tests. The failing boundary is
  the React DOM commit after the drop, with the app registry wrapper's preview
  and block-selection updates as the smallest current suspects.
- The exact automated direct drag failed red with a single Next.js runtime row:
  conditional `DropLine` deletion raced the DnD target reorder and React called
  `removeChild` with a stale parent. Multi-step drags could mask the race.
- `DropLine` now has stable DOM outside `nodeRef`; drag state changes opacity
  and edge classes only. The node is inert, hidden from accessibility, and not
  editable. The handle also has an accessible label and stable test selector.
- Moving the line outside `nodeRef` while keeping conditional mount/unmount was
  insufficient in the automated direct path. Keeping the DOM node mounted is
  the governing invariant.

Timeline:
- 2026-08-06: selected #5070 from the bounded live Felix queue, read issue and
  timeline, checked claim state, created this one-shot goal, and captured every
  explicit acceptance and authority boundary before source exploration.
- 2026-08-06: read root/common/Plate vision, repo agent rules, contributor
  intake docs, bug form, PR template, security policy, and Browser workflow.
- 2026-08-06: started `pnpm --filter www dev`; Browser could not synthesize the
  HTML5 drag, so Chrome reproduced the exact `removeChild` crash and full React
  deletion stack on `/`.
- 2026-08-06: isolated conditional drop-line deletion, added a direct Chromium
  regression, kept the line DOM stable, verified native Chrome editing, added
  the registry changelog, passed checks, and completed scoped P2 autoreview.
- 2026-08-06: re-read live claim state, posted the verified local-only fix
  comment, added `completed`, and read back the comment, label, and OPEN state.

Decisions and tradeoffs:
- Treat #5086 as a root-cause pressure test, not a second issue delivery, so the
  implementation may fix one shared owner without overclaiming sibling closure.

Review fixes:
- None. Scoped P2 autoreview returned clean with no accepted/actionable P0-P2
  findings and judged the patch correct at 0.94 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| In-app Browser drag selected the block but did not start React DnD | 2 | Use Chrome native CUA drag per Browser fallback policy | Chrome reproduced exact crash |

Verification evidence:
- `pnpm --filter www dev` -> homepage ready at `http://localhost:3000/`.
- Chrome `/` -> native Welcome drag to next paragraph -> `Runtime
  NotFoundError`; full stack begins at React DOM `removeChild` during
  `commitDeletionEffectsOnFiber`; page is replaced by the error surface.
- Pre-fix focused Playwright direct drag -> one `Runtime NotFoundError` and
  empty document-order read-back; post-fix same row -> pass.
- `pnpm exec playwright test tooling/e2e/homepage-dnd.test.ts --config
  tooling/config/playwright.config.ts --project chromium --repeat-each=3` -> 3
  passed; order, zero runtime errors, typing, and selection asserted.
- Final Chrome exact two-point drag -> first IDs `static-0004`, `static-0001`;
  follow-up native typing produced `Welcome to the Plate Playground!!`, native
  selection returned `!` inside the moved block, and no new error logs appeared.
- `pnpm --filter www typecheck` -> passed editor generation checks, API
  reference check, source build/parity, registry source check, and TypeScript.
- `pnpm lint:fix` -> passed with only existing oversized-artifact warnings.
- Registry changelog `--write` and `--check` -> 47 source events synchronized.
- Scoped `.agents/skills/autoreview/scripts/autoreview --mode local
  --max-priority P2` -> clean, no accepted/actionable findings.
- Final `gh issue view 5070` -> latest comment by `zbeyens`, labels include
  `completed`, state remains `OPEN`, no integration or release claim.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Local implementation and proof complete | final live GitHub read, comment, label, and open-state read-back | close #5070 locally with verified browser and tracker evidence | stable drop-line DOM removes the contested React deletion | implementation, regression, native proof, checks, changelog, and P2 review complete |

Open risks:
- In-app Browser could not start the native HTML5 gesture; final native proof
  therefore depends on Chrome, while Playwright provides replayable CI coverage.
- The checkout contains unrelated in-progress work, so review used an isolated
  HEAD bundle containing only #5070 files. No commit, PR, or shipping claim is
  authorized.
