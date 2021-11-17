export const isHtmlText = (node: Node): node is Text =>
  node.nodeType === Node.TEXT_NODE;
