# Embedded drawing canvases

Page: https://claude.ai/artifact/TizB11h9kY6spbRpx49oV3

Which document value and interaction contract should an embedded canvas expose without leaking its editor runtime? Plate's one embedded canvas is Excalidraw. `BaseExcalidrawPlugin` in `platejs/excalidraw` stores a drawing as JSON on a void `excalidraw` block. Its `data` holds Excalidraw's `elements`, its exported app `state` and, as an object keyed by file id, the image `files` the drawing references. The headless entrypoint imports nothing from Excalidraw. `useExcalidrawSync` in `platejs/excalidraw/react` keeps that node and a mounted canvas in step. A drawing edit saves once, panning or selecting saves nothing, a document change or document undo redraws the canvas without saving back, and read-only rejects writes. The copied `excalidraw` registry item loads Excalidraw lazily, sizes a fixed frame and marks the canvas wrapper with Plite's `data-editor-root-chrome-ignore` marker, so Plite leaves the canvas's pointer, keyboard, focus and DOM changes to Excalidraw, apart from the Undo and Redo shortcuts and a few narrower keys. The Plugin Components guide teaches that marker under Embedded widgets. That split landed with the 2026-09-07 UI extraction audit and is proven by `BaseExcalidrawPlugin.spec.ts`, the five `useExcalidrawSync.spec.tsx` cases and the Chromium browser test `apps/www/tests/browser/excalidraw.spec.ts`. The [2026-10-14 review](../2026-10-14-canvas-review.md) cut the stored type and field that did not match the data, and taught the marker. `node tooling/scripts/review-ledger.mjs show canvas` prints the review history.

## Public API

The copied kit installs the React plugin with the copied canvas component.

```tsx
// apps/www/src/registry/components/editor/excalidraw.tsx
export const ExcalidrawKit = [
  ExcalidrawPlugin.configure({ component: ExcalidrawElement }),
];
```

The insert toolbar inserts an empty drawing through the plugin's standard insert method.

```tsx
// apps/www/src/registry/components/editor/insert-toolbar-button.tsx
editor.update((tx) => {
  tx.plugin(BaseExcalidrawPlugin).insert({}, { select: true });
});
```

The copied component passes the lazily loaded Excalidraw module and its imperative API to the sync hook, and marks the canvas wrapper so Plite leaves its input alone.

```tsx
// apps/www/src/registry/components/editor/excalidraw.tsx
useExcalidrawSync({ api, excalidraw });

return (
  <EditorElement {...props}>
    <div contentEditable={false} data-editor-root-chrome-ignore="true">
      <div className="mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border">
        {Excalidraw && (
          <Excalidraw
            autoFocus={false}
            excalidrawAPI={setApi}
            initialData={initialData}
            viewModeEnabled={readOnly}
          />
        )}
      </div>
    </div>
    {children}
  </EditorElement>
);
```

The demo value stores a drawing on a void block. A stored drawing's type is `NonNullable<ExcalidrawElement['data']>`.

```tsx
// apps/www/src/registry/examples/values/excalidraw-value.tsx
<hexcalidraw {...excalidrawInitialData}>
  <htext />
</hexcalidraw>
```

## Document shape

Plate's schema check and the sync hook read the stored node. A stored `width` is an unknown property, and the v54 upgrade removes it from older documents.

```json
{
  "type": "excalidraw",
  "data": {
    "elements": [{ "id": "oDVXy8D6rom3H1-LLH2-f", "type": "rectangle" }],
    "state": { "viewBackgroundColor": "#AFEEEE" }
  },
  "children": [{ "text": "" }]
}
```

`data.files` is absent or an object keyed by file id. That is what Excalidraw's serializer writes and what `ExcalidrawElement['data']` declares. A string, an array or `null` there fails validation.

## Layer and owner

