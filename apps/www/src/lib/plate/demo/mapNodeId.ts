export const mapNodeId = (nodes: any, id = 0) =>
  nodes.map((node: any) => {
    if (node.id) return node;

    delete node.__source;
    delete node.__self;

    id++;
    return { ...node, id: id.toString() };
  });
