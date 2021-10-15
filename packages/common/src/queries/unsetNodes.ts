import { TEditor, TNode } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';
import { getQueryOptions } from './match';

export const unsetNodes = <T extends TNode>(
  editor: TEditor,
  props: string | string[],
  options: EditorNodesOptions = {}
) => {
  return Transforms.unsetNodes<T>(
    editor,
    props,
    getQueryOptions(editor, options)
  );
};
