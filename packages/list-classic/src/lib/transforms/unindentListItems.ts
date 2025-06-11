import type { SlateEditor } from 'platejs';

import { type MoveListItemsOptions, moveListItems } from './moveListItems';

export type UnindentListItemsOptions = Omit<MoveListItemsOptions, 'increase'>;

export const unindentListItems = (
  editor: SlateEditor,
  options: UnindentListItemsOptions = {}
) => moveListItems(editor, { ...options, increase: false });
