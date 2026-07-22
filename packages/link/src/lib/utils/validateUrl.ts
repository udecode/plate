import type { BaseEditor } from '@platejs/core';
import { isUrl as defaultIsUrl, sanitizeUrl } from '@udecode/utils';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+/;

export type ValidateUrlOptions = Readonly<{
  allowedSchemes?: readonly string[];
  dangerouslySkipSanitization?: boolean;
  isUrl?: (text: string) => boolean;
}>;

export const validateUrlWithOptions = (
  { allowedSchemes, dangerouslySkipSanitization, isUrl }: ValidateUrlOptions,
  url: string
): boolean => {
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

export const validateUrl = (editor: BaseEditor, url: string): boolean => {
  const { getOptions, plugin } = editor.plugin(BaseLinkPlugin);

  return validateUrlWithOptions(
    { ...plugin.config, isUrl: getOptions().isUrl },
    url
  );
};
