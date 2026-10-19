---
review_scopes:
  - media
review_basis:
  - 2026-09-21-media-object-editable-content-final-pass
work_kind: implementation
---

# Full media caption text deletion

Status: Completed

Acceptance: On `/blocks/editor-ai`, selecting exactly the image caption text and pressing Delete clears the caption to `[{ text: '' }]`, preserves the same image and URL, and leaves a caption text caret. Undo restores the text, and replacing a full caption selection with typed text also keeps the image. A selected media `NodeSelection` still deletes its owner, and prior object-arrow traversal remains intact.

Reporter contradiction: The 2026-09-22 16:15 video shows `Image caption` selected and the image removed after Delete, with the caret at the preceding paragraph. The prior object-navigation completion did not cover the full child-text range. Another task owns the separate visual highlight report; this repair does not change media paint.

Cause: The generic full-block command shortcut classifies a `TextSelection` covering all direct caption text as selecting the enclosing object block. It replaces or deletes that object before the ordinary child-text operation can run. The same helper serves Delete and single-line replacement.

Work:
- [x] Inspect the reporter video and reproduce the model and exact browser failure before the fix.
- [x] Repair full-block classification in Plite's shared command owner.
- [x] Add rejecting generic object and browser regression cases, including undo and text replacement.
- [x] Reconcile editor behavior law and proof links.
- [x] Run affected core, React, browser, type and lint checks on final source.
- [x] Review source ownership, record final proof and limits, and close the media execution ledger.

Decision: Preserve `object: true` and direct caption children. A full child-text range is a text selection; whole-owner deletion belongs to `NodeSelection`. The full-block shortcut must yield to child editing when both endpoints are inside one object.

Proof: [The direct model, browser, type, lint, and application checks](../research/raw/2026-09-22-media-caption-full-text-delete-proof.md) pass. The broader media browser run has one separate image-highlight test timeout before its assertion; that task is owned by another thread.

Attempt 2 — reporter contradiction (2026-09-22): The first execution proved the image and model caret survive Delete but omitted the focused empty caption's visible placeholder and next-key usability. The user reports that the caption disappears. This revokes the first local-completion claim while retaining its model and owner-selection acceptance. On the published `/docs/media` demo, deleting all text in its separate caption textarea keeps the image but removes the textarea and moves focus to the page body; that older demo does not establish the requested focused-empty behavior. On the source-backed `/blocks/editor-ai` editor, the immediate post-Delete DOM has a visible, blank `figcaption` with no `data-placeholder` and only a zero-width character; the image remains. The final acceptance additionally requires a visible empty-caption placeholder while its text caret is inside, hiding it only when neither the caption nor asset is active, and typing the next key into the same caption.

Attempt 2 outcome: The shared caption reads live node text from the editor with a node-scoped subscription, and its focus hook recognizes the facade range. On source-backed Chrome, Delete leaves the image and visibly renders `Write a caption...`; blur hides the empty caption, selecting the image restores it, and typing after refocus updates the same caption. The eight-case media browser suite, application typecheck, registry freshness, and focused lint pass. The first broad browser run timed out while the docs preview was compiling; the highlight case and full suite passed after compilation. [Focused-caption visual and automated proof](../research/raw/2026-09-22-media-caption-focused-empty-proof.md) records the exact observations and limit.
