# External text view substrate

Objective:

Close every Plite gap required to host an external text editor over one
canonical text block. The plan is ready when the model, public API, mounted-view
runtime, browser behavior, scale contract, adoption, and proof owners all have
one resolved decision.

Flow mode:

- Agent-led architecture plan. Execution requires explicit acceptance of this
  exact file.

Goal plan:

- `docs/plans/2026-09-03-editable-island-substrate-closure.md`

Primary template:

- `docs/plans/templates/plite-plan.md`

Applied packs:

- `performance-observability`
- `browser`
- `package-api`
- `docs`

Mode:

- `deep`: this is a public model and DOM-runtime rearchitecture. It changes
  schema law, DOM coverage lifetime, input ownership, native selection,
  history, collaboration projection, and a scale-sensitive rendering path.

Completion threshold:

- Delete the schema-level `editable-island` void kind and every live public,
  runtime, test, example, benchmark, and current-doc claim that depends on it.
- Add one `slots.externalText(...)` contract for a normal block whose compiled
  grammar and live value both contain exactly one direct `Text` child.
- Keep the Plite document, model selection, history, replay, collaboration, and
  decorations canonical. The external editor owns only its mounted DOM and
  local native interaction.
- Make DOM coverage explicitly local to one mounted editor view. Two
  `<Editable>` views over one editor may use the same local boundary IDs without
  overwriting or unregistering each other.
- Pass the fake-adapter behavior matrix and the frozen production-substrate
  benchmark. Do not claim CodeMirror or production code-block integration.
- End each of the three execution phases with a keep, stop, or reassess
  checkpoint. A failed correctness veto stops later phases.

Verification surface:

- `packages/plitejs` schema compiler, canonical representation, transactions,
  text transforms, DOM coverage, React rendering, input routing, selection,
  composition, clipboard, drag, focus, history, decorations, and browser
  handles.
- Plite package tests, contract typechecks, `apps/plite` browser proof, the raw
  Plite examples sourced from `apps/www`, generated API/registry outputs, and
  current Plite docs.
- A disposable matched Chromium projection probe at 9.8 KB, 98 KB, 490 KB,
  and 4.9 MB; one, 100, and 1,000 mounted blocks; plain, one whole-Text mark,
  and code-shaped content.
- A future test-only textarea adapter for native behavior and a bounded fake
  adapter for scale. Neither is a CodeMirror implementation or a product
  recommendation.

Constraints:

- No CodeMirror package, adapter, demo, dependency, or implementation in this
  plan.
- No CodeLine or line-break model nodes. Physical lines remain `\n` inside one
  canonical `Text`.
- No second document, selection, history stack, collaboration state, editor
  extension store, or app-managed copy of the text.
- No generic per-block virtualizer and no viewport-only token wrappers in
  Plite's normal DOM-present text path. Existing top-level explicit
  virtualization remains separate.
- The external adapter may bound or virtualize its own DOM. Plite imposes no
  fixed height; layout and internal scrolling belong to the adapter.
- Breaking changes are allowed. Do not add aliases, dual signatures, runtime
  shims, or deprecated schema spellings.
- Planning may change this plan and its disposable benchmark artifacts only.
  Product source changes start after acceptance.

Boundaries:

- In scope: the exact-one-Text model domain; schema and void cleanup; public
  React adapter types; view-local DOM coverage; model-to-view and view-to-model
  text patches; selection and focus transfer; boundary navigation; input,
  composition, clipboard, cut, paste, and drop ownership; history and replay;
  collaboration updates; Plite decorations; read-only changes; SSR/hydration;
  element move/remove/replacement; named roots; multiple Editables; independent
  editors; accessibility; diagnostics; exports; tests; examples; docs; and
  performance.
- The supported element grammar is exactly one direct text child: compiled
  content has `min: 1`, `max: 1`, allows text, and allows no element child.
  Whole-Text properties are valid. Per-range marks, multiple text leaves,
  inlines, and nested rich content use Plite's native retained DOM instead.
- `slots.contentRoot(...)` remains the owner for same-runtime named roots.
  True voids remain atomic shells. Neither job is an external text view.
- Plate's current code-block schema is adoption evidence because it already
  requires one direct Text. Plate code-block rendering stays unchanged until a
  separate adapter plan is accepted.
- Browser find, spellcheck, screen-reader traversal, print layout, syntax
  parsing, and rich drag payloads inside the delegated view belong to the
  adapter. Plite must document that delegation and prevent double handling.

Output budget strategy:

- Keep the full decisions in this file. Keep raw samples and source hashes in
  `docs/plans/artifacts/editable-island-substrate-closure/`. Report only the
  decisive percentiles, counters, and limitations here.

Blocked condition:

- Stop execution when model and external view can diverge, when one native
  interaction has two owners, when a stale adapter transaction can mutate the
  model, when multiple mounted views share mutable coverage state, or when the
  production-substrate rerun misses a frozen veto. Do not rescue the design by
  adding a second model, restoring editable voids, or weakening the contract.

Plite Plan state:

- status: ready-for-user-review
- phase: prove-and-hand-off
- next: wait for explicit acceptance, then execute Phase 1 only
- handoff: prepared

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Active goal and plan verified | yes | The active goal names this file and requires every owner gap, adoption slice, and proof slice to resolve. |
| Current owners read | yes | Live schema, compiler, representation, DOM coverage, render, event, selection, commit, decoration, history, examples, docs, and code-block owners were traced. |
| Best API target resolved | yes | The hard-cut target is a normal exact-one-Text block plus `slots.externalText({ adapter, config, ariaLabel })`; schema-level editable islands are deleted. |
| Runtime scale applicability resolved | yes | Text bytes, mounted external views, mounted Editables, changed spans, decorations, subscriptions, listeners, React commits, DOM nodes, and DOM text are independent scale variables. |
| Pre-acceptance Benchmark probe selected | yes | The matched current-void versus bounded-normal-block Chromium probe ran across four sizes, three fixture kinds, and three block counts. |
| Prompt requirements captured | yes | All Plite gaps, no CodeMirror implementation, and permission for breaking rearchitecture are explicit constraints. |
| Mode and execution boundary resolved | yes | Deep planning only; no substrate source is changed before acceptance. |
| User-facing operation and runtime owner identified | yes | Mount, local edit, remote patch, selection transfer, and undo are owned by one `EditableDOMRuntime` and its registered external views. |
| Scale variables and cohorts fixed | yes | The scale contract below fixes bytes, blocks, views, Editables, changes, decorations, and normal through pathological cohorts. |
| Budget frozen before production measurement | yes | Absolute latency, DOM, fan-out, reset, subscription, and correctness limits are declared below and may not be loosened during execution. |
| Baseline and target probe selected | yes | Current `void: 'editable-island'` plus its spacer is the baseline; a normal exact-one-Text block with bounded foreign DOM is the target probe. |
| Correctness guard selected | yes | Exact model text, public text projection, model selection, adapter state, commit count, history, replay, and follow-up input are mandatory. |
| Production detector decision recorded | yes | Extend existing anonymous DOM-strategy diagnostics with counts only; never record text, selection content, keys, or document identifiers. |
| Browser route / app surface identified | yes | Add one raw Plite external-text example under the existing `apps/www` Plite example owner and consume it from `apps/plite`; do not create a second example tree. |
| Browser tool decision recorded | yes | Use Browser for ordinary route/DOM/focus proof, Chrome for real clipboard and exact Chrome IME replay, and the existing Playwright matrix for repeatable cross-browser closure. |
| Console/network caveat policy recorded | yes | Final route proof records console errors; network is expected to be idle because adapters and fixtures are local. Any unexpected request fails the fixture. |
| Observable browser case captured | no | This is architecture work without a reporter case. The execution matrix supplies new stable case IDs and final fingerprints. |
| Public surface or package boundary identified | yes | `plitejs`, `plitejs/dom`, and `plitejs/react` lose editable-island and editor-global coverage calls and gain the external-text adapter surface. |
| Release artifact path selected | yes | Current `main` has no `packages/plitejs`; no changeset describes branch-only removal. Execution rechecks `main` and adds one `plitejs` patch changeset only if that baseline changes. |
| `changeset` skill loaded | yes | The skill was read; `minor` is forbidden for `plitejs`, one package belongs in one file, and release prose is always relative to `main`. |
| Barrel/export impact decision recorded | yes | React and DOM exports change; run `pnpm brl` and include only generated output produced by the owner. |
| Docs lane selected | yes | System/concept plus API-reference docs: selection/DOM, Editable, DOM coverage, DOM library, editor API, example docs, and proof map. |
| `docs-creator` and style doctrine loaded | yes | Current-state reference voice, source-backed API names, leaf links, and an Unslop file pass are required. |
| Target and sibling docs read | yes | Selection And DOM, Editable, DOM Coverage Boundaries, Plite DOM, Roots, and the editable-void example were read with their source owners. |

