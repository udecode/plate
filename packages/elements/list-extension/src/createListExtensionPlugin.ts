import { PlatePlugin } from '@udecode/plate-core';
import { KEYS_LIST } from '@udecode/plate-list';
import { withListExtension } from './withListExtension';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const createListExtensionPlugin = (): PlatePlugin => ({
  pluginKeys: KEYS_LIST,
  withOverrides: withListExtension(),
});
