/**
 * Deserialize HTML to break line.
 */
export const deserializeHTMLToBreak = (node: HTMLElement | ChildNode) => {
  if (node.nodeName === 'BR') return '\n';
};
