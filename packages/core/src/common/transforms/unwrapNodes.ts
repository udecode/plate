import { Transforms } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { getQueryOptions } from '../queries/match';
import { WrapOptions } from '../types/Transforms.types';

/**
 * Unwrap nodes with extended options.
 * See {@link Transforms.unwrapNodes}
 */
export const unwrapNodes = (editor: TEditor, options?: WrapOptions) => {
  Transforms.unwrapNodes(editor, getQueryOptions(editor, options));
};
