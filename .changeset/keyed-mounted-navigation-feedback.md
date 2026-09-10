---
'platejs': major
---

Use `editor.api.navigation.flashTarget({ key, attributes?, duration? })` for temporary element feedback in the calling mounted view, including read-only views. Resolve `key` through `editor.key(path)` and supply classes or styles in `attributes`. Use `editor.api.navigation.clear()` to cancel that view's feedback.

Replace navigation target selectors, path targets, highlight variants, and the generic `navigate` transform with feature-owned navigation and rendered `data-nav-target`, `data-nav-cycle`, and `data-nav-pulse` attributes. Footnote navigation uses `editor.api.footnote.focusDefinition()` and `focusReference()` from a mounted editor; selection-only transactions use `editor.update.footnote.selectDefinition()` and `selectReference()`.

Bind plugin API factories to the exact editor or mounted view that exposes them while sharing plugin configuration and stores. Capture the editor inside the `api` factory when a command needs view-specific focus, scrolling, or feedback.

Allow footnote navigation when `navigationFeedback` is disabled.
