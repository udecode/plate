import { createBasePlugin, type InferConfig } from '@platejs/core';

import { createYjsExtension } from '../core/extension';
import type { YjsExtensionOptions } from '../core/types';

export type YjsPluginState = YjsExtensionOptions;

const initialState: YjsPluginState = {};

/** Installs Yjs collaboration in a base Plate editor. */
export const BaseYjsPlugin = createBasePlugin({
  extension: ({ store }) => createYjsExtension(store.get()),
  key: 'yjs',
  initialState,
});

export type YjsConfig = InferConfig<typeof BaseYjsPlugin>;
