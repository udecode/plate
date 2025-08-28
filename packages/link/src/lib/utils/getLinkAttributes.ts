import type React from 'react';

import type { SlateEditor } from '@platejs/core';
import type { UnknownObject } from '@udecode/utils';

import { type TLinkElement, KEYS } from '@platejs/utils';
import { sanitizeUrl } from '@udecode/utils';

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

  return attributes as Pick<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'target'
  > &
    UnknownObject;
};
