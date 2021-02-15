import { Editor, Transforms } from 'slate';
import { getQueryOptions } from '../queries/match';
import { WrapOptions } from '../types/Transforms.types';

/**
 * Unwrap nodes with extended options.
 * See {@link Transforms.unwrapNodes}
 */
export const unwrapNodes = (editor: Editor, options?: WrapOptions) => {
  Transforms.unwrapNodes(editor, getQueryOptions(editor, options));
};
