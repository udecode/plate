import { Editor } from 'slate';
import { unhangRange, UnhangRangeOptions } from '../transforms/unhangRange';
import { EditorNodesOptions } from '../types/Editor.types';
import { getQueryOptions } from '../utils/match';

export const getNodes = (
  editor: Editor,
  options: EditorNodesOptions & UnhangRangeOptions = {}
) => {
  unhangRange(editor, options);

  return Editor.nodes(editor, getQueryOptions(editor, options));
};
