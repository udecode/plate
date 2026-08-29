# plite-dom

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Add prioritized schema-bound host codecs that claim exact schema declarations through `owns` and parse or serialize immutable `ContentSlice` values through read-only state
  - Isolate codec query, parse, and serialize failures through the lifecycle error sink while preserving fallback order
  - Preserve open slice edges and element-owned named roots in native clipboard payloads
  - Own every public `DataTransfer` contract outside headless Plite, including typed `clipboardHandler(...)` extension contributions and exact `readSlice` / `writeSlice` transport
  - Use only `clipboardHandler(handler)`; infer the handler transaction contextually from the owning extension or Plate stage and its installed update capabilities
  - Publish clipboard operations under the DOM-owned `editor.api.dom.clipboard` namespace
  - Select default editing-action event phases through one host-facts policy, retaining only the proven Korean iOS Backspace exception
  - Add root-scoped coordinate, caret, visual-line, and rectangle geometry APIs
  - Schedule focus, selection, scrolling, and standalone host work through cancellable root-addressed DOM phases
  - Cancel stale focus retries when another editor in the same document or shadow root takes focus ownership
  - Resolve stale DOM path mappings through lifecycle reads and typed domain errors
  - Resolve a mounted native element from a Plite node or its live `NodeKey`, returning `null` for foreign, removed, and unmounted keys
  - Serialize node selections as closed exact-owner slices, including reachable secondary roots
  - Resolve iframe and shadow-root input, selection, and shortcut behavior from each browser realm

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add Plite React integration with strict editor and element hooks, typed `usePliteCommand` dispatch, latest-value selectors, revision-based external view data, provider-lifetime `onCommit` observation, and read-only state for shell components outside a `<Plite>` root.

  - Preserve focused-root selection across child editors and lifecycle target changes
  - Coordinate DOM reads, writes, selection repair, Android input latency, and external mutation recovery through one bounded scheduler per mounted root
  - Keep printable single-character typing native for internally proven live leaf pipelines and pass-through command middleware; use model input for unknown custom renderers and material commands
  - Invalidate explicit runtime-state chrome selectors synchronously while preserving equality and commit-filter suppression
  - Run public keydown handlers before built-in editor commands so a handled event can override undo, redo, Enter, and other runtime commands
  - Remount unsynchronized custom text shells after structural history repair while retaining derived projected DOM text sync for safe renderers
  - Re-export the model-owned caret after composition repair renders only while the focused snapshot version and selection remain current
  - Refresh expanded Blink selections after document changes so formatting updates cannot retain stale painted highlight geometry
  - Keep `NodeSelection` model-only with no native browser range, and expose exact node selection through `useElementSelected({ mode: 'node' })`
  - Let non-void `keyboardSelectable` owners receive node focus from non-editable chrome, enter editable children with ArrowDown, and regain owner focus with ArrowUp at the leading boundary
  - Isolate optional decoration, annotation, widget, and render-callback failures
  - Preserve inline decorated-range data in projection slices
  - Infer React editor values from complete installed schemas and expose typed interactive content-root slots
  - Keep `useEditor()` non-generic and let selector hooks infer only their result; resolve exact extension capabilities through `editor.extension(Extension)`
  - Preserve element-owned named roots through projected clipboard serialization and insertion
  - Resolve projected clipboard ranges against the canonical runtime so root-scoped editor views copy and cut their own model content
  - Cancel superseded delayed focus restoration when undo or redo crosses roots
  - Install the exact DOM descriptor through `react({ dom })` and consume its clipboard and input-runtime services without name-based runtime lookup
  - Install the default DOM descriptor when `createReactEditor()` is called directly; keep `react({ dom })` as the low-level custom DOM composition surface
  - Hydrate separate server and client editor runtimes with deterministic local node tokens, then publish full runtime-owned keys after mounting
  - Route keyboard default-action ownership through the DOM host-facts selector
  - Expose transaction announcements through one `aria-live` region per logical editor
  - Keep placeholder and drop-cursor presentation in applications while retaining structural DOM, geometry, and selection behavior in Plite React
  - Resolve physical left/right caret and word movement through the DOM visual-point API, preserving affinity across mixed-direction text
  - Remove view-level `Editable` maximum-length configuration; set `maxLength` when creating the editor

### Minor Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add `editor.api.dom.resolveVisualPoint(point, { direction, unit, affinity })` for browser-native horizontal caret resolution in mixed-direction text.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Serialize one-or-many node selections as exact selected-node slices.

## 0.124.1

### Patch Changes

