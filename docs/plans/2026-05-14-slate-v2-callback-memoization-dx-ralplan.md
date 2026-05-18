# Slate v2 native beforeinput architecture ralplan

Date: 2026-05-14
Status: executed
Score: 1.00
Owner: Slate Ralplan planning only
Execution owner: ralph in `../slate-v2`

## Verdict

Hard cut `onDOMBeforeInput` as a normal customization/example path.

Keep `onDOMBeforeInput` only as the raw native escape hatch:

```ts
onDOMBeforeInput?: (
  event: InputEvent,
  context: EditableDOMBeforeInputContext
) => boolean | void
```

The normal Slate React editing architecture should be:

```txt
native DOM event
-> Slate React native listener router
-> input kernel classifies intent/command/selection policy
-> semantic editable command handlers run
-> model-owned default applies or native browser path continues
-> DOM repair / selection export runs
```

`formatBold`, `formatItalic`, `historyUndo`, delete, paste, and text insertion
must not be taught through ad hoc `onDOMBeforeInput` examples. That is the old
Slate leak.

## Public API Target

### 1. Raw native escape hatch

`onDOMBeforeInput` stays because Slate is unopinionated and native-friendly.
But the contract is explicit:

- native `InputEvent`
- runs before Slate's default model/native decision applies
- returning `true` or calling `preventDefault()` marks it handled
- handler receives context so examples do not close over stale editor state
- no memoization required from user code
- advanced docs only, not walkthrough/toolbar docs

Target context:

```ts
type EditableDOMBeforeInputContext = {
  command: EditableInputCommand | null
  data: unknown
  editor: ReactEditor
  inputType: string
  intent: EditableInputIntent | null
  native: boolean
  selection: Range | null
}
```

### 2. Semantic editable command handler

Add a semantic handler for editor behavior that should not depend on DOM event
spelling:

```ts
onCommand?: (
  command: EditableInputCommand,
  context: EditableCommandContext
) => boolean | EditableRepairRequest | void
```

This is the path for:

- native formatting commands like `formatBold`
- keyboard formatting shortcuts like `mod+b`
- delete/backspace/enter behavior
- history undo/redo from native input or keydown
- paste/drop/yank routing
- markdown-ish lightweight raw examples when they must live in Slate React

Target formatting command shape:

```ts
type EditableInputCommand =
  | { kind: 'format'; format: 'bold' | 'italic' | 'underline' | 'strikethrough' | string }
  | { kind: 'history'; direction: 'redo' | 'undo' }
  | { kind: 'delete'; direction: 'backward' | 'forward'; unit?: 'block' | 'line' | 'word' }
  | { kind: 'insert-break'; variant: 'open-line' | 'paragraph' | 'soft' }
  | { kind: 'insert-text'; inputType?: string; text: string }
  | { kind: 'insert-data'; data: DataTransfer }
  | ...
```

Slate can report `format` commands without deciding whether the app uses
`bold`, `strong`, `fontWeight`, or a custom mark model. That preserves Slate's
unopinionated core.

### 3. Current examples/docs target

Current `hovering-toolbar` should stop doing this:

```tsx
onDOMBeforeInput={(event) => {
  if (event.inputType === 'formatBold') {
    event.preventDefault()
    return toggleMark(editor, 'bold')
  }
}}
```

Target:

```tsx
<Editable
  onCommand={(command, { editor }) => {
    if (command.kind !== 'format') {
      return
    }

    switch (command.format) {
      case 'bold':
      case 'italic':
      case 'underline':
        editor.update((tx) => {
          tx.marks.toggle(command.format)
        })
        return true
    }
  }}
/>
```

If the execution pass chooses not to add `onCommand` yet, then the
fallback is `onDOMBeforeInput(event, context)`, not a closure-only event prop and
never `useMemo(() => callback)`.

## Why This Is The Best Shape

### Slate philosophy

Slate should expose the native event when the user asks for native browser
input. It should not force every behavior through an opinionated plugin product.

