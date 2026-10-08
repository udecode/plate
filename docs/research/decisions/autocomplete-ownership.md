---
title: Autocomplete query and activation ownership
type: decision
status: proposed
updated: 2026-10-04
related:
  - slash-command-ownership.md
  - editing-command-ownership.md
  - ../review-scopes/autocomplete.json
---

# Autocomplete query and activation ownership

**Audit of 2026-10-04.** Pursue. Ordinary text with one private owner per Editable is still the right owner, and the in-flight Phase 1b Plite typed-text report is the right remaining target because it closes the law-5 string-paste violation and stops Plate reading private Plite commit tags, while the plan's gated Phase 2 host adds core plugin grammar with no measured gain over the repaired owner. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and record `2026-10-04-autocomplete-audit` hold the evidence.

**Keep ordinary text and fix the screen-reader regression in place.** The
[re-challenge](../review-records/2026-10-02-autocomplete-input-element-rechallenge.json)
asked whether to return to the input element. Plate adopted that element in
2024 so assistive technology would recognise the caret as inside a combobox
(udecode/plate#3168). In Chromium the shipped editor root exposes a textbox
where HEAD's input exposed a combobox with expanded and popup state. While a
popup is open, `ComboboxOwner.syncAria` should also set `role=combobox`,
`aria-expanded` and `aria-haspopup` on the root, which restores that state
with focus and IME unchanged. A polite live region is the fallback. A
[source survey of twelve editors](../../plite/research/2026-10-02-autocomplete-query-representation/README.md)
found only Atlassian isolating the query, at a cost this review rejects. A
real screen-reader run decides the repair and is the one result that could
reopen isolation.

**Pursue ordinary editor text with a view-local match.** The
[prototype review](../review-records/2026-10-01-autocomplete-ordinary-text-prototype.json)
settles the [representation audit](../review-records/2026-10-01-autocomplete-representation-audit.json).
A [throwaway prototype](../probes/2026-10-01-autocomplete-ordinary-text/NOTES.md)
recomputes the match from the caret, stores only an Escape-dismissed trigger
anchor and completes in one update. It passes trigger rules, Escape
suppression, remote-edit mapping, one-step undo that restores the typed query,
rollback, stale refusal and root-view switching on a real Plite editor. The
native input loses the query on undo and leaves author-locked input nodes in
shared documents. While Plite's composing flag holds, the mounted view reads
the visible preedit from the DOM, so filtering stays live during IME without
publishing preedit. The model-independent defect fixes still apply. The
[execution](#ordinary-text-adoption-execution-2026-10-01) adopted this model in
the working tree with the open gates listed there.

The September 30 review below remains the record of those defects and of the
rejected global manager, results service and InputRules takeover.

**Pursue one mounted query and activation owner.** Keep the adopted live-key,
atomic completion contract and distinct feature policies. Do not build an
editor-global autocomplete manager or promote copied option catalogs.

The [audit](../probes/2026-09-30-autocomplete/REPORT.md) reviews six shared units
and four actual inline consumers. It reconciles the July package work, April's
live point correction, August trigger/geometry repairs, September extraction
and projected-view binding, plus slash, accessibility and input-rule decisions.
Execution narrowed the earlier session proposal to live-key commands. This
review retains that result and reopens the deferred temporary-input comparison.

Current-source observations establish work worth doing:

- `InlineCombobox.value` does not initialize or reset the real Ariakit input.
- A real-Ariakit DOM probe commits an option during composing Enter despite
  the wrapper's bubbling guard.
- A global trigger regex makes identical trigger input alternate admission.
- Emoji's 100 ms delayed query leaves prior results selectable. Footnote can
  suppress empty presentation when its create option is not actually offered.

The strongest larger replacement is ordinary editor text, with a view-local
matched range and popup. It could delete four transient input schemas and their
creation/restoration/focus protocol. Local Lexical and Tiptap sources support
that alternative as a design, not proof of Plate parity. Query persistence and
collaboration semantics, exact view ownership, composition, escape suppression,
history and scale must settle the choice before adoption. The existing input
rule owner is a comparator; its current selection context is not sufficient
proof of explicit-target correctness.

Mention, slash, emoji and footnote retain their product choices and inferred
transaction insertion. Tag's dedicated select editor is a comparison, not an
inline consumer. AI space activation remains outside this review's adoption.

## Audit proof, 2026-09-30

The current combobox package partition passes 52 tests. Four retained
observational probes use real Ariakit and package completion with mocked Plate
React hooks under Happy DOM. They reproduce defects, not approved behavior or
browser/native parity. The copied combobox test cannot load because its mock
omits `useEditorHistory`. Emoji and footnote findings are source-derived.
No fresh browser, full typecheck or scale comparison ran in that audit. The three recovered
executions remain historical-unbound, and this review establishes no adoption.

## Superseded native-input design, 2026-10-01

The [design plan](../../plans/2026-10-01-autocomplete-query-activation.md)
selects one local controlled-or-uncontrolled Ariakit query and keeps the
live-key completion owner. Ordinary editor text remains a competing model;
its save/share/history changes do not earn adoption for the current job.
InputRules consolidation is rejected because it widens static dispatch and
explicit-target semantics while relocating a separate completion job.
Custom trigger state and factories retain their published authoring job.

The plan cuts query mirrors, transition/delayed selectable results and
Ariakit's duplicate select/value/hide completion actions. One active native
interaction owns popup exposure, every cancellation cause and gesture
eligibility. Cross-view entry dismisses/restores text; there is no draft
transfer. Footnote options use their existing document selector and canonical
insertion policy. Three same-family challenge reviewers found five distinct
material concerns; amendments and one clean replay settle the target.

The disposable candidate passes four real-Ariakit Happy DOM cases with mocked
Plate hooks. Headless query medians pass the frozen 8/60/250-option budgets,
and the real 1,870-entry emoji dataset stays below the pure-search budget.
This establishes bounded design feasibility, not final implementation,
native provider, physical IME, browser paint or full type proof. Raw prototype
receipts remain local under `node_modules/.cache/autocomplete-plan`.

The bound outcome is design-complete with partial proof and certifies no
product adoption. The ordinary-text prototype review supersedes its
native-input target; its defect diagnosis and cut of Ariakit's duplicate
completion actions carry over.

## Ordinary-text adoption design, 2026-10-01

The [adoption plan](../../plans/2026-10-01-autocomplete-ordinary-text-adoption.md)
deletes the behavior plugin and input-node protocol, keeps feature-owned
insertion and copied catalogs, and declares matching through `combobox()`
contributions whose policy is the owning plugin's configured values. One
private owner per mounted Editable holds at most one occurrence, and one
public `useCombobox` hook per popup renders and completes it.

Only a locally typed trigger opens an occurrence, held as a range anchor over
the trigger span, so caret placement, undo, migration and remote text never
open a popup. Completion takes the offered match and a callback that may
return `false` to roll back the whole update. Composition gates on Plite's
`view.isComposing()`, the preview reads DOM text from the trigger to the
caret, and an explicit activation during composition first runs a Plite-owned
settle operation. That operation and key arbitration for owned content roots
are the two required Plite changes.

The [third-pass outcome](../review-records/2026-10-01-autocomplete-ordinary-text-adoption-third-pass.json)
records an interrogate by three same-family Opus reviewers and a Codex
review. It reversed four second-pass cuts, and its dispositions are in the
plan's decision log. The outcome is partial. The three execution phases
remain open, and no product adoption, browser parity, native IME behavior or
cost result is established. The [earlier design outcome](../review-records/2026-10-01-autocomplete-ordinary-text-adoption-design.json)
binds the pre-interrogate plan bytes.

## Ordinary-text adoption execution, 2026-10-01

Build ran all three phases of the
[adoption plan](../../plans/2026-10-01-autocomplete-ordinary-text-adoption.md)
in the working tree. `BaseComboboxPlugin`, `triggerCombobox` and the four
input schemas are gone. Matching policy is each feature plugin's
`ComboboxState` in `initialState`, so the planned `combobox()` contribution was
cut. `useCombobox({ plugin, editableRef, open })` renders and completes against
one private owner per mounted Editable. The owner picks the latest typed
trigger across its popups, reads back only the typed text plus the longest
trigger to find it, keeps an occurrence in the view where it was typed, and
ends it when another editor or view takes focus. Plite gained a public
`ReactApi.settleInput()` that flushes a pending composition end. During an
active composition, option pointer-down is not prevented, so the blur ends the
composition before the click completes; desktop Chromium proves it with CDP
composition. The v54 converter migrates stored inputs to literal trigger and
query text. Inline voids inserted through the generated plugin `insert` or
`MentionPlugin` leave the caret after them, including at a block end. Copilot
keeps its auto-trigger beside an open popup.

On October 3 the plan was finalized as executed and folded into the
`autocomplete` subject file, `docs/plans/topics/autocomplete.md`, whose
Open work also tracks two gates found that day: hard law 5's known
violations and the registry install proof failing on DnD registry types.
The next iteration is `docs/plans/2026-10-03-autocomplete-occurrence-host.md`.
Its Phase 1a, recorded on October 4, refuses a match from an earlier query with
equal text, gives the editor root combobox semantics while a query is open,
skips IME-confirm keys in Plate's shortcut table, and bounds the trigger and
query reads in characters. Phase 1b waits on the native owner.

The execution outcome is partial; see the plan's latest record for the
evidence and limits. The gates below stay open.

### Open gates

- Physical desktop and mobile IME, Android taps during composition and
  WebKit's confirming Enter on a real IME. Playwright's WebKit exposes no
  composition protocol, so no emulated WebKit proof exists. Owner:
  input/Verify.
- Under Pixel 5 emulation in Chromium, a blur that commits a composition
  leaves Plite's model caret past the committed text, so a tap on an option
  during composition refuses. Repro: on `/blocks/mention-demo` type `ab`, send
  `Input.imeSetComposition` with `cd`, click outside, and read the model
  selection, which is offset 6 instead of 4. Desktop Chromium lands at 4. The
  same caret fault reproduces at HEAD `cf15725603` without any combobox, where
  the old input design also never opens its popup under that profile. Real
  Gboard on the `Pixel_9_API_36_Play` emulator did not reproduce it: English
  Gboard committed each letter as `insertText` with no composition, so
  `@biggs` left the caret at offset 6, where Pixel 5 emulation put it at 11,
  and an option tap inserted the mention (one run per step,
  `docs/plite/research/2026-10-02-agentic-e2e-testing/shards/004-android-device-probe.md:29-31`,
  `:38-45`). The `mention-taps` device case passed five of five runs
  (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json:54-58`)
  and again in the Phase 1b acceptance
  (`docs/plans/2026-10-03-autocomplete-occurrence-host.md:443`), but it taps
  after committed typing, so it proves plain option taps only. A tap during a
  composition, a composing keyboard and a physical phone stay unproven.
  Owner: Plite native input.
- Review of the public `ReactApi.settleInput()`, including its fallback that
  refuses instead of flushing when Plite resolves no single runtime, and
  autocomplete in owned content roots, where it is not built. Owner: Plite
  native input.
- A Plite query for which Editable holds a root's shared selection, to replace
  the `data-editor` check in `isAnotherEditorFocused`. Owner: Plite native
  input.
- Screen-reader navigation: while a popup is open the editor root exposes
  `textbox` without expanded or popup state, where HEAD's input exposed
  `combobox`. The repair in `ComboboxOwner.syncAria` and its proof on
  VoiceOver with Safari and Chrome and NVDA with Chrome are open. Owner: Plate
  React.
- A browser case for two views of one document and a live Copilot model beside
  Mention. The `complete` recheck of element
  read-only state is reachable only through schema reconfiguration during an
  open occurrence and has no case. Owner: Plate React.
- Migration of named roots and of inputs with meaningful children, a lineage
  cutover for applications that persisted an older v54 draft, a v55
  allocation, and migration of active Yjs rooms and offline history. Owner:
  persistence/release.
- Production-build timing for the key-to-paint contract below, which ran only
  on the development server with a probe whose per-run noise is about 2 ms.
  Owner: Benchmark.

The key-to-paint contract, frozen before measurement: one paragraph of 2,000
characters alternating bold and plain runs, typed at its end with 100 real
keystrokes and no trigger characters in Chromium, once with the Mention,
Slash, Emoji and Footnote kits and their popups mounted and once without.
Report per-keystroke input-to-next-paint p50 and p95 over five warm runs per
cohort. The kits-mounted p95 must stay within 10% and 1 ms of the kits-off
p95, and a delta counts only when it exceeds the larger cohort's run-to-run
spread. The contract named no pacing. Its first run typed without pacing and
failed at +125 ms because keystrokes queued behind development-mode
rendering; pacing at 100 ms was chosen after that result. Paced, it failed at
+2.0 ms (+19%), because every mounted popup read the paragraph's whole text
run per keystroke, 800 node reads in a 200-leaf paragraph. After bounding that
scan to 4 node reads, the paced contract measured within budget on the final
code.
