import type { BasePlateEditor } from '@platejs/core';

import { type MoveListItemsOptions, moveListItems } from './moveListItems';

export type UnindentListItemsOptions = Omit<MoveListItemsOptions, 'increase'>;

export const unindentListItems = (
  editor: BasePlateEditor,
  options: UnindentListItemsOptions = {}
) => moveListItems(editor, { ...options, increase: false });
