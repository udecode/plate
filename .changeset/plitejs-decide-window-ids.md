---
'plitejs': patch
---

Speed up accepting and rejecting a suggestion in an editor whose elements store generated ids, such as one with Plate's `ElementIdPlugin`. A decision resolves only the blocks its change touches instead of the whole document.
