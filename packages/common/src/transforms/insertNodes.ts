import { TEditor, TNode as TTNode } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { InsertNodesOptions } from '../types/Transforms.types';

export const insertNodes = <
  TNode extends TTNode = TTNode,
  TNodeMatch extends TTNode = TTNode
>(
  editor: TEditor,
  props: TNode | TNode[],
  options?: InsertNodesOptions
) => Transforms.insertNodes<TNodeMatch>(editor, props, options as any);
