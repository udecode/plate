import { NODES } from '@platejs/utils';
import { useEditorPlugin, useEditorSelector } from '@platejs/core/react';
import { RangeApi } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';

import { TablePlugin } from './TablePlugin';

export const useTableMergeState = () => {
  const { store } = useEditorPlugin(TablePlugin);

  const { disableMerge } = store.get();

  const readOnly = useEditorReadOnly();
  const someTable = useEditorSelector((editor) =>
    editor.read.nodes.some({ match: { type: NODES.table } })
  );
  const selectionExpanded = useEditorSelector((editor) =>
    editor.read.selection.isExpanded()
  );

  const collapsed = !readOnly && someTable && !selectionExpanded;

  const selectionView = useEditorSelector(
    (editor) => editor.plugin(TablePlugin).read.getSelection(),
    {
      equalityFn: (next, previous) =>
        next === previous ||
        (!next && !previous) ||
        (!!next &&
          !!previous &&
          next.root === previous.root &&
          next.table === previous.table &&
          RangeApi.equals(next.selection, previous.selection)),
    }
  );
  const isRectangularSelection =
    !!selectionView &&
    selectionView.anchors.length > 1 &&
    selectionView.complete;

  const canMerge =
    !disableMerge &&
    !readOnly &&
    someTable &&
    selectionExpanded &&
    (selectionView?.anchors.length ?? 0) > 1 &&
    isRectangularSelection;

  const canSplit =
    !disableMerge &&
    collapsed &&
    selectionView?.anchors.length === 1 &&
    (selectionView.anchor.colSpan > 1 || selectionView.anchor.rowSpan > 1);

  return { canMerge, canSplit };
};