| Part | Layer | Package | Why |
| --- | --- | --- | --- |
| Stored drawing schema, with no Excalidraw import | Plate | `platejs/excalidraw`, the `excalidraw` entry of `tooling/entrypoints/entrypoint-dag.mjs` | The headless value contract needs no optional runtime peer, and the entrypoint lint refuses any Excalidraw import there. |
| Document and canvas sync | Plate | `platejs/excalidraw/react` | The no-echo, undo projection and read-only guards stay with the feature owner even with one consumer. |
| Upgrading v53 drawings | Plate | `platejs/migrations` | `migrateV54` drops a stored `width` unless the app's schema declares it for that node's root and parents. |
| The input marker | Plite owns the literal DOM protocol; Plate docs teach it | `content/docs` Plugin Components and Excalidraw pages | Copied UI applies Plite's literal markers. |
| Lazy loading, the frame, view-only mode and the marker | Registry UI | `apps/www/src/registry/components/editor/excalidraw.tsx` | Excalidraw's `viewModeEnabled` prop is a controlled input; while it is defined, Alt+R cannot leave view mode. |

## Hard cuts and app migration

- `ExcalidrawDataState` is gone. An app that typed Excalidraw's own input, such as `initialData`, imports Excalidraw's `ImportedDataState`. An app that typed a stored drawing reads `NonNullable<ExcalidrawElement['data']>` from `platejs/excalidraw`.
- The `excalidraw` element schema has no `width`. Documents coming from v53 lose it in `migrateV54`, unless the app's schema declares `width` for that node's type in that node's root and under its parents. A document saved on a v54 beta that still holds `width` fails to load with `Unknown element property "width" in closed editor schema.`
- Removing `width` and moving the validator to version 2 changed the schema fingerprint, even for documents with no drawing. What an app does depends on how it saves:
  - An app with a named schema bumps its `schema.version`, records the old fingerprint under `sourceFingerprints`, and adds a step that removes `width` from `excalidraw` nodes saved on a v54 beta.
  - An app on the default derived identity that saved `{ document, schema }` envelopes finds them refused, because the stored fingerprint no longer matches and `migrateDocument` accepts only a named lineage. It removes `width` from the saved `document`, loads `{ ...document, selection }` without the old stamp so the saved selection survives, and saves again under the current identity.
  - An app that saves the bare document removes `width` from `excalidraw` nodes before `createEditor`.
- A stored `files` value that is not an object is refused. The sync hook writes only the object Excalidraw serializes, so only hand-written data meets this.

## Main changes

- `packages/platejs/src/excalidraw/lib/BaseExcalidrawPlugin.ts` owns the `excalidraw` void block schema. `data` is validated JSON with an `elements` array, a `state` object and an optional `files` object, under `validationVersion: 2`. The element declares no other property.
- The v54 upgrade drops `width` from `excalidraw` nodes unless the target schema declares it, beside the media `name` drop.
- `migratePlateV54Ast` passes each node's root and parent types to its `ownsProperty` check, so neither drop removes a property an app declares only for one root or one parent.
- The headless `platejs/excalidraw` entrypoint lists no `@excalidraw/excalidraw` peer, so `entrypoint-dag(no-forbidden-imports)` refuses an Excalidraw import there.
- `packages/platejs/src/excalidraw/react/useExcalidrawSync.ts` owns document and canvas sync. Excalidraw's `serializeAsJSON(..., 'local')` filters transient state, a document change restores the scene with `captureUpdate: 'NEVER'` and clears canvas history, and read-only drops canvas writes.
- `apps/www/src/registry/components/editor/excalidraw.tsx` owns lazy loading, the mutable `initialData` copy, the fixed frame, view mode and the Plite input marker.
- Plite's `data-editor-root-chrome-ignore` marker is read by `input-controller.ts`, `root-interaction-resolver.ts` and `dom-integrity-observer.ts`; Plite's drop cursor and view-selection caret, Plate's node-selection highlight and the copied table resize handles use it too.

## What other editors do

On 2026-10-14 a Codex reader went through ProseMirror view at `ca4c78e9b56f1b164c0b3758b59d8748f11b7534`, Lexical at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, Slate at `945a484df2497e4c448b33f417b0de2a49840032`, Tiptap at `91c51be53c4655ef07e29ec489471524debfa0ca`, BlockNote at `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163` and Excalidraw at `214cd6e6e8ac3ad6b68486aa7aa7241abdf9445f`, source only, nothing run. Only Lexical ships an Excalidraw node. It stores Excalidraw's own `appState` key and a width and height, and those sizes have a reader and a writer because its document shows an SVG preview that a resize handle sizes, while the live canvas opens in a modal outside the editor. Every editor that embeds a live widget gives it its own events through an explicit boundary, a code callback in ProseMirror, Tiptap and BlockNote and the DOM itself in Lexical and Slate, and the editors that document it do so on their node or void API pages.

