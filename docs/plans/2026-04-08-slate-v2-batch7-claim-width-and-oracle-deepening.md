---
date: 2026-04-08
topic: slate-v2-batch7-claim-width-and-oracle-deepening
status: complete
source: /Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-batch7-claim-width-and-oracle-deepening-20260408T122300Z.md
---

# Slate v2 Batch 7: Claim Width And Oracle Deepening

## Goal

Execute Batch 7 from `docs/slate-v2/master-roadmap.md`.

## Phases

1. identify the next supportable oracle rows
2. land the oracle deepening in `slate-v2`
3. classify the remaining high-signal skipped rows with named reasons
4. sync claim-bearing docs and granular ledger rows
5. verify and review

## Progress

- created Batch 7 context snapshot
- identified `delete` as the highest-signal immediate oracle seam
- identified adjacent block-selection delete rows as the first supportable
  candidate additions
- mirrored the next supportable legacy delete rows:
  - `delete/selection/block-middle.tsx`
  - `delete/selection/block-across.tsx`
- used failing import attempts on `delete/path/text.tsx` and
  `delete/path/inline.tsx` to narrow the public claim instead of faking parity
- classified the remaining delete debt row by row in
  `oracle-harvest-ledger.md`
- tightened claim-bearing docs around:
  - exact block-path delete parity only
  - no generic leaf-path delete parity
  - no custom `setSelection(...)` prop parity
- split the grouped core oracle ledger row so `snapshot-contract.ts` can close
  honestly without pretending `range-ref-contract.ts` and
  `clipboard-contract.ts` got the same reread

## Exit Read

Batch 7 is complete.

The current claim and the harvested core proof are tighter now:

- `snapshot-contract.ts` mirrors `81` legacy oracle rows
- the delete bucket has named remaining debt instead of wildcard fog
- repo-local and live claim docs no longer imply generic leaf-path delete parity
