import { Transforms } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { TNode } from '../../types/slate/TNode';
import { SetNodesOptions } from '../types/Transforms.types';

export const unsetNodes = <T extends TNode = TNode>(
  editor: TEditor,
  props:
    | keyof Omit<T, 'children' | 'text'>
    | (keyof Omit<T, 'children' | 'text'>)[],
  options: SetNodesOptions = {}
) => {
  return Transforms.unsetNodes<T>(editor, props as any, options as any);
};
