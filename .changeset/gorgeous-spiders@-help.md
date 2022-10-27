---
"@udecode/plate-node-id": minor
---

`withNodeId`:
- `filter` option was not passing the node `path` but always `[]`
- add `queryNode` to `split_node` operation
- delete splitted node id if not allowed
