---
"@platejs/floating": major
---

Move editor geometry helpers to the minimal Base read and DOM capabilities they
consume, so layered editors remain inferred without whole-editor
reconstruction. Restrict `useVirtualFloating` to virtual references, prevent
toolbar effect loops, and colocate the public geometry and hook families
without changing their exports.

**Migration:** Remove type arguments from `useVirtualFloating`; it always returns a virtual-reference floating result.
