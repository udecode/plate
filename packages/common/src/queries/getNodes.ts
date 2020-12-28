import { Editor } from 'slate';
import { unhangRange, UnhangRangeOptions } from '../transforms/unhangRange';
import { EditorNodesOptions } from '../types/Editor.types';

export const getNodes = (
  editor: Editor,
  options: EditorNodesOptions & UnhangRangeOptions = {}
) => {
  unhangRange(editor, options);

  return Editor.nodes(editor, options);
};
