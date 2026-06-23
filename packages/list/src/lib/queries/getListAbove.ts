import type { Element, NodeEntry } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { isDefined, KEYS } from 'platejs';

export const getListAbove = <N extends Element = Element>(
  editor: SlateEditor,
  options?: Omit<
    NonNullable<Parameters<SlateEditor['api']['above']>[0]>,
    'match'
  >
): NodeEntry<N> | undefined =>
  editor.api.above({
    ...options,
    match: (node) => isDefined(node[KEYS.listType]),
  }) as NodeEntry<N> | undefined;
