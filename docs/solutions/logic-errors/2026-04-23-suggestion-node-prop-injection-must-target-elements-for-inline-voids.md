---
title: Suggestion node prop injection must target elements for inline voids
date: 2026-04-23
category: logic-errors
module: Suggestion
problem_type: logic_error
component: tooling
symptoms:
  - "Refactoring `date-node` to consume injected suggestion state broke prerendering on `/cn`"
  - "Next build crashed with `Cannot read properties of undefined (reading 'children')` during static generation"
  - "`inject.nodeProps.transformProps` ran for non-element nodes even though the new behavior was intended for date elements only"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [suggestion, inject, inline-void, date-node, prerender, nextjs]
---

# Suggestion node prop injection must target elements for inline voids

## Problem
We moved `date-node` off direct suggestion helpers and into suggestion-driven node prop injection so the node could stay suggestion-agnostic. The first pass worked in focused tests but broke prerendering because the injection hook also ran for non-element nodes.

## Symptoms
- `pnpm turbo build --filter=./apps/www` failed while prerendering `/cn`
- The crash stack pointed at the new suggestion `transformProps` path and an undefined `element.children`
- Inline date suggestion tests still passed, which made the failure easy to miss until full app build

## What Didn't Work
- Adding a `targetPlugins: [KEYS.date]` guard alone. `inject.nodeProps` still visits text nodes, and `targetPlugins` only filters when an element type exists.
- Using a typed no-op `transformProps` without an explicit `element` guard. Runtime prerender still reached the helper with `element === undefined`.

## Solution
Constrain the suggestion injection to elements and keep the date component generic:

```ts
inject: {
  isElement: true,
  nodeProps: {
    nodeKey: '',
    styleKey: 'cssText',
    transformProps: ({ editor, element, props }) => {
      if (!element) return props;

      const suggestionApi = editor.getApi(BaseSuggestionPlugin).suggestion;
      const suggestionData = suggestionApi.suggestionData(element);

      if (!suggestionData) return props;

      return {
        ...props,
        'data-inline-suggestion': suggestionData.type,
      };
    },
    transformStyle: () => ({}) as CSSStyleDeclaration,
  },
  targetPlugins: [KEYS.date],
},
```

Then let `date-node` expose only a stable slot plus ancestor-aware variants:

```tsx
<span
  className={cn(
    'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground',
    'in-data-[inline-suggestion=insert]:bg-emerald-100! in-data-[inline-suggestion=insert]:text-emerald-700!',
    'in-data-[inline-suggestion=remove]:bg-red-100! in-data-[inline-suggestion=remove]:text-red-700!'
  )}
  data-slot="date-trigger"
  draggable
>
```

## Why This Works
`inject.nodeProps` is broader than an element-only render hook. It participates in the generic render prop pipeline, so text nodes can still arrive unless the plugin opts into `isElement: true`. Once the injected state is guaranteed to live on element roots, the inline void component can stay decoupled and style itself through stable slots plus ancestor data attributes.

## Prevention
- When adding `inject.nodeProps` behavior that calls element helpers, set `isElement: true` unless the transform is intentionally text-safe.
- If `targetPlugins` is meant to protect element-only logic, still add an explicit `element` null guard in `transformProps`.
- Keep one targeted test for the component contract and one plugin-level test for the injected data attribute, then run a real app build to catch prerender-only failures.

## Related Issues
- [2026-04-08-suggestion-delete-backward-must-mark-inline-voids.md](/Users/felixfeng/Desktop/repos/plate/docs/solutions/logic-errors/2026-04-08-suggestion-delete-backward-must-mark-inline-voids.md)
