import { type SlateEditor, KEYS, sanitizeUrl } from '@udecode/plate';

import type { TLinkElement } from '../../lib/types';
import type { BaseLinkConfig } from '../BaseLinkPlugin';

export const getLinkAttributes = (editor: SlateEditor, link: TLinkElement) => {
  const { allowedSchemes, dangerouslySkipSanitization, defaultLinkAttributes } =
    editor.getOptions<BaseLinkConfig>({ key: KEYS.link });

  const attributes = { ...defaultLinkAttributes };

  const href = dangerouslySkipSanitization
    ? link.url
    : sanitizeUrl(link.url, { allowedSchemes }) || undefined;

  // Avoid passing `undefined` for href or target
  if (href !== undefined) {
    attributes.href = href;
  }
  if ('target' in link && link.target !== undefined) {
    attributes.target = link.target;
  }

  return attributes;
};
