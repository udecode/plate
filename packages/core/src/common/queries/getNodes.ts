import { Editor } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { TNode } from '../../types/slate/TNode';
import { unhangRange, UnhangRangeOptions } from '../transforms/unhangRange';
import { EditorNodesOptions } from '../types/Editor.types';
import { getQueryOptions } from './match';

export const getNodes = <T extends TNode>(
  editor: TEditor,
  options: EditorNodesOptions & UnhangRangeOptions = {}
) => {
  unhangRange(editor, options);

  return Editor.nodes<T>(editor, getQueryOptions(editor, options));
};
