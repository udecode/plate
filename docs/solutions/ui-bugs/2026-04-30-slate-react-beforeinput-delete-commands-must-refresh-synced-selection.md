---
title: Slate React beforeinput delete commands must refresh synced selection
date: 2026-04-30
category: docs/solutions/ui-bugs
module: slate-v2 slate-react browser editing
problem_type: ui_bug
component: tooling
symptoms:
  - A prepared beforeinput delete command could keep the collapsed selection from before DOM selection import.
  - Expanded DOM selection imported during beforeinput could still execute as a single-character delete.
  - Insert command cleanup looked green while selection-dependent delete behavior was under-tested.
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, beforeinput, delete, selection, browser-editing]
---

# Slate React beforeinput delete commands must refresh synced selection

## Problem

`slate-react` cleanup threaded the typed kernel command into model-owned
`beforeinput` execution so insert commands no longer reparsed stale raw event
data. That was correct for text insertion, but delete command shape depends on
the current selection after DOM selection import.

## Symptoms

- A prepared `deleteContentBackward` command could be computed while Slate still
  had a collapsed selection.
- `syncSelectionForBeforeInput` could then import an expanded DOM selection, but
  execution still used the stale prepared single-character delete command.
- The first focused test proved typed insert commands won over stale event data,
  but did not cover delete command shape after selection sync.

## What Didn't Work

- Treating every prepared command as final. Insert command payloads should be
  final, but delete commands derive their shape from the latest selection.
- Going back to full reparsing for every command. That would lose the point of
  the typed input kernel and reintroduce stale raw event data as an authority.

## Solution

Keep prepared commands authoritative for non-delete input, but refresh delete
commands from the synced selection:

```ts
const parsedCommand = () =>
  getEditableCommandFromBeforeInputType({
    data,
    inputType: type,
    selection,
  })

const command =
  preparedCommand === undefined || type.startsWith('delete')
    ? (parsedCommand() ?? preparedCommand ?? null)
    : preparedCommand
```

Lock both sides with tests:

```ts
applyModelOwnedBeforeInputOperation({
  command: { inputType: 'insertText', kind: 'insert-text', text: 'kernel' },
  data: 'event',
  inputType: 'insertText',
})
```

and:

```ts
applyModelOwnedBeforeInputOperation({
  command: { direction: 'backward', kind: 'delete' },
  inputType: 'deleteContentBackward',
  selection: expandedSelection,
})
```

The insert row asserts the prepared command wins over stale event data. The
delete row asserts synced expanded selection upgrades the command to
`delete-fragment`.

## Why This Works

Text insertion authority lives in the typed command payload. Delete command
authority lives in both the input type and the selection shape. `beforeinput`
selection sync sits between kernel preparation and model execution, so delete
commands must be the narrow exception to "prepared command wins."

## Prevention

- Any input-kernel cleanup must classify commands by which fields are stable
  before DOM selection import.
- Add paired tests for prepared payload authority and selection-dependent
  command refresh.
- Keep the focused browser row for persistent native word-delete in the proof
  bundle after this kind of refactor.

## Related Issues

- [Slate React model-owned input must ignore stale DOM target ranges](./2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React repair-induced selectionchange must stay model-owned](./2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
