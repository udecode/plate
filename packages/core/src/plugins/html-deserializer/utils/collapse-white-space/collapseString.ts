import { TrimEndRule, TrimStartRule } from './types';

export const collapseString = (
  text: string,
  {
    trimStart = 'collapse',
    trimEnd = 'collapse',
    shouldCollapseWhiteSpace = true,
    whiteSpaceIncludesNewlines = true,
  }: {
    trimStart?: TrimStartRule;
    trimEnd?: TrimEndRule;
    shouldCollapseWhiteSpace?: boolean;
    whiteSpaceIncludesNewlines?: boolean;
  } = {}
) => {
  if (trimStart === 'all') {
    text = text.replace(/^\s+/, '');
  }

  if (trimEnd === 'single-newline') {
    // Strip at most one newline from the end
    text = text.replace(/\n$/, '');
  }

  if (shouldCollapseWhiteSpace) {
    if (whiteSpaceIncludesNewlines) {
      text = text.replaceAll(/\s+/g, ' ');
    } else {
      // Collapse horizontal whitespace
      text = text.replaceAll(/[^\S\n\r]+/g, ' ');

      /**
       * Trim horizontal whitespace from the start and end of lines (behavior
       * of pre-line).
       */
      text = text.replaceAll(/^[^\S\n\r]+/gm, '');
      text = text.replaceAll(/[^\S\n\r]+$/gm, '');
    }
  }

  return text;
};
