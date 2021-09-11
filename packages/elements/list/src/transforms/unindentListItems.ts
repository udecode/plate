import { SPEditor } from '@udecode/plate-core';
import { moveListItems, MoveListItemsOptions } from './moveListItems';

export type UnindentListItemsOptions = Omit<MoveListItemsOptions, 'increase'>;

export const unindentListItems = (
  editor: SPEditor,
  options: UnindentListItemsOptions = {}
): void => moveListItems(editor, { ...options, increase: false });
