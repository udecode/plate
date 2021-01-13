import { Editor, Element, Transforms } from 'slate';
import { WrapOptions } from '../types/Transforms.types';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

/**
 * {@link Transforms.wrapNodes}.
 */
export const wrapNodes = (
  editor: Editor,
  element: Element,
  options: WrapOptions & UnhangRangeOptions = {}
) => {
  unhangRange(editor, options);

  Transforms.wrapNodes(editor, element, options as any);
};
