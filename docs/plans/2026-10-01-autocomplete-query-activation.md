---
review_scopes: [autocomplete]
review_basis: [2026-09-30-autocomplete-query-activation-ownership]
work_kind: design
---

# Autocomplete query and activation design

Status: Done

## Outcome

Mention, slash, emoji and footnote pickers use one query, only activate its
current results, and preserve native composition, exact-view focus and atomic
completion. This run selects the challenged target and its adoption plan.
It does not implement product changes or claim browser regression closure.

## Scope and authority

The user accepted the audit's `$task plan autocomplete` next step and added
"make sure no regression!". The authorized work is design, bounded comparison,
proof selection and a review-bound design outcome. Product implementation and
publication are outside this run. Search, AI product behavior, feature catalogs
and Tag's dedicated select-editor host stay outside adoption.

## Grounding

The [governing audit](../research/probes/2026-09-30-autocomplete/REPORT.md)
reconciles prior work. September's live `NodeKey` completion owner stays the
baseline: the package handles atomic mutation; the calling view supplies the
current document/root; the copied Ariakit host owns native input and popup.
Feature components supply options and typed transaction insertion.

The current source remains unchanged since that audit. Its current stale
fingerprint comes from workflow/package-script inputs, not autocomplete
product files. Historical browser receipts remain dated, not fresh proof.

The data model under comparison consists of a live input identity or mapped
text range, one query string, the offered options for that query, a mounted
interaction owner and a synchronous completion transaction. A second query,
document-global popup, universal results service or persistent selection
restore protocol must earn a current independent job.

The current draft query exists in a native input, outside canonical text. The
input node and its author stamp are document content. Ordinary editor text
would change query publication, persistence, history and collaboration. That
is a behavior decision, not a free schema deletion.

## Steps for this design run

- [x] Ground. Current source and prior history are reconciled in Grounding and the governing audit; autocomplete product inputs still match.
- [x] Sketch. Three same-family Architect runners compared local draft, ordinary text and InputRules ownership in Ownership comparison.
- [x] Agree. Three fresh same-family Interrogate reviewers challenged the target and trail; Challenge records the improved target and clean single replay.
- [x] Implement. Skip product implementation under plan-only authority; Adoption specifies three phases with regression gates.
- [x] Scrap. The amended target has no residual challenge finding; no replacement sketch is warranted.
- [x] User ask "ok go". The Task design-plan job is delivered and linked to a design outcome in the review ledger.
- [x] User ask "make sure no regression!". Hard laws and Regression gates preserve settled behavior; Observed design evidence records the bounded candidate and cost proof.
- [x] Apply Best API and Plate/Plite ownership, inference and scale decisions. Responsibility ledger names each deletion/replacement, owner and proof.
- [x] Write and audit the decision trail; run the prose pass. The appended trail passes decisions-check; Unslop removes duplicated phrasing and keeps proof limits explicit.
- [x] Run same-family challenge/trail review and workflow reflection. Challenge contains the review result and Reflect's covered-session skip.
- [x] Validate plan/trail and scoped ledger bindings. Plan-open and the autocomplete outcome validate; the global ledger check has the pre-existing streaming-inventory failure described below.
- [x] Final lint. Skip because this run edits Markdown, TSV and generated ledger JSON only; no lintable product source changed.

## Decisions

### User job and hard laws

Typing a feature trigger opens a local query. The user edits that query,
navigates its current options and either completes one option or restores
literal text. Confirming native composition must not complete an option.
Completion resolves the live input in the calling mounted view, respects its
current permissions and changes content once, atomically. Failed, retired or
stale actions neither change content nor move focus. Callback failure rolls
back both input removal and feature insertion.

The normal developer job is supplying feature options and an inferred
transaction callback. Custom plugin authors also need configurable triggers,
boundary predicates and construction of their own input schema. The published
combobox recipe demonstrates that job; the four built-in callers are not the
whole public contract.

### Ownership comparison

The ideal target has one query, one mounted activation boundary and one
atomic document-completion owner. Three independent same-family Architect
runners compared these models against the source and historical decisions.

| Model | Ownership and lifetime | Decision |
| --- | --- | --- |
| Live input node and one local draft | Document owns input identity and author eligibility. Existing Ariakit control owns presentation. A controlled parent, when supplied, owns the one query; otherwise Ariakit does. Live-key commands own document mutation. | Select. It resolves the evidenced defects without changing draft publication or completion history. |
| Ordinary editor text and a mounted matched range | Document owns trigger and query text. Mounted view owns range matching, popup and dismissal suppression. | Defer. It deletes four input schemas and native-input focus transfer, but also changes save/share, typing history, completion undo and remount behavior. No demonstrated user benefit yet pays for those changes. |
| InputRules owns trigger admission and completion | Existing rule engine gains dynamic/RegExp dispatch and explicit-target reads, plus input construction, eligibility and completion. | Reject for this plan. It grows the rule contract and moves a native-picker completion job into a general typing owner. |

Ordinary text is a genuine competing design, not prohibited by the current
representation. Keeping drafts local is a selected behavior here, not a
universal editor law. Reopen the comparison for a real job that needs drafts
saved/shared, or measured native-host failure that this target cannot solve.
Preserving privacy with an ordinary-text overlay would add a draft/range
protocol and lose much of the proposed deletion.

InputRules currently indexes static strings and reads helpers from ambient
selection. Combobox supports late-bound strings, arrays, disabled triggers
and regular expressions, and treats explicit Range and Point targets
differently. A merge needs a new dynamic matcher and target semantics before
it can replace the helper. Renaming completion to `tx.inputRules.*` does not
remove its independent responsibility. Retain `BaseComboboxPlugin` and the
small trigger helper; remove its erased registration typing within that owner.
Do not widen InputRules or add `matchInputTrigger`, an input session factory,
a results service or a model-global popup to carry this work.

### Query and activation

Keep the copied component's controlled-or-uncontrolled shape, matching the
existing Ariakit store contract. Its real controlled consumers are emoji and
footnote, which compute feature-specific options from their query. They do
not need a second internal query or a new render-prop protocol.

```tsx
// Controlled feature-specific options.
const [query, setQuery] = React.useState('');
const options = search(query);

<InlineCombobox
  element={element}
  trigger=":"
  value={query}
  setValue={setQuery}
  filter={false}
>
  <InlineComboboxInput />
  <InlineComboboxContent>
    {options.map((emoji) => (
      <InlineComboboxItem
        key={emoji.id}
        value={emoji.name}
        onSelect={(tx) => tx.plugin(emojiPlugin).insert(emoji)}
      />
    ))}
  </InlineComboboxContent>
</InlineCombobox>
```

The shared host creates its existing store with
`useComboboxStore({ value: valueProp, setValue: setValueProp })` and reads
`useStoreState(store, 'value')`. Delete `valueState`, `hasValueProp` and
`startTransition`. Input sizing, filtering and open eligibility read that same
value. A parent-supplied `value` initializes and resets the real input. An
uncontrolled host has no parent query mirror. Mention can drop its unused
search mirror; slash retains its ordinary children and catalog.

Composing keys stop at the shared host's capture boundary before Ariakit
forwards them to an option. Check `nativeEvent.isComposing` and key code 229;
stop propagation without preventing native text confirmation. Native
composition start/end belongs to that mounted host. A pointer gesture that
starts while composing remains refused through its click, even if
`compositionend` occurs first. Keep that gesture eligibility private to the
mounted host and consume it on click/cancellation. Ending composition does
not retroactively authorize it. A keyboard or synthesized activation also
checks current composition. This private state pays for a concrete native
ordering law and is not a public result/session protocol.

An item action captures the query for which that item was rendered. Before
calling `commit`, compare it to the current store query and actual input
value, and verify the originating mount is still live. A mismatch refuses
completion. Document-completion items disable Ariakit's
`selectValueOnClick`, `setValueOnClick` and `hideOnClick` defaults outright.
Those actions duplicate the editor-owned completion exit. Successful content
replacement removes the host; refusal or callback rollback leaves its query
and presentation unchanged. Respect a prevented event before completion,
then invoke a consumer's UI callback only after success. Keep filtering and
active-option navigation in Ariakit. Mandatory item behavior is applied after
caller props so those props cannot silently replace this boundary.

This is a private item/host check, not public result stamps or a new cache.
Query changes are urgent. Feature options update from that query without a
delayed selectable list. Document-dependent options subscribe through the
existing `useEditorSelector` boundary. Footnote creation reads the current
definition set; its canonical transaction already avoids creating duplicate
definitions. For an empty query, compute the automatic next ref in the
transaction rather than capture an obsolete candidate. An explicit numeric
ref retains its existing insertion policy. No new generic result validator
or callback-refusal protocol is needed.

