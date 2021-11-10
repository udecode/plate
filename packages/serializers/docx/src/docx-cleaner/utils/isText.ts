export const isText = (node: Node): node is Text =>
  node.nodeType === Node.TEXT_NODE;
