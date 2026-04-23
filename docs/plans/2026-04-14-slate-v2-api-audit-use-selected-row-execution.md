---
topic: slate-v2-api-audit-use-selected-row-execution
date: 2026-04-14
---

# Goal

Resolve the `slate-react` `use-selected.spec.tsx` API audit row cleanly under
the current `slate-react` architecture.

# Scope

- one tranche-7 slice only
- `slate-react` useSelected row
- supporting docs only if the classification still drifts

# Loaded Skills

- `ralph`
- `major-task`
- `planning-with-files`
- `learnings-researcher`

# Constraints

- Use the live roadmap and exhaustive API audit plan as authority
- Do not widen this into a whole-family rewrite
- No fake mirrored language when the legacy file contains an explicit skip

# Phases

- [x] Load skills and choose the next honest tranche-7 slice
- [x] Create Ralph context snapshot
- [x] Audit the legacy row against current source/proof/docs
- [x] Implement the row resolution
- [x] Verify, architect-review, deslop, rerun, and clean state

# Findings

- the exhaustive API/public-surface audit is still the live next batch
- the next smallest unresolved `slate-react` slice is the `use-selected.spec.tsx`
  row
- the release-file review ledger already splits the surviving value from the
  dead chunking branch
- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo

# Progress

## 2026-04-14

- Started the next tranche-7 Ralph slice
- Chose the `use-selected.spec.tsx` row as the next bounded slice
- Created the Ralph snapshot in `.omx/context/`
- Audited the legacy file against current proof owners and docs:
  - selection-overlap rerender is still live and mirrored by
    `provider-hooks-contract.tsx`
  - path-rebasing stability after structural edits is recovered by
    `surface-contract.tsx`
  - the chunking-specific branch is dead architecture and already explicit skip
    in `release-file-review-ledger.md`
- Reclassified `slate-react-api.md`:
  - `use-selected.spec.tsx` is now `mapped-mixed`
  - the note now says exactly which behaviors are mirrored, recovered, and cut
- Verified:
  - legacy file archaeology against
    `/Users/zbeyens/git/slate/packages/slate-react/test/use-selected.spec.tsx`
  - current proof-owner audit against
    `provider-hooks-contract.tsx` and `surface-contract.tsx`
  - grep sweep confirming the API matrix now marks the row `mapped-mixed`
    while `release-file-review-ledger.md` still carries mirrored/recovered/
    explicit-skip subrows separately
- Architect review: `APPROVED`
- Deslop result:
  - no justified simplifications beyond the landed row reclassification
  - reran the consistency sweep after the final edits

# Errors

- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo
