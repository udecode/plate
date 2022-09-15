export const getNodesWithIdCode = `import { nanoid } from 'nanoid';

export const getNodesWithId = (nodes: any[]) => {
  nodes.forEach((node) => {
    node.id = nanoid();
  });

  return nodes;
};
`;

export const getNodesWithIdFile = {
  '/dnd/getNodesWithId.ts': getNodesWithIdCode,
};
