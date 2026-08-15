import { type SlateEditor, isUrl as defaultIsUrl, sanitizeUrl } from 'platejs';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

const WHITESPACE_PATTERN = /\s/;

export const validateUrl = (editor: SlateEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
    editor.getOptions(BaseLinkPlugin);
  const customIsUrl = isUrl && isUrl !== defaultIsUrl ? isUrl : undefined;

  // Internal links and anchors are the only urls accepted without a scheme, and
  // a url reference cannot contain unescaped whitespace. This rejects markdown
  // headings like `# heading` and multi-line text starting with `#` or `/`.
  if (
    (url.startsWith('/') || url.startsWith('#')) &&
    WHITESPACE_PATTERN.test(url)
  ) {
    return false;
  }

  // Allow internal links starting with /
  if (url.startsWith('/') && !url.startsWith('//')) {
    return customIsUrl ? customIsUrl(url) : true;
  }

  // Allow anchor links starting with #
  if (url.startsWith('#')) {
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
