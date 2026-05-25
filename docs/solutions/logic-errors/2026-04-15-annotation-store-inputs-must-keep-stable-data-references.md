---
module: slate-v2
date: 2026-04-15
last_updated: 2026-04-27
problem_type: logic_error
component: documentation
root_cause: logic_error
resolution_type: code_fix
title: Annotation store inputs must keep stable data references
symptoms:
  - External editor controls lose focus when store inputs are recreated.
  - Annotation or projection refreshes can cascade into avoidable rerenders.
tags:
  - slate-v2
  - annotations
  - projections
  - widgets
  - examples
  - react
  - performance
severity: medium
---

# Annotation store inputs must keep stable data references

## What happened

The new `review-comments` example loaded the editor route, then blew up with
`Maximum update depth exceeded`.

The failure looked like a generic React loop at first, but the real cause was
more specific: the example rebuilt fresh annotation payload objects on every
render and fed them straight into `useSlateAnnotationStore(...)`.

## What fixed it

Memoize the annotation entries so unchanged comments keep the same `data`
reference identity across renders.

Bad:

```tsx
const annotationStore = useSlateAnnotationStore(
  editor,
  comments.map((comment) => ({
    id: comment.id,
    bookmark: comment.bookmark,
    data: {
      body: comment.body,
      label: comment.label,
      tone: comment.tone,
    },
  }))
);
```

Good:

```tsx
const annotations = useMemo(
  () =>
    comments.map((comment) => ({
      id: comment.id,
      bookmark: comment.bookmark,
      data: comment,
    })),
  [comments]
);

const annotationStore = useSlateAnnotationStore(editor, annotations);
```

## Why This Works

`createSlateAnnotationStore(...)` treats annotation snapshots as unchanged only
when the bookmark, resolved range, and `data` object keep stable identity.

If you create a fresh `data` object every render, the hook refreshes the store
every render, which can cascade into mounted editor rerenders and eventually a
loop.

## Reusable rule

When feeding `useSlateAnnotationStore(...)`:

- memoize the annotation array
- keep `data` references stable for unchanged items
- do not rebuild derived payload objects inline every render unless you actually
  want a refresh

The same bias applies to widget and projection input arrays too. If the store
contract compares by reference, treat input identity like part of the API.

## Projection Store Update

The same rule bit `/examples/search-highlighting`: the search input updated
decorations correctly, but if the editor had focus first, typing the first
letter moved focus back to the editor.

The cause was rebuilding `createSlateProjectionStore(...)` from React search
state. Changing the input changed state, state recreated the projection store,
and the editor remount path restored the previous editor focus.

Bad:

```tsx
const [search, setSearch] = useState('')

const projectionStore = useMemo(
  () =>
    createSlateProjectionStore(
      editor,
      (snapshot) => collectSearchProjections(snapshot.children, search),
      { dirtiness: ['text', 'external'], sourceId: 'search-highlighting' }
    ),
  [editor, search]
)
```

Good:

```tsx
const searchRef = useRef('')

const projectionStore = useMemo(
  () =>
    createSlateProjectionStore(
      editor,
      (snapshot) =>
        collectSearchProjections(snapshot.children, searchRef.current),
      { dirtiness: ['text', 'external'], sourceId: 'search-highlighting' }
    ),
  [editor]
)

const handleSearchChange = useCallback(
  (event: ChangeEvent<HTMLInputElement>) => {
    searchRef.current = event.currentTarget.value
    projectionStore.refresh({ reason: 'external' })
  },
  [projectionStore]
)
```

Keep the store stable. Put external control state in a ref, then explicitly
refresh the store with the external dirtiness reason.
