import { Editor } from 'slate';
import { isBlockActive } from '../../queries';
import { ListType } from '../types';

export const isSelectionInList = (editor: Editor): boolean =>
  isBlockActive(editor, ListType.LIST_ITEM);
