import { ElementApi } from '@udecode/slate';

import type { EdgeNodes } from '../types';

export const hasElement = (edgeNodes: EdgeNodes) => {
  const [before, after] = edgeNodes;

  return (
    (before && ElementApi.isElement(before[0])) ||
    (after && ElementApi.isElement(after[0]))
  );
};
