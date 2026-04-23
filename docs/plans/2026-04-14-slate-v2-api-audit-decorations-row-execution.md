---
topic: slate-v2-api-audit-decorations-row-execution
date: 2026-04-14
---

# Goal

Resolve the `slate-react` `decorations.spec.tsx` API audit row cleanly under
the finished overlay architecture.

# Scope

- one tranche-7 slice only
- `slate-react` decorations row
- supporting docs only if the classification still drifts

# Loaded Skills

- `ralph`
- `major-task`
- `planning-with-files`
- `learnings-researcher`

# Constraints

- Use the live roadmap and exhaustive API audit plan as authority
- Do not widen this into a whole-family rewrite
- No fake mixed-row language when the exact legacy file contract is cut

# Phases

- [x] Load skills and choose the first honest tranche-7 slice
- [x] Create Ralph context snapshot
- [x] Audit the legacy row against current source/proof/docs
- [x] Implement the row resolution
- [x] Verify, architect-review, deslop, rerun, and clean state

# Findings

- the exhaustive API/public-surface audit is the live next batch
- the smallest unresolved slice is the `slate-react` `decorations.spec.tsx`
  mixed row
- the release-file review ledger already splits the surviving value from the
  dead legacy contract
- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo

# Progress

## 2026-04-14

- Started the post-Wave-8 Ralph batch
- Confirmed the live next batch is the exhaustive API/public-surface audit
- Chose the `decorations.spec.tsx` row as the first bounded slice
- Created the Ralph snapshot in `.omx/context/`
- Audited the legacy file against current proof owners and docs:
  - the legacy file is centered on `Editable decorate={...}`, chunked vs
    non-chunked behavior, and redecorate-on-change/path-shift behavior
  - the surviving projection-driven renderer value is already split out in
    `release-file-review-ledger.md`
- Reclassified `slate-react-api.md`:
  - `decorations.spec.tsx` is now `explicit-skip`
  - the note now says the exact legacy file contract is cut while the surviving
    projection-driven value is owned elsewhere
- Verified:
  - legacy file archaeology against
    `/Users/zbeyens/git/slate/packages/slate-react/test/decorations.spec.tsx`
  - current proof-owner audit against
    `primitives-contract.tsx` and `projections-and-selection-contract.tsx`
  - grep sweep confirming the API matrix now marks the row `explicit-skip`
    while `release-file-review-ledger.md` still carries the surviving
    projection-driven value separately
- Architect review: `APPROVED`
- Deslop result:
  - no justified simplifications beyond the landed reclassification
  - reran the consistency sweep after the final edits

# Errors

- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo
