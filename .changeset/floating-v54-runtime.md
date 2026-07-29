---
"@platejs/floating": major
---

Move editor geometry helpers to the Base read and DOM APIs, restrict
`useVirtualFloating` to virtual references, and prevent toolbar effect loops.
Colocate the public geometry and hook families without changing their exports.

**Migration:** Remove type arguments from `useVirtualFloating`; it always returns a virtual-reference floating result.
