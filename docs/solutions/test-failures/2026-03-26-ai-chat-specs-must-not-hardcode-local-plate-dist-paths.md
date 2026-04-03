---
title: ai chat specs must not hardcode local plate dist paths
problem_type: test_failure
component: testing_framework
root_cause: config_error
module: ai
severity: medium
symptoms:
  - "`@platejs/ai` typecheck fails in CI with `TS2307` against `/Users/.../packages/plate/dist/react/index.js`"
  - "ai chat specs pass locally on one machine but fail on runners with a different workspace path"
tags:
  - ai
  - bun
  - typescript
  - ci
  - platejs/react
  - dist
---

# Summary

Five AI chat specs were loading the real `platejs/react` bundle through a
hardcoded absolute path to one developer machine.

That made local runs look fine while CI exploded during `@platejs/ai`
typecheck, because `/Users/zbeyens/...` obviously does not exist on GitHub
runners.

# What Happened

These specs partially mocked `platejs/react` so they could spy on the real hook
exports while still falling back to the actual implementation.

The fallback import used this shape:

```ts
await import('/Users/zbeyens/git/plate/packages/plate/dist/react/index.js');
```

TypeScript tried to resolve that literal during package typecheck. On CI, it
failed immediately with `TS2307`.

# Fix

Load the built `platejs/react` bundle through a repo-relative URL computed from
the spec file instead of a hardcoded machine path:

```ts
await import(
  new URL('../../../../../plate/dist/react/index.js', import.meta.url).href
);
```

That keeps the import stable across local machines and CI workspaces while
still bypassing the mocked `platejs/react` module.

# Rule

If a spec needs the real built output of another workspace package, never bake
one machine's absolute path into the test.

Use a repo-relative `new URL(..., import.meta.url)` path or another workspace-
portable resolver. Local green on your laptop means nothing if the import string
contains your home directory.
