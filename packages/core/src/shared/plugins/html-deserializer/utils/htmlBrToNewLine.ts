/** Deserialize HTML to break line. */
export const htmlBrToNewLine = (node: ChildNode | HTMLElement) => {
  if (node.nodeName === 'BR') {
    return '\n';
  }
};
