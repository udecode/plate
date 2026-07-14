import type { BaseEditor } from '@platejs/core';
import type { ListTransaction } from '../BaseListPlugin';

import { type MoveListItemsOptions, moveListItems } from './moveListItems';

export type UnindentListItemsOptions = Omit<MoveListItemsOptions, 'increase'>;

export const unindentListItems = (
  editor: BaseEditor,
  tx: ListTransaction,
  options: UnindentListItemsOptions = {}
) => moveListItems(editor, tx, { ...options, increase: false });
