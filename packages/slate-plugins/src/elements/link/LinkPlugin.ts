import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin, useEditorType } from '@udecode/slate-plugins-core';
import { ELEMENT_LINK } from './defaults';
import { useDeserializeLink } from './useDeserializeLink';

/**
 * Enables support for hyperlinks.
 */
export const LinkPlugin = (): SlatePlugin => {
  return {
    elementKeys: ELEMENT_LINK,
    renderElement: useRenderElement(ELEMENT_LINK),
    deserialize: useDeserializeLink(),
    inlineTypes: [useEditorType(ELEMENT_LINK)],
  };
};
