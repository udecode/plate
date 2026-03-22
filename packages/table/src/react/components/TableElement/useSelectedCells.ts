import React from 'react';

import { useEditorPlugin, useEditorSelector, useReadOnly } from 'platejs/react';

import { getSelectedCellIds } from '../../../lib';
import { BaseTablePlugin } from '../../../lib/BaseTablePlugin';

const hasSameIds = (
  nextValue: string[] | null | undefined,
  prevValue: string[] | null | undefined
) => {
  if (nextValue === prevValue) return true;
  if (!nextValue || !prevValue) return !nextValue && !prevValue;
  if (nextValue.length !== prevValue.length) return false;

  for (const [index, nextId] of nextValue.entries()) {
    if (nextId !== prevValue[index]) return false;
  }

  return true;
};

const hasSameSelectionState = (
  nextValue: {
    selectedCellIds: string[] | null;
    selectedContent: unknown;
  },
  prevValue: {
    selectedCellIds: string[] | null;
    selectedContent: unknown;
  }
) =>
  nextValue.selectedContent === prevValue.selectedContent &&
  hasSameIds(nextValue.selectedCellIds, prevValue.selectedCellIds);

export const useSelectedCells = () => {
  const readOnly = useReadOnly();
  const { setOptions } = useEditorPlugin(BaseTablePlugin);
  const selectionState = useEditorSelector(
    (editor) => {
      if (readOnly) {
        return { selectedCellIds: null, selectedContent: null };
      }

      const selectedCellIds = getSelectedCellIds(editor);

      return {
        selectedCellIds,
        selectedContent: selectedCellIds ? editor.children : null,
      };
    },
    [readOnly],
    { equalityFn: hasSameSelectionState }
  );

  React.useLayoutEffect(() => {
    const nextSelectedCellIds = selectionState.selectedCellIds;

    setOptions((draft) => {
      if (!hasSameIds(draft._selectedCellIds, nextSelectedCellIds)) {
        draft._selectedCellIds = nextSelectedCellIds;
      }
      if (draft._selectedTableIds !== undefined) {
        draft._selectedTableIds = undefined;
      }

      draft._selectionVersion = (draft._selectionVersion ?? 0) + 1;
    });
  }, [selectionState, setOptions]);
};
