# platejs

## 54.0.0-beta.3

### Patch Changes

- [`24651f9`](https://github.com/udecode/plate/commit/24651f9a8b2b18aa4c688372f5439939140c77d2) by [@zbeyens](https://github.com/zbeyens) –

  - Fix Backspace or Delete that empties a heading turning it into a paragraph. The empty heading stays, and the next Backspace turns it into a paragraph.
  - Fix Turn into Quote, the blockquote shortcut and `editor.plugin(BlockquotePlugin).update.wrap()` putting each selected block in its own blockquote. Adjacent selected blocks now share one blockquote.

- [`c28d5ad`](https://github.com/udecode/plate/commit/c28d5adcbac04d8bc5866e9556f2089fef3620e3) by [@zbeyens](https://github.com/zbeyens) –

  - Fix the AI menu's first edit suggestion replacing the old selected text, and leaving stray characters, when you typed inside the selection after sending the request

- [`5716f93`](https://github.com/udecode/plate/commit/5716f93ccf30dd1cbefc9d523947ca7bcb7716b8) by [@zbeyens](https://github.com/zbeyens) –

  - Keep `AIChatPlugin`'s preview and pending proposal when a transaction guard refuses its write. `accept`, `insertBelow` and `replaceSelection` close the session only once their write commits.
  - Return `{ status: 'invalid' }` from `hide`, `reset`, `show`, `submit` and `reload`, and keep the session, when a guard refuses discarding the pending proposal.
  - Keep a streamed proposal when a guard refuses a chunk, and add the next chunk to the same undo step.

- [`0fe05e3`](https://github.com/udecode/plate/commit/0fe05e37d756fc10b2a2465de1fb823b64e4a876) by [@zbeyens](https://github.com/zbeyens) –

  - Paste text or a link onto a focused board to add it as a selected note at the pointer, or at the view's center when the pointer is off the board. One undo removes it.
  - Paste or drop picture files onto a board to upload them as image shapes, in a row centered on the pointer or the drop point.
  - Upload the file of a picture copied from a web page when its link does not load, so the picture still lands on the board.
  - Add `upload(files)` to `useBoardActions()` to upload picture files, such as ones from a toolbar's file picker. Read `takesPictureFiles` through `useBoardView` to disable that button on a board that takes no picture files.
  - Add `fitsAfter(key)` to the upload plugin's API to ask whether another file's placeholder fits after an upload placeholder, such as before a file picker opens for several files.

- [`75b505a`](https://github.com/udecode/plate/commit/75b505a6a29c0e91cfdf08b2a65b126dd5a5cc2c) by [@zbeyens](https://github.com/zbeyens) –

  - Fix board pen lines, geo shapes and notes whose type an app renames through `schema.override`. They now draw, erase, take the toolbar's styles and get announced like shapes of the default type.

- [`83517ee`](https://github.com/udecode/plate/commit/83517ee62917c69f51a3c71da24629295e06862b) by [@zbeyens](https://github.com/zbeyens) –

  - Add `read.board.strokePath(id)`, which returns the SVG path a board draws for a pen line, or `null` when `id` names no pen line. It needs no mounted board.
  - Move `BoardStrokePath` from `platejs/board/react` to `platejs/board`. Import it from `platejs/board`.

- [`972c50f`](https://github.com/udecode/plate/commit/972c50f6006c6681013def2d1d5b43e807e019a2) by [@zbeyens](https://github.com/zbeyens) –

  - Add a `caret` plugin slot, rendered after the Editable, for UI that follows the caret. Inside it, `useEditor()` and the `editableRef` prop answer for the view that holds the caret, such as a board note, so a floating toolbar in this slot follows the caret into the note.
  - Remove `EditorSelectionView` and the `useSelectionView` hook from `platejs/react`.

  **Migration:** Drop the `<EditorSelectionView>` wrapper. Move UI that used it inside an editing area, such as a floating toolbar, from `afterEditable` to the `caret` slot:

  ```tsx
  const FloatingToolbarPlugin = definePlugin('floatingToolbar', {
    slots: { caret: () => <FloatingToolbar /> },
  });
  ```

- [`f7fa388`](https://github.com/udecode/plate/commit/f7fa388cfbdc2cf18d132c8f71e6074d2174dc7c) by [@zbeyens](https://github.com/zbeyens) –

  - Keep a code fence's info string after its language, such as `title="a.ts" {3-5}`, as the code block's `meta` through Markdown and HTML import and export

- [`eff0999`](https://github.com/udecode/plate/commit/eff0999e8ba281964882aa5f776c7fc04d0f68c1) by [@zbeyens](https://github.com/zbeyens) –

  - Fix a CodeMirror code block dropping the next keystroke, paste, cut or drop when the editor resets its text during an input method composition, such as after a refused edit or a collaborator's change.
  - Keep a CodeMirror code block's caret where the editor puts it when the editor resets its text.
  - Fix a CodeMirror code block turning into a paragraph in WebKit browsers when an input method empties it.

- [`9d460d1`](https://github.com/udecode/plate/commit/9d460d1776362a155e087a674fcdca24bd5c6021) by [@zbeyens](https://github.com/zbeyens) –

  - Fix Enter in the empty last body line of an open Details moving the caret into the block after it. Enter now adds an empty paragraph right after the Details and puts the caret there.

- [`8883a26`](https://github.com/udecode/plate/commit/8883a26aa151182dc884f24a9818ff1c3f2e5272) by [@zbeyens](https://github.com/zbeyens) –

  - Report `condition-loop` on each field of a loop of conditions, such as A naming B while B names A, and refuse an `update` whose condition would close one.
  - Refuse a `fieldId` in the settings of `insert` or the patch of `update`.
  - Check a condition that names its own field against the kind the same `update` sets.
  - List the page's fields in `read.fields()` from a board note's view, in reading order.

- [`839996e`](https://github.com/udecode/plate/commit/839996e5e21a0309f9c079602d03d8a9c0faece4) by [@zbeyens](https://github.com/zbeyens) –

  - Add `fillRole` to `BaseFieldPlugin`'s state. While it is set, the editor refuses every local change except a fitting or cleared value on that role's fields, and undo or redo returns `blocked` at a step that changed anything else.
  - Start a new undo step when a field write's role differs from the step before it, so a fill never shares an undo step with an author's edit.
  - Refuse the whole update instead of throwing when, while a fill role is set, `update` names a field that no longer exists or a value that no longer fits it.

- [`5c0aff5`](https://github.com/udecode/plate/commit/5c0aff5d261697b1e237946af31fc5230ad72247) by [@zbeyens](https://github.com/zbeyens) – Add `editor.plugin(BaseHeadingPlugin).read.canSetLevel(level)`, which answers whether `setLevel(level)` can apply to every selected block. A menu can disable a heading level the caret's parent cannot hold.

- [`868638a`](https://github.com/udecode/plate/commit/868638ac2fe89fc0d7988d0e53db2cda6245c9a5) by [@zbeyens](https://github.com/zbeyens) – Fix a hydration mismatch in a control that reads `useEditorFocused()` and hydrates after its editor took focus, such as a toolbar behind `Suspense` beside an `EditorContent` with `autoFocus`

- [`7a0e402`](https://github.com/udecode/plate/commit/7a0e402a17374c80d3c16537a6c2988ffb28949f) by [@zbeyens](https://github.com/zbeyens) – Replace `InkLayer` with `InkContent`, which mounts as the ink plugin's `wrapContent` slot. In development, it throws when anything sits between the Editable and the ink layer, such as a toolbar the layer would cover.

  **Migration:** Replace the `wrapContent` slot that rendered `<InkLayer sign={Sign} />` after its children with `wrapContent: (props) => <InkContent {...props} sign={Sign} />`.

- [`405fd82`](https://github.com/udecode/plate/commit/405fd82c363be236baba67a96033653dd735683b) by [@zbeyens](https://github.com/zbeyens) – Keep a pen mark's sign where its block stood when the block is deleted while the mark is being drawn, here or by a collaborator, however many other edits come before the mark saves

- [`0938c3d`](https://github.com/udecode/plate/commit/0938c3d8da13cf94bf8e7bcee15731b73f0ca2a2) by [@zbeyens](https://github.com/zbeyens) – Save pen marks in a packed format about half the size. Marks saved by 54.0.0-beta.2 still read, but an app still on 54.0.0-beta.2 shows none of the marks this version saves

- [`dffae16`](https://github.com/udecode/plate/commit/dffae16cdf7e17595560985bbbca0982b69e5ecd) by [@zbeyens](https://github.com/zbeyens) – Fix ink marks left off their words after a style change moves the words without resizing the paragraph. Marks now place again a quarter second after the last edit, layout change or scroll

- [`7bc3175`](https://github.com/udecode/plate/commit/7bc3175013df3e0a08e41c5852c3014dcea1043f) by [@zbeyens](https://github.com/zbeyens) – Speed up typing, drawing, scrolling and deleting many marked blocks in documents with many ink marks. `read.marks()` keeps each unchanged mark's object between reads.

- [`6d7c412`](https://github.com/udecode/plate/commit/6d7c41251cab3bd08f73fc5a1f40372c7cd238a8) by [@zbeyens](https://github.com/zbeyens) – Leave out the ink paragraph snapshots no mark points at when an editor opens a saved document, so a removed mark's words leave the file at its next save. Snapshots saved by 54.0.0-beta.2 stay, so an app still on beta.2 can undo back to its own marks.

- [`78987a9`](https://github.com/udecode/plate/commit/78987a92e20e96972625f5e3a81af7a182fc1ee5) by [@zbeyens](https://github.com/zbeyens) –

  - Keep a Markdown file's leading YAML or TOML front matter. `editor.api.markdown.parse` stores it at `meta['markdown.frontmatter']` instead of reading it as a rule and a heading, `serialize` writes it back first, and `getMarkdownFrontmatter` from `platejs/markdown` reads it
  - Fail `serialize` under the reject policy with `markdown-frontmatter-omitted` when it cannot write the stored front matter back. Under `lossPolicy: 'allow'` it writes the file without the block and warns
  - Start a serialized file with a line ending when its body would otherwise read back as front matter, such as two `---` rules

- [`2ad50b0`](https://github.com/udecode/plate/commit/2ad50b014c94356114aa2e42c399bedac192ccf9) by [@zbeyens](https://github.com/zbeyens) –

  - Style an unclosed bold, italic or strikethrough run in a `partial` `parse`, `parseSlice` or `parseInline` preview as it will read once it closes, and hide up to three trailing `*`, `_`, `~` or `\` characters until the next chunk decides them. A later chunk can take back styling a preview showed

- [`824887f`](https://github.com/udecode/plate/commit/824887fff62da30e8297a1d15eef8ee39e9f8c0e) by [@zbeyens](https://github.com/zbeyens) –

  - Fix Markdown that read back differently after a save: code spans with line endings or edge spaces, emphasis around a link, nested emphasis, a bare URL right after text and an empty list item before a nested ordered list
  - Fix streamed Markdown parses that missed a link definition inside a quote or a list item

- [`a1af219`](https://github.com/udecode/plate/commit/a1af219edc003dcbced0eeedb205f92c55616e4b) by [@zbeyens](https://github.com/zbeyens) –

  - Fix `parseSlice` with `previous` returning a different preview than a fresh parse for streamed Markdown that holds, among others, no-break spaces in a blank line, a math block opened with more than two dollars, a link definition with an escaped bracket, a byte order mark or a lone CR line ending

- [`9fc3e9a`](https://github.com/udecode/plate/commit/9fc3e9a4ac72ae81db336ef4642da2306729dbd7) by [@zbeyens](https://github.com/zbeyens) –

  - Make `useEditor()` outside every editing area of an `EditorRoot`, such as in a fixed toolbar, return the editor of the root that holds the caret. A toolbar command such as `editor.plugin(BoldPlugin).update.toggle()` then changes a board's note while the caret is in it. With nothing selected it returns the editor of the primary root. `useEditorSelector`, `useEditorReadOnly`, `useEditorFocused` and the other hooks that read that editor follow it too, and a component whose selected value stays equal no longer renders when the caret moves.
  - Make `useEditorHistory()` with no `editor` or `root` undo and redo the editor `useEditor()` returns. It no longer needs an `EditorRoot` around it.
  - Make `useModelEditor()` under `EditorController` return the document editor of the `EditorRoot` used last, where it threw.

  **Migration:** A lock set through the editor that `useEditor()` returns outside every editing area refuses the commands sent through that editor and no longer locks an `EditorContent`. To lock one `EditorContent`, call `useEditor()` inside its `EditorContainer`:

  ```tsx
  function Lock() {
    const editor = useEditor();

    return (
      <button onClick={() => setEditorReadOnly(editor, true)}>Lock</button>
    );
  }

  <EditorRoot editor={editor}>
    <EditorContainer>
      <Lock />
      <EditorContent />
    </EditorContainer>
  </EditorRoot>;
  ```

- [`038a7bc`](https://github.com/udecode/plate/commit/038a7bcf7fdf9fbb9ebcd6367017a86fbb168554) by [@zbeyens](https://github.com/zbeyens) – Give each tile of a table paste, and each cell of a table fill, its own copy of an element another element references, such as a field. Each copy gets a new id, and each copied reference names the copy in its own tile or cell.

- [`9b218c9`](https://github.com/udecode/plate/commit/9b218c9cb6c60809c4f6de75f51b4c6e2df3f682) by [@zbeyens](https://github.com/zbeyens) –

  - Add `admit` and `fill` to the upload plugin's update API. A plugin with its own insert, such as one that wraps each file's placeholder in a container, checks a batch with `admit`, inserts the placeholders it returns and gives each file its placeholder with `fill`.

- [`0db21cf`](https://github.com/udecode/plate/commit/0db21cf93a87eb3fc1ed40d4c2723cefd4f9f669) by [@zbeyens](https://github.com/zbeyens) –
  - Report an unsupported file type first when a file of another kind is picked for an upload placeholder, before the size and configuration checks.
  - Fix an upload placeholder's submit sending its file twice, losing it or sending an older file when its transaction spec replays, another commit or a Cancel comes first, or a newer submit overtakes it.

## 54.0.0-beta.2

### Major Changes

- [`b50ef8e`](https://github.com/udecode/plate/commit/b50ef8e37d3f81bcc14d606c4588a2f3f02c501b) by [@zbeyens](https://github.com/zbeyens) – Release the Plate v2 beta, a rewrite of Plate v53 that is not a drop-in upgrade.

  - The `@platejs/*` feature packages, such as `@platejs/table` and `@platejs/ai`, are now part of `platejs`, so install `platejs` alone.
  - The editor runs on `plitejs` instead of Slate.

## 53.2.1

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.1.2

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.0.7

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 53.0.6

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.0.5

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 53.0.3

### Patch Changes

- Updated `@platejs/utils`.

## 53.0.0

## 52.3.21

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 52.3.16

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 52.3.11

### Patch Changes

- [`4af5ea4`](https://github.com/udecode/plate/commit/4af5ea4298c0d15f813edd6322bb99cf0a8aaf85) by [@zbeyens](https://github.com/zbeyens) – Use compatible internal dependency ranges so `platejs` can resolve the current `@platejs/*` package graph without nested stale installs.

## 52.3.9

## 52.3.4

### Patch Changes

- [#4857](https://github.com/udecode/plate/pull/4857) by [@zbeyens](https://github.com/zbeyens) –
  - Update internal `@platejs/*` and `@udecode/*` dependency ranges to workspace references.

## 52.3.3

## 52.3.2

## 52.0.17

## 52.0.15

## 52.0.11

### Patch Changes

- [#4784](https://github.com/udecode/plate/pull/4784) by [@zbeyens](https://github.com/zbeyens) –
  - Fixed "Cannot find module 'react/compiler-runtime'" error for React 18 users

## 52.0.10

## 52.0.8

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.3

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 50.3.9

## 50.3.8

## 50.3.7

## 49.2.21

## 49.2.12

## 49.2.11

## 49.2.9

## 49.2.8

## 49.2.6

## 49.2.5

## 49.2.4

## 49.2.3

## 49.1.13

## 49.1.5

## 49.1.4

## 49.1.3

## 49.1.2

## 49.0.19

## 49.0.18

## 49.0.16

## 49.0.15

## 49.0.14

## 49.0.13

## 49.0.11

## 49.0.10

## 49.0.9

## 49.0.6

## 49.0.5

## 49.0.4

## 49.0.3

## 49.0.2

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed package to `platejs`:
    - Replace all `@udecode/plate/react` with `platejs/react`
    - Replace all `'@udecode/plate'` with `'platejs'`

# @udecode/plate

## 48.0.5

## 48.0.3

## 48.0.1

## 48.0.0

## 47.3.1

## 47.2.7

## 47.2.3

## 47.1.1

## 46.0.10

## 46.0.9

## 46.0.4

## 46.0.2

## 45.0.9

## 45.0.8

## 45.0.7

## 45.0.6

## 45.0.5

## 45.0.2

## 45.0.1

## 44.0.7

## 44.0.1

## 44.0.0

## 43.0.5

## 43.0.4

## 43.0.2

## 43.0.0

## 42.2.5

## 42.2.2

## 42.1.2

## 42.1.1

## 42.0.6

## 42.0.5

## 42.0.4

## 42.0.3

## 42.0.1

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – **This package is now the new common package**, so all plugin packages are being removed. **Migration**:

  - Add the following dependencies:

  ```json
  "@udecode/plate-alignment": "42.0.0",
  "@udecode/plate-autoformat": "42.0.0",
  "@udecode/plate-basic-elements": "42.0.0",
  "@udecode/plate-basic-marks": "42.0.0",
  "@udecode/plate-block-quote": "42.0.0",
  "@udecode/plate-break": "42.0.0",
  "@udecode/plate-code-block": "42.0.0",
  "@udecode/plate-combobox": "42.0.0",
  "@udecode/plate-comments": "42.0.0",
  "@udecode/plate-csv": "42.0.0",
  "@udecode/plate-diff": "42.0.0",
  "@udecode/plate-docx": "42.0.0",
  "@udecode/plate-find-replace": "42.0.0",
  "@udecode/plate-floating": "42.0.0",
  "@udecode/plate-font": "42.0.0",
  "@udecode/plate-heading": "42.0.0",
  "@udecode/plate-highlight": "42.0.0",
  "@udecode/plate-horizontal-rule": "42.0.0",
  "@udecode/plate-indent": "42.0.0",
  "@udecode/plate-indent-list": "42.0.0",
  "@udecode/plate-kbd": "42.0.0",
  "@udecode/plate-layout": "42.0.0",
  "@udecode/plate-line-height": "42.0.0",
  "@udecode/plate-link": "42.0.0",
  "@udecode/plate-list": "42.0.0",
  "@udecode/plate-markdown": "42.0.0",
  "@udecode/plate-media": "42.0.0",
  "@udecode/plate-mention": "42.0.0",
  "@udecode/plate-node-id": "42.0.0",
  "@udecode/plate-normalizers": "42.0.0",
  "@udecode/plate-reset-node": "42.0.0",
  "@udecode/plate-resizable": "42.0.0",
  "@udecode/plate-select": "42.0.0",
  "@udecode/plate-selection": "42.0.0",
  "@udecode/plate-slash-command": "42.0.0",
  "@udecode/plate-suggestion": "42.0.0",
  "@udecode/plate-tabbable": "42.0.0",
  "@udecode/plate-table": "42.0.0",
  "@udecode/plate-toggle": "42.0.0",
  "@udecode/plate-trailing-block": "42.0.0"
  ```

  - Either replace all `@udecode/plate` imports with the individual package imports, or export the following in a new file (e.g. `src/plate.ts`):

  ```ts
  export * from '@udecode/plate-alignment';
  export * from '@udecode/plate-autoformat';
  export * from '@udecode/plate-basic-elements';
  export * from '@udecode/plate-basic-marks';
  export * from '@udecode/plate-block-quote';
  export * from '@udecode/plate-break';
  export * from '@udecode/plate-code-block';
  export * from '@udecode/plate-combobox';
  export * from '@udecode/plate-comments';
  export * from '@udecode/plate-diff';
  export * from '@udecode/plate-find-replace';
  export * from '@udecode/plate-font';
  export * from '@udecode/plate-heading';
  export * from '@udecode/plate-highlight';
  export * from '@udecode/plate-horizontal-rule';
  export * from '@udecode/plate-indent';
  export * from '@udecode/plate-indent-list';
  export * from '@udecode/plate-kbd';
  export * from '@udecode/plate-layout';
  export * from '@udecode/plate-line-height';
  export * from '@udecode/plate-link';
  export * from '@udecode/plate-list';
  export * from '@udecode/plate-media';
  export * from '@udecode/plate-mention';
  export * from '@udecode/plate-node-id';
  export * from '@udecode/plate-normalizers';
  export * from '@udecode/plate-reset-node';
  export * from '@udecode/plate-select';
  export * from '@udecode/plate-csv';
  export * from '@udecode/plate-docx';
  export * from '@udecode/plate-markdown';
  export * from '@udecode/plate-slash-command';
  export * from '@udecode/plate-suggestion';
  export * from '@udecode/plate-tabbable';
  export * from '@udecode/plate-table';
  export * from '@udecode/plate-toggle';
  export * from '@udecode/plate-trailing-block';
  export * from '@udecode/plate-alignment/react';
  export * from '@udecode/plate-autoformat/react';
  export * from '@udecode/plate-basic-elements/react';
  export * from '@udecode/plate-basic-marks/react';
  export * from '@udecode/plate-block-quote/react';
  export * from '@udecode/plate-break/react';
  export * from '@udecode/plate-code-block/react';
  export * from '@udecode/plate-combobox/react';
  export * from '@udecode/plate-comments/react';
  export * from '@udecode/plate-floating';
  export * from '@udecode/plate-font/react';
  export * from '@udecode/plate-heading/react';
  export * from '@udecode/plate-highlight/react';
  export * from '@udecode/plate-layout/react';
  export * from '@udecode/plate-slash-command/react';
  export * from '@udecode/plate-indent/react';
  export * from '@udecode/plate-indent-list/react';
  export * from '@udecode/plate-kbd/react';
  export * from '@udecode/plate-line-height/react';
  export * from '@udecode/plate-link/react';
  export * from '@udecode/plate-list/react';
  export * from '@udecode/plate-media/react';
  export * from '@udecode/plate-reset-node/react';
  export * from '@udecode/plate-selection';
  export * from '@udecode/plate-suggestion/react';
  export * from '@udecode/plate-tabbable/react';
  export * from '@udecode/plate-table/react';
  export * from '@udecode/plate-toggle/react';
  export * from '@udecode/plate-resizable';
  ```

  - Replace all `'@udecode/plate'` and `'@udecode/plate/react'` with `'@/plate'` in your codebase.

# @udecode/plate-common (< 42.0.0)

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated and will be renamed to `@udecode/plate`. Migration:

  - Remove `@udecode/plate-common` and install `@udecode/plate`
  - Replace all `'@udecode/plate-common'` with `'@udecode/plate'`,

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Split build into `@udecode/plate-common` and `@udecode/plate-common/react`.
  - NEW `/react` exports `@udecode/react-hotkeys`

## 33.0.4

### Patch Changes

- [#3199](https://github.com/udecode/plate/pull/3199) by [@zbeyens](https://github.com/zbeyens) – Fix `PlateElementProps` type

## 29.0.0

### Minor Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - re-export `@udecode/react-utils`

### Patch Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - Fix import from RSC

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0
