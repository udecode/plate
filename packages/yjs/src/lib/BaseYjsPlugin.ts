import { createBasePlugin, type DefinitionOf } from '@platejs/core';

import { createYjsExtension } from '../core/extension';
import type { YjsExtensionOptions } from '../core/types';

export type YjsPluginState = YjsExtensionOptions;

const initialState: YjsPluginState = {};

/**
 * Resolves the imported Plite extension per editor so configured Yjs state can
 * be captured before its native fields are merged onto the plugin root.
 */
export const BaseYjsPlugin = createBasePlugin({
  name: 'yjs',
  initialState,
}).extend(({ store }) => createYjsExtension(store.get()));

export type YjsDefinition = DefinitionOf<typeof BaseYjsPlugin>;
