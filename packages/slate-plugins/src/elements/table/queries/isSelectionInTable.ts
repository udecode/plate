import { Editor } from 'slate';
import { isBlockActive } from '../../queries';
import { defaultTableTypes } from '../types';

export const isSelectionInTable = (
  editor: Editor,
  options = defaultTableTypes
): boolean => isBlockActive(editor, options.typeTable || '');
