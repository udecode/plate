# Plite library-owned multi-root history DX ralplan

Status: done - Ralph execution complete
Runtime id: `019e46be-4ec4-7d11-bc6e-9fcf033a8803`
Skill: `plite-ralplan`
Scope: `Plate repo root` multi-root history, shortcut, and root chrome focus DX

## Intent

Make the multi-root document example show normal Plite app code.

The package should own active-root history targeting, keyboard shortcut parsing,
history stack availability, and root chrome focus scheduling. The example should
own only document layout, title state, and displayed status.

## Current-State Read

The user is right. The previous multi-root API work moved the big runtime/view
shape into the package, but the canonical example still carries library-shaped
plumbing:

- `site/examples/ts/multi-root-document.tsx:180` defines
  `getHistoryShortcut`, duplicating history hotkey parsing in app code.
- `site/examples/ts/multi-root-document.tsx:199` defines
  `getHistoryBatchCount`, exposing history-stack plumbing in the example.
- `site/examples/ts/multi-root-document.tsx:209` defines `updateHistory`,
  including selection metadata that app authors should not have to know.
- `site/examples/ts/multi-root-document.tsx:256` / `:275` wires root chrome
  focus through a ref plus `requestAnimationFrame`.
- `site/examples/ts/multi-root-document.tsx:304` / `:320` makes the example
  compose active-root editor lookup, history application, and post-command focus
  repair through `applyDocumentHistory`.
- `site/examples/ts/multi-root-document.tsx:325` makes an external title input
  parse undo/redo, stop propagation, inspect stack count, and preserve DOM focus
  manually.

Live package evidence already points to the right owner:

- `packages/plite-react/src/editable/editing-kernel.ts:983` maps undo/redo
  keyboard input to a history command.
- `packages/plite-react/src/editable/mutation-controller.ts:537` applies
  history as an editable command.
- `packages/plite-react/src/editable/keyboard-input-strategy.ts:232` states
  Plite React must own history hotkeys because browser native history cannot see
  Plite's stack.
- `packages/plite-react/src/hooks/use-slate-runtime.tsx:599` exposes
  active-root state, and `:617` exposes root view editors. The missing layer is
  the author-facing React hook that composes these safely.

## Verdict

Keep the multi-root runtime/view architecture. Rewrite the public React DX
around library-owned hooks.

Do not ship an example that teaches users to write `getHistoryShortcut`,
`getHistoryBatchCount`, `updateHistory`, `applyDocumentHistory`, or
`requestAnimationFrame(() => editor.api.dom.focus())`.

Those are not app concerns. They are Plite React concerns.

## Accepted API Target

### 1. `usePliteHistory`

Add a package hook that owns history state, undo/redo commands, active-root
targeting, keyboard shortcut parsing, empty-stack no-ops, and focus policy.

Target shape:

```ts
type SlateHistoryFocusPolicy = 'restore-root' | 'preserve-dom' | 'none'

type UseSlateHistoryOptions = {
  focus?: SlateHistoryFocusPolicy
  root?: RootKey
}

type SlateHistoryController = {
  canRedo: boolean
  canUndo: boolean
  onKeyDown: (event: React.KeyboardEvent) => void
  redo: () => void
  root: RootKey
  undo: () => void
}
```

Default behavior:

- `root` omitted means "use the current active root".
- `focus` defaults to `'restore-root'`.
- `focus: 'preserve-dom'` is for external inputs like document title fields.
- `onKeyDown` reuses the same hotkey semantics as the editing kernel; it must
  not copy a second parser.
- `undo` / `redo` no-op when the corresponding stack is empty.
- The hook subscribes narrowly to history stack length and active-root changes.

Expected example shape:

```tsx
const history = usePliteHistory()
const titleHistory = usePliteHistory({ focus: 'preserve-dom' })

return (
  <>
    <input onKeyDown={titleHistory.onKeyDown} />
    <button disabled={!history.canUndo} onClick={history.undo}>
      Undo document change
    </button>
    <button disabled={!history.canRedo} onClick={history.redo}>
      Redo document change
    </button>
  </>
)
```

