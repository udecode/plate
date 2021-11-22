import { Transforms } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { TNode } from '../../types/slate/TNode';
import { InsertNodesOptions } from '../types/Transforms.types';

export const insertNodes = <
  T extends TNode = TNode,
  TNodeMatch extends TNode = TNode
>(
  editor: TEditor,
  props: T | T[],
  options?: InsertNodesOptions
) => Transforms.insertNodes<TNodeMatch>(editor, props, options as any);
