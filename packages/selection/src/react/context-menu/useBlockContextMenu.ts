import { useMemo } from 'react';

import { useEditorPlugin } from '@udecode/plate-common/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
  useBlockContextMenuSelectors,
} from './blockContextMenuStore';

export const useBlockContextMenuState = () => {
  const { api, editor, useOption } = useEditorPlugin(BlockSelectionPlugin);

  const isOpen = useBlockContextMenuSelectors().isOpen(editor.id);
  const selectedIds = useOption('selectedIds');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const action = useMemo(() => blockContextMenuSelectors.action(), [isOpen]);
  const setAction = blockContextMenuActions.action;
  const selectedBlocks = api.blockSelection.getSelectedBlocks();

  return {
    action,
    editor,
    isOpen,
    selectedBlocks,
    selectedIds,
    setAction,
  };
};

export const useBlockContextMenu = () => {
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
