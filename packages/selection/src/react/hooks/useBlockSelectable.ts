import type React from 'react';

import { type TElement, PathApi } from '@udecode/plate';
import { useEditorPlugin, useElement, usePath } from '@udecode/plate/react';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

export const useBlockSelectable = () => {
  const element = useElement();
  const path = usePath();
  const { api, editor, getOption, getOptions, setOption } =
    useEditorPlugin<BlockSelectionConfig>({
      key: 'blockSelection',
    });

  const id = element?.id as string | undefined;

  return {
    props: api.blockSelection.isSelectable(element, path)
      ? {
          className: 'slate-selectable',
          onContextMenu: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>
          ) => {
            if (!element) return;

            const { enableContextMenu } = getOptions();

            if (!enableContextMenu) return;
            if (editor.selection?.focus) {
              const nodeEntry = editor.api.above<TElement>();

              if (nodeEntry && PathApi.isCommon(path, nodeEntry[1])) {
                const id = nodeEntry[0].id as string | undefined;
                const isSelected = getOption('isSelected', id);
                const isOpenAlways =
                  (event.target as HTMLElement).dataset
                    ?.plateOpenContextMenu === 'true';

                /**
                 * When "block selected or is void or has openContextMenu
                 * props", right click can always open the context menu.
                 */
                if (
                  !isSelected &&
                  !editor.api.isVoid(nodeEntry[0]) &&
                  !isOpenAlways
                ) {
                  return event.stopPropagation();
                }
              }
            }
            if (id) {
              if (event?.shiftKey) {
                api.blockSelection.add(id);
              } else {
                const selectedIds = getOption('selectedIds');
                const clickAlreadySelected = selectedIds?.has(id);

                if (!clickAlreadySelected) {
                  setOption('selectedIds', new Set([id]));
                }
              }
            }
          },
        }
      : {},
  };
};
