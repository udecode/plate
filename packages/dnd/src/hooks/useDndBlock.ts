import { WithPartial } from '@udecode/plate-common';

import { useDndNode, UseDndNodeOptions } from './useDndNode';
import { DRAG_ITEM_BLOCK } from './useDragBlock';

/**
 * {@link useDndNode}
 */
export const useDndBlock = (options: WithPartial<UseDndNodeOptions, 'type'>) =>
  useDndNode({
    type: DRAG_ITEM_BLOCK,
    ...options,
  });
