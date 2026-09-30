---
'plitejs': patch
---

- Create a view from another view with `createEditorView(view, { root })`: it reads the requested root, or the primary root when `root` is omitted, and keeps the source view's document, read-only state and authored mode
- Paint a decoration only in the root it addresses: a range without roots belongs to the view that read it, and a range naming another root paints nothing
- Paint the editor's decoration sources inside element-owned content roots, and keep those roots in the owner's authored mode when it changes
