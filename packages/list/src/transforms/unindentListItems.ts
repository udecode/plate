import type { PlateEditor } from '@udecode/plate-common/server';

import { type MoveListItemsOptions, moveListItems } from './moveListItems';

export type UnindentListItemsOptions = Omit<MoveListItemsOptions, 'increase'>;

export const unindentListItems = (
  editor: PlateEditor,
  options: UnindentListItemsOptions = {}
) => moveListItems(editor, { ...options, increase: false });
