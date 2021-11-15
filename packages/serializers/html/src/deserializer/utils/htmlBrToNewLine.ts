/**
 * Deserialize HTML to break line.
 */
export const htmlBrToNewLine = (node: HTMLElement | ChildNode) => {
  if (node.nodeName === 'BR') {
    return '\n';
  }
};
