import {
  type EditorAboveOptions,
  type Editor,
  type Element,
  type NodeEntry,
  ElementApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

export const getListAbove = <N extends Element = Element>(
  editor: Editor,
  options?: Omit<EditorAboveOptions<N>, 'match'>
): NodeEntry<N> | undefined =>
  editor.read.nodes.above<N>({
    ...options,
    match: (node) =>
      ElementApi.isElement(node) && isDefined(node[KEYS.listType]),
  });
