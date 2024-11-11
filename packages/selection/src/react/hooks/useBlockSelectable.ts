import React from 'react';

import { getAboveNode, isVoid } from '@udecode/plate-common';
import {
  findNodePath,
  useEditorPlugin,
  useElement,
} from '@udecode/plate-common/react';
import { Path } from 'slate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useBlockSelectable = () => {
  const element = useElement();
  const { api, editor, getOption, getOptions } =
    useEditorPlugin(BlockSelectionPlugin);
  const path = React.useMemo(
    () => findNodePath(editor, element),
    [editor, element]
  );

  const id = element?.id as string | undefined;

  return {
    props: {
      className: 'slate-selectable',
      onContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!element || !path) return;

        const { enableContextMenu } = getOptions();

        if (!enableContextMenu) return;
        if (editor.selection?.focus) {
          const nodeEntry = getAboveNode(editor);

          if (nodeEntry && Path.isCommon(path, nodeEntry[1])) {
            const id = nodeEntry[0].id as string | undefined;
            const isSelected = getOption('isSelected', id);
            const isOpenAlways =
              (event.target as HTMLElement).dataset?.plateOpenContextMenu ===
              'true';

            /**
             * When "block selected or is void or has openContextMenu props",
             * right click can always open the context menu.
             */
            if (!isSelected && !isVoid(editor, nodeEntry[0]) && !isOpenAlways) {
              return event.stopPropagation();
            }
          }
        }
        if (id) {
          api.blockSelection.addSelectedRow(id, {
            clear: !event?.shiftKey,
          });
        }
      },
    },
  };
};
