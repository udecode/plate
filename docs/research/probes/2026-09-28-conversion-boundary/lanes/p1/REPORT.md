# Lane P1: Plite per-transaction cost

Goal: make one Plite update cost proportional to its change, not to the
document. Evidence came from `../../amendment/splice-profile.ts`: a one-block
tail splice on the 50 KB rich preview (1,179 top-level nodes) took 48 ms
median.

**Result:** at 50 KB the tail splice costs 1.3 ms instead of 51 ms, and from
5 KB to 50 KB it grows ×1.4 instead of ×9.7. End-of-document typing costs
0.8 ms instead of 1.1 ms. The remaining width-dependent cost of an update is a
law of the document model; see [Laws found](#laws-found).

All probes ran from the repository root against the working tree on
2026-09-29 (bun 1.3.12, darwin/arm64). Other lanes shared the host, at load
5–11 while measuring. The probes are disposable evidence, not product code.

## Commands

```sh
# 1. Parse the preview once, as splice-profile.ts does, into
#    node_modules/.cache/p1-conversion-boundary. While the live Markdown source
#    is mid-edit, set P1_PLATE_SRC to a `git archive HEAD packages/platejs/src`
#    extraction.
bun --preload ./docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/alias.ts \
  docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/build-preview.ts

# 2. One measurement. Options: P1_BYTES=5000|50000, P1_LANES=<lane,...>,
#    P1_PLITE_SRC=<source tree>.
bun --preload ./docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/alias.ts \
  docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/per-transaction-cost.ts

# 3. Alternating baseline/candidate pairs; each run writes ab-<bytes>.json.
bun docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/ab.ts 7 50000
bun docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/ab.ts 5 5000

# 4. CPU profiles. This is the baseline; omit P1_PLITE_SRC for the candidate.
P1_LANES=splice-skip,type-end \
P1_PLITE_SRC=packages/plitejs/node_modules/.cache/p1-ab-baseline \
bun --cpu-prof --cpu-prof-dir=docs/research/probes/2026-09-28-conversion-boundary/lanes/p1 \
  --cpu-prof-name=baseline.cpuprofile \
  --preload ./docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/alias.ts \
  docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/per-transaction-cost.ts

# 5. Properties of the two change-algebra edits, and the engine's freeze cost.
bun --preload ./config/plite-source-aliases.ts \
  docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/slice-property.ts
bun --preload ./config/plite-source-aliases.ts \
  docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/transform-property.ts
bun docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/freeze-cost.ts 1179
```

- **Target editor:** the probe loads the cached nodes into an editor with
  `createTestEditor`'s schema plugins. It leaves out `MarkdownPlugin`, which
  adds only `validate` and `api` and no transaction work, and which another
  lane was editing. Final values hash the same as with a `createTestEditor`
  target (`b47f7bcef09257c8`).
- **Baseline:** `ab.ts` copies the live `packages/plitejs/src`, then restores
  every lane-owned file from the pre-change snapshot. Lane-owned files are
  `core/**` except `schema-compiler.ts` and `editor-schema.ts`, plus
  `history/**`. The snapshot is `packages/plitejs/src` at `a7750ad388`;
  recreate it with `git archive a7750ad388 packages/plitejs/src | tar -x -C <dir>`
  and pass `P1_ORIGINAL_SRC=<dir>/packages/plitejs/src`.
- **Module swap:** tsconfig `paths` resolve `plitejs` before runtime plugins do,
  so `alias.ts` replaces module contents at load time and keeps every module
  path.
- **Lanes:**
  - `splice-skip`: 60 tail splices, each a `remove` plus `insert` of the last
    top-level node, with `history: 'skip'`. This is the amendment's
    measurement.
  - `splice-history`: the same splices, recorded in history.
  - `type-end`: 200 one-character `tx.text.insert` calls at the end of the last
    text node with default history, then one undo.
  - `type-after-skip`: type one character at the document start, run 60
    skipped tail splices, then time one saved keystroke that maps the undo
    entry through all 60 splices, and undo it. This models a streamed AI
    response followed by user typing.

## Results

Each cell is the median of the per-run medians across alternating pairs.
`ab-50000.json` (7 pairs) and `ab-5000.json` (5 pairs) hold every run.

| Lane | 5 KB before | 5 KB after | 50 KB before | 50 KB after | 50 KB p90 |
| --- | --- | --- | --- | --- | --- |
| `splice-skip` | 5.3 ms | 0.9 ms | 51.2 ms | 1.3 ms | 59.8 → 2.0 ms |
| `splice-history` | 2.0 ms | 0.8 ms | 16.2 ms | 1.1 ms | 20.0 → 1.5 ms |
| `type-end` | 0.72 ms | 0.66 ms | 1.12 ms | 0.81 ms | 1.35 → 1.03 ms |
| `type-after-skip` | 50 ms | 9 ms | 386 ms | 40 ms | one keystroke |

- **Scaling:** from 5 KB to 50 KB (120 → 1,179 top-level nodes):
  - The baseline grows ×9.7 for `splice-skip`, ×8.1 for `splice-history` and
    ×1.6 for typing.
  - The candidate grows ×1.4, ×1.3 and ×1.2.
- **Correctness guard:** every pair asserted identical final values, identical
  history depth, undo restoring the document from before typing, and identical
  values after the `type-after-skip` keystroke and its undo. The runner fails on
  any difference.
- **One-time rebase:** the first three splices after the whole-document
  `value.replace` took 6.9, 2.2 and 1.6 ms, against 86, 17 and 33 ms on the
  baseline in one run. The first splice resolves the replacement's identity
  overlay once.

## What cost O(document), and the change

Each lane's measured loop was profiled with a `.cpuprofile` summarizer.
Shares are of that loop on the baseline.

1. **Skipped updates rebuilt the previous document (73% of `splice-skip`).**
   For every skipped update, `reduceHistory` ran `inverseChanges.apply(after)`.
   That token fallback encoded and decoded the whole document, and
   `DocumentChange.apply` deep-froze the result. The result was stored as the
   mapping journal's `before` value, which nothing read.
   - Change (`history/history-plugin.ts`, `history/history-state.ts`): the
     skip path never computes the inverse. Journal entries store the published
     `after` value, which replay previously recomputed with
     `mapping.change.apply(batchBase)`.
2. **Inversion encoded the whole document (71% of `splice-history`).**
   `RootChange.invert` slices the removed content, and `DocumentIndex.slice`
   materialized whole-document tokens for any slice outside a single text
   node.
   - Change (`core/change/document-index.ts`, `core/resolved-token-cursor.ts`):
     encode only the deepest sibling run that covers the range, then slice it.
     Encoding is compositional, so the tokens are identical.
     `slice-property.ts` matched 11,520 random ranges against whole-document
     slicing.
3. **The snapshot index carried an O(document) overlay forward (86% of
   `splice-skip` after fix 1).** The replacement claimed 4,010 identities and
   1,415 element additions. Every later mapping re-mapped, re-froze and
   re-cached all of them, because nothing materialized the lazy chain.
   - Change (`core/snapshot-index.ts`): before a publishing mapping copies an
     overlay of more than 256 entries, it materializes the source index once
     and restarts the chain from it. The overlay counts identity assignments,
     discarded identities, prepared placements and element additions.
   - Spec drafts never rebase, because only publication may bind node keys.
4. **A deleted identity rebuilt the index (13% of `splice-history`).**
   `commit.changed` asked the after-index for the path of the node the splice
   removed. That identity lived only in the overlay, so the lookup
   materialized the whole index on every other commit. Doctrine already
   requires that a known deleted identity resolve to null without rebuilding.
   - Change (`core/snapshot-index.ts`): mappings carry the identities whose
     paths a change deleted, capped at 256 as a cache. An identity evicted
     from the cache still resolves, through materialization.
5. **Engine checks on the wide top-level array (15% of `type-end`).** In
   JavaScriptCore, `Object.isFrozen` on a frozen 1,179-element array costs
   about 54 µs, and re-freezing one costs about 76 µs. `DocumentIndex.remember`
   and the snapshot builders asked on every update, and `deepFreeze` re-froze.
   - Change (`core/change/tokens.ts`, `core/change/document-index.ts`,
     `core/public-state.ts`): document arrays are recorded as frozen where they
     are built. `deepFreeze` memoizes deep-frozen subtrees, so applying a
     change walks only the nodes it created.
   - The first freeze of each new top-level array, another 9% of `type-end`, is
     kept. See [Laws found](#laws-found).
6. **Replay through skipped edits ran value-based transform repairs
   (`type-after-skip`).** Each journal entry paid for whole-document deep
   freezes (half the baseline keystroke), token encodes, structure scans and
   `RootChange.between` diffs.
   - Change (`core/change/root-change.ts`): `transformInDocument` returns the
     positional transform when unchanged content separates the two changes'
     edited ranges. The value-based repairs remain for edits that touch,
     overlap or relocate each other.
   - `sameNodeStructure` short-circuits identical nodes.
   - `transform-property.ts` found no divergence across 2,716 random separated
     pairs of text edits, node inserts and removals, property sets, splits,
     merges and moves.

`baseline.cpuprofile` and `candidate.cpuprofile` cover `splice-skip` and
`type-end` at 50 KB. The splice loop totals 3,490 ms on the baseline and
90 ms on the candidate. The candidate's largest remaining self cost is
`Object.freeze` of each new top-level array, one in `withRemovedNode` and one
in `withSplicedNodes`.

## Behavior change

Fix 6 changed one pinned expectation.

- **Setup:** start with `[one, two]` and remove `one`. Then, with
  `history: 'skip'`, insert at index 1 a copy of `one` that carries its
  identity. The document is `[two, one']`.
- **Baseline:** undo produces `[one, one']`. The relocation repair treated the
  undo's insertion at position 0 as an edit inside `two` and replaced `two`,
  so `two` was lost and its key reused.
- **Candidate:** undo produces `[one, two, one']`. The restored duplicate gets
  a fresh key, and the live continuation keeps the revived key, as
  `mapChangedNodeKeys` specifies. Redo still returns `[two, one']`.

The test "preserves a key revived by a skipped edit when undo restores the
same content" in `test/history/history-contract.ts` now asserts the candidate
outcome.

## Verification

- `TURBO_FORCE=true pnpm --filter plitejs test`: 21/21 partition tasks,
  uncached, including the React Vitest partitions.
- plitejs Bun suite: 2,941 pass, run on the tree that includes lane-authored's
  two lines. Command:
  `bun test --preload ../../config/plite-source-test-setup.ts --path-ignore-patterns 'test/react/**'`
- `pnpm --filter platejs test`: 141/141 tasks.
- `pnpm --filter plitejs typecheck` (13 tasks) and
  `pnpm run typecheck:tests` in `packages/plitejs`: pass.
- Test files that no typecheck config covers were checked with a direct `tsc`
  run. The changed lines report no errors; the errors elsewhere in those files
  predate this lane.
- `npx oxfmt --check` and `npx oxlint` on every changed file: clean.
- New or updated tests, each failing on the baseline and passing on the
  candidate:
  - `test/history/history-contract.ts`: "records a history-skipped update
    without rebuilding the previous document", which counts
    `DocumentChange.prototype.apply` calls.
  - `test/document-change.test.ts`: "restarts lazy identity mapping instead of
    carrying a wide overlay", which checks `getSnapshotIndexMappingStats`.
  - The updated revival test from [Behavior change](#behavior-change).
- Lane T1 reran its specs against the final `core/public-state.ts`: 41 dom,
  145 React and 1 Plate, all green.

## Laws found

- **Frozen plain-array document model.** Published values are immutable plain
  JSON, so every update allocates a fresh frozen `children` array for each
  changed ancestor level. That costs O(siblings) at the level, which at the top
  level of a flat document is O(top-level blocks). `freeze-cost.ts` measured:

  | Operation | 1,179 elements | 120 elements |
  | --- | --- | --- |
  | copy and freeze | 111 µs | 11 µs |
  | `Object.isFrozen` of a frozen array | 54 µs | 4 µs |
  | re-freeze of a frozen array | 76 µs | 7 µs |

  This is the width-dependent remainder in the splice and typing lanes.
  Removing it would need chunked children in the public value, which the
  simple document model rules out, so it stays.
- **Node identity.** `NodeKey` stays stable, and a known deleted identity
  resolves to null without rebuilding (`docs/vision/plite.md`). The lazy index
  meets both without carrying its whole overlay forward, so that carry was
  incidental.
- **History.** No law needs the pre-update document for a skipped update.
  Replay needs the change and the value it produced, and the commit already
  publishes both.
- **Transform convergence.** `DocumentChange.transform` promises pairwise
  convergence. Positional transforms of separated edits converge exactly; the
  value-based repairs are needed only for edits that touch, overlap or
  relocate each other.

## Limits and open gaps

- **Skip-replay cost.** `resolveHead` is still O(skipped updates × top-level
  width). For each journal entry it runs two `DocumentChange.apply` calls,
  each allocating and freezing new top-level arrays, and maps both batch
  selections. That costs 40 ms for 60 skipped splices at 50 KB and 9 ms at
  5 KB, and it grows with the length of a history-skipped stream. The next step
  belongs to the history owner:
  - map runs of separated entries through positions and build values once at
    the end; or
  - carry `mappedNextBase` forward as the next entry's `nextBase`, which
    transform convergence makes exact.
- **Yjs controller, outside this lane's ownership.** For every local document
  commit, `yjs/core/controller.ts` rebuilds `previousCommittedValue` with
  `commit.inverseChanges.apply(committedValue)`. Fixes 2 and 5 make the inverse
  slice locally and the apply walk only new nodes, but it still allocates and
  freezes top-level arrays per commit. `commit.before`, and
  `getEditorCommitSnapshot(commit, root, 'before')` for named roots, already
  hold the value.
- **Rebase amortization.** A lazy chain that grows beyond 256 overlay entries
  through many small structural edits pays one O(document) materialization,
  about 2–5 ms at 50 KB, once every 256/g edits. Here g is the number of
  identities each edit claims.
  - Assignment buckets per compacted segment would make this O(g log edits),
    reusing the snapshot index's existing binary segment compaction.
- **`RootChange.between`** remains a whole-document token diff. It runs in
  `completeHistoryAction` when an undo target's base differs from the current
  value, in `DocumentChange.correct`, and in the overlapping transform
  repairs.
- **A/B reruns.** `ab.ts` restores every lane-owned file from `a7750ad388` on
  the baseline side only. Another lane's edits to those files therefore drop
  out of that side, for example lane-authored's `settle` hook line in
  `runEditorTransaction` and its type line in `core/authored-runtime.ts`.
- **Benchmark registry.** These lanes are probes, not registered
  `benchmarks/targets` entries.

## Files

- Source, all in `packages/plitejs/src/`:
  - `history/history-plugin.ts`
  - `history/history-state.ts`
  - `core/change/document-index.ts`
  - `core/resolved-token-cursor.ts`
  - `core/snapshot-index.ts`
  - `core/change/tokens.ts`
  - `core/public-state.ts`
  - `core/change/root-change.ts`
- Tests:
  - `packages/plitejs/test/history/history-contract.ts`
  - `packages/plitejs/test/document-change.test.ts`
- Changeset: `.changeset/plitejs-per-transaction-cost.md` (`'plitejs': patch`).
- Lane folder, in this directory:
  - Harness: `alias.ts`, `build-preview.ts`, `per-transaction-cost.ts`,
    `ab.ts`
  - A/B results: `ab-5000.json`, `ab-50000.json`
  - Profiles: `baseline.cpuprofile`, `candidate.cpuprofile`
  - Property checks: `slice-property.ts`, `transform-property.ts`
  - Engine cost: `freeze-cost.ts`