Explicit requirement ledger:

- [x] Inventory all Plite gaps, including core, DOM, React, browser, history,
      collaboration, scale, exports, tests, examples, and docs.
- [x] Do not implement or add CodeMirror.
- [x] Permit public breaks and rearchitecture instead of preserving the current
      hybrid.
- [x] Keep external-view delegation separate from Plite's explicit document
      virtualization.
- [x] Keep the execution plan to three checkpointed phases.
- [x] Run a pre-acceptance scale probe before locking the hot architecture.
- [x] State what this substrate cannot prove without a real external editor.

## Decision brief

- outcome: delete editable islands as a schema concept; add external text views
  as a mounted-view capability over ordinary canonical content
- chosen shape: one normal exact-one-Text block, one view-local adapter slot,
  one canonical Plite transaction stream, and one coverage session per mounted
  Editable
- strongest rejected alternative: keep `void: 'editable-island'` and patch each
  void special case. That preserves a contradiction: the node is addressable as
  text in some queries and atomic in representation, marks, deletion, slicing,
  DOM conversion, and rendering.
- consequence: a future CodeMirror adapter is small and honest, but the Plite
  substrate must first own view lifetime, transaction versioning, event
  exclusion, selection transfer, decoration projection, and multi-view fan-out.

## Current-source findings

| Finding | Live evidence | Consequence |
| --- | --- | --- |
| Editable island is serialized as a void kind | `packages/plitejs/src/interfaces/schema.ts:349`; compiler branches at `core/schema-compiler.ts:1912-1957` | The persisted schema carries a rendering workaround. Cut it. |
| Core semantics disagree about editability | `positions()` enters island text, while 40 source files use generic void branches across commands, reads, marks, deletion, slicing, DOM, and React | Patching exceptions would be permanent semantic debt. A normal node removes the split. |
| Public text projection drops island text | `core/representation.ts:409-500` skips every void; the red benchmark records direct text as exact while public text length is zero | This is a correctness failure, not only a performance problem. |
| The current shell mounts hidden canonical text | `react/components/plite-void-shell.tsx:20-24` puts children in `PliteSpacer`; the 4.9 MB baseline mounts about 4.9 million DOM text units | Editable-island cannot be the bounded-DOM solution. |
| Custom rendering still prepares unused children | `react/components/editable-text-blocks.tsx:920` calls `renderChildren()` before the custom-render branch | `externalText` must be truly lazy and must forbid reading both projections. |
| No foreign input owner exists | `react/editable/input-controller.ts:98-185` recognizes nested Plite roots and native controls, not a registered foreign editor host | Outer beforeinput, keyboard, composition, clipboard, drag, focus, and selection logic can double-handle a foreign editor. |
| DOM point conversion collapses void descendants | `dom/plugin/dom-editor.ts` resolves a containing void shell instead of the direct text offset | A void cannot preserve external offset selection truthfully. |
| DOM coverage has the wrong lifetime | `dom/plugin/dom-coverage.ts:174-194` stores one registry per editor and keys boundaries only by local ID | Two mounted views can overwrite a boundary; either cleanup can unregister both. |
| A mounted Editable already has a private runtime | `react/editable/editable-dom-runtime.ts:61-176` tracks multiple runtimes; `EditableDOMRuntimeContext` supplies the exact mounted owner | External views and coverage belong there, not in an editor extension store. |
| One commit fence already owns view updates | `react/components/editable-dom-commit-fence.tsx:76-88` has one commit subscription per Editable and can skip React commits | Reuse it for external patch fan-out; never subscribe once per block. |
| Decorations already have keyed node-local slices | `react/decoration-source.ts` exposes manager snapshots by `NodeKey` and one changed-key subscription | Pass neutral slices to the adapter; do not build a second decoration system. |
| Content roots are independent | `slots.contentRoot(...)` owns a same-runtime named document root; the current editable-void example stores its rich body there | Keep content roots. Migrate the example to a true block void or a normal host. |
| Plate code blocks already fit the model | `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:305-312` requires one direct Text | No Plate schema or CodeLine work is needed for this substrate plan. |

Direct-name audit at the planning ref:

- Four Plite source files, 12 Plite package-test files, three browser/proof
  files, seven live example/doc files, and one benchmark file directly contain
  `editable-island`, `editableIsland`, or `isEditableIsland`.
- Historical issue ledgers and old completed plans are evidence, not current
  teaching. Preserve their text.
- Generated API and registry files are regenerated from source; never edit
  them by hand.

## Public target

Normal usage:

```tsx
const renderElement = ({ attributes, element, slots }) => {
  if (element.type !== "code_block") {
    return <p {...attributes}>{slots.children()}</p>;
  }

  return (
    <pre {...attributes}>
      {slots.externalText({
        adapter: textEditorAdapter,
        ariaLabel: "Code editor",
        config: { language: element.language },
      })}
    </pre>
  );
};
```

The public concepts are deliberately small:

```ts
type ExternalTextChange = Readonly<{
  from: number;
  insert: string;
  to: number;
}>;

type ExternalTextSelection = Readonly<{
  anchor: number;
  focus: number;
}>;

type ExternalTextSelectionState = ExternalTextSelection &
  Readonly<{ mode: "model" | "native" }>;

type ExternalTextState<TConfig> = Readonly<{
  config: TConfig;
  decorations: readonly ExternalTextDecoration[];
  readOnly: boolean;
  selection: ExternalTextSelectionState | null;
  text: string;
  version: number;
}>;

type ExternalTextDispatchResult = Readonly<{
  status: "applied" | "read-only" | "stale";
}>;

type ExternalTextActions = Readonly<{
  composition: (phase: "end" | "start") => void;
  deleteOut: (input: {
    baseVersion: number;
    direction: "backward" | "forward";
  }) => ExternalTextDispatchResult;
  dispatch: (input: {
    baseVersion: number;
    changes: readonly ExternalTextChange[];
    intent: "composition" | "cut" | "drop" | "input" | "paste";
    selection: ExternalTextSelection;
  }) => ExternalTextDispatchResult;
  history: (direction: "redo" | "undo") => boolean;
  navigateOut: (input: {
    baseVersion: number;
    direction: "backward" | "forward";
    extend?: boolean;
    x?: number;
  }) => ExternalTextDispatchResult;
  select: (input: {
    baseVersion: number;
    selection: ExternalTextSelection;
  }) => ExternalTextDispatchResult;
}>;

type ExternalTextView<TConfig> = Readonly<{
  destroy: () => void;
  focus: (options?: {
    edge?: "end" | "start";
    x?: number;
  }) => void;
  update: (input: {
    changes: readonly ExternalTextChange[] | null;
    state: ExternalTextState<TConfig>;
  }) => void;
}>;

type ExternalTextAdapter<TConfig = undefined> = Readonly<{
  mount: (context: {
    actions: ExternalTextActions;
    host: HTMLElement;
    state: ExternalTextState<TConfig>;
  }) => ExternalTextView<TConfig>;
}>;
```

