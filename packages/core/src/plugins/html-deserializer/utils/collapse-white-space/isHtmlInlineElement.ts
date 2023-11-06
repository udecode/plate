import { isHtmlElement } from '../isHtmlElement';
import { inlineTagNames } from './inlineTagNames';

export const isHtmlInlineElement = (node: Node): boolean => {
  if (!isHtmlElement(node)) return false;
  const element = node as HTMLElement;

  const tagNameIsInline = inlineTagNames.has(element.tagName);

  /**
   * Valid display values include 'inline flow'. We only care about the first
   * part.
   */
  const displayProperty = element.style.display.split(' ')[0];

  if (displayProperty === '') {
    return tagNameIsInline;
  }

  if (displayProperty.startsWith('inline')) {
    return true;
  }

  if (displayProperty === 'inherit' && element.parentElement) {
    return isHtmlInlineElement(element.parentElement);
  }

  /**
   * Handle all special values manually, so that any unhandled values can be
   * assumed to be block.
   *
   * Note: Ideally, content inside `display: none` elements should not be
   * parsed. However, if such elements are parsed, it's best for their inline
   * or block status to be left unchanged.
   */
  if (
    ['initial', 'unset', 'revert', 'revert-layer', 'contents', 'none'].includes(
      displayProperty
    )
  ) {
    return tagNameIsInline;
  }

  return false;
};
