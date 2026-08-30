# Regression Methodology

Load this reference whenever the `regression` skill runs.

## Contents

- [Outcome](#outcome)
- [Durable Authority](#durable-authority)
- [Start Contract](#start-contract)
- [Current Source And Proof-Host Readiness](#current-source-and-proof-host-readiness)
- [Atomic Executable Cases](#atomic-executable-cases)
- [Cumulative Reporter Evidence](#cumulative-reporter-evidence)
- [Reporter Oracle Matrix](#reporter-oracle-matrix)
- [Proof Selection](#proof-selection)
- [Probe Before Scale](#probe-before-scale)
- [Packet Lifecycle](#packet-lifecycle)
- [Failed-Fix Interrupt](#failed-fix-interrupt)
- [Proof Receipts And Affected Corpus](#proof-receipts-and-affected-corpus)
- [Corpus Work Without A Registry](#corpus-work-without-a-registry)
- [Master And Durable Children](#master-and-durable-children)
- [Canonical Autogoal Gates](#canonical-autogoal-gates)
- [Mandatory Methodology Delta](#mandatory-methodology-delta)
- [Honest Claims And Stops](#honest-claims-and-stops)

Regression is the durable supervisor. `patch` is the only one-case
implementation worker. Executable tests are the permanent behavior record.

## Outcome

```txt
current source and proof host ready
-> reporter-complete atomic executable case
-> smallest high-value probe
-> exact reproduction and classification
-> failing test on the violated invariant
-> one-case patch delegation
-> focused green proof
-> final proof receipt and conditional Browser/E2E proof
-> affected-corpus stability
-> keep, revert, quarantine, or failed-fix interrupt
-> methodology delta
-> next executable case or honest stop
```

No stage may borrow confidence from a later stage. A baseline is evidence, not
law. A green proxy does not prove the named route. A clean review does not prove
behavior. A plan table is coordination, not regression coverage.

## Durable Authority

Use one owner for each fact:

| Fact | Durable owner |
|---|---|
| Behavior that must not regress | Executable test and owning source |
| Issue origin and public status | GitHub issue/PR |
| Integration state | Exact pushed ref, CI, and fresh runtime replay |
| Current multi-step coordination | Active Autogoal plan |
| Methodology | Regression source rule and this reference |

Never create a sidecar TSV, JSON file, database, manifest, or manual case
registry. It duplicates tests and status, drifts, and makes “coverage” mean a
row exists instead of a behavior failing CI.

For dirty local proof, record the tested base ref and issue-owned file
fingerprints in the active plan or handoff. A Regression run is `completed`
when its final local source and every required executable, fresh-host,
stability, review, methodology, and plan gate pass. Commit and push are not
local completion gates. Exact pushed refs, CI, and integration replay own only
the broader integrated, shipped, released, and public-status claims.

## Start Contract

For non-trivial work, create or continue one Autogoal with
`docs/plans/templates/regression.md`. Record:

- target bug, surface, or corpus;
- selected executable test cases and source references;
- allowed owners and forbidden scope;
- exact ref or dirty-state boundary;
- route/proof host and freshness method;
- claim width, stability count, and stop rules.

Fill the semantic tables before implementation, then run:

```bash
node .agents/skills/regression/scripts/validate-regression-plan.mjs \
  docs/plans/<plan>.md
```

Before local completion, rerun with `--complete`. Autogoal's checker validates
plan closure mechanics; only the Regression validator checks this lane's
oracle, failed-fix, architecture, receipt, and affected-corpus semantics.

The goal plan is transient execution state. It may contain a compact case table
for the current run, but that table does not survive as another product
behavior database.

One ordinary bug should route directly to `patch`. Regression is for repeated
loops, corpora, harness work, or explicit self-improving methodology.

## Current Source And Proof-Host Readiness

Before a behavior claim:

1. Resolve the live source owner and current checkout ref.
2. Resolve the real executable test and runner from current source.
3. For route claims, identify the source-built host, route, process, port, and
   package export path.
4. Restart or rebuild when source, exports, fixtures, generated inputs, or host
   configuration changed. Never trust an unexplained existing server.
5. For dirty proof, capture fingerprints for every issue-owned production,
   fixture, test, harness, and host-input file in the plan or handoff.
6. For local completion, prove the final local source bytes on a fresh host and
   record the base ref plus dirty fingerprints when applicable. For integration,
   shipment, release, or public-status claims, use the exact pushed ref and its
   owning CI/runtime evidence.
7. If the real route cannot render without a stub, alias, bypass, or generated
   edit, keep the case blocked or quarantined and repair the proof host.

Generated output is never a convenient source owner. Fix source and run its
generator.

## Atomic Executable Cases

One case is one externally observable setup, action, and outcome. Record only
what another agent needs to run the test:

- stable case ID;
- issue, report, docs, recording, or source references;
- owning package/app and exact route/surface;
- setup, target, action, and expected final state;
- expected-outcome authority as `reporter: <source>`,
  `accepted-product-law: <source>`, `existing-contract: <source>`, or
  `upstream-contract: <source>`;
- red-test escalation as `unit-red: <test>` or
  `e2e-required: <why no exact unit/package RED is possible>`;
- executable test file and exact command;
- applicable model, DOM/native, pointer-feedback, focus, popup,
  geometry/paint, runtime-error, and follow-up-input fields;
- tested ref or dirty-state boundary;
- required retry-free stability.

The executable test must assert the user-visible invariant and the owning model
invariant when both matter. Test names should make the behavior discoverable;
include an issue ID when it materially improves provenance.

Every observed regression needs a permanent executable test. If no current
runner can express the exact claim, improve the runner/proof host or keep the
case blocked. Do not substitute screenshots, prose, a manual checklist, or a
registry row.

Start test selection with the smallest owner-level unit or package test that
can express the exact reported invariant. If it is RED, keep it as the only new
durable regression test and record `unit-red: <test>`. Do not add an E2E test or
expand E2E coverage for that case, and do not make E2E a completion gate. A
final Browser check may still verify the real route when repository policy
requires it, but manual Browser verification is not permanent E2E coverage.

E2E is the fallback regression layer. Use it only when the exact regression
cannot be reproduced RED in an owner-level unit or package test. Before adding
it, record `e2e-required: <specific lower-layer limitation>`. Existing E2E
tests may run as affected-corpus evidence, but their existence does not justify
creating or expanding E2E coverage for a unit-red case.

For keyboard, text-input, trigger, or semantic-command regressions, a passing
detached root-editor test cannot overrule a failing mounted Browser case. Treat
the package result as a proxy until the exact mounted runtime owner executes
the command. Before another product attempt, add or identify the smallest
executable mounted-owner diagnostic. Completion requires an applicable
`dom-native` Browser oracle whose result records `runtime-owner: pass`; editor
identity inferred from setup code or a detached root editor does not count. The
same result must record `mutation-owner: pass`: discovering a material command
is still proxy proof until the exact route shows that semantic mutation, rather
than direct DOM repair or native insertion, owned publication. After any failed
fix, the plan cannot resume product work until that Browser oracle records both
diagnostics, even while the behavior itself remains red. A constructed view
that never mounts in the reporter route cannot satisfy this gate.

Treat prior behavior, older releases, upstream Slate, and recordings as
evidence. Current accepted product/editor law decides the oracle.

A report that names only the bad state authorizes only that forbidden state.
It cannot select a positive replacement behavior. If multiple materially
different outcomes satisfy the negative report and no reporter or accepted
contract distinguishes them, mark the case `needs-oracle` and ask before
writing the product test or patch.

For Plite model-based, generated, or differential cases, the semantic oracle
is canonical `DocumentChange` plus `EditorCommit`. Assert final document state,
selection, commit metadata, error class, and follow-up usability. Primitive
Slate or Plate operation traces are diagnostic evidence unless current product
law explicitly preserves them.

## Cumulative Reporter Evidence

Build one temporary evidence inventory in the active plan before writing the
oracle. Read the original report, acceptance criteria, attached recordings or
screenshots, and every later reporter confirmation or contradiction relevant
to the current attempt.

Reporter follow-ups are deltas:

- a confirmed field stays required unless the reporter or accepted product law
  explicitly removes it;
- a residual field joins the still-applicable base acceptance instead of
  replacing it;
- a narrower green test cannot discard an original visual, transient, focus,
  selection, popup, error, or follow-up requirement;
- mark a claim superseded only with the exact source and reason.

For each required statement, record its source reference, interaction phase,
claim, oracle anchors, executable test anchor, and current result. Use phases
`setup`, `during-action`, `after-action`, `after-release`, and `follow-up`.
Held-pointer carets, drag marquees, drop cursors, open menus, and intermediate
paint must be observed during the action; a clean state after pointer release
does not prove they appeared or stayed absent at the required time.

For a reporter-visible rerender, render-storm, or repeated-component claim,
Benchmark owns timing and causal attribution, while Regression preserves the
route-wide reporter oracle. Capture an exact-route, phase-specific component
inventory before and during the named action. Count render or commit work by
component family and repeated visible unit. A wrapper-local Profiler, one
optimized component, or pointer latency alone remains a proxy and cannot close
the route-wide claim. Before completion, account for every family above 5% of
added work and at least 90% overall; keep the remainder open and named.

The inventory is transient coordination, not a durable registry. Executable
tests remain the permanent behavior authority.

Plain UI nouns describe the visible job, not one code label. For words such as
handle, toolbar, control, cursor, or button, search the current source and exact
route for every affordance that performs or advertises that job. Record
`reporter-noun: <plain noun>` and
`affordance-inventory: <accessible labels, selectors, or owners>` in the
applicable `pointer-feedback` positive assertion. The inventory includes
controls owned by different components when the reporter can reasonably see
them as the same thing. A named exclusion needs explicit reporter or
accepted-product authority. Never preserve an unlisted matching affordance by
silently translating the reporter's noun into the easiest implementation name.

## Reporter Oracle Matrix

Translate every required inventory row into the active plan before Patch
receives the case. For each case, fill one or more phase-specific rows for every
observation:

| Observation | Question |
|---|---|
| `model` | What editor state must exist, and what wrong state must not? |
| `dom-native` | What rendered/native selection, caret, clipboard, or DOM state must exist and must not coexist? |
| `pointer-feedback` | Which cursor and hover, active, tooltip, or drag affordance must appear or stay absent in the named pointer phase? |
| `focus` | Which element owns focus, and which owner is forbidden? |
| `popup` | Which toolbar, menu, overlay, or dialog is visible/hidden, including after release/close? |
| `geometry-paint` | What layout or painted pixels must match, and what stale/duplicate paint is forbidden? |
| `runtime-errors` | What error/overlay/console state is forbidden? |
| `follow-up-input` | What next edit proves the editor remains usable, and what corruption/lost selection is forbidden? |

Mark a row `yes` only with a phase, positive assertion, distinct forbidden
state, executable proof layer, `test: <path>#<title>` anchor, and result. Mark
it `no` only with a phase and an N/A reason in every proof cell. “Moved,”
“rendered,” or “did not crash” never implies selection shape, focus, popup
exclusion, paint, performance, transient gesture state, or follow-up usability.

Required evidence that names a caret, insertion point, caret-accessible line,
editable blank line/row, or text cursor must include oracle anchors for
`dom-native` and `focus` at that evidence phase plus
`follow-up-input@follow-up`; every named row must be applicable. The proof must
replay the reporter's real click, selection, or keyboard path in a native
browser, assert visible/native caret paint independently from model selection,
wrapper height, DOM markers, and block highlighting, then prove the next valid
edit still works. A zero-height spacer, a hidden selection anchor, a static
unselected screenshot, or geometry-only pixel classification is support-only.

Pointer, mouse, cursor, hover, and resize/drag-handle cases require an
applicable `pointer-feedback` row. Observe it during the held-pointer or hover
phase instead of inferring it from after-release state. Prove the computed or
native cursor and any relevant hover, active, tooltip, or drag affordance
separately from model selection, DOM selection, preview visibility, and action
dispatch. An ignored control that still advertises its action is a red case.
For completion, trace the actual pointer target, delivered event, and button
state in that same interaction. Record `interaction-trace: pass`,
`target: <target>`, `event: <event>`, and `buttons: <state>` in the row
result. A test that reaches the same cursor through `pointerenter` does not
cover a reporter path that delivers only held `pointermove`.

For continuous held-pointer behavior that leaves an editor, browser viewport,
window, scrollport, or owning boundary, record
`boundary-liveness: <event/last-coordinate source>` and
`release-cleanup: <mouseup/pointerup/dragend/blur stop law>`,
`scroll-owner: <stable acquired owner>`, and
`speed-law: <distance/phase to signed delta contract>`, and
`visible-scroll: <actual owner offset plus stable content geometry>` in the positive
assertion. The executable proof layer must exercise the actual boundary exit,
one transient missing DOM target or range, continued scheduling from the last
valid boundary coordinate, horizontal and vertical exit without owner
reselection, constant signed speed inside the named outside-speed region, and
actual owner offset and stable content geometry movement caused by the held
interaction rather than a programmatic scroll, plus the real release/blur
cleanup. Completion records
`boundary-exit-trace: pass`, `range-miss: continue`, `owner-lock: pass`,
`speed-consistency: pass`, `visible-scroll: pass`, and `release: stop`.
Selection expansion, a scroll method call, a synthetic `scrollTop` mutation, a
coordinate-only target/delta test, final scroll offset without an
interaction-owned before/during trace, or ordinary inside-editor drag is
support-only because each can pass while the live loop dies, changes owner,
changes speed, or never visibly moves at the boundary.

A flash, flicker, or one-frame pointer-feedback report needs a pre-handler
oracle. Read the target's cursor or other material state from a native target-
capture listener before component bubble handlers run, or use an equivalent
earlier browser anchor. Record `pre-handler-state: pass` in the row result.
Eventual computed style after the handler cannot certify a no-flash claim.

When the report names Chrome, Blink, a compositor, or browser-native behavior,
record `exact-chrome: <environment>` and use exact Chrome for the full final
replay. Playwright Chromium remains useful diagnosis but cannot certify that
claim. Pass the exact binary to `capture-proof-receipt.mjs` with
`--browser-executable`; the helper runs that binary's version command and
rejects a proof command that does not reference the same path. Confirm one
worker launch trace before counting stability. A requested channel, project
name, or handwritten host label is not executable attestation.

## Proof Selection

Choose the narrowest executable layer that proves the claim:

- package test for deterministic model, operation, normalization, history,
  schema, serialization, or plugin contracts;
- DOM test for projection/event ownership without a full route;
- Playwright or Browser harness for real-route selection, focus, clipboard,
  input, layout, DnD, paint, and runtime errors;
- exact Chrome when the report names Chrome or depends on native browser state;
- real device command/artifact for raw mobile or IME/device claims;
- multiple diagnostic layers when model and browser behavior can disagree, but
  only one new durable regression layer under the escalation rule above.

The order is mandatory: attempt exact unit/package RED first. A successful RED
ends new test creation. E2E requires a recorded lower-layer reproduction
limitation. Browser exploration or final route verification does not itself
authorize an E2E test.

Viewport emulation is not raw-device proof. Manual exploration may diagnose the
case but cannot replace its repeatable final test.

## Probe Before Scale

Run the smallest probe that can falsify the highest-value assumption:

- one exact test;
- one exact route readiness check;
- one gesture plus final-state assertion;
- one current-source import/export check.

If the probe exposes a wrong command, stale server, missing export, generated
drift, or broken host, repair that owner before adding cases.

## Packet Lifecycle

### Reproduce

Replay the exact setup, action, expected state, browser/device scope, and
follow-up input. Capture applicable model, DOM/native, pointer feedback, focus,
popup, geometry/paint, and runtime errors.

If the exact case does not fail, record `needs-repro` in the active plan. A
nearby route, direct model call, or synthetic proxy is not the same case.

### Classify

Name the violated invariant and durable owner before patching. Route public API
shape to `best-api`; broader Plite/Plate architecture goes through its layer
plan.

### Add Red Proof

Add or expose an executable failing test before the fix whenever practical.
The red and green commands must cover the same case and claim fields. If a
destructive external state prevents a safe red run, record the exact limitation
and improve the repeatable proof path before claiming fixed.

Try the owner-level unit/package runner first. Once it reproduces the exact
case RED, do not add an E2E test. Escalate to E2E only after recording why no
unit/package test can reproduce the reported invariant.

### Delegate One Case To Patch

Send one packet:

- case ID and source references;
- owner, route/surface, setup, action, and expected outcome;
- violated invariant and classification;
- executable test path and exact red result;
- allowed edit boundary and forbidden scope;
- required proof layers and stability count;
- expected return evidence.

Patch returns root cause, durable owner, changed files, exact red/green
commands, tested ref or dirty fingerprints, stability, architecture-pressure
verdict, review result, and residual caveat.

### Verify And Stabilize

Run the owning test first. For `unit-red:` cases, use Browser as final route
verification only when the repo or claim requires it; do not create an E2E
test. Run E2E only for `e2e-required:` cases or as affected-corpus replay when
an existing E2E already owns adjacent behavior.

Once a requested or started package, browser, root, or CI gate fails, add it to
`Gate failure closure` with the failure, classification, repair, and exact final
rerun. Completion requires `pass: <evidence>` from that same gate on the final
bytes. A failure called unrelated is still red; partial progress before it
cannot authorize completion.

Use repeated retry-free warm runs for flaky, native, lifecycle, compositor,
focus, selection, DnD, or device risks. Default to five. One failure keeps the
case open.

When a case first fails during stability after an exact green run, freeze the
product bytes and classify that failure before another implementation attempt.
Add the smallest executable diagnostic that identifies the failing phase and
separates product nondeterminism from interaction, host, or oracle drift. If
the reporter action was replaced by a programmatic shortcut, restore the real
interaction through the shared browser harness or prove the shortcut is
behaviorally equivalent. Repair invalid proof machinery and restart every
affected baseline and stability count.

Warm the attested browser and every local route once before the counted run.
If navigation, unrelated external networking, launcher selection, or browser
shutdown fails before the reporter assertion executes, classify it as a
proof-host failure. Revoke the run, record `repair-now`, repair the host, and
restart the full stability count on unchanged product bytes. Do not increment
the product attempt or trigger architecture escalation for behavior the runner
never exercised.

A compositor phase is not proved by callback names. Before another timing or
phase change, instrument the exact mutation boundary and record the material
state that should drive paint: relevant computed style, live range geometry,
model/DOM endpoints, and callback identity. If those values are already final
while the pixel oracle remains red, reject lifecycle ordering as the cause and
change strategy. A timer or later animation-frame callback may prove that code
ran; neither proves the intermediate state was painted.

A pixel classifier needs executable sentinels before it can judge product
behavior. Capture a known-correct single-layer state, a known-absent state, and
a known-invalid duplicate-layer state through the same screenshot path and
classifier. The single-layer state must classify as exactly one layer, the
absent state must produce none, and the duplicate state must be rejected. Width
or outer geometry alone cannot certify layer count. If any control fails, revoke
every green or red derived from that classifier, repair the proof helper, and
restart the affected baseline.

A completed applicable `geometry-paint` row names the actual pixel capture and
classifier in its proof layer. Its result records `positive-control: pass` and
`negative-control: pass` plus `duplicate-control: pass`. Computed style, DOM
state, callback order, selection text, and an unclassified screenshot remain
diagnostics and cannot close a visible-paint claim.

Nothing issue-owned may change after final replay. If commit, rebase,
generation, or push changes any proved bytes or runtime inputs, replay before
carrying the completed status to that new tree.

Generate the final receipt by running the exact proof command through:

```bash
node .agents/skills/regression/scripts/capture-proof-receipt.mjs \
  --case-id <case-id> \
  --attempt <number> \
  --claim completed \
  --input <production-or-test-path> \
  --host "none: <package-only reason>" \
  --retries 0 \
  -- <exact command and arguments>
```

For a managed route, replace `--host` with `--host-pid`, `--base-url`, and
`--browser`. Exact Chrome also requires `--browser-executable`, and the proof
command must use that path. Repeat `--case-id` for one combined corpus command and `--input`
for every production, test, fixture, harness, config, generated, or route-host
input that owns the claim. Paste the emitted Markdown rows into `Proof
receipts`. The helper records the ref, input digest/count, latest input mtime,
exact input paths, host process start, proof timestamps, retries, and a
tamper-evident receipt ID. Completion validation recomputes the digest from
those current paths. The helper refuses a failed command or inputs that change
during proof.

### Decide

- `keep`: executable red/green proof, fresh final replay, stability, durable
  ownership, and review pass.
- `revert`: remove the attempt and re-prove the prior executable behavior.
- `quarantine`: retain useful proof outside the runtime path without a
  completion claim.
- `defer`: name the owner, missing proof, and revisit trigger.
- `block`: name the missing authority/environment/evidence and why no safe
  move remains.

A kept case is `completed` locally when all applicable proof and plan gates
pass. A run is `completed` when every selected case has a terminal decision,
every required kept case is completed, no required runnable case remains, and
the canonical Autogoal gates pass. Commit and push are not local completion
gates.

Deferred, blocked, reverted, and quarantined selected cases do not become goal
success through prose.

## Failed-Fix Interrupt

A failed fix is not the expected red test. It is an attempted fix already
claimed `candidate-local`, `kept`, or `completed` that fails exact replay/final
verification, or a fresh reporter contradiction.

The reporter assertion must execute before a process failure becomes a product
failed-fix attempt. A pre-assertion proof-host failure still requires the
automatic `repair-now`, but it restarts the same product attempt after the host
repair.

Record one explicit failure kind: `reporter-contradiction`, `exact-replay`, or
`final-verification`. Every failed fix keeps a `base-acceptance` evidence row,
which may be required or explicitly superseded. Only a reporter contradiction
requires a required `latest-reporter-delta`; exact replay and final verification
failures have no reporter delta unless one actually exists.

An `exact-replay` or `final-verification` failure must record
`diagnostic: <unchanged-bytes phase/result>` in its resume state before another
Patch. Run the actual failing assertion on frozen product bytes and name
whether product nondeterminism, interaction delivery, host readiness, or oracle
sampling caused the red. Repeated green runs without a phase/result diagnostic
cannot resume product edits.

That event immediately interrupts product work:

1. Revoke the prior green, receipt, local completion, and public completion
   authority. Record the failure under `Failed fix history`; the public
   coordinator must correct stale comments or labels before another public
   claim.
2. Automatically run
   `regression repair <case-id>: <missed invariant or proof failure>`. Do not
   wait for the user and do not send another Patch packet first.
3. Change the smallest durable Regression source owner and add an executable
   workflow test that rejects the failed packet. A failed fix always records
   `repair-now`; `no-change` and `defer` cannot resume it.
4. Run focused workflow proof, `pnpm install`, source/generated parity, and
   agent-native review.
5. Rebuild the cumulative reporter evidence inventory and restart the reporter
   case from exact reproduction with attempt N+1. Every still-applicable base
   acceptance and latest delta needs a phase-specific executable oracle.
   Re-resolve the expected-outcome authority; an inferred target from the
   failed attempt cannot carry forward. The new proof receipt must use that
   attempt number; an old receipt cannot carry forward.

On attempt 2, or immediately when any architecture trigger applies, stop Patch
and run `best-api` plus `plite-plan`, `plate-plan`, or both:

- `cross-layer-compensation`;
- `duplicated-live-identity`;
- `per-node-hot-work`;
- `timer-focus-correctness`;
- `ui-repairs-substrate`;
- `second-failed-fix`.

The architecture row must record the accepted target and layer plan before a
new implementation attempt.

## Proof Receipts And Affected Corpus

The receipt proves one command ran against unchanged named inputs. It does not
become a permanent registry. Keep it only in the active plan/handoff.

Before changing a shared CSS selector, marker, class map, or style expansion,
search every current consumer and record the full affected corpus. Consumers
that deliberately neutralize or override the shared paint are mandatory rows,
including transparent, borderless, shadowless, and ringless wrappers. Give
each one a forbidden geometry/paint assertion for duplicate or inherited
paint. A positive oracle for the originally missing surface cannot authorize a
shared selector change by itself.

Map every changed owner to every selected case whose production, fixture,
harness, config, host, or behavior depends on it. After the last edit to that
owner, rerun those cases together when they share state or could invalidate one
another. Record the owner, affected case IDs, last edit time, combined command,
matching receipt input digest, and passing result under `Affected corpus
replay`.

Before the shared-owner edit, run each already-executable affected case and
record `pass: <evidence>` or `red: <evidence>` as its pre-edit baseline. Patch
cannot start with `pending`, N/A, or an inferred historical result. This keeps a
new cross-invariant failure attributable to the current attempt.

A separate green from before the final shared-owner edit is stale. A receipt
whose proof starts before the latest named input edit is invalid. A nonzero
retry count cannot certify stability.

Responsive geometry may intentionally settle through an animation frame,
resize observer, or asynchronous renderer commit. The proof must poll a named
final invariant within a bounded timeout before it captures final boxes. A
single immediate bounding-box read after resize is invalid because it cannot
distinguish a broken refresh from a correct refresh that has not committed.
Capture the pre-convergence and converged geometry in the smallest diagnostic,
then keep product bytes frozen until that classification is explicit.

## Corpus Work Without A Registry

Discover the current corpus from executable sources each run:

- runner test discovery/list output;
- scoped test filenames and test titles;
- live issues that do not yet have an executable case;
- current source owners and changed paths.

If the run needs ordering, keep a compact temporary plan table:

| Case | Test file/command | Status | Tested ref | Next owner |
|---|---|---|---|---|

Do not persist this table as a second registry. Once a case earns permanent
coverage, the test is the record. Live issues without tests remain issues until
selected; they do not need a duplicate row elsewhere.

## Master And Durable Children

When orchestrator mode is active, the master owns the plan, selection, and
final decision. A durable child owns one bounded case or read-only proof packet.

- Never run parallel writers against the same source, tests, plan, build,
  generated output, or managed host.
- Serialize cases sharing production files, fixtures, package builds, or route
  hosts.
- Parallelize read-only audits only when artifacts and hosts are disjoint.
- Reuse the same child for same-case follow-ups.

## Canonical Autogoal Gates

The runtime plan must use these headings:

- `Start Gates:`
- `Work Checklist:`
- `Completion Gates:`
- `Phase / pass table:`
- `Verification evidence:`
- `Reboot status:`
- `Open risks:`

Required runtime rows live in `Work Checklist` or `Completion Gates`.
Supporting case tables cannot close the plan. Run `check-complete.mjs` only
after every selected executable case passes its required red/green, fresh-host,
stability, review, methodology-delta, and started-gate rerun gates.

Run `validate-regression-plan.mjs --complete` first. A structurally complete
Autogoal plan with an incomplete reporter oracle is still an open Regression
run.

## Mandatory Methodology Delta

Every case ends with one:

1. `repair-now`: update and prove the owning rule, template, command, proof
   host, generator, or test helper.
2. `no-change`: cite why the current method handled the case cleanly.
3. `defer`: name the durable owner, deficiency, evidence, and revisit trigger.

Repair immediately when a case exposes wrong routing, irrelevant skill loading,
bad commands, stale servers, generated drift, missing proof layers,
false-green gates, noisy output, redundant broad checks, or shared-host
conflicts.

When a claimed fix itself failed, repair is automatic and must be `repair-now`
with executable workflow proof before another product attempt.

Do not optimize away the authoritative executable test.

## Honest Claims And Stops

Claim only what evidence proves:

- `reproduced`: exact current case is red;
- `candidate-local`: local changes make the exact executable case green;
- `kept`: Regression accepted the local patch after executable proof/review;
- `completed`: final local source, exact executable cases, fresh-host replay,
  stability, review, methodology, and canonical plan gates pass. State the
  local/uncommitted/unpushed scope when applicable;
- `integrated`, `shipped`, `released`, or public issue completion/labels`: only
  the coordinator or release owner may use these with their owning evidence
  and authority.

A fresh reporter contradiction invalidates every narrower green/completion
claim and receipt immediately. Never leave `completed` or a public completed
label authoritative while treating the contradiction as a separate optional
follow-up.

Stop a case when completed, reverted, quarantined, deferred with owner, or
blocked with no safe move. Complete the goal locally when every selected
executable case has a valid terminal decision, every kept case is completed,
no required runnable case remains, methodology deltas resolve, canonical
Autogoal gates pass, and the requested time/batch policy is satisfied.

Do not freeze one run's cases, refs, blockers, metrics, or conclusions into
reusable methodology.