`slots.externalText` infers `TConfig` from the adapter and `config` without
caller generics, annotations, or casts. Omitting `config` infers `undefined`.
The adapter object is stable; config changes arrive through `update` and do not
force remounts.

Contract laws:

- Offsets are UTF-16 string offsets. Changes are ordered, non-overlapping, and
  expressed against `baseVersion` before coordinates.
- `changes: null` means reset the external document from canonical `state.text`.
  A list means apply exact incremental patches. Ordinary local edits, remote
  edits, history, and composition may not fall back to a full-string diff.
- `mode: 'native'` is legal only for the focused mounted view when both model
  endpoints are inside this text. Cross-boundary and inactive-view selections
  use `mode: 'model'`; the adapter paints them without stealing focus.
- `dispatch` applies text and final selection in one Plite update. It rejects
  stale versions and read-only edits without touching the model. A stale view
  receives a canonical reset.
- The adapter disables its own undo stack. `history()` delegates to the one
  installed Plite history owner and returns `false` when unavailable.
- `navigateOut` and `deleteOut` are the only cross-boundary command bridge.
  The adapter owns local visual-line and bidi decisions, then asks Plite to move
  or delete at the normal model boundary.
- `composition('start' | 'end')` connects the foreign native composition epoch
  to Plite's existing composition and history policy. Canonical commits remain
  the authority during remote or history updates.
- Plite decorations are lowered to keyed offset slices. Syntax parsing and
  syntax state remain adapter-owned. Internal selection decorations are
  filtered so native and model selection never paint twice.
- Calling `slots.children()` and `slots.externalText()` for the same element,
  calling `externalText()` twice, or using a non-exact-one-Text grammar throws a
  clear invariant error before two editable DOM owners mount.

Low-level DOM coverage becomes explicitly view-scoped:

```ts
const coverage = DOMCoverage.create(editor);

const unregister = coverage.registerBoundary(boundary);
const result = coverage.resolveDOMPointOrBoundary(point);

unregister();
coverage.destroy();
```

All current editor-argument static methods move onto the returned coverage
session. `EditableDOMRuntime` owns one session and passes it to caret,
selection, clipboard, geometry, metrics, and boundary components. Local
`boundaryId` values remain stable inside a session. No compatibility methods
remain on the factory.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Schema identity | `void: 'editable-island'` mixes model and view policy | Ordinary non-void exact-one-Text element | Plite schema/compiler | Text must stay addressable by every core law | Delete public behavior fields and direct consumers | compiler/type/public-surface tests plus zero live-name audit | branch users must change schemas | cut |
| Core text semantics | Queries and transforms disagree because some enter the child and others skip voids | All ordinary text reads, marks, slice, delete, insert, and representation paths apply normally | Plite core | One semantic classification is safer than 40 exceptions | Existing APIs need no adapter-specific options | focused core matrix, including whole-Text marks and invalid partial marks | structural commands at block edges can change behavior | rearchitect |
| External view call | No first-class call; custom renderers can only hide children | `slots.externalText({ adapter, config, ariaLabel })` | Plite React | The renderer has element identity, runtime, read-only, decoration, and DOM lifetime | Export adapter types from `plitejs/react` | type inference contracts and raw Plite example | surface could become CodeMirror-shaped | add |
| Model domain | Editable-island allows arbitrary declared content | Exactly one direct Text in both compiled grammar and live value | schema plus slot invariant | Direct offsets stay lossless and patchable | Plate code block already conforms | schema query and runtime misuse tests | generic rich text is excluded | gate |
| Render laziness | `defaultChildren` is prepared before custom rendering | Build native children only when requested; external slot mounts zero canonical child DOM | React element renderer | Hidden text still costs work and can leak to accessibility | Native renderers remain unchanged | render counters and no-hidden-text assertion | lazy access order bugs | rearchitect |
| DOM coverage lifetime | One mutable registry per editor | One `DOMCoverage` session per mounted view | `DOMCoverage.create` plus `EditableDOMRuntime` | Coverage describes a view, not the document | Convert all internal callers and public DOM docs in one cut | two Editables with identical IDs; unmount either order | broad selection/virtualization blast radius | rearchitect |
| External view registry | No owner | Private `NodeKey -> view` records inside each `EditableDOMRuntime` | mounted Editable runtime | View state follows mount and DOM root lifetime | No editor extension or public registry | move/remove/remount/named-root tests | leaks or duplicate mounts | add |
| Commit fan-out | Commit fence only knows retained Plite text flows | One commit listener reconciles exact changed external views before deciding React work | commit fence/runtime | A listener per block fails the 1,000-block lane | Rename retained-projection checks to cover both engines | listener counts and changed-key fan-out | wrong skip could leave stale UI | rearchitect |
| Text delta projection | Public text-change events expose whole before/after strings | Private token-range-to-UTF-16 splice projection; public adapters receive exact changes | core change internals, consumed by React | Full-string diff is O(text bytes) per keystroke | Do not expand `EditorTextChangeContext` for one view job | multi-splice, emoji, paste, history, remote, move, and reset tests | structural changes need reset | add |
| View-to-model write | Adapter could call arbitrary editor APIs | Versioned validated actions build one canonical change and selection transaction | external-text runtime | Prevent stale writes, overlaps, and split history | Adapter has no editor reference | stale/read-only/bounds/property tests | reentrant adapter callbacks | add |
| Interaction ownership | Nested Plite roots and controls are special-cased in several files | One internal interaction-owner classifier recognizes root, control, nested Plite, and registered external hosts | React input runtime | Every event family needs the same answer | Replace duplicate nested-target helpers | capture/bubble trace across all event families | over-broad ignore zone | rearchitect |
| Native input | Outer Editable can observe foreign beforeinput/input | External host owns its local native mutations; Plite receives adapter actions only | adapter plus runtime | Double input corrupts text | No public marker authored by apps | one model commit per external edit and outer follow-up typing | browser-specific event order | gate |
| Mutation repair | Observer watches the outer root | External host stays under a Plite-owned `contentEditable=false` wrapper and is excluded from repair | DOM integrity observer | Foreign DOM is not canonical Plite DOM | Reuse the existing noneditable-owner law | mutate adapter DOM and assert zero repair | accidental wrapper removal | keep |
| Selection | DOM import/export assumes Plite-mappable endpoints | Canonical model selection plus external native/model projection | selection controller and adapter | One selection truth supports history, collab, and multiple views | Direct text path/offset mapping | forward/backward/collapsed/cross-boundary/multi-view matrix | duplicate highlight or focus theft | rearchitect |
| Boundary navigation | No external editor handoff | Adapter requests navigate/delete out; Plite owns model boundary commands and focus transfer | caret engine plus adapter actions | Visual-line knowledge belongs to the external view | Required adapter commands, optional x goal | arrows, shift-arrows, backspace/delete, bidi fallback | geometry differs by adapter | add |
| Composition | Only Plite DOM runtimes own composition | External view joins the existing per-editor composition epoch without exposing DOM mutations | composition runtime | IME must remain one history batch and survive sibling views | Adapter reports start/end and tagged patches | Chrome/WebKit/Firefox composition plus remote-conflict replay | remote edit during IME | gate |
| Clipboard | Outer handlers can intercept nested foreign DOM | Local external copy/cut/paste is adapter-owned; cross-boundary clipboard uses canonical model coverage | clipboard runtime plus adapter | Virtual DOM cannot rely on outer native extraction | Coverage uses `copyPolicy: 'model'`; no duplicate handler | Chrome clipboard, cut, paste, cross-boundary copy, follow-up input | rich payloads degrade to text in adapter | rearchitect |
| Drag and drop | No shared foreign-editor move protocol | Adapter owns local drag; Plite accepts external text drops and guarantees no double insert/delete | input ownership and adapter | Rich cross-runtime moves have no universal contract | Document plain-text limitation | local/drop-in/drop-out no-corruption tests | rich move semantics are not promised | gate |
| History/replay | Editable-island text is inconsistently visible to core | Every external edit is an ordinary canonical Plite change; adapter history is disabled | Plite history and `DocumentChange` | One stack and one replay format | No history bridge state | undo/redo grouping, serialization, replay, focus restoration | adapter may forget to disable history | keep |
| Collaboration | No external projection protocol | Apply remote canonical change first, then exact-patch every affected mounted view | commit/runtime fan-out | Transport must never target a foreign DOM directly | Existing collab tags and document changes remain unchanged | two-editor remote insert/delete, selection, IME conflict, reconnect | adapter patch rejection | keep |
| Decorations | Native text flow is the only consumer | External state receives keyed offset decorations from the existing manager | decoration manager plus runtime | Comments/search/presence need paint without copied range state | Filter internal selection paint; syntax stays external | sparse/dense/overlap/update and no-double-selection tests | unsupported CSS attributes in adapter | rearchitect |
| Read-only | Outer runtime owns it | Effective root and element read-only state is pushed to every view; edit actions fail closed | Editable runtime | DOM attributes alone do not stop a foreign editor | No new schema flag | toggle while focused and stale dispatch tests | adapter ignores update | gate |
| SSR/hydration | No external view lifecycle | Stable empty noneditable host on server/first client render; mount after hydration; balanced destroy | React slot | Avoid full text in server DOM and hydration mismatch | Adapter creates its own client DOM | renderToString/hydrate/StrictMode lifecycle tests | no-JS view has no full document text | add |
| Multiple views and roots | Runtimes are multiple, coverage is global | Independent view records and coverage sessions for same root, named roots, and independent editors | runtime/context | View DOM and focus cannot be editor-global | No public IDs | 1/2/4 views, same/different editor, named-root tests | event target routed to sibling view | rearchitect |
| Accessibility | Hidden spacer duplicates or hides content | One labelled external textbox; no hidden canonical duplicate; adapter owns internal accessibility | slot and adapter | A virtual editor must describe its own accessible window | Pass `ariaLabel`, read-only, and selection mode | accessibility snapshot and keyboard focus proof | full traversal depends on adapter | gate |
| Find/spellcheck/print | Browser assumes mounted text | Explicit adapter ownership; no false native-completeness claim | docs and metrics | Bounded DOM cannot provide universal native traversal | `findPolicy: 'custom'`; adapter capability may add support later | absence/ownership assertions | users may expect native Cmd+F | gate |
| Virtualization | Existing top-level document strategy cannot split one huge block | External adapter may bound its own DOM; Plite document virtualization remains unchanged | separate owners | Mixing both would create two policy systems | Unmount adapter when top-level strategy unmounts block | full/staged/virtualized block lifecycle tests | height/scroll policy is adapter-specific | keep |
| Diagnostics | Existing metrics cannot identify delegated text cost | Add anonymous counts for views, model characters, patches, resets, stale writes, and fan-out | DOM-strategy metrics and browser handle | Scale regressions need an owner without recording content | Extend current metrics; no new service/store | metric contract and privacy assertions | public metric shape grows | add |
| Content roots | Current example uses editable-island as its outer shell | Use a true block void when the direct child is only an anchor, or a normal host when it is document content | content-root owner | Same-runtime roots have independent addressing and lifecycle | Rewrite tests/example without editable-island | nested root focus/navigation/clipboard suite | accidental change to void chrome | keep |
| CodeMirror and Plate adoption | No adapter exists | Separate plan after substrate proof | Plate/code-editor owner | This plan must not smuggle in a product editor | Plate code block remains native full DOM | N/A: explicitly excluded | substrate can pass while a real adapter fails | defer |

