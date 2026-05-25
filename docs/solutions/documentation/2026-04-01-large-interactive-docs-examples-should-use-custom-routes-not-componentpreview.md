---
module: docs-examples
date: 2026-04-01
problem_type: documentation_ui
component: documentation
symptoms:
  - "A large interactive example shows `Loading...` for too long inside the docs page."
  - "Top controls exist but are hidden or scrolled out inside the preview shell."
  - "The example works when loaded directly, but feels broken in docs."
root_cause: wrong_surface
resolution_type: architecture_fix
severity: medium
tags:
  - plate
  - docs-examples
  - componentpreview
  - doccontent
  - huge-document
---

# Large interactive docs examples should use custom routes, not `ComponentPreview`

## Problem

`ComponentPreview` is fine for normal examples. It is the wrong surface for a
huge interactive page with its own controls, long scroll area, and expensive
editor mount.

The Huge Document example worked, but the preview shell made it look busted:
it introduced extra loading time, nested scrolling, and hid the controls that
were supposed to be the main point of the example.

## Symptoms

- The docs page spent too long in a preview `Loading...` state.
- The controls were rendered, but the preview viewport landed inside the editor
  content instead of at the top of the example.
- Browser debugging showed the example itself was fine. The wrapper was the
  problem.

## What Didn't Work

Tweaking the example inside the preview was the wrong fight. Removing
`autoFocus`, adjusting the editor, or shuffling internal layout only changed
the symptoms. The preview shell still owned the scroll box and loading flow.

## Solution

Render heavy examples as custom docs routes under `app/(app)/docs/examples/*`
and wrap them with `DocContent`, just like
[server-side/page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/(app)/docs/examples/server-side/page.tsx).

For Huge Document, the fix was:

1. Create a custom route page:
   [page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/(app)/docs/examples/huge-document/page.tsx)
2. Render the example directly inside `DocContent`.
3. Delete the MDX files that only existed to host `<ComponentPreview />`.

## Why This Works

The custom route owns the full page layout. There is no nested preview frame,
no preview-loading shell, and no second scroll container fighting the example.

That keeps the controls at the top where they belong and lets the example act
like a real docs page instead of an embedded demo.

## Prevention

- Use `ComponentPreview` for lightweight examples.
- Use a custom docs route for examples with their own control panel, heavy
  mount cost, or large scrollable content.
- If an example looks fine in isolation but bad in docs, inspect the preview
  wrapper before blaming the example itself.
