---
title: Slate package declaration merging recovery must start from base aliases not example casts
date: 2026-04-15
category: docs/solutions/developer-experience
module: slate-v2 slate slate-react slate-history
problem_type: developer_experience
component: tooling
symptoms:
  - examples needed repeated `as CustomEditor` casts and render-element prop casts to stay typecheck-green
  - legacy `CustomTypes` fixtures no longer matched the current package surface
  - docs and ledgers had started treating declaration merging as a hard-cut non-claim
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate, slate-react, slate-history, customtypes, declaration-merging, types]
---

# Slate package declaration merging recovery must start from base aliases not example casts

## Problem

The current repo had drifted away from the legacy declaration-merging seam.

Examples were papering over that drift with local casts, but the real miss was
package-side: `slate` no longer exposed the base aliases and extendable type
machinery that legacy `CustomTypes` expected.

## Symptoms

- `BaseEditor`, `BasePoint`, `BaseRange`, and `BaseSelection` were missing from
  the live package surface
- `slate-react` flattened `ReactEditor` onto the already-extended editor type,
  which invited circular type recovery
- `RenderElementProps` drift forced example-side prop casts in files like
  `check-lists`, `images`, `mentions`, `embeds`, `inlines`, and `paste-html`
- top-level docs had started calling `CustomTypes` a hard cut

## What Didn't Work

- trying to recover example source first while the package types were still
  wrong
- treating render-prop casts as local example debt
- restoring declaration merging by reintroducing site-wide ambient example
  augmentation; that polluted the whole example corpus instead of proving the
  package contract cleanly

## Solution

Recover the package seam first.

1. Restore the old `ExtendedType` / `CustomTypes` machinery in `slate`
2. Restore base alias exports:
   `BaseEditor`, `BaseElement`, `BaseText`, `BasePoint`, `BaseRange`,
   `BaseSelection`, and base operation aliases
3. Make `slate-history` compose from `BaseEditor` again
4. Restore `slate-react` package-side custom-types augmentation
5. Share one render-element prop type in `slate-react` instead of letting local
   sites invent casts
6. Prove the recovered merge seam in a dedicated consumer-style type fixture:
   [`usage.tsx`](/Users/zbeyens/git/slate-v2/packages/slate/type-tests/custom-types/usage.tsx)
7. Only then delete example-side casts that existed solely because the package
   surface drifted

Representative package changes:

- [`packages/slate/src/types/custom-types.ts`](/Users/zbeyens/git/slate-v2/packages/slate/src/types/custom-types.ts)
- [`packages/slate/src/interfaces/editor.ts`](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts)
- [`packages/slate/src/interfaces/node.ts`](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/node.ts)
- [`packages/slate/src/interfaces.ts`](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
- [`packages/slate/src/index.ts`](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- [`packages/slate-react/src/custom-types.ts`](/Users/zbeyens/git/slate-v2/packages/slate-react/src/custom-types.ts)
- [`packages/slate-react/src/components/editable-text-blocks.tsx`](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- [`packages/slate-history/src/interfaces.ts`](/Users/zbeyens/git/slate-v2/packages/slate-history/src/interfaces.ts)

## Why This Works

The old `CustomTypes` model was package-owned, not example-owned.

If the base aliases and extendable types are missing, examples can only fake the
shape with casts. Once the base aliases exist again, consumers can rebuild the
legacy merge contract honestly from package exports.

The other key lesson is that a consumer-type fixture should compile against the
built package surface, not by globally augmenting the whole site example
program. The latter creates fake failures in unrelated examples and hides the
real question: whether the shipped package types work for consumers.

## Prevention

- If a legacy typing seam was package-owned, recover it in package code first.
  Do not start by “fixing” examples.
- Keep one dedicated consumer fixture for the declaration-merging contract and
  run it from package typecheck.
- When recovering merge seams, prefer base aliases inside the recovery path:
  `BaseEditor`, `BaseElement`, `BaseText`, `BasePoint`, `BaseRange`,
  `BaseSelection`.
- Treat repeated `as CustomEditor` and render-prop casts across examples as a
  package typing smell until proven otherwise.
- If docs or ledgers call a seam a hard cut, and code recovery reopens it,
  update the high-level docs in the same batch so future work does not follow a
  stale premise.

## Related Issues

- [Slate v2 Declaration Merging Recovery](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-declaration-merging-recovery.md)
- [Repair Drift](/Users/zbeyens/git/plate-2/.agents/rules/repair-drift.mdc)