## Runtime invariants

1. The Plite value always contains the full text. External DOM never becomes a
   serialization or transaction source of truth.
2. One mounted external view is owned by exactly one `EditableDOMRuntime`, one
   element `NodeKey`, one text `NodeKey`, and one view root.
3. Plite adds no document listener, editor subscription, timer, observer, or
   store per external block. The adapter may own its own local resources.
4. Every adapter action carries the version it observed. Invalid bounds,
   overlap, order, version, root, identity, or read-only state leaves the model
   unchanged and requests a reset when the view is stale.
5. Text patches are derived from canonical `DocumentChange` token ranges and
   snapshot indexes. Ordinary edits never scan a multi-megabyte common prefix
   or suffix.
6. Structural replacement, a changed text `NodeKey`, an unlocalizable
   canonical change, or an unreconcilable remote change touching a composing
   text uses one counted reset. Other text-only typing, paste, history,
   collaboration, and composition use incremental patches.
7. The originating view receives an acknowledgement when its predicted text
   and selection equal canonical output. It receives a reset if correction
   changes that result. Sibling views receive canonical patches.
8. A React commit is skipped only after every affected retained Plite flow and
   external view has accepted the canonical update. Structure, schema,
   properties, renderer config, or failed view reconciliation requires React.
9. Foreign DOM mutations remain below the slot's noneditable owner and never
   enter Plite DOM repair. Events inside the registered host never enter outer
   input, selection import, clipboard, drag, or focus mutation paths.
10. Model selection is updated on every external selection change. Only the
    focused view may install native selection; all other selection paint is
    non-native and must not move focus.
11. Removing, replacing, hiding, or unmounting the element destroys the view,
    unregisters coverage, and releases adapter resources even when cleanup
    throws. StrictMode mounts remain balanced.
12. Adapter callback failures cannot roll back or alter an already-published
    canonical commit. They are reported through the existing lifecycle error
    owner and invalidate the view until a canonical reset/remount succeeds.

## Three execution phases

### Phase 1: remove the false model concept and fix view ownership

Owner:

- Plite core schema/compiler and Plite DOM coverage.

Scope:

- Delete `'editable-island'`, `editableIsland`, and `isEditableIsland` from
  schema, compiled behavior, editor reads, public exports, and direct tests.
- Convert current content-root and native-control fixtures to a true block void
  or a normal host according to where their content lives.
- Replace editor-global `DOMCoverage` state with `DOMCoverage.create(editor)`
  sessions. Give each `EditableDOMRuntime` one session and thread it through
  every caret, selection, clipboard, geometry, metrics, virtualized, staged,
  content-boundary, and DOM-conversion caller.
- Add an internal exact text-splice projector from canonical changes and
  before/after indexes. Keep `EditorTextChangeContext` unchanged.
- Preserve ordinary void, content-root, native text, and explicit
  virtualization behavior.

Entry:

- User accepts this plan and creates a fresh one-shot execution goal.

Exit proof:

- Zero live source/test/example/current-doc names remain outside the explicit
  historical allowlist.
- Schema, representation, string, positions, marks, insert/delete, slice,
  content-root, true-void, and patch-projection tests pass.
- Two DOM coverage sessions over one editor may register the same local ID,
  query different states, and unmount in either order without interference.
- Existing focused DOM, React, history, and Chromium proof remains green.

Checkpoint:

- Keep Phase 1 only if true voids, content roots, native text, and all DOM
  strategies retain behavior. If coverage cannot become view-local without an
  unresolved model-to-DOM ambiguity, stop and reassess the DOM API. Never
  restore editable-island.

### Phase 2: add the external text view runtime

Owner:

- `plitejs/react`, backed by canonical core changes and the Phase 1 coverage
  session.

Scope:

- Add public adapter/change/selection/state/decoration types and
  `slots.externalText`.
- Add a private external-view controller under `EditableDOMRuntime`; integrate
  it with the existing commit fence and decoration subscription.
