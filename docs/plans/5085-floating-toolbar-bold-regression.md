# floating toolbar bold regression

Objective:
Fix Plate #5085 at the Plite React focus boundary; done when the copied
registry `pointerdown` workaround is removed, the package contract is red/green,
and the exact real-pointer case passes five retry-free final runs.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5085-floating-toolbar-bold-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- browser

Regression source:
- target bug / surface / corpus: Plate #5085 and Felix's 2026-08-17 reporter
  retest `#issuecomment-5314465531`; selecting “Experience a modern” on
  `/blocks/playground` and clicking floating-toolbar Bold still clears the
  selection without applying bold
- lane and current source owner: `@platejs/plite-react` outside-focus lifecycle;
  main Plate uses the same `mousedown.preventDefault()` toolbar contract and
  works, while the new runtime observes the earlier `pointerdown` and releases
  editor-owned focus before the button click
- selected executable test cases: `floating-toolbar:bold-real-pointer` in the
  existing `tooling/e2e/floating-toolbar.test.ts`; preserve keyboard shortcut
  and fixed-toolbar Bold behavior as comparison fields
- tested ref or dirty-state boundary: package-candidate work over
  `HEAD == origin/next == 1fb72c581095f23ddba3f597f41e8b10608283ef`;
  prior registry-only proof is invalidated by the main-branch comparison and
  cannot satisfy closure
- route / proof host and freshness method: reporter route `/blocks/playground`
  from a newly started source-built `www` host; Browser real-pointer proof plus
  focused Playwright Chromium coverage; use exact Chrome if Browser cannot
  observe the native selection/focus topology
- invocation mode / timebox: one-shot execution; no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- The exact reporter case fails before the fix and passes after it: selecting
  “Experience a modern” with a real mouse and clicking the visible floating
  Bold button applies bold without losing the selected range.
- The durable browser test proves it targeted the floating toolbar, not the
  fixed toolbar or a hidden duplicate, and asserts mark state, DOM selection,
  focus owner, toolbar lifecycle, and zero runtime errors.
