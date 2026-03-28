import { type SlateEditor, isUrl as defaultIsUrl, sanitizeUrl } from 'platejs';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

// Markdown headings have a space after the # symbols
const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+/;

export const validateUrl = (editor: SlateEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
    editor.getOptions(BaseLinkPlugin);
  const customIsUrl = isUrl && isUrl !== defaultIsUrl ? isUrl : undefined;

  // Allow internal links starting with /
  if (url.startsWith('/') && !url.startsWith('//')) {
    return customIsUrl ? customIsUrl(url) : true;
  }

  // For strings starting with #, check if it's a markdown heading
  if (url.startsWith('#')) {
    if (MARKDOWN_HEADING_PATTERN.test(url)) {
      return false; // This is a markdown heading, not a valid link
    }
    return customIsUrl ? customIsUrl(url) : true;
  }

  // Check custom validator first if provided
  if (isUrl && !isUrl(url)) {
    return false;
  }

  // Always sanitize unless explicitly skipped
  if (
    !dangerouslySkipSanitization &&
    !sanitizeUrl(url, {
      allowedSchemes,
      permitInvalid: true,
    })
  ) {
    return false;
  }

  return true;
};
