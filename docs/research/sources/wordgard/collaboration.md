# Wordgard: collaboration

## Concurrent change convergence

- **Convergence laws.** `test/test-change.ts` lines 270-438 at b5ad0d0 pin that generated concurrent pairs converge, that sequential composition is associative, and that inverses restore generated documents. Plite's `packages/plitejs/test/document-change-laws.test.ts` covers nested structural and property convergence including moves, multi-root and root-lifecycle edits, correction composition and compose associativity. Plite's `DocumentChange.transform` rebases only two changes, and its doc comment leaves multi-peer ordering to a collaboration adapter such as Yjs (`packages/plitejs/src/core/change/document-change.ts:1127-1130`), so Wordgard's three-client cases have no core counterpart (report.md:89).

## Peer convergence

- **Peer convergence.** `test/test-collab.ts` lines 115-368 at b5ad0d0 pin two- and three-peer convergence across offline local edits, mark changes, remote merges, undo and redo, shared effects, eager corrections and randomized schedules. Plite's `packages/plitejs/test/collab-history-runtime-contract.ts` proves three-peer text, mark, delete and move convergence with history rebase, and `packages/plitejs/test/collab-document-state-contract.ts` proves shared effects. The Yjs contracts now live under `packages/plitejs/test/yjs/` (report.md:98).

## Central-authority protocol

- **Central authority not adopted.** `test/test-collab.ts` lines 11-112 and 320-367 at b5ad0d0 pin a versioned central-authority protocol. It transforms stale client submissions, tracks acknowledgements by client ID and applies server corrections. Plite does not adopt it: core keeps the pairwise `DocumentChange.transform`, Plate collaboration is Yjs-backed, and a server adapter waits for a real consumer (report.md:99, 142).