- Keyboard shortcut and fixed-toolbar Bold comparison behavior remain green.
- Final local source passes five retry-free runs on a fresh host.
- A package contract proves mouse controls that cancel `mousedown` do not
  trigger Plite's outside-focus release, while genuine outside pointer/focus
  behavior remains covered.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- All canonical Work Checklist and Completion Gates rows resolve and
  `check-complete.mjs` passes.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- P1 Autoreview: N/A by the user's standing instruction to stop Autoreview in
  this session
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5085-floating-toolbar-bold-regression.md`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Do not widen local proof into fixed/shipped/completed wording without final
  pushed/integration evidence.
- Do not run lint or Autoreview in this session.
- Felix's fresh retest invalidates the prior local verification and stale
  `completed` label. Do not reuse the old green test as proof until it fails on
  the reporter topology.
- Main Plate's working `mousedown`-only toolbar invalidates the registry-owner
  conclusion. Remove the copied `pointerdown` workaround and repair the package
  boundary instead.
- Keep #5085 open. A complete local packet gets one concise candidate-status
  comment; completed wording/label requires an exact pushed-ref replay.

Boundaries:
- allowed source owners: `packages/plite-react` outside-focus/selection
  lifecycle and its focused contracts; copied registry edits are limited to
  removing the superseded workaround
- allowed proof/test owners: `tooling/e2e/floating-toolbar.test.ts`, exact
  `/blocks/playground` fixture/host inputs, focused browser helper changes, and
  this goal plan
- generated/source boundary: registry source is authoritative; no generated
  registry/template output or route stub/alias/bypass counts as proof
- browser/device claim width: macOS desktop reporter workflow on the real
  `/blocks/playground` route; Playwright Chromium is durable support and Browser
  supplies real rendered pointer/selection evidence
- forbidden product/API/release/public mutations: no public API redesign,
  commit, push, PR, merge, release, issue close, or completed label; stale
  completed-label correction and one proof-backed local status comment are
  authorized by the user's standing issue-maintenance instructions
- orchestration mode and writer ownership: orchestrator inactive; this main
  thread is the sole source/test/plan/host writer

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap ordinary reads at 8,000 output tokens; exclude
  generated output, `node_modules`, `.next`, `.turbo`, logs, coverage, and broad
  registry trees unless they are the named source of truth.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: local candidate closure
- current executable case: `floating-toolbar:bold-real-pointer`
- current case status: kept as a verified local package candidate; prior
  registry candidate is rejected after the main-branch counterexample
- next owner: Maintainer for pushed-ref replay after commit/push authority
- goal status: complete locally; uncommitted and unpushed

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | One next Felix issue; Regression loop; exact reporter topology; durable executable coverage; five stable final runs; no lint; no Autoreview; honest local/pushed/public status |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before goal or product mutation |
| Active goal checked or created | yes | prior goal was complete; new goal created for #5085 and this plan |
| Current source owner and tested ref recorded | yes | `@platejs/plite-react` outside-focus lifecycle; `HEAD == origin/next == 1fb72c5` |
| Executable test cases discovered | yes | existing `tooling/e2e/floating-toolbar.test.ts`; selected `floating-toolbar:bold-real-pointer` |
| Route/proof-host readiness plan recorded | yes | fresh source-built `www` host on `/blocks/playground`; Browser plus focused Chromium, exact Chrome only if native topology requires it |
| Patch delegation boundary recorded | yes | exactly one floating-Bold case; smallest proven pointer/focus/mark owner; preserve fixed toolbar and shortcut behavior; five stable runs |
| Orchestrator writer ownership recorded | yes | orchestrator inactive; one source/test/plan/host writer |
| Output budget strategy recorded | yes | exact owners first, capped output, generated/build/noise paths excluded |
| Claim width and blocked rules recorded | yes | macOS desktop reporter workflow only; local proof is never fixed/completed; repair proof hosts before blocking |
| Browser pack selected | yes | visible pointer, selection, focus, toolbar lifecycle, and formatting require browser proof |
| Browser route / app surface identified | yes | `/blocks/playground`; select “Experience a modern”; visible floating Bold; formatting and expanded selection expected |
| Browser tool decision recorded | yes | Playwright for durable real-mouse coverage and stability; exact Chrome for native selection/focus topology |
| Console/network caveat policy recorded | yes | product runtime/console errors fail; unrelated extension/network noise must be named and isolated |
| Observable browser case captured | yes | `floating-toolbar:bold-real-pointer`; Plate #5085 and Felix `#issuecomment-5314465531`; route `/blocks/playground`; real mouse selection then visible floating Bold click; expected bold plus preserved expanded selection; actual selection clears and no bold; macOS desktop; bad ref `2938677d...`; current/final dirty refs and SHA-256 required |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, executable test path/command, tested ref, and
      required stability.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returns package root cause, durable owner, changed files, exact
      red/green commands, final ref/dirty fingerprints, stability,
      architecture verdict, P1 N/A, and caveat.
- [x] Focused package green proof and exact final fresh-host replay pass with
      the registry `pointerdown` workaround removed.
