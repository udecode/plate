# Regression Oracles

Verify Plate owns these conditional proof mechanics. Load only the sections
whose triggers occur in the selected report, corpus or failed-fix diagnosis.
The tags below are semantic fields when using Patch’s corpus schema; for one
ordinary report, record the applicable proof in its existing plan or handoff.
They do not require the corpus template, a second coordinator, or unrelated
observation rows. [Patch corpus](../../patch/references/corpus.md) owns batch
schema and receipts; [failed-fix](../../patch/references/failed-fix.md) owns
claimed-fix invalidation and resumption.

## Contents

- [Runtime and model contracts](#runtime-and-model-contracts)
- [Render measurement](#render-measurement)
- [Subscriptions and selective invalidation](#subscriptions-and-selective-invalidation)
- [Focus and popup lifecycle](#focus-and-popup-lifecycle)
- [Pointer feedback and native gesture paths](#pointer-feedback-and-native-gesture-paths)
- [Caret and positive layout references](#caret-and-positive-layout-references)
- [Geometry and paint proof](#geometry-and-paint-proof)
- [Shared-style consumers](#shared-style-consumers)
- [Failed native diagnostics](#failed-native-diagnostics)

## Runtime And Model Contracts

Before calling a unit or package RED exact, compare its setup with every route
mode that changes mutation representation or schema properties. Record
`runtime-modes:` in the selected case's `Exact environment`, including preview,
suggestion, history, read-only, and any other relevant active or inactive mode.
The same transform with a route-owned mode disabled is a proxy: it can reproduce
the first exception while hiding the next invalid state in the same action.

Record `fixture-scope:` beside the runtime modes. Use
`fixture-scope: complete <input>` when the route consumes a deterministic
sample, recording, corpus, or generated fixture. A minimal prefix may be
recorded as `fixture-scope: minimal <invariant>` only while the case remains
reproduced and complete-fixture replay stays open. Minimal input cannot support
a kept, fixed, completed, or full-flow claim, even when it reproduces the first
reported exception.

When native behavior needs durable proof, record
`e2e-required: <specific lower-layer limitation>`. A case may combine
`unit-red: <test>; e2e-required: <distinct native boundary>` when each catches a
different failure. Extend an existing journey before adding a harness. Never
remove or weaken a failing native assertion merely because a lower-layer test
passes; diagnose its failure and retain the original claim.

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

For independent editors, map every mounted root to its editor and complete
fixture in applicable `model` and `dom-native` oracles using `editor-bindings:`.
The model oracle must also name `isolated-edit-and-undo:` and prove that editing
and undoing each document leaves every other document unchanged. Completion
requires matching `pass` results. A mount count can pass with every root bound
to the same document. Shared-document views do not require document isolation.

For same-model or same-root views with focus, toolbar, controller or read-only
behavior, model identity is insufficient. Record `view-bindings:` in the model
and focus oracles: each mount maps to its command editor, root, DOM element and
current permissions. The model oracle includes `current-view-permissions:` and
`stale-mount:`; the focus oracle includes `exact-view-focus:`. Prove that a
captured action cannot edit a retired/replaced mount or bypass a later read-only
change, and returns focus to its exact surviving mount. Completion requires
each marker's `pass` result. A model-level focus boolean cannot certify this
contract; ordinary shared-document rendering without these interactions does
not acquire this gate.

For multi-root undo/redo, distinguish a history-driven root transition from
retiring the control's explicit editor target. The focus oracle includes
`history-root-transition:` for repeated document undo that changes roots and
`history-target-retirement:` for canceling restoration after the bound editor
changes or unmounts. Require both markers to pass; one fixed-root toolbar test
cannot certify ambient document-history lifetime.

For a toolbar field committed with Enter, follow that commit with Undo while
the field still owns focus. The `field-commit-once:` model oracle reads the
result again after focus restoration blurs the input. A committed draft must
not be applied again by blur and overwrite the undo result.

For toolbar field focus with a pending editor focus retry, the
`field-focus-handoff:` oracle keeps the field focused through the queued frame
and settlement callbacks, then sends a follow-up key without another click.
Check the key's field value and unchanged editor content. A successful blur
commit alone can hide an earlier focus theft if text arrived before the retry.

For Plite model-based, generated, or differential cases, the semantic oracle
is canonical `DocumentChange` plus `EditorCommit`. Assert final document state,
selection, commit metadata, error class, and follow-up usability. Primitive
Slate or Plate operation traces are diagnostic evidence unless current product
law explicitly preserves them.

Runtime identity mapping requires a `model@after-action` oracle that round-trips
canonical changes through JSON, not just an in-process transaction. Assert that
retained siblings keep their keys and deleted keys resolve to null; exact value
equality alone misses identity transfer. Record `serialized-replay:`,
`retained-identity:`, and `deleted-identity:` in the positive assertion, with
`: pass` for each at completion. Include fresh-editor and historical reads so
process-local node metadata cannot accidentally satisfy the wire contract.
Also record `split-merge-range:` with a content-preserving formatting round-trip.
Assert selected text and forward/backward direction after both the split and
merge, then type or navigate from the restored range. Completion requires
`split-merge-range: pass`; correct document values and node keys alone do not
prove point mapping through a merge.

When changing Plate/Plite runtime dependency placement for a React helper,
record `package-dependency-change:` in the selected case. Its `runtime-errors`
oracle uses a `packed package` proof layer and records `react-free-headless:`
and `react-consumer:` assertions. Before a keep decision, run
`pnpm plite:release:packages` against the final manifest and built artifacts;
both results must be `pass`. Source tests cannot prove that headless consumers
avoid transitive React installation or that React consumers resolve the helper.
The existing isolated dependency and packed SSR checks own this proof.

## Render Measurement

For a reporter-visible rerender, render-storm, or repeated-component claim,
Benchmark owns timing and causal attribution, while Patch preserves the
route-wide reporter oracle. Capture an exact-route, phase-specific component
inventory before and during the named action. Count render or commit work by
component family and repeated visible unit. A wrapper-local Profiler, one
optimized component, or pointer latency alone remains a proxy and cannot close
the route-wide claim. Before completion, account for every family above 5% of
added work and at least 90% overall; keep the remainder open and named.

For any render-count, rerender, or profiler-event claim, trace the measurement
path itself. Inventory every production file that emits, routes, filters,
aggregates, or renders a measured event kind. Put the paths in the applicable
oracle as `measurement-owner-inputs:` before proof and record
`measurement-owner-closure: pass` in the completed result. At least one final
proof receipt for the case must include every named path. Feature-only
fingerprints are stale evidence when a shared renderer or profiler owner can
change the count without touching the feature.

## Subscriptions And Selective Invalidation

A subscription-backed keyed collection requires an applicable
`subscription-lifecycle` row. Run add, update, remove, and teardown through the
same production publication and cleanup path. Completion records `add: pass`,
`update: pass`, `remove: pass`, and `teardown: pass`. Testing only a stable
item update is incomplete because removal can notify an item subscriber before
membership cleanup.

For an effect-owned disposable source, run its `subscription-lifecycle` owner
test under React Strict Mode. The positive assertion records
`strict-effect: mount + cleanup + remount`, and the test publishes after the
remount before the final unmount. Completion records `mount: pass`,
`cleanup: pass`, `remount: pass`, and `post-remount-publication: pass`. A
single-mount harness is red for this claim because effect rehearsal can destroy
a render-created source before live use.

Selective invalidation, affected-only routing, and fan-out repairs require an
applicable `follow-up-input@follow-up` row. Repeat edits to one already-hot
target cannot prove skipped state remains correct. The owner test must edit
an unrelated target, then edit or resolve the previously skipped target, and
must read an unchanged value without altering its shape. Record
`unrelated-then-affected:` and `unchanged-read:` in the positive assertion;
completion records `unrelated-then-affected: pass` and `unchanged-read: pass`.
Use the real location, identity, membership, or cache state the owner skips.
Benchmark counters and latency do not substitute for those value assertions.

For persistent collection locality, count entries copied inside rebuilt nodes,
not just the nodes themselves. Vary key distribution: short keys with divergent
prefixes can expose a wide copied child map that sequential IDs hide. Preserve
the same immutable and later-affected value assertions for that cohort.

When a fix filters records from one batched observer or event delivery, filter
records independently. Put an ignored presentation attribute and a critical
`childList` mutation in the same observer delivery, then assert both outcomes
with distinct selectors. A selector that conflates the ignored and critical
records cannot authorize the filter.

## Focus And Popup Lifecycle

For a focus transfer, `FocusEvent.relatedTarget` is evidence, not a guaranteed
next-target carrier. The exact owner test covers a direct related target and a
null related target followed by document `focusin`. Put
`focus-transfer: direct-related-target + null-related-target -> focusin` in the
positive assertion. Completion records `direct-related-target: pass`,
`null-related-target: pass`, and `focusin-resolution: pass`. The pending null
phase renders nothing, while an unmarked `focusin` or window blur clears it.

For popup or toolbar focus, an immediate `activeElement` sample is support-only.
When focus is applicable in the popup phase, the positive assertion records
`focus-stability: settled + follow-up-key`. Browser-native proof waits through
the popup's named layout/render settling boundary, then sends the next real key
without a click or programmatic focus. Completion records
`settled-focus: pass` and `follow-up-key: pass`. A locator helper that restores
focus to its command target, an immediate `toBeFocused`, or an early green from
another runner cannot overrule later exact-route focus loss.

When reporter evidence shows the first key after opening a popup is lost, do
not poll or assert focus before sending that key. Record
`first-key-boundary: trigger-release -> native-key without focus wait` in Exact
environment, `first-key-before-focus-wait: required` in the after-action focus
oracle, `first-key-caret: popup-input` in the after-action DOM/native oracle,
and `first-key-target: popup-input` in the follow-up-input oracle. Drive the
trigger through the reporter's real input boundary, send the native key
immediately after trigger release, and inspect focus and popup state only
afterward. The DOM/native oracle also records
`first-key-caret-competitors: clear-before-focus + clear-after-focus`; proof
must survive a queued selection clear on both sides of the focus write while
the target remains active.

When the popup input can change read-only state or remount, Exact environment
and the focus oracle also record
`focus-lifecycle-modes: writable-mount + transient-read-only + read-only-transition + remount`.
The transient row covers a writable target whose mounted view initially reports
read-only before readiness; it must not consume the pending autofocus request.
Completion records `first-key-caret: pass`, `first-key-routing: pass`, and
`first-key-input: pass`, plus `writable-mount: pass`,
`transient-read-only: pass`, `read-only-transition: pass`, and `remount: pass`
when applicable. It also records `clear-before-focus: pass` and
`clear-after-focus: pass`. `activeElement` without a native caret or selection
in the target, a mount-only fixture that skips the popup's real lifecycle,
waiting for `toBeFocused()`, using a locator-owned key method, or sending a
programmatic text insertion before the first-key assertion is a false green.

For a shortcut- or hotkey-opened popup, add
`trigger-path: pre-focused-surface + native-keyboard` to the positive assertion.
Focus the owning surface first, then deliver the shortcut through the browser
keyboard rather than a locator-owned `press()` that may introduce its own focus
step. Completion records `native-trigger-key: pass`.

When the reporter or acceptance criteria name multiple entry paths to the same
popup, record `entry-paths: path-a + path-b` in Exact environment and the
applicable focus oracle. The anchored executable test must drive every named
path through its real input boundary. Completion records
`entry-path-coverage: pass` plus `entry-path:<path>: pass` for every path. A
test that names both paths in prose but executes only one is invalid.

Any popup or toolbar lifecycle asserted after an action or release requires an
applicable `follow-up-input@follow-up` oracle. Proving that an overlay closed is
not enough; the next interaction on the owning surface must still work.

For every applicable popup close row at `after-action` or `after-release`, the
matrix must also account for `dom-native` and `focus` at that same phase. Mark
them applicable with exact selection/caret and focus assertions, or explicitly
N/A with a reason. A later follow-up action cannot prove that close preserved
the live pointer-created selection or caret.

## Pointer Feedback And Native Gesture Paths

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

A reporter click cannot be reproduced by a drag surrogate unless the same
browser gesture records a delivered click event. A drag surrogate without that
delivered click cannot authorize a product patch for the click report.

For a focus-first click report—where the first click only focuses an editable
surface and the second click performs the action—the exact setup starts from
the focus/selection state visible in the reporter evidence. Record that
concrete state in both the required evidence row and focus oracle as
`initial-focus: <concrete reporter state>`; `outside-editor` is valid only when
the evidence says so. The DOM/native oracle records the actual `event-order`
from one real gesture and includes `pointerdown`, `mousedown`, and `click`, plus
`focus` only when the browser emits it. Browser-native focus presence and
placement are not prescribed. The focus oracle proves initial ownership, and
the popup oracle asserts
`first-click-popup: open` immediately after the same click. At completion their
results record `initial-focus: pass`, `event-order: pass`, and
`first-click-popup: pass`. Inventing a different focus precondition, calling
`fireEvent.click` without the preceding native phases, or checking only
eventual animation/style is a proxy and cannot authorize a single-click fix.

When a fresh focus-first contradiction survives while an existing component
test stays green, inspect the popup mock before another product attempt. Rerun
the owner against a passive popup wrapper that only reflects the component's
`open` input and never injects a click toggle. The trigger must request open on
its own and record `component-open-owner: pass`. A wrapper mock that opens on
behalf of the trigger proves only the mock and cannot authorize completion.

If reporter video names concrete text and control hit targets after a green
automation used locator clicks or a programmatically seeded selection, add
`physical-hit-path: <first target -> action target>` to the required evidence.
Drive both gestures from live layout coordinates with the browser mouse. The
first physical gesture must create the native selection; direct Range or
selection mutation is proxy evidence. Record
`physical-hit-target: <actual target>` in the DOM/native oracle and
`selection-origin: physical-pointer` in the focus oracle. At completion the
results include `physical-hit-target: pass`, `click-delivery: pass`, and
`selection-origin: pass`. A `locator.click()`, element-dispatched click, or
programmatically created caret cannot certify the contradicted physical path.

Do not add a physical pointer path to setup unless the case's source, action,
or outcome claims that path. When selection is setup-only, use
the smallest deterministic browser setup such as `locator.selectText()` or
native-keyboard selection, assert the seeded state, then exercise the claimed
action. Setup-only pointer gestures add an unrelated failure mode and cannot
widen the result. The physical-hit law above still governs every claimed or
reporter-identified pointer path.

If reporter video visibly identifies a browser family, profile, extension, or
browser-owned overlay, that visible state is part of the exact environment even
when the reporter does not name it in prose. Add
`reporter-profile: <browser family and visible profile/extension state>` to
required reporter evidence and Exact environment. An in-app browser, clean
profile, different browser binding, or exact browser binary without the
reporter profile is support-only. Replay the physical path in the reporter
profile for every applicable DOM/native, focus, and popup oracle, record
`reporter-profile-replay: pass`, and bind the same `reporter-profile:`
identity in the final receipt host. If only tool-native profile or OS state can
replay the path, keep the final executable receipt bound to the final bytes and
exact browser binary, add `tool-proof: computer-use` to Exact environment,
and name Computer Use plus `reporter-profile-replay: pass` in every
applicable profile oracle. Without either a profile-bound receipt or that
explicit tool-native proof, keep product completion blocked instead of carrying
a clean-profile green. Recompute and verify the physical target after every
scroll, selection, focus, layout, or overlay-state change; stale coordinates
cannot isolate an interceptor or authorize completion.

When an editor's capture-phase routing branches on attributes from the event
target or one of its ancestors, add
`capture-routing-path: <target -> capture owner>` to required evidence. Trace
the complete target-to-owner chain and inventory the exact branch attributes on
the nodes from which the handler reads them. Record
`interaction-owner-chain: <nodes>` and
`capture-routing-contract: <owner attributes>` in the DOM/native oracle. At
completion its result includes `interaction-owner-chain: pass` and
`capture-routing-contract: pass`. A child-level attribute assertion is proxy
evidence when the capture handler reads the corresponding law from a void or
editor ancestor.

If the reporter's live tab remains red while the same exact-host behavior is
green in an isolated browser, stop product edits and inventory active dev
overlays plus document/window capture listeners. Add
`interaction-interceptor-path: <global capture owner -> target>` and
`external-interceptor-state: <active mode/settings>` to required evidence. If
an external owner deliberately calls `preventDefault` or `stopPropagation` for
that gesture, do not compensate inside the product target. Deactivate or
configure the interceptor, replay the same tab, and record
`external-interceptor-isolated: pass` before completing the product claim.

When the report names Chrome, Blink, a compositor, or browser-native behavior,
record `exact-chrome: <environment>` and use exact Chrome for the full final
replay. Playwright Chromium remains useful diagnosis but cannot certify that
claim. Pass the exact binary to `capture-proof-receipt.mjs` with
`--browser-executable`; the helper runs that binary's version command and
rejects a proof command that does not reference the same path. Confirm one
worker launch trace before counting stability. A requested channel, project
name, or handwritten host label is not executable attestation.

## Caret And Positive Layout References

Required evidence that names a caret, insertion point, caret-accessible line,
editable blank line/row, or text cursor must include oracle anchors for
`dom-native` and `focus` at that evidence phase plus
`follow-up-input@follow-up`; every named row must be applicable. The proof must
replay the reporter's real click, selection, or keyboard path in a native
browser, assert visible/native caret paint independently from model selection,
wrapper height, DOM markers, and block highlighting, then prove the next valid
edit still works. A zero-height spacer, a hidden selection anchor, a static
unselected screenshot, or geometry-only pixel classification is support-only.

For caret paint caused by clicking, the required evidence also anchors an
applicable `geometry-paint` row at the same phase. Its positive assertion names
`paint-trigger: click`. Capture and classify pixels after the delivered click
and before another key, pointer gesture, focus call, or selection write; record
`paint-input-trace: click > pixel-capture` in the completed result. Run the
existing pixel controls through that capture path. A click DOM assertion cannot
borrow paint sampled after arrow navigation. Keep later keyboard paint as
separate evidence. A caret mentioned only in `initial-focus:` setup does not
claim click paint and does not acquire this gate.

Required positive authority/reference evidence that names layout, width,
size, centering/alignment, position, spacing, compression, or a full row must
anchor `geometry-paint` at the same phase. The applicable oracle records
`reference-geometry: <material bounds/relationship>` in its positive assertion,
uses a browser or exact-Chrome proof layer with executable `layout-bounds`, and
records `layout-bounds: pass` at completion. A negative-only absence check,
caret classifier, wrapper-height assertion, or unclassified screenshot cannot
prove the positive reference geometry survived.

## Geometry And Paint Proof

A compositor phase is not proved by callback names. Before another timing or
phase change, instrument the exact mutation boundary and record the material
state that should drive paint: relevant computed style, live range geometry,
model/DOM endpoints, and callback identity. If those values are already final
while the pixel oracle remains red, reject lifecycle ordering as the cause and
change strategy. A timer or later animation-frame callback may prove that code
ran; neither proves the intermediate state was painted.

An ordering fix must exercise both the pre-handler already queued competitor
and a delayed post-handler re-entry when either can overwrite the named result.
Proving only one ordering window cannot close the case.

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

Responsive geometry may intentionally settle through an animation frame,
resize observer, or asynchronous renderer commit. The proof must poll a named
final invariant within a bounded timeout before it captures final boxes. A
single immediate bounding-box read after resize is invalid because it cannot
distinguish a broken refresh from a correct refresh that has not committed.
Capture the pre-convergence and converged geometry in the smallest diagnostic,
then keep product bytes frozen until that classification is explicit.

## Shared-Style Consumers

Before changing a shared CSS selector, marker, class map, or style expansion,
search every current consumer and record the full affected corpus. Consumers
that deliberately neutralize or override the shared paint are mandatory rows,
including transparent, borderless, shadowless, and ringless wrappers. Give
each one a forbidden geometry/paint assertion for duplicate or inherited
paint. A positive oracle for the originally missing surface cannot authorize a
shared selector change by itself.

## Failed Native Diagnostics

For a failed native selection case, capture the native range, model selection,
and view selection before and after each input, at selection import, and at
the next input. Record `selection-transition-trace: native + model + view + next-input`
and `first-divergence: <input/owner>` in the resume state. A final highlighted
string alone cannot prove that intervening commands preserved the selection's
coordinate owner. Replay both uninterrupted input and input after selection
import; do not make a product race pass by adding delays.

For focus-state subscription or context repairs, record
`focus-state-trace: native + dom-api + react-context`. Compare all three after
native or public-API focus without a synthetic focus-event supplement, and
check each mounted view independently. This exposes missing notifications
even when native focus and the imperative API agree.

Also trace DOM selection writes on the same frozen bytes: changing selection
can focus an editable without calling its `focus()` method. Record
`selection-focus-trace: selection-write + active-before + active-after` and
`selection-focus-result: <write-owner/effect-or-no-write>` before another
product attempt. Explicit focus-call instrumentation alone misses this path.

For a failed popup or toolbar focus case, that frozen-byte diagnostic also
captures native `focusin` and `focusout`, then samples the focus owner at mount,
Floating UI positioned readiness, settlement, and the no-click follow-up key.
The failed-fix resume state records
`focus-owner-trace: mount + positioned + settled + follow-up-key`,
`native-focus-events: focusin + focusout capture`, and
`first-divergence: <phase/owner>`. Do not choose another timer, effect phase, or
positioning gate from final `activeElement` alone. Intercept the native
`focus()` boundary on frozen product bytes and record
`focus-call-trace: target + connected + display + visibility + disabled + active-after-call`
plus `focus-call-result: <called-or-not-called/owner>`. That separates a missing
focus call from a call rejected because the target was hidden, detached, or
disabled before another lifecycle owner is chosen.

When the failed candidate schedules focus with a timer, animation frame, or
equivalent callback, intercept that scheduler too. Record
`focus-scheduler-trace: request + cancel + run` and
`focus-scheduler-result: <ran-or-cancelled/target-readiness>` in the failed-fix
resume state. The callback running does not prove the target was focusable; use
the focus-call target state from that same callback.

For a failed mounted keyboard, text-input, trigger or semantic-command case,
apply the runtime-owner and mutation-owner diagnostics in
[Runtime and model contracts](#runtime-and-model-contracts) before resumption.
For a route-based contradiction, record `exact-route-reproduction: red` or
`pass` after replaying the literal reporter route before another product attempt.
