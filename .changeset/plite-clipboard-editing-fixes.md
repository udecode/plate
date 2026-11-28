---
'plitejs': patch
---

- Allow point drops to move ranges holding content-root owners without failing validation before landing
- Join open multi-depth slices into root blocks at block start and end
- Keep closed object blocks and their captions intact when pasted into a different block type
- Refuse Enter, typing, and delete over partial ranges inside read-only blocks