- [x] Required retry-free stability runs pass with no retry on the package fix.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | complete | Close every selected executable case and methodology row | Package and exact browser case kept; all required proof green |
| Current-source readiness | complete | Prove source owner and final tested ref/dirty boundary | `@platejs/plite-react` outside-focus lifecycle on dirty base `1fb72c5`; clean proof checkout matches issue-owned bytes |
| Route/proof-host readiness | complete | Prove the runner/host observes current source | Fresh source-built host on `localhost:3110` from clean proof checkout; route warmed before final ledger |
| Executable regression coverage | complete | Record exact package test red/green and browser red/green | Package outside-focus contract red before fix, 4/4 green after; exact Chrome red/green; Playwright 5/5 |
| Smallest-probe closure | complete | Record first package-level falsifying probe | Before fix, canceled `mousedown` still armed outside-focus settlement from earlier mouse `pointerdown`; after fix it arms neither settlement nor task |
| Patch delegation closure | complete | Read back one-case root-cause/red/green/proof evidence | Package owns mouse-vs-pointer dispatch; registry workaround removed; packet recorded below |
| Focused verification closure | complete | Run owning test and exact final-case replay | Package contract, full Plite React suite, package typecheck, Plite browser contracts, registry spec, www typecheck, Chromium, and Chrome green |
| Stability closure | complete | Record retry-free warm runs or evidence-backed N/A | Final Chromium 5/5 and Chrome 5/5, both behavior-retry-free |
| Packet decision closure | complete | Keep/revert/quarantine/defer/block every selected case honestly | Keep as `candidate-local` |
| No duplicate registry | complete | Prove no sidecar behavior manifest/database was created | Only executable tests and this transient plan |
| Generated/source and host repair | complete | Repair drift/host methodology or record blocked claim | Dirty shared host rejected; clean exact-ref host used |
| Orchestrator writer closure | complete | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | Orchestrator inactive; main thread sole issue writer |
| Workflow slowdown closure | complete | Repair avoidable slow/stale/noisy proof paths or defer with owner | Reads bounded; stale cache rejected; Chrome tabs serialized and cleaned |
| Methodology delta closure | complete | Resolve repair-now/no-change/defer for every case | Repair test input path now; skill doctrine already owns the rule, so no skill edit |
| Source/generated sync | complete | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | N/A: no agent source changed; clean proof install completed |
| Agent-native review | complete | Run for changed agent workflows or record N/A | N/A: no agent workflow changed |
| Final handoff contract | complete | Record tests, decisions, proof, sync, reviews, risks, and next owner | Recorded below; Maintainer owns local-only issue update |
| Autoreview | complete | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A by the user's explicit instruction to stop Autoreview |
| Goal plan complete | complete | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5085-floating-toolbar-bold-regression.md` | Fresh run after this evidence update passes |
| Browser interaction proof | complete | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser could not create the native range; exact Chrome completed the proof |
| Browser console/network check | complete | Record console/network state or why it is not applicable | Every final Chrome action and E2E click recorded zero new errors |
| Browser final proof artifact | complete | Record screenshot/trace/route/native proof or exact caveat | Exact Chrome DOM/native state plus rendered screenshot inspected on `/blocks/playground` |
| Exact case replay | complete | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact phrase, floating Bold, mark DOM, selection, focus, toolbar, pressed state all pass |
| Final ref and fingerprints | complete | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Dirty base `1fb72c5`; current/proof hashes match and are recorded below |
| Clean final runtime | complete | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Candidate-local only; clean base plus mirrored issue files, no fixed/completed claim |
| Retry-free stability | complete | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Final Chrome 5/5 and Chromium 5/5, no behavior retry |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | Regression/Maintainer/Autogoal plus Vision and live issue read; exact requirements materialized | source/host readiness |
| Current source and proof-host readiness | complete | clean `1fb72c5` checkout, fresh source-built Next host, matching current-file fingerprints | exact reproduction |
| Executable case discovery and selection | complete | existing floating-toolbar E2E plus one reporter-valid contradiction selected | smallest probe |
| Smallest high-value probe | complete | package contract failed before fix because mouse `pointerdown` preempted cancelable `mousedown` | reproduce/classify |
| Reproduce, classify, and red test | complete | exact Chrome real-pointer click failed on unguarded clean base; package contract red | patch delegation |
| One-case Patch delegation | complete | pointer/focus owner repaired in Plite React runtime; registry workaround removed | verification |
| Focused verification and stability | complete | package/full suites, browser contracts, Chromium 5/5, and Chrome 5/5 green | packet decision |
| Keep/revert/quarantine | complete | package fix kept; registry workaround reverted | methodology delta |
| Methodology repair/no-change/defer | complete | recorded main-branch counterexample and package-boundary probe requirement | review/handoff |
| Reviews and final handoff | complete | Autoreview N/A by explicit instruction; no API change | goal-plan check |
| Final goal-plan check | complete | fresh checker passes after package proof | public local-candidate correction |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| `floating-toolbar:bold-real-pointer` | Plate #5085; Felix `#issuecomment-5314465531` | `tooling/e2e/floating-toolbar.test.ts`; exact Chrome `/blocks/playground`; focused Chromium command below | `candidate-local`: exact red/green and stability complete | `dirty:1fb72c581095f23ddba3f597f41e8b10608283ef` | Maintainer public local-only update |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `floating-toolbar:bold-real-pointer` | `packages/plite-react/src/editable/runtime-root-lifecycle.ts`; registry button retains its main-compatible `mousedown.preventDefault()` contract | clean proof checkout `/private/tmp/plate-5085-proof.NBI6Wg/candidate`; final `localhost:3110/blocks/playground`; Playwright Chromium plus exact Chrome | `HEAD 1fb72c5`; current/proof issue-owned fingerprints match; final server started from proof checkout and route warmed | source files only; generated docs source is host setup, not product proof; no template edit or route bypass | ready and final |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| `floating-toolbar:bold-real-pointer` | exact Chrome with old package listener: selected text remains but `exactStrong=false`, `activeInEditor=false`, toolbar hidden; package test: canceled `mousedown` still leaves a pending outside-focus task | Plite React outside-focus lifecycle and focused package contract; registry change limited to deleting superseded pointer workaround; exact floating-toolbar E2E | package contract green; full package suite; typecheck; Plite outside-focus/browser comparisons; Chromium 5/5; Chrome 5/5 | root cause, hashes, commands, stability, and caveats recorded | kept |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| `floating-toolbar:bold-real-pointer` | exact Chrome clean host | 5 | runs 1-5: pass; selection text exact, expanded, both endpoints in editor, editor focused, exact `<strong>`, toolbar visible, pressed true, zero click errors | 0 | pass |
| `floating-toolbar:bold-real-pointer` | Playwright Chromium exact E2E, fresh warmed host `localhost:3110` | 5 | `5 passed (13.8s)` after all final issue-owned hashes matched | 0 | pass |
| fixed/shortcut comparisons | exact Chrome clean host | 1 each | both preserve exact selection/focus and render exact `<strong>`; zero action errors | 0 | pass |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| `floating-toolbar:bold-real-pointer` | unit red/green, exact Chrome red/green, Chromium 5/5, Chrome 5/5 | keep `candidate-local` | local uncommitted/unpushed only | requires pushed-ref replay before completed wording/label | Maintainer comment; issue stays open |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| `floating-toolbar:bold-real-pointer` | Existing E2E used vague non-empty selection, locator click, and obsolete `aria-checked`; first repair blamed the copied button even though main uses the same mouse guard | repair-now the executable test and owner-classification method; compare main package behavior before accepting a registry workaround | package focus-boundary contract, exact phrase range, real `page.mouse` click, native/model/focus/toolbar state, `aria-pressed` | package red/green plus final 5/5 | false-green test and wrong-owner diagnosis removed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Combined owner read | main thread | output budget exceeded once | three files read together | none | split bounded reads; resolved |
| Shared `www` host | concurrent linter session | first render stale, reload crashed | dirty `Set.toSorted` rewrite outside issue scope plus stale `.next` | invalid | moved to clean exact-ref checkout; resolved |
| Clean unit test | proof checkout | one missing-dist failure | fresh install had no package build artifacts | diagnostic | built dependency graph once; focused unit then passed |
| Chrome warm ledger | Chrome proof | readiness failed before behavior run after many temporary tabs | CDP overload, not product behavior | none | closed agent-created proof tabs and restarted a 5/5 ledger |
| Registry changelog check | concurrent linter migration | command failed before comparison | generator still invokes removed/migrating Biome formatter | changelog entry existence confirmed, parity not re-proven | deferred to linter migration owner; no changelog source changed |
| Final fingerprint script | main thread | one invalid result | zsh reserves `path`; using it as a loop variable cleared command lookup | none | renamed the variable, used absolute `/usr/bin/shasum`, found import-order-only drift, and mirrored it into the proof checkout |
| First final E2E replay | stale proof server | 1 pass, then 4 navigation aborts | orphaned Next process aborted `page.goto` before behavior ran | infrastructure-only | terminated exact stale process, started fresh port 3110, warmed route, then passed 5/5 |