| Editor | Stored drawing value | Size stored | How the widget gets its own events | How the editor ignores its DOM changes | Documented |
| --- | --- | --- | --- | --- | --- |
| Lexical | `data`, a JSON string of Excalidraw's `{ appState, elements, files }` | Width and height, written by a resize handle on the SVG preview | Decorator DOM is unmanaged, and the live canvas sits in a modal portaled to `document.body` | Decorator mutations never reach the reconciler | Decorators and their mutation exemption, on the nodes concept page |
| ProseMirror | No drawing node; a node view receives its node | Not found | `NodeView.stopEvent`; a node view without `contentDOM` is non-editable | `NodeView.ignoreMutation`; non-selection mutations are ignored without `contentDOM` | The `NodeView` API reference |
| Slate | No drawing node; the embed example stores `url` | Not found; the examples size with CSS | `contentEditable={false}`, `data-slate-void` and editable-target checks | Mutations on non-editable targets are not tracked | The element docs require `contentEditable={false}` on void content |
| Tiptap | No drawing node; node attributes such as a counter's `count` | Image only, written by its resizable node view | `stopEvent` in node view options; `data-drag-handle` marks only where dragging starts | `ignoreMutation`, with atom and `contentDOM` defaults | No guide found; types and demos only |
| BlockNote | No drawing node; the embed example stores `props.src` | Video `previewWidth` only | A `stopEvent` that takes every event for non-selectable blocks | A wrapper ignores mutations outside `contentDOM` | `selectable: false` on the custom blocks page |
| Excalidraw | `serializeAsJSON` writes `type`, `version`, `source`, `elements`, `appState` and, for `local`, the referenced `files` | Element sizes only; viewport size is never exported | No host boundary of its own | No host boundary of its own | Its upstream `restore` docs name an export its main branch no longer has |

## Open work

- Replace the hook's `restore` parameter with `restoreElements` and `restoreAppState`, which Excalidraw 0.18.0 and its main branch both export, when the app upgrades past 0.18.0. A copy passes the whole module, so the change breaks only a caller that hand-builds the object. owner: zbeyens. stop: the `@excalidraw/excalidraw` upgrade that drops `restore`.
- Undo while an Excalidraw text label is open runs document history and redraws the scene, but the open label editor keeps its old text. Closing the label writes that text back whenever the label's element survives the undo. The diff panel traced this in the installed 0.18.0 source; nobody has driven it in a browser. The Excalidraw page documents the limit. Fix the sync, for example by closing an open label before projecting a document change. owner: zbeyens. stop: a browser repro and a fix or a documented limit land.
- Undo and Redo pressed inside a nested editor, such as the Editable Voids demo's inner editor, run the outer editor's history, so the inner editor's own history is unreachable from the keyboard. A browser run confirmed it, and the Editable Voids page states it as a limitation. Fixing it means Plite routing history keys to a nested editor's own runtime. owner: zbeyens. stop: a Plite plan for nested-editor history routing.
- The v54 Profile step (`migratePlateV54Profile.internal.ts`) still asks `ownsProperty` without the node's root or parents, so its renames and drops can miss a property an app declares for one root or parent. owner: zbeyens. stop: a plan that reopens the v54 migration profile.
- The Excalidraw browser spec checks that the canvas Undo is disabled after a projected document change, but the canvas history is already empty there, so the check cannot catch a hook that stops clearing it. The hook's unit spec does catch that. Draw a shape and assert the canvas Undo enabled before the projection. owner: zbeyens. stop: the next edit to `apps/www/tests/browser/excalidraw.spec.ts`.
- Time the v53 upgrade with the context walker on a quiet host. The frozen line is a median paired ratio of at most 1.10 against `6fa1169c5e` on four cohorts, with a one-minute load limit of 9; the Open work of the [2026-10-14 review](../2026-10-14-canvas-review.md) describes the probe. A conclusive miss sends the walker back to `architect`. owner: zbeyens. stop: a conclusive run, or the next edit to `migratePlateV54Ast.internal.ts`.
