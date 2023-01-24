# @udecode/plate-core

## 19.1.1

### Patch Changes

- [#2151](https://github.com/udecode/plate/pull/2151) by [@zbeyens](https://github.com/zbeyens) – fix: use `removeEditorMark` in editorProtocol plugin

## 19.1.0

### Minor Changes

- [#2142](https://github.com/udecode/plate/pull/2142) by [@zbeyens](https://github.com/zbeyens) –
  - New core plugin: `editorProtocol` following https://github.com/udecode/editor-protocol core specs
    - Fixes https://github.com/udecode/editor-protocol/issues/81
  - Slate types: replaced editor mark types by `string`. Derived types from `EMarks<V>` are often unusable.

## 19.0.3

### Patch Changes

- [#2108](https://github.com/udecode/plate/pull/2108) by [@zbeyens](https://github.com/zbeyens) – Fixes #2107

## 19.0.1

### Patch Changes

- [`8957172`](https://github.com/udecode/plate/commit/89571722d3e0e275af302cb4553e85f0edd0b912) by [@zbeyens](https://github.com/zbeyens) – fix: `editor.id` of type `Symbol`

## 19.0.0

### Major Changes

- [#2097](https://github.com/udecode/plate/pull/2097) by [@zbeyens](https://github.com/zbeyens) –
  - upgrade deps, including typescript support for the new editor methods:
  ```json
  // from
  "slate": "0.78.0",
  "slate-history": "0.66.0",
  "slate-react": "0.79.0"
  // to
  "slate": "0.87.0",
  "slate-history": "0.86.0",
  "slate-react": "0.88.0"
  ```

## 18.15.0

### Minor Changes

- [`2a72716`](https://github.com/udecode/plate/commit/2a7271665eeedc35b8b8f08f793d550503c7b85a) by [@zbeyens](https://github.com/zbeyens) –

  - new `Plate` / `PlateProvider` prop: `readOnly`
  - it's also stored in plate store, useful when `readOnly` is needed between `PlateProvider` and `Plate`.
  - new selector: `usePlateReadOnly`
  - (not mandatory) migration:

  ```tsx
  // from
  <Plate editableProps={{readOnly: true}} />

  // to
  <Plate readOnly />
  ```

## 18.13.0

### Minor Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - new queries:
    - `getPreviousSiblingNode`
    - `isDocumentEnd`
  - new utils:
    - `getJotaiProviderInitialValues`: get jotai provider initial values from props
    - exports `nanoid`
  - new dependency: `nanoid`

## 18.9.0

### Minor Changes

- [#1978](https://github.com/udecode/plate/pull/1978) by [@zbeyens](https://github.com/zbeyens) – Plugin fields `renderBeforeEditable` and `renderAfterEditable` now have `TEditableProps` passed as the first parameter.

## 18.7.0

### Minor Changes

- [#1960](https://github.com/udecode/plate/pull/1960) by [@zbeyens](https://github.com/zbeyens) –
  - Default editor value is now overridable with `editor.childrenFactory()`
  - New core plugin `nodeFactory`, extends the editor with:
    - `blockFactory: (node) => TElement`, can be used to create the default editor block
    - `childrenFactory: () => Value`
  - New transform `resetEditorChildren`: Replace editor children by `editor.childrenFactory()`.

## 18.6.0

### Minor Changes

- [#1959](https://github.com/udecode/plate/pull/1959) by [@zbeyens](https://github.com/zbeyens) –
  - Default editor value is now overridable with `editor.childrenFactory()`
  - New core plugin `nodeFactory`, extends the editor with:
    - `blockFactory: (node) => TElement`, can be used to create the default editor block
    - `childrenFactory: () => Value`
  - New transform `resetEditorChildren`: Replace editor children by `editor.childrenFactory()`.

### Patch Changes

- [#1957](https://github.com/udecode/plate/pull/1957) by [@tmilewski](https://github.com/tmilewski) – fix: update `@radix-ui/react-slot` to eliminate conflicting peer dependencies

- [#1953](https://github.com/udecode/plate/pull/1953) by [@zbeyens](https://github.com/zbeyens) – `applyDeepToNodes`: new option `path`

## 18.2.0

### Minor Changes

- [#1888](https://github.com/udecode/plate/pull/1888) by [@zbeyens](https://github.com/zbeyens) –
  - new `PlatePlugin` property:
    - `renderAboveSlate` – Render a component above `Slate`
  - `id` is no longer required in plate hooks:
    - `usePlateId()` is getting the closest editor id
    - it's used in all store hooks if no store is found with the omitted id
    - note that `id` is not needed if you don't have nested `Plate` / `PlateProvider`
  - `id` prop change should remount `Plate`

## 18.1.1

### Patch Changes

- [#1896](https://github.com/udecode/plate/pull/1896) by [@charrondev](https://github.com/charrondev) – Fix `PrevSelectionPlugin` event persistence on React 16.x

## 17.0.3

### Patch Changes

- [#1885](https://github.com/udecode/plate/pull/1885) by [@zbeyens](https://github.com/zbeyens) – fix: Plate without `initialValue` or `value` prop should use `editor.children` as value. If `editor.children` is empty, use default value (empty paragraph).

## 17.0.2

### Patch Changes

- [#1882](https://github.com/udecode/plate/pull/1882) by [@zbeyens](https://github.com/zbeyens) – Fix: dynamic plugins

## 17.0.1

### Patch Changes

- [#1878](https://github.com/udecode/plate/pull/1878) by [@zbeyens](https://github.com/zbeyens) –
  - Fix: `Maximum call stack size exceeded` after many changes
  - Fix: Plate props that are functions are now working (e.g. `onChange`)

## 17.0.0

### Major Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –

  - `usePlateStore`:
    - Plate no longer has a global store containing all the editor states (zustand). Each editor store is now defined in a React context tree ([jotai](https://github.com/pmndrs/jotai)). If you need to access all the editor states at once (as you could do before), you'll need to build that layer yourself.
    - Plate store is now accessible only below `PlateProvider` or `Plate` (provider-less mode). It means it's no longer accessible outside of a Plate React tree. If you have such use-case, you'll need to build your own layer to share the state between your components.
    - You can nest many `PlateProvider` with different scopes (`id` prop). Default scope is `PLATE_SCOPE`
    - Hook usage:
      - `const value = usePlateSelectors(id).value()`
      - `const setValue = usePlateActions(id).value()`
      - `const [value, setValue] = usePlateStates(id).value()`
    - removed from the store:
      - `editableProps`, use the props instead
      - `enabled`, use conditional rendering instead
      - `isReady`, no point anymore as it's now directly ready
    - `useEventPlateId` is still used to get the last focused editor id.
    - Functions are stored in an object `{ fn: <here> }` - `const setOnChange = usePlateActions(id).onChange()` - `setOnChange({ fn: newOnChange })`
  - `Plate`
    - if rendered below `PlateProvider`, it will render `PlateSlate > PlateEditable`
    - if rendered without `PlateProvider`, it will render `PlateProvider > PlateSlate > PlateEditable`
    - default `id` is no longer `main`, it's now `PLATE_SCOPE`
  - `PlateProvider`
    - Each provider has an optional `scope`, so you can have multiple providers in the same React tree and use the plate hooks with the corresponding `scope`.
    - Plate effects are now run in `PlateProvider`
      - `initialValue, value, editor, normalizeInitialValue, normalizeEditor` are no longer defined in an effect (SSR support)
    - Props:
      - now extends the previous `Plate` props
      - if using `PlateProvider`, set the provider props on it instead of `Plate`. `Plate` would only need `editableProps` and `PlateEditableExtendedProps`
      - if not using it, set the provider props on `Plate`

  ```tsx
  // Before
  <PlateProvider>
    <Toolbar>
      <AlignToolbarButtons />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} <MyValue> initialValue={alignValue} plugins={plugins} />
  </PlateProvider>

  // After
  <PlateProvider<MyValue> initialValue={alignValue} plugins={plugins}>
    <Toolbar>
      <AlignToolbarButtons />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>

  // After (provider-less mode)
  <Plate<MyValue> editableProps={editableProps} initialValue={alignValue} plugins={plugins} />
  ```

  - types:
    - store `editor` is no longer nullable
    - store `value` is no longer nullable
    - `id` type is now `PlateId`
  - renamed:
    - `SCOPE_PLATE` to `PLATE_SCOPE`
    - `getEventEditorId` to `getEventPlateId`
    - `getPlateActions().resetEditor` to `useResetPlateEditor()`
  - removed:
    - `plateIdAtom`
    - `usePlateId` for `usePlateSelectors().id()`
    - `EditablePlugins` for `PlateEditable`
    - `SlateChildren`
    - `PlateEventProvider` for `PlateProvider`
    - `withPlateEventProvider` for `withPlateProvider`
    - `usePlate`
    - `usePlatesStoreEffect`
    - `useEventEditorId` for `useEventPlateId`
    - `platesStore, platesActions, platesSelectors, usePlatesSelectors`
    - `getPlateActions` for `usePlateActions`
    - `getPlateSelectors` for `usePlateSelectors`
    - `getPlateEditorRef` for `usePlateEditorRef`
    - `getPlateStore, usePlateStore`
    - `EditorId` for `PlateId`

### Minor Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –

  - **SSR support**
  - `useEventPlateId` returns:
    - `id` if defined
    - focused editor id if defined
    - blurred editor id if defined
    - last editor id if defined
    - provider id if defined
    - `PLATE_SCOPE` otherwise
  - new dep: `nanoid`
  - `PlateProvider`

  ```tsx
  export interface PlateProviderProps<
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>
  > extends PlateProviderEffectsProps<V, E>,
      Partial<Pick<PlateStoreState<V, E>, 'id' | 'editor'>> {
    /**
     * Initial value of the editor.
     * @default [{ children: [{ text: '' }]}]
     */
    initialValue?: PlateStoreState<V>['value'];

    /**
     * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
     * This is useful when adding normalization rules on already existing content.
     * @default false
     */
    normalizeInitialValue?: boolean;

    scope?: Scope;
  }
  ```

  - `PlateProviderEffects`
  - `PlateSlate`
  - `PlateEditable`

  ```tsx
  export interface PlateEditableExtendedProps {
    id?: PlateId;

    /**
     * The children rendered inside `Slate`, after `Editable`.
     */
    children?: ReactNode;

    /**
     * Ref to the `Editable` component.
     */
    editableRef?: Ref<HTMLDivElement>;

    /**
     * The first children rendered inside `Slate`, before `Editable`.
     * Slate DOM is not yet resolvable on first render, for that case use `children` instead.
     */
    firstChildren?: ReactNode;

    /**
     * Custom `Editable` node.
     */
    renderEditable?: (editable: ReactNode) => ReactNode;
  }

  export interface PlateEditableProps<V extends Value = Value>
    extends Omit<TEditableProps<V>, 'id'>,
      PlateEditableExtendedProps {}
  ```

### Patch Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #1508
  - Fixes #1343

## 16.8.0

### Minor Changes

- [#1856](https://github.com/udecode/plate/pull/1856) by [@zbeyens](https://github.com/zbeyens) –
  - core plugin `createSelectionPlugin` renamed to `createPrevSelectionPlugin`
  - `queryNode` - new options:
    - `level`: Valid path levels
    - `maxLevel`: Paths above that value are invalid

## 16.5.0

### Minor Changes

- [#1832](https://github.com/udecode/plate/pull/1832) by [@zbeyens](https://github.com/zbeyens) – New editor prop:
  - `currentKeyboardEvent`: is set in `onKeyDown` and unset after applying `set_selection` operation. Useful to override the selection depending on the keyboard event.

## 16.3.0

### Patch Changes

- [#1796](https://github.com/udecode/plate/pull/1796) by [@zbeyens](https://github.com/zbeyens) – New `PlateEditor` prop to store the last key down:
  - `lastKeyDown: string | null`

## 16.2.0

### Minor Changes

- [#1778](https://github.com/udecode/plate/pull/1778) by [@zbeyens](https://github.com/zbeyens) –
  - `isRangeAcrossBlocks`: Now returns true if one of the block above is found but not the other and returns undefined if no block is found.
  - `isRangeInSameBlock`: Whether the range is in the same block.
  - `removeNodeChildren`: Remove node children.
  - `replaceNodeChildren`: Replace node children: remove then insert.

### Patch Changes

- [#1776](https://github.com/udecode/plate/pull/1776) by [@davisg123](https://github.com/davisg123) – Autoformatter will incorrectly match on text that contains one additional character of text

## 16.1.0

### Minor Changes

- [#1768](https://github.com/udecode/plate/pull/1768) by [@zbeyens](https://github.com/zbeyens) – new utils:
  - `wrapNodeChildren`: Wrap node children into a single element

## 16.0.2

### Patch Changes

- [#1766](https://github.com/udecode/plate/pull/1766) by [@zbeyens](https://github.com/zbeyens) – Fix: Plate `firstChildren` is now working

- [#1755](https://github.com/udecode/plate/pull/1755) by [@mouradmourafiq](https://github.com/mouradmourafiq) – Add `options` parameter to `isSelectionAtBlockEnd`

## 16.0.0

### Minor Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - `ElementProvider` now has `SCOPE_ELEMENT='element'` scope in addition to the plugin key, so `useElement()` can be called without parameter (default = `SCOPE_ELEMENT`). You'll need to use the plugin key scope only to get an ancestor element.
  - upgrade peerDeps:
    - `"slate": ">=0.78.0"`
    - `"slate-react": ">=0.79.0"`

## 15.0.3

### Patch Changes

- [#1707](https://github.com/udecode/plate/pull/1707) by [@dylans](https://github.com/dylans) – improve performance of list normalizations

## 15.0.0

### Minor Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - new dep + re-exports `"react-hotkeys-hook": "^3.4.6"`
  - new core plugin `createSelectionPlugin`
    - stores the previous selection in `editor.prevSelection` (default is `null`)
    - enabled by default, can be disabled using `selection` key
  - new `PlatePlugin` props:
    - `renderAboveEditable`: Render a component above `Editable`.
    - `renderAfterEditable`: Render a component after `Editable`.
    - `renderBeforeEditable`: Render a component before `Editable`.
  - `Plate`:
    - pipes plugins `renderAboveEditable` and render the result above `Editable`
    - pipes plugins `renderAfterEditable` and render the result after `Editable`, before `children`
    - pipes plugins `renderBeforeEditable` and render the result before `Editable`, after `firstChildren`
  - new queries
    - `getNextNodeStartPoint`
    - `getPreviousNodeEndPoint`
  - new hooks
    - `useOnClickOutside`
  - `PlateEditor` new prop:
    - `prevSelection: TRange | null;`

## 14.4.2

### Patch Changes

- [#1689](https://github.com/udecode/plate/pull/1689) by [@zbeyens](https://github.com/zbeyens) – fix: wait for editor value being ready before calling `normalizeNodes`

## 14.0.2

### Patch Changes

- [#1669](https://github.com/udecode/plate/pull/1669) by [@zbeyens](https://github.com/zbeyens) – fix: use jotai scope to Plate provider

## 14.0.0

### Major Changes

- [#1633](https://github.com/udecode/plate/pull/1633) by [@tjramage](https://github.com/tjramage) – Moved `serializeHtml` and its utils to `@udecode/plate-serializer-html` as it has a new dependency: [html-entities](https://www.npmjs.com/package/html-entities).
  - If you're using `@udecode/plate`, no migration is needed
  - Otherwise, import it from `@udecode/plate-serializer-html`

## 13.8.0

### Minor Changes

- [#1650](https://github.com/udecode/plate/pull/1650) by [@zbeyens](https://github.com/zbeyens) – `PlatePlugin` has a new option:
  - `normalizeInitialValue`: filter the value before it's passed into the editor

## 13.7.0

### Minor Changes

- [#1648](https://github.com/udecode/plate/pull/1648) by [@zbeyens](https://github.com/zbeyens) –
  - new plate action:
    - `redecorate` - triggers a redecoration of the editor.

## 13.6.0

### Minor Changes

- [`bed47ae`](https://github.com/udecode/plate/commit/bed47ae4380971a829c8f0fff72d1610cf321e73) by [@zbeyens](https://github.com/zbeyens) –
  - `focusEditor` new option to set selection before focusing the editor
    - `target`: if defined:
      - deselect the editor (otherwise it will focus the start of the editor)
      - select the editor
      - focus the editor
  - re-exports `createStore` from `@udecode/zustood`, so the other packages don't have to install it

### Patch Changes

- [`bed47ae`](https://github.com/udecode/plate/commit/bed47ae4380971a829c8f0fff72d1610cf321e73) by [@zbeyens](https://github.com/zbeyens) –
  - fix returned type: `getNextSiblingNodes`

## 13.5.0

### Minor Changes

- [#1616](https://github.com/udecode/plate/pull/1616) by [@zbeyens](https://github.com/zbeyens) –
  - `useElement`: Plate is now storing `element` in a context provided in each rendered element. Required parameter: the plugin key is used as a scope as it's needed for nested elements.

## 13.1.0

### Major Changes

- `Plate` children are now rendered as last children of `Slate` (previously first children). To reproduce the previous behavior, move `children` to `firstChildren`

### Minor Changes

- [#1592](https://github.com/udecode/plate/pull/1592) by [@zbeyens](https://github.com/zbeyens) –
  - fix: `Plate` children were rendered before `Editable`, making slate DOM not resolvable on first render. Fixed by moving `Editable` as the first child of `Slate` and `children` as the last children of `Slate`.
  - `Plate` new props:
    - `firstChildren`: replaces the previous behavior of `children`, rendered as the first children of `Slate`
    - `editableRef`: Ref to the `Editable` component.
  - Plate store - new field:
    - `isRendered`: Whether `Editable` is rendered so slate DOM is resolvable. Subscribe to this value when you query the slate DOM outside `Plate`.

## 11.2.1

### Patch Changes

- [#1566](https://github.com/udecode/plate/pull/1566) by [@armedi](https://github.com/armedi) – Fix runtime error when deserialized html contains svg element

## 11.2.0

### Minor Changes

- [#1560](https://github.com/udecode/plate/pull/1560) by [@zbeyens](https://github.com/zbeyens) –
  - exports `isComposing` from `ReactEditor`
  - exports `Hotkeys` from slate
  - types:
    - use [slate type options](https://github.com/ianstormtaylor/slate/commit/3b7a1bf72d0c3951416c771f7f149bfbda411111) when defined

## 11.1.0

### Minor Changes

- [#1546](https://github.com/udecode/plate/pull/1546) by [@zbeyens](https://github.com/zbeyens) –
  - `getEdgeBlocksAbove`: Get the edge blocks above a location (default: selection).
  - `getPluginTypes`: Get plugin types option by plugin keys.

## 11.0.6

### Patch Changes

- [#1534](https://github.com/udecode/plate/pull/1534) by [@zbeyens](https://github.com/zbeyens) – types:
  - `createPluginFactory`: use generic `P` type in first parameter
  - add `Value` default type in place it can't be inferred
  - replace `EditorNodesOptions` by `GetNodeEntriesOptions`

## 11.0.5

### Patch Changes

- [#1530](https://github.com/udecode/plate/pull/1530) by [@zbeyens](https://github.com/zbeyens) – `TEditor`: add default generic `Value`

## 11.0.4

### Patch Changes

- [#1528](https://github.com/udecode/plate/pull/1528) by [@zbeyens](https://github.com/zbeyens) – fix: propagate editor generic to `PlatePlugin` handlers

## 11.0.3

### Patch Changes

- [#1526](https://github.com/udecode/plate/pull/1526) by [@zbeyens](https://github.com/zbeyens) –
  - `unhangRange`: return the range instead of void
  - add default generic types to many places
  - add generic types to:
    - `WithOverride` functions
    - `Decorate` functions
    - `OnChange` functions
    - `KeyboardHandler` functions

## 11.0.2

### Patch Changes

- [#1523](https://github.com/udecode/plate/pull/1523) by [@zbeyens](https://github.com/zbeyens) –
  - `createPluginFactory` type: default plugin has types (e.g. `Value`) which can be overriden using generics (e.g. `MyValue`).
  - Plugin types are now using `Value` generic type when it's using the editor.
  - replace plugin options generic type `P = {}` by `P = PluginOptions` where `PluginOptions = AnyObject`. That fixes a type error happening when a list of plugins has custom `P`, which don't match `{}`.

## 11.0.1

### Patch Changes

- [#1521](https://github.com/udecode/plate/pull/1521) by [@zbeyens](https://github.com/zbeyens) – Fix: nested element types in `Value` type

## 11.0.0

### Major Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – Thanks @ianstormtaylor for the initial work on https://github.com/ianstormtaylor/slate/pull/4177.

  This release includes major changes to plate and slate types:

  - Changing the `TEditor` type to be `TEditor<V>` where `V` represents the "value" being edited by Slate. In the most generic editor, `V` would be equivalent to `TElement[]` (since that is what is accepted as children of the editor). But in a custom editor, you might have `TEditor<Array<Paragraph | Quote>>`.
  - Other `TEditor`-and-`TNode`-related methods have been also made generic, so for example if you use `getLeafNode(editor, path)` it knows that the return value is a `TText` node. But more specifically, it knows that it is the text node of the type you've defined in your custom elements (with any marks you've defined).
  - This replaces the declaration merging approach, and provides some benefits. One of the drawbacks to declaration merging was that it was impossible to know whether you were dealing with an "unknown" or "known" element, since the underlying type was changed. Similarly, having two editors on the page with different schemas wasn't possible to represent. Hopefully this approach with generics will be able to smoothly replace the declaration merging approach. (While being easy to migrate to, since you can pass those same custom element definitions into `TEditor` still.)

**Define your custom types**

- Follow https://plate.udecode.io/docs/typescript example.

**Slate types**

Those Slate types should be replaced by the new types:

- `Editor` -> `TEditor<V extends Value>`
  - Note that `TEditor` methods are not typed based on `Value` as it would introduce a circular dependency. You can use `getTEditor(editor)` to get the editor with typed methods.
- `ReactEditor` -> `TReactEditor<V extends Value>`
- `HistoryEditor` -> `THistoryEditor<V extends Value>`
- `EditableProps` -> `TEditableProps<V extends Value>`
- `Node` -> `TNode`
- `Element` -> `TElement`
- `Text` -> `TText`

**Slate functions**

Those Slate functions should be replaced by the new typed ones:

- As the new editor type is not matching the slate ones, all `Transforms`, `Editor`, `Node`, `Element`, `Text`, `HistoryEditor`, `ReactEditor` functions should be replaced: The whole API has been typed into Plate core. See https://github.com/udecode/plate/packages/core/src/slate
- `createEditor` -> `createTEditor`
- `withReact` -> `withTReact`
- `withHistory` -> `withTHistory`

**Generic types**

- `<T = {}>` could be used to extend the editor type. It is now replaced by `<E extends PlateEditor<V> = PlateEditor<V>>` to customize the whole editor type.
- When the plugin type is customizable, these generics are used: `<P = PluginOptions, V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>`, where `P` is the plugin options type.
- `Editor` functions are using `<V extends Value>` generic, where `V` can be a custom editor value type used in `PlateEditor<V>`.
- `Editor` functions returning a node are using `<N extends ENode<V>, V extends Value = Value>` generics, where `N` can be a custom returned node type.
- `Editor` callbacks (e.g. a plugin option) are using `<V extends Value, E extends PlateEditor<V> = PlateEditor<V>>` generics, where `E` can be a custom editor type.
- `Node` functions returning a node are using `<N extends Node, R extends TNode = TNode>` generics.
- These generics are used by `<V extends Value, K extends keyof EMarks<V>>`: `getMarks`, `isMarkActive`, `removeMark`, `setMarks`, `ToggleMarkPlugin`, `addMark`, `removeEditorMark`
- `WithOverride` is a special type case as it can return a new editor type:

  ```tsx
  // before
  export type WithOverride<T = {}, P = {}> = (
    editor: PlateEditor<T>,
    plugin: WithPlatePlugin<T, P>
  ) => PlateEditor<T>;

  // after - where E is the Editor type (input), and EE is the Extended Editor type (output)
  export type WithOverride<
    P = PluginOptions,
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>,
    EE extends E = E
  > = (editor: E, plugin: WithPlatePlugin<P, V, E>) => EE;
  ```

- `type TEditor<V extends Value>`
- `type PlateEditor<V extends Value>`

**Renamed functions**

- `getAbove` -> `getAboveNode`
- `getParent` -> `getParentNode`
- `getText` -> `getEditorString`
- `getLastNode` -> `getLastNodeByLevel`
- `getPointBefore` -> `getPointBeforeLocation`
- `getNodes` -> `getNodeEntries`
- `getNodes` -> `getNodeEntries`
- `isStart` -> `isStartPoint`
- `isEnd` -> `isEndPoint`

**Replaced types**

Removing node props types in favor of element types (same props + extends `TElement`). You can use `TNodeProps` to get the node data (props).

- `LinkNodeData` -> `TLinkElement`
- `ImageNodeData` -> `TImageElement`
- `TableNodeData` -> `TTableElement`
- `MentionNodeData` -> `TMentionElement`
- `MentionNode` -> `TMentionElement`
- `MentionInputNodeData` -> `TMentionInputElement`
- `MentionInputNode` -> `TMentionInputElement`
- `CodeBlockNodeData` -> `TCodeBlockElement`
- `MediaEmbedNodeData` -> `TMediaEmbedElement`
- `TodoListItemNodeData` -> `TTodoListItemElement`
- `ExcalidrawNodeData` -> `TExcalidrawElement`

**Utils**

- `match` signature change:

```
<T extends TNode>(
  obj: T,
  path: TPath,
  predicate?: Predicate<T>
)
```

### Minor Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – Transforms:

  - `insertElements`: `insertNodes` where node type is `TElement`
  - `setElements`: `setNodes` where node type is `TElement`

  Types:

  - General type improvements to all plate packages.
  - `Value = TElement[]`: Default value of an editor.
  - `TNode = TEditor<Value> | TElement | TText`
  - `TElement`: Note that `type: string` is included as it's the standard in Plate.
  - `TText`: it now accepts unknown props.
  - `TDescendant = TElement | TText`
  - `TAncestor = TEditor<Value> | TElement`
  - `ENode<V extends Value>`: Node of an editor value
  - `EElement<V extends Value>`: Element of an editor value
  - `EText<V extends Value>`: Text of an editor value
  - `EDescendant<V extends Value>`: Descendant of an editor value
  - `EAncestor<V extends Value>`: Ancestor of an editor value
  - `NodeOf<N extends TNode>`: A utility type to get all the node types from a root node type.
  - `ElementOf<N extends TNode>`: A utility type to get all the element nodes type from a root node.
  - `TextOf<N extends TNode>`: A utility type to get all the text node types from a root node type.
  - `DescendantOf<N extends TNode>`: A utility type to get all the descendant node types from a root node type.
  - `ChildOf<N extends TNode, I extends number = number>`: A utility type to get the child node types from a root node type.
  - `AncestorOf<N extends TNode>`: A utility type to get all the ancestor node types from a root node type.
  - `ValueOf<E extends TEditor<Value>>`: A helper type for getting the value of an editor.
  - `MarksOf<N extends TNode>`: A utility type to get all the mark types from a root node type.
  - `EMarks<V extends Value>`
  - `TNodeProps<N extends TNode>`: Convenience type for returning the props of a node.
  - `TNodeEntry<N extends TNode = TNode>`
  - `ENodeEntry<V extends Value>`: Node entry from an editor.
  - `TElementEntry<N extends TNode = TNode>`: Element entry from a node.
  - `TTextEntry<N extends TNode = TNode>`: Text node entry from a node.
  - `ETextEntry<V extends Value>`: Text node entry of a value.
  - `TAncestorEntry<N extends TNode = TNode>`: Ancestor entry from a node.
  - `EAncestorEntry<V extends Value>`: Ancestor entry from an editor.
  - `TDescendantEntry<N extends TNode = TNode>`: Descendant entry from a node.
  - `TOperation<N extends TDescendant = TDescendant>`: operation types now accept unknown props.

  Updated deps:

  ```bash
  "@udecode/zustood": "^1.1.1",
  "jotai": "^1.6.6",
  "lodash": "^4.17.21",
  "zustand": "^3.7.2"
  ```

### Patch Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – fix: Type alias 'TDescendant' circularly references itself

## 10.5.3

### Patch Changes

- [#1476](https://github.com/udecode/plate/pull/1476) by [@chrishyle](https://github.com/chrishyle) – Fixed an error in toggleMark that caused removeMark to be called when there is no mark to remove

## 10.5.2

### Patch Changes

- [#1472](https://github.com/udecode/plate/pull/1472) by [@m9rc1n](https://github.com/m9rc1n) – Fix Url encoded HTML nodes on adding an image #1189.
  Updated function `serializeHtml` to use `decodeURIComponent` per node, instead of complete text.
  This is fixing problem when combination of image and i.e. paragraph nodes would result in paragraph node not decoded.

## 10.5.0

### Minor Changes

- [#1465](https://github.com/udecode/plate/pull/1465) by [@zbeyens](https://github.com/zbeyens) –
  - `withoutNormalizing`: `Editor.withoutNormalizing` which returns true if normalized
  - `createPlateEditor`: add `normalizeInitialValue` option
  - `createPlateTestEditor`

## 10.4.2

### Patch Changes

- [#1447](https://github.com/udecode/plate/pull/1447) by [@ryanbarr](https://github.com/ryanbarr) – Update isType to correctly return the expected boolean value.

## 10.4.1

### Patch Changes

- [#1440](https://github.com/udecode/plate/pull/1440) by [@zbeyens](https://github.com/zbeyens) – Critical fix: plate hooks without id. `usePlateId` (used to get plate store) is now working below `PlateProvider` and outside `Plate`.

## 10.4.0

### Minor Changes

- [#1435](https://github.com/udecode/plate/pull/1435) by [@zbeyens](https://github.com/zbeyens) – Fix a critical issue when using multiple editors #1352
  - `withHOC`: 3rd parameter can be used to add props to HOC.
  - `usePlateId` now just gets plate id atom value and no longer gets event editor id as fallback.
  - `useEventEditorId`: Get last event editor id: focus, blur or last.
  - `useEventPlateId`: Get provider plate id or event editor id.
  - `PlateEventProvider`: `PlateProvider` where id is the event editor id (used for toolbar buttons).
  - `withPlateEventProvider`

## 10.2.2

### Patch Changes

- [`15e64184`](https://github.com/udecode/plate/commit/15e6418473aa3f2c6e7c7e5395fa005f028591c4) by [@zbeyens](https://github.com/zbeyens) – Revert plugins memoization fix https://github.com/udecode/plate/pull/1415#issuecomment-1061794845

## 10.2.1

### Patch Changes

- [#1415](https://github.com/udecode/plate/pull/1415) by [@chaseadamsio](https://github.com/chaseadamsio) – fix useEditableProps plugins memoization

## 10.1.2

### Patch Changes

- [#1393](https://github.com/udecode/plate/pull/1393) by [@dylans](https://github.com/dylans) – Check for leaf was too strict with checking for text

## 10.1.1

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

- [#1392](https://github.com/udecode/plate/pull/1392) by [@zbeyens](https://github.com/zbeyens) – fix: using `PlateProvider` was not setting the initial value

## 10.1.0

### Minor Changes

- [#1381](https://github.com/udecode/plate/pull/1381) by [@zbeyens](https://github.com/zbeyens) –

  - vendor:
    - upgrade slate to "0.72.8"
    - upgrade slate-react to "0.72.9"
    - upgrade zustand to "3.7.0"
  - new component for testing: `PlateTest`

- [#1387](https://github.com/udecode/plate/pull/1387) by [@zbeyens](https://github.com/zbeyens) –
  - `Plate` props are merged into the initial store state to override the default values.
    - the initial value will be `editor.children` if `editor` prop is defined.
  - `PlateProvider` accepts `PlateProps` so set the initial store state

## 10.0.0

### Minor Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) –
  - new dep: jotai
  - `Plate`:
    - set the store only if it's not already set (e.g. controlled use-case)
    - there is now a jotai provider with plate id so it can be used by plate selectors if no id is given as parameter.
  - `PlateProvider`: Create plate store and mount/unmount if `id` prop updates. `id` can be `string[]`. Use this component on top of components using plate hook selectors, otherwise your components would not rerender on change. Not needed for plate non-hook selectors (getters).
  - `useCreatePlateStore`: hook that creates a plate store into the plates store, if not defined.
  - `usePlateId`: returns the provider plate id (if any).
  - `usePlateStore`: if the hook is used before the plate store is created, it will console warn "The plate hooks must be used inside the `<PlateProvider id={id}>` component's context."
  -

### Patch Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) –
  - `eventEditorSelectors.focus()` should now return the currently focused editor id, and `null` if no editor is focused.

## 9.3.1

### Patch Changes

- [#1367](https://github.com/udecode/plate/pull/1367) by [@zbeyens](https://github.com/zbeyens) – Fix: "Adding new Editor instances after render of another instance causes a bad setState error". We were setting the plate store anytime `getPlateStore` was called, so it could be called outside a `useEffect`. `Plate` now returns `null` until the plate store is set in the plates store, so `getPlateStore` always returns a defined store. Note that you'd need the same check on your end above any component using plate selectors.

## 9.3.0

### Patch Changes

- [#1362](https://github.com/udecode/plate/pull/1362) by [@zbeyens](https://github.com/zbeyens) – Upgrade zustood 0.4.4

## 9.2.1

### Patch Changes

- [#1341](https://github.com/udecode/plate/pull/1341) by [@zbeyens](https://github.com/zbeyens) – Fix components using `usePlateEditorState` by introducing `withEditor` / `EditorProvider` hoc

## 9.2.0

### Patch Changes

- [#1338](https://github.com/udecode/plate/pull/1338) by [@zbeyens](https://github.com/zbeyens) – Swap ast and html plugin order

## 9.0.0

### Major Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - `Plate`
    - `editor` prop can now be fully controlled: Plate is not applying `withPlate` on it anymore
  - `PlatePlugin.deserializeHtml`
    - can't be an array anymore
    - moved `validAttribute`, `validClassName`, `validNodeName`, `validStyle` to `deserializeHtml.rules` property
  - renamed `plateStore` to `platesStore`
  - `platesStore` is now a zustood store
  - `eventEditorStore` is now a zustood store
  - `getPlateId` now gets the last editor id if not focused or blurred
    - used by `usePlateEditorRef` and `usePlateEditorState`
  - removed:
    - `usePlateEnabled` for `usePlateSelectors(id).enabled()`
    - `usePlateValue` for `usePlateSelectors(id).value()`
    - `usePlateActions`:
      - `resetEditor` for `getPlateActions(id).resetEditor()`
      - `clearState` for `platesActions.unset()`
      - `setInitialState` for `platesActions.set(id)`
      - `setEditor` for `getPlateActions(id).editor(value)`
      - `setEnabled` for `getPlateActions(id).enabled(value)`
      - `setValue` for `getPlateActions(id).value(value)`
    - `getPlateState`
    - `usePlateState`
    - `usePlateKey`

### Minor Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - new packages
    - `@udecode/zustood`
    - `use-deep-compare`
  - `Plate`
    - renders a new component: `EditorRefEffect`
      - it renders `plugin.useHooks(editor, plugin)` for all `editor.plugins`
      - note that it will unmount and remount the hooks on `plugins` change
    - `useEditableProps`
      - subscribes to the store `editableProps`, `decorate`, `renderLeaf`, `renderElement`
      - `decorate`, `renderLeaf`, `renderElement` are now separately memoized
      - `useDeepCompareMemo` instead of `useMemo` for performance
    - `useSlateProps`
      - subscribes to the store `onChange`, `value`
    - `usePlateEffects`
      - update the plate store on props change:
        - `editableProps`
        - `onChange`
        - `value`
        - `enabled`
        - `plugins`
        - `decorate`
        - `renderElement`
        - `renderLeaf`
  - `PlatePlugin`
    - `useHooks`: new property to use hooks once the editor is initialized.
    - `deserializeHtml`
      - `getNode` has a new parameter `node`
      - `getNode` can be injected by other plugins
  - `createPlateStore`: create a plate zustood store
    - actions: `resetEditor`, `incrementKey`
    - new properties:
      - `plugins`
      - `decorate`
      - `renderElement`
      - `renderLeaf`
      - `editableProps`
      - `onChange`
  - `platesStore`:
    - actions: `set`, `unset`
    - selectors: `get`
  - `usePlateId`: hook version of `getPlateId`
  - `platesActions`
  - `getPlateActions`
  - `getPlateSelectors`
  - `usePlateSelectors`
  - `getPlateStore`
  - `usePlateStore`
  - `eventEditorActions`
  - `eventEditorSelectors`
  - `useEventEditorSelectors`
  - `mapInjectPropsToPlugin`: Map plugin inject props to injected plugin

### Patch Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - fix performance issue with hundreds of Plate editors
  - fix a bug where `editor.plugins` was reversed
  - `Plate`
    - `editor.plugins` were missing plugins on `plugins` prop change
  - `withInlineVoid`:
    - use `plugin.type` instead of `plugin.key`

## 8.3.0

### Patch Changes

- [#1266](https://github.com/udecode/plate/pull/1266) by [@zbeyens](https://github.com/zbeyens) –

  - HTML deserializer:
    - parent attributes does not override child leaf attributes anymore. For example, if a span has fontSize style = 16px, and its child span has fontSize style = 18px, it's now deserializing to 18px instead of 16px.
  - Inject props:
    - does not inject props when node value = `inject.props.defaultNodeValue` anymore.

- [#1257](https://github.com/udecode/plate/pull/1257) by [@tjramage](https://github.com/tjramage) –
  - fix link upsert on space
  - `getPointBefore`: will return early if the point before is in another block. Removed `multiPaths` option as it's not used anymore.

## 8.1.0

### Minor Changes

- [#1249](https://github.com/udecode/plate/pull/1249) by [@zbeyens](https://github.com/zbeyens) – new utils:
  - `parseHtmlDocument`
  - `parseHtmlElement`

## 8.0.0

### Major Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Breaking changes:

  ### `Plate`

  - removed `components` prop:

  ```tsx
  // Before
  <Plate plugins={plugins} components={components} />;

  // After
  // option 1: use the plugin factory
  let plugins = [
    createParagraphPlugin({
      component: ParagraphElement,
    }),
  ];

  // option 2: use createPlugins
  plugins = createPlugins(plugins, {
    components: {
      [ELEMENT_PARAGRAPH]: ParagraphElement,
    },
  });

  <Plate plugins={plugins} />;
  ```

  - removed `options` prop:

  ```tsx
  // Before
  <Plate plugins={plugins} options={options} />;

  // After
  // option 1: use the plugin factory
  let plugins = [
    createParagraphPlugin({
      type: 'paragraph',
    }),
  ];

  // option 2: use createPlugins
  plugins = createPlugins(plugins, {
    overrideByKey: {
      [ELEMENT_PARAGRAPH]: {
        type: 'paragraph',
      },
    },
  });

  <Plate plugins={plugins} />;
  ```

  ### `PlatePlugin`

  - `key`
    - replacing `pluginKey`
    - is now required: each plugin needs a key to be retrieved by key.
  - all handlers have `plugin` as a second parameter:

  ```tsx
  // Before
  export type X<T = {}> = (editor: PlateEditor<T>) => Y;

  // After
  export type X<T = {}, P = {}> = (
    editor: PlateEditor<T>,
    plugin: WithPlatePlugin<T, P>
  ) => Y;
  ```

  - `serialize` no longer has `element` and `leaf` properties:

  ```ts
  type SerializeHtml = RenderFunction<
    PlateRenderElementProps | PlateRenderLeafProps
  >;
  ```

  Renamed:

  - `injectParentComponent` to `inject.aboveComponent`
  - `injectChildComponent` to `inject.belowComponent`
  - `overrideProps` to `inject.props`
    - `transformClassName`, `transformNodeValue`, `transformStyle` first parameter is no longer `editor` as it's provided by `then` if needed.
    - the previously `getOverrideProps` is now the core behavior if `inject.props` is defined.
  - `serialize` to `serializeHtml`
  - `deserialize` to `deserializeHtml`
    - can be an array
    - the old deserializer options are merged to `deserializeHtml`

  ```tsx
  type DeserializeHtml = {
    /**
     * List of HTML attribute names to store their values in `node.attributes`.
     */
    attributeNames?: string[];

    /**
     * Deserialize an element.
     * Use this instead of plugin.isElement if you don't want the plugin to renderElement.
     * @default plugin.isElement
     */
    isElement?: boolean;

    /**
     * Deserialize a leaf.
     * Use this instead of plugin.isLeaf if you don't want the plugin to renderLeaf.
     * @default plugin.isLeaf
     */
    isLeaf?: boolean;

    /**
     * Deserialize html element to slate node.
     */
    getNode?: (element: HTMLElement) => AnyObject | undefined;

    query?: (element: HTMLElement) => boolean;

    /**
     * Deserialize an element:
     * - if this option (string) is in the element attribute names.
     * - if this option (object) values match the element attributes.
     */
    validAttribute?: string | { [key: string]: string | string[] };

    /**
     * Valid element `className`.
     */
    validClassName?: string;

    /**
     * Valid element `nodeName`.
     * Set '*' to allow any node name.
     */
    validNodeName?: string | string[];

    /**
     * Valid element style values.
     * Can be a list of string (only one match is needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string | string[] | undefined>
    >;

    /**
     * Whether or not to include deserialized children on this node
     */
    withoutChildren?: boolean;
  };
  ```

  - handlers starting by `on...` are moved to `handlers` field.

  ```ts
  // Before
  onDrop: handler;

  // After
  handlers: {
    onDrop: handler;
  }
  ```

  Removed:

  - `renderElement` is favor of:
    - `isElement` is a boolean that enables element rendering.
    - the previously `getRenderElement` is now the core behavior.
  - `renderLeaf` is favor of:
    - `isLeaf` is a boolean that enables leaf rendering.
    - the previously `getRenderLeaf` is now the core behavior.
  - `inlineTypes` and `voidTypes` for:
    - `isInline` is a boolean that enables inline rendering.
    - `isVoid` is a boolean that enables void rendering.

  ### General

  - `plugins` is not a parameter anymore as it can be retrieved in `editor.plugins`
  - `withInlineVoid` is now using plugins `isInline` and `isVoid` plugin fields.

  Renamed:

  - `getPlatePluginType` to `getPluginType`
  - `getEditorOptions` to `getPlugins`
  - `getPlatePluginOptions` to `getPlugin`
  - `pipeOverrideProps` to `pipeInjectProps`
  - `getOverrideProps` to `pluginInjectProps`
  - `serializeHTMLFromNodes` to `serializeHtml`
    - `getLeaf` to `leafToHtml`
    - `getNode` to `elementToHtml`
  - `xDeserializerId` to `KEY_DESERIALIZE_X`
  - `deserializeHTMLToText` to `htmlTextNodeToString`
  - `deserializeHTMLToMarks` to `htmlElementToLeaf` and `pipeDeserializeHtmlLeaf`
  - `deserializeHTMLToElement` to `htmlElementToElement` and `pipeDeserializeHtmlElement`
  - `deserializeHTMLToFragment` to `htmlBodyToFragment`
  - `deserializeHTMLToDocumentFragment` to `deserializeHtml`
  - `deserializeHTMLToBreak` to `htmlBrToNewLine`
  - `deserializeHTMLNode` to `deserializeHtmlNode`
  - `deserializeHTMLElement` to `deserializeHtmlElement`

  Removed:

  - `usePlateKeys`, `getPlateKeys`
  - `usePlateOptions` for `getPlugin`
  - `getPlateSelection` for `getPlateEditorRef().selection`
  - `flatMapByKey`
  - `getEditableRenderElement` and `getRenderElement` for `pipeRenderElement` and `pluginRenderElement`
  - `getEditableRenderLeaf` and `getRenderLeaf` for `pipeRenderLeaf` and `pluginRenderLeaf`
  - `getInlineTypes`
  - `getVoidTypes`
  - `getPlatePluginTypes`
  - `getPlatePluginWithOverrides`
  - `mapPlatePluginKeysToOptions`
  - `withDeserializeX` for `PlatePlugin.editor.insertData`

  Changed types:

  - `PlateEditor`:
    - removed `options` for `pluginsByKey`
  - `WithOverride` is not returning an extended editor anymore (input and output editors are assumed to be the same types for simplicity).
  - `PlateState`
    - renamed `keyChange` to `keyEditor`
    - removed `plugins` for `editor.plugins`
    - removed `pluginKeys`
    - removed `selection` for `editor.selection`
    - actions:
      - removed `setSelection`, `setPlugins`, `setPluginKeys`
      - removed `incrementKeyChange` for

  Renamed types:

  - `XHTMLY` to `XHtmlY`
  - `Deserialize` to `DeseralizeHtml`

  Removed types:

  - `PlatePluginOptions`:
    - `type` to `PlatePlugin.type`
    - `component` to `PlatePlugin.component`
    - `deserialize` to `PlatePlugin.deserializeHtml`
    - `getNodeProps` to `PlatePlugin.props.nodeProps`
    - `hotkey` to `HotkeyPlugin`
    - `clear` to `ToggleMarkPlugin`
    - `defaultType` is hardcoded to `p.type`
  - `OverrideProps` for `PlatePlugin.inject.props`
  - `Serialize` for `PlatePlugin.serializeHtml`
  - `NodeProps` for `AnyObject`
  - `OnKeyDownElementOptions` for `HotkeyPlugin`
  - `OnKeyDownMarkOptions` for `ToggleMarkPlugin`
  - `WithInlineVoidOptions`
  - `GetNodeProps` for `PlatePluginProps`
  - `DeserializeOptions`, `GetLeafDeserializerOptions`, `GetElementDeserializerOptions`, `GetNodeDeserializerOptions`, `GetNodeDeserializerRule`, `DeserializeNode` for `PlatePlugin.deserializeHtml`
  - `PlateOptions`
  - `RenderNodeOptions`
  - `DeserializedHTMLElement`

### Minor Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – `PlatePlugin` extended:

  - These fields are used by `withInsertData` plugin.

  ```tsx
  interface PlatePlugin {
    editor?: Nullable<{
      insertData?: {
        /**
         * Format to get data. Example data types are text/plain and text/uri-list.
         */
        format?: string;

        /**
         * Query to skip this plugin.
         */
        query?: (options: PlatePluginInsertDataOptions) => boolean;

        /**
         * Deserialize data to fragment
         */
        getFragment?: (
          options: PlatePluginInsertDataOptions
        ) => TDescendant[] | undefined;

        // injected

        /**
         * Function called on `editor.insertData` just before `editor.insertFragment`.
         * Default: if the block above the selection is empty and the first fragment node type is not inline,
         * set the selected node type to the first fragment node type.
         * @return if true, the next handlers will be skipped.
         */
        preInsert?: (
          fragment: TDescendant[],
          options: PlatePluginInsertDataOptions
        ) => HandlerReturnType;

        /**
         * Transform the inserted data.
         */
        transformData?: (
          data: string,
          options: { dataTransfer: DataTransfer }
        ) => string;

        /**
         * Transform the fragment to insert.
         */
        transformFragment?: (
          fragment: TDescendant[],
          options: PlatePluginInsertDataOptions
        ) => TDescendant[];
      };
    }>;
  }
  ```

  - `inject.pluginsByKey`:

  ```tsx
  interface PlatePlugin {
    inject?: {
      /**
       * Any plugin can use this field to inject code into a stack.
       * For example, if multiple plugins have defined
       * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
       * `insertData` plugin will call all of these `transformData` for `KEY_DESERIALIZE_HTML` plugin.
       * Differs from `overrideByKey` as this is not overriding any plugin.
       */
      pluginsByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>;
    };
  }
  ```

  - `options`: any plugin can use the second generic type to type this field. It means that each plugin can be extended using this field.
  - `type` is now optional
  - `component`: no longer need of `options` to customize the component.
  - `overrideByKey`: a plugin can override other plugins by key (deep merge).
  - `plugins`:
    - Can be used to pack multiple plugins, like the heading plugin.
    - Plate eventually flats all the plugins into `editor.plugins`.
    - nesting support (recursive)
  - `props`: Override node `component` props. Props object or function with props parameters returning the new props. Previously done by `overrideProps` and `getNodeProps` options.
  - `then`: a function that is called after the plugin is loaded.
    - this is very powerful as it allows you to have plugin fields derived from the editor and/or the loaded plugin.
    - nesting support (recursive)

  ```ts
  interface PlatePlugin {
    /**
     * Recursive plugin merging.
     * Can be used to derive plugin fields from `editor`, `plugin`.
     * The returned value will be deeply merged to the plugin.
     */
    then?: (
      editor: PlateEditor<T>,
      plugin: WithPlatePlugin<T, P>
    ) => Partial<PlatePlugin<T, P>>;
  }
  ```

  New plugins:

  - `createEventEditorPlugin` (core)
  - `createInsertDataPlugin`
    - `withInsertData`
      - all plugins using `editor.insertData` field will be used here
      - it first gets the data with `format`
      - then it pipes `query`
      - then it pipes `transformData`
      - then it calls `getFragment`
      - then it pipes `transformFragment`
      - then it pipes `insertFragment`

  New utils:

  - `@udecode/plate-common` has been merged into this package as both packages were dependencies of the exact same packages.
  - `@udecode/plate-html-serializer` has been merged into this package.
  - `@udecode/plate-ast-serializer` has been merged into this package.
  - `@udecode/plate-serializer` has been merged into this package.
  - `createPlateEditor`: Create a plate editor with:
    - `createEditor` or custom `editor`
    - `withPlate`
    - custom `components`
  - `createPluginFactory`: Create plugin factory with a default plugin.
    - The plugin factory:
      - param 1 `override` can be used to (deeply) override the default plugin.
      - param 2 `overrideByKey` can be used to (deeply) override a nested plugin (in plugin.plugins) by key.
  - `createPlugins`: Creates a new array of plugins by overriding the plugins in the original array.
    - Components can be overridden by key using `components` in the second param.
    - Any other properties can be overridden by key using `overrideByKey` in the second param.
  - `findHtmlParentElement`
  - `flattenDeepPlugins`: Recursively merge `plugin.plugins` into `editor.plugins` and `editor.pluginsByKey`
  - `mergeDeepPlugins`: Recursively merge nested plugins into the root plugins.
  - `getInjectedPlugins`:
    - Get all plugins having a defined `inject.pluginsByKey[plugin.key]`.
    - It includes `plugin` itself.
  - `getPluginInjectProps`
  - `getPluginOptions`
  - `getPluginsByKey`
  - `mockPlugin`
  - `overridePluginsByKey`: Recursive deep merge of each plugin from `overrideByKey` into plugin with same key (`plugin` > `plugin.plugins`).
  - `pipeInsertDataQuery`
  - `pipeInsertFragment`
  - `pipeTransformData`
  - `pipeTransformFragment`
  - `setDefaultPlugin`
  - `setPlatePlugins`: Flatten deep plugins then set editor.plugins and editor.pluginsByKey
  - `deserializeHtmlNodeChildren`
  - `isHtmlComment`
  - `isHtmlElement`
  - `isHtmlText`
  - `pluginDeserializeHtml`

  New selectors:

  - `usePlateKey`

  New types:

  - `HotkeyPlugin` – `hotkey`
  - `ToggleMarkPlugin` – `hotkey`, `mark`
  - `OverrideByKey`
  - `WithPlatePlugin`:
    - `PlatePlugin` with required `type`, `options`, `inject` and `editor`.
    - `Plate` will create default values if not defined.

  Extended types:

  - `PlateEditor`:
    - `plugins`: list of the editor plugins
    - `pluginsByKey`: map of the editor plugins
  - `PlateState`:
    - `keyPlugins`: A key that is incremented on each `editor.plugins` change.
    - `keySelection`: A key that is incremented on each `editor.selection` change.
  - `WithPlateOptions`:
    - `disableCorePlugins`
      - disable core plugins if you'd prefer to have more control over the plugins order.

## 7.0.2

### Patch Changes

- [#1205](https://github.com/udecode/plate/pull/1205) by [@zbeyens](https://github.com/zbeyens) – fix: removed editor and plugins from DefaultLeaf span attributes

## 7.0.1

### Patch Changes

- [#1201](https://github.com/udecode/plate/pull/1201) by [@zbeyens](https://github.com/zbeyens) – fix: plugin `options.type` default value was not set

## 7.0.0

### Major Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –
  - renamed:
    - `SPEditor` to `PEditor` (note that `PlateEditor` is the new default)
    - `SPRenderNodeProps` to `PlateRenderNodeProps`
    - `SPRenderElementProps` to `PlateRenderElementProps`
    - `SPRenderLeafProps` to `PlateRenderLeafProps`
    - `useEventEditorId` to `usePlateEventId`
    - `useStoreEditorOptions` to `usePlateOptions`
    - `useStoreEditorRef` to `usePlateEditorRef`
    - `useStoreEditorSelection` to `usePlateSelection`
    - `useStoreEditorState` to `usePlateEditorState`
    - `useStoreEditorValue` to `usePlateValue`
    - `useStoreEnabled` to `usePlateEnabled`
    - `useStorePlate` to `usePlatePlugins`
    - `useStorePlatePluginKeys` to `usePlateKeys`
    - `useStoreState` to `usePlateState`
  - `getPlateId`: Get the last focused editor id, else get the last blurred editor id, else get the first editor id, else `null`
  - `getPlateState`:
    - removed first parameter `state`
    - previously when giving no parameter, it was returning the first editor. Now it's returning the editor with id = `getPlateId()`. It means `useEventEditorId('focus')` is no longer needed for
      - `usePlateEditorRef`
      - `usePlateEditorState`
      - `usePlateX`...

### Minor Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –

  - `getEditableRenderElement`: now uses plugins `injectChildComponent` to wrap `children` (lowest)
  - `getEditableRenderElement`: now uses plugins `injectParentComponent` to wrap `component` (highest)
  - new store selectors:
    - `getPlateEditorRef`
    - `getPlateEnabled`
    - `getPlateKeys`
    - `getPlatePlugins`
    - `getPlateSelection`
    - `getPlateValue`
    - `getPlateEventId`

  Types:

  - `PlatePlugin`, `PlatePluginEditor` new fields:
    - `injectChildComponent`: Inject child component around any node children.
    - `injectParentComponent`: Inject parent component around any node `component`.
    - `overrideProps` supports arrays.
  - `SPRenderNodeProps` new fields:
    - `editor: PlateEditor`
    - `plugins: PlatePlugin`
  - new types:
    - `PlateEditor<T = {}>`: default editor type used in Plate, assuming we all use history and react editors.
    - `InjectComponent`

  ```ts
  type InjectComponent = <T = AnyObject>(
    props: PlateRenderElementProps & T
  ) => RenderFunction<PlateRenderElementProps> | undefined;
  ```

## 6.4.1

### Patch Changes

- [`87b133ce`](https://github.com/udecode/plate/commit/87b133cee230c79eaca7e6afb6e237bbc57f98c2) by [@zbeyens](https://github.com/zbeyens) –
  - slate `DefaultLeaf` does not spread the props to the rendered span so we're using our own `DefaultLeaf` component which does it. It enables us to override the props leaves without having to register a component (e.g. fontColor)

## 6.2.0

### Patch Changes

- [#1173](https://github.com/udecode/plate/pull/1173) by [@zbeyens](https://github.com/zbeyens) – Replace `import * as React` by `import React`

## 6.0.0

### Patch Changes

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – fix: `PlatePluginComponent` type

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – generic type support:

  - `getEditorOptions`
  - `getPlatePluginOptions`
  - `PlatePluginOptions`
  - `PlateOptions`

- [#1150](https://github.com/udecode/plate/pull/1150) by [@jeffsee55](https://github.com/jeffsee55) –
  - Fixes dependencie issue for React<17 users by using the classic `React.createElement` function rather than the newer `jsx-runtime` transform.
  - Per babel docs: https://babeljs.io/docs/en/babel-preset-react#with-a-configuration-file-recommended

## 5.3.1

### Patch Changes

- [#1136](https://github.com/udecode/plate/pull/1136) [`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118) Thanks [@dylans](https://github.com/dylans)! - allow disabling deserializer by paste target

## 5.3.0

### Minor Changes

- [#1126](https://github.com/udecode/plate/pull/1126) [`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e) Thanks [@zbeyens](https://github.com/zbeyens)! - feat:
  - `PlatePlugin`
    - new field: `overrideProps`
      - Overrides rendered node props (shallow merge).
      - This enables controlling the props of any node component (use cases: indent, align,...).
      - used by `pipeRenderElement` and `pipeRenderLeaf`
  - `getRenderElement` and `getRenderLeaf`:
    - pass the rest of the props to the component
    - `getRenderNodeProps`:
      - computes slate class and `nodeProps`
  - new dependency: `clsx`
  - new types:
    - `OverrideProps`
    - `PlatePluginEditor`
    - `PlatePluginSerialize`
    - `PlatePluginNode`
    - `PlatePluginElement`
    - `PlatePluginLeaf`

## 4.3.7

### Patch Changes

- [#1089](https://github.com/udecode/plate/pull/1089) [`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: performance issue when passing `value` prop to `Plate`

## 4.3.0

### Minor Changes

- [#1063](https://github.com/udecode/plate/pull/1063) [`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6) Thanks [@ghingis](https://github.com/ghingis)! - add `normalizeInitialValue` prop to `Plate`. When `true`, it will normalize the initial value passed to the `editor` once it's created. This is useful when adding normalization rules on already existing content. Default is `false`.

## 3.4.0

### Minor Changes

- [#1022](https://github.com/udecode/plate/pull/1022) [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c) Thanks [@zbeyens](https://github.com/zbeyens)! - `overrideProps`: new plate option used by `getRenderElement` and `getRenderLeaf`
  - If it's a function, its return value will override the component props.
  - If it's an object, it will override the component props.

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, find and replace all occurrences of:

- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`

## 1.0.0-next.61

> This is the last version of `@udecode/slate-plugins[-x]`, please install
> `@udecode/plate[-x]`.

### Minor Changes

- [#869](https://github.com/udecode/slate-plugins/pull/869) [`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3) Thanks [@zbeyens](https://github.com/zbeyens)! - - New plugin option `deserialize.getFragment`: Function called on `editor.insertData` to filter the fragment to insert.
  - New plugin option `deserialize.preInsert`: Function called on `editor.insertData` just before `editor.insertFragment`. Default: if the block above the selection is empty and the first fragment node type is not inline, set the selected node type to the first fragment node type. If returns true, the next handlers will be skipped.

## 1.0.0-next.56

### Patch Changes

- [#855](https://github.com/udecode/slate-plugins/pull/855) [`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d) Thanks [@zbeyens](https://github.com/zbeyens)! - Sometimes we want to preventDefault without stopping the handler pipeline, so we remove this check.
  In summary, to stop the pipeline, a handler has to return `true` or run `event.stopPropagation()`

## 1.0.0-next.55

### Major Changes

- [#853](https://github.com/udecode/slate-plugins/pull/853) [`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79) Thanks [@zbeyens](https://github.com/zbeyens)! - Before, the handlers had to return `false` to prevent the next handlers to be called.
  Now, we reuse `isEventHandled` internally used by `slate@0.65.0` which has the opposite behavior: a handler has to return `true` to stop the pipeline.
  Additionally, the pipeline stops if at any moment `event.isDefaultPrevented()` or `event.isPropagationStopped()` returns `true`, except if the handler returns `false`.
  See the updated docs in "Creating Plugins".

## 1.0.0-next.53

### Patch Changes

- [#840](https://github.com/udecode/slate-plugins/pull/840) [`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af) Thanks [@zbeyens](https://github.com/zbeyens)! - fix:
  - Plugin handlers are now run when a handler is passed to `editableProps`
  - If one handler returns `true`, slate internal corresponding handler is not called anymore

## 1.0.0-next.40

### Patch Changes

- [#773](https://github.com/udecode/slate-plugins/pull/773) [`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: before, store setValue was called at the start of `onChange` pipeline. Now, it's called at the end of the pipeline so we can make use of this value as the "previous value" in plugins `onChange`.

## 1.0.0-next.39

### Patch Changes

- [#756](https://github.com/udecode/slate-plugins/pull/756) [`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: `TNode`, `TElement`, `TLeaf` types extended

## 1.0.0-next.36

### Minor Changes

- [#723](https://github.com/udecode/slate-plugins/pull/723) [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e) Thanks [@Aedron](https://github.com/Aedron)! - feat: new `SlatePlugins` option - `renderEditable`: Custom `Editable` node

## 1.0.0-next.30

### Patch Changes

- [#697](https://github.com/udecode/slate-plugins/pull/697) [`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67) Thanks [@zbeyens](https://github.com/zbeyens)! - add back onDOMBeforeInput

- [#678](https://github.com/udecode/slate-plugins/pull/678) [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0) Thanks [@horacioh](https://github.com/horacioh)! - fix: `getSlatePluginWithOverrides` options types

## 1.0.0-next.29

### Major Changes

- [#687](https://github.com/udecode/slate-plugins/pull/687) [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3) Thanks [@zbeyens](https://github.com/zbeyens)! - changes:
  - renamed:
    - `useTSlate` to `useEditorState`
    - `useTSlateStatic` to `useEditorRef`
    - `useStoreEditor` to `useStoreEditorRef`
  - removed:
    - `useEditorId` in favor of `useEditorRef().id`
    - `useEditorOptions` in favor of `useEditorRef().options`
    - `useSlatePluginOptions` in favor of `getSlatePluginOptions(useEditorRef(), pluginKey)`
    - `useSlatePluginType` in favor of `getSlatePluginType(useEditorRef(), pluginKey)`
    - `pipeOnDOMBeforeInput` in favor of `pipeHandler`
    - `pipeOnKeyDown` in favor of `pipeHandler`
  - types:
    - renamed:
      - `SlatePluginsState` to `SlatePluginsStates`
      - `State` to `SlatePluginsState`
    - removed:
      - `OnDOMBeforeInput` in favor of `DOMHandler<'onDOMBeforeInput'>`
      - `OnKeyDown` in favor of `KeyboardHandler`

### Minor Changes

- [#687](https://github.com/udecode/slate-plugins/pull/687) [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3) Thanks [@zbeyens](https://github.com/zbeyens)! - changes:
  - `useEditableProps` (used by `SlatePlugins`):
    - new fields returned: all handler props from the plugins (if defined)
    - new core plugins with the following fields:
      - `onFocus: setEventEditorId('focus', id)`
      - `onBlur: setEventEditorId('blur', id)`
      - You can add your own handlers in a plugin
  - `EditorStateEffect`: a new component used by `SlatePlugins` to update the editor state.
  - `setEventEditorId`: a new action. Set an editor id by event key.
  - `eventEditorStore`, `useEventEditorStore`: a new store. Store where the keys are event names and the values are editor ids.
  - `usePlateEventId`: a new selector. Get the editor id by `event` key.
  - `useStoreEditorSelection`: a new selector. Get the editor selection which is updated on editor change.
  - `useStoreEditorState`: a new selector. Get editor state which is updated on editor change. Similar to `useSlate`.
  - `SlatePlugin`: the previous plugin could implement the following handlers: `onChange`, `onDOMBeforeInput` and `onKeyDown`. The plugins now implement all DOM handlers: clipboard, composition, focus, form, image, keyboard, media, mouse, selection, touch, pointer, ui, wheel animation and transition events.
  - `SlatePluginsState` (store interface):
    - a new field `keyChange` incremented by `SlatePlugins` on `useSlate` update.
    - a new field `selection = editor.selection` updated on `useSlate` update.
  - `pipeHandler`: a new function. Generic pipe for handlers.

## 1.0.0-next.26

### Patch Changes

- [#658](https://github.com/udecode/slate-plugins/pull/658) [`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea) Thanks [@zbeyens](https://github.com/zbeyens)! - test
