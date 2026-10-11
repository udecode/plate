export const nameListIds = (
  nodes: readonly any[],
  names = new Map<string, string>()
): any[] =>
  nodes.map((node) => {
    if (!node.children) return node;
    if (typeof node.listId === 'string' && !names.has(node.listId)) {
      names.set(node.listId, String.fromCharCode(97 + names.size));
    }

    return {
      ...node,
      ...(typeof node.listId === 'string'
        ? { listId: names.get(node.listId) }
        : {}),
      children: nameListIds(node.children, names),
    };
  });