- Make native child rendering lazy and enforce one projection per element.
- Add one shared interaction-owner classifier and route every event family,
  DOM selection import/export, focus transition, and repair decision through
  it.
- Implement versioned patches, selection projection, read-only, composition,
  boundary navigation/deletion, history delegation, collaboration fan-out,
  decoration updates, lifecycle errors, and diagnostics.
- Add a local textarea contract adapter for behavior tests and a bounded fake
  adapter for stress. Keep both outside the public Plite runtime.

Entry:

- Phase 1 checkpoint is green with fresh fingerprints.

Exit proof:

- Package and browser matrices below pass, including 5/5 retry-free native
  runs in each claimed browser.
- The production-substrate benchmark passes every frozen latency,
  deterministic-work, DOM, subscription, fan-out, reset, and correctness veto.
- No external interaction reaches an outer Plite mutation handler, and outer
  typing still works immediately after focus returns.

Checkpoint:

- Keep only if all model/adapter/selection/history/composition/multi-view
  states remain equal. Any double input, stale write, selection theft,
  unbounded scan, ordinary-edit reset, or cross-view coverage collision stops
  Phase 3. Revert the external slot/runtime packet if it cannot pass; retain the
  independently correct Phase 1 cleanup.

### Phase 3: public closure without a product adapter

Owner:

- Plite exports, proof targets, raw examples, generated owners, and docs.

Scope:

- Export the accepted React and DOM session types; run barrel generation.
- Replace the editable-island schema-reconfiguration and editable-void claims.
  Keep one true-void/content-root example and add one raw external-text adapter
  example with explicit non-production wording.
- Register the bounded substrate benchmark and browser cases with stable IDs.
- Update Selection And DOM, Editable, DOM Coverage Boundaries, Plite DOM,
  Editor API, example docs, migration references, and the proof map.
- Regenerate API and registry output through their source commands.
- Recheck `main` for release-artifact classification. Do not create a
  changeset for a package absent from `main`; if the package has landed, add one
  `plitejs` patch changeset for the final user-visible surface.
- Run the strict Plite check and browser matrix. Do not touch Plate code blocks
  or add CodeMirror.

Entry:

- Phase 2 checkpoint is green.

Exit proof:

- Public type inference, package build, docs parser, generated-output parity,
  raw example, Chromium, Firefox, WebKit, mobile viewport, and exact benchmark
  rerun pass on the same final source identity.
- Current docs state the exact supported model and delegated native-feature
  limits. Zero current editable-island names remain.

Checkpoint:

- Ship the substrate plan only if source, generated output, docs, and proof all
  agree. Any stale public name, missing browser owner, or benchmark regression
  stops closure. A CodeMirror or Plate adoption plan starts separately.

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Editable-island is semantically contradictory | Live compiler/query/representation/void-branch audit plus red public-text probe | Phase 1 zero-name audit and normal-node semantic matrix | ready |
| Normal exact-one-Text is the correct model | Vision law, Plate code-block grammar, and matched target probe | schema cardinality/invariant/type tests | ready |
| Bounded foreign DOM removes Plite's hidden-text cost | Passing 4.9 MB and 1,000-block target probe | Phase 2 production host benchmark with adapter counters | ready |
| View-local coverage is required | Editor-keyed map and duplicate local boundary IDs in live source | two same-editor Editables with opposite unmount order | ready |
| Outer Plite does not handle foreign input | Live target classifier excludes generic foreign hosts | event trace for beforeinput/input/key/composition/clipboard/drag/focus/selection | ready |
| Canonical changes patch views without full scans | Existing token ranges and snapshot indexes can localize direct Text changes | deterministic splice projector tests and zero full-diff counter | ready |
| One model owns history and collaboration | Adapter actions enter ordinary Plite updates; remote updates leave as `DocumentChange` | history codec/replay and two-editor remote matrix | ready |
| Selection stays canonical across views | Direct text paths can represent all external offsets once the node is non-void | native/model/cross-boundary/multi-view selection matrix | ready |
| External views do not multiply subscriptions | Existing commit fence and decoration manager provide per-Editable subscriptions | 1/100/1,000 blocks and 1/2/4 views with listener counters | ready |
| CodeMirror readiness is not CodeMirror proof | Planning probe has no real foreign input engine | Explicit handoff limitation; later adapter plan owns the real integration | ready |

Browser cases to add:

| Case | Setup and action | Required end state |
| --- | --- | --- |
| `external-text-local-input` | Focus textarea adapter; insert/delete/newline in middle | one commit per action, exact model/view text and selection, outer handler count zero |
| `external-text-selection-direction` | Forward/backward mouse and keyboard selection | exact model direction; one native paint in focused view |
| `external-text-boundary-navigation` | Arrow and shift-arrow out both edges; backspace/delete at edges | normal neighboring model point/selection or delete behavior; focus transfers once |
| `external-text-composition` | Start/update/end IME, then type normally | one composition epoch/history batch, exact final text, no duplicate input |
| `external-text-clipboard` | Copy, cut, paste inside; copy/cut across preceding text and external block | exact text/plain and canonical fragment behavior; no hidden DOM extraction |
| `external-text-drop` | Local drop and text drop across the host boundary | one insertion, no duplicate deletion, valid selection, follow-up input |
| `external-text-history-replay` | Type, paste, compose, undo/redo, encode/decode history | exact canonical and view state at every step |
| `external-text-remote` | Apply a second editor's changes before/inside/after local selection | exact patch, mapped selection, no reset for text-only remote changes |
| `external-text-remote-composition` | Remote edit touches the same Text during local composition | deterministic adapter reconciliation or fail-closed reset; no lost canonical edit |
| `external-text-multiple-views` | Two Editables over one editor and two independent editors | only focused view owns native selection; all affected views patch; no cross-editor state |
| `external-text-lifecycle` | Move/remove/replace block, switch named root, toggle read-only, unmount/remount DOM strategy | balanced mount/destroy, no leaked coverage or listeners, canonical text retained |
| `external-text-hydration` | Server render, hydrate, StrictMode remount | identical initial markup, no warning, balanced adapter resources |
| `external-text-decorations` | Sparse/dense/overlapping source refresh and cross-boundary selection | keyed adapter slices update; no syntax or selection duplicate |
| `external-text-a11y` | Tab and screen-reader snapshot over labelled host | one labelled textbox, correct read-only state, no hidden duplicate canonical text |
| `external-text-follow-up` | Exit external view and type/copy/select in outer paragraph | outer Plite immediately resumes normal ownership |

## Scale contract

Applicability and owner:

- Mount is owned by React projection and adapter lifecycle. Local and remote
  edits are owned by canonical change construction, changed-key fan-out, and
  adapter patch delivery. Selection-only updates, decorations, history, and
  composition are measured separately.

Independent cohorts:

| Variable | Normal | Large | Stress | Pathological |
| --- | ---: | ---: | ---: | ---: |
| Lines / about characters in one Text | 200 / 9.8 KB | 2,000 / 98 KB | 10,000 / 490 KB | 100,000 / 4.9 MB |
| Mounted external blocks | 1 | 100 | 1,000 | 1,000 plus four views |
| Mounted Editables over one editor | 1 | 2 | 4 | 4 plus an independent editor |
| Text changes in one dispatch | 1 | 10 | 100 | 1,000 non-overlapping spans |
| Decorations on one Text | 0 | 1,000 sparse | 40,000 dense | 30,000 overlapping |

Frozen correctness vetoes:

- Canonical text, public `state.text.string`, adapter text, selection direction,
  history, replay, and remote state must match exactly.
- Plite mounts zero canonical text DOM below an external host and performs zero
  full-string diff scans for text-only commits.
- A local adapter edit publishes exactly one model commit. No outer Plite input
  mutation fires for that event.
