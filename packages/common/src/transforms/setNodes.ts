import { TEditor, TNode as TTNode } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { SetNodesOptions } from '../types/Transforms.types';

export const setNodes = <
  TNode extends TTNode = TTNode,
  TNodeMatch extends TTNode = TTNode
>(
  editor: TEditor,
  props: Partial<TNode>,
  options?: SetNodesOptions
) => Transforms.setNodes<TNodeMatch>(editor, props, options as any);
