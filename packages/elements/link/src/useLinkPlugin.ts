import {
  usePluginTypes,
  useRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_LINK } from './defaults';
import { WithLinkOptions } from './types';
import { useDeserializeLink } from './useDeserializeLink';
import { withLink } from './withLink';

/**
 * Enables support for hyperlinks.
 */
export const useLinkPlugin = (options?: WithLinkOptions): SlatePlugin => ({
  pluginKeys: ELEMENT_LINK,
  renderElement: useRenderElement(ELEMENT_LINK),
  deserialize: useDeserializeLink(),
  inlineTypes: usePluginTypes(ELEMENT_LINK),
  withOverrides: withLink(options),
});