Findings:
- Felix's 2026-08-17 exact manual retest correctly invalidated the prior local
  comment. The old E2E was false-green: it accepted any non-empty selection,
  used a locator click instead of a native coordinate click, and asserted the
  obsolete `aria-checked` attribute.
- #5085 is open with only the `bug` label and no assignee.
- The historical bad ref wrapped pressed mark buttons in a Radix toggle group;
  the rewrite removed that larger selection-loss owner. The remaining current
  failure is a package focus-boundary incompatibility: main Plate and the copied
  button both preserve focus by canceling `mousedown`, while Plite React listened
  to the earlier document `pointerdown` and scheduled focus release before that
  established cancellation point.
- On the clean unguarded base, an explicit left Chrome click preserved the DOM
  range text but moved active focus outside the editor, closed the toolbar, and
  rendered no `<strong>`. This rules out the initial click-parameter confound.
- The durable package fix ignores mouse `pointerdown`, evaluates the later
  cancelable `mousedown`, and retains `pointerdown` for pen/touch. A keyed
  scheduler task deduplicates compatibility mouse events after pen/touch.
- The registry `pointerdown` workaround is removed. Its normal
  `mousedown.preventDefault()` contract is sufficient again, matching main.
- The prior `read.isActive()` change controls pressed-state reads; it was not
  the selection-loss cause.

Timeline:
- 2026-08-19: selected the next chronological open Felix report after #5070,
  accepted the reporter contradiction, loaded Regression/Maintainer/Autogoal
  and Vision doctrine, created the goal/plan, and captured the exact case before
  product mutation.
