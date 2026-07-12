import type { BaseEditor } from '@platejs/core';
import { isUrl as defaultIsUrl, sanitizeUrl } from '@udecode/utils';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+/;

export const validateUrl = (editor: BaseEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } = editor
    .plugin(BaseLinkPlugin)
    .getOptions();
  const customIsUrl = isUrl && isUrl !== defaultIsUrl ? isUrl : undefined;

  if (url.startsWith('/') && !url.startsWith('//')) {
    return customIsUrl ? customIsUrl(url) : true;
  }

  if (url.startsWith('#')) {
    if (MARKDOWN_HEADING_PATTERN.test(url)) return false;

    return customIsUrl ? customIsUrl(url) : true;
  }

  if (isUrl && !isUrl(url)) return false;

  return Boolean(
    dangerouslySkipSanitization ||
      sanitizeUrl(url, { allowedSchemes, permitInvalid: true })
  );
};
