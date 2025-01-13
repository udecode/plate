import { node as nodeBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';
import type { AtOrDescendant } from '../../types';

import {
  type DescendantOf,
  type EditorNodeOptions,
  type EditorNodesOptions,
  type ValueOf,
  LocationApi,
} from '../../interfaces';
import { getAt } from '../../utils';

export const node = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  atOrOptions: AtOrDescendant | EditorNodesOptions<ValueOf<E>>,
  nodeOptions?: EditorNodeOptions
): NodeEntry<N> | undefined => {
  try {
    if (LocationApi.isAt(atOrOptions)) {
      const at = getAt(editor, atOrOptions)!;

      return nodeBase(editor as any, at, nodeOptions) as any;
    }

    const options = atOrOptions;

    const nodeEntries = editor.api.nodes<N>(options);

    return nodeEntries.next().value as any;
  } catch {
    return undefined;
  }
};
