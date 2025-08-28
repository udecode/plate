import type { SlateEditor } from '@platejs/core';

import { isUrl as defaultIsUrl, sanitizeUrl } from '@udecode/utils';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

export const validateUrl = (editor: SlateEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
    editor.getOptions(BaseLinkPlugin);

  // Allow internal links starting with /
  if (url.startsWith('/')) {
    // If custom validator is provided (not the default one) and explicitly handles this URL, respect its decision
    if (isUrl && isUrl !== defaultIsUrl) {
      const customResult = isUrl(url);
      // Only override if the custom validator explicitly returns false
      // This allows custom validators to reject internal links if needed
      if (customResult === false) {
        return false;
      }
    }
    return true;
  }

  // For strings starting with #, check if it's a markdown heading
  if (url.startsWith('#')) {
    // If custom validator is provided (not the default one) and explicitly handles this URL, respect its decision
    if (isUrl && isUrl !== defaultIsUrl) {
      const customResult = isUrl(url);
      // Only override if the custom validator explicitly returns false
      // This allows custom validators to reject anchor links if needed
      if (customResult === false) {
        return false;
      }
    }
    
    // Markdown headings have a space after the # symbols
    const markdownHeadingPattern = /^#{1,6}\s+/;
    if (markdownHeadingPattern.test(url)) {
      return false; // This is a markdown heading, not a valid link
    }
    return true; // This is an anchor link
  }

  // For external URLs, check custom validator if provided
  if (isUrl && !isUrl(url)) {
    return false;
  }

  // Always sanitize unless explicitly skipped
  if (!dangerouslySkipSanitization) {
    const sanitized = sanitizeUrl(url, {
      allowedSchemes,
      permitInvalid: true,
    });
    
    // sanitizeUrl returns null for invalid URLs
    if (sanitized === null) {
      return false;
    }
  }

  return true;
};
