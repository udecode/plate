---
title: Blocks demo pages must pass the example id into registry demo components
date: 2026-04-07
category: runtime-errors
module: www-blocks
problem_type: runtime_error
component: documentation
symptoms:
  - "Standalone block routes like `/blocks/toc-demo` returned `500 Internal Server Error`"
  - "The same example worked through `ComponentPreview` but failed on the direct blocks route"
  - "Debugging the UI surface looked like a TOC navigation bug until the route render path was compared"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - blocks
  - registry
  - demos
  - nextjs
  - toc
---

# Blocks demo pages must pass the example id into registry demo components

## Problem

The standalone blocks route rendered registry examples without passing the demo
`id` prop that the shared `Demo` component expects. That left example pages like
`/blocks/toc-demo` with no seed key for `createValue(...)`, and the route blew
up as a server-side `500`.

## Symptoms

- `http://localhost:3001/blocks/toc-demo` returned `500 Internal Server Error`
- The docs preview path still worked because it injected `id={name.replace('-demo', '')}`
- The broken page looked like a TOC runtime regression until the route-level
  component wiring was compared

## What Didn't Work

- Treating the failure as a TOC package bug and inspecting `useTocElement`
  first
- Rebuilding the registry output
- Verifying `localhost:3002` before checking which worktree that port was
  actually serving

## Solution

Mirror the same `id` handoff used by `ComponentPreview` when the blocks route
renders a registry example.

```tsx
// apps/www/src/app/(blocks)/blocks/[name]/page.tsx
<Component id={name.replace("-demo", "")} />
```

The matching preview path already did this:

```tsx
// apps/www/src/components/component-preview.tsx
<Component {...props} id={props.id ?? name.replace("-demo", "")} />
```

## Why This Works

The generic registry `Demo` component is not self-describing. It needs the demo
slug so it can call `createValue(id)` with the right seed key. Without that prop
the blocks route renders the example with `id === undefined`, while the docs
preview path passes the expected slug and works.

Once the blocks route passes the same derived id, standalone block pages and
docs previews use the same contract again.

## Prevention

- If a registry example depends on a derived `id`, every render surface for that
  example must pass it, not just the docs preview wrapper
- When a local demo route disagrees with another port, verify which checkout the
  port is actually serving before debugging the wrong codebase
- For standalone block regressions, compare the route wrapper against
  `ComponentPreview` first. That is the canonical example-render contract in the
  docs app

## Related Issues

- [page.tsx](<apps/www/src/app/(blocks)/blocks/[name]/page.tsx>)
- [component-preview.tsx](apps/www/src/components/component-preview.tsx)
- [demo.tsx](apps/www/src/registry/examples/demo.tsx)
