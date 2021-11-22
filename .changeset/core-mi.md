---
'@udecode/plate-core': minor
---

`PlatePlugin` extended:
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
    }
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
  }
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
- `createPlugins`:  Creates a new array of plugins by overriding the plugins in the original array.
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

