---
'platejs': patch
---

- In `platejs/ink`, a mark drawn on a mention, or on another inline void, now shows its changed sign once that void is swapped for a different one or its properties change, instead of staying on the new one. A void's id and review marks don't count, so a mark on a suggested mention stays live when the suggestion is accepted. A mark saved before this change on a block that holds an inline void shows that sign too, because its saved copy has no record of the voids.
