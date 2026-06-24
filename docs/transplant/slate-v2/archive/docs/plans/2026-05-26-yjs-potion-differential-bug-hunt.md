# Yjs Potion differential bug hunt

## Goal

Find Slate Yjs collaboration bugs by comparing local `yjs-collaboration` behavior against Potion. Do not fix code in this pass.

## Scope

- Local target: `http://localhost:3100/examples/yjs-collaboration`
- Reference target: Potion shared document in persistent debug Chrome
- Method: run local suspicious cases first, then verify mismatches in Potion using per-page CDP offline for B only.

## High-risk matrix

1. Offline text merge + remote text edit + reconnect + undo.
2. Offline split + remote text edit + reconnect + undo.
3. Offline remove block + remote text edit + reconnect + undo/redo.
4. Offline move block + remote text edit + reconnect + undo/redo.
5. Offline mark/format + remote text edit + reconnect + undo.
6. Offline replace selection + remote text edit + reconnect + undo.
7. Awareness/presence cleanup across disconnect/reconnect.

## Running findings

- Local harness: temporary Playwright sweep against `http://localhost:3100/examples/yjs-collaboration`.
- Potion harness: `dev-browser --connect http://127.0.0.1:9222`, two tabs on `https://potion.platejs.org/SwJVGfk1f913PJc7`, B-only CDP offline.

### Confirmed bugs by Potion mismatch

1. `split_node` concurrent remote insert is rebased to the start of the document locally.
   - Setup: `alphabeta`.
   - B offline: caret at offset 5, `Enter` -> `alpha` / `beta`.
   - A online inserts `!` at offset 2, 5, or 7.
   - Local after reconnect: always `!alpha` / `beta`.
   - Potion after reconnect:
     - offset 2: `al!pha` / `beta`
     - offset 5: `alpha!` / `beta`
     - offset 7: `alpha!` / `beta`
   - Local undo preserves the misplaced insert as `!alphabeta`; Potion undo restores the insert at its original logical position.
2. Offline split-at-end + type has different undo grouping from Potion.
   - Setup: `alpha`.
   - B offline: caret at end, `Enter`, type `beta`.
   - A online inserts `!` at end of `alpha`.
   - Reconnect converges in both: `alpha!` / `beta`.
   - B undo locally: `alpha!` plus an empty paragraph.
   - B undo in Potion: single paragraph `alpha!`.

### Same as Potion / not currently a bug by this oracle

- Offline remove-node equivalent via deleting the second paragraph, while A edits the deleted paragraph: both Potion and local lose the concurrent `!`; undo restores `beta` without `!`.
- Offline user replace while A inserts text: both Potion and local converge to the replacing snapshot; undo restores `alpha`.
- Offline bold first word while A inserts at the bold boundary: both Potion and local make `!` bold after reconnect; undo removes bold and keeps `!`.

### Suspicious but not Potion-verified

- Local offline move of the second block to top while A edits the moved block drops A's `!` after reconnect. Potion drag automation did not trigger a block move, so this is not promoted to confirmed bug yet.
