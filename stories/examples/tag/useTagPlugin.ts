import { useRenderElement, useSlatePluginTypes } from '@udecode/slate-plugins';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_TAG } from './defaults';
import { useDeserializeTag } from './useDeserializeTag';

/**
 * Enables support for hypertags.
 */
export const useTagPlugin = (): SlatePlugin => {
  return {
    renderElement: useRenderElement(ELEMENT_TAG),
    deserialize: useDeserializeTag(),
    inlineTypes: useSlatePluginTypes(ELEMENT_TAG),
    voidTypes: useSlatePluginTypes(ELEMENT_TAG),
  };
};
