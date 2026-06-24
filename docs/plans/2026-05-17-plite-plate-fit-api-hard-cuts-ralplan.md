# Plite Plate-fit API hard cuts ralplan

Date: 2026-05-17
Status: done
Owner: Plite Ralplan planning only
Execution owner: `ralph` in `Plate repo root`
Completion id: `019e1fc0-dba0-7de1-9236-b484a144cda6`
Score: 0.92, ready for Ralph execution

## Verdict

Harsh answer: the last editable-capabilities plan was still too Plate-shaped.

It correctly spotted that public `capabilities` authoring is bad DX. It then
overcorrected by inventing `editable.keymap`, `editable.renderers`, and
`editable.onCommand` as a nicer public shape. That is still a plugin framework
inside raw Plite.

Plite should hard-cut the Plate-fit layer:

- cut public `editableKeyCommands(...)`;
- cut public `editableRenderers(...)`;
- cut the planned `editable.keymap` API before it exists;
- cut the planned `editable.renderers` facet before it lands;
- cut public `Editable onCommand` / `EditableCommand` as normal app DX;
- keep `Editable onKeyDown`, `onDOMBeforeInput`, `onPaste`, and `render*`
  props as raw Plite React escape hatches;
- keep `transforms.*`, `queries`, `normalizers`, `state`, and `tx` as Plite
  extension substrate;
- keep `clipboard.insertData` as a DOM/clipboard ingress extension facet, but
  stop authoring it through string `capabilities`;
- keep `editor.api.*` for mounted runtime handles such as DOM, clipboard, and
  history controls;
- keep `capabilities` as internal registry machinery only, not public examples
  or app authoring.

This means the public raw Plite examples should become more Plite-ish, not more
Plate-ish:

```tsx
<Editable
  renderElement={renderElement}
  renderLeaf={renderLeaf}
  onKeyDown={(event, { editor }) => {
    if (isHotkey("mod+b", event)) {
      toggleMark(editor, "bold");
      return true;
    }
  }}
/>
```

Reusable model behavior still belongs in extension middleware:

```ts
const checklist = () =>
  defineEditorExtension<CustomEditor>()({
    name: "checklist",
    transforms: {
      deleteBackward({ editor, next }) {
        if (applyChecklistBackspaceStart(editor)) return;
        next();
      },
    },
  });
```

Clipboard ingress is different from model transforms:

```ts
const image = () =>
  defineEditorExtension<CustomEditor>()({
    name: "image",
    elements: [{ type: "image", void: "editable-island" }],
    clipboard: {
      insertData(data, { editor, next }) {
        if (!hasImage(data)) return next();

        editor.update((tx) => {
          tx.nodes.insert(createImage(data));
        });
        return true;
      },
    },
  });
```

Plate should own the nice product API:

```ts
const RichTextPlugin = createPlatePlugin({
  key: 'richText',
  render: { ... },
  shortcuts: { toggleBold: { keys: [[Key.Mod, 'b']] } },
  inputRules: [ ... ],
  pasteRules: [ ... ],
})
```

## Intent And Boundary

| Field                | Record                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Identify APIs currently in Plite, or planned for Plite, that are really Plate/product-layer APIs.                                                  |
| Desired outcome      | Ralph can hard-cut these Plite public APIs, rewrite examples/docs/tests, and leave Plate free to build richer keymap/render/input-rule/plugin DX on top. |
| In scope             | Public `slate`, `plite-react`, `plite-dom`, examples, docs, public-surface tests, PR reference, issue ledger rows for API shape.                         |
| Non-goals            | Implementing the cuts in Plite Ralplan; designing Plate's final plugin API; removing low-level runtime internals; preserving backward compatibility.     |
| Decision boundary    | Breaking changes are allowed. Raw Plite must stay low-level and unopinionated. Plate can fully migrate to the cleaner substrate.                         |
| User decision needed | None. Repo evidence and prior user direction are enough to hard-cut public Plate-shaped APIs.                                                            |

Weakest assumption:

- Previous plans treated "feature-owned setup should live together" as enough
  justification to add Plite extension facets for React renderers and keymaps.
  That assumption is too broad. It is true for Plate plugins. It is not
  automatically true for raw Plite.

Intent-boundary pass result:

- Public `onCommand` is not shrunk into `onNativeInputIntent`. It is cut from
  public app DX. If native-format input still needs semantic routing, that stays
  internal/runtime-owned and must be proven against #3568/#3586; public users
  keep raw `onDOMBeforeInput` plus model middleware.
- `Editable decorate` stays as a raw Plite React render-time callback. Docs can
  steer persistent/async/perf-sensitive overlays to projection or annotation
  sources, but cutting `decorate` would break a classic low-level escape hatch
  without replacing it with something simpler.
- `capabilities` becomes internal registry plumbing. Do not document it as an
  advanced public authoring API. Public extension authors get named package
  facets such as `api`, `clipboard`, `transforms`, `state`, and `tx`.
- No user question is needed. The missing decisions are architecture calls, not
  product preference questions.

## Live Current State

| Surface                     | Live source                                                                                    | Current shape                                                                                                                                      | Verdict                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Public extension shape      | `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:1292`                     | `EditorExtension` and registration output expose `capabilities?: Record<string, unknown \| readonly unknown[]>`.                                   | Cut from public authoring; keep only internal/advanced registry substrate.                                    |
| Capability install path     | `/Users/zbeyens/git/plite/packages/plite/src/core/editor-extension.ts:347`                  | Every `slots.capabilities` entry registers into the extension registry.                                                                            | Internal substrate is fine; public string maps are not.                                                       |
| `editor.api`                | `/Users/zbeyens/git/plite/packages/plite/src/create-editor.ts:813`                          | `editor.api.<name>` proxies registered capabilities.                                                                                               | Keep for mounted runtime handles; replace public capability authoring with typed `api` authoring.             |
| `editor.getApi`             | `/Users/zbeyens/git/plite/packages/plite/src/create-editor.ts:835`                          | Resolves a handle from extension `capabilities`.                                                                                                   | Keep concept; update implementation if raw `capabilities` is hidden.                                          |
| Public key helper           | `/Users/zbeyens/git/plite/packages/plite-react/src/editable/editable-key-commands.ts:7`     | `editableKeyCommands(...)` stores handlers under `plite-react.editable.keyCommand`.                                                                | Cut. Plate owns keymap/shortcut registries.                                                                   |
| Public renderer helper      | `/Users/zbeyens/git/plite/packages/plite-react/src/editable/editable-renderers.ts:14`       | `editableRenderers(...)` stores element/leaf/text/void renderer maps under a capability key.                                                       | Cut. Plate owns renderer/component registries. Raw Plite keeps `render*` props.                               |
| Public exports              | `/Users/zbeyens/git/plite/packages/plite-react/src/index.ts:73`                             | Exports `EDITABLE_KEY_COMMAND_CAPABILITY`, `editableKeyCommands`, `EDITABLE_RENDERERS_CAPABILITY`, and `editableRenderers`.                        | Cut exports.                                                                                                  |
| Editable props              | `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:594` | `Editable` exposes `decorate`, `onDOMBeforeInput`, `onCommand`, `onKeyDown`, `onPaste`, `renderElement`, `renderLeaf`, `renderText`, `renderVoid`. | Keep raw callbacks except public `onCommand`; that semantic command DSL is too product-shaped.                |
| Public command union        | `/Users/zbeyens/git/plite/packages/plite-react/src/editable/editable-command-types.ts:3`    | `EditableCommand` includes `format`, `history`, `set-block`, `toggle-mark`, etc.                                                                   | Cut from public app DX; keep internal runtime command classification if needed.                               |
| Docs/test lock-in           | `/Users/zbeyens/git/plite/packages/plite-react/test/surface-contract.tsx:390`               | Contract expects docs to teach `editableRenderers`.                                                                                                | Flip this test. It currently guards the wrong lesson.                                                         |
| Hotkey docs/test lock-in    | `/Users/zbeyens/git/plite/packages/plite-react/test/surface-contract.tsx:459`               | Contract expects hotkey examples to use `editableKeyCommands` and not `onKeyDown`.                                                                 | Flip. Raw Plite examples may use `onKeyDown`; reusable model behavior uses transform middleware.              |
| Richtext example            | `/Users/zbeyens/git/plite/site/examples/ts/richtext.tsx:293`                                | One extension mixes `editableRenderers`, `editableKeyCommands`, string `clipboard.insertData`, and casts editor to `CustomEditor`.                 | Rewrite. This is the exact smell.                                                                             |
| Markdown example            | `/Users/zbeyens/git/plite/site/examples/ts/markdown-shortcuts.tsx:183`                      | Uses transform middleware for typed shortcuts, but renderer registration still uses `editableRenderers`; `onCommand` handles Enter behavior.       | Keep transform middleware; replace render helper and `onCommand`.                                             |
| Checklist example           | `/Users/zbeyens/git/plite/site/examples/ts/check-lists.tsx:81`                              | Good `transforms.deleteBackward`; bad `editableRenderers` capability helper.                                                                       | Keep transform middleware; render with raw `Editable` prop or move renderer packaging to Plate.               |
| DOM clipboard API           | `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/with-dom.ts:270`                    | `dom()` registers `clipboard` and `dom` handles through capabilities.                                                                              | Keep public `editor.api.dom` / `editor.api.clipboard`; change public authoring word away from `capabilities`. |
| History API                 | `/Users/zbeyens/git/plite/packages/plite-history/src/history-extension.ts:177`              | `history()` exposes `state.history`, `tx.history`, and `api.history` controls through capabilities.                                                | Keep. Not Plate. History is editor runtime substrate.                                                         |
| Already-cut public commands | `/Users/zbeyens/git/plite/packages/plite/test/extension-methods-contract.ts:34`             | Public extension `commands` are rejected.                                                                                                          | Preserve. Do not revive command slots as keymap.                                                              |
| Root public command helpers | `/Users/zbeyens/git/plite/packages/plite/test/public-surface-contract.ts:400`               | `defineCommand`, `registerCommand`, and `executeCommand` are not root exports.                                                                     | Preserve.                                                                                                     |
| Input rules                 | `/Users/zbeyens/git/plite/packages/plite-react/test/surface-contract.tsx:478`               | Tests reject example-owned `EditableInputRule` types.                                                                                              | Already hard-cut direction; keep it cut.                                                                      |

