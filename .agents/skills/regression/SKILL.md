---
description: Test-first Plate/Plite regression methodology for reporter-complete oracles, exact reproduction, one-case Patch delegation, proof receipts, corpus replay, failed-fix interruption, and automatic workflow repair.
argument-hint: '[repair <expectation> | <bug|surface|corpus>] [full-loop | timed 1h|2h|overnight | batch-loop]'
disable-model-invocation: true
name: regression
metadata:
  skiller:
    source: .agents/rules/regression.mdc
---

# Regression

Handle $ARGUMENTS.

Read [methodology.md](./references/methodology.md) completely before creating a
goal, test, or child task.

Regression owns a self-improving test-first loop:

```txt
source and proof host ready -> reporter oracle -> smallest falsifying probe
-> exact reproduction -> failing executable test -> one-case patch
-> focused green -> final receipt -> conditional Browser/E2E proof
-> affected-corpus stability
-> keep/revert/quarantine or failed-fix interrupt
-> methodology delta -> next executable case or honest stop
```

`auto regression ...` routes here. Auto does not retain a second regression
method. `patch` remains the only one-case implementation worker.

## Use When

- The user invokes `regression` or `auto regression`.
- The user asks for a regression harness, rewrite closure, corpus replay,
  example/story coverage, or a repeatable reproduce-test-fix-verify loop.
- Several bugs or behaviors need one resumable test-first execution plan.
- A report may expose a runtime bug, missing oracle, broken proof host, stale
  generated input, bad command, or weak methodology.
- The workflow must improve itself after each case instead of preserving a
  frozen checklist.

## Do Not Use When

- One ordinary local behavior bug needs a direct repair: use `patch`.
- Public issue/PR/security queue state is the target: use `maintainer` or the
  public coordinator.
- Work is already applied and needs until-clean closure: use `autoclosure`.
- Public API or runtime architecture is unresolved: use `best-api`,
  `plite-plan`, or `plate-plan` before implementation.
- A performance regression, benchmark comparison, or timing root-cause loop is
  the target: use `benchmark`. Regression may supply the correctness oracle.
- Broad non-regression quality/docs supervision is requested: use `auto`.

## Authority

- Executable tests own durable regression behavior.
- GitHub issues and source references own provenance and public status.
- Exact refs, clean hosts, and CI/runtime receipts own integration claims.
- Regression owns case selection, current-source readiness, proof width,
  serialization of Patch work, stability, packet decisions, claim width, and
  methodology deltas. Its semantic validator, not Autogoal's structural
  checker, owns Regression completion semantics.
- The goal plan is transient coordination for non-trivial runs. It is not a
  second behavior database.
- Patch owns exactly one normalized local repair at a time.
- Package/runtime owners remain authoritative for implementation.
- Current checkout source outranks old plans, baselines, recordings, generated
  output, and prior results.
- Local completion is Regression workflow state, not integration or public
  issue state. A fully verified run is `completed` even when uncommitted or
  unpushed.
- No public mutation, commit, push, PR, release, or generated-output edit is
  authorized unless the user separately asks.

## Hard-Cut State Rule

Never create or maintain a sidecar TSV, JSON, database, manifest, or manual
case registry for Regression.

- One completed regression must have an executable test that fails on the
  violated invariant and passes after the fix.
- A corpus is discovered from executable tests, current source, and live issue
  provenance. If coordination is needed, keep a compact temporary case table
  in the active goal plan with case ID, test path, status, tested ref, and next
  owner.
- Do not copy test assertions, source fingerprints, issue status, or proof
  output into another permanent store.
- If the exact behavior cannot be expressed by a repeatable test or proof
  command, improve the proof host or keep the claim blocked. A manual registry
  is not substitute evidence.

## Goal And Durable State

Use Autogoal for non-trivial runs with
`docs/plans/templates/regression.md`:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template regression \
  --title "<surface or corpus> regression"
```

Every required runtime condition belongs in canonical `Work Checklist` or
`Completion Gates` rows. Supporting case tables coordinate work only and
never replace tests or completion gates.

Run the Regression semantic validator after filling the selected cases and
again with `--complete` before local completion:

```bash
node .agents/skills/regression/scripts/validate-regression-plan.mjs \
  docs/plans/<plan>.md
