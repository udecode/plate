import type React from 'react';

import { type Element, type Path, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { type PlateEditor, useEditorPlugin } from '@platejs/core/react';
import { useElementContext } from '@platejs/core/react/internal';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

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
    element: Element;
    event: React.MouseEvent<HTMLDivElement, MouseEvent>;
    disabledWhenFocused?: boolean;
  }
) => {
  const blockSelection = editor.plugin<BlockSelectionConfig>({
    key: KEYS.blockSelection,
  });
  const { enableContextMenu, selectedIds } = blockSelection.getOptions();

  if (!enableContextMenu) return;

  if (editor.read.selection()?.focus && disabledWhenFocused) {
    const nodeEntry = editor.read.nodes.above<Element>();
    const elementPath = editor.read.nodes.path(element);

    if (
      nodeEntry &&
      elementPath &&
      PathApi.isCommon(elementPath, nodeEntry[1])
    ) {
      const id = nodeEntry[0].id as string | undefined;
      const isSelected = blockSelection.getOption('isSelected', id);
      const isOpenAlways =
        (event.target as HTMLElement).dataset?.plateOpenContextMenu === 'true';

      /**
       * When "block selected or is void or has openContextMenu props", right
       * click can always open the context menu.
       */
      if (
        !isSelected &&
        !editor.read.schema.isVoid(nodeEntry[0]) &&
        !isOpenAlways
      ) {
        return event.stopPropagation();
      }
    }
  }

  const id = element.id as string | undefined;

  if (id) {
    if (event?.shiftKey) {
      blockSelection.api.add(id);
    } else {
      const clickAlreadySelected = selectedIds?.has(id);

      if (!clickAlreadySelected) {
        blockSelection.setOption('selectedIds', new Set([id]));
      }
    }
  }
};

export const useBlockSelectable = ({
  element: elementProp,
  path: pathProp,
}: {
  element?: Element;
  path?: Path;
} = {}) => {
  const elementContext = useElementContext();
  const element = elementProp ?? elementContext?.element;
  const path = pathProp ?? elementContext?.path;
  const { api, editor } = useEditorPlugin<BlockSelectionConfig>({
    key: KEYS.blockSelection,
  });

  return {
    props:
      element && path && api?.isSelectable(element, path)
        ? {
            className: 'plite-selectable',
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