## Hard-Cut Matrix

| API                                                                                  | Status                    | Why                                                                                                                                            | Replacement                                                                                                                                                      |
| ------------------------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EditorExtension.capabilities` in public object authoring                            | cut                       | String-key registry plumbing is not an authoring API.                                                                                          | Internal registry plus public `api` for handles and specific package facets only where the package owns a primitive.                                             |
| `EditorExtensionRegistrationOutput.capabilities` as normal public docs/examples      | cut                       | Same string-key leak, worse because it teaches late runtime records.                                                                           | Internal/advanced; examples use `api`, `clipboard`, `transforms`, `state`, `tx`.                                                                                 |
| `editableKeyCommands(...)`                                                           | cut                       | It is keymap/shortcut registry DX. That is Plate.                                                                                              | Raw Plite: `Editable onKeyDown` for app UI, `transforms.*` for model commands, Plate `shortcuts` for feature packages.                                           |
| `EDITABLE_KEY_COMMAND_CAPABILITY`                                                    | cut                       | Public capability key invites authors back into registry maps.                                                                                 | Internal constant only if runtime still needs it during migration.                                                                                               |
| Planned `editable.keymap`                                                            | cut before implementation | Nicer name, same product concept.                                                                                                              | Plate `shortcuts` / `keymap`.                                                                                                                                    |
| `editableRenderers(...)`                                                             | cut                       | Renderer/component registries are plugin-framework API. Raw Plite already has `renderElement`, `renderLeaf`, `renderText`, `renderVoid`.       | Raw Plite render props; Plate plugin components/render registry.                                                                                                 |
| `EDITABLE_RENDERERS_CAPABILITY`                                                      | cut                       | Same public registry leak.                                                                                                                     | Internal only during migration if needed.                                                                                                                        |
| Planned `editable.renderers` facet                                                   | cut before implementation | Better typed, still the wrong owner.                                                                                                           | Plate owns bundled component maps; raw Plite examples keep module-level render callbacks.                                                                        |
| `<Editable onCommand>`                                                               | cut from public app DX    | `EditableCommand` includes product commands like `toggle-mark` and `set-block`; that makes Plite React define editor semantics it cannot know. | `onDOMBeforeInput` and `onKeyDown` escape hatches; model behavior via transform middleware; internal native-format routing only where package proof requires it. |
| `EditableCommand*` public types                                                      | cut from public export    | The command union is internal runtime classification, not a public app/plugin contract.                                                        | Internal-only native input classification if needed; no public `onNativeInputIntent` in this plan.                                                               |
| Public `EditableInputRule*` / `editableInputRules(...)`                              | already cut, keep cut     | Plate owns semantic input-rule families, triggers, priorities, resolve/apply.                                                                  | Transform middleware for raw model behavior; Plate input rules for product features.                                                                             |
| Public extension `commands` slot                                                     | already cut, keep cut     | Command slots become a second plugin system and bypass `state` / `tx`.                                                                         | `transforms`, `queries`, `normalizers`, `operationMiddlewares`, `commitListeners`.                                                                               |
| Product examples that package toolbar/keymap/render/paste in one raw Plite extension | cut/rewrite               | This is Plate plugin shape in first-party Plite examples.                                                                                      | Split raw Plite examples: render props on `Editable`, model behavior in `extensions`, paste in `clipboard`.                                                      |

## Keep Matrix

| API                                                                 | Status         | Why                                                                                                             |
| ------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| `defineEditorExtension(...)`                                        | keep           | Plite needs one extension substrate for model/runtime behavior.                                                 |
| `extensions: [...]` creation-time install                           | keep           | One composition path beats `with*` wrappers and runtime `editor.extend` as public app DX.                       |
| `transforms.*` middleware                                           | keep           | Closest clean replacement for old `withX(editor)` method override behavior.                                     |
| `queries`, `normalizers`, `operationMiddlewares`, `commitListeners` | keep           | These are engine substrate, not Plate product API.                                                              |
| `state` and `tx` extension namespaces                               | keep           | Replayable read/write extension groups are the right typed home.                                                |
| `<Editable renderElement/renderLeaf/renderText/renderVoid>`         | keep           | This is the classic raw Plite React customization model and the least opinionated rendering API.                |
| `<Editable onKeyDown/onDOMBeforeInput/onPaste>`                     | keep           | Raw browser/React escape hatches belong in raw Plite.                                                           |
| `clipboard.insertData` facet                                        | keep/revise    | Clipboard ingress is a DOM pipeline primitive. Keep it as typed package facet, not string capability authoring. |
| `editor.api.dom`, `editor.api.clipboard`, `editor.api.history`      | keep           | Mounted runtime handles are not replayable `state` / `tx`, and they are not Plate concepts.                     |
| `isHotkey`                                                          | keep           | Low-level DOM utility. A keymap registry is Plate; a matcher function is fine.                                  |
| rendering strategy and metrics                                      | keep advanced  | Performance/runtime substrate, not product plugin DX. Keep experimental where applicable.                       |
| annotation/projection stores                                        | keep substrate | Comments UI belongs to Plate/app, but raw Plite React needs overlay/projection primitives.                      |

## Before / After Shapes

### Rendering

Current docs/examples:

```ts
const paragraph = () =>
  defineEditorExtension({
    name: "paragraph",
    capabilities: editableRenderers({
      elements: { paragraph: ParagraphElement },
    }),
  });
```

Target raw Plite:

```tsx
const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case "paragraph":
      return <ParagraphElement {...props} />;
  }
};

<Editable renderElement={renderElement} />;
```

Target Plate:

```ts
const ParagraphPlugin = createPlatePlugin({
  key: "paragraph",
  node: { component: ParagraphElement },
});
```

### Hotkeys

Current:

```ts
capabilities: {
  ...editableKeyCommands(({ editor, event }) => {
    if (isHotkey('mod+b', event)) {
      toggleMark(editor as CustomEditor, 'bold')
      return true
    }
  }),
}
```

Target raw Plite:

```tsx
<Editable
  onKeyDown={(event, { editor }) => {
    if (isHotkey("mod+b", event)) {
      toggleMark(editor, "bold");
      return true;
    }
  }}
