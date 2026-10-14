---
'plitejs': patch
---

- With no `match` or `type`, `tx.nodes.wrap` with an inline element over a range wraps only where the element that would hold the wrapper accepts it and the wrapper accepts the nodes it would move. When it can wrap nowhere in the range, it returns `false` without changing the document instead of throwing at commit. With `split`, it runs from the first character or inline void the range holds to the last. An inline element the range only touches at its edge stays out. The range also stops short of a read-only inline at either end, though an inline element around one can still move into the wrapper whole. A block whose part of the range holds none gets no wrapper. That wrap ignores `voids`, so it never wraps anything inside a void or read-only element. A wrap with `match` or `type` keeps its edge handling and gets no fit check.
- `tx.nodes.wrap` whose matches nest, as `mode: 'all'` allows, puts the wrapper around the outer match, even when that match holds text outside the range. Before, the wrap threw, or with `split` inserted an empty wrapper.
- `tx.nodes.unwrap({ split: true })` unwraps only the selected part of an inline element that holds text, such as a link, and the whole element at a caret or an explicit point
- `tx.nodes.unwrap` returns whether it changed the document
