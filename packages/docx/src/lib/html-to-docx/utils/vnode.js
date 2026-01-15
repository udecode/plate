// eslint-disable-next-line import/prefer-default-export
export const vNodeHasChildren = (vNode) =>
  vNode?.children && Array.isArray(vNode.children) && vNode.children.length;
