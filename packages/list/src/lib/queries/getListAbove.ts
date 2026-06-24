import type { Element, NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { isDefined, KEYS } from 'platejs';

export const getListAbove = <N extends Element = Element>(
  editor: BasePlateEditor,
  options?: Omit<
    NonNullable<Parameters<BasePlateEditor['api']['above']>[0]>,
    'match'
  >
): NodeEntry<N> | undefined =>
  editor.api.above({
    ...options,
    match: (node: any) => isDefined(node[KEYS.listType]),
  }) as NodeEntry<N> | undefined;
