import {
  type PlateEditor,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common';

import type { LinkPluginOptions } from '../LinkPlugin';
import type { TLinkElement } from '../types';

export const getLinkAttributes = (editor: PlateEditor, link: TLinkElement) => {
  const { allowedSchemes, dangerouslySkipSanitization, defaultLinkAttributes } =
    getPluginOptions<LinkPluginOptions>(editor, 'a');

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
