import type { Path } from 'slate';

import {
  type SlateEditor,
  type TDescendant,
  collapseSelection,
  getEndPoint,
  insertNodes,
  withNewBatch,
} from '@udecode/plate-common';

import { AIPlugin } from '../../react/ai/AIPlugin';

export const insertAINodes = (
  editor: SlateEditor,
  nodes: TDescendant[],
  {
    splitHistory = false,
    target,
  }: {
    splitHistory?: boolean;
    target?: Path;
  } = {}
) => {
  if (!target && !editor.selection?.focus.path) return;

  const insert = () => {
    const aiNodes = nodes.map((node) => ({
      ...node,
      [AIPlugin.key]: true,
    }));

    insertNodes(editor, aiNodes, {
      at: getEndPoint(editor, target || editor.selection!.focus.path),
      select: true,
    });
    collapseSelection(editor, { edge: 'end' });
  };

  if (splitHistory) {
    withNewBatch(editor, insert);
  } else {
    insert();
  }
};
