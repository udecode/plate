import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_LINK } from './defaults';
import { getLinkDeserialize } from './getLinkDeserialize';
import { getLinkOnKeyDown } from './getLinkOnKeyDown';
import { WithLinkOptions } from './types';
import { withLink } from './withLink';

/**
 * Enables support for hyperlinks.
 */
export const createLinkPlugin = (options?: WithLinkOptions): PlatePlugin => ({
  key: ELEMENT_LINK,
  isElement: true,
  isInline: true,
  deserialize: getLinkDeserialize(),
  onKeyDown: getLinkOnKeyDown(options),
  withOverrides: withLink(options),
});
