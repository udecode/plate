# Media values, captions and embeds

Page: https://claude.ai/artifact/T2iAWr25Th5E7Voiitcmvu

What belongs to persisted media content, captions and display, and which application behavior should stay outside the node? Image, file, audio, video and embed blocks are Plite object-role blocks: the media body is one selectable object, and the caption is ordinary editable text in the block's own children, in the same document. Plate media owns URL policy and caption Enter, and the copied registry UI owns the caption's placeholder and when it shows. Plite's generic caret engine owns the arrow-key stops: the media owner is a stop before its caption, and ArrowUp at the caption start returns to the owner. Since 2026-10-13 the engine reads the page for two facts. A caption is a caret stop only while the page draws it, apart from one backward stop in a mounted empty caption, and left and right follow the direction of the block that holds the caret. Model, clipboard and browser proof for the object design landed on 2026-09-22 ([object elements design](../2026-09-21-object-elements-with-editable-children.md)), and `apps/www/tests/browser/media-caption.spec.ts` covers caption traversal, hidden captions and mixed direction in Chromium and WebKit.

## Public API

Each media block declares the object role on its schema element, so its body selects as one unit while its children stay editable text.

```ts
// packages/platejs/src/features/media/lib/image/BaseImagePlugin.ts
export const BaseImagePlugin = definePlugin(PLUGINS.image, {
  initialState,
  schema: {
    element: schema.element.textBlock({
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('image'),
          validationVersion: 1,
        }),
```

The copied media kit installs the five media plugins with their copied components.

```tsx
// apps/www/src/registry/components/editor/media.tsx
export const MediaKit = [
  imagePlugin.configure({
    component: ImageElement,
    slots: { afterEditable: MediaPreviewDialog },
  }),
  MediaEmbedPlugin.configure({ component: MediaEmbedElement }),
  VideoPlugin.configure({ component: VideoElement }),
  AudioPlugin.configure({ component: AudioElement }),
  FilePlugin.configure({ component: FileElement }),
];
```

The copied image component decides when its caption shows: while the image is selected or the caption holds the caret, and otherwise only when the caption has text.

```tsx
// apps/www/src/registry/components/editor/media-image.tsx
<Caption
  active={selected || captionFocused}
  align={textAlign}
  element={props.element}
  slots={props.slots}
>
  {props.children}
</Caption>
```

Plite's caret engine enters a caption from below only when the page draws its text, so copied UI can change that rule without breaking navigation.

```ts
// packages/plitejs/src/react/editable/caret-engine.ts
const captionEnd = editor.read((state) => state.points.end(owner.path));

if (
  captionEnd &&
  isObjectTextDrawn(editor, owner.path, captionEnd.path)
) {
```

## Main changes

- Plite's schema owns the object role (`schema.element.textBlock({ object: true })`, `schema.isObject(node)`): structural isolation, owner `NodeSelection` and whole-block transfer, with the caption kept as open child text.
- Plite's caret engine (`packages/plitejs/src/react/editable/caret-engine.ts`) owns the arrow-key stops around an object. A child text is a stop only while no element from it up to its owner computes `display: none` or `content-visibility: hidden` and it does not compute `visibility: hidden`. A backward horizontal move keeps one stop in a mounted empty child. Left, right and the collapse of a selection read the computed direction of the lowest block holding the caret, or of the selected object.
- Plate media (`packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`) owns URL normalization against each role's floor and caption Enter.
- The copied `Caption` (`apps/www/src/registry/components/editor/caption.tsx`) owns the placeholder and hides an empty caption unless its media is active.

## Layer and owner

An image stays meaningful content when its caption is empty: its body selects, copies, moves and deletes as a whole, while a text selection in its caption keeps text semantics.

| Responsibility | Decision |
| --- | --- |
| Object role | Plite's neutral schema fact, `schema.element.textBlock({ object: true })`, compiled as `object: boolean` and read with `schema.isObject(node)`. Block-only, non-void, non-atom, selectable and structurally isolating; selection-shaped transfer stays open for descendant text. Whole-node selection transfers the owner. |
| `atom` | A separate fact: descendants are not traversable. |
| Owner selection | Derives privately from object or atom semantics. |
| Caption deletion | A fully selected caption stays child text; Delete clears it and leaves the caret in the caption, and Undo keeps the owner. |
| Type conversion | Schema-default block reset, with compatible-property preservation. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| `isolating + keyboardSelectable` flags | `replaceEmpty` removed an empty-caption image, and three caption characters exported as an image; `keyboardSelectable` is deleted. |
| `atom` for media | Collapsed caption traversal. |
| A persisted caption node, nested editor, separate root or generic object plugin | No independent job; one document with ordinary children serves it. |
| A public intrinsic-content axis | Waits for a non-object consumer. |
| A media-specific navigation plugin or public flag | The generic caret engine owns the stops. |

