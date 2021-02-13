import { Editor, Transforms } from 'slate';
import { WrapOptions } from '../types/Transforms.types';
import { getQueryOptions } from '../utils/match';

/**
 * Unwrap nodes with extended options.
 * See {@link Transforms.unwrapNodes}
 */
export const unwrapNodes = (editor: Editor, options?: WrapOptions) => {
  Transforms.unwrapNodes(editor, getQueryOptions(editor, options));
};
