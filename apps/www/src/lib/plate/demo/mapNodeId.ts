let id = 0;

export const mapNodeId = (nodes: any) =>
  nodes.map((node: any) => {
    delete node.__source;
    delete node.__self;

    id++;
    return { ...node, id: id.toString() };
  });
