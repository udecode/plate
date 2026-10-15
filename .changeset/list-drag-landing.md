---
'plitejs': patch
---

- Land text dragged to a point as a paste lands, whether the drag moves or copies. A move refuses with `lossy` and changes nothing when `maxLength` would cut it, or when landing would change its text, its marks, or the type or properties of a block it carries, other than element properties declared to follow the drop. It does not check the block the moved text joins at the drop point or the blocks that contain it, and it checks every other block the move carries, an empty last block included
- Return and select a range that includes the line break when text dragged to a point starts at a block's end or ends at a block's start
- Add the `landing` option to element properties: `'preserve'` by default, `'rebase'` for a value relative to where content lands, such as a depth, and `'adopt'` for a value the landing site supplies, such as a list
- Add `intent: 'copy' | 'move'` to `SliceLandingInput`, so an `editorReads.slice.landing` middleware can tell a moved slice from a pasted or copied one
- Add `editorReads.transfer.adopt` with its `TransferAdoptInput`, `TransferPatch` and `TransferPatchProperties` types. A block copy or block move, by drag or keyboard, takes the properties it returns on the edge where it lands, and the drop indicator checks the same patched blocks. A move keeps its blocks and their keys and stays one undo step. A patch on a property not declared `landing: 'adopt'`, or a move patch that sets `null`, refuses with `policy`
