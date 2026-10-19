# Autocomplete ownership audit

Date: 2026-09-30
Status: Complete
Verdict: Pursue

## Objective and acceptance

Reconcile the earlier combobox work, audit all shared interaction owners and
their real consumers, and select the smallest justified next design. Completion
requires a disposition for every selected unit, current-source evidence,
explicit proof limits and one recorded review. This is an assessment, without
product implementation or publication. Search and AI product redesign remain
outside scope. No external dependency or human decision blocked the assessment.

Throughput checkpoint: n/a, read-only investigation.

- [x] Reconcile historical decisions and subsequent execution.
- [x] Inspect six shared units and four production inline consumers.
- [x] Compare keep, API change, addition, deletion, owner move and replacement.
- [x] Verify the decisive current boundaries through retained probes.
- [x] Record the verdict and its adoption/proof limits in the review ledger.

## Verdict

**Pursue one mounted query and activation owner.** The current wrapper exposes a
controlled `value` without giving it to Ariakit, maintains a second query for
open eligibility, and lets consumer search lag behind selectable options.
Composing Enter can reach item activation before its bubbling guard. These are
concrete reasons for work, independent of whether the temporary input nodes
survive the next design.

The strongest larger cut is ordinary editor text plus a view-local matched
range and popup, replacing four transient input schemas and native-input focus
handoff. Prior work deferred this comparison. Lexical and Tiptap demonstrate
the alternative state model, but their source does not certify Plate parity.
Compare it first in the design. Do not adopt it without the native, history,
collaboration, projection and scale evidence below. A new editor-global
autocomplete manager, results store, session class or feature catalog would
add an owner without solving these laws.

Retain atomic completion, live location, rollback, stale-target refusal and
typed feature operations. Mention, slash, emoji and footnote keep their own
product policies. Popup navigation, options and dismissal belong to the exact
mounted interaction. A temporary input's presence and `userId` establish node
eligibility, but do not identify which of two writable views initiated it.

## Coverage

Expected shared units: 6. Reviewed: 6. Excluded shared units: 0. Unreviewed: 0.
Two replacement/proof questions remain unresolved; coverage is not adoption.
Four actual `InlineCombobox` consumers were inspected. Tag uses `SelectEditor`
and is contextual comparison only. AI space activation imports the common
trigger state type but is a distinct interaction and is excluded from adoption.

| Unit | Disposition | Evidence and next owner |
| --- | --- | --- |
| Trigger recognition and registration | Pursue a smaller typed owner | Four features use `triggerCombobox`, an erased command-registration contract plus a factory/getState protocol. A retained public-boundary probe shows `/@/g` admits identical input on attempts 1 and 3 only. Compare the existing input-rule owner before adding a trigger protocol. Its present selection context does not resolve explicit targets automatically, so reuse is conditional. Task plan. |
| Temporary input identity and lifetime | Defer replacement, retain current baseline | September eliminated retained point refs and secondary sessions. The current query remains local renderer state, while the input node is document content. Compare ordinary text and a mapped view-local match against local-only draft semantics, remote edits and authored roots. Task plan's bounded comparison. |
| Atomic completion and cancellation | Keep | `BaseComboboxPlugin` resolves a live key in the calling view and runs removal/restoration or typed insertion in one transaction. Current package tests cover moves, deletion, foreign users, read-only views, duplicate actions, named roots, rollback and undo. Preserve the law with either identity model. |
| Query and selectable results | Pursue one owner | Real-Ariakit probe confirms ignored initial/reset `value`. Emoji keeps old ranked options during the debounce. Footnote can suppress empty presentation when no create item is rendered. Cut duplicate query ownership and ensure results match the current query. Task plan. |
| Navigation, activation and IME | Pursue correct event ownership | Real-Ariakit DOM probe invokes completion on composing Enter, including `keyCode=229`, while the wrapper returns from its bubbling guard. Do not infer native parity from mocked Ariakit tests. Manual first-item selection and arrow wrapping remain deletion candidates requiring actual-control navigation comparison. Task plan. |
| Mounted view/root and teardown | Keep exact-view law; investigate initiator identity | Existing API context uses the calling view and key, rather than a saved source editor/path. Both eligible renderers can request autofocus. A two-view/named-root browser probe must settle focus, blur cancellation and remount semantics. A global popup owner loses this lifetime. Task plan. |

