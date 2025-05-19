import {
  type Editor,
  type EditorAboveOptions,
  type ElementOf,
  type NodeEntry,
  isDefined,
} from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

export const getListAbove = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: Omit<EditorAboveOptions, 'match'>
): NodeEntry<N> | undefined => {
  return editor.api.above({
    ...options,
    match: (node) => isDefined(node[INDENT_LIST_KEYS.listStyleType]),
  });
};
