import { useCallback, useMemo } from 'react';

import { getNodeTexts, setNodes, useEditorRef } from '@udecode/plate-common';

import { useBlockSelectionSelectors } from '../blockSelectionStore';
import { getSelectedBlocks } from '../queries';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
  useBlockContextMenuSelectors,
} from './blockContextMenuStore';

export const useBlockContextMenuState = () => {
  const editor = useEditorRef();

  const isOpen = useBlockContextMenuSelectors().isOpen(editor.id);
  const selectedIds = useBlockSelectionSelectors().selectedIds();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const action = useMemo(() => blockContextMenuSelectors.action(), [isOpen]);
  const setAction = blockContextMenuActions.action;
  const selectedBlocks = getSelectedBlocks(editor);

  const setMarkSelection = useCallback(
    (mark: string, value: string) => {
      selectedBlocks.forEach(([node, nodePath]) => {
        const _textEntry = getNodeTexts(node);
        const textEntry = Array.from(_textEntry);
        textEntry.forEach(([_, textpath]) => {
          setNodes(
            editor,
            { [mark]: value },
            { at: [...nodePath, ...textpath] }
          );
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action]
  );

  return {
    action,
    editor,
    isOpen,
    selectedBlocks,
    selectedIds,
    setAction,
    setMarkSelection,
  };
};

export const useBlockContextMenu = ({
  editor,
}: ReturnType<typeof useBlockContextMenuState>) => {
  return {
    props: {
      // onOpenChange: (value: boolean) => {
      //   if (value) {
      //     blockContextMenuActions.show(editor.id);
      //   } else {
      //     blockContextMenuActions.hide();
      //   }
      // },
    },
  };
};