- [#6040](https://github.com/ianstormtaylor/slate/pull/6040) [`20a1a937`](https://github.com/ianstormtaylor/slate/commit/20a1a9371538dda1911d533e0f02b1655ffffa12) Thanks [@12joan](https://github.com/12joan)! - - Harden property accessors against untrusted keys
  - Fix incorrect argument types for the `compare` and `merge` options of `Transforms.setNodes`

## 0.124.0

### Patch Changes

- [#6019](https://github.com/ianstormtaylor/slate/pull/6019) [`b9794a97`](https://github.com/ianstormtaylor/slate/commit/b9794a97dd8141f0e09c7ebb37395197553be2f6) Thanks [@delijah](https://github.com/delijah)! - Fix text node lookup for toPlitePoint

## 0.123.1

### Patch Changes

- [#6004](https://github.com/ianstormtaylor/slate/pull/6004) [`e2a940a0`](https://github.com/ianstormtaylor/slate/commit/e2a940a0e1575a4f084923a16a1ab89cf965dfda) Thanks [@christianhg](https://github.com/christianhg)! - Fix `findPath` throwing "Unable to find the path for Plite node" after component unmount

  When `toPlitePoint` is called with `suppressThrow: true` (e.g., from `toPliteRange` during selection change handling), it should not throw errors. However, the internal `findPath` calls were not respecting this option, causing errors to be thrown when the component was unmounting and node references became stale.

  This fix wraps the `findPath` calls in `toPlitePoint` with try-catch blocks that respect the `suppressThrow` option, returning `null` instead of throwing when the option is enabled.

## 0.123.0

### Patch Changes

- [#6000](https://github.com/ianstormtaylor/slate/pull/6000) [`8d9bf305`](https://github.com/ianstormtaylor/slate/commit/8d9bf30595a6fad62ff15e302ab489ff46a2515a) Thanks [@nabbydude](https://github.com/nabbydude)! - Added `Location.isPath`, `Location.isPoint`, `Location.isRange`, and `Location.isSpan` functions, as efficient type discriminators. Use these instead of `Path.isPath`, `Point.isPoint`, `Range.isRange`, and `Span.isSpan` whenever possible.

## 0.121.0

### Patch Changes

- # [#5982](https://github.com/ianstormtaylor/slate/pull/5982) [`dd4a77b3`](https://github.com/ianstormtaylor/slate/commit/dd4a77b3c5bb5d2d3cd6a62f49d6f318d30d6727) Thanks [@nabbydude](https://github.com/nabbydude)! - Add `Node.isEditor`, `Node.isElement`, and `Node.isText` as alternative type guards for when we already know the object is a node. Use these new functions instead of `Editor.isEditor`, `Element.isElement`, and `Text.isText` whenever possible, the classic functions are only necessary for typechecking an entirely unknown object.

## 0.119.0

### Minor Changes

- [#5963](https://github.com/ianstormtaylor/slate/pull/5963) [`33e74a82`](https://github.com/ianstormtaylor/slate/commit/33e74a822b82c4b9ce1444f456c5343970441ccb) Thanks [@iperzic](https://github.com/iperzic)! - Fixes an editor crash that happens when editor is placed inside Shadow DOM and the user is typing on Android

## 0.118.1

### Patch Changes

- [#5936](https://github.com/ianstormtaylor/slate/pull/5936) [`05583457`](https://github.com/ianstormtaylor/slate/commit/0558345703e3451f82ffd7eeb15dee51102b1209) Thanks [@delijah](https://github.com/delijah)! - Search backward and forward for leaf nodes in non contenteditable elements inside `toPlitePoint`

## 0.117.4

### Patch Changes

- [#5919](https://github.com/ianstormtaylor/slate/pull/5919) [`e029a87a`](https://github.com/ianstormtaylor/slate/commit/e029a87aba0d124af39c519813448201da32193d) Thanks [@12joan](https://github.com/12joan)! - Do not apply WeChat-related workarounds on recent versions of Chrome

- [#5916](https://github.com/ianstormtaylor/slate/pull/5916) [`f2ea1e1e`](https://github.com/ianstormtaylor/slate/commit/f2ea1e1e3ae281cfef145b92a9cb61c7a749363d) Thanks [@delijah](https://github.com/delijah)! - Do not retry focusing editor after it has been unmounted

## 0.116.0

### Minor Changes

- [#5871](https://github.com/ianstormtaylor/slate/pull/5871) [`fb87646e`](https://github.com/ianstormtaylor/slate/commit/fb87646e8643e1d0547134cea9d1f57912f06a92) Thanks [@12joan](https://github.com/12joan)! - - Add `splitDecorationsByChild` to split an array of decorated ranges by child index.

## 0.114.0

### Patch Changes

- [#5849](https://github.com/ianstormtaylor/slate/pull/5849) [`0fde537b`](https://github.com/ianstormtaylor/slate/commit/0fde537b52c23dd374721501e31e9aab56ce6477) Thanks [@12joan](https://github.com/12joan)! - Fix: Deleting backward by a line misses 1 character (belated changeset for https://github.com/ianstormtaylor/slate/pull/5827)

## 0.112.2

### Patch Changes

- [#5792](https://github.com/ianstormtaylor/slate/pull/5792) [`82165125`](https://github.com/ianstormtaylor/slate/commit/82165125957644f7dfe81d55a620f4d31132e3c9) Thanks [@zhi-zhi-zhi](https://github.com/zhi-zhi-zhi)! - fix: additional fix for previous fix: Prevent ReactEditor.toDOMRange crash in setDomSelection #5741

## 0.111.0

### Minor Changes

- [#5734](https://github.com/ianstormtaylor/slate/pull/5734) [`9a212512`](https://github.com/ianstormtaylor/slate/commit/9a2125127064f35332d5c06df2dfa3768f745185) Thanks [@bmingles](https://github.com/bmingles)! - Split out plite-dom package
