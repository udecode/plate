import { type Element, ElementApi, NodeApi, type Text } from '@platejs/plite';

import type { BasePlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import { getPluginByType } from '../../../plugin/getEditorPluginInstance';

export const isNodeAffinity = (
  editor: BasePlateEditor,
  node: Element | Text,
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
  editor: BasePlateEditor,
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
