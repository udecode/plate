const cleanNode = (nodes: any) => {
  nodes.forEach((node: any) => {
    delete node.__source;
    delete node.__self;

    if (node.children) {
      cleanNode(node.children);
    }
  });
};

export const mapNodeId = (nodes: any, id = 0) => {
  cleanNode(nodes);

  return nodes.map((node: any) => {
    if (node.id) return node;

    id++;

    return { ...node, id: id.toString() };
  });
};
