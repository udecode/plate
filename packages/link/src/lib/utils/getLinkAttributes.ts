import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { sanitizeUrl } from '@udecode/utils';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

export const getLinkAttributes = (editor: BaseEditor, link: Element) => {
  const { getOptions, plugin } = editor.plugin(BaseLinkPlugin);
  const { allowedSchemes, dangerouslySkipSanitization } = plugin.config;
  const { defaultLinkAttributes } = getOptions();
  const url = typeof link.url === 'string' ? link.url : '';
  const href = dangerouslySkipSanitization
    ? url
    : sanitizeUrl(url, { allowedSchemes }) || undefined;

  return {
    ...defaultLinkAttributes,
    ...(href === undefined ? {} : { href }),
    ...(typeof link.target === 'string' ? { target: link.target } : {}),
  };
};