- 2026-08-19: rejected a stale/dirty shared host, reproduced the exact failure
  on a clean `1fb72c5` host, rejected the registry workaround after comparing
  main, and added a red Plite React focus-boundary contract.
- 2026-08-19: repaired mouse/pen/touch dispatch in Plite React, removed the
  registry workaround, passed package/type/browser proof, matched current and
  clean-proof fingerprints, and completed final Chromium/Chrome stability.
- 2026-08-19: removed the stale `completed` label, posted the verified-local
  registry-candidate comment, and confirmed #5085 remains open with only `bug`;
  a package-owner correction is required at final handoff.

Decisions and tradeoffs:
- Fix the outside-focus boundary in Plite React. Requiring every external mouse
  control to add a new pointer guard would silently break the established Plate
  integration contract and repeat across consumers.
- Split by input type: mouse waits for cancelable `mousedown`; pen/touch stays
  on `pointerdown`. This preserves non-mouse coverage without preempting mouse
  controls.
- Deduplicate pen/touch compatibility mouse events at the scheduler key. This
  avoids redundant release tasks without adding public API or component rules.
- No public API changes. `best-api` repair and changeset are N/A: the change is
  internal behavior, and `@platejs/plite-react` does not exist on `origin/main`.

Review fixes:
- Autoreview intentionally not run by the user's standing instruction.
- Architecture pressure verdict: keep the package fix and delete the registry
  workaround. The package restores an existing native event contract across all
  consumers with no API or compatibility layer.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined E2E/owner source read exceeded the context output budget | 1 | Read each exact owner file separately with bounded output | Resolved |
| Shared host served stale cache, then crashed on concurrent invalid `Set.toSorted` edit | 1 | Start clean detached exact-ref proof checkout | Resolved; no concurrent files touched |
| Fresh proof checkout unit lacked package build artifacts | 1 | Build dependency graph once, then rerun focused unit | Resolved |
| Initial Chrome 5-run loop hit CDP readiness before a behavior action | 2 | Close agent-created temporary tabs and restart only after readiness | Resolved; conclusive ledger 5/5 |
| Registry changelog `--check` invoked unavailable/migrating Biome formatter | 1 | Preserve existing correct entry and defer parity command to linter migration owner | Unrelated blocker recorded; no source/generated changelog change |
| Fingerprint loop used zsh-reserved `path` and produced bogus command failures | 1 | Use `file_path` and absolute `/usr/bin/shasum` | Resolved; only import order differed, then final hashes matched |
| Orphaned Next server aborted four `page.goto` calls after one pass | 1 | Kill exact proof-server PIDs, start port 3110, warm `/blocks/playground`, rerun | Resolved; fresh final ledger 5/5 |

Verification evidence:
- Base/ref: `HEAD == origin/next == 1fb72c581095f23ddba3f597f41e8b10608283ef`.
- Exact browser red, Chrome, clean base with old package boundary and no
  registry `onPointerDown`, explicit left click:
  selection text `Experience a modern`, expanded and inside editor, but
  `activeInEditor=false`, `exactStrong=false`, floating toolbar hidden.
- Smallest package red: before the package fix,
  `pnpm --filter @platejs/plite-react exec vitest run --config
  ./vitest.config.mjs test/runtime-root-lifecycle-contract.test.ts` failed the
  canceled-mousedown case because the earlier mouse `pointerdown` set a positive
  settle deadline and scheduled a release task.
- Focused package green: the same command passes 4/4 in both the current and
  clean proof checkout after final fingerprints matched.
- Full package green in the clean proof checkout: 74 files and 1052 tests.
- Package typecheck: `pnpm turbo typecheck --filter=./packages/plite-react`
  passes 5/5 tasks in both current and clean proof trees.
- Registry control contract: `bun test
  apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx` passes
  9 tests / 33 expectations with only `mousedown` cancellation.
- `www` typecheck: after `pnpm --filter www build:source`, `pnpm --filter www
  exec tsc --noEmit -p tsconfig.json` passes in the clean proof checkout.
- Plite development lane: affected typechecks and all Plite package suites pass;
  Node-22 browser smoke passes 3/3. Focused rich-text focus/toolbar cases pass
  3/3 and the read-only outside-focus case passes 1/1.
- Durable browser: `PLAYWRIGHT_BASE_URL=http://localhost:3110 fnm exec
  --using=v22 pnpm exec
  playwright test tooling/e2e/floating-toolbar.test.ts --config
  tooling/config/playwright.config.ts --project=chromium --workers=1
  --repeat-each=5` passes 5/5 in 13.8s after the final hashes matched. The route
  was warmed once before the ledger; behavior retries were zero.
