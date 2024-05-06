import {
  type PlateEditor,
  type Value,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK, type LinkPlugin } from '../createLinkPlugin';

export const getLinkAttributes = <V extends Value>(
  editor: PlateEditor<V>,
  link: TLinkElement
) => {
  const { allowedSchemes, dangerouslySkipSanitization, defaultLinkAttributes } =
    getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

  const attributes = { ...defaultLinkAttributes };

  const href = dangerouslySkipSanitization
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
