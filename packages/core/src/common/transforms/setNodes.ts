import { Transforms } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { TNode } from '../../types/slate/TNode';
import { SetNodesOptions } from '../types/Transforms.types';

export const setNodes = <T extends TNode = TNode>(
  editor: TEditor,
  props: Partial<T>,
  options?: SetNodesOptions
) => Transforms.setNodes<T>(editor, props, options as any);
