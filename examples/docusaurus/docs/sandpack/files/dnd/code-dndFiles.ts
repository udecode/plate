import { getNodesWithRandomIdFile } from './code-getNodesWithRandomId';
import { indexFile } from './code-index';
import { withStyledDraggablesFile } from './code-withStyledDraggables';

export const dndFiles = {
  ...getNodesWithRandomIdFile,
  ...indexFile,
  ...withStyledDraggablesFile,
};