But "unopinionated" does not mean "make users parse browser quirks." Raw DOM
events belong at the boundary. Model behavior belongs in the editor runtime.

### DX

Users should write:

```tsx
onCommand={(command, { editor }) => ...}
```

not:

```tsx
useMemo(() => (event) => {
  switch (event.inputType) {
    ...
  }
}, [editor])
```

and not:

```tsx
useCallback((event) => {
  ...
}, [editor])
```

unless that callback is registered as a subscription/listener and identity is
the actual API contract.

### Performance

Native listeners should attach once per root element/editor root transition.
Changing an app callback must update the latest callback read by the runtime,
not detach and reattach native `beforeinput`.

Implementation target:

- use React `useEffectEvent` if it fits the repo/lint/runtime constraints
- otherwise use one local stable latest-event helper inside `slate-react`
- no consumer memoization ceremony
- no dependency-array lies

### Prior Slate v2 learnings

This plan follows the existing runtime-owner lesson:

- hot editing policy belongs behind named Slate React runtime facades, not broad
  React root closures
- ownership cuts need static inventories, not only smaller files
- browser proof is required for real input/selection behavior
- profile native input lanes separately from direct model typing before blaming
  React rendering
- hot browser paths should keep private primitive decisions cheap and expose
  model state, not raw DOM-policy reasons

## Candidate Comparison

### ProseMirror

Evidence:

- `EditorProps.handleDOMEvents` is the low-level escape hatch. If it returns
  true, the handler is responsible for `preventDefault`.
- `handleTextInput` is the semantic text insertion hook with `from`, `to`,
  `text`, and a default transaction.
- `keymap` and `inputrules` are plugins, not raw DOM event props.
- `beforeinput` in `prosemirror-view` is narrow and conservative, mostly
  Android/selection plumbing.

Steal:

- separate raw DOM handlers from semantic editor behavior
- give handlers a view/editor context
- keep default transactions/commands centralized

Reject:

- do not copy ProseMirror positions or plugin complexity as normal Slate DX

### Lexical

Evidence:

- root events are installed by the editor root registration.
- core `beforeinput` maps `formatBold`, `formatItalic`, `formatUnderline`,
  undo/redo, insert/delete, and paste-like inputs into commands.
- public extension behavior is command registration, not `onDOMBeforeInput`.
- React `ContentEditable` mostly sets the root element.

Steal:

- native input belongs to the runtime
- semantic command partitioning is better than userland DOM parsing
- latest behavior should be reached through editor/runtime context, not React
  prop identity churn

Reject:

- do not copy class nodes, dollar helpers, or "commands as the whole app API"

### Tiptap

Evidence:

- extensions expose `addCommands`, `addKeyboardShortcuts`, `addInputRules`, and
  paste rules.
- keyboard/input behavior is productized at extension boundaries.

Steal:

- product DX should feel like behavior registration, not DOM spelunking
- Plate should own rich rule families and polished extension ergonomics

Reject:

- raw Slate should not become Tiptap's opinionated extension product

### edix

Evidence:

- edix is explicitly native `beforeinput` driven and requires
  `InputEvent.getTargetRanges`.
- it prevents default for beforeinput, ignores native format/history input
  types, and manages input through its own lightweight transaction path.

Steal:

- native `beforeinput` can be the primary browser-input signal
- root listener lifecycle can be simple and direct

Reject:

- ignoring `format*` and history is not enough for Slate React
- this is small-surface architecture, not a full document editor answer

### use-editable / rich-textarea / markdown-editor

Evidence:

- small-surface editors use direct listeners, mutation observers, or captured
  React events.
- the API is intentionally tiny and surface-specific.

Steal:

- low ceremony matters
- small surfaces should not need a full extension/runtime mental model

Reject:

- do not base Slate v2's serious input runtime on mutation-observer-first
  wrappers or React capture handlers

### Pretext / Premirror

Not directly a `beforeinput` API guide. Their lesson is that layout/measurement
deserves its own deterministic lane, not that input should become layout-aware.

