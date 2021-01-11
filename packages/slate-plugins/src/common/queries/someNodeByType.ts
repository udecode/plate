import castArray from 'lodash/castArray';
import { Editor, Node } from 'slate';
import { FindNodeOptions } from './findNode';
import { someNode } from './someNode';

/**
 * Iterate through all of the descendants and break early for the first truthy match. Otherwise
 * returns false.
 */
export const someNodeByType = <T extends Node>(
  editor: Editor,
  types: string[] | string,
  options: Omit<FindNodeOptions<T>, 'match'> = {}
) => {
  types = castArray<string>(types);

  return someNode(editor, {
    match: (n) => types.includes(n.type as string),
    ...options,
  });
};
