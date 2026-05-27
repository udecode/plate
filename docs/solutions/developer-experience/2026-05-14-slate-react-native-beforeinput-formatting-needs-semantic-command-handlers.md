---
title: Slate React native beforeinput formatting needs semantic command handlers
date: 2026-05-14
category: docs/solutions/developer-experience
module: slate-v2 slate-react native-input
problem_type: developer_experience
component: tooling
symptoms:
  - Examples parsed `InputEvent.inputType` directly for normal formatting behavior.
  - App callback identity changes could force native beforeinput listener churn.
  - Raw DOM event handlers blurred Slate runtime ownership with app mark policy.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, beforeinput, commands, callbacks, dx]
---

# Slate React native beforeinput formatting needs semantic command handlers

## Problem

Slate React formatting examples used raw `onDOMBeforeInput` parsing for normal
editor behavior. That made users handle browser event spellings directly and
encouraged callback memoization ceremony around a runtime-owned native listener.

## Symptoms

- `hovering-toolbar` switched on `event.inputType` values such as `formatBold`.
- The example wrapped the handler in `useMemo(() => callback, [editor])`.
- Native input listener wiring depended on app callback identity.
- Raw browser-event examples became the path people copied for model behavior.

## What Didn't Work

- Keeping formatting in raw `onDOMBeforeInput`. It preserves native access, but
  it teaches browser quirks as normal Slate API.
- Asking users to wrap event props in `useMemo` or `useCallback`. That exports
  runtime listener churn as app responsibility.
- Hard-coding a default mark mutation for raw Slate. Slate can report intent
  without deciding whether the app uses `bold`, `strong`, or a custom schema.

## Solution

Keep `onDOMBeforeInput` as the raw native escape hatch, but route normal
formatting behavior through a semantic command handler:

```tsx
<Editable
  onCommand={(command, { editor }) => {
    if (command.kind !== 'format') return

    switch (command.format) {
      case 'bold':
      case 'italic':
      case 'underline':
        toggleMark(editor, command.format)
        return true
    }
  }}
/>
```

Inside the runtime, classify native `format*` beforeinput and matching hotkeys
into command objects, then invoke the semantic handler before default fallback.
Keep native listeners attached to the root and read the latest app handlers from
stable runtime state.

## Why This Works

The runtime owns native event normalization, command classification, and DOM
repair. App code owns mark schema policy. Splitting those boundaries gives raw
Slate native access without forcing common examples to parse DOM event strings
or memoize callbacks for listener stability.

## Prevention

- Use semantic command/input-rule surfaces for model behavior.
- Reserve `onDOMBeforeInput` examples for advanced native event escape hatches.
- Add tests that prove latest callbacks are read without native listener
  reattachment.
- Add browser proof for real native format beforeinput behavior when examples
  change.

## Related Issues

- `docs/solutions/test-failures/2026-04-29-slate-browser-command-rows-must-share-app-text-policy-with-native-input.md`
- `docs/solutions/ui-bugs/2026-04-30-slate-react-beforeinput-delete-commands-must-refresh-synced-selection.md`
- `docs/plans/2026-05-14-slate-v2-callback-memoization-dx-ralplan.md`