## Current Slate v2 State

Live source already points in the right direction:

- `EditableInputRuleContext` passes `editor`, `event`, `inputType`, and
  `selection`.
- `EditableKeyDownHandler` already uses `(event, context)`.
- `EditableCommand` already models delete, history, insert text/data, selection,
  set block, and toggle mark.
- the editing kernel classifies `beforeinput` intent.
- `runtime-before-input-events.ts` already routes native `beforeinput` through
  classification, selection sync, input rules, model-owned operations, and DOM
  repair.

Current gaps:

- `onDOMBeforeInput` type is still `(event: InputEvent) => void`.
- runtime accepts `boolean | void` but docs/type do not.
- callback identity still flows through native listener/ref dependencies.
- `format*` beforeinput is classified as `format` intent but currently has no
  semantic command. That is why examples fell back to raw `event.inputType`.
- `inputRules` as an `Editable` prop is too close to Tiptap/Plate product API
  for raw Slate. Keep only if it is clearly scoped as a low-level input hook;
  otherwise move rich rules up to Plate.

## Hard Cuts

Cut:

- `useMemo(() => callback)` callback factories
- docs/examples that teach `onDOMBeforeInput` for bold/italic/underline
- docs that present `onBeforeInput` and `onDOMBeforeInput` as interchangeable
- root listener churn caused by app callback identity
- any statement implying React Compiler is required for Slate examples to be
  clean

Keep:

- `onDOMBeforeInput` as a native escape hatch
- `onKeyDown` for normal React keyboard event escape hatches
- model-owned delete/history/insert/paste behavior in the Slate React runtime
- Plate as the home for rich input-rule/plugin families

Revise:

- `onDOMBeforeInput` type to include `boolean | void` and context
- `EditableCommand` to include native format commands
- examples to prefer semantic commands or normal toolbar `onClick`
- docs to move raw DOM beforeinput to an advanced section

## Implementation Plan For Ralph

### Execution State

- 2026-05-14T04:05:23Z: `ralph` execution started.
- 2026-05-14T04:20:21Z: `ralph` execution finished implementation and moved
  to ledger/checkpoint closeout.
- Active completion state:
  `.tmp/019e1fc0-dba0-7de1-9236-b484a144cda6/completion-check.md`.
- Active continuation prompt:
  `.tmp/019e1fc0-dba0-7de1-9236-b484a144cda6/continue.md`.
- Current owner: `../slate-v2/packages/slate-react`.
- Current next pass: completion verification.
- Execution result: semantic `onCommand`, raw `onDOMBeforeInput`
  context, stable native input handler reads, hovering-toolbar cleanup, docs,
  changeset, unit/package/browser proof, and `bun check` landed in
  `../slate-v2`.

### Phase 1: Contract Tests First

- Type test: `onDOMBeforeInput` accepts `(event, context) => boolean | void`.
- Runtime test: changing `onDOMBeforeInput` identity invokes the latest handler
  without reattaching native `beforeinput`.
- Runtime test: `formatBold`, `formatItalic`, and `formatUnderline`
  beforeinput classify into semantic format commands.
- Runtime test: if `onCommand` handles a format command, Slate prevents
  native default and does not continue model/native fallback.
- Runtime test: if no semantic handler handles a format command, Slate leaves it
  as a safe no-op/native-denied path, not a hard-coded `bold` mark mutation.

### Phase 2: Runtime Boundary

- Add stable latest-event handling inside `slate-react`.
- Keep native listener attachment keyed to root element/editor root transition.
- Thread `EditableDOMBeforeInputContext` into `onDOMBeforeInput`.
- Thread `onCommand` into the input runtime after intent/command
  classification and before default model/native application.

### Phase 3: Command/Intent Shape

