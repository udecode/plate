import { TNode, WithOverride } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { deleteBackwardList } from './deleteBackwardList';
import { deleteForwardList } from './deleteForwardList';
import { deleteFragmentList } from './deleteFragmentList';
import { insertBreakList } from './insertBreakList';
import { insertFragmentList } from './insertFragmentList';
import {
  normalizeList,
  normalizeListItemContentMarkToMarkers,
  normalizeListItemMarks,
  normalizeListItemOrders,
} from './normalizers';
import { ListPlugin } from './types';

export const withList: WithOverride<{}, ListPlugin> = (
  editor,
  { options: { enableOrdering, marks } }
) => {
  const {
    insertBreak,
    deleteBackward,
    deleteForward,
    deleteFragment,
    normalizeNode,
  } = editor;

  editor.insertBreak = () => {
    if (insertBreakList(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = () => {
    if (deleteFragmentList(editor)) return;

    deleteFragment();
  };

  editor.insertFragment = insertFragmentList(editor);

  editor.normalizeNode = (nodeEntry) => {
    const shouldReturnEarly = normalizeList(editor, nodeEntry);

    if (marks?.length || enableOrdering) {
      normalizeListItemOrders(editor, nodeEntry[1]);
    }

    if (marks?.length) {
      normalizeListItemContentMarkToMarkers(
        editor,
        nodeEntry as NodeEntry<TNode>
      );
      normalizeListItemMarks(editor, nodeEntry as NodeEntry<TNode>);
    }
    if (!shouldReturnEarly) {
      normalizeNode(nodeEntry);
    }
  };

  return editor;
};
