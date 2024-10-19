import type { Path } from 'slate';

import {
  type SlateEditor,
  type TDescendant,
  collapseSelection,
  getEndPoint,
  insertNodes,
  withMerging,
  withoutMergingHistory,
} from '@udecode/plate-common';

import { AIPlugin } from '../../react/ai/AIPlugin';

export const insertAINodes = (
  editor: SlateEditor,
  nodes: TDescendant[],
  {
    history = 'default',
    target,
  }: {
    history?: 'default' | 'merge' | 'withoutMerge';
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

  switch (history) {
    case 'default': {
      insert();

      break;
    }
    case 'merge': {
      withMerging(editor, insert);

      break;
    }
    case 'withoutMerge': {
      withoutMergingHistory(editor, insert);

      break;
    }
  }
};
