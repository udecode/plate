---
title: Comments data ownership
type: decision
status: accepted
updated: 2026-09-11
review_scope: comments
current_review: 2026-09-09-comments-package-data
review_history:
  - ../review-records/2026-09-04-comments-ownership.json
  - ../review-records/2026-09-05-comments-execution.json
  - ../review-records/2026-09-09-comments-package-data.json
source_refs:
  - ../../plans/2026-09-09-comments-package-data.md
related:
  - ../reviews.md#comments
---

# Comments data ownership

The Comments package owns serializable thread records, editor binding,
range mapping, subscriptions and disposal. Applications own database I/O,
authentication and authorization. Copied UI owns presentation.

[BaseCommentsPlugin](../../../packages/platejs/src/features/comments/BaseCommentsPlugin.ts)
declares `CommentThread`, `initialThreads`, mapped range targets and
editor-local record/anchor state. The current source expresses the selected
boundary. This compilation does not replay its behavior or certify completion.

The September 4 audit retained application-owned thread data while cutting
duplicate activation and suggestion lifecycle. The September 9 user request
changed that constraint and selected package-owned data integration. Preserve
both reviews: the earlier conclusion is evidence about its requirements, not
a veto on the current boundary. Comments remains the conversation owner;
native authored changes has a separate pending-edit job.

Reopen for a current ownership contradiction, a failed multi-editor/range
lifetime case, or another requested review. [History and proof entry points](../reviews.md#comments)
retain the audit, execution and adoption records.
