import { TEditor, TNode } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { SetNodesOptions } from '../types/Transforms.types';

export const setNodes = <T extends TNode = TNode>(
  editor: TEditor,
  props: Partial<T>,
  options?: SetNodesOptions
) => Transforms.setNodes<T>(editor, props, options as any);
