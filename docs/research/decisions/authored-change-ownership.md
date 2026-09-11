---
title: Native authored-change ownership
type: decision
status: accepted
updated: 2026-09-11
review_scope: authored
current_review: 2026-09-10-authored-adoption-plan
review_history:
  - ../review-records/2026-09-10-authored-research.json
  - ../review-records/2026-09-10-authored-adoption-plan.json
source_refs:
  - ../../plans/2026-09-10-native-authored-changes-and-suggestions.md
  - ../../plite/research/2026-09-10-authored-changes/README.md
related:
  - ../reviews.md#authored
  - structural-comparison.md
---

# Native authored-change ownership

The selected target puts authored-change semantics in Plite: an accepted
document plus retained proposals, editable native views and author-selected
decisions. Plate supplies the suggesting workflow; Comments supplies
conversations. Local undo and retained author history remain separate jobs.

The [owning plan](../../plans/2026-09-10-native-authored-changes-and-suggestions.md)
reports S1–S3 in progress. Current source exposes
[native authored types](../../../packages/plitejs/src/authored/index.ts), while
[BaseSuggestionPlugin](../../../packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin.ts)
still contains the independent suggestion implementation. This is ongoing
adoption, not whole-plan completion.

The research's follow-up retained a failed convergence probe. Its negative
evidence must stay visible when reconsidering concurrent decisions or shared
state. A later implementation needs its own package, browser, collaboration,
format and scale proofs; this compilation does not replay them.

The [history](../reviews.md#authored) links the unselected research alternatives
and the subsequent adoption target. Complete native authored-change acceptance
before structural comparison uses it as a prerequisite.