| Consumer | Required product policy | Current finding |
| --- | --- | --- |
| Mention | Ref/label insertion and hidden `@` presentation | Parent query state only mirrors the control; it has no separate job. |
| Slash | Explicit catalog, installed capabilities, groups, keywords and destination focus | Keep typed feature insertion inside completion and UI work after successful completion. Do not merge the slash catalog into combobox. |
| Emoji | Dataset, ranking, trailing-colon matching and result limit | Results use a 100 ms old query while the current input and old selectable items coexist. Hide pending empty text alone does not fence activation. Synchronous search is indexed; removing the delay needs measured current-dataset cost, not a speed claim. |
| Footnote | Ref/preview matching and numeric creation | For no refs and query `zz`, `showCreateOption` is true because `1` is free, but the create item is not rendered. Empty presentation is nevertheless suppressed. Derive it from offered options. |
| Tag, contextual only | A dedicated select editor and selected document nodes | It already keeps its query as document text. It is not an inline-combobox consumer. Its separate mirrored command search does not justify folding the hosts together. |

## Historical reconciliation

| Source | Retain, reopen or supersede |
| --- | --- |
| July 10 combobox and July 13 slash package reviews | Retain Plate trigger policy, canonical transactions and distinct slash policy. Root APIs, legacy overrides and compatibility wrappers did not earn a place. |
| Issue 4778 | Retain live cancellation location. Its stored `PointRef` technique was superseded by September's action-time key resolution. |
| August 29 trigger repair | Retain Plite's semantic-command ownership at synchronized native selection. Earlier package/proxy success failed mounted replay and does not support a registry workaround. |
| August 30 popup repair | Retain the Plite render/invalidation fix. Changing Ariakit offsets was rejected because geometry was not the cause. |
| September 7 extraction audit and execution | Retain live-key completion and the deletion of persistent anchors/subscriptions/removal flags. Execution superseded the audit's larger session protocol. Reopen only its deferred temporary-node replacement comparison. |
| September 16 slash suggested-paragraph execution | Retain exact calling-view binding for completion and history. A projected interaction cannot silently use the source document. |
| September 18 slash ownership and execution | Retain separate feature policies and typed insertion. This review does not reopen its product catalog or promote copied UI wholesale. |
| September 12 accessibility ownership | Retain exact-view focus and distinct announcement/traversal jobs. A unified focus or announcement manager does not follow from the autocomplete defects. |
| September 21 input-rule convergence execution | Use its adopted canonical middleware as a current comparator. It did not adjudicate combobox replacement, and its explicit-target context needs inspection before reuse. |

The three recovered autocomplete executions are historical-unbound. Their
reports are evidence of earlier work, not fresh browser certification or proof
bound to this review. Related slash proof cannot certify autocomplete.

## Alternatives

| Lane | Assessment |
| --- | --- |
| Keep/configure everything | Loses to current ignored-control, stale-result and composing-activation evidence. Keep the sound completion owner. |
| Change existing contracts | Wins for a single query owner, current-query activation and typed trigger context. Do not expose a fake controlled prop. |
| Add a session or shared results owner | Rejected. Live target identity, current transactions and the mounted control already provide these jobs. Current consumers have synchronous results; a universal async-source API has no current requirement. |
| Delete/merge/inline | Cut the query mirror, unjustified delay and duplicated trigger registration if the canonical owner preserves semantics. `filterWords` has a clear independent algorithm and tests; one current caller alone does not prove it should become product policy. |
| Move ownership | Trigger recognition and completion stay Plate-owned; product catalogs stay copied. Generic native range/input support, if missing, belongs to Plite. Mounted query presentation must not move into the editor-global runtime. |
| Replace architecture | Ordinary text with a matched range is the strongest candidate. It can remove input descriptors, factories, owner stamps and literal-text restoration. Local-only query semantics, escape suppression, cancellation, remote mapping and history still need explicit design. No engine replacement or performance claim is selected. |

