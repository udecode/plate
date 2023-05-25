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
  const { allowedSchemes } = getPluginOptions<LinkPlugin, V>(
    editor,
    ELEMENT_LINK
  );

  const href = sanitizeUrl(link.url, { allowedSchemes }) || undefined;

  const attributes: {
    href?: string;
    target?: string;
  } = { href };

  if ('target' in link) {
    attributes.target = link.target;
  }

  return attributes;
};