### Trigger and completion boundaries

Keep the exported `triggerCombobox(context, { editor, getState, type })`
shape, configurable state and custom input factory. Read trigger state for
each command; changing a configured trigger still affects the next input.
Keep null disablement, literal strings/arrays, factory fallback, author stamp,
previous-character policy and literal insertion on refusal. Match caller
regular expressions independently of their mutable `lastIndex`, including
both trigger and boundary patterns; do not mutate caller-owned regex state.

Tighten the command-registration type at its owning helper so the inferred
handler agrees with the supplied editor and insertText descriptor. Delete
the `(...args: never[]) => unknown` erasure and double assertion. A type
contract must exercise real feature factories and the custom-input recipe;
callback annotations or caller casts do not count as inference proof.
The public call remains unchanged, so this plan needs no speculative command
factory interface. AI's type-only reuse may stay if that shared trigger state
continues to describe its current job; do not expand AI behavior here.

The command's explicit Range, when supplied, governs the boundary read and
insertion. An explicit Point retains literal insertion. No target means the
current command state selection. Feature predicates must read the command's
calling view/root rather than a model-global editor. Pin supplied-range
behavior with the package boundary before changing any read plumbing.

Keep `read.canEdit(inputKey)`, `api.commit(inputKey, callback)` and
`api.cancel(inputKey, { text, select })`. They already handle live locations,
atomicity, rollback and stale/foreign refusal. Focus the same calling view
only after successful completion; slash's deliberate destination focus stays
feature policy. Manual first-option and wrapping navigation remain unless a
real-control comparison proves the same behavior without them.

### Mounted lifetime

Use the existing selected command view and view facts as the mounted owner.
An author stamp grants document eligibility; it does not identify the
initiating view. Initial autofocus is allowed only in the focused calling
view, and eligibility is separate from autofocus so losing editor focus to
the picker does not disable its own native input. Passive instances may
render the input representation but cannot steal focus or cancel another
instance's draft. A native input's own focus begins its private interaction.
An instance that has never owned native input focus cannot cancel through a
selection change, show an active popup or claim activation. Bind all six
cancellation causes, including deselection, to that same local interaction.
Blur and successful completion consume its ownership; retirement clears it
without document mutation. This private mounted lifetime state is separate
from query and document eligibility.

If view A already owns a query, moving to view B dismisses A and restores its
literal text. This plan offers no cross-view draft transfer; the target may
disappear before B focuses it. Preserve ordinary outside-selection/focus
behavior instead of introducing a transfer protocol.

Retirement disposes presentation and refuses retained actions. Unmount does
not itself rewrite document content. Remount resolves the current key and
starts a fresh local draft; it does not inherit an old instance's query or
focus lease. Blur cancellation applies to the active native input's actual
interaction, not every passive renderer of that node. Existing cancellation
still preserves an outside selection.

The exact focus handoff has not been exercised with the production provider
in this run. Phase 1 must prove that `useEditorFocused` and native-input focus
remain coherent before adopting autofocus gating. Failure quarantines that
change; adding a new global interaction registry is not the fallback.

### Responsibility and deletion ledger

