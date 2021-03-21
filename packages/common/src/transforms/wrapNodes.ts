import { TElement } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { WrapOptions } from '../types/Transforms.types';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

/**
 * {@link Transforms.wrapNodes}.
 */
export const wrapNodes = <T = {}>(
  editor: Editor,
  element: TElement<T>,
  options: WrapOptions & UnhangRangeOptions = {}
) => {
  unhangRange(editor, options);

  Transforms.wrapNodes(editor, element, options as any);
};
