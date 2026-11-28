---
'plitejs': patch
---

- Fix selecting and copying struck media in a read-only proposed view
- Keep typed text after struck letters when replacing an inline element and following text in Suggesting mode
- Fall back from `crypto.randomUUID` so authored changes and sync work on non-secure HTTP origins
