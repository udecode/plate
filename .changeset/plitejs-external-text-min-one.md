---
'plitejs': patch
---

Allow `slots.externalText` on non-void text-only blocks whose schema declares `min: 1` without requiring `max: 1`, as long as the rendered element currently holds a single text leaf. Multi-leaf elements (such as code blocks holding pending suggestion marks) can now fall back to native `slots.children()` rendering and remount `externalText` once back to one leaf.
