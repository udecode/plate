import { SlatePlugin } from '../../common';
import { deserializeLink } from './deserializeLink';
import { renderElementLink } from './renderElementLink';
import { LinkPluginOptions } from './types';

/**
 * Enables support for hyperlinks.
 */
export const LinkPlugin = (options?: LinkPluginOptions): SlatePlugin => ({
  renderElement: renderElementLink(options),
  deserialize: deserializeLink(options),
});
