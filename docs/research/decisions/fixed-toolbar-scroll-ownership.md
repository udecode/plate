---
title: Fixed toolbar scroll ownership
type: decision
status: implemented
updated: 2026-09-17
review_scope: fixed-toolbar-scroll
current_review: 2026-09-16-fixed-toolbar-scroll-ownership
review_history:
  - ../review-records/2026-09-16-fixed-toolbar-scroll-ownership.json
related:
  - ../reviews.md#fixed-toolbar-scroll
  - ai-preview-ownership.md
  - ../../plans/2026-09-16-fixed-toolbar-scrollport-layout.md
---

# Fixed toolbar scroll ownership

**Eliminate toolbar overlap through copied editor layout.** Keep
`FixedToolbar` presentational. The editor panel should allocate a toolbar row
and a separate content scroll area, so toolbar height does not require an
editor subscription, measurement, observer, or mutation of somebody else's
inline style.

Status: Implemented and verified. `EditorFrame` owns the flex-column panel,
`EditorContainer` remains the registered scroll element, and
`FixedToolbarPlugin` renders through `beforeContainer`. The toolbar is a static
frame row: retaining sticky positioning caused viewport scrolling to move it
over its sibling scrollport. Inline AI preview follow-scroll now targets the
registered scroll element and observes only the preview's rendered size, so
late media growth stays visible without moving the outer page.

The superseded effect unconditionally called `useEditor`, measured toolbar
height, adds it to captured `scroll-padding-top`, and conditionally restores
that style on cleanup. This solves an overlap symptom for an internal sticky
toolbar but makes that topology an assumption of every toolbar instance.
`multiple-editors-demo.tsx` explicitly permits a null selected editor and still
renders the toolbar; `useEditor` throws on null. The installation marks example
renders its toolbar as a sibling before `EditorContainer`, so its height is not
an obstruction inside that container. These are source findings, not a browser
reproduction in this review.

The existing test mocks the editor and scroll element and asserts the padding
write and cleanup. It proves that implementation protocol, not that the target
element is the toolbar's scroll ancestor or that a caret stays visible.

## Target and alternatives

The complete caller audit found that the anonymous wrapper sketched in the
initial review needs one copied composition name. Changing or internally
wrapping `EditorContainer` would retarget its `className`, style, ARIA, event,
and ref props away from the registered scroll element. `EditorFrame` owns that
higher toolbar-plus-scrollport composition while `EditorContainer` keeps its
existing semantic and runtime identity:

```tsx
<EditorFrame className="h-[650px]">
  <EditorContainer>
    <Editor />
  </EditorContainer>
</EditorFrame>
```

The copied frame owns panel sizing. `FixedToolbarPlugin` uses the existing
`beforeContainer` slot, so the toolbar and registered scroll container are
siblings inside the frame. Merely switching the slot without moving bounded
height from `EditorContainer` to `EditorFrame` is not a complete adoption.
Manual examples use the same frame; the controller-level shared toolbar remains
outside individual frames.

- Keeping the effect retains an incorrect universal overlap assumption.
- Extracting it into a hook hides the same coupling and style ownership.
- Explicit CSS padding is appropriate for an intentionally overlapping custom
  header, but guessed height is weaker than removing overlap in the default UI.
- A package obstruction registry or toolbar-aware Plite scrolling adds an
  owner that this job does not require. Plite already consumes CSS scroll
  padding; retain that neutral behavior for legitimate overlays.
- Delete the default overlap through layout. Retain the toolbar and its copied
  plugin for their independent presentation and kit-composition jobs. The new
  copied `EditorFrame` is static DOM/CSS composition, not a JavaScript geometry
  owner or package scroll API.

## Relation and limits

This is the first focused toolbar ownership review. The implemented target does
not reverse the separate AI temporary-draft decision or erase its behavior
receipts. The broader UI scope remains unassessed.

The execution-ready adoption plan is
[`2026-09-16-fixed-toolbar-scrollport-layout.md`](../../plans/2026-09-16-fixed-toolbar-scrollport-layout.md).
Adoption migrated the complete fixed-toolbar/container census, removed the
container demo-height contract, rebuilt the registry, and installed both copied
editor blocks under Base/Nova and Radix/Luma. Focused DOM tests and fresh
Chromium verify bounded and narrow geometry, shared-toolbar startup and editor
switching, exact Markdown endpoint/menu containment, stable outer-page scroll,
and MDX responsiveness. Native Chrome reproduced the exact docs interaction
with outer scroll stable at `502 → 502`. The broad `www` typecheck retains two
unrelated comment-spec helper-name errors; no fixed-toolbar or AI preview type
failure remains. No release or publication is claimed.
