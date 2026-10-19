# Fix table Tab navigation regression

Objective:
Fix Plate #5065 locally so Tab and Shift+Tab navigate horizontally between
table cells, with red/green package and Browser proof, a changeset, and clean
P2 review.

Goal plan:
docs/plans/5065-fix-table-tab-navigation.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Maintainer source:
- mode: one public issue selected explicitly by the user
- repo: `udecode/plate`, checkout `/Users/zbeyens/git/plate-2`
- queue slice: issue #5065 only
- prompt / item link: https://github.com/udecode/plate/issues/5065
- acceptance criteria: Tab selects the next table cell; Shift+Tab selects the
  previous table cell; browser focus remains in the editor; regression proof
  fails before and passes after the fix.
- standing orders: the initial local-fix run had no public mutation authority;
  after verification, the user authorized one transparent fix comment and made
  that comment a standing requirement for future public issue fixes
- heartbeat trigger: N/A; this is an explicitly selected issue, not a heartbeat
- queue snapshot command: N/A; a single explicit item does not need broad queue ranking
- queue artifact: N/A; live issue state is authoritative
- run artifact: N/A unless investigation uncovers reusable duplicate-work context

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Issue #5065 is locally fixed in the owning package. A focused regression test
  proves both directions, the relevant package checks pass, the homepage flow
  passes in Browser without focus loss or new console errors, a valid changeset
  exists, P2 autoreview has no accepted actionable finding, and any public
  mutation is explicitly authorized and accurately reports local, commit, and
  PR status.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- `gh issue view` plus focused `gh issue/pr search` for live state and duplicate guard.
- Source audit across table key handling, tabbable event ownership, and homepage plugin wiring.
- Red/green focused owning-package regression test covering Tab and Shift+Tab.
- Owning package test and source-first typecheck; `pnpm lint:fix` or safely scoped equivalent.
- In-app Browser on the homepage table: focus a cell, press Tab/Shift+Tab, inspect selection/focus, console, and network.
- Changeset validation and P2 `autoreview --max-priority P2`.

Constraints:
- No GitHub comments, labels, closes, PRs, reviews, pushes, merges, releases,
  or public mutations unless explicitly authorized.
- Later user authority permits one verified-fix issue comment. It does not
  permit labels, assignment, closure, push, PR, merge, or release.
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
- Source of truth: live issue, current checkout source, tests, and Browser runtime proof
- Allowed edit scope: the smallest durable owner under table/tabbable plus focused tests, changeset, and this plan
- Public mutation authority: one verified-fix comment after proof; do not label,
  assign, close, push, open a PR, merge, or release
- Security scope: N/A; ordinary behavior regression
- Browser surface: local homepage editor table at `/`
- Non-goals: no unrelated cleanup, compatibility alias, template edits, branch switch, or git mutation

Output budget strategy:
- Keep command output focused to relevant source ranges, tests, live issue fields,
  Browser evidence, and final review. Do not dump broad queue or full-suite logs.

Blocked condition:
- Block only if the behavior cannot be reproduced after exhausting the issue's
  exact homepage path and focused package harness, or every durable fix requires
  overwriting unrelated user-owned work. Public mutation is out of scope, not a blocker.

Maintainer state:
- current_phase: closure
- current_phase_status: complete
- selected_item: udecode/plate#5065
- selected_owner: patch
- goal_status: complete

