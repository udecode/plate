---
title: Plite legacy compare benchmark must align Bun workspace source and built React surfaces
date: 2026-05-01
last_updated: 2026-05-23
category: docs/solutions/performance-issues
module: Plite React benchmark tooling
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "`bench:react:huge-document:legacy-compare:local` failed after the Plite API hard cut instead of producing fresh huge-document comparison numbers"
  - "`bench:core:normalization:compare:local` and `bench:core:huge-document:compare:local` failed before producing current-vs-legacy core comparison artifacts"
  - "The compare script only measured legacy chunking on/off plus v2 island mode, so it could not answer v2 island on/off questions"
  - "Switching current imports blindly between source and dist created runtime singleton mismatches under Bun workspace resolution"
  - "The React huge-document compare runner failed after `withReact` was intentionally removed from the public surface"
root_cause: config_error
resolution_type: code_fix
severity: medium
tags:
  - plite
  - slate-react
  - benchmark
  - bun
  - workspace
  - huge-document
  - islands
---

# Plite legacy compare benchmark must align Bun workspace source and built React surfaces

## Problem

The huge-document legacy comparison benchmark was stale after the Plite hard cut. It still assumed legacy-style public `Editor` APIs and only emitted one v2 row, so it could not compare v2 with islands against v2 without islands.

## Symptoms

- `Editor.replace` was undefined when the current runner imported root `slate`.
- Core compare runners got past `Editor.replace` only to fail on stale current-side
  assumptions like `editor.insertText`, `editor.select`, and `editor.insertFragment`.
- Rendering source `plite-react` through Bun hit JSX runtime failures such as `React is not defined`.
- Importing built `slate` with built `plite-react` caused transform-registry singleton mismatches because Bun still resolved `plite-react`'s bare workspace imports to source.
- The artifact had `legacyChunkOff`, `legacyChunkOn`, and `v2LargeDocument`, but no `v2NoIsland`.
- After the `withReact` cut, the current benchmark runner failed with
  `Export named 'withReact' not found in module .../packages/plite-react/dist/index.js`.
- The same runner also referenced `shellEnabled` after the shell/island rename,
  so current-only runs could fail before emitting trace artifacts.

## What Didn't Work

- Importing current `plite-react` source directly. It exposed source JSX-runtime assumptions that are irrelevant to the built benchmark target.
- Importing all current packages from `dist`. Bun workspace resolution still made built `plite-react` consume source `slate` internals.
- Importing `plite/internal` from the built current package for core compare.
  That exposed only the built package's runtime export shape, not the full source
  static `Editor` API needed by local benchmark fixtures.
- Treating v2's `largeDocument` option as already benchmarked both ways. The script only hardcoded `enabled: true`.

## Solution

Keep the current benchmark runner on one runtime identity:

- use source `slate` plus `plite/internal` for v2 editor setup and transaction helpers
- use built `plite-react/dist/index.js` for the React surface after the script's forced build
- adapt write helpers to v2 transactions: `tx.selection.set`, `tx.text.insert`, `tx.fragment.insert`
- add a second current surface with `largeDocument: null`
- for core compare runners, dynamically try source imports from
  `../../packages/plite/src/index.ts` and `../../packages/plite/src/internal/index.ts`
  first, then fall back to package imports for legacy checkouts
- after the public `withReact` cut, current React benchmark rows should import
  `createReactEditor` from `../../packages/plite-react/dist/index.js` and
  replace every current-side `withReact(createEditor())` fixture with
  `createReactEditor()`
- keep stale trace aliases explicit; if a variable like `shellEnabled` still
  names the old concept, derive it locally from the current strategy flag before
  the trace is emitted

Kept file:

- [huge-document-legacy-compare.mjs](/Users/zbeyens/git/plite/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs)
- [normalization.mjs](/Users/zbeyens/git/plite/scripts/benchmarks/core/compare/normalization.mjs)
- [huge-document.mjs](/Users/zbeyens/git/plite/scripts/benchmarks/core/compare/huge-document.mjs)

## Why This Works

The benchmark needs v2's hard-cut write API and v2 React's built JSX output, but it must not split editor runtime singletons. Source `slate` and source `plite/internal` keep the editor registry aligned with the workspace resolution used by built `plite-react`.

The no-island row is not a separate feature flag. It is the same `<Editable>` surface with `largeDocument: null`, which makes `EditableTextBlocks` render all top-level runtime ids instead of an island plan.

Core compare runners are stricter: they do not need built React, but they still
need the current source static `Editor` API. A local runner under `.tmp/benchmarks`
can import current source files with `../../packages/plite/src/...`; legacy
checkouts cannot, so the same embedded runner must fall back to `import('slate')`
and legacy `Transforms`.

## Prevention

- For Bun workspace benchmarks, confirm `import.meta.resolve(...)` before mixing source and `dist`.
- For v2 React benchmarks, include the mode knob in the artifact, not only in the benchmark command.
- When a benchmark compares legacy and v2, keep helper functions API-aware instead of pretending v2 still has legacy editor instance methods.
- For core compare runners, use source imports for the current v2 side when the
  fixture needs static `Editor` internals, and keep a package-import fallback for
  legacy.
- Prefer adapter helpers around writes and reads:
  `Editor.getSnapshot`/`Editor.getChildren`/`editor.children` for reads, and
  `tx.text.insert`/`tx.selection.set`/`tx.fragment.insert` versus legacy
  `Transforms` for writes.
- When a public React constructor is hard-cut, grep benchmark template strings
  too. They do not fail typecheck, but they are still executable source.
- Treat exit-code `0` benchmark JSON as "command ran", not "claim passed".
  Inspect threshold fields and stress-row numbers before updating issue claims.

## Related Issues

- [chunking-review.md](/Users/zbeyens/git/plate-2/docs/plite/references/chunking-review.md)
- [Plite huge-document typing needs selector-fanout cuts before islands](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-plite-huge-document-typing-needs-selector-fanout-cuts-before-islands.md)
- [Active radius 1 is the best large-document corridor default for RC](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-active-radius-1-is-the-best-large-document-corridor-default-for-rc.md)
