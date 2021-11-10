export const isComment = (node: Node): node is Comment =>
  node.nodeType === Node.COMMENT_NODE;
