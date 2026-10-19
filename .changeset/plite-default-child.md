---
'plitejs': patch
---

- Add `state.schema.createDefaultChild({ at, root? })` to build the default block that the parent at `at` declares for that slot, reading the parent and its ancestors the way `state.schema.copy` does; a container without declared content, such as one the schema does not declare, takes the root's default for the root slot that holds it
- Typing or pasting plain text over picked blocks builds each new block as the default its container declares for that slot, and changes nothing instead of throwing when the container has no room for it
