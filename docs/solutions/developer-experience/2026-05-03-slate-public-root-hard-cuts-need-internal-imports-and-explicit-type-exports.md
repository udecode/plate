---
title: Slate public root hard cuts need internal imports and explicit type exports
date: 2026-05-03
last_updated: 2026-05-20
category: docs/solutions/developer-experience
module: slate-v2 public api
problem_type: developer_experience
component: tooling
symptoms:
  - cutting root exports exposed self-imports from packages/slate/src/index.ts
  - public type wildcard exports leaked internal editor method tables
  - benchmark scripts still imported internal Editor through the primary package
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, public-surface, root-barrel, hard-cut, editor-static-api]
---

# Slate public root hard cuts need internal imports and explicit type exports

## Problem
The Slate v2 public package root still exported raw `core`, `editor`, and
transform modules. Cutting those exports is correct, but it exposes any internal
source file or script that was lazily importing runtime helpers through the
primary package.

## Symptoms
- `bun test` failed with `Export named 'toggleMark' not found in module
  packages/slate/src/index.ts`.
- `create-editor.ts` imported runtime helpers from `./`, so the root hard cut
  broke Slate's own implementation before user code even ran.
- The root `export type * from './interfaces'` still exposed
  `EditorStaticApi`, even after the runtime `Editor` value was removed.
- Current benchmark scripts imported `{ createEditor, Editor }` from
  `packages/slate/src/index.ts`, which would reintroduce the public leak in
  performance lanes.

## What Didn't Work
- Only removing value exports from the root was not enough. Type wildcard
  exports can keep the old API alive in autocomplete and agent-written code.
- Keeping internal scripts on the public import path is fake cleanliness. It
  makes benchmarks depend on the exact public surface being cut.

## Solution
Treat the primary package root as a product surface, not an internal convenience
barrel.

Key moves:

- import Slate implementation helpers from internal modules, not `./`;
- export only intentional root values such as `createEditor`,
  `defineEditorExtension`, `elementProperty`, and `isEditor`;
- replace root `export * from './interfaces'` with explicit public type exports;
- keep `EditorStaticApi` and policy-only types out of the root;
- when a deleted public API still served a real internal need, replace that need
  with a small helper exported only from `slate/internal`, not a renamed public
  API;
- move scripts that need runtime `Editor` to `packages/slate/src/internal`;
- add a public-surface contract that rejects root helper leaks and wildcard
  interface exports.

Representative shape:

```ts
export { defineEditorExtension } from './core/editor-extension'
export { elementProperty } from './core/element-property'
export { createEditor } from './create-editor'
export { isEditor } from './editor/is-editor'
export type { Editor, EditorStateView, EditorUpdateTransaction } from './interfaces/editor'
```

```ts
import { createEditor } from '../../../../packages/slate/src/index.ts'
import { Editor } from '../../../../packages/slate/src/internal/index.ts'
```

## Why This Works
The public root becomes a deliberate API boundary. Internal runtime helpers can
still exist under `slate/internal`, but they stop shaping user autocomplete,
public docs, and benchmark imports.

The explicit type export list matters. If `EditorStaticApi` remains type-public,
agents will still discover and write against the old method table even when the
runtime value is gone.

## Prevention
- Before cutting a public barrel, grep internal source for imports from that
  barrel. Fix self-imports first.
- Add public-surface tests that inspect both runtime exports and root source
  wildcard exports.
- Benchmark and test helpers that need `Editor.*` must import from
  `slate/internal` or source `internal/index.ts`.
- Do not let type-only exports keep a deleted value API alive.
- For public API removals, reference sweeps may still find historical changelog
  text and explicit absence guards. Current docs, examples, source call sites,
  and public fixture tests should not teach or depend on the removed name.
- If the old API was a false boundary, avoid replacing it immediately with a
  cleaner-looking public API. Keep the honest internal helper private until a
  real downstream use case justifies a full public design.

## Related Issues
- `docs/solutions/developer-experience/2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md`
- `docs/solutions/documentation-gaps/2026-04-09-slate-public-surface-closure-docs-must-distinguish-current-claim-cleanup-from-broad-lane-closure.md`
