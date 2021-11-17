export const isHtmlElement = (node: Node): node is Element =>
  node.nodeType === Node.ELEMENT_NODE;
