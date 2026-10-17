# Fixed toolbar and scroll layout

Toolbar overlap is removed by copied layout, not measurement. `FixedToolbar` is presentational, with no editor subscription, `ResizeObserver` or `scroll-padding` write, and the copied `EditorFrame` gives the toolbar its own row beside the registered `EditorContainer` scrollport. The 2026-10-04 audit found this landed and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [scrollport plan](../2026-09-16-fixed-toolbar-scrollport-layout.md)). `node tooling/scripts/review-ledger.mjs show fixed-toolbar-scroll` prints the full history.

## Layer and owner

```tsx
// copied editor block
<EditorFrame className="h-[650px]">
  <EditorContainer>
    <Editor />
  </EditorContainer>
</EditorFrame>
```

| Responsibility | Decision |
| --- | --- |
| Panel sizing | `EditorFrame` owns the flex-column panel and its bounded height. |
| Scroll element | `EditorContainer` stays the registered scroll element, keeping its `className`, style, ARIA, event and ref props. |
| Toolbar | `FixedToolbarPlugin` renders through `beforeContainer` as a static frame row; a shared toolbar above several editors stays outside the frames. |
| Overlays | Plite keeps consuming CSS scroll padding for a custom header that overlaps on purpose. |
| AI preview follow-scroll | Targets the registered scroll element and observes only the preview's rendered size. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The measuring effect | Called `useEditor` unconditionally, which throws for the multiple-editors demo's null editor, and wrote another owner's inline style. |
| Extracting it into a hook | Hides the same coupling. |
| Sticky toolbar positioning | Viewport scroll moved it over the sibling scrollport. |
| Wrapping or retargeting `EditorContainer` | Moves its props off the scroll element. |
| A package obstruction registry or toolbar-aware Plite scrolling | An owner this job does not need. |

## What other editors do

Not compared; this is copied-UI layout.

## Main changes

- The toolbar measurement effect and the container demo-height contract are gone.

## Open work

- The broader UI scope is unassessed. owner: the `ui` subject. stop: its review.