## What other editors do

Read from source at ProseMirror view `ca4c78e9b56f1b164c0b3758b59d8748f11b7534`, Lexical `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, Slate `945a484df2497e4c448b33f417b0de2a49840032` and Tiptap `91c51be53c4655ef07e29ec489471524debfa0ca`; none was run. ProseMirror leaves vertical entry into a node with editable content to the browser, so what is rendered decides, and Lexical and Slate pick the arrow direction per block.

| Editor | Caption model | ArrowUp from below into a caption | Horizontal arrow direction |
| --- | --- | --- | --- |
| ProseMirror | A node with a `contentDOM`, such as a figure with a figcaption | `selectVertically` takes over only when the next stop is a selectable leaf; otherwise the browser moves the caret, so a hidden caption is skipped and a visible one is entered | `findDirection` reads neighboring character coordinates, except in Chrome and on Windows, where it reads the editor root's computed direction |
| Lexical | A nested editor inside the image decorator, shown when the stored `showCaption` flag is true | The nested editor is a separate focus target; the stored flag decides whether it exists | `$isParentElementRTL` reads the computed direction of the selection's block |
| Slate | No object role; captions need a void plus an app input | Browser default around voids | `getDirection` on the focused block's text picks the arrow direction |
| Tiptap | ProseMirror nodes; the image extension has no caption | Same as ProseMirror | Same as ProseMirror |

## Open work

- `caret-engine.ts` is past a thousand lines; move the object-owner helpers into their own module. owner: zbeyens. stop: the next refactoring audit of the plitejs editable folder, or the next owner-stop change to that file.
- The media caption spec copies the model-selection read eight times. owner: zbeyens. stop: `@platejs/test` gains a model-selection getter, or this spec is next restructured.
- Content-root and projected-view navigation keep their own direction reads. owner: zbeyens. stop: a probe that shows a wrong arrow there, or the next content-root navigation change.
- Alt, Shift, Cmd, Home and End arrows skip the owner-stop path and can still land in a hidden caption. owner: zbeyens. stop: a modifier-key navigation plan.
- `getSelectableOwnerAncestorNodeSelection` never checks `isSelectable`, unlike `getSelectableOwnerNodeSelection`. owner: zbeyens. stop: the next change to `selection-void-target.ts`.
- A caption with several text leaves still picks its caret column from the last leaf. owner: zbeyens. stop: a multi-leaf caption bug or a hit-testing redesign.
- `docs/research/sources/plite/selection-and-caret.md` line 39 cites old line numbers in the caret engine. owner: zbeyens. stop: the next edit to that source note.
- The vertical target is computed twice per vertical key, in `runtime-keyboard-events.ts` and `keyboard-input-strategy.ts`, so the drawn check runs twice at object boundaries. owner: zbeyens. stop: the next performance pass on keyboard navigation.
- An empty caption that app CSS hides for good keeps one invisible backward stop, because the engine guesses from empty model text that the stock caption shows once it holds the caret. Comment review proposed that the rendered caption declare it shows on caret, through a mounted attribute the engine reads; that is a contract between copied UI and Plite and needs its own plan. owner: zbeyens. stop: an app reports it, or a law change to `EDIT-CAPTION-NAV-003`.
- The drawn check misses captions hidden by zero size, `opacity: 0`, clipping or off-screen placement. owner: zbeyens. stop: an app hides a caption that way, or the next change to `isObjectTextDrawn`.
- Run the media caption spec in Firefox from a normal terminal: `pnpm --filter www test:www-browser:firefox tests/browser/media-caption.spec.ts`. owner: zbeyens. stop: one Firefox run passes or names a failure.
- Compare per-key time with interleaved runs against a server on the code before this run. owner: zbeyens. stop: the next performance pass on keyboard navigation.
- The Chinese selection guide has no object-elements section. owner: zbeyens. stop: the next Chinese docs sync.
