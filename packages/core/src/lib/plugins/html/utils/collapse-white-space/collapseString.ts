import type { TrimEndRule, TrimStartRule } from './types';

const LEADING_WHITESPACE_REGEX = /^\s+/;
const TRAILING_NEWLINE_REGEX = /\n$/;

export const collapseString = (
  text: string,
  {
    shouldCollapseWhiteSpace = true,
    trimEnd = 'collapse',
    trimStart = 'collapse',
    whiteSpaceIncludesNewlines = true,
  }: {
    shouldCollapseWhiteSpace?: boolean;
    trimEnd?: TrimEndRule;
    trimStart?: TrimStartRule;
    whiteSpaceIncludesNewlines?: boolean;
  } = {}
) => {
  let result = text;

  if (trimStart === 'all') {
    result = result.replace(LEADING_WHITESPACE_REGEX, '');
  }
  if (trimEnd === 'single-newline') {
    // Strip at most one newline from the end
    result = result.replace(TRAILING_NEWLINE_REGEX, '');
  }
  if (shouldCollapseWhiteSpace) {
    if (whiteSpaceIncludesNewlines) {
      result = result.replaceAll(/\s+/g, ' ');
    } else {
      // Collapse horizontal whitespace
      result = result.replaceAll(/[^\S\n\r]+/g, ' ');

      /**
       * Trim horizontal whitespace from the start and end of lines (behavior of
       * pre-line).
       */
      result = result.replaceAll(/^[^\S\n\r]+/gm, '');
      result = result.replaceAll(/[^\S\n\r]+$/gm, '');
    }
  }

  return result;
};
