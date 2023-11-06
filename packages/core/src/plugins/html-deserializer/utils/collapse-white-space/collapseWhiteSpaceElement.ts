import { collapseWhiteSpaceChildren } from './collapseWhiteSpaceChildren';
import { inferWhiteSpaceRule } from './inferWhiteSpaceRule';
import { isHtmlInlineElement } from './isHtmlInlineElement';
import { endInlineFormattingContext } from './stateTransforms';
import { CollapseWhiteSpaceState } from './types';

export const collapseWhiteSpaceElement = (
  element: HTMLElement,
  state: CollapseWhiteSpaceState
) => {
  const isInlineElement = isHtmlInlineElement(element);
  const previousWhiteSpaceRule = state.whiteSpaceRule;
  const inferredWhiteSpaceRule = inferWhiteSpaceRule(element);

  if (inferredWhiteSpaceRule) {
    state.whiteSpaceRule = inferredWhiteSpaceRule;
  }

  /**
   * Note: We do not want to start an inline formatting context until we
   * encounter a text node.
   */

  // End any existing inline formatting context
  if (!isInlineElement) {
    endInlineFormattingContext(state);
  }

  collapseWhiteSpaceChildren(element, state);

  // Do not let inline formatting context break out of block elements
  if (!isInlineElement) {
    endInlineFormattingContext(state);
  }

  // Restore previous whiteSpaceRule
  state.whiteSpaceRule = previousWhiteSpaceRule;
};
