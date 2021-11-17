export const isHtmlComment = (node: Node): node is Comment =>
  node.nodeType === Node.COMMENT_NODE;
