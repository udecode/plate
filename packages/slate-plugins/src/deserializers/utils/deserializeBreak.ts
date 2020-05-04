export const deserializeBreak = (node: HTMLElement | ChildNode) => {
  if (node.nodeName === 'BR') return '\n';
};
