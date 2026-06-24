---
module: docs-examples
date: 2026-04-01
problem_type: runtime_error
component: documentation
symptoms:
  - "A docs example throws `The usePlite hook must be used inside the <Plite> component's context.`"
  - "The failure points at a raw `Editable` rendered inside `<Plate>`."
  - "Plite-mode examples work, but the Plate pane crashes at runtime."
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - plate
  - docs-examples
  - platecontent
  - editable
  - slate-context
---

# Plate docs examples should use `PlateContent` under `Plate`

## Problem

A docs example tried to mirror Plite by rendering a raw `Editable` inside
`<Plate>`. That crashed at runtime even though the page shape looked valid.

## Symptoms

- The browser threw `The usePlite hook must be used inside the <Plite> component's context.`
- The stack pointed at the Plate pane's `Editable`.
- The same page could still render the Plite pane, which made the failure look
  like a data or render-prop issue when it was really the wrong wrapper.

## What Didn't Work

Using the same raw `Editable` component in both panes looked clean, but Plate
is not just "Plite plus more props". The Plate side needs the wrapper that
installs Plate's editable pipeline and Plite context in the right order.

## Solution

Render `PlateContent` under `<Plate>` instead of raw `Editable`.

Before:

```tsx
<Plate editor={editor as any}>
  <Editable
    placeholder="Enter some text…"
    renderChunk={config.chunkDivs ? (renderChunk as any) : undefined}
    renderElement={renderElement as any}
    spellCheck
  />
</Plate>
```

After:

```tsx
<Plate editor={editor as any}>
  <PlateContent
    placeholder="Enter some text…"
    renderChunk={config.chunkDivs ? (renderChunk as any) : undefined}
    renderElement={renderElement as any}
    spellCheck
  />
</Plate>
```

## Why This Works

`PlateContent` is the Plate-owned editable surface. It installs `Plite`,
`useEditableProps`, effect wiring, and the rest of the editable stack before
rendering the underlying Plite editable. Raw `Editable` skips that setup, so
hooks like `usePlite` run without the context they expect.

## Prevention

- In docs examples, use raw `Editable` only for pure Plite examples.
- In Plate examples, prefer `PlateContent` or the repo's `Editor` wrapper from
  [editor.tsx](/Users/zbeyens/git/plate-2/apps/www/src/registry/ui/editor.tsx).
- If a Plate example throws a Plite-context hook error, check the editable
  wrapper before chasing render props or node types.
