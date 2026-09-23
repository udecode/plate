---
title: Media object and editable content ownership
type: decision
status: accepted
updated: 2026-09-22
review_scope: media
current_review: 2026-09-22-caret-navigation-robustness-review
reconciled_executions:
  - 2026-09-21-object-elements-editable-children-design
  - 2026-09-22-object-elements-editable-children-execution
  - 2026-09-22-object-elements-full-browser-proof-execution
  - 2026-09-22-media-object-arrow-navigation-execution
  - 2026-09-22-media-object-arrow-final-execution
  - 2026-09-22-media-object-arrow-ledger-closure-execution
  - 2026-09-22-media-caption-full-text-delete-execution
  - 2026-09-22-media-caption-focused-empty-execution
review_history:
  - ../review-records/2026-09-21-media-caption-clean-reset-ownership.json
  - ../review-records/2026-09-21-media-object-editable-content.json
  - ../review-records/2026-09-21-media-object-editable-content-final-pass.json
  - ../review-records/2026-09-22-media-object-arrow-navigation-audit.json
  - ../review-records/2026-09-22-caret-navigation-robustness-review.json
source_refs:
  - ../../../packages/plitejs/src/interfaces/schema.ts
  - ../../../packages/plitejs/src/core/schema-compiler.ts
  - ../../../packages/plitejs/src/core/public-state.ts
  - ../../../packages/plitejs/src/core/get-content-slice.ts
  - ../../../packages/plitejs/src/editor/positions.ts
  - ../../../packages/platejs/src/features/media/lib/BaseMediaPlugin.ts
related:
  - ../features/media.md
  - editing-command-ownership.md
  - ../../plite/research/2026-09-21-media-object-editable-content/README.md
---

# Media object and editable content ownership

Plite owns a strict object role for independently meaningful blocks with
editable children. All five Plate media descriptors use that role while keeping
direct caption children in one document. The implementation and its scoped
five-project browser proof are complete on `next`.

An image remains meaningful content when its caption is empty. Its body can be
selected, copied, moved, or deleted as a whole; a text selection in its caption
must retain normal text semantics. At the review checkpoint,
`isolating + keyboardSelectable` flags provided useful interaction behavior
but did not fully express this law.
An executed public-boundary probe shows an empty-caption image being removed
by `replaceEmpty`; another shows three caption characters exporting and
inserting as an image. Enabling `atom` instead collapses caption traversal.
A follow-up probe isolates the transfer failure: `isolating` closes an inner
text range around its owner, while the same selectable element without that
barrier exports and inserts plain text.

Plite owns the neutral schema fact and its structural, selection and
slice consequences. `object` is a semantic role, not a macro for `atom`
or the former `isolating + keyboardSelectable` pair. `atom` remains the
independent fact that descendants are not traversable. Whole-node selection
transfers the owner; a text range inside ordinary children transfers open child
content. Plate keeps caption-specific Enter policy. Keep one document and
ordinary children; reject another persisted caption node, nested editor, root,
or generic object plugin without an independent current job. Do not add a
separate public intrinsic-content axis until a non-object consumer earns it.
The public spelling is `schema.element.textBlock({ object: true })`, compiled
behavior exposes `object: boolean`, and state exposes `schema.isObject(node)`.
The role is block-only, non-void, non-atom, selectable, and structurally
isolating. It derives isolation while selection-shaped transfer remains open
for descendant text. The branch-only `keyboardSelectable` schema fact is
deleted; owner selection derives privately from object or atom semantics.

This supersedes the previous clean-reset-only recommendation for the whole
remaining job. Schema-default block reset remains the right type-conversion
owner, and ordinary conversions still need compatible-property preservation.
The proposed reset option alone does not settle object identity or transfer.

The [source comparison and probes](../../plite/research/2026-09-21-media-object-editable-content/README.md)
cover ProseMirror, WordGard and Lexical. The
[accepted design](../../plans/2026-09-21-object-elements-with-editable-children.md)
sets the compiler laws, generic operation matrix, atomic Plate media Enter
algorithm, adoption inventory, and proof gates. Its pre-adoption probes showed
that a caption-to-following-paragraph Enter committed two image owners in both
selection directions. The
[implementation record](../review-records/2026-09-22-object-elements-editable-children-execution.json)
binds the adopted source and direct model, clipboard, media, browser, docs,
doctrine, and release evidence. That initial receipt preserved a browser-matrix
limit after host sleep interrupted earlier runs. The subsequent
[verified execution](../review-records/2026-09-22-object-elements-full-browser-proof-execution.json)
binds the final read-only sibling-view focus repair, all five completed browser
projects, final React checks, and the prior media and release proof. The full
matrix passed Chromium 748, Firefox 676, mobile 374, WebKit 697, and mobile
WebKit 2 tests, with declared platform skips. Five serial media-caption
Chromium runs also passed their direct reporter interactions.

The [keyboard-navigation audit](../review-records/2026-09-22-media-object-arrow-navigation-audit.json)
identified missing horizontal owner stops and a caption-start `ArrowUp` intercepted
by content-root navigation. The [final execution](../review-records/2026-09-22-media-object-arrow-ledger-closure-execution.json)
places both transitions in Plite's generic caret path. Plain forward and
backward arrows visit the object owner before or after its direct editable
children, including empty captions and consecutive media; `ArrowUp` at caption
start returns to the owner. The final `/blocks/editor-ai` browser interaction,
generic object contract, and mixed-bidi browser suite pass. The application-wide
typecheck remains limited by unrelated in-progress code-block edits; the
execution record retains that limit separately from the passed interaction.
The media review ledger inventory and generated hub check pass.

The [caption deletion repair](../review-records/2026-09-22-media-caption-full-text-delete-execution.json)
keeps a fully selected direct caption as child text rather than promoting it to
a selected media block. Delete clears its text and leaves the image and caption
caret; Undo and full-caption replacement keep the same owner. The exact
`/blocks/editor-ai` browser case, generic object selection tests, command
contracts, and affected type and lint checks pass. At that checkpoint, a
separate highlight browser test timed out before its assertion while its first
image was hidden.

The [focused-empty-caption follow-up](../review-records/2026-09-22-media-caption-focused-empty-execution.json)
corrects the initial browser-proof gap. The shared caption reads live child
text and recognizes the facade selection range, so deleting all caption text
leaves a visible placeholder while the caption caret is focused. The empty
caption hides on blur, reappears when its asset is selected, and accepts typed
text after refocus. Source-backed Chrome replay and all eight media-caption
Chromium cases pass. The initial broad run hit a cold docs preview before its
figures loaded; the case and full suite passed after compilation.

The [caret navigation review](../review-records/2026-09-22-caret-navigation-robustness-review.json)
retains the Plite object role and generic selection owner. The current
populated-caption and hidden-empty-caption reverse paths agree with the
reconciled `EDIT-CAPTION-NAV-005` and `EDIT-CAPTION-NAV-006` laws. On the
settled source, Plite typecheck, 41 focused React tests, and all 14 media
caption Chromium cases pass. The remaining design question is whether generic
object navigation can use one private policy for visible child caret stops
and owner stops: reverse vertical entry currently gates on text length, and
horizontal owner movement reads the Editable host's direction. Mixed local
direction, visible empty children in non-media objects, media embed reverse
entry, and non-Chromium media runs remain unproved. No new public flag or
media-specific navigation plugin is justified by this review.
