import { Editor } from 'slate';
import { isBlockActive } from '../../queries';
import { defaultListTypes } from '../types';

export const isSelectionInList = (
  editor: Editor,
  options = defaultListTypes
): boolean => isBlockActive(editor, options.typeLi || '');
