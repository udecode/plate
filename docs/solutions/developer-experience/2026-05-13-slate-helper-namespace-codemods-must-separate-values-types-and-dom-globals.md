---
title: Slate helper namespace codemods must separate values, types, and DOM globals
date: 2026-05-13
category: docs/solutions/developer-experience
module: slate-v2 public api
problem_type: developer_experience
component: tooling
symptoms:
  - helper value rename accidentally rewrote model type references
  - helper value rename accidentally rewrote globalThis DOM types
  - public docs could keep teaching removed helper value imports
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, public-surface, codemod, helper-api, dom-globals]
---

# Slate helper namespace codemods must separate values, types, and DOM globals

## Problem
Renaming Slate helper value namespaces from `Node`, `Element`, `Path`, and
peers to `*Api` looks like a simple codemod. It is not simple if the same names
also exist as model types and browser globals.

## Symptoms
- A broad identifier rewrite produced type positions like `ElementApi extends N`
  and `value is LocationApi`, even though model types must stay `Element` and
  `Location`.
- DOM references became invalid types such as `globalThis.RangeApi`,
  `globalThis.NodeApi`, and `globalThis.TextApi`.
- Public docs and snippets still had old imports such as
  `import { Node } from 'slate'` after source code was already migrated.
- `bun check` caught a nearby hooks lint shape in an edited example after the
  codemod formatting pass.

## What Didn't Work
- A blind text or AST identifier rename is too broad. It cannot tell whether
  `Node` is a Slate helper value, a Slate model type, or the DOM `Node`.
- Updating only source imports is not enough. The public docs are part of the
  API teaching surface and can keep the removed API alive.
- Relying on typecheck alone misses stale docs. The public-surface contract
  needs to scan docs/examples too.

## Solution
Use a value-aware rename and then add a public contract that prevents the old
teaching shape from coming back.

Keep this split:

```ts
import { NodeApi, type Node } from 'slate'

NodeApi.string(node)
```

Do not rewrite type positions:

```ts
export type Location = Path | Point | Range
```

Do not rewrite DOM globals:

```ts
let domRange: globalThis.Range
let anchorNode: globalThis.Node | null = null
```

Add a contract that rejects old runtime values and old public snippets:

```ts
const bannedSlateRootDataHelperValues = [
  'Element',
  'Location',
  'Node',
  'Operation',
  'Path',
  'Point',
  'Range',
  'Text',
]

const renamedDataHelperMemberPattern =
  /\b(Element|Location|Node|Operation|Path|Point|Range|Text)\.(?!TEXT_NODE\b|ELEMENT_NODE\b)/g
```

Then run both source and teaching-surface proof:

```bash
bun test ./packages/slate/test/public-surface-contract.ts
bun --filter ./packages/slate typecheck
bun --filter ./packages/slate-react typecheck
bun x tsc --project site/tsconfig.json --noEmit
bun check
```

## Why This Works
The API break is specifically about runtime helper values. Model type names are
still the Slate vocabulary, and DOM globals are still real browser APIs.

The docs/examples scan matters because #5400 was a docs-import collision:
teaching `import { Node } from 'slate'` shadows the browser `Node` global even
when the runtime implementation is otherwise fine.

## Prevention
- For public helper namespace renames, collect value imports separately from
  type references before editing.
- Add type imports such as `type Node` only when the file actually uses the
  model type.
- Protect `globalThis.Node`, `globalThis.Text`, `globalThis.Range`, and DOM
  constants like `Node.TEXT_NODE`.
- Extend public-surface tests to scan docs and examples for old imports and
  old helper member calls.
- Always rerun `bun check` after `bun lint:fix`; formatting can expose lint
  rules that focused package checks do not run.

## Related Issues
- `docs/solutions/developer-experience/2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md`
- `docs/plans/2026-05-13-slate-v2-api-helper-namespace-rename-ralplan.md`
- `docs/slate-issues/open-issues-dossiers/5402-5250.md`
