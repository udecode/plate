---
title: Slate v2 derived lint decorations need snapshot sources and panel subscriptions
date: 2026-05-19
category: docs/solutions/developer-experience
module: Slate v2 Linting example
problem_type: developer_experience
component: documentation
symptoms:
  - Run linter followed by typing before a diagnostic can leave highlights on stale offsets.
  - A visible issue count can disagree with the highlighted text if the panel does not subscribe to editor changes.
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - slate-v2
  - decorations
  - linting
  - examples
  - use-editor-state
  - snapshot
---

# Slate v2 derived lint decorations need snapshot sources and panel subscriptions

## Problem

The `Linting` example looked clean after moving to
`useSlateRangeDecorationSource`, but it still stored computed lint ranges in
React state. That teaches the wrong model for derived diagnostics: text edits
after `Run linter` can move the document while stored ranges keep old offsets.

## Symptoms

- `Run linter`, then type at the start of the document before the word
  `obviously`; the warning can highlight the wrong text if ranges are stored.
- `Apply first fix` can apply the first fix using stale coordinates unless it
  reads the latest editor snapshot.
- Even after fixing the source, the count/list can stay stale if it is rendered
  by a parent component that does not subscribe to editor updates.

## What Didn't Work

- Keeping `readonly LintIssueDecoration[]` in React state and refreshing only on
  `deps: [diagnostics]`. That updates on button clicks, but text edits do not
  recompute derived diagnostics.
- Switching only the decoration source to `read({ snapshot })` while leaving the
  status panel outside the editor subscription path. Highlights update, but the
  visible diagnostics can lag behind.
- Copying comment bookmark logic. Bookmarks are right for durable user comments;
  lint findings are ephemeral results that should be recomputed from the latest
  snapshot.

## Solution

Store lint mode/configuration, not lint ranges. Let the source derive ranges
from the snapshot it is given, and let the visible panel subscribe to editor
state.

Bad:

```tsx
const [diagnostics, setDiagnostics] =
  useState<readonly LintIssueDecoration[]>([])

const lintingSource = useSlateRangeDecorationSource<LintIssue>(editor, {
  deps: [diagnostics],
  id: 'linting',
  dirtiness: 'external',
  read: () => diagnostics,
})
```

Good:

```tsx
const [lintMode, setLintMode] = useState<LintMode>('off')

const lintingSource = useSlateRangeDecorationSource<LintIssue>(editor, {
  deps: [lintMode],
  id: 'linting',
  dirtiness: ['text', 'external'],
  read: ({ snapshot }) =>
    lintMode === 'off'
      ? []
      : collectLintIssues(snapshot, {
          includeServerDiagnostics: lintMode === 'server',
        }),
})
```

Then render the visible diagnostics from an editor subscription, not from stale
parent render state:

```tsx
const diagnostics = useEditorState(
  (state) =>
    lintMode === 'off'
      ? NO_LINT_ISSUES
      : collectLintIssues(state.runtime.snapshot(), {
          includeServerDiagnostics: lintMode === 'server',
        }),
  { deps: [lintMode] }
)
```

`Apply first fix` should also compute its target from the latest snapshot:

```tsx
const fix = collectFromEditor(lintMode).find(
  (diagnostic) => diagnostic.data.fixText
)
```

## Why This Works

`useSlateRangeDecorationSource` already has the right contract for derived
overlays: the `read` callback receives the current snapshot whenever the source
is dirty. Marking both `text` and `external` as dirty means document edits and
mode/server changes both recompute the same derived lint ranges.

The panel needs its own subscription because the source projection store updates
the overlay rendering, not arbitrary React UI outside the subscribed editor
state. `useEditorState` keeps the count and issue list tied to the same current
snapshot as the highlights.

## Prevention

- For derived diagnostics, search results, and lint findings, store query/mode
  inputs and recompute ranges from `read({ snapshot })`.
- For durable user annotations, use bookmarks or range refs; do not apply that
  model to ephemeral lint results by default.
- If an example shows a count/list beside live decorations, render that panel
  under `<Slate>` and derive it with `useEditorState`.
- Browser coverage should type before an existing diagnostic after enabling the
  source, then assert the highlighted text still matches the intended words.

## Related Issues

- [Slate React v2 projection proof must split range semantics from the React overlay store](../logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md)
- [Annotation store inputs must keep stable data references](../logic-errors/2026-04-15-annotation-store-inputs-must-keep-stable-data-references.md)
