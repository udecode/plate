---
date: 2026-04-15
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Annotation store inputs must keep stable data references
tags:
  - slate-v2
  - annotations
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
