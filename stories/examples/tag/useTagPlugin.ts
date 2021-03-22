import { usePluginTypes, useRenderElement } from '@udecode/slate-plugins';
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
    inlineTypes: usePluginTypes(ELEMENT_TAG),
    voidTypes: usePluginTypes(ELEMENT_TAG),
  };
};
