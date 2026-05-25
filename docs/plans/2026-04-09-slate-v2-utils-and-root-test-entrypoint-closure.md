---
date: 2026-04-09
topic: slate-v2-utils-and-root-test-entrypoint-closure
---

# Slate V2 Utils And Root Test Entrypoint Closure

## Scope

Close the deleted `packages/slate/test/utils/**` family plus the root deleted
test entrypoints:

- `packages/slate/test/index.js`
- `packages/slate/test/jsx.d.ts`

## Family Closure Matrix

| Cluster id         | Deleted count | Status          | Current proof owner                                                                              | Resolution                                                                                                         |
| ------------------ | ------------: | --------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `utils.string`     |           `1` | `mirrored now`  | [text-units-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/text-units-contract.ts) | current string-unit behavior is already proved on the live `text-units.ts` seam that drives editor movement        |
| `utils.deep-equal` |          `10` | `explicit skip` | none                                                                                             | old `isDeepEqual` helper is gone from the live public surface and does not belong in the current claim             |
| `root.index.js`    |           `1` | `explicit skip` | none                                                                                             | the old fixture-harness entrypoint is replaced by direct contract files plus package-local Mocha globs             |
| `root.jsx.d.ts`    |           `1` | `explicit skip` | none                                                                                             | the old JSX fixture typing shim belonged to the deleted fixture harness, not the current direct-contract test lane |

Totals:

- mirrored now: `1`
- explicit skip: `12`
- reconciled total: `13`

## Why The Skips Are Honest

- `utils/deep-equal/**` targeted a helper that is no longer exported or used on
  the current `slate-v2` public surface
- the live text-unit contract already carries the string-distance behavior that
  still matters to movement logic
- the current package test lane no longer loads fixture directories through a
  root `index.js` harness
- the current direct contract files do not need the old TypeScript JSX shim

## Evidence

- [text-units-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/text-units-contract.ts)
- [text-units.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/text-units.ts)
- [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)
- [package.json](/Users/zbeyens/git/slate-v2/packages/slate/package.json)
