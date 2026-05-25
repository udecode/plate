---
title: Slate React custom voids must render children through a spacer
date: 2026-04-26
last_updated: 2026-04-27
category: docs/solutions/logic-errors
module: slate-react
problem_type: logic_error
component: testing_framework
symptoms:
  - The embeds example showed an extra blank line between the Vimeo URL input and the following paragraph.
  - The images example showed a weird blank void row above a selected image.
  - The hidden Slate void child rendered as visible layout height.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-react
  - slate-v2
  - voids
  - spacer
  - browser-layout
---

# Slate React custom voids must render children through a spacer

## Problem

`/examples/embeds` and `/examples/images` hand-rolled custom void wrappers and
rendered `{children}` directly in app-owned layout. The required Slate void
child then created a visible line box next to the real UI, breaking legacy
visual parity.

## Symptoms

- Browser metrics before the fix showed `38.390625px` between the URL input and
  the following paragraph.
- The selected image repro showed `22.390625px` between the image void top and
  the actual image content.
- The void wrapper had about `22.4px` of extra height after the input.
- The keyboard navigation proof for selectable voids still passed, so this was
  a layout regression, not a traversal regression.

## What Didn't Work

- Treating the paragraph margin as the owner. The following paragraph already
  had a normal `16px` top margin.
- Patching CSS around the input. That would hide one example symptom while
  leaving the real void-spacer contract duplicated in app markup.

## Solution

Render custom voids through `VoidElement` so app-owned UI goes in `content` and
Slate children go in `spacer`:

```tsx
<VoidElement
  content={
    <>
      <VideoFrame />
      <UrlInput />
    </>
  }
  contentAs="div"
  spacer={children}
/>
```

The regression test should assert the user-visible gap, not just DOM presence:

```ts
expect(gap).toBeGreaterThanOrEqual(12)
expect(gap).toBeLessThanOrEqual(24)
```

For image-style voids, assert the visible content starts at the void node top:

```ts
expect(contentOffset).toBeGreaterThanOrEqual(0)
expect(contentOffset).toBeLessThanOrEqual(1)
```

## Why This Works

Void elements still need a Slate child for selection and DOM mapping, but that
child is not content. `VoidElement` puts it in `SlateSpacer`, whose default
style is absolute and zero-height, so it remains available to Slate without
participating in layout.

## Prevention

- In custom `renderElement` code, do not render void `{children}` directly after
  app-owned UI.
- Use `VoidElement` for selectable voids unless the app has a proven custom
  spacer wrapper.
- Do not auto-wrap every void renderer blindly. Inline mentions and editable
  voids can have browser-specific child placement or `contentEditable=false`
  focus contracts; changing those needs their own browser proof.
- Browser parity tests for void examples should measure layout around the
  spacer boundary, not only iframe/input presence.

## Related Issues

- `docs/solutions/logic-errors/2026-04-04-v2-element-primitives-should-compose-element-and-void-contracts.md`
- `docs/solutions/logic-errors/2026-04-26-slate-v2-selectable-voids-should-be-atomic-navigation-points.md`