Current verdict:
- verdict: fixed locally with package, browser, changeset, and P2 proof
- confidence: high
- next owner: user decides whether to commit or open a PR
- reason: the shortcut dispatcher ran before DOM selection synchronization;
  table navigation also needed priority over generic Tab shortcuts

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Issue, behavior, proof, authority, release, and handoff boundaries recorded above |
| Active goal checked or created | yes | Active goal created for issue #5065 |
| Root VISION.md read | yes | Root editor and proof doctrine read before implementation |
| Relevant docs/vision detail read | yes | Common and Plate vision detail read; owner-first fix matches the doctrine |
| Repo resolved | yes | `udecode/plate` in `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | Issue #5065 only |
| Queue snapshot plan recorded | N/A | Explicit single issue; no broad ranking needed |
| Live GitHub read plan recorded | yes | Live issue and focused issue/PR searches read before implementation |
| Archive/gitcrawl freshness plan recorded | N/A | Live GitHub was available; no archive evidence was needed |
| Public mutation boundary recorded | yes | Initial local-only boundary recorded; later authority permits one transparent verified-fix comment only |
| Public intake docs read when applicable | yes | Contributing, security, bug template, and PR template read |
| Local Codex model recorded | yes | Local patch execution with scoped P2 Codex review |
| Standing orders read | yes | Local diagnosis, edits, and proof allowed; verified public fixes must receive one status-accurate issue comment |
| Heartbeat runbook read | N/A | User selected one issue; this was not heartbeat work |
| Output budget strategy recorded | yes | Focused reads and proof logs only |
| Browser pack selected | yes | Generated plan includes Browser pack |
| Browser route / app surface identified | yes | Local homepage `/`, “How Plate Compares” table |
| Browser tool decision recorded | yes | In-app Browser; no native Chrome/OS surface involved |
| Console/network caveat policy recorded | yes | Check new errors during exact interaction; evidence any pre-existing unrelated noise |
| Package/API pack selected | yes | Generated plan includes package/API pack |
| Public surface or package boundary identified | yes | Published `@platejs/core` shortcut runtime and `@platejs/table` navigation behavior |
| Release artifact path selected | yes | `.changeset` for affected published package(s) |
| `changeset` skill loaded when `.changeset` is required | yes | Skill loaded; one patch changeset per affected package |
| Barrel/export impact decision recorded | yes | Dispatcher component became a utility; core barrels regenerated with package `brl` |

Work Checklist:
- [x] First checkpoint complete.
- [x] Mode and repo are concrete.
- [x] Root VISION.md and relevant detail files are read.
- [x] Standing orders allow local work plus one transparent verified-fix comment after proof.
- [x] Heartbeat runbook and queue snapshot are N/A for one user-selected issue.
- [x] Live GitHub state and public intake documents are read.
- [x] Archive evidence is N/A because live GitHub was available.
- [x] Candidate matrix records and ranks the only in-scope issue.
- [x] Rejected candidates and duplicate/claim guard are recorded.
- [x] VISION fit is recorded for the selected owner-first repair.
- [x] Selected item is at most one autonomous item unless the user explicitly
      requested a broader batch.
- [x] Owner route is `patch`, implemented in core shortcut dispatch and table navigation.
- [x] Red/green package and Browser proof paths are recorded.
- [x] Public mutation authority is recorded as none, explicit, or blocked.
- [x] Changed files and user-attention caveats are recorded.
- [x] Next heartbeat recommendation is to wait for the next user-selected item.
- [x] Run artifact is N/A; this plan contains all reusable duplicate-work context.
- [x] P2 autoreview completed clean after two accepted propagation fixes.
- [x] Browser interaction, DOM caret result, current console window, and 200 route response are recorded.
- [x] Direct DOM selection evidence replaces a screenshot because it proves the caret owner exactly.
- [x] Package boundaries, release artifacts, compatibility, tests, typechecks, and barrels are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the completion threshold above | Both directions pass package and Browser proof; release and review gates pass |
| VISION fit | yes | Classify doctrine fit | Owner-first shortcut synchronization fixes the bug class without a compatibility layer |
| Standing-order fit | yes | Confirm authority | Local fix comment posted after proof; no git or other GitHub mutation occurred |
| Live GitHub truth | yes | Read current issue state | Issue open, unassigned, no linked closing PR in the live read |
| Queue snapshot | N/A | Explain omission | One explicit issue required no broad queue ranking |
| Duplicate/claim guard | yes | Check focused claims | No matching PR, branch, assignee, or human claim found |
| Owner route | yes | Name implementation owner | `patch`; core owns synchronized shortcut dispatch and table owns cell navigation |
| Proof path | yes | Run package and Browser proof | Fresh commands and interaction evidence recorded below |
| Public mutation boundary | yes | Confirm result | One verified-fix comment posted; no label, assignment, close, commit, push, PR, merge, or release |
| Public intake completeness | yes | Classify issue | Exact repro, expected behavior, video, and version observations made it agent-ready |
| Rejected candidates | yes | Record exclusions | Every other queue item was outside the user-bounded slice |
| Next heartbeat | N/A | Name next safe action | Wait for the user's next selected issue or explicit heartbeat request |
| Run artifact | N/A | Explain omission | This issue plan holds the diagnosis and proof; no separate run artifact adds value |
| Agent-native review | yes | Classify workflow impact | Maintainer source rules and generated mirrors were synced; source-to-mirror parity audit passed |
| P2 autoreview | yes | Run scoped P2 review | Final app-bundled Codex run clean at confidence 0.88 after two P2 fixes |
| Final handoff contract | yes | Prepare outcome report | Repo, owner, fix, proof, mutations, caveat, and next authority are recorded |
| Goal plan complete | yes | Run goal checker | Checker command is the final ledger gate |
| Browser interaction proof | yes | Exercise both directions | `/view/editor-ai`: Suggestions Tab to ✅; ✅ Shift+Tab to Suggestions; active element stayed editor DIV |
| Browser console/network check | yes | Inspect current runtime window | No error or warning in the final 60-second window; route returned HTTP 200 |
| Browser final proof artifact | yes | Record exact state | DOM selection anchors were `✅` then `Suggestions`; direct state proof made a screenshot unnecessary |
| Public API / package boundary proof | yes | Audit affected packages | No public call-shape change; core runtime timing and table behavior changed |
| Release artifact classification | yes | Classify user delta | Published runtime fixes in `@platejs/core` and `@platejs/table` |
| Published package changeset | yes | Add one patch file per package | `clean-shortcut-selection.md` and `quiet-tables-tab.md`; core uses patch, never minor |
| Registry changelog | N/A | Classify registry scope | No registry source change belongs to this fix |
| No release artifact | N/A | Explain omission | Published package behavior changed, so changesets are required and present |
| Package typecheck/build/test | yes | Run owner checks | Core and table typechecks pass; core 700 tests and table 239 tests pass |
| Barrel/export generation | yes | Regenerate changed exports | `pnpm --filter @platejs/core brl` completed |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | udecode/plate#5065 | user-selected issue | OPEN; unassigned; no linked PR | regression / table keyboard navigation | strong owner-first fit | clear repro, video, and commit observations | no matching PR, branch, assignee, or human claim | `patch` | green package and Browser proof | local edits/tests plus verified-fix comment | fixed locally and commented transparently |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| All other queue items | Outside the user-bounded issue #5065 slice | maintainer heartbeat later |

Heartbeat handoff:
- selected item: udecode/plate#5065
- selected owner: `patch`
- selected proof path: focused red/green package proof plus editor Browser interaction
- queue snapshot: N/A for an explicit single issue
- run artifact: N/A; this plan is sufficient
- public mutations: one verified-fix comment posted at
  https://github.com/udecode/plate/issues/5065#issuecomment-5196892419
- changed files: core shortcut dispatcher extraction and editable integration;
  table shortcuts and regression tests; generated barrels; two changesets;
  maintainer protocol sources and generated mirrors; this plan
- needs user attention: decide whether to commit or open a PR; the issue comment is done
- next heartbeat recommendation: none until another issue or queue slice is selected

Findings:
- The native shortcut listener ran before Plite imported the live DOM caret, so
  selection-changing shortcuts could act on stale editor state.
- Table Tab handling lived in the later React plugin handler and lost to generic
  indentation shortcuts. Table-owned shortcuts at priority 10 restore both directions.
- P2 found that the first synchronized wrapper changed React propagation policy.
  The final wrapper mirrors native prevention into the SyntheticEvent and only
  skips the handler chain when the shortcut actually stops propagation.

Timeline:
- Goal and authority contract captured before edits.
- Live issue, duplicate guard, video, source ownership, and red test established.
- Initial table shortcut fix exposed stale selection ordering in Browser.
- Shortcut dispatch moved into the synchronized editable keyboard pipeline.
- Browser, package checks, changesets, barrels, and P2 review completed.
- User authorized transparent fix comments even for local-only fixes.
- Posted and live-verified the local-only fix comment on issue #5065.
- Added the standing comment rule to maintainer source guidance and synced its mirrors.

Decisions and tradeoffs:
- Rejected Dosu's tabbable theory because the reproduced editor does not install
  that plugin.
- Rejected a table-only DOM-selection workaround because every selection-changing
  shortcut needs synchronized state.
- Preserved shortcut handler native `KeyboardEvent` contracts and prior explicit
  propagation policy while moving dispatch timing.
- Kept the issue open and stated that no commit, push, or PR exists, because a
  verified local fix is not shipped work.

Review fixes:
- Accepted P2: mirror native prevention and propagation onto React's SyntheticEvent.
- Accepted P2: continue editable/plugin handlers for shortcuts configured to propagate.
- Final P2 result: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Native listener moved to document bubble updated model selection but did not schedule DOM selection export | 1 | Move dispatch into Plite's synchronized editable callback | Resolved; red/green integration test and Browser pass |
| P2 local review refused an unrelated staged `.pyc` binary | 1 | Build an isolated snapshot of only #5065 files | Resolved without touching the user's staged binary |
| System `codex` CLI was too old for `gpt-5.6-sol` | 2 | Use the newer app-bundled Codex CLI with the same model and scope | Final scoped P2 run clean |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake and guard | complete | Live issue, templates, duplicate search, VISION, and authority boundary recorded |
| Diagnosis and red proof | complete | Stale selection ordering reproduced in package integration and Browser |
| Implementation | complete | Core synchronized dispatch and table-priority shortcuts implemented |
| Verification | complete | Typechecks, 939 package tests, lint, barrels, changesets, and Browser pass |
| Review and closure | complete | Two P2 findings fixed; final P2 clean; verified-fix comment posted; maintainer protocol mirrors synced |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` passed, including test and contract typechecks.
- `pnpm --filter @platejs/table typecheck` passed.
- `pnpm --filter @platejs/core test` passed: 700 tests, 0 failures.
- `pnpm --filter @platejs/table test` passed: 239 tests, 0 failures.
- Focused table integration passed 10 tests, including stale-model Tab and Shift+Tab cases.
- Browser `/view/editor-ai`: caret moved Suggestions -> ✅ -> Suggestions and
  focus remained on the editor DIV; final recent console window was empty.
- `pnpm --filter @platejs/core lint:fix` and table lint passed.
- `pnpm --filter @platejs/core brl` regenerated affected barrels.
- Final P2 autoreview: clean, patch correct, confidence 0.88.
- Live issue comment verified at
  https://github.com/udecode/plate/issues/5065#issuecomment-5196892419; it states
  the fix is local only and leaves the issue open.
- `pnpm install` regenerated agent guidance after source-rule edits; `rg` parity
  checks confirmed the rule in root `AGENTS.md`, the maintainer skill, and the
  `.claude` mirror.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closure complete | User decides commit or PR actions | Restore table Tab navigation for #5065 | Synchronized shortcut dispatch is the durable owner; propagation policy must survive the move | Fix, proof, changesets, barrels, clean P2 review, transparent issue comment, and protocol sync complete |

Open risks:
- No known #5065 behavior risk remains. The checkout already deletes
  `apps/www/src/registry/components/editor/plate-types.ts`; Browser proof required
  a temporary exact-HEAD restore, which was removed again to preserve that user change.
