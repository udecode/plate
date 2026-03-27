---
"@platejs/core": patch
---

perf(static): avoid O(n²) findPath in PlateStatic by passing pre-computed path

Pass pre-computed path through PlateStatic component tree instead of calling `editor.api.findPath()` per node. For 1,872 nodes: paragraph-only 593ms → 68.6ms (8.6x), full plugins 1,661ms → 892ms (1.9x).
