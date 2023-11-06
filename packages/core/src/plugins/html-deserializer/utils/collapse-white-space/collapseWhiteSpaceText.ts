import { collapseString } from './collapseString';
import { isLastNonEmptyTextOfInlineFormattingBlock } from './isLastNonEmptyTextOfInlineFormattingBlock';
import { upsertInlineFormattingContext } from './stateTransforms';
import { CollapseWhiteSpaceState, TrimEndRule, TrimStartRule } from './types';

export const collapseWhiteSpaceText = (
  text: Text,
  state: CollapseWhiteSpaceState
) => {
  const textContent = text.textContent || '';
  const isWhiteSpaceOnly = textContent.trim() === '';

  // Do not start an inline formatting context with a whiteSpace-only text node
  if (state.inlineFormattingContext || !isWhiteSpaceOnly) {
    upsertInlineFormattingContext(state);
  }

  const { whiteSpaceRule } = state;

  /**
   * Note: Due to the way HTML strings are parsed in htmlStringToDOMNode, up to
   * one newline is already trimmed from the start of text nodes inside <pre>
   * elements. If we do so again here, we may remove too many newlines. This
   * only applies to actual <pre> elements, not elements with the white-space
   * CSS property.
   */
  const trimStart: TrimStartRule = (() => {
    if (whiteSpaceRule !== 'normal') return 'collapse';

    if (
      !state.inlineFormattingContext ||
      state.inlineFormattingContext.atStart ||
      state.inlineFormattingContext.lastHasTrailingWhiteSpace
    )
      return 'all';

    return 'collapse';
  })();

  const trimEnd: TrimEndRule = (() => {
    if (whiteSpaceRule === 'normal') return 'collapse';
    if (isLastNonEmptyTextOfInlineFormattingBlock(text))
      return 'single-newline';
    return 'collapse';
  })();

  const shouldCollapseWhiteSpace: boolean = {
    normal: true,
    pre: false,
    'pre-line': true,
  }[whiteSpaceRule];

  const whiteSpaceIncludesNewlines = whiteSpaceRule !== 'pre-line';

  const collapsedTextContent = collapseString(textContent || '', {
    trimStart,
    trimEnd,
    shouldCollapseWhiteSpace,
    whiteSpaceIncludesNewlines,
  });

  if (state.inlineFormattingContext && shouldCollapseWhiteSpace) {
    state.inlineFormattingContext.lastHasTrailingWhiteSpace =
      collapsedTextContent.endsWith(' ');
  }

  text.textContent = collapsedTextContent;
};
