---
"@udecode/slate-plugins-reset-node": patch
---

fix: `getResetNodeOnKeyDown` should not return `false`, otherwise the plugins pipeline stops (e.g. the list plugin onKeyDown handler). So it now returns void or true.
