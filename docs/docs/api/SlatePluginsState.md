---
slug: /SlatePluginsState
title: SlatePluginsState
---

[SlatePluginsState](https://slate-plugins-api.udecode.io/globals.html#slatepluginsstate)
is the slate plugins store state. The keys are ids and the values are
[State](https://slate-plugins-api.udecode.io/globals.html#state).

## `State`

### `editor`
`SPEditor`

Slate editor. Default uses `withReact`,`withHistoryPersist`
and `withRandomKey` plugins.

### `enabled`
`boolean`

If true, slate plugins will create the editor.
If false, slate plugins will delete the editor.

### `plugins`
`SlatePlugin[]`


 /**
   * Slate plugins. Default is [].
   */
  plugins: SlatePlugin[];

  /**
   * Element keys used by the plugins
   */
  pluginKeys: string[];

  /**
   * Editor value. Default is `[{children: [{text: ''}]}]`.
   */
  value: TDescendant[];