| Code or concept | Target owner and reason | Adoption and regression proof | Risk/verdict |
| --- | --- | --- | --- |
| Wrapper `valueState`, transition and shadow open-query state | Existing controlled value or Ariakit store. One query pays for every read. | Phase 1; initialize/reset, filtering, immediate Enter and query cost. | Delete; counterfactual passes bounded proof. |
| Mention's parent search mirror | Existing uncontrolled Ariakit query; default item filter owns matching. | Phase 1; mention query and insertion. | Delete after verifying the mirror has no option job. |
| Emoji debounce and pending empty-state branch | Synchronous existing search over the current query. | Phase 1; dataset/ranking/limit parity, immediate Enter and measured typing. | Delete; pure search budget passes, browser work remains. |
| Footnote's separate creation and empty predicates | One actual offered-option predicate and existing document selector in the footnote component. Canonical insertion computes a current automatic ref. | Phase 1; unmatched nonnumeric query displays empty, numeric query offers valid creation, remote changes refresh options without duplicate definitions. | Merge; preserve preview search and bracket handling. |
| Bubbling-only composing refusal | Mounted host capture plus gesture eligibility retained from pointerdown through click. | Phase 1; Enter/229 refusal and pointerdown/compositionend/click refusal, followed by native text confirmation. | Replace; capture proof is bounded DOM evidence. |
| Ariakit select/value/hide defaults | Successful document completion removes its host; Ariakit keeps query input and navigation. | Phase 1; permission/stale/duplicate refusal and callback rollback leave query and popup unchanged. | Cut the duplicate completion path. |
| Passive cancellation and popup exposure | Existing host's own active native interaction gates every cancellation cause and activation. | Phase 1; passive deselection cannot remove the active draft; outside-view entry dismisses rather than transfers. | Re-own privately; no global interaction registry. |
| Eligible-everywhere autofocus | Existing mounted view facts, separate from edit permission. | Phase 1; two writable views, passive render, named root and follow-up typing. | Re-own; provider/native proof is mandatory. |
| Erased trigger registration | Current typed command boundary inside `triggerCombobox`. | Phase 2; built-in factories and custom recipe infer; incorrect command/editor calls fail types. | Replace typing without public wrapper aliases. |
| Stateful regex matching | Stateless per-command matching within the trigger helper. | Phase 2; repeated global/sticky trigger and boundary inputs behave identically, caller `lastIndex` is preserved. | Fix within current owner. |
| Input schemas, author stamp and factory | Document identity/eligibility and custom schema construction. | Preserve existing package completion and consumer contracts. | Keep; ordinary text is deferred. |
| BaseComboboxPlugin completion | Live document mutation; independent of typing-rule dispatch. | Keep rollback, stale/foreign refusal and one-step history. | Keep; no InputRules relocation. |
| Copied feature option catalogs and renderer composition | Mention/slash/emoji/footnote product policies. | Feature output and focus proof in Phase 3. | Keep copied; no package catalog promotion. |

### Adoption, at most three phases

Each phase is independently valuable. Its keep/revert/quarantine decision is
recorded against its actual implementation before moving on. The full scope
is not adopted until Phase 3 closes. Implementation is outside this run.

| Phase | Outcome | Gate and disposition |
| --- | --- | --- |
| 1. One mounted query and safe activation | Connect the existing store honestly; remove mirrors/delay; unify offered options; guard composition/current-query/lifetime; bind autofocus to the calling view. | Real shared-control proof and four copied consumers. Immediate query-change Enter/pointer cannot select an older result. Native composition, cancellation and view handoff pass. Complete-query cost meets the frozen gate. Keep on pass; revert or quarantine only the failed change, retain an explicit gap, and do not call the phase complete. |
| 2. Deterministic typed trigger admission | Preserve the existing custom-authoring job while removing registration erasure and regex state dependence. | Narrow combobox partition, explicit Range/Point/root behavior, runtime trigger reconfiguration, custom-input contract and callback inference. No InputRules behavior change. Keep on pass; revert on contract loss. |
| 3. Adoption and regression closure | Prove final native behavior and complete-operation cost; repair teaching and rebuild registry. | Exact browser/provider coverage, final package/www types, current docs examples, registry freshness, behavior-law reconciliation and bound implementation outcome. Keep on pass; quarantine missing native or scale proof without declaring adoption. |

Execution repairs the existing copied-component test mock's missing
`useEditorHistory` export before using that suite. Preserve high-signal tests,
do not port symptom-pinning audit probes as product tests. Add only a public
boundary test for each distinct uncovered defect; a failing assertion must
identify the named regression. Existing semantic/navigation tests stay the
baseline, and source/text checks do not substitute for interaction proof.

Update combobox, mention, slash, emoji and footnote docs in English/Chinese,
their copied examples and the registry changelog as implementation warrants.
Run package/barrel generation only if exports actually change. Package API
or behavior changes get the appropriate changeset. Reconcile editor behavior
law/evidence and repair affected Best API teaching before binding closure.

### Challenge

Architect comparison retained the live-key owner and rejected the broad
InputRules takeover after inspecting its static matcher and ambient-selection
reads. The retained custom-authoring job also rejects deleting factories on
the strength of the four built-in callers alone. Three fresh same-family
Interrogate reviewers then attacked the concrete plan and its decision trail.
Their bounded source review made seven findings, deduplicated into five
material concerns. This is not cross-model diversity or product verification.

