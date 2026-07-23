import type { TBaseStateApi } from 'zustand-x/vanilla';

import type { AnyPluginConfig, InferOptions, InferSelectors } from '../../lib';

export type PluginOptionsStore<C extends AnyPluginConfig = AnyPluginConfig> =
  TBaseStateApi<
    InferOptions<C>,
    [['zustand/mutative-x', never]],
    {},
    InferSelectors<C>
  >;

const PLUGIN_OPTIONS_STORES = new WeakMap<
  object,
  Map<string, PluginOptionsStore>
>();

export const clearPluginOptionsStores = (editor: object) => {
  PLUGIN_OPTIONS_STORES.delete(editor);
};

export const getPluginOptionsStore = <C extends AnyPluginConfig>(
  editor: object,
  pluginKey: C['key']
) =>
  PLUGIN_OPTIONS_STORES.get(editor)?.get(pluginKey) as
    | PluginOptionsStore<C>
    | undefined;

export const setPluginOptionsStore = <C extends AnyPluginConfig>(
  editor: object,
  pluginKey: C['key'],
  store: PluginOptionsStore<C>
) => {
  let stores = PLUGIN_OPTIONS_STORES.get(editor);

  if (!stores) {
    stores = new Map();
    PLUGIN_OPTIONS_STORES.set(editor, stores);
  }
  stores.set(pluginKey, store as PluginOptionsStore);
};