- Add a `format` editable command for native format input.
- Normalize native input types:
  - `formatBold` -> `{ kind: 'format', format: 'bold' }`
  - `formatItalic` -> `{ kind: 'format', format: 'italic' }`
  - `formatUnderline` -> `{ kind: 'format', format: 'underline' }`
  - `formatStrikeThrough` -> `{ kind: 'format', format: 'strikethrough' }`
- Do not hard-code default mark mutation for raw Slate.
- Keep command metadata in the editable runtime, not in root `slate` public
  exports.

### Phase 4: Public Examples And Docs

- Rewrite `hovering-toolbar` to use `onCommand` for native formatting
  or normal toolbar `onClick` for UI buttons.
- Remove `useMemo` callback factory import/use.
- Review `markdown-shortcuts`, `tables`, `mentions`, and `iframe`:
  - keep memoization only for real subscription/config identity
  - remove ceremony around simple `Editable` event props after runtime proof
- Move `onDOMBeforeInput` docs to advanced native escape hatch guidance.
- Do not write migration/changelog language in docs.

### Phase 5: Verification

Run from `../slate-v2`:

- focused red/green type test for new handler types
- focused `slate-react` editing-kernel/runtime tests
- focused browser proof for hovering-toolbar native formatting
- focused browser proof for markdown shortcut input behavior
- `bun --filter slate-react typecheck`
- `bun lint:fix`
- `bun check`

Grep gates:

```bash
rg -n -U "useMemo\\(\\s*\\n\\s*\\(\\)\\s*=>\\s*\\([^)]*\\)\\s*=>" site docs packages -g '!site/out/**'
rg -n "onDOMBeforeInput=.*format|formatBold|formatItalic|formatUnderline" site docs packages -g '!site/out/**'
```

## Issue Ledger Pass

Cache-first related issue pass only. No fixed issue claims.

Related:

- `#4681`: raw `onDOMBeforeInput` behavior remains related.
- `#3568` / `#3586`: beforeinput formatting/mark mutation bugs become better
  covered after semantic format-command proof, but exact issue closure still
  requires matching repro proof.
- `#5181`: stale callback/editor prop pressure is addressed by stable latest
  handlers if execution lands.
- `#4317`: render callback churn remains adjacent but not closed by this plan.

Execution ledger sync:

- `docs/slate-v2/references/pr-description.md` adds the native command boundary
  section without changing fixed issue claims.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` refreshes `#3568`,
  `#3586`, `#4681`, `#5181`, and `#4317` as related/non-closure rows.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` records one cache-first
  related issue pass for this touched surface.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` records current manual sync
  state for the same five issues.
- `docs/solutions/developer-experience/2026-05-14-slate-react-native-beforeinput-formatting-needs-semantic-command-handlers.md`
  captures the reusable boundary pattern.

## Review Gates

- `slate-ralplan`: applied. Planning only; no Slate v2 source edits.
- `hard-cut`: applied. Cut raw `onDOMBeforeInput` from normal examples, not the
  escape hatch itself.
- `repo-research-analyst`: applied. Candidate comparison grounded in local
  source reads.
- `performance-oracle`: applied. Main risk is native listener churn and broad
  callback invalidation.
- `react-useeffect`: applied. Native listener lifecycle is an effect/subscription
  problem; user formatting response is command/event-handler logic.
- `learnings-researcher`: applied. Prior runtime-owner and hot-path notes
  reinforced static inventories, browser proof, and no public DOM-policy leak.
- `tdd`: applied. Tests must lock callback stability, context shape, and format
  command classification before cleanup.
- `ce-compound`: applied. The reusable semantic-command/native-beforeinput
  boundary was captured after verification.
- `steelman-pass`: applied. The strongest objection is "this creates another
  API"; it wins because the alternative is making users parse `InputEvent`
  quirks forever.
- `high-risk-deliberate-pass`: applied. Browser input behavior and public docs
  are high-blast-radius surfaces.

## Score

1.00.

Execution proof closed the remaining 0.05. The final API name is `onCommand`
because `Editable` already provides the scope and the exported
`EditableCommand*` types keep the command family explicit.
