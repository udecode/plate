export const getNodesWithIdCode = `let _id = 10000;

export const getNodesWithId = (nodes: any[]) => {
  nodes.forEach((node) => {
    _id++;
    node.id = _id;
    // node.id = nanoid();
    // node.id = Math.random().toString().substr(2, 6);
  });

  return nodes;
};
`;

export const getNodesWithIdFile = {
  '/dnd/getNodesWithId.ts': getNodesWithIdCode,
};
