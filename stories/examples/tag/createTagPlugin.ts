import { getRenderElement, getSlatePluginTypes } from '@udecode/slate-plugins';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_TAG } from './defaults';
import { getTagDeserialize } from './getTagDeserialize';

/**
 * Enables support for hypertags.
 */
export const createTagPlugin = (): SlatePlugin => ({
  renderElement: getRenderElement(ELEMENT_TAG),
  deserialize: getTagDeserialize(),
  inlineTypes: getSlatePluginTypes(ELEMENT_TAG),
  voidTypes: getSlatePluginTypes(ELEMENT_TAG),
});
