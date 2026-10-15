---
'@platejs/cli': patch
'platejs': patch
---

Add typed block `upsert` operations and make block `insert` apply one semantic empty-block policy across generated and feature-owned plugin portals. Generated editor contracts identify block mutations so inline portals remain excluded. Block `insert` and `upsert` return `false` with nothing changed when the block does not fit where it would land, and take one placement: a block for `after` or `before`, or a path for `at`. `BlockInsertOptions` admits `replaceEmpty` only beside `after` or no placement.
