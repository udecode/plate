---
'@udecode/slate-react': major
---

Rename `findNodePath` to `findPath` since the addition of `findNodePath` in the headless lib.

We recommend using `findPath` mostly when subscribing to its value (e.g. in a React component) as it has O(path.length) complexity, compared to O(n) for the traversal-based `findNodePath`. This optimization is particularly important in:

- Render functions of Plate components where using `findNodePath` would increase the initial render time by O(n²)
- Key press handlers where using `findNodePath` would increase the handling time by O(n)

where n is the number of nodes in the editor.
