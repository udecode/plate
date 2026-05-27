---
title: Slate v2 large-document shell policy must be explicit and corridor-mounted
date: 2026-05-01
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "`largeDocument={{ enabled: true }}` made shell virtualization look like the normal large-document default."
  - "`activeRadius` marked neighboring islands active while only one top-level block was mounted."
  - "Shell promotion could run while IME composition was active."
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, performance, huge-document, shell, corridor, api]
---

# Slate v2 large-document shell policy must be explicit and corridor-mounted

## Problem

Slate v2's large-document shell path was doing useful work, but the API and corridor semantics were lying. `enabled: true` made shell virtualization read like the general large-document default, and `activeRadius` could mark islands active without mounting their editable descendants.

## Symptoms

- `largeDocument={{ enabled: true }}` hid the real policy choice: safe DOM-present grouping versus aggressive shell virtualization.
- `createIslandPlan` set `isActive` for radius-neighbor islands but only mounted one top-level runtime id from the center island.
- Mounted-range selection logic could believe a full island corridor existed while React only rendered one block.
- Shell activation had no composition guard, so a shell click/key activation could promote while IME composition was active.

## What Didn't Work

- Treating shell islands as a generic `enabled` optimization. That blurred the line between a safe default and an aggressive mode with browser selection, find, accessibility, clipboard, IME, and mobile risks.
- Keeping `activeRadius` as metadata only. A corridor that does not mount its active islands is not a corridor.
- Trusting old shell performance numbers without remeasuring after fixing the mounted-corridor semantics.

## Solution

Make shell mode explicit and make active islands actually mount.

Before:

```ts
type LargeDocumentOptions = {
  activeRadius?: number
  enabled?: boolean
  islandSize?: number
  previewChars?: number
  threshold?: number
}
```

After:

```ts
type LargeDocumentMode = 'auto' | 'dom-present' | 'off' | 'shell'

type LargeDocumentOptions =
  | LargeDocumentMode
  | {
      activeRadius?: number
      islandSize?: number
      mode: 'shell'
      previewChars?: number
      threshold?: number
    }
```

The render policy is now honest:

- omitted or `largeDocument="auto"`: safe DOM-present grouping;
- `largeDocument="dom-present"`: force the safe DOM-present layer;
- `largeDocument="off"`: disable automatic root grouping;
- `largeDocument={{ mode: 'shell', ... }}`: opt into aggressive shell virtualization.

Fix corridor mounting in `createIslandPlan`:

```ts
const isActive = islandIndex >= activeStart && islandIndex <= activeEnd
const runtimeIds = topLevelRuntimeIds.slice(startIndex, endIndex + 1)

islands.push({
  isActive,
  mountedRuntimeIds: isActive ? runtimeIds : [],
  runtimeIds,
  // ...
})
```

Also fail closed during composition in `LargeDocumentIslandShell`:

```ts
event.preventDefault()

if (IS_COMPOSING.get(editor)) {
  return
}

onPromote?.(islandIndex, { select: true })
```

## Why This Works

The API now says what the runtime does. DOM-present grouping is the safe default; shell mode is an explicit aggressive choice.

The selection and reconciliation layers can also trust the mounted ranges again. If an island is active, all its top-level runtime ids are mounted. If it is inactive, it is a shell. There is no half-active state where model logic believes content is mounted but React renders only one block.

Composition is treated as a hard boundary. Shell promotion during IME can move focus and selection under the browser's composition machinery, so the shell should ignore activation until composition ends.

## Prevention

- Do not expose risky rendering modes behind vague booleans like `enabled`.
- If an API says `active`, the active content must exist in the DOM or the API should be renamed.
- Rerun the large-document compare after changing mount breadth; old shell numbers may be invalid after a corridor fix.
- Keep package tests for each policy mode:
  - default/`auto` groups DOM-present roots;
  - `dom-present` explicitly groups;
  - `off` disables grouping;
  - `{ mode: 'shell' }` shells far islands.
- Keep a composition test proving shell interaction does not promote while `IS_COMPOSING` is true.

## Related Issues

- [Active radius 1 is the best large-document corridor default for RC](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-active-radius-1-is-the-best-large-document-corridor-default-for-rc.md)
- [Shell promotion must move selection into the promoted island or it is just cosmetic](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-shell-promotion-must-move-selection-into-the-promoted-island-or-it-is-just-cosmetic.md)
- [Shell-backed large-document selection must fail closed in DOM and run broad ops through the model](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-shell-backed-large-document-selection-must-fail-closed-in-dom-and-run-broad-ops-through-the-model.md)