/>
```

Target Plate:

```ts
const BoldPlugin = createPlatePlugin({
  key: "bold",
  shortcuts: { toggle: { keys: [[Key.Mod, "b"]] } },
});
```

### Model Behavior

Current good direction:

```ts
defineEditorExtension({
  name: "checklist",
  transforms: {
    deleteBackward({ editor, next }) {
      if (applyChecklistBackspaceStart(editor)) return;
      next();
    },
  },
});
```

Target: keep it. This is Plite, not Plate.

### Clipboard

Current:

```ts
capabilities: {
  'clipboard.insertData': ((editor, data) => {
    // paste behavior
  }) satisfies DOMClipboardInsertDataHandler,
}
```

Target:

```ts
defineEditorExtension({
  name: "html-paste",
  clipboard: {
    insertData(data, { editor, next }) {
      if (!data.types.includes("text/html")) return next();
      // paste behavior
      return true;
    },
  },
});
```

This does not conflict with `transforms.*`. `clipboard.insertData` decides how a
browser `DataTransfer` enters the editor. `transforms.*` defines reusable model
mutations after input has been interpreted.

## Decision Brief

Principles:

1. Raw Plite exposes primitives and escape hatches, not feature frameworks.
2. React package APIs should be React/runtime-shaped, not Plate plugin-shaped.
3. Model behavior belongs in core extension middleware, not browser event
   string registries.
4. DOM ingress belongs to `plite-dom` / `plite-react` package facets, not
   generic registry strings.
5. Plate owns product-level packaging: shortcuts, keymaps, components, render
   registries, input rules, paste rules, toolbar command catalogs.

Top drivers:

1. Prevent raw Plite from becoming a half-Plate plugin framework.
2. Preserve the Plite mental model for users coming from legacy Plite:
   render props, browser event props, and editor method/transform behavior.
3. Keep the extension substrate strong enough for Plate and slate-yjs without
   exposing every product convenience in raw Plite.

Viable options:

| Option                                                                                                                              | Pros                                                            | Cons                                                                                               | Verdict |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| Keep previous facet plan: `editable.keymap`, `editable.renderers`, `editable.onCommand`                                             | Typed, composable, fewer casts than `capabilities`.             | Still product/plugin API in raw Plite; duplicates Plate; moves away from Plite render/event props. | Reject. |
| Keep only raw `<Editable>` props and no extension behavior                                                                          | Simple and Plite-classic.                                       | Regresses reusable model behavior and misses old `withX(editor)` override coverage.                | Reject. |
| Keep raw props for React/UI, transform/query/normalizer middleware for model behavior, and a narrow clipboard facet for DOM ingress | Plite-ish, low-level, migration-friendly, avoids Plate leakage. | Examples may use more explicit callbacks; Plate must own nicer packaging.                          | Choose. |
| Move every higher-level extension facet to Plate, including clipboard                                                               | Clean boundary.                                                 | Too hard. Clipboard ingress is a core DOM pipeline and issue-backed API pressure.                  | Reject. |

Consequences:

- Some first-party Plite examples become less "packaged" and more explicit.
- Plate gets the polished plugin API story instead of raw Plite pretending to be
  a plugin framework.
- The previous editable-capabilities plan needs revision, not execution as-is.
- Native-format input proof must move out of public `EditableCommand` DX before
  `onCommand` is removed. This is a regression guard, not a reason to keep the
  public command API.
- Persistent or async overlays should prefer projection/annotation sources, but
  raw `decorate` stays for simple render-time decoration.
- Any future public registry-like authoring API must be a named package facet.
  `capabilities` is not that API.

Rejected boundary:

- Do not ask Plate migration to preserve raw Plite's temporary helper APIs.
  Plate gets to migrate straight to its own plugin language on top of the
  Plite substrate.

Pass closure:

- Intent, outcome, scope, non-goals, decision boundaries, and unresolved user
  decisions are explicit.
- No user question remains.

## Ecosystem Strategy Synthesis

| System      | Source                                                                                                                                                                                   | Mechanism                                                                                     | Avoids                                     | Steal                                                                   | Reject                                                                          | Plite target                                          | Verdict                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| Tiptap      | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:25-39`                                                                                                   | Extensions package commands, shortcuts, input rules, paste rules, editor props, and UI hooks. | Scattered feature setup.                   | Let Plate copy the product packaging lesson.                            | Do not copy Tiptap's product command/keymap/component package as raw Plite API. | Plite keeps substrate; Plate owns product packaging.  | diverge for Plite, agree for Plate |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md:27-39`                                                                                            | Transactions own state; view/input owns DOM events; decorations are view data.                | DOM event/model mutation confusion.        | Keep DOM bridge centralized and model behavior in transform middleware. | Do not expose ProseMirror plugin complexity as normal Plite authoring.          | Raw callbacks plus extension middleware.              | agree                              |
| Lexical     | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md:34-47`                                                                                               | Read/update lifecycle, commands inside update, extensions bundle registration/runtime output. | Ad hoc monkeypatching and lifecycle leaks. | Extension lifecycle, dirty runtime, command substrate.                  | Do not make commands normal user-facing mutation API.                           | `editor.read`, `editor.update`, state/tx, transforms. | partial                            |
| Plate       | `/Users/zbeyens/git/plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:94-180`, `/Users/zbeyens/git/plate/packages/core/src/lib/editor/PliteEditor.ts:162-184` | Plugins own shortcuts/input rules/render/component/meta/api/tf.                               | Feature setup spread across app glue.      | Keep it in Plate.                                                       | Do not put the same vocabulary in raw Plite.                                    | Plite substrate; Plate product API.                   | agree                              |

## Research And Ecosystem Live Refresh Pass

Pass result: complete.

Mode: research-layer maintain plus local source refresh. Existing compiled
research was strong enough; no new research page was needed. The research log
records this pass.

Live local source evidence:

| System      | Current source read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Finding                                                                                                                                                   | Plan effect                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tiptap      | `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts:123`; `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts:142`; `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts:166`; `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts:188`; `/Users/zbeyens/git/tiptap/packages/core/src/Node.ts:13`; `/Users/zbeyens/git/tiptap/packages/extension-bold/src/bold.tsx:111`; `/Users/zbeyens/git/tiptap/packages/extension-link/src/link.ts:350`                                                 | Tiptap feature packages bundle commands, keyboard shortcuts, input rules, paste rules, ProseMirror plugins, node views, and render output.                | Confirms this is product/plugin DX. Plate should copy this shape; raw Plite should not.                                                                           |
| ProseMirror | `/Users/zbeyens/git/prosemirror/state/src/plugin.ts:7`; `/Users/zbeyens/git/prosemirror/state/src/plugin.ts:68`; `/Users/zbeyens/git/prosemirror/view/src/index.ts:604`; `/Users/zbeyens/git/prosemirror/view/src/index.ts:632`; `/Users/zbeyens/git/prosemirror/view/src/index.ts:663`; `/Users/zbeyens/git/prosemirror/view/src/index.ts:725`; `/Users/zbeyens/git/prosemirror/view/src/index.ts:774`                                                                                                                 | Plugins can add state, view props, DOM event handlers, paste handlers, node views, clipboard serializers, and decorations; the view owns DOM/input props. | Supports Plite's raw event/render escape hatches and package-owned clipboard ingress, but warns against hiding product behavior inside generic string registries. |
| Lexical     | `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:950`; `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1375`; `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1386`; `/Users/zbeyens/git/lexical/packages/lexical/src/extension-core/types.ts:156`; `/Users/zbeyens/git/lexical/packages/lexical/src/extension-core/types.ts:241`; `/Users/zbeyens/git/lexical/packages/lexical/src/extension-core/types.ts:253`                                                   | Commands run inside update context; read/update are explicit lifecycle APIs; extensions bundle configuration, dependencies, output, and registration.     | Steal lifecycle and extension-output discipline; do not expose commands as normal app mutation DX.                                                                |
| Plate       | `/Users/zbeyens/git/plate/packages/core/src/lib/editor/PliteEditor.ts:52`; `/Users/zbeyens/git/plate/packages/core/src/lib/editor/PliteEditor.ts:162`; `/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugins.ts:114`; `/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugins.ts:300`; `/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugins.ts:352`; `/Users/zbeyens/git/plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:96` | Plate already has components, plugin render caches, shortcuts, input rules, `api`, `tf`, `plugins`, and typed plugin lookup.                              | Confirms raw Plite should leave renderer/keymap/input-rule/plugin packaging to Plate instead of duplicating it.                                                   |

Research conclusion:

- The final boundary is stronger after live refresh: raw Plite keeps substrate
  and escape hatches; Plate owns bundled product APIs.
- Tiptap is the strongest evidence for rich plugin packaging, but that is
  evidence for Plate, not for raw Plite.
- ProseMirror is the strongest evidence that DOM/view props and clipboard
  hooks are runtime-layer concerns, not model transforms.
- Lexical is the strongest evidence for read/update lifecycle, extension
  output, and internal command substrate, not public app command DX.

Score after this pass:

| Dimension                             | Score | Evidence                                                                                                                                            |
| ------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| React/runtime performance             |  0.82 | Direct raw render/event props avoid registry lookup in hot paths; later pressure pass must still score callback identity and native-format routing. |
| Plite-close unopinionated DX          |  0.90 | Raw `Editable render*`, `onKeyDown`, `onDOMBeforeInput`, `onPaste`, and transform middleware match the Plite mental model.                          |
| Plate/slate-yjs migration backbone    |  0.84 | Plate source proves a home for product APIs; collab/slate-yjs answer still needs pressure pass.                                                     |
| Regression-proof testing strategy     |  0.80 | Proof rows are named, but final test matrix still needs pressure/revision before ready.                                                             |
| Research evidence completeness        |  0.90 | Compiled research plus live local Tiptap/ProseMirror/Lexical/Plate source refreshed.                                                                |
| shadcn-style composability/minimalism |  0.82 | Minimal raw Plite API is clear; Plate composability details intentionally deferred.                                                                 |

Total score: `0.84`. Still below closure threshold and still pending.

## Issue Ledger Accounting

No new fixed issue claim is accepted by this pass.

## Related Issue Discovery Pass

Pass result: complete.

Discovery source: durable ClawSweeper/ledger outputs only. No broad live GitHub
discovery was needed because the touched public API surface already has current
generated rows, manual sync rows, fork dossier entries, coverage rows, and PR
reference text.

| Issue family                         | Evidence read                                                                                                                                                                                                                                                                      | Classification             | Result                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3177` renderElement composition    | `docs/plite-issues/gitcrawl-live-open-ledger.md:592`; `docs/plite-issues/gitcrawl-v2-sync-ledger.md:594`; `docs/plite/ledgers/issue-coverage-matrix.md:208`; `docs/plite-issues/open-issues-dossiers/3313-2733.md:757`; `docs/plite-issues/test-candidate-map/3313-2733.md:181` | Related, planning-reviewed | Revise wording. The issue is real architecture pressure, but the target is raw `Editable render*` escape hatches plus Plate-owned renderer/plugin composition, not a raw Plite renderer registry. |
| `#5961` DevTools `onKeyDown` warning | `docs/plite-issues/gitcrawl-live-open-ledger.md:37`; `docs/plite-issues/gitcrawl-v2-sync-ledger.md:39`; `docs/plite-issues/open-issues-dossiers/5994-5918.md:468`; `docs/plite/ledgers/issue-coverage-matrix.md:209`                                                            | Related, not claimed       | Keep stale/triage-closed. Cutting raw key-command registry does not prove the warning.                                                                                                            |
| `#4613` extensible `insertData`      | `docs/plite-issues/gitcrawl-live-open-ledger.md:401`; `docs/plite/ledgers/fork-issue-dossier.md:3953`; `docs/plite/references/pr-description.md:410`                                                                                                                         | Improves, preserved        | Keep the existing improve claim for typed clipboard ingress; this plan changes authoring vocabulary away from `capabilities`, not clipboard behavior.                                             |
| Input-rule family                    | `docs/plite/references/pr-description.md:651`; `docs/plans/2026-05-13-plite-editable-input-rule-ownership-ralplan.md`                                                                                                                                                        | Already cut, preserved     | No new issue discovery needed. Plate owns semantic input rules; raw Plite keeps transform middleware and browser escape hatches.                                                                  |

