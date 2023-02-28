import {
  getPluginOptions,
  PlateEditor,
  sanitizeUrl,
  Value,
} from '@udecode/plate-core';
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
  const { target } = link;

  return { href, target };
};
