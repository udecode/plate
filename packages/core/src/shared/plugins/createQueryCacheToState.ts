import {
  type AncestorOf,
  type ENode,
  type TEditor,
  type TNodeEntry,
  type Value,
  getAboveNode,
  getNodeEntries,
  getNodeEntry,
} from '@udecode/slate';
import { getBlockAbove } from '@udecode/slate-utils';

import type { PlateEditor } from '../types/PlateEditor';

import { createPluginFactory } from '../utils/createPluginFactory';

export type QueryCachToSateEditor<V extends Value> = {
  state: {
    aboveEntries?: Generator<TNodeEntry<ENode<V>>, void, undefined>;
    aboveNode?: TNodeEntry<AncestorOf<TEditor<V>>>;
    ancestorNode?: TNodeEntry<ENode<V>>;
    blockAbove?: TNodeEntry<AncestorOf<TEditor<V>>>;
  };
};

export const withQueryCachToState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  if (typeof editor.state !== 'object') editor.state = {};

  const { apply } = editor;

  editor.apply = (operation) => {
    apply(operation);

    const aboveNode = getAboveNode(editor);
    const aboveEntries = getNodeEntries(editor);
    const blockAbove = getBlockAbove(editor);

    editor.state.aboveNode = aboveNode;
    editor.state.blockAbove = blockAbove;
    editor.state.aboveEntries = aboveEntries;

    const { selection } = editor;

    if (selection?.focus?.path) {
      editor.state.ancestorNode = getNodeEntry(editor, [
        selection.focus.path[0],
      ]);
    }
  };

  return editor;
};

export const KEY_QUERY_CACHE_TO_STATE = 'queryCacheToSate';

export const createQueryCachToStatePlugin = createPluginFactory({
  key: KEY_QUERY_CACHE_TO_STATE,
  withOverrides: withQueryCachToState,
});
