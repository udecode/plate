---
title: Slate React runtime owner cuts need static inventories and browser proof
date: 2026-04-27
last_updated: 2026-04-28
category: docs/solutions/developer-experience
module: slate-v2 slate-react runtime architecture
problem_type: developer_experience
component: tooling
symptoms:
  - EditableDOMRoot kept selection, repair, kernel trace, and root selector policy in React closures.
  - Local refactors could look clean while moving bridge responsibility without reducing it.
  - Release proof failed when the escape-hatch inventory count changed but the guard was not updated.
root_cause: inadequate_documentation
resolution_type: workflow_improvement
severity: high
tags: [slate-v2, slate-react, runtime-ownership, static-guards, browser-proof, architecture]
---

# Slate React runtime owner cuts need static inventories and browser proof

## Problem

`EditableDOMRoot` accumulated hot editing policy while React was supposed to be
projection and wiring. Moving that policy safely required more than extracting
helpers: every bridge had to be assigned to a runtime owner and then proved in
browser rows that exercise real selection, repair, IME, void, table, and
decoration flows.

## Symptoms

- `EditableDOMRoot` owned generic root selectors, DOM-selection import,
  repair queue construction, event frame creation, kernel trace payloads,
  composition state transitions, and Android manager lifecycle.
- A change could reduce one local smell while leaving the same policy under a
  different broad React closure.
- `bun check:full` release discipline failed until the escape-hatch inventory
  reflected the reduced `react-runtime:stale` count.

## What Didn't Work

- Treating examples as the safety net. Example rows are useful proof, but they
  do not prevent broad selector or bridge policy from creeping back into
  `EditableDOMRoot`.
- Moving code into helper functions without static inventories. That makes the
  file smaller without proving ownership changed.
- Calling targeted Chromium proof enough for closure. The focused pack caught
  the reported classes, but the plan was not done until generated stress and
  `bun check:full` also passed.

## Solution

Use static inventories as the architecture lock, then use browser proof as the
regression lock.

The durable pattern is:

```ts
// test/kernel-authority-audit-contract.ts
expectAuthorityInventory(/\bbeginEditableEventFrame\(/g, {
  'packages/slate-react/src/editable/runtime-kernel-trace.ts': {
    count: 3,
    next: 'central-owner',
    owner: 'Runtime kernel trace engine',
    rationale:
      'Non-selectionchange event frames are owned by the runtime kernel trace engine.',
  },
})
```

Then make `EditableDOMRoot` call runtime methods named by intent:

```ts
const {
  beginKeyDownEventFrame,
  recordKeyDownTrace,
  repairDOMInputWithTrace,
} = useRuntimeKernelTraceEngine({
  domRepairQueue,
  editor,
  inputController,
})
```

Do the same for root render facts:

```ts
const {
  islandPlan,
  mountedTopLevelRanges,
  mountedTopLevelRuntimeIds,
  topLevelRuntimeIds,
} = useLargeDocumentRootSources({
  largeDocumentConfig,
  promotedIslandIndex,
})
```

For root event handlers, keep `EditableDOMRoot` on a single facade import and
compose event families behind that facade:

```ts
const eventRuntime = useEditableEventRuntime({
  android,
  composition,
  repair,
  selection,
  state,
  trace,
})

const {
  handleBeforeInput,
  handleBlur,
  handleCompositionEnd,
  handleCopy,
  handleCut,
  handleDragOver,
  handleDrop,
  handleFocus,
  handleInput,
  handleKeyDown,
  handleMouseDown,
  handlePaste,
  handleDOMBeforeInput,
  handleDOMInput,
  handleReactBeforeInput,
  handleReactInput,
} = eventRuntime.handlers
```

For root orchestration, use the same rule. `EditableDOMRoot` should call one
root runtime facade instead of assembling selectionchange, Android, repair,
trace, selector wakeups, and global lifecycle listeners in React:

```ts
const {
  callbackRef,
  eventRuntime,
  isComposing,
  receivedUserInput,
  rootRef,
  shellBackedSelection,
} = useEditableRootRuntime({
  autoFocus,
  decorate,
  editor,
  inputController,
  readOnly,
  rootPropsRef,
  scrollSelectionIntoView,
  state,
})
```

Guard the root boundary explicitly:

```ts
expectSourceOwnershipInventory(
  editableRootRuntimeFiles,
  /useEditableRootRuntime\(/g,
  {
    'packages/slate-react/src/components/editable.tsx': {
      count: 1,
      owner: 'Editable root component',
      next: 'keep-as-root-facade-call',
      rationale:
        'EditableDOMRoot may instantiate the root runtime facade, but root policy lives behind that facade.',
    },
  }
)
```

The root should not import every event-family worker directly. Event-family
modules can be small and policy-specific, but the root boundary should see one
event runtime capability and one root runtime capability.

Close with proof at three levels:

- focused package contracts for ownership and selector facts
- targeted browser rows for the reported regression families
- generated stress plus `bun check:full` for release-quality closure

## Why This Works

Static inventories make architectural drift visible. If someone adds a direct
`useSlateSelector`, `syncEditorSelectionFromDOM`, `beginEditableEventFrame`,
`recordEditableKernelTrace`, or `forceRender()` call in the wrong place, the
package guard fails before browser symptoms become a whack-a-mole queue.

Browser proof catches the other half: timing and DOM authority bugs that static
ownership cannot prove. The combination is what keeps a runtime-owner refactor
from becoming a cosmetic file split.

## Prevention

- Every hot owner cut needs a static inventory update in the same patch.
- A reduced bridge count must update release-discipline inventory immediately;
  otherwise `bun check:full` should fail.
- A reduced stale-count inventory is also meaningful. If a root extraction
  removes one `editor.selection` / `editor.children` / `editor.marks` /
  `editor.operations` / `editor.apply` / `editor.onChange` match, update the
  release inventory only after confirming the remaining match is intentional.
- Keep runtime modules named by ownership:
  `runtime-selection-engine`, `runtime-repair-engine`,
  `runtime-kernel-trace`, `runtime-composition-engine`,
  `runtime-android-engine`, `runtime-event-engine`,
  `runtime-root-engine`, and `root-selector-sources`.
- Guard `EditableDOMRoot` against direct event-family imports. One facade import
  is the intended shape; many worker imports means React is assembling the event
  runtime again.
- Guard `EditableDOMRoot` against direct root policy calls:
  `useRuntimeAndroidEngine`, selectionchange scheduler/import controller setup,
  repair runtime setup, trace runtime setup, root commit wakeups, and global
  drag/selection lifecycle attachment.
- Browser handle and target-runtime publication belong behind named runtime
  bridge hooks, not inline effects inside `EditableDOMRoot`.
- Targeted browser packs should include the user-reported families, but closure
  still requires generated stress and `bun check:full`.
- If a browser row fails once and passes alone, record it in the plan until the
  full closure gate proves the lane.
- Closure evidence for this cut included focused authority/provider guards,
  `slate-react` typecheck, selection/editing kernel contracts, targeted
  `slate-browser`/`slate-dom`/`slate-react` build, focused browser rows for
  hovering toolbar, search, mentions, tables, images, and large-document
  runtime, then `bun check:full` with 628 browser tests passed and 4
  replay-artifact rows skipped.

## Related Issues

- [Slate React public selectors must stay model-truth](./2026-04-27-slate-react-public-selectors-must-stay-model-truth.md)
- [Slate React void renderers should not own hidden children](./2026-04-27-slate-react-void-renderers-should-not-own-hidden-spacer-children.md)
- [Slate React repair-induced selectionchange must stay model-owned](../ui-bugs/2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [Slate React keydown must import DOM selection before model-owned navigation](../ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