- Text-only typing, paste, history, ordinary collaboration, and uncontested
  composition produce zero resets. Reset is legal only for stale input,
  structural replacement, correction mismatch, remount, or an unreconcilable
  remote change touching a composing text.
- Stale, overlapping, out-of-order, out-of-bounds, read-only, or foreign-root
  actions leave the model unchanged.
- Two views and two editors never share native selection, coverage cleanup, or
  adapter state.

Frozen performance and growth budgets:

- Use one discarded warmup and at least five mount samples; use at least 20
  interleaved samples for edit, selection, remote patch, and history p95.
- Reject a row whose p95/p50 exceeds 1.6; rerun the identical packet instead of
  relaxing its threshold.
- One external block adds at most two Plite-owned elements and zero Plite-owned
  text nodes below the renderer's element. Adapter DOM is counted separately.
- Plite owns one commit and one decoration subscription per mounted Editable,
  zero of either per external block, and zero document listeners per external
  block.
- A text-only commit visits changed roots/ranges, changed node keys, and views
  registered to those keys. Work may not scale with total text bytes or all
  unrelated external blocks.
- At 10,000 lines, fake-adapter cold/warm mount p95 is at most 75 ms. At 100,000
  lines it is at most 100 ms and at most half the matched current editable-void
  p95.
- One middle-character local edit, one remote patch, and undo/redo are each at
  most 50 ms p95 at 10,000 lines and 100 ms p95 at 100,000 lines.
- Selection-only projection is at most 32 ms p95 at 100,000 lines.
- Mounting 1,000 one-line external blocks is at most 150 ms p95 and no more
  than three adapter-plus-Plite DOM elements per block in the bounded fixture.
- One change rendered in 1/2/4 views grows no faster than linear in affected
  views. Unrelated view update count remains zero.
- Plite runtime retains no full-text copy beyond canonical snapshot references.
  Record precise heap as diagnostic only; hard proof uses zero full-string-copy
  and zero full-diff counters because browser GC is nondeterministic.

Planning baseline and target receipt:

- command:
  `bun docs/plans/artifacts/editable-island-substrate-closure/external-text-projection-benchmark.mjs`
- final receipt:
  `docs/plans/artifacts/editable-island-substrate-closure/external-text-projection-benchmark-recovery-v2.json`
- initial red receipt:
  `docs/plans/artifacts/editable-island-substrate-closure/external-text-projection-benchmark.json`
- source identity: commit `a6afd55c30e97c74fe895d1ad005ca75413110f3`;
  runner file SHA-256
  `209f58d09bde37310043135fb2bf081cd8d3c42782b4bdd5eff7fa69cf0155f0`;
  receipt SHA-256
  `17efca3afb0a00c02eea92e42a8211cf108df1a3f5d0eca4f7598356b840c058`;
  measured Plite build-set hash
  `6eadc11aca5009b7e8a9f959108d9b5604c31c2ea1c5df234b2f53d347f2d34b`
- environment: Chromium `149.0.7827.55`, Darwin, headless, 1280 by 720,
  five warm samples after one discarded warmup
- correctness guard: direct canonical child equality for both surfaces and
  public text equality for the target. The baseline's public text failure is
  retained as evidence instead of weakening the target assertion.

Decisive warm p95 results in milliseconds:

| Fixture / size | Current editable-island mount | Bounded normal-block target | Current DOM text | Target DOM text | Target public text |
| --- | ---: | ---: | ---: | ---: | ---: |
| plain / 10,000 lines | 30.0 | 22.7 | 494,095 | 4,096 | 489,999 |
| marked / 10,000 lines | 28.6 | 23.0 | 494,095 | 4,096 | 489,999 |
| code / 10,000 lines | 31.0 | 22.7 | 494,095 | 4,096 | 489,999 |
| plain / 100,000 lines | 212.1 | 14.8 | 4,904,095 | 4,096 | 4,899,999 |
| marked / 100,000 lines | 223.9 | 14.3 | 4,904,095 | 4,096 | 4,899,999 |
| code / 100,000 lines | 210.1 | 16.0 | 4,904,095 | 4,096 | 4,899,999 |

Fan-out:

| Blocks | Current mount p95 | Target mount p95 | Current elements | Target elements |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 23.6 | 23.7 | 4 | 3 |
| 100 | 22.6 | 22.6 | 400 | 300 |
| 1,000 | 65.1 | 39.0 | 4,000 | 3,000 |

The receipt passes its frozen planning budgets. It proves model retention,
public text correctness for a normal block, bounded DOM strings, and mount
scaling. It does **not** prove foreign input, IME, selection, history,
collaboration, accessibility, or real-editor performance. Phase 2 owns those
vetoes with fake adapters; a later CodeMirror plan owns CodeMirror itself.

Final production-substrate rerun:

- Promote the same runner into a registered benchmark target that imports the
  production `slots.externalText` path.
- Keep the exact fixture generator, sizes, warmup/sample rules, baseline,
  target, source fingerprints, and planning budgets; add local edit, remote
  patch, selection, history, reset, listener, subscription, React commit,
  changed-range, affected-view, and full-copy counters.
- Run the exact target after all generated output and docs-affecting source
  changes. Any later runtime edit invalidates the receipt.

## Failure and degradation contract

- Unsupported grammar or duplicate projection: throw before mount. Do not
  silently render both native and external text.
- Stale adapter version: reject the action, preserve the model, and send a
  canonical reset.
- Adapter update failure: report through the existing lifecycle error owner,
  mark the view invalid, and require reset/remount before accepting input.
- Remote change during composition: canonical change wins. The adapter must
  reconcile it incrementally or accept a counted reset that ends the local
  composition; losing or replaying canonical text is forbidden.
- No history extension: `actions.history()` returns `false`; the adapter must
  not run an independent fallback stack.
- Cross-boundary native selection: Plite stores and copies the full model range;
  the adapter paints its intersecting segment in model mode. There is no fake
  cross-root DOM Range.
- Native find, spelling, full screen-reader traversal, and print: adapter-owned
  and unavailable unless that adapter implements them. Metrics must not call
  the surface native-complete merely because the Plite model is complete.
- Rich drag move across the boundary: outside the base contract. Plain text
  transfer must remain correct and must not double-insert or delete.
- Top-level virtualized/staged unmount: destroy the adapter and coverage record;
  remount from canonical state. No adapter cache survives outside its view
  lifetime.

## Adoption and deletion map

Core and DOM:

- Delete direct behavior from `interfaces/schema.ts`, `interfaces/editor.ts`,
  `core/schema-compiler.ts`, and `core/editor-schema.ts`.
- Audit the 40 generic void consumers as true-void behavior. Do not add
  editable-text exceptions after the schema kind is gone.
- Rework `dom/plugin/dom-coverage.ts`, `dom/index.ts`, and
  `dom/internal/index.ts` around a session instance, then thread it through all
  source callers found by `rg 'DOMCoverage\.' packages/plitejs/src`.
- Add the exact splice projector under the core change owner and expose it only
  through `plitejs/internal` if React needs an entrypoint boundary.

React and browser runtime:

- Extend `EditableElementSlots` in
  `react/components/editable-text-blocks.tsx`; move public types to one
  owner-first `react/external-text.ts` module if the component file becomes a
  grab bag.
- Put host/lifecycle rendering in
  `react/components/editable-external-text.tsx` and private fan-out in
  `react/editable/external-text-runtime.ts`.
- Integrate `editable-dom-runtime.ts`, `editable-dom-commit-fence.tsx`, and the
  decoration manager. Rename retained-text-only helpers when they cover both
  native and external projections.
- Replace duplicate nested/interactive target predicates with one private
  interaction-owner module consumed by input router, editing kernel, keyboard,
  clipboard, selection controller/reconciler, focus/mouse, drag, and traces.
