import { TEditor, TElement as TTElement, TNode } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { WrapOptions } from '../types/Transforms.types';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

/**
 * {@link Transforms.wrapNodes}.
 */
export const wrapNodes = <
  TElement extends TTElement = TTElement,
  TNodeMatch extends TNode = TNode
>(
  editor: TEditor,
  element: TElement,
  options: WrapOptions<TNodeMatch> & UnhangRangeOptions = {}
) => {
  unhangRange(editor, options);

  Transforms.wrapNodes<TNodeMatch>(editor, element as any, options as any);
};