Ledger implication:

- `docs/plite/ledgers/fork-issue-dossier.md` gets a new pass section for
  this revised #3177 direction.
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/plite/ledgers/issue-coverage-matrix.md`, and
  `docs/plite/references/pr-description.md` remain pending for the later
  issue-sync accounting pass.

## Broader Issue Ledger Pass

Pass result: complete.

Inputs read:

- `docs/plite-issues/gitcrawl-live-open-ledger.md`
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite-issues/open-issues-ledger.md`
- `docs/plite-issues/gitcrawl-clusters.md`
- `docs/plite-issues/issue-clusters.md`
- `docs/plite-issues/test-candidate-map.md` and targeted range files
- `docs/plite-issues/benchmark-candidate-map.md`
- `docs/plite-issues/package-impact-matrix.md`
- `docs/plite-issues/requirements-from-issues.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`

Broader issue matrix:

| Issue         | Cluster                                    | Claim            | Why                                                                                                                                                                                                                       | Proof route                                                                                       | V2 sync ledger                                                             | PR line             |
| ------------- | ------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------- |
| #3222         | plugin-hook-surface-and-render-composition | Related          | Real pressure for coherent feature composition, but raw Plite should answer with extension substrate and render/event escape hatches, not a Plate-style renderer/keymap registry.                                         | Public API/type contracts plus examples after implementation.                                     | revise later from generic input-runtime wording to Plate-boundary wording. | related matrix only |
| #3802         | unified-extension-composition-api-dx       | Related          | Hard-cutting `with*`, public `editor.extend`, and stale root helper alternatives remains aligned with the plan; this pass adds that `editable.renderers`/`editable.keymap` must not become the replacement plugin system. | `packages/plite/test/public-surface-contract.ts` after implementation.              | preserve related row, update with this plan path.                          | related matrix only |
| #3557         | extension-method-overrides                 | Related          | Broad override pressure validates full transform/query/normalizer/operation/commit middleware coverage. Do not shrink the cut to only `deleteBackward`/`insertText`.                                                      | Extension middleware type contracts across all overridable editor methods.                        | preserve related row, add this plan as coverage pressure.                  | related matrix only |
| #4089         | plugin-seam-and-input-overrides            | Related          | Higher-level plugin registry belongs above raw Plite. Raw Plite should keep low-level extension primitives; Plate owns product plugin packaging.                                                                          | Public surface negative tests for renderer/keymap/input-rule helpers plus Plate migration notes.  | no fixed/improved claim.                                                   | related matrix only |
| #5050         | input-interception-hooks                   | Related          | `beforeInsertText` pressure supports transform/input middleware, not a React input-rule or keymap framework.                                                                                                              | `transforms.insertText` middleware contracts and DOM/model desync browser proof where applicable. | no fixed/improved claim.                                                   | related matrix only |
| #5010         | dom-model-desync-on-suppressed-input       | Related          | Text-limit bugs warn that suppressing model input must stay synchronized with DOM input. Cutting keymap/render registries must not remove input suppression proof.                                                        | Browser/input proof after implementation.                                                         | no fixed/improved claim.                                                   | related matrix only |
| #4795         | input-interception-hooks                   | Related          | Text-limit plugin pressure belongs to input/transform middleware and browser input reconciliation, not Plate-shaped keymap/render APIs in raw Plite.                                                                      | Browser/input proof after implementation.                                                         | no fixed/improved claim.                                                   | related matrix only |
| #3586         | format-beforeinput-dom-selection           | Related          | If public `onCommand` is cut, native format handling still needs internal/runtime coverage; do not send apps back to raw `InputEvent.inputType` parsing.                                                                  | Existing beforeinput command proof plus new public API contract after cut.                        | revise later if `onCommand` changes.                                       | related matrix only |
| #3568         | singleton-input-runtime                    | Related          | Same constraint: app mark mutation from raw `onDOMBeforeInput` is a known crash path. A hard cut must preserve safe internal native-format routing or a lower-level native intent hook.                                   | Existing beforeinput command proof plus new public API contract after cut.                        | revise later if `onCommand` changes.                                       | related matrix only |
| #4681         | input-event-passthrough-semantics          | Related          | Raw `onDOMBeforeInput` remains an escape hatch, but paste-specific behavior is not claimed by this plan. Clipboard ingress remains under `clipboard.insertData`.                                                          | Browser proof only if paste `onDOMBeforeInput` is touched.                                        | unchanged.                                                                 | related matrix only |
| #5233         | clipboard-schema-isolation                 | Fixes, preserved | Custom fragment keys are already claimed elsewhere. This plan must not regress the `dom()`/clipboard extension path while renaming authoring vocabulary away from `capabilities`.                                         | Existing clipboard boundary tests plus any changed public type contracts.                         | preserve existing fixes row.                                               | no new line         |
| #4569         | clipboard-extension-surface docs           | Fixes, preserved | Docs already claim `insertData` behavior. Issue sync updated wording from capability order toward typed clipboard ingress and handler ordering.                                                                           | Docs/reference proof after implementation.                                                        | preserve existing fixes row.                                               | no new line         |
| #4440         | clipboard-output-customization             | Related          | Output customization is valid, but `clipboard.insertData` is input ingress. Do not cram output serializers into this plan.                                                                                                | Future output serializer proof only.                                                              | unchanged.                                                                 | related matrix only |
| #4888         | void-drop-event-ownership                  | Related          | Drop inside void is DOM event ownership, not proof that `insertData` input hooks should grow product policy.                                                                                                              | Browser/drop proof only if touched.                                                               | unchanged.                                                                 | related matrix only |
| #4956 / #5172 | example-packaging-improvements             | Not claimed      | These are docs/example/product packaging pressure. They support moving polished packaging to Plate, not raw Plite API growth.                                                                                             | none for this plan.                                                                               | unchanged not-claimed/docs-examples.                                       | no PR claim         |

Issue-ledger conclusion:

- No new `Fixes` or `Improves` claims.
- The implementation plan must preserve existing clipboard and beforeinput proof
  while cutting Plate-shaped authoring APIs.
- The later issue-sync pass must update stale wording in the manual ledger,
  coverage matrix, and PR reference where they still describe raw Plite renderer
  registries or public `onCommand` as the accepted final shape.