No app-owned `activeRootEditor`, `getHistoryShortcut`,
`getHistoryBatchCount`, `updateHistory`, or post-history RAF focus repair.

### 2. `usePliteRootChrome`

Add a package hook for non-editable chrome around an `Editable root`.

Target shape:

```ts
type UseSlateRootChromeOptions = {
  disabled?: boolean
  focus?: 'end' | 'restore'
}

type SlateRootChromeController = {
  props: {
    'data-plite-root-chrome': RootKey
    onMouseDownCapture: React.MouseEventHandler<HTMLElement>
  }
  root: RootKey
}
```

Expected example shape:

```tsx
const chrome = usePliteRootChrome(root)

return (
  <section {...chrome.props}>
    <div>{label}</div>
    <Editable root={root} />
  </section>
)
```

Behavior:

- clicking non-interactive chrome activates/focuses that root;
- clicking inside the editable is ignored;
- clicking interactive descendants such as buttons, inputs, links, selects, or
  textareas is ignored;
- no app ref, `requestAnimationFrame`, DOM query, manual selection import, or
  manual focus retry appears in userland;
- focus scheduling is handled by Plite React's root/view DOM capability after
  React has processed the event.

### 3. Keep Raw Plite Unopinionated

Do not add a product-shaped `MultiRootDocument` component.

Raw Plite should expose primitives:

- `<Plite editor>`
- `<Editable root>`
- `usePliteHistory`
- `usePliteRootChrome`
- `usePliteActiveRoot`
- `usePliteRootEditor`
- `usePliteRootState`
- state-field hooks

Plate can build richer product components on top.

## Decision Brief

### Principles

- App code describes document UI; Plite React owns editor runtime behavior.
- There is one history hotkey implementation, not one in `Editable` and one in
  every external input example.
- Focus policy is semantic, not timing-based. `requestAnimationFrame` should not
  be the public API.
- Multi-root history targets the active root by default because the user's last
  editing context is the useful context.
- State-field history and root-content history share one command surface.

### Chosen Option

Add two Plite React hooks: `usePliteHistory` and `usePliteRootChrome`.

This is the best shape because it removes the dirty example helpers without
inventing an opinionated document shell. It also reuses the runtime/view
foundation that already exists instead of exposing more of it to users.

### Rejected Alternatives

#### Keep helpers in the example

Rejected. This ships bad practice and normalizes copy-paste of internal timing
and selection policy.

#### Add only `usePliteActiveEditor`

Rejected as insufficient. It reduces one line but still leaves users to parse
shortcuts, read stack counts, choose selection metadata, and schedule focus.

#### Put undo/redo on `editor.history`

Rejected for React UI. Core `tx.history.undo()` already exists. The missing
surface is a React controller that understands active root, selectors, DOM
focus, external inputs, and event prevention.

#### Add a product `MultiRootEditor` wrapper

Rejected for raw Plite. This belongs in Plate or a demo app, not core Plite.

## Ecosystem Synthesis

- Lexical's useful lesson is lifecycle metadata and command execution inside a
  controlled update context. Plite should keep `state` / `tx`, but let React
  hooks choose focus and history metadata rather than making app code pass raw
  metadata objects.
- ProseMirror's useful lesson is that view/input owns DOM selection import and
  export. Plite React should own focus repair for root chrome and history
  replay, not examples.
- Tiptap's useful lesson is discoverable UI-facing commands. Plite should expose
  small hooks for toolbar/input integration while keeping mutation truth in
  `editor.update((tx) => ...)`.

## Implementation Notes For Ralph

### Package Work

- Add `usePliteHistory` under `packages/plite-react/src/hooks/`.
- Add `usePliteRootChrome` under `packages/plite-react/src/hooks/`.
- Export both from `packages/plite-react/src/index.ts`.
- Extract shared history-hotkey parsing from the editing kernel instead of
  duplicating the example's `getHistoryShortcut`.