node .agents/skills/regression/scripts/validate-regression-plan.mjs \
  docs/plans/<plan>.md --complete
```

`check-complete.mjs` remains the generic structural gate. It cannot substitute
for this semantic gate.

## Workflow

### 1. Ground Current Truth

Resolve the live source owner, exact ref or dirty-state boundary, executable
test entrypoint, route/proof host, package export/build path, generated/source
boundary, and freshness method. Prove the host observes current source before
testing behavior.

Repair command shape, stale server, missing export, generated drift, or host
readiness before scaling cases.

### 2. Define Atomic Executable Cases

One case is one observable setup, action, and outcome. Record in the active
plan or Patch packet:

- stable case ID and source issue/reference;
- owner, route/surface, setup, action, expected outcome, and the exact authority
  for that positive outcome;
- executable test path and exact command;
- red-test escalation as `unit-red: <test>` or
  `e2e-required: <why no exact unit/package RED is possible>`;
- applicable model, DOM/native, pointer-feedback, focus, popup,
  geometry/paint, runtime-error, and follow-up-input fields;
- tested ref, dirty-state boundary when applicable, and required stability.

Before patching, build the template's cumulative reporter evidence inventory
from the issue body or original report, its acceptance criteria and recordings,
and every later reporter confirmation or contradiction. A later reply is a
delta, not a replacement oracle. Keep every earlier still-applicable claim
required; mark one superseded only with the reporter or current product law
that removed it. Map every required evidence row to an executable oracle.

When a reporter names rerendering, a render storm, or repeated component work,
performance diagnosis stays with Benchmark, but the reporter oracle must keep
the route-wide symptom. Before any route-wide green or completion claim,
capture an exact-route, phase-specific repeated-component inventory. Count
component families and repeated visible units before and during the named
action. A wrapper-local Profiler, one optimized component, or pointer latency
alone is a proxy and cannot close the claim. The Benchmark packet must account
for every family above 5% of added render or commit work and at least 90%
overall; unattributed work stays open.

A negative report only authorizes the forbidden state. It does not choose among
multiple positive outcomes that avoid that state. Record one
`Expected-outcome authority` for every selected case as `reporter: <source>`,
`accepted-product-law: <source>`, `existing-contract: <source>`, or
`upstream-contract: <source>`. If two materially different outcomes satisfy the
report and no authority distinguishes them, keep the case `needs-oracle` and
ask the reporter before writing the product test or patch.

Treat a reporter's plain UI noun as a user job, not as one implementation
label. Before narrowing words such as handle, toolbar, control, cursor, or
button, inventory every currently rendered affordance that performs or
advertises that job from source and the exact route. An applicable
`pointer-feedback` row records both `reporter-noun: <plain noun>` and
`affordance-inventory: <accessible labels, selectors, or owners>` in its
positive assertion. Exclude one only with explicit reporter or accepted-product
authority. A green oracle that preserves an uninventoried matching affordance
is invalid.

Then expand every case into the reporter oracle matrix. For model, DOM/native
state, pointer feedback, focus, popup/toolbar, geometry/paint, runtime errors,
and follow-up input, mark the observation applicable or give an N/A reason.
Record the interaction phase for every row: setup, during-action, after-action,
after-release, or follow-up. One final-state assertion cannot prove a transient
held-pointer, drag-overlay, caret, popup, pointer affordance, or paint claim.
Every applicable row needs both the positive assertion that must hold and the
forbidden state that must not survive, plus an executable test anchor. Do not
reduce a reporter sentence to the easiest neighboring assertion.

Pointer, mouse, cursor, hover, and resize/drag-handle cases require an
applicable `pointer-feedback` row in the named interaction phase. Assert the
cursor and relevant hover, active, tooltip, or drag affordance independently
from model state, DOM selection, preview state, and the eventual action. A
control can be semantically ignored while still advertising the wrong action.
Completion also proves the event path that produced the pointer feedback. The
row result records `interaction-trace: pass`, the actual `target:`, delivered
`event:`, and `buttons:` state. A computed cursor assertion reached through
a different boundary event does not prove the reporter's held-pointer path.
For a continuous held-pointer behavior that leaves an editor, browser viewport,
window, scrollport, or owning boundary, the same row must also record
`boundary-liveness: <event/last-coordinate source>` and
`release-cleanup: <mouseup/pointerup/dragend/blur stop law>`,
`scroll-owner: <stable acquired owner>`, and
`speed-law: <distance/phase to signed delta contract>`, and
`visible-scroll: <actual owner offset plus stable content geometry>`. Its executable
proof layer must exercise the boundary exit, one transient missing DOM target
or range, continued scheduling from the last valid boundary coordinate,
horizontal and vertical exit without owner reselection, constant signed speed
inside the named outside-speed region, actual owner offset and content geometry
movement caused by the held interaction rather than a programmatic scroll, and
the real release/blur cleanup.
Completion records `boundary-exit-trace: pass`, `range-miss: continue`,
`owner-lock: pass`, `speed-consistency: pass`, `visible-scroll: pass`, and
`release: stop`. Selection expansion, a scroll method call, a synthetic
`scrollTop` mutation, a coordinate-only target/delta test, final scroll offset
without an interaction-owned before/during trace, or ordinary
inside-editor drag cannot close this claim because each can pass while the live
loop dies, changes owner, changes speed, or never visibly moves at the boundary.
When the report names a flash, flicker, or wrong cursor for one frame, the
correct state must exist before the target component processes the event. Use
a target-capture or equivalent pre-handler oracle and record
`pre-handler-state: pass`. A post-handler computed-style assertion is red for
that claim even when the eventual cursor is correct.

A reporter click cannot be reproduced by a drag surrogate unless the same
browser gesture records a delivered click event. A drag surrogate without that
delivered click cannot authorize a product patch for the click report.

When a reporter says the first click only focuses an editable surface and a
second click performs the action, replay the first gesture from the reporter's
actual initial focus/selection state. Record that concrete state in both the
required reporter evidence and focus oracle as
`initial-focus: <concrete reporter state>`, then record the same gesture as
`event-order: <actual pointerdown/mousedown/(focus when emitted)/click trace>`
and assert `first-click-popup: open` immediately after that click.
`outside-editor` is valid only when the reporter evidence says so. A test that
invents another focus precondition, calls `fireEvent.click` alone, or checks
only eventual animation/style cannot certify single-click behavior.

When a fresh focus-first contradiction survives while an existing component
test stays green, audit the popup mock before another product attempt. The
owning trigger must also pass against a passive popup wrapper that only reflects
the component's `open` input and does not inject a click toggle. Record
`component-open-owner: pass`. A wrapper mock that opens on behalf of the trigger
is proxy evidence and cannot authorize completion.

When reporter video identifies concrete text and control hit targets after a
locator-click or programmatically seeded selection stayed green, record
`physical-hit-path: <first target -> action target>`. Replay both gestures from
live layout coordinates through the browser mouse. The first gesture must create
the native selection; direct Range/selection mutation is proxy evidence. The
DOM oracle records `physical-hit-target: <actual target>` and the focus oracle
records `selection-origin: physical-pointer`. Completion requires
`physical-hit-target: pass`, `click-delivery: pass`, and
`selection-origin: pass`. `locator.click()`, element-dispatched click, or a
programmatically created caret cannot authorize another completion for that
contradicted path.

When reporter video visibly identifies a browser family, profile, extension,
or browser-owned overlay, treat that visible state as part of the exact
environment even when the reporter does not name it in prose. Record
`reporter-profile: <browser family and visible profile/extension state>` in
required reporter evidence and the selected case's Exact environment. An
in-app browser, clean profile, different browser binding, or exact browser
binary without that reporter profile is support-only. Applicable DOM/native,
focus, and popup proof must replay the physical path in the reporter profile
and record `reporter-profile-replay: pass`; the final receipt host records the
same `reporter-profile:` identity. When only tool-native profile or OS state
can replay the reporter path, the final executable receipt still binds the
final bytes and exact browser binary, Exact environment records
`tool-proof: computer-use`, and every applicable profile oracle names
Computer Use plus `reporter-profile-replay: pass`. If neither a profile-bound
receipt nor that explicit tool-native proof exists, block product completion
instead of carrying a clean-profile green. Recompute and verify the live physical target after every scroll,
selection, focus, layout, or overlay-state change; a hit assertion from stale
coordinates cannot isolate an external interceptor or authorize completion.

When editor capture routing branches on DOM attributes from the target or an
ancestor, record `capture-routing-path: <target -> capture owner>`. Inventory
the target-to-owner chain and the exact attributes read at each branch. The
DOM/native oracle records `interaction-owner-chain: <nodes>` and
`capture-routing-contract: <owner attributes>`. Completion requires
`interaction-owner-chain: pass` and `capture-routing-contract: pass`. Proving
an attribute on a child is invalid when the capture handler reads it from the
void/editor ancestor.

When the reporter's live tab stays red while the isolated exact-host case is
green, inventory active dev overlays and document/window capture listeners
before another product patch. Record
`interaction-interceptor-path: <global capture owner -> target>` and
`external-interceptor-state: <active mode/settings>`. If an external owner
intentionally calls `preventDefault` or `stopPropagation` for the gesture, the
product case cannot be repaired by compensating inside the target component.
Completion records `external-interceptor-isolated: pass` after the interceptor
is deactivated or configured to allow the interaction.

Any popup or toolbar lifecycle asserted after an action or release requires an
applicable `follow-up-input@follow-up` oracle. Proving that an overlay closed is
not enough; the next interaction on the owning surface must still work.

For every applicable popup close row at `after-action` or `after-release`, the
matrix must also account for `dom-native` and `focus` at that same phase. Mark
them applicable with exact selection/caret and focus assertions, or explicitly
N/A with a reason. A later follow-up action cannot prove that close preserved
the live pointer-created selection or caret.

Any required reporter evidence that names a caret, insertion point,
caret-accessible line, editable blank line/row, or text cursor must map to
applicable `dom-native` and `focus` rows at the same phase plus an applicable
`follow-up-input@follow-up` row. Replay the reporter's real click, selection, or
keyboard path in a browser-native proof layer. Assert the native caret paint
independently from wrapper height, DOM markers, model selection, and block
highlighting, then prove the next valid edit still works. A zero-height spacer,
selection-capable hidden text node, static screenshot without the selection
phase, or geometry-only pixel classifier cannot close a caret-visible claim.

Any required positive authority/reference evidence that names layout, width,
size, centering/alignment, position, spacing, compression, or a full row must
map to `geometry-paint` at the same phase. That oracle's positive assertion
records `reference-geometry: <material bounds/relationship>`, its browser or
exact-Chrome proof layer names executable `layout-bounds`, and completion
records `layout-bounds: pass`. A negative-only absence check, caret classifier,
wrapper-height assertion, or unclassified screenshot cannot prove that the
visible content still matches the supplied positive layout reference.

Every observed regression needs permanent executable coverage at the layer
that can prove the claim. Prefer an existing test file and runner over a new
harness.

Test escalation is strict. Start with the smallest owner-level unit or package
test that can express the reported invariant. When an exact owner-level unit or
package test is RED, that test owns the durable regression. Do not add a new E2E
test, expand E2E coverage for the case, or make E2E a completion gate. Record
`unit-red: <test>` in `Red-test escalation` and stop test creation at that layer.

E2E is the fallback only when the exact regression cannot be reproduced RED in
an owner-level unit or package test. Record
`e2e-required: <specific lower-layer limitation>` before creating the E2E test.
Repository-required Browser verification may still inspect the final route,
focus, selection, DOM, and errors, but that verification is evidence, not a
second permanent regression test. Existing E2E tests remain affected-corpus
inputs; their existence does not authorize new E2E coverage.

For keyboard, text-input, trigger, or semantic-command regressions, a detached
root-editor test is a proxy when the mounted Browser case disagrees. Before
another product attempt, prove the command on the exact mounted runtime owner.
The applicable `dom-native` Browser oracle must record `runtime-owner: pass`
and `mutation-owner: pass`; command discovery alone does not prove that the
mounted route published the semantic mutation before DOM repair or native
input. A root editor cannot substitute for the mounted owner. After any failed
fix, both proofs are required before resumption, not only at completion. A
constructed view that never mounts in the reporter route is still a proxy.

For Plite model-based, generated, or differential cases, use canonical
`DocumentChange` plus `EditorCommit` laws as the semantic oracle. Compare final
document state, selection, commit metadata, error class, and follow-up
usability. Do not require primitive operation-trace parity with Slate or Plate
unless current product law explicitly preserves that trace.

### 3. Probe Before Scale

Run the smallest test or route action that can falsify the highest-value
assumption. When the runner, source path, or host is wrong, repair it before
adding cases.

### 4. Reproduce And Delegate

Replay the exact case. A proxy remains labeled proxy. If the case is red,
delegate one normalized packet to `patch` with the violated invariant,
owner, exact red evidence, edit boundary, forbidden scope, proof layers,
stability count, and expected return fields.

Do not run concurrent writers on the same owner, plan, build output, test
fixture, or route host.

### 5. Verify And Decide

Read back Patch evidence. Run the owning executable test first. If the case is
`unit-red:`, stop durable test escalation there and use Browser only when the
repo or final claim requires route verification. Run an E2E replay only for an
`e2e-required:` case or an already-existing affected E2E test.

Once a requested or started package, browser, root, or CI gate fails, record it
under `Gate failure closure`. A completed run must repair or classify the
failure and rerun that exact gate on the final bytes. Never dismiss a red gate
as unrelated and use partial progress from that run as completion evidence.

Use retry-free warm repetitions for native input, lifecycle, selection, focus,
DnD, compositor, flaky, or device risks. Default to five when those risks
apply. One failure keeps the case open.

Each required stability repetition must execute the proof command. Cached result
reuse does not count toward the run total; force fresh execution or disable the
cache before recording stability.

When geometry intentionally settles through an animation frame, resize
observer, or asynchronous renderer commit, wait for the named invariant with a
bounded convergence poll before sampling final boxes. One immediate bounding
box read after resize is invalid proof. Record both pre-convergence and
converged geometry so a failed run distinguishes product non-convergence from
an early proof read.

If the first failure appears only during stability after an exact green run,
freeze product bytes. Before another implementation attempt, add the smallest
executable diagnostic that names the failing phase and distinguishes product
nondeterminism from interaction, host, or oracle drift. Repair invalid proof
machinery and restart baselines; do not tune product code against an unproved
gesture or sampling path.

For exact Chrome, a requested channel, project name, or handwritten host label
is not browser proof. Attest the executable and version, verify the worker
launches that exact path, and warm the local route/browser before counted
stability. A navigation, unrelated-network, launcher, or browser-shutdown
failure before the reporter assertion is a proof-host failure: revoke the run,
record `repair-now`, repair the host, and restart the full count without
changing product bytes. It does not increment the product-attempt number
because the claimed behavior was never exercised.

For compositor repairs, never treat callback order as proof that paint occurred
between two mutations. Before changing timing or phase ownership again, trace
the material state at the mutation boundary: the relevant computed style, live
range geometry, model/DOM endpoints, and callback identity. If that state is
already final while the pixel oracle stays red, reject timing as the cause.
Keep the pixel oracle blocking; callback traces prove execution, not paint.

An ordering fix must exercise both the pre-handler already queued competitor
and a delayed post-handler re-entry when either can overwrite the named result.
Proving only one ordering window cannot close the case.

Before a pixel-diff oracle may block a case, run three controls through the same
capture and classifier: a known-correct single-layer state, a known-absent state,
and a known-invalid duplicate-layer state. The single layer must be classified as
exactly one layer, the absent state must contain no classified signal, and the
duplicate state must be rejected. Width or outer geometry alone cannot certify
layer count. A failed control invalidates every result from that oracle and
freezes product edits until the proof helper is repaired.

A completed applicable `geometry-paint` row must name actual pixel capture and
classification in its proof layer and record `positive-control: pass` plus
`negative-control: pass` and `duplicate-control: pass` in its result. Computed
style, DOM attributes, callback traces, selection text, and an unclassified
screenshot are diagnostics only; none can close a visible-paint claim.

When target placement is the claim, use a bounded visible interval with both a
lower and upper bound. A one-sided threshold cannot prove visibility because
the target may already be beyond the opposite viewport edge.

When behavior depends on a geometry library, a mock that records only the call
is proxy evidence. Execute the real calculation or an exact browser probe
before claiming the candidate satisfies target placement.

When final proof includes a final screenshot, capture it, cross the surface's
settle boundary, and reassert the reporter final state before accepting the
artifact. A pre-capture transient poll cannot close a result that screenshot,
focus, selection repair, layout, or paint work can still invalidate.

Run final proof through `capture-proof-receipt.mjs`. It executes the command,
fingerprints every named production/test/fixture/harness/config input before
and after the run, lists those exact inputs, records the ref and host identity,
and prints a tamper-evident
Markdown receipt for the transient plan. After the last edit to any shared
owner, replay every affected exact case in one combined command and bind the
affected-corpus row to that receipt.

A managed browser receipt must bind the same literal `--base-url` inside its
proof command, such as `PLAYWRIGHT_BASE_URL=<url>`. A host label that says one
URL while the command falls back to another port is invalid proof.

Before changing a shared owner, run every already-executable affected case and
record its `pass:` or `red:` pre-edit baseline in `Affected corpus replay`.
Without that baseline, a later red cannot distinguish an introduced regression
from inherited breakage, so Patch must not start.

For a shared CSS selector, marker, class map, or style expansion, inventory
every current consumer before changing product bytes. Include consumers that
explicitly neutralize or override the shared style, such as transparent,
borderless, shadowless, or ringless wrappers. Add each affected consumer to the
corpus and give it a negative geometry/paint oracle for duplicate or inherited
paint; proving only the newly visible positive surface is incomplete.

Decide:

- `keep`: executable red/green proof, fresh final replay, stability, durable
  owner, and review all pass;
- `revert`: remove the attempt and re-prove the prior executable behavior;
- `quarantine`: keep useful proof outside the runtime path without claiming
  completion;
- `defer` or `block`: name the missing owner/evidence and revisit trigger.

A kept case and its run become `completed` when every required local executable
test, final-source replay, stability, review, methodology, and plan gate passes.
Commit and push are not local completion gates. Record the tested ref or dirty
fingerprints and say `local, uncommitted, and unpushed` when that is true.

### 6. Failed-Fix Interrupt

A failed fix is a claimed `candidate-local`, `kept`, or `completed` repair that
later fails its exact replay or final verification, or is contradicted by a
fresh reporter result. Expected red-before-green reproduction is not a failed
fix.

A final-proof process failure counts as a failed fix only when the reporter
assertion ran and failed. A pre-assertion proof-host failure still triggers the
automatic Regression repair above, but it cannot fabricate a product failure
or architecture escalation.

Classify each failed fix as `reporter-contradiction`, `exact-replay`, or
`final-verification`. Keep base acceptance in the evidence inventory as
required or explicitly superseded. Require a `latest-reporter-delta` only for
`reporter-contradiction`; replay and verification failures cannot invent one.
An `exact-replay` or `final-verification` failure must also record
`diagnostic: <unchanged-bytes phase/result>` in its resume state before another
Patch. The diagnostic reruns the actual failing assertion on frozen product
bytes and distinguishes product nondeterminism from interaction, host, or
oracle drift; repeated green alone is not a diagnosis.

Every failed claimed bug fix automatically repairs Regression. Do not wait for
the user to ask and do not delegate another product patch first:

1. Mark the attempted green, proof receipt, local completion, and any public
   completion authority invalid. Tell the public coordinator to correct stale
   wording or labels; Regression itself still has no public-mutation authority.
2. Stop product edits for that case and enter
   `regression repair <case-id>: <missed invariant or proof failure>`.
3. Patch the smallest durable Regression rule, methodology, template, proof
   helper, validator, or routing owner. Add an executable workflow test that
   rejects the failed packet. Prose-only repair is forbidden.
4. Run focused workflow proof, `pnpm install`, source/generated parity, and
   agent-native review. A failed-fix methodology decision must be `repair-now`;
   `no-change` and `defer` cannot resume the product attempt.
5. Rebuild the cumulative reporter evidence inventory, restart from exact
   reproduction with a new attempt number, and map every still-applicable base
   acceptance plus the latest delta to phase-specific executable oracles.
   Re-resolve the expected-outcome authority instead of carrying an inferred
   positive target from the failed attempt. Never carry the invalidated receipt
   into the new attempt.

On the second failed fix for one case, or immediately for cross-layer
compensation, duplicated live identity, per-node hot work, timer/focus/blur
correctness repair, or UI code repairing a substrate invariant, run `best-api`
and the owning `plite-plan`, `plate-plan`, or both before another Patch attempt.
Private-beta compatibility is not a reason to preserve the bad shape.

### 7. Improve The Method

Every case records one methodology decision in the plan:

- `repair-now`: patch and prove the durable rule, template, command, proof
  host, generator, or test helper;
- `no-change`: cite why the current method handled the case cleanly;
- `defer`: name the owner, deficiency, evidence, and trigger.

Repair avoidable command mistakes, irrelevant skill loading, stale servers,
generated drift, false-green gates, noisy output, and repeated setup in the
same run when safe. After agent-source changes, run focused proof,
`pnpm install`, mirror parity, and agent-native review.

This ordinary per-case methodology delta does not weaken Failed-Fix Interrupt.
Once a claimed fix fails, automatic `repair-now` is mandatory.

## Orchestration

When orchestrator mode is active, the master owns the plan, selection, and
final decisions. Use one durable child for one bounded case or read-only proof
packet. Reuse it for same-case follow-ups. Never run parallel writers against
overlapping source, tests, plans, builds, generated output, or managed hosts.

## Repair Command

For `repair <expectation>`, repair this workflow rather than product runtime:

1. State the recurring miss and future failure it permits.
2. Edit `.agents/rules/regression.mdc`, its methodology reference, template,
   proof host, generator, or routing owner.
3. Delete obsolete workflow surface instead of deprecating it.
4. Add or strengthen executable tests when the miss is mechanical.
5. Run the semantic validator against the failed packet and a completed fixture.
6. Run focused proof, `pnpm install`, source/mirror parity,
   `agent-native-reviewer`, and P1 review when executable workflow code
   changed.

## Verification

Minimum workflow proof:

```bash
node --test \
  .agents/rules/regression/scripts/test-first-contract.test.mjs \
  .agents/rules/regression/scripts/validate-regression-plan.test.mjs \
  .agents/skills/regression/scripts/test-first-contract.test.mjs
node .agents/rules/plate-next/scripts/sync-resources.mjs --check
```

Also prove the four historical reporter-invalidated plans fail
`validate-regression-plan.mjs --complete`, a failed-fix packet cannot resume
without an executable `repair-now`, a second failure cannot resume without
Best API and a layer plan, an evidence-complete fixture passes, an unfinished
plan fails `check-complete.mjs`, and source/generated resources match.

Run package, DOM, Playwright, Browser, Chrome, or device proof according to the
claim. End non-trivial implementation packets with P1 autoreview.

## Final Handoff

Report:

- plan path and selected executable test cases;
- exact reproduction, fix, test commands, hosts, refs, and stability;
- reporter oracle matrix, proof receipt, and affected-corpus replay;
- every started gate failure and its passing final rerun;
- keep/revert/quarantine/defer/block decisions;
- failed-fix invalidation, automatic repair, and architecture escalation when
  any attempt failed;
- methodology delta for every case;
- source/generated sync and review status;
- residual claim limits and next owner.

Call an evidence-complete local run `completed`, including when it is
uncommitted or unpushed. Reserve `integrated`, `shipped`, `released`, and public
issue completion or labels for the coordinator and their owning evidence.
