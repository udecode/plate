import { type TElement, type TText, ElementApi, NodeApi } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import { getPluginByType } from '../../../plugin/getSlatePlugin';

export const isNodeAffinity = (
  editor: SlateEditor,
  node: TElement | TText,
  affinity: 'directional' | 'hard' | 'outward'
) => {
  const marks = Object.keys(NodeApi.extractProps(node));
  const keys = ElementApi.isElement(node) ? [node.type] : marks;
  return keys.some(
    (type) =>
      getPluginByType(editor, type)?.rules.selection?.affinity === affinity
  );
};

export const isNodesAffinity = (
  editor: SlateEditor,
  edgeNodes: EdgeNodes,
  affinity: 'directional' | 'hard' | 'outward'
) => {
  const [backwardLeafEntry, forwardLeafEntry] = edgeNodes;

  return (
    (backwardLeafEntry &&
      isNodeAffinity(editor, backwardLeafEntry[0], affinity)) ||
    (forwardLeafEntry && isNodeAffinity(editor, forwardLeafEntry[0], affinity))
  );
};
