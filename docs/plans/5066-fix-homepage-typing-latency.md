# Fix homepage typing latency

Objective:
Fix Plate #5066 homepage typing latency; done when native-input repro, durable
owner fix, focused benchmarks, Browser proof, and clean P2 review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5066-fix-homepage-typing-latency.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Maintainer source:
- mode: next open Felix-authored issue after #5065, selected by the user
- repo: `udecode/plate`, checkout `/Users/zbeyens/git/plate-2`
- queue slice: Felix-authored open issues with number greater than #5065;
  select the lowest number only
- prompt / item link: https://github.com/udecode/plate/issues/5066
- acceptance criteria: reproduce the homepage native-keyboard latency; add a
  repeatable browser performance test using the homepage stack or equivalent;
  identify and fix the homepage-only owner; preserve existing Plite/Plate input
  benchmark performance; document or cover why `/dev/editor-perf` missed it;
  post a transparent issue comment after verified repair even if local-only
- standing orders: local diagnosis, implementation, tests, benchmarks, and
  Browser proof are allowed; after proof, one verified-fix comment is required;
  no commit, push, PR, close, label, assignment, merge, or release is authorized
- heartbeat trigger: N/A; explicit sequential issue selection, not heartbeat
- queue snapshot command: N/A; the bounded Felix issue query is sufficient
- queue artifact: N/A; live GitHub is authoritative for this narrow slice
- run artifact: N/A unless reusable queue context emerges beyond this goal plan

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Issue #5066 is reproduced with real browser keyboard input, the homepage-only
  latency owner is measured and fixed at its durable boundary, repeatable
  performance proof covers the affected stack, existing relevant benchmarks do
  not regress, package/browser checks pass, changeset status is correct, P2
  autoreview is clean, and a status-accurate issue comment is live while the
  issue remains open unless separately authorized.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live `gh issue view`, bounded Felix issue query, and focused duplicate/claim searches.
- Root/relevant Vision and public issue-intake source audit.
- Source/profile audit of the homepage Plate-on-Plite stack and `/dev/editor-perf`.
- Red/green real-keyboard browser performance proof with a stable metric and threshold.
- Focused owning-package tests/typecheck plus existing relevant input benchmarks.
- Browser route proof on `/` with console/network inspection.
- Changeset classification and P2 `autoreview --max-priority P2`.
- Live readback of the verified-fix GitHub comment.

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
- Preserve homepage editor behavior and avoid moving Plate product policy into
  Plite without source/profile proof that Plite owns the cost.
- Keep performance claims machine-relative and compare like-for-like runs.

Boundaries:
- Source of truth: live issue #5066, current checkout source, repeatable
  profiling/benchmarks, owning tests, and Browser runtime evidence
- Allowed edit scope: smallest durable homepage, Plate, or Plite owner; focused
  performance tests/fixtures; relevant docs/benchmark explanation; changeset;
  this plan
- Public mutation authority: one verified-fix issue comment after proof; no
  other GitHub or git/release mutation
- Security scope: N/A; ordinary performance regression
- Browser surface: local homepage `/`; `/dev/editor-perf` for comparison; an
  equivalent fixture only if it preserves the homepage stack under test
- Non-goals: broad queue work, pure-Plite blame without evidence, cosmetic
  tuning, timing sleeps, benchmark gaming, unrelated cleanup, branch switching,
  commit/push/PR/close/label/merge/release

Output budget strategy:
- Use exact issue/source files, bounded searches, focused benchmark summaries,
  and capped profiler output. Exclude generated/build/cache trees unless they
  are the named evidence owner. Save large traces as artifacts and inspect
  summaries rather than streaming them.

Blocked condition:
- Block only if the reported native-input latency cannot be reproduced after
  the exact homepage path and equivalent-stack fixture are exhausted, or if
  meaningful proof requires unavailable hardware/native tooling after all
  in-repo Browser/Chrome paths are exhausted.

