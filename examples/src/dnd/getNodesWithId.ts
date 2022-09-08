import { nanoid } from 'nanoid';

export const getNodesWithId = (nodes: any[]) => {
  nodes.forEach((node) => {
    node.id = nanoid();
  });

  return nodes;
};