Redesign from First Principles changed the comparison from promoting the
current wrapper to testing whether temporary input schemas should exist at all.

## Current and proposed call shape

Current, abridged from `emoji.tsx`:

```tsx
const [value, setValue] = React.useState('');
const debouncedValue = useDebounce(value, 100);
// Results use debouncedValue while the input uses Ariakit's own value.
<InlineCombobox element={element} value={value} setValue={setValue} filter={false} trigger=":">
  <InlineComboboxInput />
  <InlineComboboxItem onSelect={(tx) => tx.plugin(emojiPlugin).insert(emoji)} />
</InlineCombobox>
```

Proposed ownership shape only; these are not selected public signatures:

```tsx
<InlineCombobox /* exact mounted match; one canonical query */>
  <EmojiOptions /> {/* reads that query; only its current results can activate */}
</InlineCombobox>
// A chosen option still performs one inferred transaction at its live target:
// tx.plugin(emojiPlugin).insert(emoji)
```

Detailed design must choose between an honest Ariakit-controlled value and
ordinary editor text. It must not add a second query just to connect result
policy. Final call signatures belong to that design.

## Verification evidence and limits

- `pnpm --filter platejs test:partition:combobox`: 52 pass, 0 fail, 97 assertions.
- `current-boundaries.spec.tsx`: four observational probes pass, six assertions.
  They pin ignored controlled input, ordinary/composing Enter activation, and
  stateful-regex admission. The composing probe first asserted non-activation
  and failed with one callback; the retained assertion records the defect.
- These probes use real Ariakit and real package completion under Happy DOM.
  Plate React hooks are mocked to provide a selected editor. They do not prove
  provider lifecycle, browser IME or a physical input method. Ordinary Enter is
  a positive control, so non-activation is not inferred from an inert option.
- The existing copied `inline-combobox.spec.tsx` cannot load on the final source
  because its `platejs/react` mock lacks `useEditorHistory`. No cases execute.
  This is an uncovered test-harness boundary, not a passing UI suite.
- Emoji's stale-query activation window and footnote's empty-state mismatch are
  source-derived findings. Their actual picker interactions need browser proof.
- No new browser run, full typecheck, native-device replay or runtime benchmark
  ran for this assessment. The current www Playwright configuration declares
  Chromium, Firefox and WebKit; historical Chromium-only limits are not its
  current configuration.
- Local Lexical and Tiptap source comparisons are commit-pinned in the review
  record. No latest-version, safety or performance equivalence is asserted.
- The global ledger check reports an unrelated stale
  `browser/markdown-streaming-contract` inventory fingerprint. This assessment
  does not refresh other owners' inventory or certify their changed evidence.
  Scoped record validation and autocomplete source freshness are checked
  independently.

Rerun the retained observations in an isolated process:

```sh
bun test --preload ./config/plite-source-test-setup.ts ./docs/research/probes/2026-09-30-autocomplete/current-boundaries.spec.tsx
```

## First design action and adoption gates

Compare current input nodes with ordinary text and a view-local matched range
using the real control. Before picking replacement, exercise composing Enter
and arrows, selection cancellation, literal text, moving/deleting targets,
undo/redo, suggestion views, remote changes, two writable views and a named
content root. Explicitly decide whether query text is ordinary saved/shared text
or a local draft; do not smuggle that behavior change into a schema deletion.

Measure complete recognition/query/publication/render/commit cost against the
current implementation at small and large documents and the real emoji dataset.
Do not infer performance from fewer descriptors or a synchronous search API.
Whether the replacement wins or loses, the one-query/activation laws and
consumer defects remain part of the same bounded adoption plan.

Next invocation:

```text
$task plan autocomplete: reconcile the September live-key completion design; compare temporary input nodes with ordinary editor text and a view-local matched range, preserving atomic completion, local/remote and authored-view laws; choose one query owner, fence composing and stale-result activation, reuse canonical input rules where they fit, and repair the emoji/footnote consumer boundaries with real-control browser and scale proof
```