| Concern and reviewers | Lead judgment | Change |
| --- | --- | --- |
| Package refusal falls through to Ariakit select/value/hide; A and C | Act on. The installed Ariakit item checks `event.defaultPrevented`, not package completion. | Delete those three default actions for document-completion items. Success exits through node replacement; false/rollback preserves presentation. |
| Passive deselection cancels an active draft; A | Act on. The copied effect currently cancels on every renderer's deselection. | All cancellation causes and active popup exposure require that instance's native interaction. |
| Pointerdown during composition becomes accepted after compositionend; B and C | Act on. Click-time composition alone loses provenance. | Retain the refused gesture through its click/cancellation in the mounted host. |
| Cross-view entry conflicts with blur dismissal; B | Act on. A's blur removes the shared target before B's proposed transfer. | Delete transfer from the target. Leaving A dismisses/restores text and preserves outside focus. |
| Same-query document updates stale footnote creation; B | Act on option freshness; dismiss the need for a generic atomic-refusal API. The current canonical `createDefinition` already rechecks the definition and reuses an existing one. | Use the existing selector for document-dependent options; automatic refs are computed by the current insertion transaction. |

Challenge delta: improved. The target loses cross-view transfer and Ariakit's
duplicate completion actions. It assigns passive cancellation and pointer
eligibility to private native-interaction lifetime, and current document
options to their existing feature owner. All three reviewers returned no
residual findings in the single bounded replay. No second architecture plan
or universal validation owner is added.

Workflow reflection applies the Reflect skill's skip for a session already
covered by its existing rules. Semantics-versus-representation comparison,
prior-history reconciliation, source identity, native-proof limits and scoped
artifact policy all have owners. The corrected timestamp and bounded tool
retries are one-offs, not reasons to add instruction prose. No vendor skill,
shared workflow, teammate instruction or runtime integration changes.

The design run closes 12 items: 10 done, 2 skipped, none blocked or open.
The skips are product implementation and product lint. This closes the design
job, not the three future adoption phases. The target is selected; its native
provider/focus, final type and complete-operation gates must run during
implementation before the affected change is adopted. This record makes no
whole-plan execution-ready or regression-free product claim.

The global review-ledger check is already red for the unrelated
`browser/markdown-streaming-contract` inventory. Its stored fingerprint is
`30d3f516f8f7769594309d73f56310c41a077034ad3d0301becbe040035c0a06`;
the current fingerprint is
`0ab86dc03a9e872473f7ad67100316dbe1783c760e02c068ec5ad6903804d2f1`.
This run does not refresh or attest another session's streaming inputs.
Validate the autocomplete outcome/source bindings separately, render the
ledger normally, and preserve this global check failure as a limit.

## Proof

Planning proof is bounded to the observed source and disposable candidate. Future
adoption must prove native input, final document, history, root, focus and
follow-up typing on the actual copied consumers. Unit or DOM proxies alone do
not close native browser claims. Performance acceptance compares complete
operations and current outputs, without throttling or weaker semantics.

### Observed design evidence

The unchanged combobox package partition passed 52 tests in the governing
audit. This run reuses that dated evidence because its product source has not
changed. It does not call that a fresh package or browser run.

The disposable candidate intercepts the actual copied shared host, requires
each of its three substitutions to match once, and records both source hashes.
It connects controlled value, removes shadow query/transition and adds capture
refusal. It does not implement pointer-composition, stale-item or retired-mount
eligibility, nor the production focus handoff. Those are adoption gates.

Baseline shared-host SHA-256:
`14e5c23f7d4c66cf072442c7935606822400e06951a12359115443ec5072984f`.
Candidate shared-host SHA-256:
`5d3619277f94af963dc7038c19dea97df49a5f4ffcecc33cb5970a54c2884041`.

The real-Ariakit Happy DOM fixture uses an actual core editor and
BaseMention/BaseCombobox, with mocked Plate React hooks. Runtime is Bun 1.3.12,
React 19.2.8 and Ariakit 0.4.17 on Apple M5 Max/arm64, macOS 26.3.1. The candidate passes
4 tests and 36 assertions. The baseline fails the two desired-behavior cases
for controlled initialization and composing Enter; ordinary Enter and the
comparable query operation pass. A baseline failure here is evidence of those
known defects, not a claim that both arms are green.

Two warmups and five alternating process samples produce these medians for
eight query edits, filtering and render flush. Only the picker is mounted; the
document size supplies its core editor state, not a rendered whole editor.

