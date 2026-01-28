/**
 * Creates style tag and append it to head.
 * @param {*} style Style string.
 * @param {*} suffix Suffix to add to data attribute (Optional).
 */
export function createStyleTag(style, suffix) {
  const styleTag = document.querySelector(`style[data-supereditor-style${suffix ? `-${suffix}` : ''}]`);

  if (styleTag !== null) {
    return styleTag;
  }

  const styleNode = document.createElement('style');

  styleNode.setAttribute(`data-supereditor-style${suffix ? `-${suffix}` : ''}`, '');
  styleNode.innerHTML = style;
  document.getElementsByTagName('head')[0].appendChild(styleNode);

  return styleNode;
}
