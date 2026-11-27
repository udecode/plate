# platejs

## 54.0.0-beta.7

### Minor Changes

- [`fe90073`](https://github.com/udecode/plate/commit/fe9007333bf6eaa697a7d32c942863067f31b5e4) by [@zbeyens](https://github.com/zbeyens) – Re-export `useEditorEditableElement`, `UseEditorSelectorOptions`, and `UseStateFieldValueOptions` by identity from `platejs/react`.

- [`38eb5de`](https://github.com/udecode/plate/commit/38eb5de630efafc070eb1ab102a141a270cbfda6) by [@zbeyens](https://github.com/zbeyens) – Re-export the eight drag and geometry types (`DOMDragApi`, `DOMDragStart`, `DOMDropEdge`, `DOMDropTarget`, `DOMDropTargetInput`, `DOMDropTargetOptions`, `DOMGeometryRect`, `DropIndicator`) from `platejs/dom`, `GaveWrite` and `SplitGave` from `platejs/authored`, and `TypedText` and `TypedTextListener` from `platejs/react` by identity. Rename the internal `inkRecords` plugin name from `'ink-records'` to `'inkRecords'`.

- [`f988d66`](https://github.com/udecode/plate/commit/f988d6695d392e5cb3c56a1e60373b1a661bc64f) by [@zbeyens](https://github.com/zbeyens) – Search every document root in `BaseFindPlugin` in recursive owner reading order, update changed roots incrementally without polling unchanged boards, isolate match decorations and observer notifications per view root, and allow `update.select()` to select matches in any root from any view.

- [`d2cc369`](https://github.com/udecode/plate/commit/d2cc369348f43f57df8b01ef51ba1aeb1dae76e7) by [@zbeyens](https://github.com/zbeyens) – Accept `clipboardFormatKey` on `platejs/react`'s `createEditor` and `useCreateEditor` via `DOMPlugin` store state and chained plugin `activate` stages, validate `editor.install`, `tx.plugins.reconfigure`, and slotted plugin inputs before any cleanup to reject Plate plugins with a `createEditor({ plugins })` and `store.set({ ... })` error, reject unsupported `schema` keys at runtime on both object and factory schemas, and drop `history`, `HistoryOptions`, `HistoryPlugin`, `HistoryPluginTypes`, and `HistoryPluginTypeProvider` from `platejs/history` in favor of `HistoryPlugin.configure(...)`.

- [`353fcec`](https://github.com/udecode/plate/commit/353fcec6ab5b8ad6f3c9a310d20157eeae16f757) by [@zbeyens](https://github.com/zbeyens) – Replace `shouldUpdate` on `useEditorSelector` and `useEditorState` with declarative `dependsOn`, and re-export `EditorSelectorDependency` and `EditorSelectorDependencies` from `platejs/react`.

  - Migrate `UseEditorSelectorOptions` and `UseEditorStateOptions` to `{ dependsOn?, equalityFn? }` and update Plate's built-in hooks, `NodeSelection`, `FieldPlugin`, and `ListPlugin` to declare their dependencies with `dependsOn`.
  - Commit normalized `dependsOn` changes in a layout effect rather than mutating selector filters during render, and include `equalityFn` in `useEditorSelector`'s snapshot cache key.

### Patch Changes

- [`6f5622e`](https://github.com/udecode/plate/commit/6f5622e79a9967237eb9d8d8bcb26a9de5c408f4) by [@zbeyens](https://github.com/zbeyens) –

  - Block ink tool activation and pen, eraser, or lasso edits while a view is in Authored Preview
  - Store optional inline-void display labels on `InkCopy` so `InkCopyView` renders mention text instead of raw `U+FFFC`
  - Translate text marks horizontally when their block shifts, prune unreferenced `ink-gone` records in `dropDigitized`, and restore viewport-scoped ink placement on `afterprint`
  - Remove experimental `54.0.0-beta.2` ink record compatibility; saved ink uses the packed format only

- [`55025b2`](https://github.com/udecode/plate/commit/55025b2156d4c99270f3aa00841b9c1fd033502d) by [@zbeyens](https://github.com/zbeyens) – Fix `EditorRoot` `onValueChange` to emit commit-scoped `EditorDocumentValue` without replaying commits across React `Activity` reconnects or forcing lazy state codecs on ephemeral writes, export `UseStateFieldValueOptions` from `platejs/react`, and default selector option generics to `unknown`

- [`c06c7de`](https://github.com/udecode/plate/commit/c06c7de445579d1141c7d35c3293b66538861d7f) by [@zbeyens](https://github.com/zbeyens) – Re-export `useEditorRootAreas` and `EditorRootAreas` from `platejs/react`.

- [`42e913d`](https://github.com/udecode/plate/commit/42e913d97de2bbae252c54a1ba648e89de8a34a9) by [@zbeyens](https://github.com/zbeyens) – Add experimental `tx.plugin(BaseInkPlugin).dropDigitized(ids?)` to permanently drop digitized ink marks, their digitized records, and any saved block copies no remaining mark references.

- [`93af01d`](https://github.com/udecode/plate/commit/93af01d1961d61d84b5e404cc5130d5f48d271f3) by [@zbeyens](https://github.com/zbeyens) – Merge derived-read React hooks (`useEditorState`, `useEditorRuntimeState`, `useRuntimeState`, `useRootState`, and `useEditorViewState`) into `useEditorSelector` with both context and explicit-editor overloads plus view-state `dependsOn` tokens (`'authored'`, `'composing'`, `'focused'`, `'readOnly'`, and `'view'`).

- [`c39072c`](https://github.com/udecode/plate/commit/c39072c1c5e99cd73286a48ba1b40c5a7e3dbda9) by [@zbeyens](https://github.com/zbeyens) – Add optional `withHistory` callback to `CreateCommentThreadInput` on `BaseCommentsPlugin` for atomic record-only history writes after comment creation commits, and include margin notes in `BaseInkPlugin.read.passages` with `margin` side metadata on `InkPassageMark`.

- [`132c1ce`](https://github.com/udecode/plate/commit/132c1cee796c088490a851eeb96810f012bc3807) by [@zbeyens](https://github.com/zbeyens) – Rename `platejs/react` plugin attributes type `NodeProps` to `NodeAttributes` so `platejs/react` re-exports core `NodeProps`

  **Migration:** Update plugin `render.attributes` type annotations from `NodeProps` to `NodeAttributes`:

  ```tsx
  import type { NodeAttributes } from 'platejs/react';
  ```

- [`99a2bf1`](https://github.com/udecode/plate/commit/99a2bf131186289577856e7a235cf46a5da29c6f) by [@zbeyens](https://github.com/zbeyens) –

  - Add free text to boards (`BaseBoardTextPlugin`, `BoardTextPlugin`, `setTool('text')` with the `T` shortcut, and double-clicking an empty spot on the board). Clicking places auto-sized text that grows in width and height as you type (`autoSize: true`); dragging or resizing locks a fixed wrapping width (`autoSize: false`). In Editing mode, leaving an unmodified newly clicked text box discards it without adding an undo step. Typing near a board edge pans the camera to keep the caret in view without changing the document, and `exportPicture` measures both width and height of auto-sized free text.

- [`e6f8893`](https://github.com/udecode/plate/commit/e6f889312c29b350923f0532445c42d67b5375d8) by [@zbeyens](https://github.com/zbeyens) – Keep the caret inside an edited board note or shape when clicking empty paper or padding outside its text

- [`197d09b`](https://github.com/udecode/plate/commit/197d09b39005fad87d1a78f2b3e018d9f05c0159) by [@zbeyens](https://github.com/zbeyens) –

  - Grow board notes with their text while keeping each note's stored size as its height floor, update bound arrows and hit tests to the grown height, preserve dragged heights on resize and drawn arrow ends when a note is removed, and measure static notes marked with `data-board-text` during `exportPicture` so exported notes and arrows draw whole.

- [`78e5525`](https://github.com/udecode/plate/commit/78e5525b3ada54bc21e20c29d5933ecc2c84a4cc) by [@zbeyens](https://github.com/zbeyens) –

  - Place each board shape's root in a `div` that carries the shape's box, stacking rank and drag offset, and make the root fill it. Read a shape's inline `left`, `top`, `width`, `height`, `z-index` or `translate`, and its `offsetLeft` and `offsetTop`, on the root's `parentElement`. A private `@layer board-shapes` style rule prepended to the root makes the wrapper take no press and restores `pointer-events: auto` on `[data-board-shape]` (set `inert` on an ancestor to disable pointer input on a board). The root keeps its `className`, marks and non-placement `style`, uses `box-sizing: border-box`, and ignores `all`, offsets, margins, `width`, `height`, `position` and grid placement or self-alignment keys from `style`.

- [`e63d5c7`](https://github.com/udecode/plate/commit/e63d5c77a1fcd7c446e9a39843b86e43b0c8f45c) by [@zbeyens](https://github.com/zbeyens) – Index DOCX export hosts once per render so comments and review revisions anchor inside rendered named roots without colon-delimited key collisions, fix multi-comment offset shifts on shared text nodes, paint review marks across every rendered copy of a shared named root without spanning v1 review bookmarks over foreign roots, and warn on `named-root` only for stored roots not rendered into the DOCX output.

- [`d0fc717`](https://github.com/udecode/plate/commit/d0fc7171ca593795319fdd92b6814f5e4dd5ef8e) by [@zbeyens](https://github.com/zbeyens) – Support multi-test field conditions (`{ all: FieldConditionTest[] }` and `{ any: FieldConditionTest[] }`) with three-valued evaluation shared by the fill view and `applyFieldValues`. Export `FieldConditionTest`, include other roles waited on by optional fields in `pending`, name the first waiting role in UTF-16 code-unit order in `waiting` refusals, map every test `ref` on paste, duplicate and table fill, compare condition lists in any order across named field groups, and allow `update` to repair broken rules one at a time while refusing newly introduced problems or loops.

  **Migration:**

  - **TypeScript callers:** `FieldCondition` is now a union of `FieldConditionTest`, `{ all: readonly FieldConditionTest[] }`, and `{ any: readonly FieldConditionTest[] }`. Narrow a condition (`'ref' in condition`, `'all' in condition`, or `'any' in condition`) before reading `ref`, `test`, or `value`.
  - **`pending` on optional fields:** `applyFieldValues` and `startFieldValues` now include any other role waited on by an unsubmitted role's optional field in `pending`, so existing templates where an optional field waits on another role return that role in `pending` until it submits.
  - **Reserved keys on legacy single-test conditions:** `all` and `any` are now reserved discriminators on `FieldCondition`. If a saved single-test document attached a custom extra key named `all` or `any`, rename that key before loading.
  - **Schema fingerprint (`validationVersion: 2`):** Widening the `condition` validator changes the derived schema fingerprint for editors using `BaseFieldPlugin` or `FieldPlugin`:
    - Apps with a named schema: bump `schema.version`, register the previous schema fingerprint, and return each document unchanged (after renaming any custom `all`/`any` key on legacy single tests).
    - Apps storing `{ document, schema }` envelopes on the default derived identity: reopen each document through `createEditor` and save it again.
    - Apps storing bare document JSON: no migration required unless a single test holds a custom `all`/`any` key.
    - Populated Yjs rooms: start a new room seeded with the converted document.

- [`c3f69d6`](https://github.com/udecode/plate/commit/c3f69d625b5dbece417a61d8aea2a3b85703684f) by [@zbeyens](https://github.com/zbeyens) – Add `read.conditionTargets(fieldId)` to `BaseFieldPlugin` to return the field ids in document order that a condition on `fieldId` may target without closing a loop, plus any field the condition already names. Check name-group condition conflicts without recursion so deep chains of named fields do not overflow the stack.

- [`b7b55b5`](https://github.com/udecode/plate/commit/b7b55b538bf4237488dc228dd1a4884a76549d83) by [@zbeyens](https://github.com/zbeyens) – Add the `multiple` field kind with optional `min` (`>= 2`) and `max` (`>= 1`) count bounds, `includes` and `not-includes` condition tests, order-insensitive comparison across name groups, `answer-conflict` and `startFieldValues`, comma-joined option labels in plain text and Word export, `data-field-min` and `data-field-max` HTML attributes (mapping imported `min=1` on `multiple` fields to `required: true`), and `{ kind: 'multiple', value?: readonly string[] }` in `readFieldAnswers`. Remove the unused `defaultValue` field property and `data-field-default-value` HTML attribute.

  **Migration:**

  - **Removed `defaultValue`:** Delete the `defaultValue` key (do not leave `defaultValue: undefined`) from every `field` node before loading documents under the closed schema or passing them to the field helpers. `applyFieldValues` and `startFieldValues` refuse a field carrying `defaultValue` as `malformed`, and `readFieldAnswers` and `fieldSubmission` silently skip malformed fields. Remove `defaultValue` from any `insert` or `update` call. Apps that store application defaults keep them outside the field schema or prefill with `startFieldValues`.
  - **TypeScript callers:** `FieldValue` now includes `readonly string[]`, `FieldKind` includes `'multiple'`, `FieldTest` includes `'includes'` and `'not-includes'`, and `FieldAnswer` includes `{ kind: 'multiple'; value?: readonly string[] }`. Note that `Array.isArray(value)` does not exclude `readonly string[]` from the false branch in TypeScript; narrow with `typeof value === 'object'` or a `value is readonly string[]` predicate where a scalar value is expected.
  - **Schema fingerprint:** Adding `'multiple'`, `min`, `max`, widening `value` (`validationVersion: 2`) and `condition` (`validationVersion: 3`), and removing `defaultValue` change the derived schema fingerprint for editors using `BaseFieldPlugin` or `FieldPlugin`:
    - Apps with a named schema: bump `schema.version`, register the previous schema fingerprint, and delete `defaultValue` from each `field` node in the migration step.
    - Apps storing `{ document, schema }` envelopes on the default derived identity: verify the previous fingerprint, delete `defaultValue` from each `field` node in `envelope.document`, open with `createEditor({ initialValue: migratedDocument, initialSelection: envelope.selection, plugins })`, and save a fresh envelope.
    - Apps storing bare document JSON: delete `defaultValue` from each `field` node before calling `createEditor`, `applyFieldValues`, `startFieldValues`, `fieldSubmission`, or `readFieldAnswers`.
    - Populated Yjs rooms: start a new room seeded with the migrated document.

- [`7b6db1c`](https://github.com/udecode/plate/commit/7b6db1c8ae9646f8463fc2973343e80270f37851) by [@zbeyens](https://github.com/zbeyens) – Scope footnote anchors, HTML serialization, and static rendering by content root, and omit fragment targets for unresolved named-root footnotes.

- [`3a8a547`](https://github.com/udecode/plate/commit/3a8a547f5051ef46bdbea9360149e13da61d3b5f) by [@zbeyens](https://github.com/zbeyens) – Keep ink marks attached to their words across edits elsewhere in the same paragraph and across line wraps with shape-aware reflow (`flow`, `box`, `span`, `rigid`), add `BaseInkPlugin.read.liveMarks()`, and support live-block passages (`InkPassage.block`) and `{ block, start, end }` ranges in `read.range` and `InkPlugin.api.images`.

- [`d77c7d1`](https://github.com/udecode/plate/commit/d77c7d130811bceae182c260b60337a8f949f3fd) by [@zbeyens](https://github.com/zbeyens) –

  - Add experimental digitized ink state on `BaseInkPlugin`: the `ink-digitized` record set, `tx.plugin(BaseInkPlugin).setDigitized(ids, value)` and `editor.plugin(BaseInkPlugin).read.shownMarks()`. Digitized marks stay saved without showing signs or deleted signs, leave with `remove`, and drop orphan digitized records on load.

- [`b792254`](https://github.com/udecode/plate/commit/b79225414f950beff240f0c85aab8149ebce6dbe) by [@zbeyens](https://github.com/zbeyens) –

  - Add experimental `editor.plugin(InkPlugin).api.images(passages, { maxSide })` (with `InkImagesOptions` and `InkPassageImages` types) to render `inkAlone` and `inkOnText` Canvas 2D PNGs, pixel mark boxes, and inline void text from the live view.

- [`6bed86f`](https://github.com/udecode/plate/commit/6bed86f7cc939a9ddbd1c9601c0d5b8ddea3ad30) by [@zbeyens](https://github.com/zbeyens) –

  - Add experimental `read.passages(ids)` and `read.range({ copy, start, end })` on `BaseInkPlugin` (with `InkPassage`, `InkPassageMark`, `InkPassageWord`, and `InkRangeInput` types) to read marked line passages and resolve saved copy character offsets to live ranges.

- [`f7e3f32`](https://github.com/udecode/plate/commit/f7e3f32bf609ca9ad6ffa8d2c2060d13e00ca5f3) by [@zbeyens](https://github.com/zbeyens) –

  - Update `InkPlugin` and `InkContent` placement, lasso, Backspace, and Delete to read shown marks via `read.shownMarks()`, skipping digitized marks on default passes and leaving faded digitized marks untouched by the eraser, Backspace, and Delete.
  - Add experimental `editor.plugin(InkPlugin).api.setShowDigitized(value)` (with `showDigitized` on `InkViewState` and optional `digitized` on `InkSign`) to show digitized marks faded over their words or as separate digitized signs and let the lasso pick them.

- [`f4f653b`](https://github.com/udecode/plate/commit/f4f653bab32f17bb8307350f1874e191187c9d08) by [@zbeyens](https://github.com/zbeyens) – Preserve another focused field's DOM selection when `NodeSelectionDrag` releases after a focus redirect or receives key events while unfocused

- [`7c07401`](https://github.com/udecode/plate/commit/7c07401a99c99ba5e1451da815cee05bc4b453ab) by [@zbeyens](https://github.com/zbeyens) –

  - Remove `EditableProps`, `LeafNodeProps`, `TextNodeProps`, `RenderElementFn`, `RenderLeafFn` and `RenderTextFn`. Use `EditorContentProps` for `EditorContent` props, and write a plugin's `leafAttributes` and `textAttributes` callbacks inline, where Plate infers their props.
  - Type `context.editor` as Plate's `Editor` in every `EditorContent` handler that takes a context, such as `onKeyDown`, `onClick` and `onPaste`, and in the handler types, such as `EditableKeyDownHandler`. `scrollSelectionIntoView` gets Plate's `Editor` too. Export `EditablePointerSelectionEndHandler` from `platejs/react`.
  - Accept a plugin in `PluginPortal` and `BasePluginPortal`, as in `PluginPortal<typeof MyPlugin>`, distribute over unions of plugins, and keep an erased `PluginReference` portal's `schema` optional and kind-dependent.
  - Export `EditorReference`, type `useRootEditor` to return Plate's `Editor`, and refuse at compile time an `EditorRoot` `editor` typed as a non-editor value or a raw Plite editor or view. A generic component that passes its editor to `EditorRoot` constrains it, as in `<E extends EditorReference>`.
  - Remove `name` from `PluginDefinitionInput` and `BasePluginDefinitionInput`.
  - Refuse at compile time a `definePlugin` `schema` key other than `contentRoots`, `element`, `mark` and `properties`, including explicit unions containing Plite-only keys.

- [`1f7b27c`](https://github.com/udecode/plate/commit/1f7b27ced7f71a3f0684f9346dcba63a79cc7940) by [@zbeyens](https://github.com/zbeyens) –

  - Remove `useAnnotationStore`, `useAnnotation`, `useAnnotations`, `UseAnnotationStoreOptions`, `Annotation*` re-exports, and unused `ViewSource*` (`ViewSourceOptions`, `ViewSourceStatus`, `ViewSourceError`, `ViewSourceErrorSink`, `ViewSourcePhase`) exports from `platejs/react`.
  - Export `CommentAttachmentChange` from `platejs/comments` as the payload type for `subscribeAttachments`.

  **Migration:** Replace `useAnnotation*` with `editor.anchor`, `commit.changed.anchors()`, and `DecorationSource`. Update `subscribeAttachments` listener types from `AnnotationChange` to `CommentAttachmentChange` from `platejs/comments`.

- [`82c983d`](https://github.com/udecode/plate/commit/82c983d464e0ea7f605923b9952c1739cc38cd54) by [@zbeyens](https://github.com/zbeyens) – Remove `ElementIdPlugin` and reserve `id` across every editor schema

  - `plitejs` schemas now refuse declaring an element `id` property (naming the reserved `id` key), and editor readers type returned elements with a required `id: string` while detached inputs (`ElementIn`, `InitialValue`) and element guards (`ElementApi.isElement`) keep `id` optional.
  - Removed `ElementIdPlugin`, its `generateId` option, `HtmlExportKit` / `HtmlExportSchemaKit`, and the internal `readElementById` helper; Markdown `<block id>`, Ink, HTML export, and document migrations now read core's reserved `id` directly.

- [`39fa61e`](https://github.com/udecode/plate/commit/39fa61e5662eddb51c3df1003ec7e9581bda7c7c) by [@zbeyens](https://github.com/zbeyens) – Remove unused `jotai`, `jotai-x`, `jotai-optics`, and `optics-ts` dependencies so apps using Jotai no longer install duplicate copies

- [`ffb8e06`](https://github.com/udecode/plate/commit/ffb8e065276f5c4bfd009012c8c3ce18fdcc7209) by [@zbeyens](https://github.com/zbeyens) –

  - Move render prop types off root `platejs`: import `RenderElementProps`, `RenderLeafProps`, `RenderTextProps`, `RenderTextHostProps`, and `RenderTextPieceProps` from `platejs/react`, and import `StaticRenderLeafProps`, `RenderStaticNodeWrapper`, `RenderStaticNodeWrapperFunction`, and `RenderStaticNodeWrapperProps` from `platejs/static`.
  - Pass `attributes` into `render.mark.textAttributes` callbacks during static HTML rendering, matching React rendering.

- [`cc06ae9`](https://github.com/udecode/plate/commit/cc06ae9a7abb2d61da2d951016cd121a5fcd38e5) by [@zbeyens](https://github.com/zbeyens) – Allow whole row, column and table format suggestions in Suggesting mode, preserve displayed column widths when copying across a pending column deletion, and keep merged cells, row moves, container edits around tables, and a second row, column, or format suggestion already visible to the writer refused up front.

- [`170132f`](https://github.com/udecode/plate/commit/170132f8b1a80e2284d33d06b1388432cfaa3a8c) by [@zbeyens](https://github.com/zbeyens) – Enforce zero-argument runtime guards on `useEditor()` and `useOptionalEditor()`, tighten `useCreateEditor()` typing, and rebind `useStateFieldValue` and `useSetStateField` to Plate's `useEditor()`.

  - `useEditor()` and `useOptionalEditor()` in `platejs/react` now throw when passed any argument (including `undefined`), matching `plitejs/react`.
  - Zero-argument `useCreateEditor()` now returns a non-null default editor and refuses caller-supplied generics without an options object.
  - `useStateFieldValue` and `useSetStateField` now resolve through Plate's `useEditor()`, so components under a passive `EditorProvider` read and update the provider's editor. Plate's `UseStateFieldValueOptions` omits `deferred` to match `useEditorState` and `useEditorSelector`.
  - Inside `<EditorContent readOnly>`, Plate's per-node render `readOnly` now reports `true`.

## 54.0.0-beta.6

### Patch Changes

- [`33eb625`](https://github.com/udecode/plate/commit/33eb62505f0512f99da91ed324bf3a92a018db5c) by [@zbeyens](https://github.com/zbeyens) –

  - Replace `useArrowPath` and its `BoardArrowPath` type in `platejs/board/react` with three components that draw an arrow inside its `BoardShape`. `BoardArrowPath` is an SVG `path` between the arrow's ends, `BoardArrowhead` is an SVG `g` that draws its children at the arrow's end, and `BoardArrowLabel` is a `div` centered on the arrow's middle. An arrow follows a moved, dragged or resized shape without a render. The components draw the straight arrow the board stores.

  **Migration:** Copy the `board` registry item again with all its files, because the static arrow draws the head that `board-styles` exports as `ARROW_HEAD`. In your own arrow renderer, remove the `useArrowPath(element)` call and its early return, then draw the path and head in an SVG and the label beside it. A press picks an arrow only when it lands on one of the arrow's elements, so keep a wide transparent path with `pointerEvents="stroke"`:

  ```tsx
  <BoardShape {...props}>
    <div className="absolute top-0 [left:0]" contentEditable={false}>
      <svg
        className="pointer-events-none overflow-visible"
        height={1}
        width={1}
      >
        <BoardArrowPath
          pointerEvents="stroke"
          stroke="transparent"
          strokeWidth={14}
        />
        <BoardArrowPath fill="none" stroke="currentColor" />
        <BoardArrowhead>
          <polygon fill="currentColor" points={ARROW_HEAD} />
        </BoardArrowhead>
      </svg>
    </div>
    <BoardArrowLabel>{props.children}</BoardArrowLabel>
  </BoardShape>
  ```

- [`9e5dcae`](https://github.com/udecode/plate/commit/9e5dcae01c83cf9396ec9c43a8a0c86133d62dbc) by [@zbeyens](https://github.com/zbeyens) –

  - Keep a comment thread unavailable when a letter in a new style is typed where its deleted text crossed a style change, instead of letting that letter join the thread.

- [`13f3456`](https://github.com/udecode/plate/commit/13f3456fc30e683a2e7fa400f537219900a39075) by [@zbeyens](https://github.com/zbeyens) –

  - Add `fieldSubmission` and `readFieldAnswers` to `platejs/field`. `fieldSubmission(template, role, values, options?)` builds one role's submission from a record keyed by field name, so an app sends its own data without mapping names to ids. `readFieldAnswers(document, options?)` reads a saved document's answers back by role and name. Each answer is a `FieldAnswer` whose `kind` narrows its `value`, or one that names the problem `answer-conflict` or `name-conflict`.
  - Add `startFieldValues(template, submissions, start, options?)` to `platejs/field`. It replays the roles that already submitted, as `applyFieldValues` does, and returns the filled document a role starts from, with each value `start` gives written on its field and on every other field of its name. A field `start` leaves out starts blank, even one with a default, and so does a field that skips or waits on a role that has not submitted. The person who fills keeps, changes or clears each starting value and submits it as their own answer. A `start` that gives one name two values is refused as `answer-conflict`.

- [`3fa7e45`](https://github.com/udecode/plate/commit/3fa7e458bcb68446ee4421114b8e4ed031149c72) by [@zbeyens](https://github.com/zbeyens) –

  - Add an optional `name` to fields. A name is a text that is not empty, has no space at either end, and holds no control character, line or paragraph separator or lone surrogate. Loading, `insert`, `update` and a raw write refuse any other name, and `applyFieldValues` refuses a template that holds one as `invalid-template` with problem `malformed`. HTML writes it as `data-field-name`, Markdown as a `name` attribute, and both drop a name the rule refuses while keeping the field. A paste, a duplicate and a table fill keep the name and give the copy a new `fieldId`. Word export drops it with the other settings, and its warning now reads "Word keeps each field answer and drops its name and settings."
  - Add `name-conflict` and `answer-conflict` to `FieldProblem`, which `read.field` and `read.fields` report. Fields of one role that share a name must share their kind, their options' values and their condition. Each field of a name whose fields differ reads `name-conflict`, and the same name in two roles never conflicts. Each field of a name whose fields hold different stored values reads `answer-conflict`, so an empty text and no value differ. A copied `field` component that maps every `FieldProblem` needs both keys.
  - `applyFieldValues` refuses a template whose fields of one role and name differ in settings as `invalid-template` with problem `name-conflict`. Once a role's submission applies, it refuses each name of that role whose fields hold different answers as `{ code: 'answer-conflict', fieldIds, name, role }`, with every field of the name in document order, unless the submission already refused a field of the name as `invalid-value`, `wrong-role`, `skipped` or `waiting`. A name whose required field the submission left out still gets `answer-conflict` beside `missing-required`.
  - Every `applyFieldValues` refusal that names a field also carries that field's `name` when it has one: `invalid-template`, `invalid-value`, `missing-required`, `skipped`, `waiting` and `wrong-role`. Code that switches over `FieldRefusal` and reads `fieldId` in a default branch needs an `answer-conflict` case, which has `fieldIds` instead.
  - `update` writes a `value`, a cleared one included, to every field of the role that shares the field's name, in the same commit and the same undo step, unless the name reads `name-conflict`. No other setting reaches the other fields.
  - Adding `name` changes the schema fingerprint of every editor with the field plugin.

  **Migration:** A saved document holds no names, so it fills by `fieldId` as before. What to change depends on how the app saves:

  - With a named schema, bump `schema.version`, record the old fingerprint under `sourceFingerprints`, and add a migration step that returns the document unchanged.
  - If the app's own schema declared a `name` property on fields, remove that declaration. Its migration step moves each stored value to a key of the app's own, or keeps it only where the app means one answer per name and the value passes the name rule.
  - With the default derived identity and saved `{ document, schema }` envelopes, the editor refuses the old envelope because its fingerprint no longer matches. Check that the stored fingerprint is the one the editor produced before this change, then open the document with its selection and save it again:

    ```ts
    const editor = createEditor({
      initialSelection: envelope.selection,
      initialValue: envelope.document,
      plugins,
    });
    ```

    Name the schema from then on, as the editor guide's Schema identity section advises.

  - An app that saves the bare document changes nothing.
  - A populated Yjs room keeps the schema identity it was created with, so an editor with this version cannot join it. Convert the room's document, seed a new room with it, and move every writer to the new room.

- [`d4459c6`](https://github.com/udecode/plate/commit/d4459c65e9556a9c082cfb4997da760b9a9409a5) by [@zbeyens](https://github.com/zbeyens) –

  - Add the eraser to `platejs/ink/react`. `setTool({ size, type: 'erase' })` removes each mark whose painted ink the eraser's path touches. One contact's removals undo as one step unless another edit, local or remote, lands between them. `InkTool` is now a union, so code that reads `tool.brush` checks `tool.type === 'draw'` first.

- [`386eb10`](https://github.com/udecode/plate/commit/386eb106088a769eb68486aa241748c844114ffe) by [@zbeyens](https://github.com/zbeyens) –

  - Add the lasso to `platejs/ink/react`. `setTool({ type: 'lasso' })` draws a loop that picks the marks with more than half their samples inside it, and its press focuses the Editable so the keys reach the pick. While the lasso is on, Backspace or Delete removes the picked marks in one undo step and Escape clears the pick. Keys with Alt, Control or Meta, input method keys and the repeats of a held key leave the pick alone. Any other tool and hiding ink clear the pick. An eraser or lasso contact now ends when its primary button lifts while another button stays down.

- [`e7e7ac4`](https://github.com/udecode/plate/commit/e7e7ac4f72e10b64991d863374d0a83475b29d8d) by [@zbeyens](https://github.com/zbeyens) –

  - In `platejs/ink/react`, changing the Draw tool, hiding ink or turning the view read-only now ends the current pen or eraser contact at once, and a pen stroke that ends this way saves nothing more. Turning the view read-only turns the tool off, even when it turns back in the same batch. While ink is hidden, every press reaches the content. The pen and the eraser read the layer's position at each sample, so a removal that moves the layer leaves the next sample on the ink under the pointer. `setTool` returns false and keeps the current tool for a `size` that is not a finite number above 0, a brush `opacity` that is not a number above 0 and at most 1, or a brush `color` that is not a non-empty string.

- [`0274644`](https://github.com/udecode/plate/commit/0274644f3fbfcef7555711eb693fd055ed698f34) by [@zbeyens](https://github.com/zbeyens) –

  - In `platejs/ink`, a mark drawn on a mention, or on another inline void, now shows its changed sign once that void is swapped for a different one or its properties change, instead of staying on the new one. A void's id and review marks don't count, so a mark on a suggested mention stays live when the suggestion is accepted. A mark saved before this change on a block that holds an inline void shows that sign too, because its saved copy has no record of the voids.

- [`257320a`](https://github.com/udecode/plate/commit/257320aaba502b009feb4250b19dad6b0cc062d1) by [@zbeyens](https://github.com/zbeyens) –

  - Type the node a `match` callback receives in a plugin's `tx.nodes.set` as `Element` instead of `any`.

- [`ca52412`](https://github.com/udecode/plate/commit/ca52412f9df5b99ad82996fb3a0ab7dc5971fdd4) by [@felixfeng33](https://github.com/felixfeng33) – Paint each suggestion author in one color: `data-editor-authored-color` now holds the palette slot of the author whose change an element paints, and `suggestionColorOf` takes an author id

## 54.0.0-beta.5

### Patch Changes

- [`dee395d`](https://github.com/udecode/plate/commit/dee395d68e25980340ce470257e16c1d37486ac5) by [@zbeyens](https://github.com/zbeyens) –

  - Move a comment thread with its text when a drag moves all of that text, and back again on undo. A drag of part of the text leaves the thread on the part that stays. Undoing a drag and the thread's creation, then redoing both, puts the thread back on its text.

- [`dca432b`](https://github.com/udecode/plate/commit/dca432b402ecaf554b5e662415c3966788e8051e) by [@zbeyens](https://github.com/zbeyens) –

  - Add `fillsField(field, value)` to `platejs/field` to check whether a value fills a field. `required`, the `filled` and `blank` conditions and the refusal of an answer on a skipped field all use it. A checkbox fills only when ticked. A text or signature answer needs a character other than whitespace. Any other field needs a value of its kind.

- [`d2af1ef`](https://github.com/udecode/plate/commit/d2af1efb9783ba40aa5d8ef856eeb42c9c462368) by [@zbeyens](https://github.com/zbeyens) –

  - Fix the ink layer holding the outline of each removed pen mark in memory while undo history can still restore that mark

- [`4081ba8`](https://github.com/udecode/plate/commit/4081ba8baae622b170ea68fb3666a43753947942) by [@zbeyens](https://github.com/zbeyens) –
  - Fix Markdown copied from VS Code pasting as a Markdown code block; it now pastes as headings, lists and marks
  - Paste code copied from VS Code as a code block at the caret, replacing an empty block, instead of after the current block
  - Paste text copied from a plain-text file in VS Code as plain text instead of a code block

## 54.0.0-beta.4

### Patch Changes

- [`3a568a1`](https://github.com/udecode/plate/commit/3a568a1a718270551a0585ee86b0c2d8e2145272) by [@sin6626](https://github.com/sin6626) –

  - Fix `BlockPlaceholderPlugin` drawing its placeholder on top of the editor `placeholder` when the editor holds only an empty list item. Only the editor placeholder shows there now, and an editor without a `placeholder` still shows the block placeholder on that item.

- [`df47a83`](https://github.com/udecode/plate/commit/df47a83b35087f809937f4f1e8a203160c618e1b) by [@zbeyens](https://github.com/zbeyens) –

  - Add `exportPicture({ format, kit })` to `useBoardActions()` in `platejs/board/react`. It draws the board, or the selected shapes and frames, as a PNG or an SVG with the static plugins in `kit`, which may be a promise such as a dynamic import. It resolves `null` when there is nothing to draw, and rejects when the board is not on the page.
  - Add the `BoardPicture`, `BoardPictureOptions` and `BoardPictureWarning` types. A picture's warnings name each image it could not read and each shape it could not draw, and say when a font could not be embedded or a large PNG was scaled down.

- [`6016f0d`](https://github.com/udecode/plate/commit/6016f0da5257dc6752e84cc43e51e7e96b73b0dc) by [@zbeyens](https://github.com/zbeyens) –

  - Fix a comment thread whose text was deleted still reading as attached over nothing. Its range now reads `status: 'unavailable'` until its text comes back, such as through undo, and `idsAt` no longer answers it at the spot where its text was.
  - Refuse to create, send or publish a thread over a range that covers no letter and no embedded item, as for a draft whose selected text was deleted before it was sent. Starting a draft over such a range between two blocks takes the first block.
  - Load a saved thread whose range covers nothing as unavailable.
  - Notify attachment listeners when a thread's text is deleted or comes back, even when its range keeps the same points, and answer `pendingRange()` with `null` once the pending draft's text is deleted.

- [`a752fda`](https://github.com/udecode/plate/commit/a752fda73b80e58a116dee1133fa586596d45b3b) by [@zbeyens](https://github.com/zbeyens) – Report a `lossy-content` diagnostic with the table's path when a review DOCX export includes a table that holds a pending row, column or table format change, also when the export returns the retained source file unchanged. Word's revisions cannot carry that change, so the default `lossPolicy: 'reject'` refuses the export. Pass `lossPolicy: 'allow'` to export the file with the warning.

- [`7428002`](https://github.com/udecode/plate/commit/74280028c1c3a0840d2ea5f983104206e85c6a5a) by [@zbeyens](https://github.com/zbeyens) – Fix `EditorRoot`'s `readOnly` letting a write through an `EditorContent` in the render that sets it. A write from a removed control's cleanup in that render now throws, also when the render removes, hides or suspends the `EditorContent`. An `EditorContent` with `readOnly={false}` stays writable.

- [`a8d490e`](https://github.com/udecode/plate/commit/a8d490eeddc3031ceea145693201a55ed46fc18d) by [@zbeyens](https://github.com/zbeyens) –

  - Accept `at: { id }` in node reads and transforms, including those that select by plugin, such as `editor.read.nodes.block({ at: { id }, type: BaseParagraphPlugin })`, and in the `insert` of date, mention, inline equation, field and footnote.
  - Remove `ElementIdPlugin`'s `read.entry(id)` and the `ElementIdEntry` type.

  **Migration:** Use `editor.read.nodes.byId(id)`. It returns `{ key, node, path, root? }`, or `null` instead of `undefined` when no element holds the id.

- [`c16a73c`](https://github.com/udecode/plate/commit/c16a73c0c5c24de614973e4d84f0c0f5f2743d78) by [@zbeyens](https://github.com/zbeyens) –

  - Add `read.submission(role)` to the field plugin. It returns a `FieldSubmission`, `{ role, values }`, with the `value` of each of that role's fields keyed by `fieldId`. A field with no `value` is left out.
  - Add `applyFieldValues(template, submissions, options?)` to `platejs/field`. It checks each role's submission against an empty template, in the order the roles submitted, and returns a `FieldApplyResult`: the filled document, the roles that still have to submit as `pending`, or the refusals as `FieldRefusal` objects. A required checkbox counts as answered only when it is ticked. Pass a renamed field type as `options.type`.

- [`a29e09a`](https://github.com/udecode/plate/commit/a29e09abe74b974301a09e51070f065c1e99227c) by [@zbeyens](https://github.com/zbeyens) –

  - Fix Markdown export writing document text that a CommonMark or GFM reader runs as HTML or reads as a script link, such as a tag in a details summary, in an equation's TeX or at the start of a footnote. Plate reads the exported file back as the same document.
  - Fix copying part of a code block writing its raw text into `text/markdown`. The copied code is now escaped Markdown text.

- [`828f500`](https://github.com/udecode/plate/commit/828f50035cbbfa158cb2412064a5f8268df7ba16) by [@zbeyens](https://github.com/zbeyens) –

  - Add `RawHtmlPlugin` to `platejs/markdown`. Installed beside `MarkdownPlugin`, it keeps a Markdown file's raw HTML, such as a README's centered header, and HTML comments on lines of their own. Export writes that HTML back when it passes a check of tags, attributes and URLs, and otherwise writes it escaped with a `markdown-unsafe-content` warning.
  - Keep raw HTML as plain text when `MarkdownPlugin`'s `plainMarks`, or a `serialize` call's, names `rawHtml`.
  - Drop a 53.x document's saved `rawHtml` in `migrateV54` where no plugin declares it, as `migrateV54` drops `ai`.
  - Refuse a 53.x document in `migrateV54` when a pending suggestion changes `ai` and no plugin declares `ai`, instead of opening a suggestion that loses the mark when accepted.

- [`3106db0`](https://github.com/udecode/plate/commit/3106db0d824bb0fa3334aa68f7a5e87e5668a909) by [@zbeyens](https://github.com/zbeyens) –

  - Add follow-up paste rules. A `defineInputRule` rule with `target: 'insertData'`, `resolve` and `followUp` runs `followUp` after a local paste that history saved, as its own undo step on the view that pasted.
  - Add `key` to an input rule's `editor`, which returns a node's stable key, as `editor.key` does.
  - Add `MediaEmbedRules.autoEmbed({ variant: 'paste' })` to `platejs/media`. A YouTube, Vimeo, Dailymotion, Youku, Coub or X link pasted alone on an empty paragraph becomes a media embed above that paragraph, and one undo gives the link back.

- [`64c3257`](https://github.com/udecode/plate/commit/64c32576914dc34edf9a3225da8bdc177bb50df8) by [@zbeyens](https://github.com/zbeyens) –

  - Run a `useEditorSelector` selector again when its editor shows a different review preview, so hooks built on it, such as `useFieldRead`, show what the preview shows.
  - Fix `renderStaticHtml` with a `document` option throwing while the editor shows a review preview.

- [`efacbf4`](https://github.com/udecode/plate/commit/efacbf43e864eace35725522795e62665067b7b7) by [@zbeyens](https://github.com/zbeyens) – Give each column its own width while a suggested column insertion or deletion waits. `api.table.columnWidths` and `read.table.cell` show a struck column at its old width and an inserted one at its new width. Column edges do not resize until the suggestion is decided, and `api.table.createResize` throws a `RangeError` for one; row edges still resize.

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
