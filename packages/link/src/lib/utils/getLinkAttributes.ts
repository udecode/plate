import { type SlateEditor, sanitizeUrl } from '@udecode/plate-common';

import type { TLinkElement } from '../../lib/types';
import type { BaseLinkConfig } from '../BaseLinkPlugin';

export const getLinkAttributes = (editor: SlateEditor, link: TLinkElement) => {
  const { allowedSchemes, dangerouslySkipSanitization, defaultLinkAttributes } =
    editor.getOptions<BaseLinkConfig>({ key: 'a' });

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
