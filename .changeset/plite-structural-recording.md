---
'plitejs': patch
---

- Drop the properties a schema drops on copy, such as review marks, from typed text
- Drop them from pasted or dropped content too, in every root it carries, whether it arrives as an editor envelope, an HTML fragment attribute or a registered data-transfer format
- Land `transfer.move` for a text range across differently marked leaves, a text range between roots, and a whole formatted leaf moved to its paragraph's start, which it refused as lossy
- Write only the changed children to Yjs for a structural edit inside a block, instead of re-creating the whole top-level block
