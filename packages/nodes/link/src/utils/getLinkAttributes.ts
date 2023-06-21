import {
  getPluginOptions,
  PlateEditor,
  sanitizeUrl,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';
import { TLinkElement } from '../types';

export const getLinkAttributes = <V extends Value>(
  editor: PlateEditor<V>,
  link: TLinkElement
) => {
  const {
    allowedSchemes,
    defaultLinkAttributes,
    skipSanitation,
  } = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

  const attributes = { ...defaultLinkAttributes };

  const href = skipSanitation
    ? link.url
    : sanitizeUrl(link.url, { allowedSchemes }) || undefined;

  // Avoid passing `undefined` for href or target
  if (href !== undefined) {
    attributes.href = href;
  }

  if ('target' in link) {
    attributes.target = link.target;
  }

  return attributes;
};
