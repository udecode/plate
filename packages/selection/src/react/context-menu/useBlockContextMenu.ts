import { useMemo } from 'react';

import { useEditorPlugin } from '@udecode/plate-common/react';

import { BlockContextMenuPlugin } from '../BlockContextMenuPlugin';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useBlockContextMenuState = () => {
  const { api, editor, useOption } = useEditorPlugin(BlockSelectionPlugin);
  const blockContextMenu = useEditorPlugin(BlockContextMenuPlugin);

  const isOpen = blockContextMenu.useOption('isOpen', editor.id);
  const selectedIds = useOption('selectedIds');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const action = useMemo(() => blockContextMenu.getOptions().action, [isOpen]);
  const selectedBlocks = api.blockSelection.getSelectedBlocks();

  return {
    action,
    editor,
    isOpen,
    selectedBlocks,
    selectedIds,
  };
};

export const useBlockContextMenu = () => {
  return {
    props: {
      // onOpenChange: (value: boolean) => {
      //   if (value) {
      //     api.show(editor.id);
      //   } else {
      //     api.hide();
      //   }
      // },
    },
  };
};
