import type React from 'react';

import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { sanitizeUrl } from '@udecode/utils';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

export const getLinkAttributes = (editor: BaseEditor, link: Element) => {
  const { allowedSchemes, dangerouslySkipSanitization, defaultLinkAttributes } =
    editor.plugin(BaseLinkPlugin).getOptions();
  const attributes: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
    ...defaultLinkAttributes,
  };
  const url = typeof link.url === 'string' ? link.url : '';
  const href = dangerouslySkipSanitization
    ? url
    : sanitizeUrl(url, { allowedSchemes }) || undefined;

  if (href !== undefined) attributes.href = href;
  if (typeof link.target === 'string') attributes.target = link.target;

  return attributes;
};
