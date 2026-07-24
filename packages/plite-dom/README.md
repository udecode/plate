# plite-dom

DOM bridge for Plite editors.

`plite-dom` owns DOM point/range conversion, selection conversion, clipboard
formatting, hotkey helpers, contenteditable helpers, and DOM coverage boundary
metadata used by React and browser-proof layers.

React apps normally use these APIs through `plite-react`:

```ts
editor.api.dom.focus()
editor.api.clipboard.insertTextData(dataTransfer)
```

Use direct `plite-dom` imports for framework/runtime integration code that
needs DOM coverage types or DOM bridge helpers without React.

```ts
import { DOMCoverage, Hotkeys, isDOMNode } from '@platejs/plite-dom'
```

Public root exports are grouped around:

- `dom()` for installing the DOM bridge extension.
- `DOMCoverage` for hidden, staged, and virtualized same-root coverage metadata.
- `Hotkeys`, `isHotkey`, `Key`, and `TRIPLE_CLICK` for keyboard and click
  matching.
- DOM utilities such as `closestShadowAware`, `containsShadowAware`,
  `getActiveElement`, `getDefaultView`, `getSelection`, `hasShadowRoot`,
  `isDOMElement`, `isDOMNode`, `isDOMSelection`, `isDOMText`,
  `isPlainTextOnlyPaste`, `isTrackedMutation`, and `normalizeDOMPoint`.
- Plite DOM marker helpers such as `getElements`, `getNodeDataAttributeKeys`,
  `isEditor`, `isElement`, `isLeaf`, `isNode`, `isString`, `isText`, `isVoid`,
  and `keyToDataAttribute`.
- Text-diff utilities such as `applyStringDiff`, `mergeStringDiffs`,
  `normalizePoint`, `normalizeRange`, `normalizeStringDiff`, `targetRange`, and
  `verifyDiffState`.
- Environment flags such as `CAN_USE_DOM`, `HAS_BEFORE_INPUT_SUPPORT`,
  `IS_ANDROID`, `IS_CHROME`, `IS_FIREFOX`, `IS_IOS`, `IS_UC_MOBILE`,
  `IS_WEBKIT`, and `IS_WECHATBROWSER`.
- Decoration helpers `isElementDecorationsEqual`, `isTextDecorationsEqual`, and
  `splitDecorationsByChild`.
- `defineHostCodec`, `hostCodecs`, and `writeHostFragmentData` for
  schema-linked clipboard formats that decode and encode immutable
  `ContentSlice` values. Codecs receive a read-only model snapshot and a
  snapshotted host payload; fitted slice replacement exclusively owns writes.
- `PliteDOMResolutionError` for failed assert-style DOM resolution.

Public type exports are grouped around:

- DOM bridge APIs: `DOMApi`, `DOMClipboardApi`,
  `DOMClipboardInsertDataHandler`, `DOMEditorOptions`, `ScrollIntoViewOptions`,
  and `ScrollIntoViewTarget`.
- DOM coverage policies and results such as `DOMCoverageBoundary`,
  `DOMCoverageSelectionPolicy`, `DOMCoveragePlitePointResult`, and
  `DOMCoverageDOMRangeResult`.
- DOM primitive type names: `DOMNode`, `DOMElement`, `DOMText`, `DOMPoint`,
  `DOMRange`, `DOMStaticRange`, and `DOMSelection`.
- Host codec types: `HostCodec`, `HostCodecParseContext`, `HostCodecPhase`,
  `HostCodecSerializeContext`, `HostDataSource`, and `HostCodecSchemaTarget`.
- Hotkey and diff helper types: `HotkeySpec`, `HotkeyPlatform`,
  `HotkeyMatchOptions`, `KeyboardEventLike`, `StringDiff`, and `TextDiff`.

## Host codecs

```ts
import { ContentSlice } from '@platejs/plite'
import { hostCodecs } from '@platejs/plite-dom'

const extension = hostCodecs('example-host-codecs', [
  {
    format: 'application/x-example+json',
    key: 'example-json',
    owns: [{ kind: 'schema' }],
    parse: ({ data }) => ContentSlice.fromJSON(JSON.parse(data)),
    serialize: ({ slice }) => JSON.stringify(slice),
  },
])
```

Ordinary element and property ownership comes from the host integration's
compiled schema binding. Low-level integrations claim a property with its
reusable `SchemaProperty` declaration. Ownership resolution is semantic, so an
equivalent frozen declaration resolves to the same compiled property without
depending on object identity.

Parse and query callbacks receive `{ data, format, source, state }`.
Serialization receives `{ format, slice, state }`. `source` is an immutable
snapshot of the incoming host formats and files; `state` is a read-only editor
snapshot. Codecs never receive the editor, the live `DataTransfer`, a fitter,
or a write transaction. Return `null` from `parse` or `serialize` to delegate
to the next eligible codec. Framework clipboard writers use
`writeHostFragmentData(editor, data, slice)` to serialize each registered MIME
format into a `setData`-compatible host sink.

## DOM coverage

DOM coverage boundaries model same-root content whose DOM is hidden, staged, or
virtualized. They keep selection, copy, find, and Plite-to-DOM conversion tied
to explicit policies instead of assuming every document node is mounted.

## Internal subpath

The `/internal` package subpath is reserved for sibling Plite packages in this
repo. Apps, extension libraries, and framework adapters should use the root
`plite-dom` export.

Framework packages own bridge installation.