- Build `canUndo` / `canRedo` through selector subscriptions, not full editor
  rerenders.
- Apply history through the active/fixed root view editor so selection identity
  stays root-aware.
- Encode focus policy through transaction metadata and the existing React DOM
  capability, not `requestAnimationFrame` in app code.

### Example Cleanup

Delete from `site/examples/ts/multi-root-document.tsx`:

- `KeyboardEvent` import if only used for history helper typing;
- `useRef` if only used for root chrome focus;
- `ReactEditor` type import;
- `usePliteActiveRoot` and `usePliteRootEditor` from the example if history is
  fully hook-owned;
- `getHistoryShortcut`;
- `getHistoryBatchCount`;
- `updateHistory`;
- `focusRoot`;
- `editorSurfaceRef`;
- `applyDocumentHistory`;
- manual history `requestAnimationFrame`.

Keep:

- document title state field;
- title `onChange`;
- root status badges;
- commit summary;
- three `Editable` surfaces.

## Testing Strategy

### Unit / React Contracts

Add focused contracts in `packages/plite-react/test/`:

- `usePliteHistory` returns `canUndo=false` and `canRedo=false` for empty
  stacks.
- `usePliteHistory` updates `canUndo` / `canRedo` after state-field and root
  content commits.
- `usePliteHistory().undo()` targets the active root by default.
- `usePliteHistory({ root: 'header' }).undo()` targets the fixed root.
- `usePliteHistory({ focus: 'preserve-dom' }).onKeyDown` handles Cmd/Ctrl-Z and
  Cmd/Ctrl-Shift-Z from an external input while preserving the input focus and
  selection.
- `usePliteHistory().undo()` from a toolbar button restores the active root
  focus without an app-level RAF.
- history shortcuts use the same parser path as `Editable` keydown handling.
- `usePliteRootChrome(root)` focuses the root when clicking non-interactive
  chrome.
- `usePliteRootChrome(root)` ignores clicks inside the editable.
- `usePliteRootChrome(root)` ignores interactive descendants.
- root chrome focus keeps root selection identity after undo/redo.

### Browser Proof

Update the multi-root browser route test:

- click header chrome, type, undo from the toolbar, verify header root changes
  and focus returns to header;
- focus title input, change title, press Cmd/Ctrl-Z, verify title changes and
  input focus remains;
- click body/footer chrome and verify active root follows visible focus;
- assert the example source no longer contains the helper names below.

Source cleanliness assertions:

```sh
rg -n "getHistoryShortcut|getHistoryBatchCount|updateHistory|applyDocumentHistory|requestAnimationFrame" site/examples/ts/multi-root-document.tsx
```

Expected result: no matches for library-owned behavior.

### Verification Commands

Ralph execution should run from `Plate repo root`:

```sh
bun --filter ./packages/plite-react test:vitest use-slate-history
bun --filter ./packages/plite-react test:vitest use-slate-root-chrome
bun --filter ./packages/plite-react test:vitest slate-runtime-provider-contract
bun --filter ./packages/plite-react typecheck
bun typecheck:site
bun lint:fix
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1
```

## Issue / Reference Sync

This plan changes public React hook targets and browser behavior expectations,
so the issue pass is closed as an accounting sync.

It adds no fixed issue claims and no improved issue claims. The plan is an API
and proof-route target only until Ralph execution lands implementation and
browser proof.

Updated reference docs:

- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`
- `docs/plite/references/pr-description.md`

Reviewed issue set:

| Issue | Decision |
| --- | --- |
| `#6016` | Keep triage-closed/non-fix. Shared node-object graphs across independent editor runtimes stay unsupported; this API keeps the one-runtime, many-root answer. |
| `#5537` | Keep cluster-synced. `usePliteRootChrome` and root focus proof strengthen the multi-editor focus owner, but exact programmatic multi-editor focus closure is not claimed. |
| `#5117` | Keep future-proof/example pressure. Root-local chrome/focus must not leak DOM state across views, but placeholder measurement closure is not claimed. |
| `#5515` | Keep cluster-synced. `usePliteHistory` is active-root history, not Undo/Redo All. |
| `#3893` | Keep related. External controls and buttons motivate focus-state proof; exact HTML button focus closure is not claimed. |
| `#3634`, `#4961` | Keep related. Root focus APIs strengthen programmatic focus/input ownership; exact focus-after-insert and focus-after-ReactEditor.focus closure still need targeted browser proof. |
| `#3705`, `#3756`, `#3921` | Preserve existing history-selection statuses. `usePliteHistory` must not broaden partial `set_selection` or refocus claims. |
| `#3534`, `#3551`, `#4559`, `#3499` | Preserve existing fixed claims. The new hook must keep those history-selection guarantees but does not add new closure scope. |
| `#3460` | Treat as API pressure only. Toolbar and command UI outside the editor subtree need stable editor access; this plan solves the raw Plite hook shape, not a legacy issue closure. |

## Research / API Pressure Pass

Status: complete.

The hook names survive pressure.

- `usePliteHistory` is better than `usePliteUndoRedo` because the owned surface
  includes stack selectors, keyboard history shortcuts, state-field history,
  root-content history, and focus policy.
- `usePliteRootChrome` is better than `usePliteRootFocus` because the hook owns
  the root's non-editable surrounding surface, not only the final focus call.
- `focus: 'restore-root' | 'preserve-dom' | 'none'` is explicit enough for raw
  Plite. It avoids timing vocabulary and maps directly to user-visible
  behavior.
- Keeping `root?: RootKey` on `usePliteHistory` is the right override. Default
  active-root behavior stays ergonomic, while fixed-root toolbars remain
  possible.

Research evidence is consistent:

- Lexical supports command execution inside a controlled update lifecycle with
  metadata for focus, DOM selection, and history.
- ProseMirror supports centralized view/input ownership for DOM selection
  import/export.
- Tiptap supports discoverable UI command ergonomics, but raw Plite should keep
  commands as hooks plus `editor.update`, not copy chain-first product DX.

## Test-Plan Pressure Pass

Status: complete.

The required coverage is strong enough for Ralph execution:

- package hook contracts for `usePliteHistory`;
- package hook contracts for `usePliteRootChrome`;
- focused source-cleanliness assertion removing bad example helpers;
- multi-root browser proof for title-input history, toolbar history, root chrome
  click, active root focus, and no app-level RAF;
- existing history regression claims must stay green.

Do not rely on model-only selection helpers for this surface. The browser row
must assert real focus/native selection and follow-up typing.

## Maintainer Objection Pass

Status: complete.

| Objection | Answer |
| --- | --- |
| "Why not keep this example-local?" | Because users copy examples. Shipping app-owned hotkey parsing, stack reads, selection metadata, and RAF focus repair teaches bad Plite React usage. |
| "Why not editor methods?" | Core already has `tx.history.undo()` and `tx.history.redo()`. The missing piece is React UI behavior: active root, selector subscriptions, event prevention, and DOM focus policy. That belongs in hooks. |
| "Why does raw Plite need a chrome hook?" | Multi-root roots have labels, badges, borders, and non-editable surrounding UI. A tiny hook keeps raw Plite unopinionated while preventing every app from hand-rolling brittle focus scheduling. |
| "Does this implement Undo/Redo All?" | No. It intentionally does not broaden `#5515`. Active-root history is the sane default for one editor with multiple views. |
| "Is this a Plate component?" | No. It is still primitive: one hook for history, one hook for root chrome. Plate can compose richer UI from them. |

## Pass Schedule

