---
'@platejs/resizable': major
---

Require React and React DOM 19.2 or newer.

Export direct `Resizable` and `ResizeHandle` components with flat props. Remove the component factory, public providers, stores, raw selector hooks, and state-to-props hook pipelines; resize context remains private to the family.

Move resize components to the current editor hooks and feature-owned commit APIs, add keyboard slider behavior, and restrict relative resize lengths to percentage strings. Resize-handle consumers receive live pointer and keyboard callbacks from their nearest resizable owner.

Use a neutral zero minimum width and generic `Resize` accessible label in the package. Media registry components own their media-specific limits and label.

**Migration:** Remove the unused `readOnly` resizable option and `isTouchEvent` helper, and use percentage strings for relative lengths. `resizeLengthClamp` returns the widened `number` or percentage-string kind instead of the input literal.