Maintainer state:
- current_phase: final handoff
- current_phase_status: completed
- selected_item: udecode/plate#5066
- selected_owner: maintainer coordinating `patch` performance/scalability lane
- goal_status: complete

Current verdict:
- verdict: fixed and verified in the current local checkout; the verified-fix
  GitHub comment is live and the issue remains open
- confidence: high
- next owner: user decides whether to commit or open a PR
- reason: native homepage typing improved from 261-312 ms to 92-98 ms in the
  same Browser session; the repeatable homepage gate reports 108.3 ms p95

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Next Felix issue, full issue acceptance criteria, local-fix comment rule, mutation boundaries, proof, and handoff captured above |
| Active goal checked or created | yes | New active goal created with this plan path |
| Root VISION.md read | yes | Performance must use honest interaction metrics, real browser proof, and the durable owner |
| Relevant docs/vision detail read | yes | `docs/vision/common.md` and `docs/vision/plate.md` forbid benchmark tricks and premature Plite ownership |
| Repo resolved | yes | `udecode/plate` in `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | Lowest-numbered open Felix issue after #5065 only: #5066 |
| Queue snapshot plan recorded | N/A | Explicit bounded author/number query; no broad queue ranking |
| Live GitHub read plan recorded | yes | Issue body/state/comments/labels/assignees/closing PR refs and bounded author list read live |
| Archive/gitcrawl freshness plan recorded | N/A | Live GitHub available; archive is not needed unless duplicate search warrants it |
| Public mutation boundary recorded | yes | One verified-fix comment after proof; no other public/git/release mutation |
| Public intake docs read when applicable | yes | `CONTRIBUTING.md`, issue forms, PR template, and `SECURITY.md` read; #5066 is agent-ready and non-security |
| Local Codex model recorded | yes | Local maintainer coordination with `patch` and the performance lens |
| Standing orders read | yes | Maintainer permits local work and requires the verified-fix comment after proof |
| Heartbeat runbook read | N/A | User selected the next bounded issue; not heartbeat/queue mode |
| Output budget strategy recorded | yes | Focused reads, capped summaries, and trace artifacts recorded above |
| Browser pack selected | yes | Native-keyboard latency is a browser-visible performance claim |
| Browser route / app surface identified | yes | Homepage `/`, compared with `/dev/editor-perf` |
| Browser tool decision recorded | yes | In-app Browser handled native keyboard, DOM, timing, trace, console, and network proof on `/`; Chrome and Computer were N/A because no profile-, permission-, dialog-, or OS-owned behavior was involved |
| Console/network caveat policy recorded | yes | Inspect the exact interaction window and distinguish pre-existing unrelated noise |
| Package/API pack selected | yes | Published runtime package changes may be required; owner is not yet known |
| Public surface or package boundary identified | yes | Homepage Plate-on-Plite stack; exact owning package awaits profiling |
| Release artifact path selected | yes | Core and table package behavior each have a patch changeset; the registry behavior has a generated registry changelog entry |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before authoring `.changeset/quick-plugins-rest.md` and `.changeset/calm-tables-type.md` |
| Barrel/export impact decision recorded | yes | No existing exports or public file layout changed; the table predicate lives under unexported `react/internal`, so `pnpm brl` is N/A |

Work Checklist:
- [x] First checkpoint complete.
- [x] Mode and repo are concrete.
- [x] Root VISION.md and relevant detail file are read.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is read for `heartbeat`, `queue`, broad maintenance, or
      future scheduled-local-Codex invocations.
- [x] Queue snapshot command is run for heartbeat/broad queue work, or exact
      `gh` auth/network blocker is recorded.
- [x] `docs/maintainer/queue.md` freshness is recorded before selecting an
      item, or stale-use caveat is explicit.
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
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the completion threshold above | Native homepage gate passes at 108.3 ms mutation p95 against a 150 ms budget; same-session manual Browser p95 is about 98 ms, down from more than 300 ms |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Strong fit: real editor performance is a current priority and requires native interaction proof |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | Local repair is allowed; verified-fix comment follows proof; all other mutations remain gated |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | #5066 OPEN, unassigned, no comments, no closing PR, updated 2026-08-05 |
| Queue snapshot | N/A | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | Explicit bounded author/number selection, not broad queue work |
| Duplicate/claim guard | yes | Check related PRs/branches/assignees/recent claims for selected item | Focused open issue/PR searches returned no matches; timeline has no claim/cross-reference event |
| Owner route | yes | Name selected owner skill/package/docs surface and why | Maintainer coordinates `patch`; performance lens defines interaction/profiling proof |
| Proof path | yes | Run proof, name command, or record proof blocker | Native Browser timing/profile, repeatable homepage gate, focused tests/typechecks, existing reduced-stack benchmark, lint, and registry generation all pass |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | Posted one verified local-fix comment at https://github.com/udecode/plate/issues/5066#issuecomment-5197581795 and read it back; issue remains OPEN; no commit, push, PR, close, label, assignment, merge, or release |
| Public intake completeness | yes | Read relevant issue/PR/security template and classify whether the item is agent-ready | Agent-ready: deterministic route, exact refs/environment, benchmark contrast, explicit acceptance criteria, honest owner uncertainty |
| Rejected candidates | yes | Record skipped/rejected candidates with concrete reasons | #5070, #5071, and #5084 are later than the selected next issue |
| Next heartbeat | yes | Name the next useful heartbeat slice or say none safe | Re-read #5070 live and select it only if still open and unclaimed |
| Run artifact | yes | Write or explicitly skip `docs/maintainer/runs/*` | N/A; this single-item goal plan contains the reusable intake, diagnosis, proof, and handoff |
| Agent-native review | N/A | Run/review when agent workflow files changed, else N/A | No skills, prompts, commands, or agent workflow files changed |
| P2 autoreview | yes | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | Final scoped Sol review reports no P0-P2 findings with 0.90 confidence |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Repo `udecode/plate`, bounded next-Felix mode, #5066 selected, patch/performance owner, all proof listed below, one comment only, changed list recorded, no attention item, #5070 suggested after live reread |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5066-fix-homepage-typing-latency.md` | Completion ledger contains no open checkpoint; validation command is the final local gate |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | In-app Browser drove native keyboard input on `/`; same-session mutation latency improved from 261-312 ms to 92-98 ms |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Final reload mounted one editor, captured 136 network events with no failures or HTTP 4xx/5xx, and logged no console errors in the reload window |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Chrome trace on `/` established the original 303.5 ms long task and React/schema/registry/table fan-out; final native-key timing and DOM readback cover the repaired route |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core changes existing internal plugin access, table selector policy remains unexported, and registry logic stays registry-owned; no public call shape changes |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Core and table are published runtime behavior patches; block-discussion is registry behavior; benchmark docs/script are www-only proof |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Patch changesets exist for `@platejs/core` and `@platejs/table`; no forbidden minor bump |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Source entry plus generated event/index/components artifacts pass generator `--check` |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Published package and registry behavior changed, so artifacts are required and present |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core 17/17, table 13/13, registry 8/8; focused package and www typechecks pass |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No export statement or exported file layout changed; the new table helper is internal-only |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Live issue, queue slice, VISION, contribution, template, and security inputs read | implementation |
| Reproduction and profiling | completed | Native Browser repro measured 261-312 ms and isolated three homepage fan-out owners | implementation |
| Implementation | completed | Core, registry discussion, table selector, benchmark, explanation, and release artifacts updated | verification |
| Verification | completed | Focused tests/typechecks, lint, both benchmark lanes, registry check, and Browser runtime proof pass | review |
| Review / pressure pass | completed | Scoped Sol P2 review returned no actionable findings | public update |
| Public update | completed | Verified-fix comment posted and read back; issue remains open | closeout |
| Closeout | completed | Changed list, residual risk, next heartbeat, and mutation boundary recorded | final response |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | udecode/plate#5066 | next open Felix issue after #5065 | OPEN; unassigned; no closing PR; updated 2026-08-05 | performance/scalability regression | strong | detailed repro, refs, benchmark contrast, and acceptance criteria | no matching open issue/PR or timeline claim found | maintainer -> `patch` | native keyboard benchmark/profile, focused package checks, Browser | local work plus verified-fix comment | selected |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| #5070, #5071, #5084 | Later Felix-authored issues; outside the single next-item scope | future maintainer selections |

Heartbeat handoff:
- selected item: udecode/plate#5066
- selected owner: maintainer coordinating `patch`
- selected proof path: native-keyboard repro/profile, focused benchmark and package proof, homepage Browser validation
- queue snapshot: N/A; bounded live Felix query selected #5066
- run artifact: N/A; this single-item plan records the complete reusable context
- public mutations: verified-fix comment required only after all proof passes
- public mutation result: comment https://github.com/udecode/plate/issues/5066#issuecomment-5197581795 was read back verbatim; issue remains OPEN
- changed files: core plugin access and test; block-discussion index and test;
  table cell selector, internal predicate, and test; homepage benchmark script and
  package command; editor-perf explanation; two patch changesets; registry
  changelog source/generated artifacts; this plan
- needs user attention: none
- next heartbeat recommendation: after #5066 closure, select #5070 if still live and unclaimed

Findings:
- Live GitHub lists #5066 as the lowest-numbered open Felix issue after #5065.
- The issue explicitly bounds the symptom to the homepage Plate-on-Plite stack;
  pure Plite routes are not known to reproduce it.
- The initial Browser run measured 261-312 ms from native `keydown` to DOM
  mutation. The longest traced main-thread task was 303.5 ms: React work was
  195.9 ms, `beforeinput` dispatch 100.6 ms, and style/layout 34.3 ms.
- The homepage registry caused three independent commit-wide costs: published
  plugin schemas were reevaluated during plugin access; every discussion
  wrapper rebuilt a whole-document comment/suggestion index; every table cell
  recalculated coordinates even for text-only commits.
- `/dev/editor-perf` measures programmatic editor insertion with smaller plugin
  and component sets. It omits native keyboard dispatch and the homepage
  registry wrappers, so its healthy result does not cover this regression.
- After the durable owner fixes, native Browser mutation latency is 92-98 ms in
  the same session. The repeatable homepage gate reports 108.3 ms p95 across 20
  measured native keystrokes and fails above 150 ms.
- The existing reduced-stack paragraph benchmark remains healthy: Plate-family
  input p95 is 11.6-13.5 ms. Remaining homepage cost is dominated by selection
  reconciliation and ordinary editor mutation/update work, not the removed
  commit-wide fan-out.

Timeline:
- 2026-08-05: selected #5066 from the bounded live Felix issue list.
- 2026-08-05: read live issue intake; created the active goal and this execution ledger.
- 2026-08-05: reproduced 261-312 ms native homepage typing and captured a
  303.5 ms main-thread task.
- 2026-08-05: removed published-schema reevaluation, discussion-index fan-out,
  and table coordinate recalculation from text-only commits.
- 2026-08-05: added the native homepage gate and documented the reduced scope
  of `/dev/editor-perf`; focused proof and release artifacts pass.
- 2026-08-05: final scoped P2 review returned clean; final Browser reload had no
  console or network failure; posted and read back the required local-fix
  comment while leaving #5066 open.

Decisions and tradeoffs:
- Treat #5066 as Plate product-stack performance until profiling proves a
  narrower Plite substrate owner; the issue itself warns against premature blame.
- Require real keyboard proof because programmatic insertion misses the reported path.
- Reuse the compiled/published schema binding after editor creation. Authored
  schema factories remain the fallback only when no binding exists.
- Ignore plain text/selection commits for discussion indexes, but refresh when
  changed nodes or ancestors carry persisted `comment_`/`suggestion_` data and
  when property, structure, replace, or root-order changes can alter ownership.
- Ignore text/selection-only commits for table coordinates; structural and
  property changes still recalculate them.
- Use a 150 ms mutation-p95 budget as a regression detector, not a universal
  machine-independent product SLA.
- Keep the table predicate internal. The fix does not add a public API,
  compatibility alias, or migration path.

Review fixes:
- Moved the table selector predicate from the public React barrel into
  `react/internal` before review; this keeps testable policy without exposing a
  test-only package API.
- Rejected two findings from the first broad local bundle because they belonged
  to inherited checkout work: the staged schema-portal hard cut and an unrelated
  unstaged `@types/mdast` manifest edit. The scoped baseline committed inherited
  staged work and excluded the unrelated manifest hunk.
- Rejected a scoped table selection finding after checking the actual hook:
  `useCellIndices()` requires an explicit cell or `TableCellPlugin` provider;
  without one its selector returns `undefined` and the hook throws, so it has no
  selection-derived coordinate mode.
- Accepted the benchmark false-pass finding. Each sample now records the target
  block text before the key and accepts mutation time only after that exact block
  becomes `textBefore + key`.
- Final scoped Sol P2 review reports no actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial `gh search` query used unsupported repository syntax | 1 | Rerun focused searches with supported `--repo` flags and narrower terms | Resolved; four focused searches returned no matches |
| `dev:plite` failed on an exact package subpath after reinstall | 1 | Use the owning www development command for the homepage route | Resolved; `pnpm --filter www dev` served `/` and all Browser proof |
| First reduced benchmark invocation added an extra `--` and the default mixed workload hit an existing unknown `h1` fixture | 2 | Use the supported huge-paragraph workload and exact CLI shape | Resolved; all six input rows completed with 9.6-13.5 ms p95 |
| Standalone script `tsc` found no inputs because its include is relative to the scripts directory | 1 | Run the owning www typecheck, which includes script/API/registry checks | Resolved; `pnpm --filter www typecheck` passed |

Verification evidence:
- Live `gh issue list --author felixfeng33` selected #5066 by ascending issue number.
- Live `gh issue view 5066` confirms OPEN, unassigned, no comments, and no closing PR.
- Focused issue/PR searches returned no duplicate or active implementation;
  the live timeline returned no claim or cross-reference event.
- In-app Browser on `/`: native keydown-to-mutation improved from 261-312 ms
  before to 92-98 ms after in the same development session.
- `pnpm --filter www perf:homepage-input`: 20 measured native keystrokes,
  mutation mean 88.05 ms, p95 108.3 ms, max 109.1 ms; second-paint p95 107.1 ms;
  exit 0 against the 150 ms budget.
- `pnpm --filter www perf:editor --benchmarks input --blocks 100 --chunking false --visibility none --scenario-workload huge-paragraph --timeout 120000`:
  six rows pass; Slate 9.6 ms p95 and Plate-family rows 11.6-13.5 ms p95.
- Focused tests pass: core 17/17, table 13/13, block discussion 8/8.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/table`
  and `pnpm --filter www typecheck` pass.
- `pnpm lint:fix` passes with only 15 pre-existing over-1-MiB artifact warnings.
- Registry changelog generation and `--check` pass with 46 events.
- Final Browser reload: one mounted homepage editor, no console errors, and no
  failed or HTTP 4xx/5xx request among 136 captured network events.
- Final scoped P2 autoreview: no findings; overall patch correct with 0.90 confidence.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closure review | P2 review, final Browser readback, GitHub comment/readback | Remove #5066 latency without benchmark regressions | Homepage registry subscribers amplified every native text commit | Fixed all measured owner fan-out, added regression proof, and passed focused checks |

Open risks:
- Remaining development-mode selection reconciliation costs roughly 36 ms per
  keystroke. The severe homepage-only stall is removed, but this patch does not
  claim zero latency or a production-hardware SLA.
- No commit or PR exists. The issue must remain open after the local-fix comment.
