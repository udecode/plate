---
"@platejs/floating": major
---

Require React and React DOM 19.2 or newer.

Keep `useVirtualFloating` and reusable geometry in the package. Copy
`floating-toolbar` for editor focus, selection, read-only policy, outside
clicks, and toolbar positioning.

Move editor geometry helpers to the minimal Base read and DOM capabilities they
consume, so layered editors remain inferred without whole-editor
reconstruction. Restrict `useVirtualFloating` to virtual references, prevent
toolbar effect loops, and colocate the public geometry family.

**Migration:** Remove type arguments from `useVirtualFloating`; it always returns a virtual-reference floating result.