| Issue             | Cluster                      | Claim                   | Why                                                                                                                           | Proof route                                                      | V2 sync ledger                                                                                 | PR line                                  |
| ----------------- | ---------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------- |
| #3177             | render-extension-composition | Related, revised        | Current ledgers have been synced to the accepted direction: raw Plite should not own a renderer registry; Plate should.       | Public API/docs/type contracts after implementation.             | Existing row at `docs/plite-issues/gitcrawl-v2-sync-ledger.md:594` revised in issue-sync pass. | Related matrix only; do not claim fixed. |
| #5961             | onkeydown-render-warning     | Not claimed             | Still stale/no current repro. Cutting key-command helpers does not prove the DevTools warning.                                | none                                                             | Existing row at `docs/plite-issues/gitcrawl-v2-sync-ledger.md:39` remains not claimed.         | related matrix only                      |
| #4613             | clipboard-extension-surface  | Improve claim preserved | `clipboard.insertData` stays, but authoring should move away from string `capabilities`.                                      | Existing clipboard package tests plus new public type contracts. | Existing coverage row at `docs/plite/ledgers/issue-coverage-matrix.md:264` preserved.       | no broadened claim                       |
| input-rule family | v2-input-runtime             | Already cut, keep cut   | Prior plan already removed public `EditableInputRule` direction; this pass reinforces that Plate owns semantic rule families. | Existing public-surface tests.                                   | No new issue row.                                                                              | no new claim                             |

Issue pass status:

- Related issue discovery is complete.
- Manual issue/reference sync is still pending because the plan reverses #3177
  wording from "extension-owned renderers stay target" to "renderer registry
  belongs in Plate."
- No broad live GitHub discovery is needed; durable ledgers already cover the
  touched issue rows.

## Applicable Implementation Review Matrix

| Lens                        | Applicability | Finding                                                                                                                                                                                       | Plan delta                                                                                                               |
| --------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Vercel React                | applied       | Raw render props and event props can be stable without a registry; docs should teach module-level or editor-creation-stable callbacks, not `useCallback` cargo cult.                          | Flip docs/tests away from registered renderer helpers as the perf answer.                                                |
| performance-oracle          | applied       | Renderer maps and key-command registries add ordered provider work to hot render/input paths for product convenience. Keep hot paths direct unless the package owns a real runtime primitive. | Remove renderer/key-command registry from normal public path.                                                            |
| tdd                         | applied       | This is public API work; tests must prove observable current behavior and public import shape, not only grep for removed names.                                                               | Add positive contracts for raw render/event props and negative type/public-surface contracts for removed helpers/facets. |
| shadcn/component minimalism | applied       | The minimal composable Plite shape is small public primitives, not a generic plugin layer with nicer names.                                                                                   | No `editable.*` public namespace; Plate owns product composition.                                                        |
| react-useeffect             | skipped       | No effect lifecycle API change in this plan.                                                                                                                                                  |

## Pressure Passes

Pass result: complete.

Harsh read: the plan gets better when it removes more, not when it renames the
same product ideas into nicer facets. Raw Plite should not grow a small Plate.
It should expose the substrate Plate needs and leave the ergonomic product API
to Plate.

| Lens               | Pressure question                                         | Finding                                                                                                                                                                                                           | Required plan delta                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React runtime      | Does cutting helpers make render/input slower or noisier? | No. Direct `Editable render*` and event props avoid registry lookup and provider fanout in render/input paths. The real risk is callback identity churn in examples.                                              | Teach module-scope or editor-creation-stable callbacks. Do not require `useCallback` as a public API story.                                                                                                                                 |
| Performance        | Does any kept facet add hot-path overhead?                | `clipboard.insertData` is acceptable because it runs on clipboard ingress, not every render. `editableRenderers` and `editableKeyCommands` are product registries in hot paths and should go.                     | Keep clipboard focused on ingress. Do not add renderer/keymap equivalents under new names.                                                                                                                                                  |
| Plite DX           | Is this worse for Plite users?                            | It is less packaged, but more honest. Raw Plite users understand render props, DOM/event props, and model transforms. `capabilities`, `editable.keymap`, and `editable.renderers` are mystery framework language. | Public docs should explain three buckets: `Editable` props for UI, extensions for model/runtime behavior, `editor.api` for mounted handles.                                                                                                 |
| Unopinionated core | Does the plan keep Plite low-level?                       | Yes, if `capabilities` stops being public authoring and if no `editable.*` replacement lands. A public keymap/render DSL is an opinionated editor framework.                                                      | Hide public capability maps; expose only named package facets with clear ownership.                                                                                                                                                         |
| Plate migration    | Does Plate lose leverage?                                 | No. Plate already has plugins, shortcuts, input rules, components, render caches, `api`, and `tf`. It benefits from raw Plite being smaller and typed.                                                            | Treat this as a Plate migration target, not a backward-compatible Plite helper preservation target.                                                                                                                                         |
| slate-yjs/collab   | Does the cut affect collaborative correctness?            | Mostly no. Renderer/keymap/onCommand public cuts are UI/input-authoring changes. Collab needs deterministic operations, `state`/`tx`, commit metadata, and replay-safe behavior.                                  | Make no slate-yjs support claim from this plan. Require execution to avoid operation/commit changes unless separately proved.                                                                                                               |
| Regression proof   | Are tests strong enough?                                  | Initial matrix was too soft. Public API hard cuts need positive behavior tests plus negative type/import tests.                                                                                                   | Add negative type tests for `capabilities`, `editableKeyCommands`, `editableRenderers`, `editable.keymap`, `editable.renderers`, and public `EditableCommand*`; add beforeinput/native-format guard tests if public `onCommand` is removed. |
| Research           | Is ecosystem evidence cherry-picked?                      | After live refresh, no. Tiptap supports Plate-like packaging, not raw Plite. ProseMirror supports view/input ownership. Lexical supports lifecycle and extension output.                                          | Keep the synthesis as boundary evidence, not a mandate to copy one editor wholesale.                                                                                                                                                        |
| Simplicity         | Is another abstraction needed?                            | No. Adding `editable.keymap`, `editable.renderers`, or `onNativeInputIntent` would be YAGNI after the hard-cut decision.                                                                                          | Do not replace removed APIs with parallel public names in the same plan.                                                                                                                                                                    |

Pressure score after this pass:

| Dimension                             | Score | Evidence                                                                                                                                                      |
| ------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React/runtime performance             |  0.87 | Direct render/event props plus package-owned clipboard ingress avoid registry work in render/input paths; callback identity risk is handled in docs/examples. |
| Plite-close unopinionated DX          |  0.92 | Public shape is raw `Editable` props, extension middleware, and `editor.api` handles. Plate-like names are cut.                                               |
| Plate/slate-yjs migration backbone    |  0.87 | Plate source has the product plugin home; slate-yjs is protected by keeping operation/state/tx substrate out of this cut.                                     |
| Regression-proof testing strategy     |  0.86 | Required negative type/import tests and beforeinput/native-format guard tests are now explicit.                                                               |
| Research evidence completeness        |  0.91 | Compiled research plus live local Tiptap/ProseMirror/Lexical/Plate source supports the boundary.                                                              |
| shadcn-style composability/minimalism |  0.89 | The target public surface is smaller and more composable; Plate gets the richer component/plugin vocabulary.                                                  |

Total score: `0.89`. Still below closure threshold and still pending.

## Regression Proof Matrix

| Surface         | Required proof                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public exports  | `plite-react` no longer exports `editableKeyCommands`, `editableRenderers`, capability constants, or public `EditableCommand*`.                                |
| Docs/examples   | No docs/examples import `editableKeyCommands` or `editableRenderers`; no docs/examples author raw `capabilities` string maps.                                  |
| Rendering       | Examples using renderers compile with `Editable renderElement/renderLeaf/renderText/renderVoid`.                                                               |
| Hotkeys         | Examples using simple hotkeys compile with `Editable onKeyDown`; reusable model behavior stays in `transforms.*`.                                              |
| Clipboard       | Existing clipboard behavior stays green; `clipboard.insertData` facet types infer the custom editor without casts.                                             |
| Type negatives  | `editable.keymap`, `editable.renderers`, public `capabilities`, `EditableCommand`, and `editableKeyCommands` fail from normal public imports.                  |
| Native input    | Beforeinput/native-format behavior remains covered after public `onCommand` and public `EditableCommand*` are removed.                                         |
| Runtime handles | `editor.api.dom`, `editor.api.clipboard`, `editor.api.history`, and `editor.getApi(...)` stay typed through named authoring, not public string `capabilities`. |
| Plate boundary  | Plate can keep/build `shortcuts`, `inputRules`, `components`, and renderer registries without raw Plite equivalents.                                           |

## High-Risk Pre-Mortem

Trigger: public API hard cut across Plite React examples/docs/tests.

Pass result: complete.

Blast radius:

| Area             | Affected surface                                                                              | Risk                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Packages         | `slate`, `plite-react`, `plite-dom`, `plite-history` public type/export shape.                | Broken imports, bad type inference, hidden registry leaks.           |
| Examples/docs    | Richtext, markdown shortcuts, checklists, keyboard/input docs, renderer docs, clipboard docs. | First-party examples teach the wrong architecture or fail compile.   |
| Browser input    | `beforeinput`, native formatting, keydown, paste, drop, composition-adjacent input.           | DOM/model desync or lost native formatting behavior.                 |
| Issue claims     | #3177, #3568, #3586, #4569, #4613, #5233, related input/clipboard rows.                       | Overclaiming fixes or regressing preserved claims.                   |
| Plate migration  | Plate product plugin boundary and future migration off raw helpers.                           | Plate inherits temporary raw Plite helpers or loses typed substrate. |
| slate-yjs/collab | Operation, commit, state/tx assumptions.                                                      | Accidental runtime changes masquerade as API cleanup.                |

Three-scenario pre-mortem:

| Scenario                        | Failure mode                                                                                                                                 | Why it would happen                                                                                                                  | Mitigation                                                                                                            | Required proof                                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Native input regression         | Removing public `onCommand` also removes the safe internal path for browser native `formatBold`, `formatItalic`, history, or block commands. | The implementation deletes the command pipeline instead of only cutting the public prop/types.                                       | Keep internal native-format routing if tests require it; public users get `onDOMBeforeInput` only as an escape hatch. | Focused beforeinput/native-format contracts for #3568/#3586 and public import negatives for `EditableCommand*`.                        |
| Capability type regression      | Hiding `capabilities` breaks `editor.api.dom`, `editor.api.clipboard`, `editor.api.history`, or `editor.getApi(...)` typing.                 | Current implementation powers these through capability registration, so a public type cut could accidentally remove runtime handles. | Split public authoring from internal registry. Keep typed `api`, `clipboard`, `state`, `tx` authoring.                | Type tests for `editor.api.*`, `editor.getApi(...)`, disabled/typed extension inference, and negative public `capabilities` authoring. |
| Example architecture regression | Examples become simpler to read locally but worse as architecture teaching: scattered callbacks, casts, or hidden app glue.                  | Cutting helpers without rewriting examples around clear buckets.                                                                     | Rewrite docs/examples around UI props, model/runtime extensions, mounted APIs, and Plate product plugins.             | Site typecheck plus surface-contract docs tests that reject helper imports and reject raw string maps.                                 |
| Clipboard regression            | `clipboard.insertData` survives but becomes a dumping ground for paste rules, output serialization, or product policy.                       | It is the only kept named handler facet, so scope pressure flows into it.                                                            | Keep it input ingress only; output customization remains separate/future.                                             | `plite-dom` clipboard tests, #4569/#4613/#5233 preserved proof, no output-serializer wording in this plan.                             |
| Plate boundary regression       | Raw Plite drops helpers but Plate migration loses a clear place for shortcuts/renderers/input rules.                                         | Plan says "Plate owns it" but Ralph does not document target examples or later Plate work.                                           | Execution handoff names Plate-owned surfaces explicitly and does not require raw Plite backward compatibility.        | PR reference and plan handoff show Plate owns shortcuts, keymaps, input rules, paste rules, component/render registries.               |
| Collab regression               | API cleanup touches operation/state/commit behavior unnecessarily.                                                                           | Extension authoring cleanup spills into `state`/`tx` or operation middleware.                                                        | No operation/commit changes in this slice unless separately planned and verified.                                     | Ralph gate includes no slate-yjs claim; any operation/commit diff requires separate collab proof.                                      |

Expanded proof plan:

| Proof class                  | Required proof                                                                                                                             | Command/owner                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Public export negatives      | `plite-react` cannot import `editableKeyCommands`, `editableRenderers`, public capability constants, or `EditableCommand*`.                | `Plate repo root` public-surface contracts and package typecheck.                       |
| Type negatives               | Normal public extension authoring cannot use `capabilities`, `editable.keymap`, or `editable.renderers`.                                   | Negative type tests in `Plate repo root` package contracts.                             |
| Positive extension substrate | `transforms`, `queries`, `normalizers`, `operationMiddlewares`, `commitListeners`, `state`, `tx`, `api`, and `clipboard` remain inferable. | `packages/plite` and `plite-dom` type/contracts.                        |
| Native input regression lock | Current safe native-format behavior remains after public `onCommand` removal.                                                              | Focused Plite React beforeinput/native-format tests tied to #3568/#3586.              |
| Rendering examples           | Richtext/checklist/markdown renderer examples compile using raw `Editable render*` props.                                                  | `bun typecheck:site` plus surface-contract examples check.                            |
| Keyboard examples            | Hotkeys compile through raw `onKeyDown`; reusable model behavior stays in `transforms.*`.                                                  | `plite-react` keyboard-input strategy contracts and site typecheck.                   |
| Clipboard ingress            | `clipboard.insertData` remains typed and issue-backed; no output serializer scope is added.                                                | `bun --filter plite-dom test`, `bun --filter plite-dom typecheck`, issue ledger sync. |
| Plate boundary               | No raw Plite docs/examples present helpers as product plugin API; Plate remains named home for product registries.                         | Docs/examples grep plus PR reference sync.                                            |
| Full release sanity          | Broad touched-surface gate after implementation.                                                                                           | `bun check` in `/Users/zbeyens/git/plite`.                                         |

Rollback/remediation answer:

- No backward-compat aliases. This is a hard cut.
- If native-format proof fails, keep the internal route and cut only the public
  prop/types; do not reintroduce public `onCommand`.
- If `editor.api` typing fails, revise the typed `api` authoring layer; do not
  reopen public string `capabilities`.
- If examples become unreadable, move product-shaped examples to Plate docs or
  simplify the raw Plite example; do not add `editable.*` back.
- If clipboard scope expands beyond input ingress, split a future output facet;
  do not overload `insertData`.

High-risk verdict:

- Keep the hard cut.
- Revise the execution plan to put native-format and `editor.api` type proof
  before broad docs/example cleanup.
- No implementation edit should claim Plate/slate-yjs migration beyond
  substrate readiness unless separate proof is added.

High-risk score after this pass:

| Dimension                             | Score | Evidence                                                                                                         |
| ------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------- |
| React/runtime performance             |  0.90 | Hot render/input registry cuts are kept; callback stability handled in examples.                                 |
| Plite-close unopinionated DX          |  0.94 | Public authoring split is explicit and lower-level.                                                              |
| Plate/slate-yjs migration backbone    |  0.90 | Plate boundary and no-collab-claim guard are explicit.                                                           |
| Regression-proof testing strategy     |  0.92 | Expanded proof covers negative exports, type inference, beforeinput, clipboard, examples, and broad `bun check`. |
| Research evidence completeness        |  0.92 | Risk rows are grounded in prior live-source, issue-ledger, and ecosystem evidence.                               |
| shadcn-style composability/minimalism |  0.91 | Public surface remains smaller with no replacement `editable.*` layer.                                           |

Total score: `0.92`. Closure still pending because revision, issue-sync, and
closure-final-gates have not completed.

## Maintainer Objection Ledger

Pass result: complete.

Architecture strategist read: the old helper direction created inappropriate
intimacy between raw Plite React and product feature packaging. The correct
architecture is boring and narrower: React view props for app UI, core
extensions for model/runtime behavior, package-owned facets for DOM ingress and
mounted handles, Plate plugins for product composition.

