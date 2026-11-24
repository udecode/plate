# plite

## 54.0.0-beta.4

### Patch Changes

- [`c5f9275`](https://github.com/udecode/plate/commit/c5f9275d8afb6ffc77c77551e9e74d6956fc243a) by [@felixfeng33](https://github.com/felixfeng33) – Fix accepting a line typed right after another author's pending join, which returned `blocked` until that join was decided. The accept now applies. The line stays where it is stored, and accepting the join later still places it after the joined line, as deciding both at once does.

- [`7428002`](https://github.com/udecode/plate/commit/74280028c1c3a0840d2ea5f983104206e85c6a5a) by [@zbeyens](https://github.com/zbeyens) – Fix `EditorRoot`'s `readOnly` letting a write through in the render that sets it, such as from a removed control's cleanup or a custom element's `connectedCallback`. That write now throws through an `Editable`, `PagedEditable` or `VirtualizedEditable`, also when the render mounts, removes, hides or suspends it. An `EditorReadOnlyProvider` that sets no `readOnly` no longer makes those editables writable.

- [`708a247`](https://github.com/udecode/plate/commit/708a2470c94d02a66a823d1fd05f3c2ff0ad9a6e) by [@felixfeng33](https://github.com/felixfeng33) – Fix accepting a join, or rejecting a split, that merges a line another author inserted or struck, which returned `blocked` until that author's change was decided. The merge now applies, and the other author's change stays pending on its text. Accepting the deletion of a line while another author's join onto it is pending keeps the line empty until the join is decided, as Google Docs does. Decisions of different authors can still give different results in different orders.

- [`a8d490e`](https://github.com/udecode/plate/commit/a8d490eeddc3031ceea145693201a55ed46fc18d) by [@zbeyens](https://github.com/zbeyens) – Add `nodes.byId(id)` to reads and transactions, and accept `{ id }` as a node target

  - `editor.read.nodes.byId(id)`, or `tx.nodes.byId(id)` inside an update, returns the element that holds the stored `id` as `{ key, node, path, root? }`, or `null` when no element holds it.
  - Node reads and node transforms accept `at: { id }`, such as `editor.update.nodes.move({ at: { id }, to })`, and a write reaches the element in its own root. An id that no element holds changes nothing.
  - Add `WithNodeTarget<Options>` and `PlacedTarget<T>` to type a plugin method whose `at` takes every node target.
  - Both need a schema that declares `id` as a generated, unique string on every element type, as Plate's `ElementIdPlugin` does. With any other schema they throw.

  **Migration:** In an editor whose elements store ids, `unique.holder('id', value)` throws. Use `nodes.byId(value)`.

- [`263988d`](https://github.com/udecode/plate/commit/263988d12543f1b88f94df987de6f2c22730bd40) by [@zbeyens](https://github.com/zbeyens) –

  - Fix pasting a copy that ends in a quote, such as text copied from a paragraph into the quote after it or across two quotes, into the middle of a paragraph, which changed nothing. The first copied line now joins the text before the caret, and the last lands in a quote with the text after the caret.
  - Fix pasting two titles into the middle of a block, which changed nothing. Each pasted block now takes the type its place allows. In a title, the second title becomes a paragraph, as it does when you press Return in a title.

- [`dc2d018`](https://github.com/udecode/plate/commit/dc2d0182b361c78e257819f47251993efef70ecf) by [@zbeyens](https://github.com/zbeyens) –

  - Fix the text after the caret taking the last pasted block's properties, such as `checked`, and losing the destination block's, such as `align`, when you paste a copy of quoted paragraphs into the middle of a quoted paragraph. It now keeps the destination block's properties, as Return splits them.
  - Fix pasting blocks that equal the destination block into its middle keeping a `split: 'drop'` property and the destination's unique value on the text after the caret. That text now gets the properties Return gives it.

- [`6016f0d`](https://github.com/udecode/plate/commit/6016f0da5257dc6752e84cc43e51e7e96b73b0dc) by [@zbeyens](https://github.com/zbeyens) –

  - Add `editor.read.ranges.isEmpty(range)`, which answers whether a range covers no letter and no whole void element, such as a mention.
  - Add the `hideEmpty` option to `createAnnotationStore`. An annotation whose range covers nothing then resolves with `range: null`, leaves `getAnnotationsAt`, and its listeners hear when its text is deleted or comes back, or when a plugin reconfigure changes what counts as content.
  - Fix a view without a preview reading the preview its editor shows. It now reads the stored document.

- [`64c3257`](https://github.com/udecode/plate/commit/64c32576914dc34edf9a3225da8bdc177bb50df8) by [@zbeyens](https://github.com/zbeyens) –

  - Keep a view that sets its own authored mode showing that mode while the editor it comes from shows a review preview. The view `EditorRoot` mounts copies the editor's mode when it mounts, so call `setView` on that mounted view to change what it shows.
  - Fix a document view read throwing while the editor it comes from shows a review preview.

- [`c16a73c`](https://github.com/udecode/plate/commit/c16a73c0c5c24de614973e4d84f0c0f5f2743d78) by [@zbeyens](https://github.com/zbeyens) –
  - Fix `nodes.byId`, `unique.holder` and `at: { id }` targets in a transaction over a view of another document. They find the element that held the value in the view's document, where a copy the transaction inserted before that element used to take the value. This holds in the main root and in named roots, and inside a `collaboration`-tagged update of the source editor.
  - Refuse a spec that a transaction over a view of another document built when the source editor applies it, with `Cannot apply a transaction spec outside its base state.`

## 54.0.0-beta.3

### Patch Changes

- [`cccbe29`](https://github.com/udecode/plate/commit/cccbe29c2ef277001e4bc9c1aac92e8e5b793be0) by [@zbeyens](https://github.com/zbeyens) – Fix Next.js production builds with Turbopack's default scope hoisting, where a page with an editor failed to prerender with `Editor read registrations must be created by the plugin read factory`. Apps no longer need `experimental.turbopackScopeHoisting: false`.

- [`18448e7`](https://github.com/udecode/plate/commit/18448e77a2959b390df58552c551e36a9d548225) by [@zbeyens](https://github.com/zbeyens) – Fix a delete into a code block turning all of its lines into text of the block before it. Delete at the end of the block before joins only the first code line, and the code block keeps its other lines and its language. A range delete that covers the whole block before removes that block and keeps the code block whole.

- [`18448e7`](https://github.com/udecode/plate/commit/18448e77a2959b390df58552c551e36a9d548225) by [@zbeyens](https://github.com/zbeyens) – Fix a click right of a code line putting the caret at another line's end or at the block's start. A click past a line's end now puts the caret at that line's end, and a click on an empty line puts it on that line.

- [`44ce4cb`](https://github.com/udecode/plate/commit/44ce4cb2dd551e17acd58f7a49aa211f07b751bd) by [@zbeyens](https://github.com/zbeyens) – Fix Backspace and Delete next to mentions, inline voids and inlines a caret may not stop in

  - Word Backspace and word Delete count a mention or another inline void as one word, and remove only that atom with the spaces between it and the caret.
  - Backspace and Delete inside or at the edge of a writable inline with `selectable: false` remove one character, as they do in a link.
  - Delete that stops before a read-only inline leaves the caret before it, so the next Delete removes it and typing works.
  - Backspace and Delete beside a block with `selectable: false` remove it whole even when it holds a mention.

- [`77ca905`](https://github.com/udecode/plate/commit/77ca90539f73cd6bddbcd4c7fb0c4a1dab584123) by [@zbeyens](https://github.com/zbeyens) – Open closed content, such as a closed details, when a block drag rests on its block for 800 ms, so the drop can land inside. The content's `onMaterialize` callback runs with the new `drag` reason; ignore that reason to keep the content closed during a drag.

- [`1861fc4`](https://github.com/udecode/plate/commit/1861fc48528693ece514c4d3cc775383ada4564b) by [@zbeyens](https://github.com/zbeyens) – Fix the range a paste or a transfer copy returns with the authored plugin in Editing, which started one character late when the pasted text joined the text before it.

- [`eff0999`](https://github.com/udecode/plate/commit/eff0999e8ba281964882aa5f776c7fc04d0f68c1) by [@zbeyens](https://github.com/zbeyens) –

  - Return `stale` from an external-text view's `dispatch` when the editor refuses the edit, such as one Suggesting cannot record, and reset the view to the editor's text.
  - Keep the undo boundary when the editor refuses an external-text edit, so the next edit after a composition gets its own undo step.

- [`7ca1ad5`](https://github.com/udecode/plate/commit/7ca1ad5d3a5b6dd6fa812b60f9047729a0556fec) by [@zbeyens](https://github.com/zbeyens) – Fix ArrowDown and ArrowUp in Firefox into a block that scrolls, such as a code block with `overflow-x: auto`, which put the caret at the end of the block instead of on its nearest line

- [`022a98b`](https://github.com/udecode/plate/commit/022a98b252147243b9650a4178e574952533a9c0) by [@zbeyens](https://github.com/zbeyens) – Run a plugin's `update` factory the first time an update or a correction reads its group, not at the start of every update, so updates that never read a group skip it

- [`0b0f932`](https://github.com/udecode/plate/commit/0b0f9326a08ad366d4f7dd1ad43cbcdf360a472f) by [@zbeyens](https://github.com/zbeyens) – Fix pasting blocks at a caret inside a link. A quote pasted in the middle of a link in a quoted paragraph no longer splits the quote in three, and blocks pasted at a link's start or end land just outside the link instead of joining into one line.

- [`8623edf`](https://github.com/udecode/plate/commit/8623edf160e107071a9f2503cfd6fe4af9f194a7) by [@zbeyens](https://github.com/zbeyens) – Fix the caret after pasting a link right before another link, or an inline void such as a mention right before another inline void, so a typed letter lands between the two

- [`d472a04`](https://github.com/udecode/plate/commit/d472a04e8a5bcec2e90b3329046440cc2626bbf9) by [@zbeyens](https://github.com/zbeyens) – Fix the caret and selection in mixed content and around marked controls

  - Home and End stay on the text before or after a block nested in a text block.
  - After a command removes a text element's only text, a typed letter lands in that element.
  - A click after a double-click in decorated text, such as a lint underline, puts the caret at the clicked offset.
  - A read-only editor keeps its selection painted after a command that re-renders it, such as Add comment.
  - A triple-click selects only the clicked line in a code block or a block with line breaks, and only the clicked text beside a nested block.
  - A backward selection stays backward after typing over it and undoing.
  - The selection stays painted when focus moves to a marked control in Firefox or Safari.

- [`7ca1ad5`](https://github.com/udecode/plate/commit/7ca1ad5d3a5b6dd6fa812b60f9047729a0556fec) by [@zbeyens](https://github.com/zbeyens) – Fix Undo and Redo pressed in an independent editor nested in a void element, which ran the outer editor's history instead of its own

- [`674a565`](https://github.com/udecode/plate/commit/674a565e3f73ed1984c808533e3bf6e294a01b86) by [@zbeyens](https://github.com/zbeyens) –

  - Fix a paste into a code block, or any element whose schema allows one text, being refused in Editing and in your own pending code block in Suggesting.
  - Fix a letter or newline typed in Editing at the start or end of a pending code block, or in an empty one, being refused. The text now joins the block's suggestion.
  - Fix a letter or paste in Editing being refused in a code block whose text holds another author's pending format, such as a color.
  - Refuse typing, Enter, paste, Backspace, Delete and mark toggles in a code block whose deletion is pending, in Suggesting and Editing, instead of landing the edit beside the block or in its struck text. The refusal reaches `subscribeRefusals` as `unrepresentable`. Decide the block's pending deletion first.

- [`60c44c5`](https://github.com/udecode/plate/commit/60c44c532a70d967ec322e76bdfe07d15035a947) by [@zbeyens](https://github.com/zbeyens) – Fix `RangeGeometry.clipRect` and `visible` for an Editable whose text paints outside its own box without clipping, such as a board's. A popup placed by `useSelectionGeometry`, such as the floating toolbar, now shows over that text, and `useEditableClip` cuts by the same area.

- [`16716a6`](https://github.com/udecode/plate/commit/16716a6ba1bccb566d9943d83c1a52d2d022b380) by [@zbeyens](https://github.com/zbeyens) – Give each pasted or duplicated element a new value for every unique property another property's `references` names, such as a field id, and point each copied reference at the copy. A reference whose target the paste or duplicate drops keeps naming the original.

- [`70560ee`](https://github.com/udecode/plate/commit/70560ee1527dc29f995e9002bdf76e415db3a921) by [@zbeyens](https://github.com/zbeyens) – Fix a property write in the same update as a paste, a document replace or a content completion, such as a plugin completing a pasted field's id, which landed on another node or was lost when the authored plugin recorded the update

- [`94e8d60`](https://github.com/udecode/plate/commit/94e8d601632fb77df76472a2e88416cce0882af6) by [@zbeyens](https://github.com/zbeyens) – Fix a closed quote pasted at a caret inside a quoted paragraph losing the text after the caret. A table pasted at a caret inside a table cell keeps the cell's text after the caret too.

- [`19995c7`](https://github.com/udecode/plate/commit/19995c74c45639dca5897295c263343cca9abde3) by [@zbeyens](https://github.com/zbeyens) – Add `namedBy` to a schema record set, so a set declares which set's records point at its records through a `names` function that lists the ids a record points at.

  - An editor created on a saved value leaves out the records of that set that nothing points at and `keep` does not accept, so the next save drops them.
  - `tx.history.restore` stops undo or redo before a step whose replay would point a record at a missing one.
  - Undo and redo skip writes to a record set the current schema retains.

- [`02007e6`](https://github.com/udecode/plate/commit/02007e6cc93732f7a318eb4554a54b7e11e361f5) by [@zbeyens](https://github.com/zbeyens) – Open a document's saved records faster. Each record loads once as text and parses the first time something reads it. Records read back from `editor.read.value()` now always list their keys in sorted order, as records written after the open already did

- [`806ba41`](https://github.com/udecode/plate/commit/806ba41d773c40f130f80f67674c8f026e33c78c) by [@zbeyens](https://github.com/zbeyens) –

  - Return `{ reason, status: 'blocked' }` from `editor.api.history.undo()` and `redo()` when the editor refuses the replay, instead of throwing, and pass it to the Editable's `onHistoryReplay` for a keyboard undo or redo. The step stays in history.
  - Fix history left busy after a session undo or redo, such as a comment thread restore.
  - Send an edit that a plugin makes in reaction to a remote Yjs import or another collaboration update to the other peers.
  - Fix the authored plugin's `subscribeRefusals` passing on refusals from other plugins, such as a node write veto.

- [`60c44c5`](https://github.com/udecode/plate/commit/60c44c532a70d967ec322e76bdfe07d15035a947) by [@zbeyens](https://github.com/zbeyens) – Remove `useSelectionView` from `plitejs/react`. Use `useCaretEditor()` for the editor of the root that holds the caret.

- [`67de7de`](https://github.com/udecode/plate/commit/67de7de401b603c4a71e4283587286517348b093) by [@zbeyens](https://github.com/zbeyens) – Make `useRootEditor()` and `useCaretEditor()` return one editor per root under an `EditorRoot`, so a lock set through that editor holds after the caret leaves its root and comes back. A renderer inside an editing area, such as a shape on a board, gets an editor of its own, so a lock set from outside never reaches it. The editor's `isFocused()`, `isComposing()`, `focus()` and `blur()` act on the editing area that shows its root, and throw while none does.

- [`5c0aff5`](https://github.com/udecode/plate/commit/5c0aff5d261697b1e237946af31fc5230ad72247) by [@zbeyens](https://github.com/zbeyens) – Add `editor.read.schema.canPlace(nodes, { at, replace, root })`, which answers whether `nodes` can land at a slot, or take the place of the child there, under the rule `tx.blocks.insert` enforces. A menu can disable what the parent cannot hold.

- [`b294cdf`](https://github.com/udecode/plate/commit/b294cdf5ebc9fd62d70061c426d885a407491c92) by [@zbeyens](https://github.com/zbeyens) – Fix selector hooks calling a custom `equalityFn` with `null` before the first result. `equalityFn` now takes `(a: T, b: T) => boolean`.

- [`24651f9`](https://github.com/udecode/plate/commit/24651f9a8b2b18aa4c688372f5439939140c77d2) by [@zbeyens](https://github.com/zbeyens) – Fix `tx.blocks.toggle(props, { wrap: true })` wrapping each selected block in its own wrapper. Adjacent selected blocks with the same parent now share one wrapper.

- [`97828f2`](https://github.com/udecode/plate/commit/97828f2d8cd638eb7cfb04b3af52672a4421a515) by [@zbeyens](https://github.com/zbeyens) –

  - Fix `unique.holder` in an authored preview or a projected document view returning the stored document's key and path, or nothing. A read that finds a node by a unique id, such as a board's `read.board.shape`, now works there.

- [`59aa10b`](https://github.com/udecode/plate/commit/59aa10b3a3eef9563da6922c2af40f152d3ea840) by [@zbeyens](https://github.com/zbeyens) – Speed up typing in documents whose schema declares a `unique` property, such as block ids.

- [`25fc8f2`](https://github.com/udecode/plate/commit/25fc8f20106154152fc9ccf8c52c12a72034aee8) by [@zbeyens](https://github.com/zbeyens) – Make `editor.plugin(Plugin)` on a React view editor, such as the one `useRootEditor()` returns, return the same object on every call, so a hook that lists it as a dependency no longer runs again on each render.

- [`1946357`](https://github.com/udecode/plate/commit/19463579aa5562d0a10dbf5e84c8736c5b902d41) by [@zbeyens](https://github.com/zbeyens) – Let `setEditorViewing()` take the editor `createEditor()` returns instead of throwing. That editor has no Mode apart from its lock, so Viewing locks it and leaving Viewing unlocks it, as `setEditorReadOnly()` does.

- [`014d1c8`](https://github.com/udecode/plate/commit/014d1c8b9deca538c10d053383d71d865d2cfd62) by [@zbeyens](https://github.com/zbeyens) – Fix selections across blocks a virtualized editor has not mounted, and arrow keys beside hidden content

  - A Shift-click or Shift+ArrowDown range that reaches unmounted blocks stays selected, and the next letter replaces it.
  - Undo that restores a range far above the viewport scrolls to it and shows it selected.
  - ArrowUp and ArrowDown after a click move into content an app hides, such as a collapsed accordion, instead of skipping past it.

- [`faf5cc3`](https://github.com/udecode/plate/commit/faf5cc3847d5afbf10c948782659bf02b1bdcc17) by [@zbeyens](https://github.com/zbeyens) –

  - Fix Backspace after a triple-click putting the caret at the end of the block above. The caret now starts the block that moves up.
  - Fix Backspace after a triple-click on the last block, a block next to a table or a table's only cell removing it. The block or cell now stays, empty, with the caret in it.
  - Fix Backspace over whole blocks selected as text replacing them with a paragraph. The first block stays, so a checklist item keeps its checkbox.
  - Fix typing over several whole blocks giving the new text the default block type. The text now takes the first block's type.

- [`70d5dc5`](https://github.com/udecode/plate/commit/70d5dc57d61365fc0a03a11bdc6d293e15e9f2b6) by [@zbeyens](https://github.com/zbeyens) –
  - Fix `compare` text changes to mark whole words instead of letters, so "like" to "love" is one change instead of "ik" to "ov"

## 54.0.0-beta.2

## 0.124.1

### Patch Changes

- [#6040](https://github.com/ianstormtaylor/slate/pull/6040) [`20a1a937`](https://github.com/ianstormtaylor/slate/commit/20a1a9371538dda1911d533e0f02b1655ffffa12) Thanks [@12joan](https://github.com/12joan)! - - Harden property accessors against untrusted keys
  - Fix incorrect argument types for the `compare` and `merge` options of `Transforms.setNodes`

## 0.124.0

### Minor Changes

- [#6006](https://github.com/ianstormtaylor/slate/pull/6006) [`72e4f025`](https://github.com/ianstormtaylor/slate/commit/72e4f025761ea7670d4944c0f25fc6da97f1e5f5) Thanks [@skorenb](https://github.com/skorenb)! - Added `force` property to `normalizeNode` passed from `normalize` method

### Patch Changes

- [#6018](https://github.com/ianstormtaylor/slate/pull/6018) [`91321bdc`](https://github.com/ianstormtaylor/slate/commit/91321bdcd2c6c0baef010bbcde3079e11841e69f) Thanks [@12joan](https://github.com/12joan)! - Do not allow paths to contain strings when getting nodes

- [#6024](https://github.com/ianstormtaylor/slate/pull/6024) [`a1729221`](https://github.com/ianstormtaylor/slate/commit/a1729221a0c5785f48493177beb81b4b8ef08594) Thanks [@juliankrispel](https://github.com/juliankrispel)! - Fix normalization hanging when merging text under non-selectable elements

## 0.123.0

### Minor Changes

- [#6000](https://github.com/ianstormtaylor/slate/pull/6000) [`8d9bf305`](https://github.com/ianstormtaylor/slate/commit/8d9bf30595a6fad62ff15e302ab489ff46a2515a) Thanks [@nabbydude](https://github.com/nabbydude)! - Added `Location.isPath`, `Location.isPoint`, `Location.isRange`, and `Location.isSpan` functions, as efficient type discriminators. Use these instead of `Path.isPath`, `Point.isPoint`, `Range.isRange`, and `Span.isSpan` whenever possible.

## 0.122.0

### Minor Changes

- [#5970](https://github.com/ianstormtaylor/slate/pull/5970) [`893cac3e`](https://github.com/ianstormtaylor/slate/commit/893cac3e4ec9233e8499ad93b2b063dddb22371f) Thanks [@nabbydude](https://github.com/nabbydude)! - Optimized normalizeNode implementation, should work the same, but may behave slightly differently if you give it something really malformed

## 0.121.0

### Minor Changes

- # [#5982](https://github.com/ianstormtaylor/slate/pull/5982) [`dd4a77b3`](https://github.com/ianstormtaylor/slate/commit/dd4a77b3c5bb5d2d3cd6a62f49d6f318d30d6727) Thanks [@nabbydude](https://github.com/nabbydude)! - Add `Node.isEditor`, `Node.isElement`, and `Node.isText` as alternative type guards for when we already know the object is a node. Use these new functions instead of `Editor.isEditor`, `Element.isElement`, and `Text.isText` whenever possible, the classic functions are only necessary for typechecking an entirely unknown object.

## 0.120.0

### Patch Changes

- [#5971](https://github.com/ianstormtaylor/slate/pull/5971) [`addf0c51`](https://github.com/ianstormtaylor/slate/commit/addf0c5128bd48693f86a2c97cea133b66dd87e6) Thanks [@nabbydude](https://github.com/nabbydude)! - Removed the last traces of immer and eliminated it as a dependency

## 0.118.1

### Patch Changes

- [#5929](https://github.com/ianstormtaylor/slate/pull/5929) [`fdaa9c80`](https://github.com/ianstormtaylor/slate/commit/fdaa9c8088e81bde2618784b42027be44598d11c) Thanks [@12joan](https://github.com/12joan)! - - Fix error when a non-selectable node has no next or previous node

  - Do not return points from `Editor.positions` that are inside non-selectable nodes
    - Previously, `editor.isSelectable` was handled incorrectly inside `Editor.positions`. When encountering a non-selectable node, it would immediately return the point before or after it (depending on `reverse`), but it would not skip returning points inside the non-selectable node if more than one point was consumed from `Editor.positions`.

- [#5943](https://github.com/ianstormtaylor/slate/pull/5943) [`aaad6717`](https://github.com/ianstormtaylor/slate/commit/aaad6717d2f3a74c2295b59c40bcc86cbb5a9b54) Thanks [@12joan](https://github.com/12joan)! - Fix: The `split: true` option on `Transforms.wrapNodes` does not work correctly when one or more points is at the start or end of a text node.

- [#5926](https://github.com/ianstormtaylor/slate/pull/5926) [`cf10119a`](https://github.com/ianstormtaylor/slate/commit/cf10119ad858b79d624d1e35814f534c20a9d362) Thanks [@12joan](https://github.com/12joan)! - Use generics for the return type of `Node.fragment`

## 0.118.0

### Minor Changes

- [#5923](https://github.com/ianstormtaylor/slate/pull/5923) [`ba33735a`](https://github.com/ianstormtaylor/slate/commit/ba33735a8ca7ca7437e891365451d25a6646a4c7) Thanks [@12joan](https://github.com/12joan)! - - When removing a text node containing the cursor, always perfer placing the cursor in a sibling text node if one exists.
  - Previously, the selection would enter a sibling inline in some circumstances, even when a sibling text node was available.
  - The most noticeable effect of this change occurs when pressing backspace at the start of line N when the last non-empty node in line N-1 is an inline.
    - Before, the cursor would be placed inside the inline.
    - Now, the cursor is placed outside the inline.

## 0.117.2

### Patch Changes

- [#5899](https://github.com/ianstormtaylor/slate/pull/5899) [`94fb04a4`](https://github.com/ianstormtaylor/slate/commit/94fb04a42c0d071c0778dd1369afb360c1ce5f11) Thanks [@12joan](https://github.com/12joan)! - Fix: `editor.selection` is sometimes replaced with a new object even if the selection did not change

## 0.117.0

### Minor Changes

- [#5885](https://github.com/ianstormtaylor/slate/pull/5885) [`c56a98fd`](https://github.com/ianstormtaylor/slate/commit/c56a98fd65183ddd9e0e711e615687bf2437e677) Thanks [@felixfeng33](https://github.com/felixfeng33)! - - Remove `ignoreNonSelectable` option from positions,before,after,nodes.
  - Fix move behavior when encounter non-selectable inline voids.

### Patch Changes

- [#5890](https://github.com/ianstormtaylor/slate/pull/5890) [`9862ae71`](https://github.com/ianstormtaylor/slate/commit/9862ae71bff60d99f423b44937ec9cf662698622) Thanks [@joblolin95](https://github.com/joblolin95)! - Handle backspace correctly for grapheme clusters in Burmese, Hindi, Khmer, Malayalam, Oriya, Punjabi, Tamil, and Telugu.

## 0.116.0

### Patch Changes

- [#5871](https://github.com/ianstormtaylor/slate/pull/5871) [`fb87646e`](https://github.com/ianstormtaylor/slate/commit/fb87646e8643e1d0547134cea9d1f57912f06a92) Thanks [@12joan](https://github.com/12joan)! - - PERF: Use pure JS instead of Immer for applying operations and transforming points and ranges. Immer is now used only for producing fragments.

## 0.115.1

### Patch Changes

- [#5887](https://github.com/ianstormtaylor/slate/pull/5887) [`293aca9c`](https://github.com/ianstormtaylor/slate/commit/293aca9c7aa20ec5b99bbe1130237fa6b7ee758d) Thanks [@12joan](https://github.com/12joan)! - Handle backspace correctly for grapheme clusters in Bengali

## 0.115.0

### Minor Changes

- [#5878](https://github.com/ianstormtaylor/slate/pull/5878) [`11b957a4`](https://github.com/ianstormtaylor/slate/commit/11b957a44171634d032d79ad8feaf548b78e58b0) Thanks [@ahoisl](https://github.com/ahoisl)! - Allow to prevent data-loss in normalizeNode

### Patch Changes

- [#5880](https://github.com/ianstormtaylor/slate/pull/5880) [`de260565`](https://github.com/ianstormtaylor/slate/commit/de260565c70c1a39acd02961f76ede6ff094b881) Thanks [@nabbydude](https://github.com/nabbydude)! - Optimize editor#above and allow passing a location that doesnt exist as long as its parent exists

- [#5875](https://github.com/ianstormtaylor/slate/pull/5875) [`896bc9c7`](https://github.com/ianstormtaylor/slate/commit/896bc9c7c75e929e861e341fc4d7cc7395e8e82a) Thanks [@12joan](https://github.com/12joan)! - Fix: Inserting a fragment containing exactly two blocks merges those blocks together.

- [#5859](https://github.com/ianstormtaylor/slate/pull/5859) [`72532fd2`](https://github.com/ianstormtaylor/slate/commit/72532fd2d7be594251ea26fefb5c1ce8337b76ed) Thanks [@12joan](https://github.com/12joan)! - Optimize `isElement`, `isText`, `isNodeList` and `isEditor` by removing dependency on `is-plain-object` and by performing shallow checks by default. To perform a full check, including all descendants, pass the `{ deep: true }` option to `isElement`, `isNodeList` or `isEditor`.

## 0.114.0

### Minor Changes

- [#5850](https://github.com/ianstormtaylor/slate/pull/5850) [`22a3dda3`](https://github.com/ianstormtaylor/slate/commit/22a3dda36d4362d5dfdb9a75836297dae8cd7f9e) Thanks [@zbeyens](https://github.com/zbeyens)! - - Update `Text.decorations` to return the positions in addition to the leaf nodes: `{ leaf: Text, position?: { start: number, end: number, isFirst: boolean, isLast: boolean } }[]`.

## 0.113.0

### Minor Changes

- [#5843](https://github.com/ianstormtaylor/slate/pull/5843) [`63c0db5b`](https://github.com/ianstormtaylor/slate/commit/63c0db5b862137490baf2883d4378efd0b6311de) Thanks [@12joan](https://github.com/12joan)! - Add `pass` option to `Editor.nodes`, which is passed through to `Node.nodes`.

### Patch Changes

- [#5842](https://github.com/ianstormtaylor/slate/pull/5842) [`463ef3a6`](https://github.com/ianstormtaylor/slate/commit/463ef3a6504020a869fa06e4dd722f72de32677a) Thanks [@wkq](https://github.com/wkq)! - fix: correct dirty path update for Text nodes

## 0.112.0

### Minor Changes

- [#5776](https://github.com/ianstormtaylor/slate/pull/5776) [`5a1c728c`](https://github.com/ianstormtaylor/slate/commit/5a1c728c62bcc6bafe60b9598946bb3adde21cdf) Thanks [@yf-yang](https://github.com/yf-yang)! - Add `merge` optional function to decorations and change related type signatures to `DecoratedRange`. Now developers can specify how two decoration object with the same key but different value are merged together if they overlap"

### Patch Changes

- [#5768](https://github.com/ianstormtaylor/slate/pull/5768) [`4bc552f7`](https://github.com/ianstormtaylor/slate/commit/4bc552f71ff75c4b7ad18386a65dabdd8b4e1bba) Thanks [@ahoisl](https://github.com/ahoisl)! - Keep data in normalization when blocks are not allowed

## 0.110.2

### Patch Changes

- [#5723](https://github.com/ianstormtaylor/slate/pull/5723) [`ee2c4540`](https://github.com/ianstormtaylor/slate/commit/ee2c45408cba9ca827df3bab0696ba5cb5ace886) Thanks [@RavenColEvol](https://github.com/RavenColEvol)! - feat: add Node.getIf method

- [#5725](https://github.com/ianstormtaylor/slate/pull/5725) [`f31167cf`](https://github.com/ianstormtaylor/slate/commit/f31167cf5fa0b4f0385cd4db9123ebe403141e11) Thanks [@WindRunnerMax](https://github.com/WindRunnerMax)! - fix marks at the start of the selection

- [#5729](https://github.com/ianstormtaylor/slate/pull/5729) [`b1a10216`](https://github.com/ianstormtaylor/slate/commit/b1a1021612b504bbc75488d650dc4d3eb926f20c) Thanks [@electroluxcode](https://github.com/electroluxcode)! - feat: add prop surrounds with range

## 0.103.0

### Minor Changes

- [#5621](https://github.com/ianstormtaylor/slate/pull/5621) [`d271c4be`](https://github.com/ianstormtaylor/slate/commit/d271c4be543027be2197f353d7ea61b51e9c48c6) Thanks [@felixfeng33](https://github.com/felixfeng33)! - Add a `shouldMergeNodesRemovePrevNode` editor method to control when `Transforms.mergeNodes` should remove the previous node rather than carrying out a merge operation.

### Patch Changes

- [#5620](https://github.com/ianstormtaylor/slate/pull/5620) [`4470f370`](https://github.com/ianstormtaylor/slate/commit/4470f370570ed1f2dce8b4b58d6117d3a87fa6c0) Thanks [@JohnCosta27](https://github.com/JohnCosta27)! - Making `normalizeNode` capable of normalizing erronous nodes, making slate more resilient.

## 0.102.0

### Minor Changes

- [#5543](https://github.com/ianstormtaylor/slate/pull/5543) [`3aaf3b51`](https://github.com/ianstormtaylor/slate/commit/3aaf3b517c2020c198bffe0f3aa8156746914408) Thanks [@mainhanu](https://github.com/mainhanu)! - Transform.insertNodes & Transform.insertFragment performance optimize

## 0.101.5

### Patch Changes

- [#5316](https://github.com/ianstormtaylor/slate/pull/5316) [`8ba3a9c0`](https://github.com/ianstormtaylor/slate/commit/8ba3a9c0348f73324b7c9ec32a4bbd348564d4f0) Thanks [@GeneralChauhan](https://github.com/GeneralChauhan)! - Punctuation Mark "+" Support Added

## 0.101.4

### Patch Changes

- [#5580](https://github.com/ianstormtaylor/slate/pull/5580) [`a374895b`](https://github.com/ianstormtaylor/slate/commit/a374895b3265ad60dbfe563eaa1a9415a440620e) Thanks [@Kaporos](https://github.com/Kaporos)! - Fix firefox double-click marks issue

## 0.101.1

### Patch Changes

- [#5562](https://github.com/ianstormtaylor/slate/pull/5562) [`91400a8e`](https://github.com/ianstormtaylor/slate/commit/91400a8e341b20194ce2fca078d8ba4b7a0476ea) Thanks [@YaoKaiLun](https://github.com/YaoKaiLun)! - Fix the 'select' parameter of the insertNodes function has been overridden

## 0.100.0

### Minor Changes

- [#5528](https://github.com/ianstormtaylor/slate/pull/5528) [`c4c14882`](https://github.com/ianstormtaylor/slate/commit/c4c14882edf13828f6583a88e50754ce63583bd7) Thanks [@dylans](https://github.com/dylans)! - Update dependencies to React 18, Node 20, TS 5.2, etc.

## 0.94.1

### Patch Changes

- [#5415](https://github.com/ianstormtaylor/slate/pull/5415) [`01f0210b`](https://github.com/ianstormtaylor/slate/commit/01f0210bccfe2c3a81c252f527bad9ded36a68ff) Thanks [@zbeyens](https://github.com/zbeyens)! - `Editor.insertFragment`, `Editor.insertNode`, `Editor.insertText` now accept `options`. For all insert methods, the default location is now the editor selection if `at` is not defined, or the end of document if `editor.selection` is not defined.

## 0.94.0

### Minor Changes

- [#5307](https://github.com/ianstormtaylor/slate/pull/5307) [`3243c7e3`](https://github.com/ianstormtaylor/slate/commit/3243c7e34ac2602618c67c88b1b7df07fde1c2ec) Thanks [@zbeyens](https://github.com/zbeyens)! - New Features:

  - All **`Editor`** and **`Transforms`** methods now call **`editor`** methods. For example: **`Transforms.insertBreak`** now calls **`editor.insertBreak`**.
  - **`editor.setNodes`** now calls **`setNodes`**, an exported function that implements the default editor behavior.
  - You can now override **`editor.setNodes`** with your own implementation.
  - You can use either **`Editor.setNodes`** or **`editor.setNodes`** in your code, and both will use your overridden behavior.

  The **`editor`** object now has many more methods:

  ```tsx
  export interface BaseEditor {
    // Core state.

    children: Descendant[];
    selection: Selection;
    operations: Operation[];
    marks: EditorMarks | null;

    // Overrideable core methods.

    apply: (operation: Operation) => void;
    getDirtyPaths: (operation: Operation) => Path[];
    getFragment: () => Descendant[];
    isElementReadOnly: (element: Element) => boolean;
    isSelectable: (element: Element) => boolean;
    markableVoid: (element: Element) => boolean;
    normalizeNode: (
      entry: NodeEntry,
      options?: { operation?: Operation }
    ) => void;
    onChange: (options?: { operation?: Operation }) => void;
    shouldNormalize: ({
      iteration,
      dirtyPaths,
      operation,
    }: {
      iteration: number;
      initialDirtyPathsLength: number;
      dirtyPaths: Path[];
      operation?: Operation;
    }) => boolean;

    // Overrideable core transforms.

    addMark: OmitFirstArg<typeof Editor.addMark>;
    collapse: OmitFirstArg<typeof Transforms.collapse>;
    delete: OmitFirstArg<typeof Transforms.delete>;
    deleteBackward: (unit: TextUnit) => void;
    deleteForward: (unit: TextUnit) => void;
    deleteFragment: OmitFirstArg<typeof Editor.deleteFragment>;
    deselect: OmitFirstArg<typeof Transforms.deselect>;
    insertBreak: OmitFirstArg<typeof Editor.insertBreak>;
    insertFragment: OmitFirstArg<typeof Transforms.insertFragment>;
    insertNode: OmitFirstArg<typeof Editor.insertNode>;
    insertNodes: OmitFirstArg<typeof Transforms.insertNodes>;
    insertSoftBreak: OmitFirstArg<typeof Editor.insertSoftBreak>;
    insertText: OmitFirstArg<typeof Transforms.insertText>;
    liftNodes: OmitFirstArg<typeof Transforms.liftNodes>;
    mergeNodes: OmitFirstArg<typeof Transforms.mergeNodes>;
    move: OmitFirstArg<typeof Transforms.move>;
    moveNodes: OmitFirstArg<typeof Transforms.moveNodes>;
    normalize: OmitFirstArg<typeof Editor.normalize>;
    removeMark: OmitFirstArg<typeof Editor.removeMark>;
    removeNodes: OmitFirstArg<typeof Transforms.removeNodes>;
    select: OmitFirstArg<typeof Transforms.select>;
    setNodes: <T extends Node>(
      props: Partial<T>,
      options?: {
        at?: Location;
        match?: NodeMatch<T>;
        mode?: MaximizeMode;
        hanging?: boolean;
        split?: boolean;
        voids?: boolean;
        compare?: PropsCompare;
        merge?: PropsMerge;
      }
    ) => void;
    setNormalizing: OmitFirstArg<typeof Editor.setNormalizing>;
    setPoint: OmitFirstArg<typeof Transforms.setPoint>;
    setSelection: OmitFirstArg<typeof Transforms.setSelection>;
    splitNodes: OmitFirstArg<typeof Transforms.splitNodes>;
    unsetNodes: OmitFirstArg<typeof Transforms.unsetNodes>;
    unwrapNodes: OmitFirstArg<typeof Transforms.unwrapNodes>;
    withoutNormalizing: OmitFirstArg<typeof Editor.withoutNormalizing>;
    wrapNodes: OmitFirstArg<typeof Transforms.wrapNodes>;

    // Overrideable core queries.

    above: <T extends Ancestor>(
      options?: EditorAboveOptions<T>
    ) => NodeEntry<T> | undefined;
    after: OmitFirstArg<typeof Editor.after>;
    before: OmitFirstArg<typeof Editor.before>;
    edges: OmitFirstArg<typeof Editor.edges>;
    elementReadOnly: OmitFirstArg<typeof Editor.elementReadOnly>;
    end: OmitFirstArg<typeof Editor.end>;
    first: OmitFirstArg<typeof Editor.first>;
    fragment: OmitFirstArg<typeof Editor.fragment>;
    getMarks: OmitFirstArg<typeof Editor.marks>;
    hasBlocks: OmitFirstArg<typeof Editor.hasBlocks>;
    hasInlines: OmitFirstArg<typeof Editor.hasInlines>;
    hasPath: OmitFirstArg<typeof Editor.hasPath>;
    hasTexts: OmitFirstArg<typeof Editor.hasTexts>;
    isBlock: OmitFirstArg<typeof Editor.isBlock>;
    isEdge: OmitFirstArg<typeof Editor.isEdge>;
    isEmpty: OmitFirstArg<typeof Editor.isEmpty>;
    isEnd: OmitFirstArg<typeof Editor.isEnd>;
    isInline: OmitFirstArg<typeof Editor.isInline>;
    isNormalizing: OmitFirstArg<typeof Editor.isNormalizing>;
    isStart: OmitFirstArg<typeof Editor.isStart>;
    isVoid: OmitFirstArg<typeof Editor.isVoid>;
    last: OmitFirstArg<typeof Editor.last>;
    leaf: OmitFirstArg<typeof Editor.leaf>;
    levels: <T extends Node>(
      options?: EditorLevelsOptions<T>
    ) => Generator<NodeEntry<T>, void, undefined>;
    next: <T extends Descendant>(
      options?: EditorNextOptions<T>
    ) => NodeEntry<T> | undefined;
    node: OmitFirstArg<typeof Editor.node>;
    nodes: <T extends Node>(
      options?: EditorNodesOptions<T>
    ) => Generator<NodeEntry<T>, void, undefined>;
    parent: OmitFirstArg<typeof Editor.parent>;
    path: OmitFirstArg<typeof Editor.path>;
    pathRef: OmitFirstArg<typeof Editor.pathRef>;
    pathRefs: OmitFirstArg<typeof Editor.pathRefs>;
    point: OmitFirstArg<typeof Editor.point>;
    pointRef: OmitFirstArg<typeof Editor.pointRef>;
    pointRefs: OmitFirstArg<typeof Editor.pointRefs>;
    positions: OmitFirstArg<typeof Editor.positions>;
    previous: <T extends Node>(
      options?: EditorPreviousOptions<T>
    ) => NodeEntry<T> | undefined;
    range: OmitFirstArg<typeof Editor.range>;
    rangeRef: OmitFirstArg<typeof Editor.rangeRef>;
    rangeRefs: OmitFirstArg<typeof Editor.rangeRefs>;
    start: OmitFirstArg<typeof Editor.start>;
    string: OmitFirstArg<typeof Editor.string>;
    unhangRange: OmitFirstArg<typeof Editor.unhangRange>;
    void: OmitFirstArg<typeof Editor.void>;
  }
  ```

  Note:

  - None of these method implementations have changed.
  - **`getMarks`** is an exception, as there is already **`editor.marks`** that stores the current marks.
  - **`Transforms.insertText`** has not been moved to **`editor`** yet: there is already an **`editor.insertText`** method with extended behavior. This may change in a future release, but this release is trying to avoid any breaking changes.
  - **`editor.insertText`** has a new argument (third): **`options?: TextInsertTextOptions`** to match **`Transforms.insertText`**.

  Bug Fixes:

  - Moving JSDoc's to the interface type to allow IDEs access to the interface methods.

### Patch Changes

- [#5396](https://github.com/ianstormtaylor/slate/pull/5396) [`bc945eb1`](https://github.com/ianstormtaylor/slate/commit/bc945eb12c612ef2688869d256416c8e37e32c07) Thanks [@Moerphy](https://github.com/Moerphy)! - Correct core normalization that could cause wrong nodes to be removed

## 0.93.0

### Minor Changes

- [#5374](https://github.com/ianstormtaylor/slate/pull/5374) [`b52e08b0`](https://github.com/ianstormtaylor/slate/commit/b52e08b0eafdcf1c77439e282c9dc89a4c72fbf1) Thanks [@12joan](https://github.com/12joan)! - - Add `isSelectable` to `editor` (default true). A non-selectable element is skipped over when navigating using arrow keys.
  - Add `ignoreNonSelectable` to `Editor.nodes`, `Editor.positions`, `Editor.after` and `Editor.before` (default false)
  - `Transforms.move` ignores non-selectable elements

* [#5374](https://github.com/ianstormtaylor/slate/pull/5374) [`b52e08b0`](https://github.com/ianstormtaylor/slate/commit/b52e08b0eafdcf1c77439e282c9dc89a4c72fbf1) Thanks [@12joan](https://github.com/12joan)! - - Add `isElementReadOnly` to `editor`. A read-only element behaves much like a void with regard to selection and deletion, but renders its `children` the same as any other non-void node.

## 0.91.4

### Patch Changes

- [#5311](https://github.com/ianstormtaylor/slate/pull/5311) [`0ac72a62`](https://github.com/ianstormtaylor/slate/commit/0ac72a626c41a9e259dc945b408d09367eca4b3f) Thanks [@zbeyens](https://github.com/zbeyens)! - Fix #5295 regression. `editor.shouldNormalize` new option: `initialDirtyPathsLength: number`

## 0.91.3

### Patch Changes

- [#5295](https://github.com/ianstormtaylor/slate/pull/5295) [`84f811a7`](https://github.com/ianstormtaylor/slate/commit/84f811a79c9b76050cb3dbe424efca3192cc44c6) Thanks [@zbeyens](https://github.com/zbeyens)! - New `editor` method that can be overridden to control when the normalization should stop. Default behavior (unchanged) is to throw an error when it iterates over 42 times the dirty paths length.

  ```ts
  shouldNormalize: ({
    iteration,
    dirtyPaths,
    operation,
  }: {
    iteration: number;
    dirtyPaths: Path[];
    operation?: Operation;
  }) => boolean;
  ```

  - `editor.onChange` signature change: `(options?: { operation?: Operation }) => void` where `operation` is triggering the function.
  - `editor.normalizeNode` signature change: `(entry: NodeEntry, options?: { operation?: Operation }) => void` where `operation` is triggering the function.
  - `EditorNormalizeOptions` new option `operation?: Operation` where `operation` is triggering the function.

## 0.91.1

### Patch Changes

- [#5251](https://github.com/ianstormtaylor/slate/pull/5251) [`6fa4b954`](https://github.com/ianstormtaylor/slate/commit/6fa4b954a5e4c67cff87d00b1253b2a838c0db94) Thanks [@YaoKaiLun](https://github.com/YaoKaiLun)! - Fix the cursor jump to an unexpected position after deleting in android

## 0.90.0

### Patch Changes

- [#5278](https://github.com/ianstormtaylor/slate/pull/5278) [`9c4097a2`](https://github.com/ianstormtaylor/slate/commit/9c4097a26fa92718e6f4fc1f984a70fb5af42ca2) Thanks [@kylemclean](https://github.com/kylemclean)! - Revert to using inline styles for default editor styles

## 0.88.1

### Patch Changes

- [#5235](https://github.com/ianstormtaylor/slate/pull/5235) [`36203b3f`](https://github.com/ianstormtaylor/slate/commit/36203b3f10fc1ee154923c7c75ce7912fec1e6f7) Thanks [@ppiotrowicz](https://github.com/ppiotrowicz)! - Fixed Editor.above method that always returned undefined with Point location

## 0.87.0

### Minor Changes

- [#5206](https://github.com/ianstormtaylor/slate/pull/5206) [`96b7fcdb`](https://github.com/ianstormtaylor/slate/commit/96b7fcdbf98a7c8908f5d9613d9898cb24a8ae47) Thanks [@kylemclean](https://github.com/kylemclean)! - Use stylesheet for default styles on Editable components

## 0.86.0

### Patch Changes

- [#5189](https://github.com/ianstormtaylor/slate/pull/5189) [`fbc9838f`](https://github.com/ianstormtaylor/slate/commit/fbc9838fd72e78bfa9af49013981939773dcca11) Thanks [@SmilinBrian](https://github.com/SmilinBrian)! - Add hanging option to unsetNodes so it matches setNodes

* [#5193](https://github.com/ianstormtaylor/slate/pull/5193) [`6909a8f7`](https://github.com/ianstormtaylor/slate/commit/6909a8f7da0f70b1ef3b5c3a665e8d0d09e6fa99) Thanks [@SmilinBrian](https://github.com/SmilinBrian)! - Stops Editor.unhangRange() from adjusting the range in some cases when it was not actually hanging

- [#5186](https://github.com/ianstormtaylor/slate/pull/5186) [`e416d00b`](https://github.com/ianstormtaylor/slate/commit/e416d00b6c95d05a1e10f738bfbbddd6cb940ab6) Thanks [@SmilinBrian](https://github.com/SmilinBrian)! - Report marks applied to a markableVoid if selection is collapsed

## 0.85.0

### Patch Changes

- [#5135](https://github.com/ianstormtaylor/slate/pull/5135) [`346f6572`](https://github.com/ianstormtaylor/slate/commit/346f6572fc8fdb6504bb18d8676f5bdeef7014eb) Thanks [@SmilinBrian](https://github.com/SmilinBrian)! - Allow void elements to receive marks via markableVoid()

* [#5168](https://github.com/ianstormtaylor/slate/pull/5168) [`3c49ff28`](https://github.com/ianstormtaylor/slate/commit/3c49ff28b3d188f69d8361bd682b7e8d0a1c13b6) Thanks [@i-artist](https://github.com/i-artist)! - Fixed above method that failed to get parentEntry when selection was range

## 0.84.0

### Minor Changes

- [#5137](https://github.com/ianstormtaylor/slate/pull/5137) [`a2184d86`](https://github.com/ianstormtaylor/slate/commit/a2184d86571cfd0d89beb67863c444a988174937) Thanks [@mainhanu](https://github.com/mainhanu)! - transform.delete and transform.insertFragment performance optimize

## 0.82.1

### Patch Changes

- [#5069](https://github.com/ianstormtaylor/slate/pull/5069) [`46d113fe`](https://github.com/ianstormtaylor/slate/commit/46d113fe1e102c87772681fdd90a086e37a3200d) Thanks [@krenzke](https://github.com/krenzke)! - Expose getDirtyPaths method on Editor object to allow for customization

## 0.82.0

### Patch Changes

- [#4988](https://github.com/ianstormtaylor/slate/pull/4988) [`fbab6331`](https://github.com/ianstormtaylor/slate/commit/fbab6331a5ecebd9e98c6c8c87d6f4b3b7c43bd0) Thanks [@BitPhinix](https://github.com/BitPhinix)! - Android input handling rewrite, replace composition insert prefixes with decoration based mark placeholders

## 0.81.3

### Patch Changes

- [#5042](https://github.com/ianstormtaylor/slate/pull/5042) [`11a93e65`](https://github.com/ianstormtaylor/slate/commit/11a93e65de4b197a43777e575caf13d7a05d5dc9) Thanks [@bryanph](https://github.com/bryanph)! - Upgrade next.js and source-map-loader packages

* [#5018](https://github.com/ianstormtaylor/slate/pull/5018) [`f13cd6b9`](https://github.com/ianstormtaylor/slate/commit/f13cd6b9180e18201b2a001b6f5d109218071319) Thanks [@ulion](https://github.com/ulion)! - Fix for insertFragment text/inline + block mixed fragments.

## 0.81.2

### Patch Changes

- [#5029](https://github.com/ianstormtaylor/slate/pull/5029) [`736662f8`](https://github.com/ianstormtaylor/slate/commit/736662f80838902f8560554fae704c13c5d8e227) Thanks [@hanagejet](https://github.com/hanagejet)! - fix: `Path.previous()` dose not working when path is `null`

## 0.81.1

### Patch Changes

- [#5015](https://github.com/ianstormtaylor/slate/pull/5015) [`9ae37287`](https://github.com/ianstormtaylor/slate/commit/9ae372875df1ee3ef6041f5d6bd2f57ee8291ea0) Thanks [@tithanayut](https://github.com/tithanayut)! - Fix deleteBackward behavior for Thai script where deleting N character(s) backward should delete N code point(s) instead of an entire grapheme cluster

## 0.81.0

### Minor Changes

- [#4999](https://github.com/ianstormtaylor/slate/pull/4999) [`fe13a8f9`](https://github.com/ianstormtaylor/slate/commit/fe13a8f9e750569342ee004951e34233ab6614bf) Thanks [@alexandercampbell](https://github.com/alexandercampbell)! - Add new Plite.Scrubber interface to allow scrubbing end user data from exception text. The default behavior remains unchanged.

## 0.80.0

### Minor Changes

- [#4892](https://github.com/ianstormtaylor/slate/pull/4892) [`d2fc25c3`](https://github.com/ianstormtaylor/slate/commit/d2fc25c3c31453597f59cd2ac6ba087a1beb1fe3) Thanks [@suilang](https://github.com/suilang)! - update insertText logic when selection is not collapsed

### Patch Changes

- [#5008](https://github.com/ianstormtaylor/slate/pull/5008) [`e9ea2815`](https://github.com/ianstormtaylor/slate/commit/e9ea2815950fc6b78fb0a2ba0e5d95c8553ac023) Thanks [@steve-codaio](https://github.com/steve-codaio)! - Revert to previous position behavior around inline voids

## 0.78.0

### Minor Changes

- [#4974](https://github.com/ianstormtaylor/slate/pull/4974) [`3b7a1bf7`](https://github.com/ianstormtaylor/slate/commit/3b7a1bf72d0c3951416c771f7f149bfbda411111) Thanks [@dylans](https://github.com/dylans)! - Added types for options and common string literals, thanks @JoshuaKGoldberg

## 0.77.2

### Patch Changes

- [#4952](https://github.com/ianstormtaylor/slate/pull/4952) [`9ce0a08c`](https://github.com/ianstormtaylor/slate/commit/9ce0a08c2a8b2b72df14141a06ca08825a66d472) Thanks [@steve-codaio](https://github.com/steve-codaio)! - Fix positions iteration when starting inside an inline void node

## 0.77.0

### Patch Changes

- [#4939](https://github.com/ianstormtaylor/slate/pull/4939) [`c39c8082`](https://github.com/ianstormtaylor/slate/commit/c39c8082a97dec8fc9ba64568d817ba87e348b48) Thanks [@ahoisl](https://github.com/ahoisl)! - Fix pointRef leaks caused by not unref'ing

## 0.76.1

### Patch Changes

- [#4914](https://github.com/ianstormtaylor/slate/pull/4914) [`aff67312`](https://github.com/ianstormtaylor/slate/commit/aff67312cbfa7e45df5cf6abcaec9f4f7d5f1a89) Thanks [@sennpang](https://github.com/sennpang)! - Fixed Triple click selection and copy&paste in read-only mode

## 0.76.0

### Minor Changes

- [#4873](https://github.com/ianstormtaylor/slate/pull/4873) [`20acca4b`](https://github.com/ianstormtaylor/slate/commit/20acca4bc8f31bd1aa6fbca2c49aaae5f31cadfe) Thanks [@bryanph](https://github.com/bryanph)! - A different behavior for inserting a soft break with shift+enter is quite common in rich text editors. Right now you have to do this in onKeyDown which is not so nice. This adds a separate insertSoftBreak method on the editor instance that gets called when a soft break is inserted. This maintains the current default behavior for backwards compatibility (it just splits the block). But at least you can easily overwrite it now.

  If you rely on overwriting editor.insertBreak for extra behavior for soft breaks this might be a breaking change for you and you should overwrite editor.insertSoftBreak instead.

### Patch Changes

- [#4912](https://github.com/ianstormtaylor/slate/pull/4912) [`43ca2b56`](https://github.com/ianstormtaylor/slate/commit/43ca2b56c8bd8bcc30dd38808dd191f804d53ae4) Thanks [@zhugexinxin](https://github.com/zhugexinxin)! - feat: add merge to setNodes and test

## 0.75.0

### Patch Changes

- [#4889](https://github.com/ianstormtaylor/slate/pull/4889) [`970523f`](https://github.com/ianstormtaylor/slate/commit/970523f881bf1918f91cb9de87c961dfb965e8a1)(https://github.com/ianstormtaylor/slate/commit/970523f881bf1918f91cb9de87c961dfb965e8a1) Thanks [@zhugexinxin](https://github.com/zhugexinxin)! - feat: add custom compare node props

## 0.73.1

### Patch Changes

- [#4858](https://github.com/ianstormtaylor/slate/pull/4858) [`33be22f3`](https://github.com/ianstormtaylor/slate/commit/33be22f3e3a0321ded199b13c0d97ae577c6b941) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Reverted #4804 as it triggered an exception when inserting text with multi-block selection

## 0.73.0

### Minor Changes

- [#4848](https://github.com/ianstormtaylor/slate/pull/4848) [`482b090e`](https://github.com/ianstormtaylor/slate/commit/482b090e6f6f4c5fbc85e6dd2ea65387156ae8b5) Thanks [@rockettomatooo](https://github.com/rockettomatooo)! - fix point transform for insert_text operations to account for affinity

## 0.72.8

### Patch Changes

- [#4804](https://github.com/ianstormtaylor/slate/pull/4804) [`03861afc`](https://github.com/ianstormtaylor/slate/commit/03861afc62c3b27339d20151ca8a3e52f51ff973) Thanks [@suilang](https://github.com/suilang)! - update insertText logic when selection is not collapsed

## 0.72.3

### Patch Changes

- [#4703](https://github.com/ianstormtaylor/slate/pull/4703) [`205d4b7e`](https://github.com/ianstormtaylor/slate/commit/205d4b7e66b30ec911e8968a736593aaf2be1567) Thanks [@e1himself](https://github.com/e1himself)! - Add tests for Editor.unhangRange() behavior

## 0.72.2

### Patch Changes

- [#4729](https://github.com/ianstormtaylor/slate/pull/4729) [`ab62da20`](https://github.com/ianstormtaylor/slate/commit/ab62da2064921f534ce158f20cd853d2d904f6f6) Thanks [@ahoisl](https://github.com/ahoisl)! - chore: add vscode launch.json debug config

* [#4735](https://github.com/ianstormtaylor/slate/pull/4735) [`e5427ddd`](https://github.com/ianstormtaylor/slate/commit/e5427dddfc57b4362b7545e9971cdfb9b05d5c3d) Thanks [@steve-codaio](https://github.com/steve-codaio)! - Optimize path transforms during normalization

## 0.72.0

### Patch Changes

- [#4708](https://github.com/ianstormtaylor/slate/pull/4708) [`2fc7ad92`](https://github.com/ianstormtaylor/slate/commit/2fc7ad924cfbb75de59f685eeabb0375769201b9) Thanks [@bryanph](https://github.com/bryanph)! - Allow `Operation` type to be extended

  For example:

  ```
  import type { BaseOperation } from 'plitejs'

  type CustomOperation =
   | BaseOperation
   | YourCustomOperation
   | AnotherCustomOperation

  declare module 'plitejs' {
    interface CustomTypes {
      Operation: CustomOperation;
    }
  }
  ```

## 0.71.0

### Minor Changes

- [#4672](https://github.com/ianstormtaylor/slate/pull/4672) [`2523dc4f`](https://github.com/ianstormtaylor/slate/commit/2523dc4f6e7fee81baf77a67da4c3adaab921f15) Thanks [@VictorBaron](https://github.com/VictorBaron)! - Fix - deep-equals was always returning true when array props were equals.

### Patch Changes

- [#4671](https://github.com/ianstormtaylor/slate/pull/4671) [`e3afda94`](https://github.com/ianstormtaylor/slate/commit/e3afda946685795237f748e76c7bb051c09cb7fa) Thanks [@unageek](https://github.com/unageek)! - Fixed the issue where the cursor jumps more than one character unexpectedly

## 0.70.0

### Minor Changes

- [#4565](https://github.com/ianstormtaylor/slate/pull/4565) [`5818aca5`](https://github.com/ianstormtaylor/slate/commit/5818aca5038f38465a5769fe944f184be0255341) Thanks [@oliger](https://github.com/oliger)! - Fix issue with unicode 1.1 smileys followed by a variation selector.

### Patch Changes

- [#4638](https://github.com/ianstormtaylor/slate/pull/4638) [`e0f41514`](https://github.com/ianstormtaylor/slate/commit/e0f41514a1e0e866297904be16eff82702e8afd8) Thanks [@e1himself](https://github.com/e1himself)! - Improve typescript type of `props` argument of `Transforms.setNodes()`

## 0.67.1

### Patch Changes

- [#4578](https://github.com/ianstormtaylor/slate/pull/4578) [`67badb7d`](https://github.com/ianstormtaylor/slate/commit/67badb7dd03c6d36d31b90689247553c0386d771) Thanks [@jameshfisher](https://github.com/jameshfisher)! - Allow typing at the end of inline elements

## 0.66.5

### Patch Changes

- [#4552](https://github.com/ianstormtaylor/slate/pull/4552) [`37d60c58`](https://github.com/ianstormtaylor/slate/commit/37d60c58b8d4fb844f31888b518be6c2a01fb110) Thanks [@clauderic](https://github.com/clauderic)! - Only apply Firefox `toPlitePoint()` offset fix when the cloned contents end in `\n\n` instead of just `\n`.

## 0.66.2

### Patch Changes

- [#4523](https://github.com/ianstormtaylor/slate/pull/4523) [`0da12c17`](https://github.com/ianstormtaylor/slate/commit/0da12c17dc0484f065af2a270d352593a65c1577) Thanks [@steve-codaio](https://github.com/steve-codaio)! - Fix setNodes when called with 'split' and a collapsed range

## 0.66.1

### Patch Changes

- [#4518](https://github.com/ianstormtaylor/slate/pull/4518) [`6ec399d4`](https://github.com/ianstormtaylor/slate/commit/6ec399d4db60f1a8d59268c333b43a26dc518b79) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Fixed flaw in deep-equal algorithm when dealing with nested mark objects

* [#4511](https://github.com/ianstormtaylor/slate/pull/4511) [`2af6868d`](https://github.com/ianstormtaylor/slate/commit/2af6868d41b8d797eebdcba5edb18638fe62fd45) Thanks [@dylans](https://github.com/dylans)! - update release process for yarn 3

- [#4516](https://github.com/ianstormtaylor/slate/pull/4516) [`59ca7a8f`](https://github.com/ianstormtaylor/slate/commit/59ca7a8f518c7735c89148ff1d9a8ae9dcf4297f) Thanks [@dylans](https://github.com/dylans)! - another attempt to get the automated changeset workflow working again

## 0.66.0

### Minor Changes

- [#4489](https://github.com/ianstormtaylor/slate/pull/4489) [`1b560de3`](https://github.com/ianstormtaylor/slate/commit/1b560de3e13d08cdc95d7f659a497ff0f07d296a) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - Fix paste to empty node losing structure of first block

* [#4326](https://github.com/ianstormtaylor/slate/pull/4326) [`00259003`](https://github.com/ianstormtaylor/slate/commit/0025900349b2c2ff92c044b97389969fa32a9200) Thanks [@oliger](https://github.com/oliger)! - Add support for [flag](https://emojipedia.org/emoji-flag-sequence/), [keycap](https://emojipedia.org/emoji-keycap-sequence/) and [tag](https://emojipedia.org/emoji-tag-sequence/) unicode sequences.

- [#4276](https://github.com/ianstormtaylor/slate/pull/4276) [`6f47cbbe`](https://github.com/ianstormtaylor/slate/commit/6f47cbbe0d8f320be8baf02a6e26d756d226cfca) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Switched from `fast-deep-equal` to a custom deep equality check. This restores the ability for text nodes with mark values set to `undefined` to merge with text nodes missing those keys.

* [#4431](https://github.com/ianstormtaylor/slate/pull/4431) [`55ff8f00`](https://github.com/ianstormtaylor/slate/commit/55ff8f00e46e5fd0f2aef41da321c02b6d3a0f70) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Fixed regression in #4208 where normalization on empty block nodes could not be overridden

- [#3820](https://github.com/ianstormtaylor/slate/pull/3820) [`c6203a2d`](https://github.com/ianstormtaylor/slate/commit/c6203a2d682325e550d4f4b9fc3ee3ca3429e466) Thanks [@githoniel](https://github.com/githoniel)! - unwrapNode call liftNode in reverse order to keep nested block

* [#4428](https://github.com/ianstormtaylor/slate/pull/4428) [`b47d3fd1`](https://github.com/ianstormtaylor/slate/commit/b47d3fd191c6b76585898ec9b8c490f15dcff2da) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Don't set `null` in `set_node`'s `newProperties` object when using `Transforms.unsetNodes()`

### Patch Changes

- [#4132](https://github.com/ianstormtaylor/slate/pull/4132) [`48b71294`](https://github.com/ianstormtaylor/slate/commit/48b7129447347c9cf7a0535026287896ef59779b) Thanks [@ulion](https://github.com/ulion)! - Make onDomSelectionChange trigger after onClick.

* [#4500](https://github.com/ianstormtaylor/slate/pull/4500) [`50bb3d7e`](https://github.com/ianstormtaylor/slate/commit/50bb3d7e32d640957018831526235ca656963f1d) Thanks [@tubbo](https://github.com/tubbo)! - Upgrade `is-plain-object` to v5.0.0

- [#4482](https://github.com/ianstormtaylor/slate/pull/4482) [`dd752df1`](https://github.com/ianstormtaylor/slate/commit/dd752df11dc90da6bd6add88d1cfa6f00f03912b) Thanks [@Jokcy](https://github.com/Jokcy)! - Fix cursor not correct issue after insert multiple nodes with `Transform.insertNodes`

* [#4296](https://github.com/ianstormtaylor/slate/pull/4296) [`479a7591`](https://github.com/ianstormtaylor/slate/commit/479a759108bc0f903715e08d542307566b077227) Thanks [@kellyjosephprice](https://github.com/kellyjosephprice)! - Fix mergeNodes moving node into parent sibling

- [#4458](https://github.com/ianstormtaylor/slate/pull/4458) [`95c759a1`](https://github.com/ianstormtaylor/slate/commit/95c759a19c1e057bbc99148867298a73b014831d) Thanks [@taj-codaio](https://github.com/taj-codaio)! - Normalization now removes empty text nodes after nonempty nodes with differing styles, but before inline nodes.

* [#4505](https://github.com/ianstormtaylor/slate/pull/4505) [`269e59c9`](https://github.com/ianstormtaylor/slate/commit/269e59c93aea31cdb438e9cc07d34cec0e482798) Thanks [@dylans](https://github.com/dylans)! - Immer 9 security update, refactor to support immer 9 API changes

## 0.65.3

### Patch Changes

- [#4253](https://github.com/ianstormtaylor/slate/pull/4253) [`0214b630`](https://github.com/ianstormtaylor/slate/commit/0214b630778e7fa3b6ebcdf6cd9a8e4cf7351bd3) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Fix `Transforms.wrapNodes` crashing when the `match` function matched only the editor

* [#4049](https://github.com/ianstormtaylor/slate/pull/4049) [`6c844227`](https://github.com/ianstormtaylor/slate/commit/6c8442272105ec78b88d38efecb7aab9bb4e41de) Thanks [@ulion](https://github.com/ulion)! - Fix ios chrome ime double input issue.

- [#4421](https://github.com/ianstormtaylor/slate/pull/4421) [`237edc6e`](https://github.com/ianstormtaylor/slate/commit/237edc6ea616c9171611e632e146872a245bdb0e) Thanks [@jaked](https://github.com/jaked)! - fix decorate bug (#4277) without adding extra layers of render tree

* [#4349](https://github.com/ianstormtaylor/slate/pull/4349) [`236754c4`](https://github.com/ianstormtaylor/slate/commit/236754c4d2811d50f8e116cfd5de8d7619553cd9) Thanks [@imdbsd](https://github.com/imdbsd)! - Add isElementType utility to Element interface

## 0.63.0

### Minor Changes

- [#4230](https://github.com/ianstormtaylor/slate/pull/4230) [`796389c7`](https://github.com/ianstormtaylor/slate/commit/796389c7d3d9cead1493abcba6c678cb9dfa979f) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Applying invalid `insert_node` operations will now throw an exception for all invalid paths, not just invalid parent paths.

### Patch Changes

- [#4245](https://github.com/ianstormtaylor/slate/pull/4245) [`b33a531b`](https://github.com/ianstormtaylor/slate/commit/b33a531bd0395ecb23bd9fd1ac1cd1c3b31f92ca) Thanks [@JonasKruckenberg](https://github.com/JonasKruckenberg)! - Removed lodash dependecy to reduce bundled footprint

* [#4208](https://github.com/ianstormtaylor/slate/pull/4208) [`feb293aa`](https://github.com/ianstormtaylor/slate/commit/feb293aaa2c02fe3ad319bd021e66908ee770a6e) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Fix `Error: Cannot get the start point in the node at path [...] because it has no start text node` caused by normalizing a document where some elements have no children

- [#4230](https://github.com/ianstormtaylor/slate/pull/4230) [`796389c7`](https://github.com/ianstormtaylor/slate/commit/796389c7d3d9cead1493abcba6c678cb9dfa979f) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Exceptions in `editor.apply()` and `Editor.withoutNormalizing()` will no longer leave the editor in an invalid state

* [#4227](https://github.com/ianstormtaylor/slate/pull/4227) [`e6413d46`](https://github.com/ianstormtaylor/slate/commit/e6413d46256f6fc60549974242d3ff6ba61e2968) Thanks [@ulion](https://github.com/ulion)! - Fixed a bug that would allow multiple changes to be scheduled at the same time.

## 0.62.1

### Patch Changes

- [#4193](https://github.com/ianstormtaylor/slate/pull/4193) [`fd70dc0b`](https://github.com/ianstormtaylor/slate/commit/fd70dc0b2c0d06edb9490874fb831161b9759cba) Thanks [@beorn](https://github.com/beorn)! - Fixed insert and remove text operations to no-op without any text.

* [#4078](https://github.com/ianstormtaylor/slate/pull/4078) [`2dad21d1`](https://github.com/ianstormtaylor/slate/commit/2dad21d1d75750e7148b10bdea3ce921a79cbf33) Thanks [@TheSpyder](https://github.com/TheSpyder)! - Fixed inversion of `set_node` operations that delete properties on nodes.

- [#4168](https://github.com/ianstormtaylor/slate/pull/4168) [`95f402c5`](https://github.com/ianstormtaylor/slate/commit/95f402c59414331b2eeca9a19bd2c73c0ab6cd6c) Thanks [@ridhambhat](https://github.com/ridhambhat)! - Fixed a bug in splitting and applying overlapping marks to text nodes.

## 0.62.0

### Minor Changes

- [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - **Updated `Text.equals` to deeply compare text node properties.** Previously it only did a shallow comparison, but this made it harder to keep track of more complex data structures at the text level.

* [#4154](https://github.com/ianstormtaylor/slate/pull/4154) [`7283c51f`](https://github.com/ianstormtaylor/slate/commit/7283c51feb83cb8522bc16efce09bb01c29400b9) Thanks [@ianstormtaylor](https://github.com/ianstormtaylor)! - **Start using [🦋 Changesets](https://github.com/atlassian/changesets) to manage releases.** Going forward, whenever a pull request is made that fixes or adds functionality to Plite, it will need to be accompanied by a changset Markdown file describing the change. These files will be automatically used in the release process when bump the versions of Plite and compiling the changelog.

- [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - **Added support for custom selection properties.** Previously you could set custom properties on the selection objects but it was not a fully supported feature because there was no way to delete them later. Now custom properties are officially supported and deleting them once set is possible.

### Patch Changes

- [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - Fixed `move_node` operations to normalize the node in question.

* [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - Added memoization logic to `Node.isNodeList` and `Editor.isEditor` to speed up common code paths.

- [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - Fixed a bug when merging deeply nested multi-child nodes.

* [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - Fixed a bug when deleting a hanging range with a trailing void block node.

- [`c6002024`](https://github.com/ianstormtaylor/slate/commit/c60020244b9d25094edb0ffcca8b49dead9b31dc) - Fixed a bug in `Editor.positions` which caused it to sometimes skip positions in text nodes that were segmented across inlines or marks.
