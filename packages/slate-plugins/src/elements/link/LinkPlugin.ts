import { SlatePlugin } from 'common/types';
import { LinkPluginOptions } from 'elements/link/types';
import { deserializeLink } from './deserializeLink';
import { renderElementLink } from './renderElementLink';

/**
 * Enables support for hyperlinks.
 */
export const LinkPlugin = (options?: LinkPluginOptions): SlatePlugin => ({
  renderElement: renderElementLink(options),
  deserialize: deserializeLink(options),
});