- Exact Chrome: five fresh tabs pass 5/5 with the exact phrase and visible
  floating Bold; selection stays expanded, both endpoints and active focus stay
  in the editor, exact `<strong>` renders, toolbar stays visible,
  `aria-pressed=true`, and every click records zero errors.
- Exact Chrome comparisons: `Meta+B` and fixed-toolbar Bold both preserve the
  exact range/focus and render exact `<strong>` with zero action errors.
- Final SHA-256, identical in current checkout and clean proof checkout:
  - `runtime-root-lifecycle.ts`: `451544e8dbab376b9dea4ef36f6f082fb4edb54413f6acd88713b1fcdf741446`
  - `runtime-root-lifecycle-contract.test.ts`: `87404c3edb9719f57d5c567cad24b0a1b0a79896442c0b28a62e1370a6e67722`
  - `mark-toolbar-button.tsx`: `2faa1e0ecd96bccf2dedc722a782b7fc19ed825ebc5d1e4faa3817b1682c416a`
  - `mark-toolbar-button.spec.tsx`: `3f45aa538b5afd1e5573d806bf19222ea3def7338cbe28147d01ff8a2b36e261`
  - `floating-toolbar.test.ts`: `236d362b2631073f9c64ce2851a5b5c327402b7d084b0aaa960738778e792f5c`
  - `playground-value.tsx`: `4c86662834d31b57de45075134e02808e5b717e29781ab199e997888104cf32a`
  - `floating-toolbar.tsx`: `995c38236d837c006526c9cc11dd0d6c3e85ccad7d14df93a46004528a88f8f0`
  - `toolbar.tsx`: `6f9a76a6730157eb6a0e4ec6524d1a2babff464bee1579821dd94a8e61d23139`
  - `playwright.config.ts`: `383d6fd0f19d0db91db1b2095d51e35246d487f77fc79de83aa13943344ff544`
- Public readback before the final correction: #5085 is open with only `bug`;
  the earlier local registry-candidate comment is
  `https://github.com/udecode/plate/issues/5085#issuecomment-5345138546` and is
  superseded by the package-owner correction at
  `https://github.com/udecode/plate/issues/5085#issuecomment-5346478390`.
- Goal plan: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/5085-floating-toolbar-bold-regression.md` reports
  `[autogoal] complete` after all evidence is recorded.

Final handoff:
- executable cases: one kept `floating-toolbar:bold-real-pointer` case
- changed files: issue changes are the Plite React runtime lifecycle and new
  package contract, registry button spec, exact floating-toolbar E2E, and this
  plan. The registry production workaround is gone. Concurrent import ordering
  from the linter migration was preserved and mirrored in proof.
- design decisions: handle mouse outside-focus on cancelable `mousedown`, keep
  pen/touch on `pointerdown`, deduplicate compatibility events, retain the
  accessible button `onClick`, and add no public API.
- tests and proof: package red/green 4/4, full Plite React 1052, package and www
  TypeScript, Plite browser contracts, Chromium 5/5, Chrome 5/5, fixed-toolbar
  and shortcut comparisons; exact hashes above.
- source/generated sync: no agent sources or generated registry output changed;
  no registry production change remains. Changeset is N/A because the private-
  beta Plite React package is absent from `origin/main`.
- P1 and agent-native findings: both N/A by explicit session scope and no agent
  workflow change
- residual risks and next owner: local/uncommitted/unpushed candidate only;
  replay on the final pushed ref before fixed/completed wording or label;
  Maintainer posted the package-owner correction, left #5085 open, and kept
  only `bug`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | local package candidate closure and honest public handoff for #5085 |
| Where am I going? | plan checker, package-owner correction comment, goal completion |
| What is the goal? | make floating Bold apply formatting without losing the reporter's selection |
| What have I learned? | Plite React preempted Plate's established mouse cancellation point; neither mark active-state reads nor the copied button owned the failure |
| What have I done? | reproduced exact Chrome and package reds, repaired Plite React, removed the registry workaround, and passed matching-byte package/type/Chromium/Chrome proof |

Open risks:
- The candidate is not committed or pushed. Any rebase, formatter change,
  generated rewrite, commit, or push invalidates the public fixed claim until
  the exact final-ref replay repeats.
- The full Plite React suite is authoritative from the clean proof checkout. A
  separate concurrent shared-tree schema edit makes one unrelated block-void
  row fail only in the dirty current checkout; the focused issue contract is
  green in both trees.
