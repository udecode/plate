/**
 * Is the element a block element?
 */
export const isHtmlBlockElement = (element: Element) => {
  const blockRegex =
    /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i;

  return blockRegex.test(element.nodeName);
};
