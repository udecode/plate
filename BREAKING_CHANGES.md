# 30.0.0

## @udecode/plate-table@30.0.0

### Major Changes

-   [#2867](https://github.com/udecode/plate/pull/2867) by [@12joan](https://github.com/12joan) – Fix: in v28, `TableProvider` was incorrectly shared by all tables in the editor. `TableProvider` must now be rendered as part of `TableElement`.

# 29.0.0

## @udecode/plate-utils@29.0.0

### Major Changes

-   [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
    -   Moved `withProps` to `@udecode/cn`
    -   Moved `PortalBody`, `Text`, `Box`, `createPrimitiveComponent`, `createSlotComponent`, `withProviders` to `@udecode/react-utils`
    -   Removed `getRootProps` (unused)

# 28.0.0

## @udecode/plate-core@28.0.0

### Major Changes

-   [`822f6f56b`](https://github.com/udecode/plate/commit/822f6f56be526a6e26f904b9e767c0bc09f1e28b) by [@12joan](https://github.com/12joan) –
    -   Remove `{ fn: ... }` workaround for jotai stores that contain functions
    -   Breaking change: `usePlateSelectors`, `usePlateActions` and `usePlateStates` no longer accept generic type arguments. If custom types are required, cast the resulting values at the point of use, or use hooks like `useEditorRef` that still provide generics.

# 27.0.0

## @udecode/plate-comments@27.0.0

### Major Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store to `jotai@2`
  - Revert the breaking changes to `@udecode/plate-comments` made in 26.0.0

## @udecode/plate-core@27.0.0

### Major Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store from `jotai@1` to `jotai@2`
    - New dependency: `jotai-x`. See <https://github.com/udecode/jotai-x>
    - Accessing a store without an explicit provider component is no longer supported. Attempting to do so will result in a warning in the console: `Tried to access jotai store '${storeName}' outside of a matching provider.`
  - Upgraded from `zustand@3` to `zustand@4`
    - See <https://github.com/udecode/zustand-x>
  - Rename `zustand-x` exports
    - `StateActions` -> `ZustandStateActions`
    - `StoreApi` -> `ZustandStoreApi`
    - `createStore` -> `createZustandStore`
    - Note that these exports are deprecated and should not be used in new code. They may be removed in a future version of Plate.

## @udecode/plate-resizable@27.0.0

### Major Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store to `jotai@2`
  - Resizable components must now be wrapped inside a `ResizableProvider`

# 26.0.0

## @udecode/plate-comments@26.0.0

### Major Changes

- [#2760](https://github.com/udecode/plate/pull/2760) by [@12joan](https://github.com/12joan) –
  - Renamed the `comments` prop on CommentsProvider to `initialComments` to reflect the fact that updating its value after the initial render has no effect
  - Removed the following props from CommentsProvider, since they represent the internal state of the comments plugin and should not be controlled externally:
    - `activeCommentId`
    - `addingCommentId`
    - `newValue`
    - `focusTextarea`
  - The following props on CommentsProvider can now be updated after the initial render (whereas prior to this version, doing so had no effect):
    - `myUserId`
    - `users`
    - `onCommentAdd`
    - `onCommentUpdate`
    - `onCommentDelete`

## @udecode/plate-serializer-html@26.0.0

### Major Changes

- [#2733](https://github.com/udecode/plate/pull/2733) by [@dimaanj](https://github.com/dimaanj) –
  - [Breaking] `serializeHtml`: replaced option `slateProps` by `plateProps`.

# 25.0.1

## @udecode/plate-core@25.0.1

### Major Changes

- [#2729](https://github.com/udecode/plate/pull/2729) by [@12joan](https://github.com/12joan) – **This is a breaking change meant to be part of v25, hence the patch.**
  On `deserializeHtml`, replace `stripWhitespace` with `collapseWhiteSpace`, defaulting to true. The `collapseWhiteSpace` option aims to parse white space in HTML according to the HTML specification, ensuring greater accuracy when pasting HTML from browsers.

## @udecode/plate-comments@25.0.0

### Major Changes

- [#2725](https://github.com/udecode/plate/pull/2725) by [@EandrewJones](https://github.com/EandrewJones) – Remove `useCommentValue`, which was redundant with the hooks applied automatically in `CommentEditTextarea.tsx`.

# 24.0.0

## @udecode/plate-core@24.0.0

### Major Changes

- [#2629](https://github.com/udecode/plate/pull/2629) by [@zbeyens](https://github.com/zbeyens) –

  - [**Breaking**] Rename `Plate` to `PlateContent`.
  - [**Breaking**] Rename `PlateProvider` to `Plate`.
  - [**Breaking**] Rendering `PlateContent` is now required in `Plate`. This allows you to choose where to render the editor next to other components like toolbar. Example:

  ```tsx
  // Before
  <Plate />
  // or
  <PlateProvider>
    <Plate />
  </PlateProvider>

  // After
  <Plate>
    <PlateContent />
  </Plate>
  ```

  - [**Breaking**] Remove provider props such as `plugins` from `PlateContent`. These props should be passed to `Plate`.
  - [**Breaking**] Remove `editableProps` prop from `PlateContent`. Move these as`PlateContent` props.
  - [**Breaking**] Remove `children` prop from `PlateContent`. Render instead these components after `PlateContent`.
  - [**Breaking**] Remove `firstChildren` prop from `PlateContent`. Render instead these components before `PlateContent`.
  - [**Breaking**] Remove `editableRef` prop from `PlateContent`. Use `ref` instead.
  - [**Breaking**] Remove `withPlateProvider`.
  - [**Breaking**] Rename `usePlateEditorRef` to `useEditorRef`.
  - [**Breaking**] Rename `usePlateEditorState` to `useEditorState`.
  - [**Breaking**] Rename `usePlateReadOnly` to `useEditorReadOnly`. This hook can be used below `Plate` while `useReadOnly` can only be used in node components.
  - [**Breaking**] Rename `usePlateSelection` to `useEditorSelection`.
  - [**Breaking**] Rename store attributes `keyDecorate`, `keyEditor` and `keySelection` to `versionDecorate`, `versionEditor` and `versionSelection`. These are now numbers incremented on each change.
  - [**Breaking**] Rename store attribute `isRendered` to `isMounted`.

# 23.0.0

## @udecode/plate-media@23.0.0

### Major Changes

- [#2537](https://github.com/udecode/plate/pull/2537) by [@haydencarlson](https://github.com/haydencarlson) – `MediaEmbedElement` is now more headless with a smaller bundle size.
  Update the following components:

  - `npx @udecode/plate-ui@latest add media-embed-element`
    - now uses `react-lite-youtube-embed` for YouTube videos.
    - now uses `react-tweet` for Twitter tweets.
  - `npx @udecode/plate-ui@latest add image-element`

  Breaking changes:

  - Moved `Resizable` to `@udecode/plate-resizable`
  - Moved `Caption`, `CaptionTextarea` to `@udecode/plate-caption`
  - Removed `useMediaEmbed`, `MediaEmbedVideo`, `MediaEmbedTweet`, `Tweet`, `parseMediaUrl`, `mediaStore`
  - Removed `@udecode/resizable`, `scriptjs`, `react-textarea-autosize` dependencies
  - `MediaPlugin`
    - removed `rules`. Use `parsers` option instead.
    - removed `disableCaption`. Use `createCaptionPlugin` instead.
  - Caption is now a separate plugin. Install `@udecode/plate-caption` and add it to your plugins:

  ```ts
  import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';

  createCaptionPlugin({
    options: { pluginKeys: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED] },
  });
  ```

## @udecode/plate-resizable@23.0.0

### Major Changes

- [#2541](https://github.com/udecode/plate/pull/2541) by [@zbeyens](https://github.com/zbeyens) –
  - Package renamed to `@udecode/plate-resizable`.
  - `ResizeHandle` is now fully headless: no style is applied by default. Add your own `Resizable`, `ResizeHandle` components:
    - `npx @udecode/plate-ui@latest add resizable`

## @udecode/plate-table@23.0

### Major Changes

- Removed `TableCellElementResizable`. Use `useTableCellElementResizableState` and `useTableCellElementResizable` instead.

# 22.0.0

Headless UI.

## @udecode/plate-ui@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – This package is now a CLI to generate components. Install it as a dev dependency. See <https://platejs.org/docs/components/cli>.

Migration:

- [Manual installation](https://platejs.org/docs/components/installation/manual).
- For each unresolved import not listed in the following major changes (components from `@udecode/plate-ui-x`), generate the component using the [CLI](https://platejs.org/docs/components/cli).

## @udecode/plate-comments@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `AccountCircleIcon`
  - `CheckIcon`
  - `MoreVertIcon`
  - `RefreshIcon`
  - `AvatarImage`
  - `CommentLinkButton`
  - `CommentLinkDialog`
  - `CommentLinkDialogCloseButton`
  - `CommentLinkDialogCopyLink`
  - `CommentLinkDialogInput`
  - `PlateCommentLeaf` for `useCommentLeafState`

## @udecode/plate-dnd@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `Draggable`
  - `DraggableBlock`
  - `DraggableBlockToolbar`
  - `DraggableBlockToolbarWrapper`
  - `DraggableDropline`
  - `DraggableGutterLeftProps`
  - `DraggableRoot`
  - `DragHandle`

## @udecode/plate-link@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `FloatingLink`
  - `FloatingLinkEditButton`
  - `FloatingLinkTextInput`
  - `UnlinkButton`
  - `LaunchIcon`
  - `Link`
  - `LinkIcon`
  - `LinkOffIcon`
  - `ShortTextIcon`

## @udecode/plate-media@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `MediaEmbed`

## @udecode/plate@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Plate 2.0 – Headless UI.
  Read the docs about the new UI pattern: <https://platejs.org/docs/components>.

  - Removed `@udecode/plate-ui` dependency.
  - Removed `@udecode/plate-emoji` dependency. You can install it separately.
  - Removed `styled-components` peerDependency.

  Replaced `@udecode/plate-headless` dependency (deprecated) by:

  - `@udecode/plate-alignment`
  - `@udecode/plate-autoformat`
  - `@udecode/plate-basic-elements`
  - `@udecode/plate-basic-marks`
  - `@udecode/plate-block-quote`
  - `@udecode/plate-break`
  - `@udecode/plate-code-block`
  - `@udecode/plate-combobox`
  - `@udecode/plate-comments`
  - `@udecode/plate-common`
  - `@udecode/plate-find-replace`
  - `@udecode/plate-floating`
  - `@udecode/plate-font`
  - `@udecode/plate-heading`
  - `@udecode/plate-highlight`
  - `@udecode/plate-horizontal-rule`
  - `@udecode/plate-indent`
  - `@udecode/plate-indent-list`
  - `@udecode/plate-kbd`
  - `@udecode/plate-line-height`
  - `@udecode/plate-link`
  - `@udecode/plate-list`
  - `@udecode/plate-media`
  - `@udecode/plate-mention`
  - `@udecode/plate-node-id`
  - `@udecode/plate-normalizers`
  - `@udecode/plate-paragraph`
  - `@udecode/plate-reset-node`
  - `@udecode/plate-select`
  - `@udecode/plate-serializer-csv`
  - `@udecode/plate-serializer-docx`
  - `@udecode/plate-serializer-html`
  - `@udecode/plate-serializer-md`
  - `@udecode/plate-suggestion`
  - `@udecode/plate-tabbable`
  - `@udecode/plate-table`
  - `@udecode/plate-trailing-block`
  - `@udecode/resizable`

## @udecode/plate-utils@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Upgraded peer dependencies:
  - `slate-react: >=0.95.0`
    Removed:
  - `useElementPrpos`
  - `useWrapElement`
  - `createComponentAs`
  - `createElementAs`

## @udecode/plate-table@22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `TableCellElement`
  - `TableCellElementResizableWrapper`
  - `TableCellElementRoot`
  - `TableElement`
  - `TableElementCol`
  - `TableElementColGroup`
  - `TableElementRoot`
  - `TableElementTBody`
  - `TableRowElement`
  - `ArrowDropDownCircleIcon`
  - `BorderAllIcon`
  - `BorderBottomIcon`
  - `BorderLeftIcon`
  - `BorderNoneIcon`
  - `BorderOuterIcon`
  - `BorderRightIcon`
  - `BorderTopIcon`

# 21.0.0

## @udecode/slate@21.0.0

### Major Changes

- [#2369](https://github.com/udecode/plate/pull/2369) by [@zbeyens](https://github.com/zbeyens) – Support `slate@0.94.0`, `slate-react@0.94.0` and `slate-history@0.93.0` by upgrading the peer dependencies.

# 20.0.0

## @udecode/plate-core@20.0.0

### Major Changes

- [`0077402`](https://github.com/udecode/plate/commit/00774029236d37737abdadf49b074e613e290792) by [@zbeyens](https://github.com/zbeyens) –
  - This package has been split into multiple packages for separation of concerns and decoupled versioning:
    - `@udecode/utils` is a collection of miscellaneous utilities. Can be used by any project.
    - `@udecode/slate` is a collection of `slate` experimental features and bug fixes that may be moved into `slate` one day. It's essentially composed of the generic types. Can be used by vanilla `slate` consumers without plate.
    - `@udecode/slate-react` is a collection of `slate-react` experimental features and bug fixes that that may be moved into `slate-react` one day. It's essentially composed of the generic types. Can be used by vanilla `slate-react` consumers without plate.
    - `@udecode/plate-core` is the minimalistic core of plate. It essentially includes `Plate`, `PlateProvider` and their dependencies. Note this package is not dependent on the `*-utils` packages.
    - `@udecode/slate-utils` is a collection of utils depending on `@udecode/slate`. Can be used by vanilla `slate` consumers without plate.
    - `@udecode/plate-utils` is a collection of utils depending on `@udecode/slate-react` and `@udecode/plate-core`
    - `@udecode/plate-common` re-exports the 6 previous packages and is a dependency of all the other packages. It's basically replacing `@udecore/plate-core` as a bundle.
  - Removed `getPreventDefaultHandler` since it is no longer needed.
    **Migration**:
    - If using `@udecode/plate` or `@udecode/plate-headless`: none
    - Else: find & replace `@udecode/plate-core` by `@udecode/plate-common`

## @udecode/plate-link@20.0.0

### Major Changes

- [#2240](https://github.com/udecode/plate/pull/2240) by [@OliverWales](https://github.com/OliverWales) –
  - Add `allowedSchemes` plugin option
    - Any URL schemes other than `http(s)`, `mailto` and `tel` must be added to `allowedSchemes`, otherwise they will not be included in links

## @udecode/plate-table@20.0.0

### Major Changes

- [#2251](https://github.com/udecode/plate/pull/2251) by [@zbeyens](https://github.com/zbeyens) –
  - `TablePlugin` option `disableUnsetSingleColSize` has been renamed and inverted into `enableUnsetSingleColSize`. New default is disabled. **Migration**:
    - if using `disableUnsetSingleColSize: true`, the option can be removed
    - if using `disableUnsetSingleColSize: false`, use `enableUnsetSingleColSize: true`
  - `getTableColumnIndex` second parameter type is now: `cellNode: TElement`

## @udecode/plate-ui-dnd@20.0.0

### Major Changes

- [#2237](https://github.com/udecode/plate/pull/2237) by [@tmorane](https://github.com/tmorane) – Unstyled logic has been moved to `@udecode/plate-dnd`

  ```ts
  // before
  import { createDndPlugin } from '@udecode/plate-ui-dnd';

  // after
  import { createDndPlugin } from '@udecode/plate-dnd';
  ```

  Only `withPlateDraggable`, `withPlateDraggables` and `PlateDraggable` are left in `@udecode/plate-ui-dnd`.
  Renamed:

  - `withDraggables` -> `withPlateDraggables`. In the second parameter, draggable props options have been moved under `draggableProps`:

  ```tsx
  // before
  {
    onRenderDragHandle: () => {}
    styles,
  }

  // after
  {
    draggableProps: {
      onRenderDragHandle: () => {}
      styles,
    },
  }
  ```

## @udecode/plate-ui-table@20.0.0

### Major Changes

- [#2251](https://github.com/udecode/plate/pull/2251) by [@zbeyens](https://github.com/zbeyens) – Headless components and hooks moved to `@udecode/plate-table`, so the following components have been renamed:
  - `TableElement` -> `PlateTableElement`
    - removed table border to set it at the cell level
    - `margin-left: 1px` to support cell borders
    - if all columns have a fixed size, the table will have a dynamic width instead of always 100%
  - `TableRowElement` -> `PlateTableRowElement`
  - `TableCellElement` -> `PlateTableCellElement`
    - removed td border in favor of td::before. The latter is responsible of having the border and the selected background color.
    - z-index: td is 0, td::before is 10, td::before in selected state is 20, handle is 30, handle resize is 40.
    - removed `selectedCell` div in favor of `::before`
  - `TablePopover` -> `PlateTablePopover`
    Styled props have been removed.

# 19.0.0

## @udecode/plate-core@19.0.0

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

## @udecode/plate@19.0.0

### Major Changes

- [#2097](https://github.com/udecode/plate/pull/2097) by [@zbeyens](https://github.com/zbeyens) –
  - due to esm issues, dnd plugin is not part of plate package anymore. To use it, install `@udecode/plate-ui-dnd`
  ```ts
  // before
  import { createDndPlugin } from '@udecode/plate';
  // after
  import { createDndPlugin } from '@udecode/plate-ui-dnd';
  ```
  - upgrade peerDeps:
  ```json
  // from
  "slate": ">=0.78.0",
  "slate-history": ">=0.66.0",
  "slate-react": ">=0.79.0"
  // to
  "slate": ">=0.87.0",
  "slate-history": ">=0.86.0",
  "slate-react": ">=0.88.0"
  ```

# 18.0.0

## @udecode/plate-headless@18.0.0

### Major Changes

- [#1889](https://github.com/udecode/plate/pull/1889) by [@zbeyens](https://github.com/zbeyens) –
  - `@udecode/plate-selection` package moved out from `@udecode/plate` because of <https://github.com/Simonwep/selection/issues/124>
  - Migration:
    - If not using `createBlockSelectionPlugin`, no migration is needed.
    - Otherwise, install `@udecode/plate-selection` and import `createBlockSelectionPlugin` from that package.

# 17.0.0

## @udecode/plate-core@17.0.0

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
    - Functions are stored in an object `{ fn: <here> }`
      - `const setOnChange = usePlateActions(id).onChange()`
      - `setOnChange({ fn: newOnChange })`
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

## @udecode/plate-code-block@17.0.0

### Major Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –
  - Removed these imports because of build errors:
    - `prismjs/components/prism-django`
    - `prismjs/components/prism-ejs`
    - `prismjs/components/prism-php`

## @udecode/plate-ui@17.0.0

### Major Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –
  - Removed `[ELEMENT_CODE_BLOCK]: CodeBlockElement` from Plate UI. You can define it in your app.

# 16.0.0

## @udecode/plate@16.0.0

## @udecode/plate-headless@16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - deprecate `@udecode/plate-image` and `@udecode/plate-media-embed`, those got merged into `@udecode/plate-media`

## @udecode/plate-media@16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - removed:
    - `useImageElement` for `useElement`
    - `MediaEmbedUrlInput` for `FloatingMediaUrlInput`
    - `parseEmbedUrl` for `parseMediaUrl`
    - `EmbedProviders`
  - renamed:
    - `ImageImg` to `Image`
    - `ImageCaptionTextarea` to `CaptionTextarea`
    - `useImageCaptionString` to `useCaptionString`
    - `ImageResizable` to `Resizable`

## @udecode/plate-ui-table@16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
- `TableElementBase` props:
  - replace `onRenderContainer` by `floatingOptions` or by replacing `ELEMENT_TABLE` in the `createPlateUI` function.
- `TablePopover` is now a floating instead of tippy
- deps:
  - replaced `plate-ui-popover` by `plate-floating`

## @udecode/plate-ui@16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
- deprecate `@udecode/plate-ui-popover` for `@udecode/plate-floating`

# 15.0.0

## @udecode/plate-combobox@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - deps:
    - replaced `@udecode/plate-ui-popper` by `@udecode/plate-floating`
  - `comboboxStore`:
    - removed `popperContainer`, use `floatingOptions` instead
    - removed `popperOptions`, use `floatingOptions` instead

## @udecode/plate-link@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - `createLinkPlugin`
    - removed `onKeyDownLink` for floating link
    - removed `hotkey` for `triggerFloatingLinkHotkeys`
  - removed:
    - `getAndUpsertLink` for `upsertLink`
    - `upsertLinkAtSelection` for `upsertLink`
  - `LinkToolbarButton`:
    - `onClick` now calls `triggerFloatingLink`

## @udecode/plate-table@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
- remove `addRow` for `insertTableRow`
- remove `addColumn` for `insertTableColumn`

## @udecode/plate@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - remove `@udecode/plate-ui-popper` dep for `@udecode/plate-floating`

## @udecode/plate-ui-button@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - moved `Button` to `@udecode/plate-button`
  - `Button` is now unstyled

## @udecode/plate-ui-popper@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
- deprecated, use instead `@udecode/plate-floating`

## @udecode/plate-ui-toolbar@15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
- remove `@udecode/plate-ui-popper` and `react-popper` deps for `@udecode/plate-floating`
- `BalloonToolbarProps`:
  - removed `popperOptions` for `floatingOptions`
- remove `useBalloonToolbarPopper` for `useFloatingToolbar`

# 14.0.0

## @udecode/plate-core@14.0.0

### Major Changes

- [#1633](https://github.com/udecode/plate/pull/1633) by [@tjramage](https://github.com/tjramage) – Moved `serializeHtml` and its utils to `@udecode/plate-serializer-html` as it has a new dependency: [html-entities](https://www.npmjs.com/package/html-entities).
  - If you're using `@udecode/plate`, no migration is needed
  - Otherwise, import it from `@udecode/plate-serializer-html`

# 13.0.0

## @udecode/plate-core@13.1.0

### Major Changes

- `Plate` children are now rendered as last children of `Slate` (previously first children). To reproduce the previous behavior, move `children` to `firstChildren`

## @udecode/plate@13.0.0

## @udecode/plate-headless@13.0.0

### Major Changes

- [#1585](https://github.com/udecode/plate/pull/1585) by [@zbeyens](https://github.com/zbeyens) – Removed `@udecode/plate-juice` from `@udecode/plate`. Install it if using `@udecode/plate-serializer-docx`:
  ```bash
  yarn install @udecode/plate-juice
  ```

## @udecode/plate@13.0.0

## @udecode/plate-ui@13.0.0

## @udecode/plate-ui-dnd@13.0.0

### Major Changes

- [#1585](https://github.com/udecode/plate/pull/1585) by [@zbeyens](https://github.com/zbeyens) – Moved `react-dnd react-dnd-html5-backend` deps to peer-dependencies. Install these if using `@udecode/plate-ui-dnd`:
  ```bash
  yarn install react-dnd react-dnd-html5-backend
  ```

# 12.0.0

## @udecode/plate-ui-dnd@12.0.0

### Major Changes

- [#1579](https://github.com/udecode/plate/pull/1579) by [@zbeyens](https://github.com/zbeyens) – renamed:
- `useDndBlock` options:
  - `blockRef` -> `nodeRef`
  - `removePreview` -> `preview.disable`
- `useDropBlockOnEditor` -> `useDropBlock`
- `useDropBlock` options:
  - `blockRef` -> `nodeRef`
  - `setDropLine` -> `onChangeDropLine`
    signature change:
- `getHoverDirection`:

```tsx
// before
(
  dragItem: DragItemBlock,
  monitor: DropTargetMonitor,
  ref: any,
  hoverId: string
)
// after
{
  dragItem,
  id,
  monitor,
  nodeRef,
}: GetHoverDirectionOptions
```

# 11.0.0

## @udecode/plate-core@11.0.6

### Major Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – Thanks @ianstormtaylor for the initial work on https://github.com/ianstormtaylor/slate/pull/4177.

  This release includes major changes to plate and slate types:

  - Changing the `TEditor` type to be `TEditor<V>` where `V` represents the "value" being edited by Slate. In the most generic editor, `V` would be equivalent to `TElement[]` (since that is what is accepted as children of the editor). But in a custom editor, you might have `TEditor<Array<Paragraph | Quote>>`.
  - Other `TEditor`-and-`TNode`-related methods have been also made generic, so for example if you use `getLeafNode(editor, path)` it knows that the return value is a `TText` node. But more specifically, it knows that it is the text node of the type you've defined in your custom elements (with any marks you've defined).
  - This replaces the declaration merging approach, and provides some benefits. One of the drawbacks to declaration merging was that it was impossible to know whether you were dealing with an "unknown" or "known" element, since the underlying type was changed. Similarly, having two editors on the page with different schemas wasn't possible to represent. Hopefully this approach with generics will be able to smoothly replace the declaration merging approach. (While being easy to migrate to, since you can pass those same custom element definitions into `TEditor` still.)

**Define your custom types**

- Follow https://platejs.org/docs/typescript example.

**Slate types**

Those Slate types should be replaced by the new types:

- `Editor` -> `TEditor<V extends Value = Value>`
  - Note that `TEditor` methods are not typed based on `Value` as it would introduce a circular dependency. You can use `getTEditor(editor)` to get the editor with typed methods.
- `ReactEditor` -> `TReactEditor<V extends Value = Value>`
- `HistoryEditor` -> `THistoryEditor<V extends Value = Value>`
- `EditableProps` -> `TEditableProps<V extends Value = Value>`
- `Node` -> `TNode`
- `Element` -> `TElement`
- `Text` -> `TText`
- `NodeEntry` -> `TNodeEntry`
- `NodeProps` -> `TNodeProps`

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
- `Editor` callbacks (e.g. a plugin option) are using `<V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>` generics, where `E` can be a custom editor type.
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

- `deleteFragment` is now using `Editor.deleteFragment`

## @udecode/plate-table@11.0.0

- `getEmptyTableNode` default options changed. Migration:

```tsx
// From (0 row count and col count, previously it was 2)
getEmptyTableNode(editor);
// To
getEmptyTableNode(editor, { rowCount: 2, colCount: 2 });
```

## @udecode/plate-styled-components@11.0.0

**Generic types**

- `type StyledElementProps<V extends Value, N extends TElement = EElement<V>, TStyles = {}>`

# 10.0.0

## @udecode/plate-ui-toolbar@10.0.0

### Major Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) – Before, `BalloonToolbar` could be outside `Plate`. Now, `BallonToolbar` should be a child of `Plate` to support multiple editors.

# 9.0.0

## @udecode/plate-core@9.0.0

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

## @udecode/plate@9.0.0

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
- renamed `plate-x-ui` to `plate-ui-x`: all packages depending on `styled-components` has `plate-ui` prefix
- renamed `plate-x-serializer` to `plate-serializer-x`
- is now exporting only these (new) packages:
  - `@udecode/plate-headless`: all unstyled packages
  - `@udecode/plate-ui`: all styled packages
- renamed `PlateState` to `PlateStoreState`

# 8.0.0

## @udecode/plate-indent-list@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:

  - `IndentListPluginOptions` for `PlatePlugin`

  Rename:

  - `getIndentListInjectComponent` to `injectIndentListComponent`

## @udecode/plate-core@8.0.0

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

  - handlers starting by `on...` are moved to `handlers` property.

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

  - the following plugins are now part of the core plugins, so you need to remove these from your `plugins` prop:

  ```ts
  const corePlugins = [
    createReactPlugin(),
    createHistoryPlugin(),
    createEventEditorPlugin(),
    createInlineVoidPlugin(),
    createInsertDataPlugin(),
    createDeserializeAstPlugin(),
    createDeserializeHtmlPlugin(),
  ];
  ```

  - `plugins` is not a parameter anymore as it can be retrieved in `editor.plugins`
  - `withInlineVoid` is now using plugins `isInline` and `isVoid` plugin properties.

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

## @udecode/plate-find-replace@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `useFindReplacePlugin` for `createFindReplacePlugin`

## @udecode/plate-alignment@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) –
  - `setAlign`
    - moved param 3 to param 2 as `setNodesOptions`

## @udecode/plate-basic-elements@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) –
  - renamed `createBasicElementPlugins` to `createBasicElementsPlugin`

## @udecode/plate-code-block@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `getCodeBlockPluginOptions` for `getPlugin`
  - `getCodeLinePluginOptions` for `getPlugin`

## @udecode/plate-heading@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Renamed:
  - `HeadingPluginOptions` to `HeadingsPlugin`

## @udecode/plate-mention@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `getMentionInputPluginOptions` for `getPlugin`
  - `getMentionInputType` for `getPluginType`
  - `COMBOBOX_TRIGGER_MENTION`

## @udecode/plate-basic-marks@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) –
  - renamed `createBasicMarkPlugins` to `createBasicMarksPlugin`

## @udecode/plate@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Breaking changes:

  - all plugins options are now defined in the plugin itself
  - plugins which now have nested plugins instead of array:
    - `createBasicElementsPlugin`
    - `createCodeBlockPlugin`
    - `createHeadingPlugin`
    - `createListPlugin`
    - `createTablePlugin`
    - `createBasicMarksPlugin`

  Removed:

  - `createEditorPlugins` for `createPlateEditor` (without components) and `createPlateEditorUI` (with Plate components)
  - `createPlateOptions` for `createPlugins`
  - all `DEFAULTS_X`: these are defined in the plugins
  - all `getXDeserialize`: these are defined in the plugins
  - all `WithXOptions` for extended plugins
  - all `getXRenderElement`
  - some plugin option types are removed for `PlatePlugin`

  Renamed:

  - `createPlateComponents` to `createPlateUI`
  - all `getXY` handlers to `yX` (e.g. `getXOnKeyDown` to `onKeyDownX`)
  - all `XPluginOptions` to `XPlugin`
  - all `pluginKey` parameter to `key` except in components

  Renamed types:

  - `DecorateSearchHighlightOptions` to `FindReplacePlugin`

  Updated deps:

  - `"slate": "0.70.0"`
  - `"slate-react": "0.70.1"`

  Removed deps (merged to core):

  - `plate-common`
  - `plate-ast-serializer`
  - `plate-html-serializer`
  - `plate-serializer`

## @udecode/plate-serializer-csv@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Renamed:
  - `createDeserializeCSVPlugin` to `createDeserializeCsvPlugin`
  - `deserializeCSV` to `deserializeCsv`

## @udecode/plate-serializer-md@8.0.0

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) –

  - `createDeserializeMdPlugin`:
    - is now disabled if there is html data in the data transfer.

  Renamed:

  - `createDeserializeMDPlugin` to `createDeserializeMdPlugin`
  - `deserializeMD` to `deserializeMd`

# 7.0.0

## `@udecode/plate-core`

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

## `@udecode/plate-alignment`

- `setAlign`: option `align` renamed to `value`
- removed `getAlignOverrideProps()` in favor of `getOverrideProps(KEY_ALIGN)`

## `@udecode/plate-indent`

- removed `getIndentOverrideProps()` in favor of `getOverrideProps(KEY_INDENT)`
- rename `onKeyDownHandler` to `getIndentOnKeyDown()`
- `IndentPluginOptions`
  - rename `types` to `validTypes`
  - rename `cssPropName` to `styleKey`
  - rename `transformCssValue` to `transformNodeValue`

## `@udecode/plate-line-height`

- `setLineHeight`: option `lineHeight` renamed to `value`
- removed `getLineHeightOverrideProps` in favor of `getOverrideProps(KEY_LINE_HEIGHT)`

## `@udecode/plate-mention`

- `getMentionOnSelectItem`:
  - removed `createMentionNode` in favor of plugin options
  - removed `insertSpaceAfterMention` in favor of plugin options

## `@udecode/plate-mention-ui`

- `MentionCombobox` props:
  - removed `trigger` in favor of plugin options
  - removed `insertSpaceAfterMention` in favor of plugin options
  - removed `createMentionNode` in favor of plugin options

## `@udecode/plate-x-ui`

- renamed `ToolbarAlign` to `AlignToolbarButton`
- renamed `ToolbarCodeBlock` to `CodeBlockToolbarButton`
- renamed `ToolbarElement` to `BlockToolbarButton`
- renamed `ToolbarImage` to `ImageToolbarButton`
- renamed `ToolbarLink` to `LinkToolbarButton`
- renamed `ToolbarList` to `ListToolbarButton`
- renamed `ToolbarLineHeight` to `LineHeightToolbarDropdown`
- renamed `ToolbarMark` to `MarkToolbarButton`
- renamed `ToolbarMediaEmbed` to `MediaEmbedToolbarButton`
- renamed `ToolbarSearchHighlight` to `SearchHighlightToolbar`
- renamed `ToolbarTable` to `TableToolbarButton`

# 6.0.0

## `@udecode/plate-alignment`

The align plugin is no longer wrapping a block, but instead setting an `align` property to an existing block.

- `createAlignPlugin`:
  - removed `pluginKeys`, `renderElement` and `deserialize`
- removed:
  - `ELEMENT_ALIGN_LEFT`
  - `ELEMENT_ALIGN_CENTER`
  - `ELEMENT_ALIGN_RIGHT`
  - `ELEMENT_ALIGN_JUSTIFY`
  - `KEYS_ALIGN` in favor of `KEY_ALIGN`
  - `getAlignDeserialize`
  - `upsertAlign` in favor of `setAlign`

Migration (normalizer):

- for each node:
  - run `parent = getParent(editor, path)`, if `parent[0].type` is one of the alignment values:
    - run `setAlign(editor, { align }, { at: path })`
    - run `unwrapNodes(editor, { at: path })`

## `@udecode/plate-alignment-ui`

- `ToolbarAlignProps`:
  - removed `type` in favor of `align`
  - removed `unwrapTypes`
  - added `align`

# 5.0.0

## `@udecode/plate-mention`

The mention plugin is now using the combobox.

- removed `useMentionPlugin` in favor of `createMentionPlugin`
  - migration: replace `useMentionPlugin().plugin` by `createMentionPlugin()`
- removed options:
  - `mentionableSearchPattern`
  - `insertSpaceAfterMention`
  - `maxSuggestions`: moved to `comboboxStore`
  - `trigger`: moved to `comboboxStore`
  - `mentionables`: moved to `items` in `comboboxStore`
  - `mentionableFilter`: moved to `filter` in `comboboxStore`
- removed `matchesTriggerAndPattern` in favor of `getTextFromTrigger`
- removed `MentionNodeData` in favor of `ComboboxItemData`

```ts
export interface ComboboxItemData {
  /**
   * Unique key.
   */
  key: string;
  /**
   * Item text.
   */
  text: any;
  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Data available to `onRenderItem`.
   */
  data?: unknown;
}
```

## `@udecode/plate-mention-ui`

- removed `MentionSelect` in favor of `MentionCombobox`

## `@udecode/plate-toolbar`

- removed `setPositionAtSelection` in favor of `useBalloonToolbarPopper`
- removed `useBalloonMove` in favor of `useBalloonToolbarPopper`
- removed `usePopupPosition` in favor of `useBalloonToolbarPopper`
- removed `useBalloonShow` in favor of `useBalloonToolbarPopper`
  `BalloonToolbar` props:
- removed `direction` in favor of `popperOptions.placement`
- renamed `scrollContainer` to `popperContainer`

# 4.0.0

## `@udecode/plate-toolbar`

- `BalloonToolbar`: removed `hiddenDelay` prop.

# 3.0.0

## All UI packages

There was multiple instances of `styled-components` across all the packages.
So we moved `styled-components` from dependencies to peer dependencies.

### Before

`styled-components` was not listed in your dependencies

### After

Add `styled-components` to your dependencies

# 2.0.0

## `@udecode/plate-autoformat`

- `autoformatBlock`:
  - signatude changed

```ts
// Before
(
  editor: TEditor,
  type: string,
  at: Location,
  options: Pick<AutoformatRule, 'preFormat' | 'format'>
)
```

```ts
// After
(editor: TEditor, options: AutoformatBlockOptions)
```

- moved the checks from `withAutoformat`
- `autoformatInline`:
  - renamed to `autoformatMark`
  - signatured changed

```ts
// Before
(
  editor: TEditor,
  options: Pick<AutoformatRule, 'type' | 'between' | 'markup' | 'ignoreTrim'>
)
```

```ts
// After
(
  editor: TEditor,
  options: AutoformatMarkOptions
)
```

- `AutoformatRule` is now `AutoformatBlockRule
| AutoformatMarkRule
| AutoformatTextRule;`
  - `mode: 'inline'` renamed to `mode: 'mark'`
  - `markup` and `between` have been replaced by `match: string | string[] | MatchRange | MatchRange[]`: The rule applies when the trigger and the text just before the cursor matches. For `mode: 'block'`: lookup for the end match(es) before the cursor. For `mode: 'text'`: lookup for the end match(es) before the cursor. If `format` is an array, also lookup for the start match(es). For `mode: 'mark'`: lookup for the start and end matches. Note: `'_*'`, `['_*']` and `{ start: '_*', end: '*_' }` are equivalent.
  - `trigger` now defaults to the last character of `match` or `match.end` (previously `' '`)
- the plugin now checks that there is no character before the start match to apply autoformatting. For example, nothing will happen by typing `a*text*`.