| Document blocks / options | Baseline ms | Candidate ms | Frozen maximum ms | Result |
| --- | ---: | ---: | ---: | --- |
| 1 / 8 | 22.828 | 19.901 | 39.242 | Pass |
| 1,000 / 60 | 63.426 | 45.194 | 100.139 | Pass |
| 1,000 / 250 | 222.015 | 159.995 | 338.023 | Pass |

Both comparable arms finish with the same query/options, nine parent renders
and no query-induced document publication. This is a headless owner feasibility
gate, not native latency, paint or a browser speedup claim.

The actual emoji dataset contains 1,870 entries. Nine representative queries,
including no results and 500 characters, use 20 warmups and 200 samples each.
The largest per-query p95 is 0.283 ms against the frozen 8 ms budget. Ranking
and the 60-result limit stay unchanged. Pure search cost supports removing
the 100 ms timer here; total picker typing/render cost still needs production
measurement.

Local runner, candidate, packets and emoji results are in
`node_modules/.cache/autocomplete-plan/`. They are disposable run artifacts
and are not committed. Their source hashes and bounded conclusions are kept
here; a fresh checkout cannot rerun those raw files without reconstructing
the fixture. This plan does not treat their local availability as durable
browser or adoption evidence.

### Regression and complete-operation gates

Use the existing `apps/www/tests/browser/combobox.spec.ts` owner and the actual
four copied consumers. First repair the component-test mock load failure;
do not report zero executed tests as a passing control suite. Bind browser
receipts to the served source and runtime identity.

Preserve the existing tests for live moved/deleted inputs, foreign authors,
read-only state, synchronous callback rollback, one history entry and duplicate
refusal. Add proof only where those owners do not cover the defect. Native
proof covers urgent query changes followed immediately by Enter or pointer,
composition confirmation/229, Escape and boundary exits, blur to outside
selection, exact focus and follow-up typing. Each feature exercises its own
selection policy; footnote also proves numeric creation and nonnumeric empty.

Mounted proof uses the real provider with two writable views, a named root,
suggestion projection, permission changes and unmount/remount. A passive
renderer cannot autofocus or cancel the active input; a retained retired action
refuses; completion and follow-up typing affect the intended surviving view.
Remote edits preserve live-key eligibility and location. Replay the native
and lifetime reporter sequences five times without retries. Synthetic keyboard
events establish event-handler refusal, not a claim of physical OS IME proof;
that limitation stays explicit unless the matching native capability runs.

Freeze baseline/candidate budgets before execution measurements. Compare
query typing through options publication and Chromium render separately from
completion through document publication, focus and follow-up typing. Preserve
the existing completion budget at 1, 20, 100 and 1,000 blocks, two warmups and
five alternating samples, median no worse than baseline * 1.5 + 5 ms. Completion
publishes once and adds zero persistent anchors. The 8/60/250-option query gate
uses the same median limit, with identical options and document outputs.
Report input-to-paint as well as total CPU; do not infer browser cost from pure
emoji search. Any adoption failure stays open or quarantined rather than
being closed by the disposable design candidate.

### Embedded probe contract, frozen before measurement

Compare the unchanged copied host with a disposable counterfactual that keeps
the same input schema and completion owner, connects controlled value to the
existing Ariakit store, removes the shadow query/transition, and intercepts
composing keys at the host capture boundary. Product source remains untouched.

Normal: one paragraph and 8 options. Large: 1,000 paragraphs and 60 options.
Stress: 1,000 paragraphs and 250 options. Pathological: a 500-character query
against the real emoji dataset. Independent variables are document size,
mounted option count, query length and query updates. The repeated unit is
one mounted picker, not a store or listener per document block.

Use two warmups and five alternating baseline/candidate samples. The headless
complete-query median must be no worse than baseline * 1.5 + 5 ms; differences
within max(10%, 2 ms) are inconclusive for speed. This gate rejects a material
owner regression, not native input latency. Both arms must finish with identical
query, filtered options and untouched document during query edits. Candidate
must additionally honor initial/reset value and refuse composing Enter.

Emoji search uses the actual configured dataset and all result limits unchanged.
Its per-query p95 must stay below 8 ms on this host for removal of the timer to
be accepted here; production typing/render proof remains an adoption gate.
No store, persistent anchor or editor-global subscription is added. Keep raw
source hashes, command, runtime, fixtures and alternating samples in local
artifacts. No screenshots or raw run artifacts are committed.
