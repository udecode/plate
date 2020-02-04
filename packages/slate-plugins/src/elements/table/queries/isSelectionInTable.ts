import { Editor } from 'slate';
import { isBlockActive } from '../../queries';
import { TableType } from '../types';

export const isSelectionInTable = (editor: Editor): boolean =>
  isBlockActive(editor, TableType.TABLE);