| Change                                                 | Strongest fair objection                                                                                                  | Steelman antithesis                                                                                                           | Viable alternatives                                                                                               | Tradeoff                                                                                                       | Adoption/docs answer                                                                                                                                               | Proof required                                                                                                                    | Verdict                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Cut `editableRenderers` / planned `editable.renderers` | "Feature renderers belong with the feature. Forcing `renderElement` switches back into the app is old Plite boilerplate." | Extension-owned renderer registration is genuinely convenient for feature packages. Tiptap proves this is a good product API. | Keep helper; rename to `editable.renderers`; move only to Plate; keep raw render props only.                      | Raw Plite examples become more explicit and less packaged.                                                     | Raw Plite docs show module-level `renderElement` / `renderLeaf`; Plate docs own component/plugin registration.                                                     | Public import/type tests reject helpers and planned facet; examples compile with raw render props.                                | cut                                           |
| Cut `editableKeyCommands` / planned `editable.keymap`  | "Back to scattered `onKeyDown` handlers is a DX regression."                                                              | Extension-owned shortcut registration composes better for rich feature bundles.                                               | Keep helper; expose generic keymap; move shortcut registry to Plate; use transform middleware only.               | Simple examples use callbacks; reusable feature shortcuts need Plate or app glue.                              | Raw Plite teaches `onKeyDown` for UI keys and `transforms.*` for reusable model behavior; Plate owns shortcut/keymap API.                                          | Surface contracts reject helpers/facet; keyboard examples compile through `onKeyDown` and transform middleware.                   | cut                                           |
| Cut public `<Editable onCommand>` / `EditableCommand*` | "This is the dangerous cut. Native format handling is hard, and `onCommand` hid browser `inputType` ugliness."            | A semantic native-format hook can prevent app authors from writing fragile `beforeinput` code.                                | Keep current `onCommand`; shrink to `onNativeInputIntent`; make it internal only; expose raw DOM hooks.           | Public users lose a semantic command hook; internal implementation must still protect beforeinput regressions. | Do not replace it publicly. Docs keep `onDOMBeforeInput` as escape hatch, but native-format handling that Plite owns stays internal/runtime-owned.                 | Beforeinput/native-format tests for #3568/#3586 stay green after public API removal; public imports reject `EditableCommand*`.    | cut public, preserve internal proof if needed |
| Hide public `EditorExtension.capabilities` authoring   | "Advanced extension authors need an escape hatch. Cutting it may make Plite feel closed."                                 | A generic registry is powerful and flexible, and it currently powers `editor.api` handles.                                    | Keep public capabilities; document as advanced-only; replace with typed `api`; replace with named package facets. | Extension authors lose arbitrary string-key registration in normal public docs.                                | Public authoring uses `api`, `clipboard`, `transforms`, `state`, `tx`, and other named facets. Internal registry can still exist below that.                       | Type tests reject normal public `capabilities` authoring; `editor.api` / `editor.getApi` still work through typed authoring.      | cut public authoring                          |
| Keep `clipboard.insertData`                            | "This is also a handler registry. Why is clipboard spared?"                                                               | The objection is fair: a named facet can still become a kitchen sink.                                                         | Move clipboard to Plate; keep string capability; keep typed `clipboard` facet; split input/output separately.     | Plite keeps one package facet beyond model extensions.                                                         | Clipboard ingress is a DOM pipeline primitive, not product shortcut/component packaging. Keep it narrow: input ingress only.                                       | Existing clipboard tests stay green; #4613/#4569 claims are preserved; output serializer scope is not smuggled into `insertData`. | keep typed facet                              |
| Keep raw render/event props                            | "You now have two extension stories: extensions for model behavior and props for UI behavior."                            | A single extension-only authoring model is easier to explain at scale.                                                        | Everything in extensions; everything in props; split UI props and model extensions.                               | Users must understand a boundary.                                                                              | The boundary is the Plite boundary: React props customize the React view; extensions customize editor model/runtime behavior. Plate unifies them for product apps. | Docs/examples group these buckets explicitly; no first-party example packages render/keymap/paste/toolbar into one raw extension. | keep                                          |
| Flip the previous editable-capabilities plan           | "This churn looks unserious."                                                                                             | The prior plan fixed casts and made examples look packaged.                                                                   | Execute old plan; partially execute; hard-cut now.                                                                | Some fresh plan work is invalidated.                                                                           | Better to kill the wrong API in planning than ship a polished half-Plate abstraction.                                                                              | This plan names the rejected alternatives, issue/accounting impact, and Ralph gates.                                              | keep hard cut                                 |

Accepted revisions from this pass:

- `onCommand` is not merely "too product-shaped"; it is the highest regression
  risk. The implementation phase must preserve internal native-format proof
  before deleting the public prop/types.
- `clipboard.insertData` stays only because it is DOM ingress. It must not
  become the place for output serializers, paste rules, or product policy.
- The plan must teach the authoring split directly: React view props, editor
  model/runtime extensions, typed mounted APIs, and Plate product plugins.
- Public `capabilities` can remain as internal registry mechanics only if
  normal authoring and docs cannot depend on it.

Maintainer score after this pass:

| Dimension                             | Score | Evidence                                                                                                        |
| ------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------- |
| React/runtime performance             |  0.88 | Objection pass keeps direct view props and rejects renderer/keymap registries.                                  |
| Plite-close unopinionated DX          |  0.93 | The split is now explicit: raw props for view, extensions for model/runtime, Plate for product packaging.       |
| Plate/slate-yjs migration backbone    |  0.88 | Plate owns product composition; slate-yjs is not claimed and is protected by avoiding operation/commit changes. |
| Regression-proof testing strategy     |  0.88 | `onCommand` now has named beforeinput/native-format guard proof before removal.                                 |
| Research evidence completeness        |  0.91 | Maintainer objections are answered against the live-source/research rows already recorded.                      |
| shadcn-style composability/minimalism |  0.90 | The cut removes extra public names instead of adding replacement abstractions.                                  |

Total score: `0.90`. Still below closure threshold and still pending.

## Revision Pass

Pass result: complete.

Coherence fixes applied:

- The accepted hard cut no longer uses conditional public-removal language for
  `EditableCommand*`.
- Related issue discovery is complete; only manual issue/reference sync remains
  pending.
- Implementation order now starts with regression locks and type-substrate
  proof before deleting public APIs.
- `clipboard.insertData` remains scoped to input ingress; output serialization
  stays outside this plan.
- The current score is `0.92`; earlier score rows are retained as pass history,
  not current readiness claims.

Simplicity fixes applied:

- No replacement public `editable.*` namespace.
- No public `onNativeInputIntent`.
- No backward-compat aliases.
- No slate-yjs/collab claim beyond preserving the operation/state/tx substrate.

Current Ralph execution order:

1. Lock native-format, `editor.api`, clipboard, and public-surface proof.
2. Split public extension authoring from internal capability registry mechanics.
3. Remove public Plate-shaped APIs and exports.
4. Rewrite examples/docs around raw Plite buckets.
5. Sync issue ledgers and PR reference.
6. Run the Plite verification gates.

## Implementation Phases

1. Regression and substrate locks in `Plate repo root`:
   - prove native-format/beforeinput behavior before public `onCommand`
     removal;
   - prove `editor.api.dom`, `editor.api.clipboard`, `editor.api.history`,
     and `editor.getApi(...)` stay typed without public string `capabilities`;
   - prove clipboard ingress behavior and existing clipboard issue claims stay
     green.
2. Extension type cleanup:
   - split public authoring from internal capability registry mechanics;
   - hide public `capabilities` from normal `EditorExtension` authoring;
   - add typed `api` authoring for installed handles;
   - add typed `clipboard` package facet for DOM ingress.
3. Public surface hard cut:
   - remove `editableKeyCommands`, `editableRenderers`, capability constants,
     and public type exports from `plite-react`;
   - remove public `EditableCommand*` / `onCommand`;
   - preserve internal native-format routing only where the beforeinput proof
     requires it.
4. Examples/docs rewrite:
   - renderers through `Editable render*` props;
   - hotkeys through `Editable onKeyDown`;
   - model behavior through `transforms.*`;
   - paste behavior through `clipboard.insertData`.
5. Contract rewrite:
   - flip tests currently requiring `editableRenderers` / `editableKeyCommands`;
   - add negative type tests for Plate-fit APIs.
6. Ledger/reference sync:
   - revise #3177 rows from "registered renderers target" to "raw render props
     plus Plate renderer registry target";
   - preserve #4613 clipboard improve claim;
   - keep #5961 not claimed.

## Issue Sync Accounting

Pass result: complete.

Synced artifacts:

- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/references/pr-description.md`
- `docs/plite/ledgers/fork-issue-dossier.md`

Issue accounting result:

| Issue   | Result                                                                                                                                                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3177` | Stays `Related` / `planning-reviewed`. Manual and coverage rows now say raw Plite should not own a renderer registry; target is raw `Editable render*` plus model/runtime extensions, with Plate owning product renderer/plugin composition. |
| `#5961` | Stays not claimed. Ledger now says key-command registry removal does not reproduce or fix the stale DevTools warning; raw Plite keeps `Editable onKeyDown`.                                                                                  |
| `#4613` | Existing clipboard improve claim stays scoped to typed `insertData` input ingress. No broader method override, paste-rule, or output serializer claim.                                                                                       |
| `#4569` | Existing docs fix claim stays, with wording shifted from public string `capabilities` / capability order to typed clipboard ingress and handler ordering.                                                                                    |
| `#5233` | Existing custom fragment-key fix claim stays unchanged and remains a guard for clipboard authoring vocabulary changes.                                                                                                                       |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- Fixed/improved issue counts remain unchanged.
- PR reference now reflects the final hard-cut direction instead of the older
  editable-capabilities plan.

## Fast Driver Gates

Run from `/Users/zbeyens/git/plite`:

```bash
bun --filter plite-react test:vitest -- surface-contract keyboard-input-strategy-contract generic-react-editor-contract
bun --filter plite-react typecheck
bun --filter plite-dom test
bun --filter plite-dom typecheck
bun --filter plite typecheck
bun typecheck:site
bun check
```

Planning-state gate from `/Users/zbeyens/git/plate-2`:

```bash
node tooling/scripts/completion-check.mjs
```