| Pass | Status | Notes |
| --- | --- | --- |
| current-state-read | complete | Live example and package internals were re-read. |
| related-issue-discovery | complete | Ledger-first issue pass closed with zero new fixed/improved claims. |
| research-synthesis | complete | Lexical/ProseMirror/Tiptap evidence supports hooks plus runtime-owned focus/history policy. |
| API pressure pass | complete | Keep `usePliteHistory` and `usePliteRootChrome`; no product wrapper. |
| test-plan pressure pass | complete | Contract/browser/source-cleanliness proof rows are named. |
| maintainer objection pass | complete | Main objections answered without broadening raw Plite scope. |
| final closure gates | complete | Plan is ready for Ralph execution. |

## Confidence Score

Final score: 0.93. No dimension is below 0.85.

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.92 | Hook target uses selector subscriptions, stable callbacks, and package-owned focus scheduling instead of app-level rerender/focus loops. |
| Plite-close unopinionated DX | 0.94 | Two primitive hooks, no product shell, no MultiRootEditor wrapper, and no example-local command plumbing. |
| Plate and slate-yjs migration backbone | 0.90 | Root-aware history/focus target stays aligned with runtime/view/state-field architecture and does not invent product APIs. |
| Regression-proof testing strategy | 0.94 | Contract, browser, and source-cleanliness rows are named, including external-input history and root chrome focus. |
| Research evidence completeness | 0.93 | Lexical/ProseMirror/Tiptap compiled research supports update metadata, view-owned DOM selection, and discoverable UI command hooks. |
| shadcn-style composability | 0.93 | Hook + prop object shape is minimal, composable, and works for toolbar/input/root chrome composition. |

## Next Action

Run Ralph execution. Implement `usePliteHistory`, `usePliteRootChrome`, clean the
canonical example, and prove the behavior from `Plate repo root`.

## Ralph Execution Ledger

### 2026-05-23 - execution start

- `ralph` reset the runtime completion state to `pending`.
- Current pass: `tdd-pass`.
- Current owner: `packages/plite-react`.
- Current behavior slice: first public `usePliteHistory` hook contract.
- Continuation prompt: `active goal state`.
- Reference docs: no change yet; issue pass remains complete with zero new fixed/improved claims.
- Next action: add one failing hook contract, then implement the minimal hook surface needed to pass.

### 2026-05-23 - execution complete

- Added `usePliteHistory` with stack availability, undo/redo, keyboard shortcut
  handling, fixed-root override, external-input focus preservation, and last
  editor-root fallback for toolbar clicks.
- Added `usePliteRootChrome` with package-owned root chrome focus, editable and
  interactive descendant ignore rules, mounted-root editor focus, and root
  selection initialization.
- Added shared history hotkey parsing for the editing kernel and the public
  hook.
- Added mounted root editor lookup to Plite React runtime context so hooks use
  the DOM-owning `<Editable root>` view for focus.
- Fixed `DOMEditor.focus` to trust the real DOM active element before returning
  from stale internal focus state.
- Cleaned `site/examples/ts/multi-root-document.tsx`; it no longer owns history
  shortcut parsing, stack reads, manual history updates, active-root editor
  plumbing, root chrome refs, or app-level RAF focus repair.
- Added solution note:
  `docs/solutions/ui-bugs/2026-05-23-slate-react-mounted-root-editor-focus-for-root-chrome-history.md`.
- Verification:
  - `bun --filter plite-react test:vitest -- ./test/use-slate-history.test.tsx ./test/use-slate-root-chrome.test.tsx ./test/slate-runtime-provider-contract.test.tsx ./test/react-editor-contract.tsx`
  - `bun --filter plite-react typecheck`
  - `bun --filter plite-dom typecheck`
  - `bun typecheck:site`
  - `bun lint:fix`
  - `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1`
  - Browser proof on `http://localhost:3100/examples/multi-root-document`: header/footer chrome focus, toolbar undo/redo refocus, title input `Meta+Z` focus preservation, no browser error logs.
  - Source-cleanliness grep for removed helpers returned no matches.
