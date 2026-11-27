---
plitejs: patch
---

Scope `usePageLayoutFragments` to the owning paged view, retain ancestor owners of descendant caret roots across virtualized and paged views, and stage ancestor-chain reveals in `DOMEditor.scrollIntoView` for unmounted nested roots.
