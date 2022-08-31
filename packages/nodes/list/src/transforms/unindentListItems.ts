import { PlateEditor, Value } from '@udecode/plate-core';
import { moveListItems, MoveListItemsOptions } from './moveListItems';

export type UnindentListItemsOptions = Omit<MoveListItemsOptions, 'increase'>;

export const unindentListItems = <V extends Value>(
  editor: PlateEditor<V>,
  options: UnindentListItemsOptions = {}
) => moveListItems(editor, { ...options, increase: false });
