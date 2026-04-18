---
title: Dynamic input rule families should branch inside createRuleFactory
date: 2026-04-17
category: best-practices
module: core
problem_type: best_practice
component: tooling
symptoms:
  - Package rule families like math markdown and link autolink needed one public
    entrypoint but internally mapped to different input-rule lanes.
  - Handwritten wrapper functions re-declared option types and drifted from the
    real factory runtime fields like `enabled` and `priority`.
  - Fixing one package API leak still left the same typing trap for the next
    family with variant-based branching.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [input-rules, api-design, typing, factories, plate]
---

# Dynamic input rule families should branch inside createRuleFactory

## Problem

Some package-owned rule families need one semantic public entrypoint, but they
do not map to one internal rule lane.

Examples:

- `MathRules.markdown(...)` needs inline `$...$` entry on `insertText` and
  block `$$` entry on `blockFence`.
- `LinkRules.autolink(...)` needs `insertText`, `insertBreak`, and
  `insertData` variants under one semantic family.

The bad fix is to keep the public family but hand-write a wrapper that chooses
between multiple internal `createRuleFactory(...)` calls.

## What Didn't Work

- Wrapper exports like:

```ts
markdown: (options: MathMarkdownRuleOptions) =>
  options.variant === '$$'
    ? createRuleFactory(...)(options)
    : createRuleFactory(...)(options)
```

- Manual option unions that forgot shared runtime fields like `enabled` and
  `priority`.
- Re-declaring public types in package files instead of letting the factory own
  the contract.
- Treating the wrapper as harmless because the runtime behavior still worked.

The runtime still worked. The public typing rotted.

## Solution

Let `createRuleFactory(...)` accept a dynamic config callback so the package
export still comes directly from the factory:

```ts
export const MathRules = {
  markdown: createRuleFactory<
    { variant: '$' } | { on: 'break' | 'match'; variant: '$$' }
  >((options) =>
    options.variant === '$$'
      ? {
          type: 'blockFence',
          fence: '$$',
          block: KEYS.p,
          on: options.on,
          apply: ({ editor }, match) => {
            const blockMatch = match as BlockFenceInputRuleMatch;
            // feature semantics
            return true;
          },
        }
      : {
          type: 'insertText',
          trigger: '$',
          apply: ({ editor }, match) => {
            const inlineMatch = match as InlineMathMatch;
            // feature semantics
            return true;
          },
        }
  ),
};
```

Same idea for link autolink:

```ts
export const LinkRules = {
  autolink: createRuleFactory<{ variant: 'break' | 'paste' | 'space' }>(
    (options) =>
      options.variant === 'break'
        ? { type: 'insertBreak', ... }
        : options.variant === 'paste'
          ? { type: 'insertData', ... }
          : { type: 'insertText', ... }
  ),
};
```

The export is still factory-owned. The branching moved inside the factory
callback, where it belongs.

## Why This Works

- The package export stops re-declaring the public API.
- Shared runtime fields like `enabled` and `priority` come from the factory
  contract automatically.
- Package files still own feature semantics and variant selection.
- Core owns the typing and construction seam for dynamic rule families.

The only compromise is local narrowing inside `apply(...)` for branch-specific
match payloads. That is still better than a wrapper export because the public
contract stays factory-owned.

## Prevention

- If one semantic rule family fans out to multiple internal rule lanes, branch
  inside `createRuleFactory(...)`.
- Do not write wrapper exports that call multiple factories and forward the same
  `options`.
- Keep package exports semantic. Keep constructor authority in the factory.
- Accept local payload narrowing inside branch-specific `apply(...)` when the
  runtime shape is known, instead of reintroducing a fake wrapper API.
