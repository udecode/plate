---
title: Editor behavior specs must lock node model and affinity before UX chrome
date: 2026-04-04
category: best-practices
module: editor-behavior
problem_type: best_practice
component: documentation
symptoms:
  - A spec says something is an atom, but the runtime node is still editable text.
  - Navigation behavior gets specified before the document model underneath it is explicit.
  - Inline boundary bugs show up as toolbar, selection, or hover weirdness instead of obviously wrong model law.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: high
tags: [editor-behavior, specs, node-model, void, affinity, inline-atoms]
---

# Editor behavior specs must lock node model and affinity before UX chrome

## Problem

It is easy to spec the visible behavior first:

- click does this
- hover does that
- backlink should jump here

But if the spec never locks the actual node model, the UX law is built on sand.
That is exactly how a footnote reference can be described like an atom while
still behaving like editable inline text.

## Symptoms

- Backspace near a rendered chip edits its label instead of removing the atom.
- Programmatic navigation lands on a weird invisible selection.
- Floating toolbars appear for what should be navigation, not editing.
- Docs sound precise while the runtime still has the wrong `isVoid` or affinity
  contract.

## What Didn't Work

- Treating “rendered like a chip” as proof of atom semantics.
- Treating `contentEditable={false}` in the DOM as equivalent to a void node.
- Specifying backlink or hover behavior before saying whether the node is:
  block vs inline, void vs non-void, mark vs element.
- Letting affinity stay implicit for marks and inline spans.

## Solution

Make the spec stack declare two things up front for every current feature:

1. node model
2. affinity class when inline typing can cross the boundary

Use explicit model classes:

- `block non-void`
- `block void atom`
- `inline non-void span`
- `inline void atom`
- `leaf mark`
- `text token`
- `overlay / no node`

Use explicit affinity classes:

- `directional`
- `hard`
- `outward`
- `none / n-a`

Then define UX chrome on top of that model instead of the other way around.

## Why This Works

The model decides what the editor is even allowed to do:

- whether a caret may exist inside the thing
- whether Backspace removes a digit or the whole unit
- whether a toolbar should ever appear
- whether boundary typing extends the thing or stays outside it

Once that is explicit, selection, hover, jump, and toolbar rules get much less
hand-wavy.

## Prevention

- Do not lock a behavior row until the spec also says whether the entity is
  void.
- Do not infer node model from rendered DOM.
- Treat inline affinity as mandatory spec data for non-void spans and marks.
- Treat inline void atoms as atom-owned boundaries, not mark-affinity cases.
- If the docs claim a model that the runtime does not implement yet, reopen the
  row instead of pretending it is settled.

## Related Issues

- [markdown-standards.md](../../markdown-standards.md)
- [markdown-editing-spec.md](../../markdown-editing-spec.md)
- [markdown-parity-matrix.md](../../markdown-parity-matrix.md)
- [editor-protocol-matrix.md](../../editor-protocol-matrix.md)
