import {
  type Editor,
  type EditorAboveOptions,
  type ElementOf,
  type NodeEntry,
  isDefined,
} from 'platejs';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

export const getIndentListAbove = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: Omit<EditorAboveOptions, 'match'>
): NodeEntry<N> | undefined => {
  return editor.api.above({
    ...options,
    match: (node) => isDefined(node[BaseIndentListPlugin.key]),
  });
};
