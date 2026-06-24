---
title: Plite React public type hard cuts need internal runtime type splits
date: 2026-05-17
category: docs/solutions/developer-experience
module: plite public api
problem_type: developer_experience
component: tooling
symptoms:
  - public React editor type rename passed while an internal exported ReactEditor interface still used the old DOM shape
  - stale internal type name competed with the new extension-derived public ReactEditor type
  - helper namespace codemods could rewrite runtime ReactEditor calls into type-only names
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [plite, slate-react, public-surface, hard-cut, typescript]
---

# Plite React public type hard cuts need internal runtime type splits

## Problem
The public Plite React editor type moved to extension-derived
`ReactEditor<Value, Extensions>`, but the first closeout still left an internal
exported `ReactEditor` interface in `plugin/react-editor.ts`. That made the
hard cut look complete at the package root while a nearby source API still
taught the old DOM-inheritance shape.

## Symptoms
- `ReactEditorInstance` was gone from public docs and exports, but
  `plugin/react-editor.ts` still had `export interface ReactEditor`.
- The old interface extended `DOMEditor<V>` and hand-wrote `api.dom` /
  `api.clipboard`, even though React deletes root DOM fields and exposes
  installed handles through `editor.api`.
- A mechanical rename briefly rewrote runtime helper calls such as
  `ReactEditor.hasTarget(...)` into type-only `ReactRuntimeEditor.hasTarget(...)`.

## What Didn't Work
- Checking only the root package export was too shallow. It proved the app
  import path was clean but missed internal source exports that contributors and
  agents still see.
- A broad text rename was unsafe because `ReactEditor` is both an internal
  runtime helper namespace value and an editor instance annotation type.

## Solution
Keep the non-public runtime helper namespace as `ReactEditor`, but move
internal editor instance annotations to a different type name:

```ts
export interface ReactRuntimeEditor<V extends Value = Value>
  extends DOMEditor<V> {
  api: DOMEditor<V>['api'] & {
    clipboard: DOMClipboardApi
    dom: DOMApi
  }
}

export const ReactEditor: ReactEditorInterface = DOMEditor
```

Public users import the extension-derived type:

```ts
import { createReactEditor, type ReactEditor } from 'plite-react'

type CustomEditor = ReactEditor<CustomValue>
```

After the rename, run both type proof and stale-name proof:

```bash
bun x tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit
bun --filter plite-react typecheck
bun typecheck:site
bun lint:fix
bun check
rg -n "ReactEditorInstance|export interface ReactEditor\\b|interface ReactEditor\\b|ReactRuntimeEditor\\." \
  packages/plite-react docs site/examples/ts
```

## Why This Works
The package root and public docs now have exactly one app-facing editor instance
type: generic `ReactEditor<Value, Extensions>`. Internal React DOM bridge code
can still call the `ReactEditor.*` runtime helper namespace, but it no longer
shares a type name with the public editor instance shape.

The stale-name grep matters because TypeScript can pass while the source still
exports a misleading helper type or while a codemod has accidentally turned a
runtime helper call into a type-only identifier.

## Prevention
- For public type hard cuts, search internal source exports, tests, examples,
  and docs, not only package roots.
- When a name exists as both a runtime helper value and a type, split the
  internal type first, then run typecheck to catch missed annotations.
- Add a stale-name grep for removed public names and for invalid type/value
  rewrites before marking a Ralph completion file `done`.

## Related Issues
- [Plite public root hard cuts need internal imports and explicit type exports](./2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md)
- [Plite helper namespace codemods must separate values, types, and DOM globals](./2026-05-13-slate-helper-namespace-codemods-must-separate-values-types-and-dom-globals.md)
- [Plite extension composition hard cuts need creation-time inference and browser proof](./2026-05-17-plite-extension-composition-hard-cuts-need-creation-time-inference-and-browser-proof.md)
