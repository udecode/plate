import { isHtmlElement } from './isHtmlElement';
import { isHtmlInlineElement } from './isHtmlInlineElement';

export const isHtmlBlockElement = (node: Node): boolean => {
  if (!isHtmlElement(node)) return false;

  const element = node as HTMLElement;

  return !isHtmlInlineElement(element);
};
