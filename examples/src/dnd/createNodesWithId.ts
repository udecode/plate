export const createNodesWithId = (nodes: any[]) => {
  let _id = 10000;
  nodes.forEach((node) => {
    node.id = _id;
    _id++;
  });

  return nodes;
};
