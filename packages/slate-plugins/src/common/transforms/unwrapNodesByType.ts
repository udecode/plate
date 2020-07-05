import { castArray } from 'lodash';
import { Editor, Transforms } from 'slate';
import { WrapOptions } from '../types/Transforms.types';

/**
 * Unwrap nodes by type
 */
export const unwrapNodesByType = (
  editor: Editor,
  types: string[] | string,
  options: Omit<WrapOptions, 'match'> = {}
) => {
  types = castArray<string>(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type as string),
    ...options,
  });
};
