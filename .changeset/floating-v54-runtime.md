---
"@platejs/floating": major
---

Move editor geometry helpers to the Base read and DOM APIs, restrict `useVirtualFloating` to virtual references, and prevent toolbar effect loops

**Migration:** Remove type arguments from `useVirtualFloating`; it always returns a virtual-reference floating result.
