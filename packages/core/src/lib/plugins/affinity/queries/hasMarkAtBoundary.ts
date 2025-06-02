import { type Descendant, ElementApi, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

export const hasAffinity = (editor: SlateEditor, edgeNodes: EdgeNodes) => {
  const [before, after] = edgeNodes;

  const query = (node: Descendant) => {
    const marks = Object.keys(NodeApi.extractProps(node));

    const keys = ElementApi.isElement(node) ? [node.type] : marks;

    return keys.some((mark) => {
      return editor.meta.pluginKeys.node.isAffinity.some((key) => {
        return (
          editor.getType(key) === mark && !editor.plugins[key].node.isHardEdge
        );
      });
    });
  };

  return (before && query(before[0])) || (after && query(after[0]));
};