## Pass State Ledger

| Pass                            | Status   | Evidence added                                                                                                                                                                                                                  | Plan delta                                                                                                                                                                           | Open issues                                                          | Next owner                      |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------- |
| current-state-read              | complete | Live `Plate repo root` public exports, helpers, Editable props, examples, tests, prior plans, Plate source, research pages.                                                                                                       | Initial hard-cut matrix; prior facet plan revised.                                                                                                                                   | Need issue sync and PR reference rewrite.                            | related-issue-discovery         |
| related-issue-discovery         | complete | Live generated row, manual sync row, fork dossier, coverage matrix, PR reference, open-issue dossier, and test-candidate row were read for #3177/#5961/#4613/input-rule family.                                                 | #3177 revised from raw Plite renderer registry target to raw render props plus Plate-owned renderer/plugin composition.                                                              | Later sync pass must update manual ledgers and PR reference.         | issue-ledger-pass               |
| issue-ledger-pass               | complete | Full required issue-ledger inputs scanned; broader issue rows added for plugin composition, method overrides, input interception, beforeinput/native formatting, clipboard input/output, void drop, and docs/example packaging. | No new fixed/improved claims; plan now records constraints that preserve transform/input middleware, internal native-format routing, clipboard ingress, and Plate product ownership. | Later sync pass must update manual ledgers and PR reference wording. | intent-boundary-decision-brief  |
| intent-boundary-decision-brief  | complete | Intent table, decision brief, weakest assumption, and three open decisions resolved: cut public `onCommand`, keep `decorate`, internalize `capabilities`.                                                                       | Removed remaining user-decision points; added native-format, decoration, and registry boundaries.                                                                                    | none                                                                 | research-ecosystem-live-refresh |
| research-ecosystem-live-refresh | complete | Existing compiled research plus live local Tiptap, ProseMirror, Lexical, and Plate source refreshed; scorecard raised to 0.84.                                                                                                  | Strengthened boundary: Tiptap/Plate product packaging stays in Plate; ProseMirror/Lexical support substrate, view/input, and lifecycle discipline.                                   | none                                                                 | pressure-passes                 |
| pressure-passes                 | complete | Performance, React, DX, unopinionated-core, Plate/slate-yjs, regression, research, and simplicity pressure rows added; score raised to 0.89.                                                                                    | Strengthened proof: no renamed `editable.*` replacement, no public `onNativeInputIntent`, negative type/import tests required.                                                       | none                                                                 | maintainer-objection-ledger     |
| maintainer-objection-ledger     | complete | Steelman rows added for renderer registry, keymap registry, public `onCommand`, public `capabilities`, clipboard exception, raw props split, and previous-plan churn.                                                           | `onCommand` removal now requires internal native-format proof; clipboard is explicitly input ingress only; authoring split must be documented.                                       | none                                                                 | high-risk-deliberate            |
| high-risk-deliberate            | complete | Blast radius, six-scenario pre-mortem, expanded proof plan, rollback/remediation answer, and no-collab-claim guard added; score raised to 0.92.                                                                                 | Execution order revised: native-format and `editor.api` type proof must come before broad docs/example cleanup.                                                                      | none                                                                 | revision-pass                   |
| revision-pass                   | complete | Coherence and simplicity review applied; stale conditional cut wording removed; issue discovery/sync distinction corrected; implementation order rewritten proof-first.                                                         | Ralph order now locks native-format, `editor.api`, and clipboard proof before public API deletion and docs/example rewrite.                                                          | none                                                                 | issue-sync-accounting           |
| issue-sync-accounting           | complete | Manual sync ledger, issue coverage matrix, fork dossier, and PR reference updated for #3177/#5961/#4613/#4569/#5233 and the public `onCommand`/renderer/keymap hard-cut wording.                                                | No new fixed/improved claims; PR reference now reflects the final hard-cut direction instead of the older editable-capabilities plan.                                                | none                                                                 | closure-final-gates             |
| closure-final-gates             | complete | Completion thresholds checked; all prior pass rows complete before closure; final handoff written; scoped completion state can be marked done.                                                                                  | Plan is ready for Ralph execution; no Plite implementation edits were made in Plite Ralplan.                                                                                      | none                                                                 | none                            |

## Open Questions

None for this pass.

Resolved:

1. Public `<Editable onCommand>` / `EditableCommand*` is fully cut. No public
   `onNativeInputIntent` replacement in this plan.
2. `Editable decorate` remains a raw render-time callback; projection or
   annotation sources handle persistent/async/perf-sensitive overlays.
3. `capabilities` is internal registry plumbing, not an advanced public
   authoring API.

## Final Handoff Outline

Final handoff status: complete.

Accepted hard cuts:

- Cut public `editableKeyCommands(...)`.
- Cut public `EDITABLE_KEY_COMMAND_CAPABILITY`.
- Reject planned public `editable.keymap`.
- Cut public `editableRenderers(...)`.
- Cut public `EDITABLE_RENDERERS_CAPABILITY`.
- Reject planned public `editable.renderers`.
- Cut public `<Editable onCommand>`.
- Cut public `EditableCommand*` types.
- Cut public `EditorExtension.capabilities` / registration-output
  `capabilities` as normal authoring and docs/examples API.
- Keep public `EditableInputRule*` and public extension `commands` already cut.
- No backward-compatible aliases.

Accepted keeps:

- Keep `defineEditorExtension(...)` and creation-time `extensions: [...]`.
- Keep `transforms.*`, `queries`, `normalizers`, `operationMiddlewares`,
  `commitListeners`, `state`, and `tx`.
- Keep raw `Editable renderElement`, `renderLeaf`, `renderText`, `renderVoid`,
  `decorate`, `onKeyDown`, `onDOMBeforeInput`, and `onPaste`.
- Keep `clipboard.insertData` as typed DOM/clipboard input ingress only.
- Keep `editor.api.dom`, `editor.api.clipboard`, `editor.api.history`, and
  `editor.getApi(...)` as typed mounted runtime handles.
- Keep internal capability registry mechanics only as implementation substrate.

Before/after target:

```tsx
// Before: raw Plite pretending to be a product plugin framework.
defineEditorExtension({
  name: 'paragraph',
  capabilities: editableRenderers({
    elements: { paragraph: ParagraphElement },
  }),
})

// After: raw Plite React uses render props.
<Editable renderElement={renderElement} />
```

```tsx
// Before: raw Plite key registry.
editableKeyCommands(({ editor, event }) => {
  if (isHotkey('mod+b', event)) {
    toggleMark(editor, 'bold')
    return true
  }
})

// After: raw Plite UI hotkeys stay in the React event prop.
<Editable
  onKeyDown={(event, { editor }) => {
    if (isHotkey('mod+b', event)) {
      toggleMark(editor, 'bold')
      return true
    }
  }}
/>
```

```ts
// Keep: reusable model behavior belongs in extension middleware.
defineEditorExtension({
  name: "checklist",
  transforms: {
    deleteBackward({ editor, next }) {
      if (applyChecklistBackspaceStart(editor)) return;
      next();
    },
  },
});
```

```ts
// Keep, but typed and narrow: clipboard input ingress only.
defineEditorExtension({
  name: "html-paste",
  clipboard: {
    insertData(data, { editor, next }) {
      if (!data.types.includes("text/html")) return next();
      return true;
    },
  },
});
```

Plate boundary:

- Plate owns shortcuts, keymaps, input rules, paste rules, renderer/component
  registries, toolbars, and product plugin packaging.
- Raw Plite provides the lower-level substrate Plate needs; it does not keep
  temporary Plite React helper APIs for Plate migration compatibility.

Implementation order for Ralph:

1. Lock native-format/beforeinput proof, `editor.api` typing, clipboard ingress,
   and public-surface contracts in `Plate repo root`.
2. Split public extension authoring from internal capability registry mechanics.
3. Remove the public Plate-shaped APIs and exports.
4. Rewrite examples/docs around raw Plite buckets.
5. Sync issue ledgers and PR reference.
6. Run the Plite gates listed in `Fast Driver Gates`.

Issue accounting:

- `#3177`: related only; no renderer registry fix/improve claim.
- `#5961`: not claimed; stale DevTools warning remains unreproduced.
- `#4613`: existing improve claim preserved for typed `insertData` ingress.
- `#4569`: existing docs fix claim preserved with typed clipboard wording.
- `#5233`: existing custom fragment-key fix claim preserved.
- New fixed claims: `0`.
- New improved claims: `0`.

Final completion gates:

- Total score `0.92`; no dimension below `0.85`.
- All scheduled pass rows are complete.
- Issue ledger, fork dossier, coverage matrix, and PR reference are synced.
- No unresolved user decision remains.
- No Plite implementation files were edited by Plite Ralplan.
- Plite implementation verification remains assigned to the later Ralph
  execution because this plan is planning-only.
