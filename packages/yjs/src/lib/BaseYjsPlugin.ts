import { type PluginConfig, createBasePlugin } from '@platejs/core';

import { createYjsExtension } from '../core/extension';
import type { YjsExtensionOptions } from '../core/types';

export type YjsConfig = PluginConfig<'yjs', YjsExtensionOptions>;

/** Installs Yjs collaboration in a base Plate editor. */
export const BaseYjsPlugin = createBasePlugin<YjsConfig>({
  key: 'yjs',
  options: {},
}).extendExtension(({ getOptions }) => createYjsExtension(getOptions()));
