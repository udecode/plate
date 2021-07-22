import { getPlatePluginTypes, getRenderElement } from '@udecode/plate';
import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_TAG } from './defaults';
import { getTagDeserialize } from './getTagDeserialize';

/**
 * Enables support for hypertags.
 */
export const createTagPlugin = (): PlatePlugin => ({
  renderElement: getRenderElement(ELEMENT_TAG),
  deserialize: getTagDeserialize(),
  inlineTypes: getPlatePluginTypes(ELEMENT_TAG),
  voidTypes: getPlatePluginTypes(ELEMENT_TAG),
});