- Keep the DOM integrity observer's noneditable-owner rule and add explicit
  external mutation proof rather than an exception list.

Tests and proof:

- Replace direct editable-island compiler/query/public-surface tests with
  removal, true-void, content-root, exact-one-Text, and external-view tests.
- Add unit/React contracts for coverage sessions, patch extraction, action
  validation, type inference, lifecycle, fan-out, decorations, errors, SSR,
  roots, and multiple views.
- Replace browser family `editable-island-native-focus` with separate
  `true-void-native-focus` and `external-text-*` cases. One broad focus gauntlet
  is not selection/input proof.
- Add the registered benchmark target and privacy-safe diagnostics contract.

Examples, docs, and generated output:

- Update the raw editable-void example to use `void: 'block'` for its atomic
  card plus same-runtime child root. Rename copy that implies editable children
  require a special void kind.
- Remove the editable-island choice from schema reconfiguration.
- Add a raw external-text example using the local textarea contract adapter;
  label it as protocol demonstration, not a large-code recommendation.
- Update:
  `content/docs/plite/concepts/16-selection-and-dom.mdx`,
  `content/docs/plite/libraries/plite-react/editable.mdx`,
  `content/docs/plite/libraries/plite-react/dom-coverage-boundaries.mdx`,
  `content/docs/plite/libraries/plite-dom.mdx`,
  `content/docs/plite/api/nodes/editor.mdx`,
  `content/docs/plite/general/docs-proof-map.mdx`,
  the editable-void example page, and any live migration call using static
  `DOMCoverage` methods.
- Regenerate API reference and registry artifacts through their owning
  commands. Preserve historical ledgers and completed plans.

Plate and collaboration:

- Plate code blocks remain on native retained Plite text. Their exact-one-Text
  grammar is enough future adoption evidence; no Plate source change belongs
  in this execution.
- Collaboration transports remain unchanged. They publish canonical
  `DocumentChange`; the mounted external-view controller is merely another
  consumer of committed changes.

## Conditional evidence

- High-risk scenarios: stale dispatch after remote edit; unmount during
  composition; two same-editor views sharing a boundary ID; structural undo
  replacing the text node; adapter update throwing after canonical publish;
  dense decoration refresh; top-level virtualization destroying an active
  view. Every case has an execution test above.
- External research: not needed for this decision. Prior editor comparison
  established the product direction; this plan resolves live Plite owners and
  uses a fresh matched local probe. A CodeMirror-specific design belongs to a
  later adapter plan.
- Issue/PR provenance: inapplicable because this is not issue- or PR-backed
  work.
- Raw physical-device proof: inapplicable because no device-specific or
  release-ready mobile claim is made. Mobile viewport remains a closure check;
  the raw-device runner stays fail-closed.
- Production telemetry: reuse anonymous diagnostics only. Text, inserted
  strings, selection contents, node keys, boundary IDs, document IDs, and
  adapter configuration are forbidden payloads.
- Visual screenshot: required only for cross-boundary selection paint, focus
  rings, duplicate highlight, caret entry, or layout movement. Model and DOM
  assertions remain necessary alongside pixels.
- P1 autoreview: not run for this planning-only packet. Accepted execution uses
  the normal review gate unless it is running on `next`, where repo policy
  forbids autoreview.

## Rejected alternatives

- Keep editable-island and add `voids: true` everywhere: rejects one bug at a
  time while retaining contradictory public semantics.
- Store code as lines or chunks: corrupts document meaning to rescue a view.
- Let the foreign editor own a second text model/history and synchronize on
  blur: guarantees drift, broken collaboration, and huge conflict windows.
- Expose editor and path directly to adapters: bypasses version checks,
  history policy, read-only, and transaction invariants.
- Give every external block an editor subscription: fails fan-out before the
  adapter does useful work.
- Diff full before/after strings on each commit: a one-character edit at the
  end of 4.9 MB becomes linear work.
- Reuse `contentRoot`: creates a second document root for content that already
  belongs in the block's normal child.
- Reuse a true void shell: restores atomic core and DOM behavior and hidden
  anchor baggage.
- Extend Plite's top-level virtualizer into blocks: mixes document mounting
  policy with an adapter's internal rendering engine.
- Add a CodeMirror adapter now: it would entangle substrate failures with one
  product integration and make the checkpoint useless.

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, exports, and behavior claims cite live source.
- [x] Reusable public call shape has one best-API verdict before target lock.
- [x] The scale-sensitive target has a passing executable current-versus-target
      receipt before architecture acceptance.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and
      verdict.
- [x] Canonical state and mounted-view presentation have distinct owners; no
      parallel state or editor-global view policy remains.
- [x] Public breaks and private runtime work have complete adoption and deletion
      answers.
- [x] Three execution phases and their focused proof matrices are concrete.
- [x] Conditional browser, Benchmark, docs, release, and risk work is resolved.
- [x] The benchmark measures full mount, matched fixtures, warm/cold timing,
      text bytes, DOM nodes, and block fan-out.
- [x] Normal, large, stress, and pathological text sizes are present.
- [x] Source identities, samples, warmup count, noise rule, budgets, and
      correctness guards are recorded.
- [x] The disposable target is the smallest projection needed to test model and
      DOM scale before a production adapter exists.
- [x] The production rerun adds edit, selection, history, remote, subscription,
      reset, and changed-work counters rather than treating mount as closure.
- [x] No cache, pool, index, projection store, or scheduler is added without a
      measured owner; the existing commit/index owners are reused.
- [x] Evidence contains no user, tenant, credential, header, text payload, or
      protected data.
- [x] The deterministic benchmark becomes a registered regression target in
      accepted execution.
- [x] Browser route, actions, expected outcomes, exact-browser requirements,
      error checks, screenshots, and 5/5 native stability are declared.
- [x] Package boundary, export, release artifact, compatibility, and generated
      barrel decisions are explicit.
- [x] Docs lane, target docs, sibling docs, source owners, current-state voice,
      links, preview, and Unslop pass are explicit.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every architecture, adoption, and proof owner | Decision ledger and three phases contain no open design choice. |
