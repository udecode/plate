---
date: 2026-04-18
topic: slate-v2-slate-interfaces-transforms-wave
status: completed
---

# Goal

Finish the next honest tranche-3 `slate` recovery slice after the landed
accessor/transaction wave.

This wave stays row-scoped:

- recover one kept exported interface/transform contract hole at a time
- use legacy as default truth
- keep explicit-skip breadth closed
- use focused RED -> GREEN proof before widening the slice

# Candidate Scope

- `interfaces/node.ts`
- `interfaces/path*.ts`
- `interfaces/point*.ts`
- `interfaces/range*.ts`
- `interfaces/transforms/*.ts`
- transform helpers that still drift on kept public width

# Working Rule

Do not jump packages.

Do not bulk-port draft helpers.

Do not broaden the wave just because multiple files differ.

Pick the first public row where:

1. legacy contract is concrete
2. current source still drifts
3. proof can be expressed with focused legacy-backed tests

# Current Progress

1. Read live tranche-3 ledgers and master roadmap.
2. Confirm accessor/transaction wave is landed and no longer the next batch.
3. Inspect current-vs-legacy source diffs for the remaining `slate`
   interfaces/transforms family.
4. Choose the smallest honest recovery slice.
5. Land RED -> GREEN implementation and verification.

# Result

The tranche-3 `slate` interfaces/transforms wave is no longer an open package
owner.

Package-local closeout is green on:

- `bun test ./packages/slate/test`
- `bunx turbo build --filter=./packages/slate`
- `bunx turbo typecheck --filter=./packages/slate`
- `bun run lint:fix`
- `bun run lint`

The next migration owner moves to tranche 4 support packages, not another
`packages/slate` recovery batch.
