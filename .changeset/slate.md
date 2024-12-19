---
'@udecode/slate': minor
---

Add `findNodePath` - a traversal-based node path finder with O(n) complexity. This is the headless alternative to `findPath` from `@udecode/slate-react`, recommended for:

- Non-React contexts
- Plugin logic that doesn't require React dependencies
- Non-performance-critical paths where O(n) traversal is acceptable
