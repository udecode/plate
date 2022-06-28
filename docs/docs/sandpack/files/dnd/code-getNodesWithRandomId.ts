export const getNodesWithRandomIdCode = `export const getNodesWithRandomId = (nodes: any[]) => {
  let _id = 10000;
  nodes.forEach((node) => {
    node.id = _id;
    _id++;
  });

  return nodes;
};
`;

export const getNodesWithRandomIdFile = {
  '/dnd/getNodesWithRandomId.ts': getNodesWithRandomIdCode,
};
