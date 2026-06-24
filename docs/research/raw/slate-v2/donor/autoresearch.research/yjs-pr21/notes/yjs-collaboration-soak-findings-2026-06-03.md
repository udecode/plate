# Yjs Collaboration Bug Reproductions

All reproductions target `/examples/yjs-collaboration`.
Run each step as a visible browser action and wait for the editor to settle after each action.

## 1. Offline split undo plus remote split duplicates right text

Steps:

1. Peer A `Offline`
2. Peer A `Split`
3. Peer A `Undo`
4. Peer B `Split`
5. Peer A `Online`

Expected:

- All peers converge to `["Hello ", "world!"]`.

Observed:

- All peers converge to `["Hello world!", "world!"]`.

Redo variant:

1. Peer A `Offline`
2. Peer A `Split`
3. Peer A `Undo`
4. Peer B `Insert !`
5. Peer B `Split`
6. Peer A `Online`
7. Peer A `Redo`

Expected:

- All peers converge to `["Hello ", "world!!"]`.

Observed:

- All peers converge to `["Hello ", "world!", "world!!"]`.

## 2. Structural mix crashes with a Slate/Yjs text-path mismatch

Steps:

1. Peer A `Offline`
2. Peer A `Unset Role`
3. Peer D `Lift`
4. Peer A `Down`
5. Peer D `Wrap`
6. Peer A `Down`
7. Peer B `Unwrap`

Expected:

- The editors remain mounted.
- All peers can reconnect and converge.

Observed:

- Page error: `Slate point does not target a Y.XmlText.`
- Console error: `Cannot get the leaf node at path [0,0] because it refers to a non-leaf node`.
- Editor root count becomes `0`.

## 3. Structural edits produce nested paragraph DOM

Steps:

1. Peer A `Wrap`
2. Peer C `Append`
3. Peer A `Split`
4. Peer C `Down`
5. Peer C `Merge`

Expected:

- No paragraph is rendered inside another paragraph.

Observed:

- Console error: `In HTML, <p> cannot be a descendant of <p>.`
- Console error: `<p> cannot contain a nested <p>.`
- DOM evidence:
  - outer paragraph: `data-slate-path="0"`
  - nested paragraph: `data-slate-path="0,1"`

## 4. Structural edits produce placeholder div inside paragraph

Steps:

1. Peer A `Split`
2. Peer C `Delete`
3. Peer C `Set Role`
4. Peer D `Reconcile`
5. Peer C `Redo` if enabled; otherwise skip
6. Peer D `Back`
7. Peer A `Online`
8. Peer C `Remove`

Expected:

- Empty-text placeholder rendering does not create invalid HTML under a paragraph.

Observed:

- Console error: `In HTML, <div> cannot be a descendant of <p>.`
- Console error: `<p> cannot contain a nested <div>.`
- The nested `div` is the Slate placeholder rendered for an empty text block inside a paragraph.

## 5. Root can have no start text node

Steps:

1. Peer A `Offline`
2. Peer A `Merge`
3. Peer D `Split`
4. Peer A `Wrap`
5. Peer C `Split`
6. Peer A `Delete`
7. Peer C `Move`
8. Peer A `Wrap`
9. Peer D `Split`
10. Peer A `Online`

Expected:

- `Editor.point([], { edge: "start" })` can find a text node.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the start point in the node at path [] because it has no start text node.`
- The page loses all editor roots afterward.

## 6. Root can have no end text node

Steps:

1. Peer B `Insert !`
2. Peer A `Back`
3. Peer B `Undo`
4. Peer C `Insert Fragment`
5. Peer C `Offline`
6. Peer D `Split`
7. Peer D `Unwrap`
8. Peer A `Move`
9. Peer A `Back`
10. Peer D `Merge`
11. Peer B `Redo`
12. Peer C `Unset Role`
13. Peer D `Delete`

Expected:

- `Editor.point([], { edge: "end" })` can find a text node.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the end point in the node at path [] because it has no end text node.`
- The next browser action can be blocked by the Next error overlay.

## 7. Leaf path points to a paragraph after structural mix seed 42

Steps:

1. Peer B `Offline`
2. Peer B `Wrap`
3. Peer C `Split`
4. Peer B `Down`

Expected:

