---
title: TOC elements must reuse the content controller for active heading state
date: 2026-04-06
category: logic-errors
module: toc
problem_type: logic_error
component: toc_react_hooks
symptoms:
  - "The live TOC element rendered every row with `aria-current` instead of only the current section"
  - "TOC element clicks and TOC active-section tracking used different code paths"
  - "Consumers could build a clickable TOC element, but not a correct active-section UI, from `useTocElementState` alone"
root_cause: duplicated_navigation_state
resolution_type: code_change
severity: medium
tags:
  - toc
  - navigation
  - accessibility
  - react
  - active-heading
  - editor-behavior
---

# TOC elements must reuse the content controller for active heading state

## Problem

The TOC package already had a real active-section source of truth:
`useContentController`.

But the live TOC element hook, `useTocElementState`, did not use it. That left
the package in a stupid split state:

- the sidebar path knew which heading was active
- the inline TOC element path only knew how to scroll on click

The app papered over that gap badly by rendering `aria-current` on every TOC
row.

## What Didn't Work

- Treating the TOC element like a lighter sidebar that did not need active
  section state
- Keeping separate click-scroll logic in `useTocElementState` when
  `useContentController` already owned scroll and navigation
  flash behavior
- Fixing the app renderer alone without tightening the package hook contract

## Solution

Route `useTocElementState` through `useContentController` and expose
`activeContentId` from the element-state hook.

That keeps one real source of truth for:

- active heading tracking
- scroll behavior
- navigation flash feedback

Then make the live TOC node render exactly one current row:

- `aria-current="location"` only for the active heading
- active styling only for that row
- no fake current state on every button

## Why This Works

The content controller already owns the only state that matters here:
"which heading is active for the current document position?"

Once the element hook reuses that controller instead of duplicating a smaller
click-only helper, the package and app stop drifting apart.

That gives consumers one coherent shape:

- `useTocElementState` for headings, current section, and scroll handoff
- `useTocElement` for click wiring

No extra observer logic in the app. No second navigation state. No bogus
accessibility attributes.

## Current Note

TOC activation is navigation-only. Generated TOC entries should not synthesize
block-selection state or place a landed caret in the target heading as a side
effect of navigation.

## Verification

These checks passed:

```bash
bun test packages/toc/src/react/hooks/useTocElement.spec.tsx packages/toc/src/react/hooks/useContentController.spec.tsx packages/toc/src/react/hooks/useTocSideBar.spec.tsx packages/toc/src/lib/BaseTocPlugin.spec.ts packages/toc/src/lib/transforms/insertToc.spec.ts apps/www/src/registry/ui/toc-node.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/toc
pnpm turbo typecheck --filter=./packages/toc
pnpm --filter www build:registry
pnpm lint:fix
```

Browser verification used `dev-browser` against a clean `www` dev server on
`127.0.0.1:3001`. The standalone TOC block route loaded, but the docs preview
surface stayed stuck on `Loading...`, so browser proof for active-row promotion
was limited to route-level sanity rather than a full interactive TOC assertion.

## Prevention

- If a feature package already has one controller that owns scroll and active
  target state, do not build a second lighter hook for a sibling surface unless
  the split is intentional and documented
- Do not render `aria-current` as a static boolean on repeated navigation rows
- When a hook is the obvious consumer API for a UI surface, expose the state
  that surface actually needs instead of forcing app code to reach sideways
  into a different hook family

## Related Issues

- [useTocElement.ts](packages/toc/src/react/hooks/useTocElement.ts)
- [useContentController.ts](packages/toc/src/react/hooks/useContentController.ts)
- [toc-node.tsx](apps/www/src/registry/ui/toc-node.tsx)
- [toc.mdx](<content/(plugins)/(elements)/toc.mdx>)
