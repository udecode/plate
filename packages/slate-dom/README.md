# slate-dom

DOM bridge for Slate editors.

`slate-dom` owns DOM point/range conversion, selection conversion, clipboard
formatting, hotkey helpers, contenteditable helpers, and DOM coverage boundary
metadata used by React and browser-proof layers.

React apps normally use these APIs through `slate-react`:

```ts
editor.api.dom.focus()
editor.api.clipboard.insertTextData(dataTransfer)
```

Use direct `slate-dom` imports for framework/runtime integration code that
needs DOM coverage types or DOM bridge helpers without React.

```ts
import { DOMCoverage, Hotkeys, isDOMNode } from '@platejs/slate-dom'
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
- Text-diff utilities such as `applyStringDiff`, `mergeStringDiffs`,
  `normalizePoint`, `normalizeRange`, `normalizeStringDiff`, `targetRange`, and
  `verifyDiffState`.
- Environment flags such as `CAN_USE_DOM`, `HAS_BEFORE_INPUT_SUPPORT`,
  `IS_ANDROID`, `IS_CHROME`, `IS_FIREFOX`, `IS_IOS`, `IS_UC_MOBILE`,
  `IS_WEBKIT`, and `IS_WECHATBROWSER`.
- Decoration helpers `isElementDecorationsEqual`, `isTextDecorationsEqual`, and
  `splitDecorationsByChild`.
- `SlateDOMResolutionError` for failed assert-style DOM resolution.

Public type exports are grouped around:

- DOM bridge APIs: `DOMApi`, `DOMClipboardApi`,
  `DOMClipboardInsertDataHandler`, and `DOMEditorOptions`.
- DOM coverage policies and results such as `DOMCoverageBoundary`,
  `DOMCoverageSelectionPolicy`, `DOMCoverageSlatePointResult`, and
  `DOMCoverageDOMRangeResult`.
- DOM primitive type names: `DOMNode`, `DOMElement`, `DOMText`, `DOMPoint`,
  `DOMRange`, `DOMStaticRange`, and `DOMSelection`.
- Hotkey and diff helper types: `HotkeySpec`, `HotkeyPlatform`,
  `HotkeyMatchOptions`, `KeyboardEventLike`, `StringDiff`, and `TextDiff`.

The `/internal` package subpath is reserved for sibling Slate packages in this
repo. Apps, extension libraries, and framework adapters should use the root
`slate-dom` export.

DOM coverage boundaries model same-root content whose DOM is hidden, staged, or
virtualized. They keep selection, copy, find, and Slate-to-DOM conversion tied
to explicit policies instead of assuming every document node is mounted.

Framework packages own bridge installation.