| Fresh source evidence | yes | Recheck decision-changing live owners | Schema, representation, render, event, coverage, commit, decorations, docs, tests, and Plate code-block source were read at the planning ref. |
| Best API review | yes | Resolve hard-cut and inference findings | One normal usage shape and exact adapter/session contracts are locked; aliases and raw editor access are rejected. |
| Pre-acceptance scale proof | yes | Pass matched baseline/target probe | V2 receipt passes all planning budgets across four sizes, three fixtures, and three fan-out cohorts. |
| Production scale rerun contract | yes | Carry exact final cohorts and stricter runtime counters into Phase 2/3 | Frozen production-substrate contract and command owner are recorded above. |
| Conditional risk and adoption | yes | Resolve browser, collaboration, docs, release, and failure cases | Each applies with a named phase/proof or has a scoped reason for inapplicability. |
| Verification recorded | yes | Record source audit, benchmark, hashes, and mechanical plan check | Evidence section below names each receipt. |
| Handoff prepared | yes | Summarize ownership, breaks, proof, risks, and order | Final handoff section is complete. |
| P1 autoreview | no | Planning-only; execution follows current branch policy | No production source changed in this goal. |
| Goal plan complete | yes | Run Autogoal checker | Checker result is recorded below. |
| Warm latency budget | yes | Freeze mount/edit/selection/history thresholds | Absolute p95 and noise limits are fixed above. |
| Large/stress scaling | yes | Cover 490 KB, 4.9 MB, 1,000 blocks, four views, and dense decorations | Planning mount receipt passes; execution carries the remaining operation matrix. |
| Cold and failure paths | yes | Record cold mount and stale/error/degradation behavior | Receipt includes cold rows; runtime failure contract is explicit. |
| Payload and fan-out | yes | Record text bytes, DOM counts, subscriptions, listeners, and affected views | Planning receipt has bytes/DOM/fan-out; execution adds runtime counters. |
| Correctness guard | yes | Preserve model/public text and add behavior parity | Planning guard passed for target; Phase 2 owns native gates. |
| Before/after receipt | yes | Preserve comparable baseline and target | Red and passing receipts plus exact source hashes are retained. |
| Detector and privacy | yes | Extend existing metrics with counts only | Forbidden payload fields and required counters are explicit. |
| Browser interaction proof | yes | Run raw example through Browser/Chrome and cross-browser tests | Exact cases and tool choice are listed. |
| Browser console/network check | yes | Record console and unexpected requests | Local fixture requires clean console and no unexpected network. |
| Browser final proof artifact | yes | Save final trace/screenshots only for visual claims | Selection/focus/caret claims name the required artifact. |
| Exact case replay | no | No reporter case exists | Stable architecture case IDs replace issue replay. |
| Final ref and fingerprints | yes | Bind final runtime/test/fixture/harness hashes | Phase 3 invalidates proof after any runtime edit. |
| Clean final runtime | no | No fixed/shipped issue wording is planned | Execution may claim only local substrate proof unless separately pushed/released. |
| Retry-free stability | yes | Run native cases 5/5 in each claimed browser | Phase 2/3 exit requires it. |
| Public API / package boundary proof | yes | Audit root, DOM, and React exports | Phase 1/3 own deletion and export type tests. |
| Release artifact classification | yes | Recheck package existence on `main` | Current result is absent; exact conditional patch rule is fixed. |
| Published package changeset | conditional | Add one `plitejs` patch only if the package exists on execution-time `main` | Current `git cat-file` check exits 128, so no branch-relative changeset is justified. |
| Registry changelog | no | Registry-only release rules do not apply | Registry example changes are support for a package substrate change, not a standalone copied component release. |
| Package typecheck/build/test | yes | Run focused iteration and strict handoff checks | Commands are named below. |
| Barrel/export generation | yes | Run `pnpm brl` after export changes | React and DOM public exports change. |
| Docs source-backed claim audit | yes | Verify every API and limit against final source | Phase 3 docs list is exact. |
| Required Unslop pass | yes | Run file-edit mode on this plan and every changed docs file | This plan received the pass after decisions stabilized; execution repeats it for changed docs. |
| Requirements disclosure | yes | Separate Plite hard laws, adapter duties, and repo proof details | Boundaries and degradation contract do so. |
| Docs links / routes / previews | yes | Verify leaf pages and raw example route | Phase 3 owns source build and browser navigation. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` | The execution changes MDX. |
| Plugin page specifics | no | No Plate plugin page is changed | This is raw Plite React/DOM substrate documentation. |

Execution verification commands:

```bash
pnpm check:plite:dev
pnpm --filter plitejs typecheck:contracts
pnpm --filter plitejs test:partition:core
pnpm --filter plitejs test:partition:dom
pnpm --filter plitejs test:partition:react
pnpm --filter plitejs test:partition:history
pnpm --filter plitejs build
pnpm brl
pnpm --filter www api-reference
pnpm --filter www build:registry
pnpm --filter www build:source
bun docs/plans/artifacts/editable-island-substrate-closure/external-text-projection-benchmark.mjs
pnpm --filter plite test:plite-browser:chromium --grep "external text|true void"
pnpm check:plite
pnpm check:plite:browser-matrix
```

Use the repo's actual generated-owner command if `api-reference` has moved by
execution time. Command drift may change the invocation, not the required
output parity.

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live owner and direct-name audits; exact scope and exclusions | none |
| Decide | complete | Hard-cut API, model, runtime, degradation, and adoption decisions | none |
| Prove and hand off | complete | Passing matched scale receipt, frozen execution proof, plan checker | await user acceptance |

Verification evidence:

- Live source audit at `a6afd55c30e97c74fe895d1ad005ca75413110f3` found the schema/void contradiction, public text omission, hidden full-text spacer, editor-global coverage registry, incomplete foreign-target classification, reusable commit fence, and exact-one-Text Plate code-block grammar.
- The first benchmark receipt stayed red because direct canonical text was
  present while the public editable-island text projection was empty.
- The final V2 receipt passed with zero failures. At 4.9 MB, current mount p95
  was 210.1-223.9 ms and retained about 4.9 million DOM text units; the bounded
  normal-block target was 14.3-16.0 ms and retained 4,096 DOM text units while
  public text remained exact.
- At 1,000 one-line blocks, the current path used 4,000 elements and mounted in
  65.1 ms p95; the target used 3,000 and mounted in 39.0 ms p95.
- The receipt explicitly marks interaction correctness unmeasured. No result in
  this plan claims a real external editor is ready.
- `main` does not contain `packages/plitejs` at planning time, so a changeset
  cannot describe removal of this branch-only API.
- Unslop file-edit review preserved all code, hashes, numbers, paths, commands,
  and technical claims while removing template filler and vague future prose.
- Autogoal completion checker: pass —
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-03-editable-island-substrate-closure.md`.

## Final handoff prepared

- Ownership and target: Plite core owns canonical text and changes; one mounted
  `EditableDOMRuntime` owns external view projection through
  `slots.externalText` and a view-local coverage session.
- Public break: delete editable-island schema and reads; hard-cut static
  editor-global DOM coverage methods; add typed external-text adapter/session
  APIs with no aliases.
- Adoption: migrate true void/content-root examples and all Plite tests/docs;
  keep Plate code blocks and collaboration transports unchanged.
- Proof: Phase 1 semantic/coverage tests, Phase 2 fake-adapter native and scale
  vetoes, Phase 3 exports/docs/generated/browser closure.
- Main risk: a fake adapter can prove the substrate but not CodeMirror's own
  composition, geometry, accessibility, or performance. That remains an
  explicit later plan, not hidden confidence.
- Execution order: Phase 1 foundation, stop/keep checkpoint; Phase 2 runtime,
  stop/keep checkpoint; Phase 3 public closure, final checkpoint.

Timeline:

- 2026-09-03: created deep Plite plan and captured all explicit constraints.
- 2026-09-03: audited schema, core void consumers, DOM/React projection,
  events, selection, coverage, commit fan-out, decorations, history,
  collaboration boundary, examples, docs, and Plate code-block pressure.
- 2026-09-03: preserved the failed public-text receipt, added size and fan-out
  cohorts, reran the matched Chromium probe, and recorded the passing V2
  receipt with source hashes.
- 2026-09-03: applied best-API hard cuts, froze three execution checkpoints,
  completed the docs/Unslop review, and ran the plan checker.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Architecture plan complete; no product implementation started. |
| Where am I going? | Wait for acceptance, then execute Phase 1 only and stop at its checkpoint. |
| What is the goal? | Replace contradictory editable-island schema with an exact-one-Text external view substrate. |
| What have I learned? | The current noun is both semantically wrong and slower at pathological size; multi-view coverage and event ownership are the largest hidden blockers. |
| What have I done? | Locked API/runtime law, all owner gaps, three phases, browser matrix, scale budgets, adoption, and limitations. |

Open risks:

- A production CodeMirror adapter can still expose engine-specific gaps in
  composition, visual-line boundary navigation, geometry, accessibility, or
  height management. The substrate cannot honestly close those without that
  later implementation.
- Cross-boundary rich drag moves have no generic interoperable contract; this
  plan guarantees plain text and no corruption, not rich move parity.
- Native browser find, spelling, print, and full accessibility traversal depend
  on adapter capability when its DOM is bounded.
- The DOM coverage session cut touches existing staged, partial, and
  virtualized selection paths. Phase 1 is intentionally an independent stop
  gate before any external-view API lands.

Linked plans:

- N/A: one plan owns this bounded substrate decision; CodeMirror and Plate
  adoption require a later separately accepted plan.
