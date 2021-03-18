import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_LINK } from './defaults';
import { useDeserializeLink } from './useDeserializeLink';

/**
 * Enables support for hyperlinks.
 */
export const LinkPlugin = (): SlatePlugin => {
  return {
    pluginKeys: ELEMENT_LINK,
    renderElement: getPluginRenderElement(ELEMENT_LINK),
    deserialize: useDeserializeLink(),
    // inlineTypes: [useEditorPluginType(ELEMENT_LINK)],
  };
};
