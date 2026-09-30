---
title: Lists and indentation
type: decision
status: accepted
updated: 2026-09-30
review_scope: list
current_review: 2026-09-24-list-audit
reconciled_executions:
  - 2026-09-30-content-root-locations-design
  - 2026-09-30-content-root-locations-execution
  - 2026-09-30-content-root-locations-closure
related:
  - ../../plans/2026-09-30-content-root-locations.md
---

# Lists and indentation

The [list review](../review-records/2026-09-24-list-audit.json) retains flat list
properties, the shared indentation axis, conditional `listStart` and forced
`listRestart`. The current ordinal cache uses immutable root children; live
and detached conversion already share `deriveListOrdinal` through their own
small read adapters.

The [content-root design](../../plans/2026-09-30-content-root-locations.md)
is [adopted locally](../../plans/2026-09-30-content-root-locations-execution.md). It supplies the correct root reader and widens
`ordinal(at)` to existing node targets, so static consumers use their known
paths. Missing or foreign targets return `undefined` rather than an invented
first-item ordinal. It keeps the pure detached adapter and the existing
numbering rules.

Package tests prove numbering in primary, owned and supplied-document roots,
and the production probe shows no root index materialization for known paths.
Custom sibling rules and invalidation keep their existing contracts. This design receipt does not certify every finding in
the earlier list audit.
