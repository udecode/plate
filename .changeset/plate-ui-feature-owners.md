---
'platejs': major
---

Keep editor behavior with its feature owner and compose application controls from copied registry UI.

Use public Plate hooks for editor and element subscriptions. Import low-level DOM and rendering contracts directly from `plitejs/dom` or `plitejs/react`; Plate exposes its editor-aware bindings and node primitives. Plugin construction internals, DOM bridges, serializer helpers, and unused UI state wrappers are private.

Render literal text safely through `renderStaticHtml`: text that resembles HTML remains escaped. Static and live renderers share the underlying Plite node contracts.

Use `PlateBlockInsertOptions` for feature insertion relative to a live source node. Block actions use the installed heading, list, blockquote, details, columns, table, and media operations, preserving one transaction and undo step. Empty text-block replacement preserves structural and atomic nodes.
