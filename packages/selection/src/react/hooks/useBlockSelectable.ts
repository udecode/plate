import type React from 'react';

import { type TElement, KEYS, PathApi } from 'platejs';
import {
  type PlateEditor,
  useEditorPlugin,
  useElement,
  usePath,
} from 'platejs/react';

import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '../BlockSelectionPlugin';

/** Add block selection when right click on a block. */
export const addOnContextMenu = (
  editor: PlateEditor,
  {
    /**
     * When right click on a block, if the block is focused, the context menu
     * will be disabled and open the browser context menu.
     */
    disabledWhenFocused = true,
    element,
    event,
  }: {
    element: TElement;
    event: React.MouseEvent<HTMLDivElement, MouseEvent>;
    disabledWhenFocused?: boolean;
  }
) => {
  const { enableContextMenu, selectedIds } =
    editor.getOptions(BlockSelectionPlugin);

  if (!enableContextMenu) return;

  if (editor.selection?.focus && disabledWhenFocused) {
    const nodeEntry = editor.api.above<TElement>();
    const elementPath = editor.api.findPath(element);

    if (
      nodeEntry &&
      elementPath &&
      PathApi.isCommon(elementPath, nodeEntry[1])
    ) {
      const id = nodeEntry[0].id as string | undefined;
      const isSelected = editor.getOption(
        BlockSelectionPlugin,
        'isSelected',
        id
      );
      const isOpenAlways =
        (event.target as HTMLElement).dataset?.plateOpenContextMenu === 'true';

      /**
       * When "block selected or is void or has openContextMenu props", right
       * click can always open the context menu.
       */
      if (!isSelected && !editor.api.isVoid(nodeEntry[0]) && !isOpenAlways) {
        return event.stopPropagation();
      }
    }
  }

  const id = element.id as string | undefined;

  if (id) {
    if (event?.shiftKey) {
      editor.getApi(BlockSelectionPlugin).blockSelection.add(id);
    } else {
      const clickAlreadySelected = selectedIds?.has(id);

      if (!clickAlreadySelected) {
        editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set([id]));
      }
    }
  }
};

export const useBlockSelectable = () => {
  const element = useElement();
  const path = usePath();
  const { api, editor } = useEditorPlugin<BlockSelectionConfig>({
    key: KEYS.blockSelection,
  });

  return {
    props: api.blockSelection?.isSelectable(element, path)
      ? {
          className: 'slate-selectable',
          onContextMenu: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>
          ) =>
            addOnContextMenu(editor, {
              element,
              event,
            }),
        }
      : {},
  };
};
