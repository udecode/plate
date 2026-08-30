import { defineBasePlugin, type DefinitionOf } from '../core';
import { yjs } from './core/extension';
import type { YjsExtensionOptions } from './core/types';

export type YjsPluginState = YjsExtensionOptions;

const initialState: YjsPluginState = {};

/**
 * Resolves the imported Plite extension per editor so configured Yjs state can
 * be captured before its native fields are merged onto the plugin root.
 */
export const BaseYjsPlugin = defineBasePlugin('yjs', {
  initialState,
}).extend(({ store }) => yjs(store.get()));

export type YjsDefinition = DefinitionOf<typeof BaseYjsPlugin>;