- The leaf path used by selection/render reads points to a text leaf.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the leaf node at path [1,0] because it refers to a non-leaf node`.
- The non-leaf node is a paragraph containing `Hello world!`.
- Editor root count becomes `0`.

## 8. Leaf path points to a paragraph after random control seed 42

Steps:

1. Peer B `Insert !`
2. Peer C `Wrap`
3. Peer B `Append`
4. Peer B `Split`
5. Peer D `Reconcile`
6. Peer D `Move`
7. Peer C `Remove`
8. Peer C `Insert !`
9. Peer A `Online`
10. Peer D `Offline`
11. Peer C `Merge`
12. Peer C `Unwrap`
13. Peer D `Remove`

Expected:

- The leaf path used by selection/render reads points to a text leaf.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the leaf node at path [0,0] because it refers to a non-leaf node`.
- The non-leaf node is a paragraph containing `Hello wo`.
- Editor root count becomes `0`.

## 9. Leaf path points to nested block structure after structural mix seed 43

Steps:

1. Peer B `Offline`
2. Peer B `Insert Fragment`
3. Peer A `Split`
4. Peer B `Wrap`
5. Peer D `Lift`
6. Peer B `Wrap`
7. Peer C `Append`
8. Peer B `Down`

Expected:

- The leaf path used by selection/render reads points to a text leaf.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the leaf node at path [0]` or `[1]` because it refers to a non-leaf node.
- The non-leaf node is a nested block structure, including block quotes and paragraph text like `Hello world!Lin fragment`.
- Editor root count becomes `0`.

## 10. Leaf path points to role title paragraph after structural mix seed 46

Steps:

1. Peer B `Offline`
2. Peer B `Set Role`
3. Peer A `Merge`
4. Peer B `Wrap`
5. Peer A `Insert !`
6. Peer B `Merge`

Expected:

- The leaf path used by selection/render reads points to a text leaf.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the leaf node at path [0,0] because it refers to a non-leaf node`.
- The non-leaf node is a paragraph with `role: "title"`.
- Editor root count becomes `0`.

## 11. Leaf path points to a paragraph after structural mix seed 49

Steps:

1. Peer B `Offline`
2. Peer B `Merge`
3. Peer C `Move`
4. Peer B `Wrap`
5. Peer A `Move`
6. Peer B `Unset Role`

Expected:

- The leaf path used by selection/render reads points to a text leaf.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the leaf node at path [0,0] because it refers to a non-leaf node`.
- The non-leaf node is a paragraph.
- Editor root count becomes `0`.

## 12. Leaf path points to a block quote after structural mix seed 55

Steps:

1. Peer B `Offline`
2. Peer B `Wrap`
3. Peer A `Move`
4. Peer B `Wrap`
5. Peer A `Insert !`
6. Peer B `Merge`
7. Peer C `Merge`

Expected:

- The leaf path used by selection/render reads points to a text leaf.
- The editor remains mounted.

Observed:

- Console error: `Cannot get the leaf node at path [0,0] because it refers to a non-leaf node`.
- The non-leaf node is a `block-quote` containing a paragraph.
- Editor root count becomes `0`.

## 13. Random structural edits lose a Yjs path lookup

Steps:

1. Peer B `Insert !`
2. Peer C `Wrap`
3. Peer B `Append`
4. Peer B `Split`
5. Peer D `Reconcile`
6. Peer D `Move`
7. Peer C `Remove`
8. Peer C `Insert !`
9. Peer A `Online`
10. Peer D `Offline`
11. Peer C `Merge`
12. Peer C `Unwrap`

Expected:

- Every Slate path produced by the structural edits maps to a Yjs node.

Observed:

- Page error: `No Yjs node at path 1.0`.
- The next browser action can be blocked by the Next error overlay.

## 14. Yjs path lookup failure repeat from random seed 96

Steps:

1. Peer B `Reconcile`
2. Peer C `Wrap`
3. Peer B `Delete`
4. Peer C `Set Role`
5. Peer B `Split`
6. Peer B `Move`
7. Peer B `Unwrap`

Expected:

- Every Slate path produced by the structural edits maps to a Yjs node.

Observed:

- Page error: `No Yjs node at path 1.0`.

## 15. Yjs path lookup failure repeat from random seed 115

Steps:

1. Peer B `Undo` if enabled; otherwise skip
2. Peer C `Online`
3. Peer A `Unset Role`
4. Peer D `Reconcile`
5. Peer A `Wrap`
6. Peer D `Move`
7. Peer D `Insert Fragment`
8. Peer B `Split`
9. Peer B `Insert !`
10. Peer C `Unset Role`
11. Peer D `Unwrap`

Expected:

- Every Slate path produced by the structural edits maps to a Yjs node.

Observed:

- Page error: `No Yjs node at path 1.0`.
