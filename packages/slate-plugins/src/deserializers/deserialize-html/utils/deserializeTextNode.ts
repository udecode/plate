export const deserializeTextNode = (node: HTMLElement | ChildNode) => {
  if (node.nodeType === Node.TEXT_NODE)
    return node.nodeValue === '\n' ? null : node.textContent;
};
