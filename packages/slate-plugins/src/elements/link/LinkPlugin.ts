import { setDefaults } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_LINK } from './defaults';
import { deserializeLink } from './deserializeLink';
import { renderElementLink } from './renderElementLink';
import { LinkPluginOptions } from './types';

/**
 * Enables support for hyperlinks.
 */
export const LinkPlugin = (options?: LinkPluginOptions): SlatePlugin => {
  const { link } = setDefaults(options, DEFAULTS_LINK);

  return {
    renderElement: renderElementLink(options),
    deserialize: deserializeLink(options),
    inlineTypes: [link.type],
  };
};
