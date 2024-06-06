import React, { useRef } from 'react';

import { findNodePath, useEditorRef } from '@udecode/plate-common';
import {
  type TElement,
  getAboveNode,
  getPluginOptions,
  isInline,
  isVoid,
  queryNode,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import {
  blockSelectionActions,
  useBlockSelectionSelectors,
} from '../blockSelectionStore';
import {
  type BlockSelectionPlugin,
  KEY_BLOCK_SELECTION,
} from '../createBlockSelectionPlugin';
import { isBlockSelected } from '../queries';

export interface BlockSelectableOptions {
  element: TElement;
  active?: boolean;
  selectedColor?: string;
}

export const useBlockSelectableState = ({
  active,
  element,
  selectedColor,
}: BlockSelectableOptions) => {
  const editor = useEditorRef();
  const ref = useRef<HTMLDivElement | null>(null);

  const path = React.useMemo(
    () => findNodePath(editor, element),
    [editor, element]
  );

  if (!path || isInline(editor, element)) {
    return {
      active: active ?? false,
    };
  }

  const { query } = getPluginOptions<BlockSelectionPlugin>(
    editor,
    KEY_BLOCK_SELECTION
  );

  if (query && !queryNode([element, path], query)) {
    return {
      active: active ?? false,
    };
  }

  return {
    active: active ?? true,
    editor,
    element,
    path,
    ref,
    selectedColor,
  };
};

export const useBlockSelectable = ({
  editor,
  element,
  path,
  ref,
}: ReturnType<typeof useBlockSelectableState>) => {
  const id = element?.id as string | undefined;
  const isSelected = useBlockSelectionSelectors().isSelected(id);

  const data = {
    'data-key': id,
  };

  return {
    props: {
      className: isSelected
        ? 'slate-selected slate-selectable'
        : 'slate-selectable',
      key: id,
      onContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!editor) return;

        const { disableContextMenu } = getPluginOptions<BlockSelectionPlugin>(
          editor,
          KEY_BLOCK_SELECTION
        );

        if (disableContextMenu) return;
        if (editor.selection?.focus) {
          const nodeEntry = getAboveNode(editor);

          if (nodeEntry && Path.isCommon(path, nodeEntry[1])) {
            const isSelected = isBlockSelected(nodeEntry[0] as TElement);
            const isOpenAlways =
              (event.target as HTMLElement).dataset?.openContextMenu === 'true';

            /**
             * When "block selected or is void or has openContextMenu props",
             * right click can always open the context menu.
             */
            if (!isSelected && !isVoid(editor, nodeEntry[0]) && !isOpenAlways)
              return event.stopPropagation();
          }
        }

        const aboveHtmlNode = ref.current;

        if (id && aboveHtmlNode) {
          blockSelectionActions.addSelectedRow(id, {
            aboveHtmlNode,
            clear: !event?.shiftKey,
          });
        }
      },
      ref,
      // style: isSelected
      //   ? {
      //       backgroundColor: selectedColor,
      //     }
      //   : undefined,
      ...data,
    },
  };
};

export function BlockSelectable({
  children,
  options,
  ...props
}: { options: BlockSelectableOptions } & React.HTMLAttributes<HTMLDivElement>) {
  const state = useBlockSelectableState(options);
  const { props: rootProps } = useBlockSelectable(state);

  if (!state.active) return <>{children}</>;

  return (
    <div {...rootProps} {...props}>
      {children}
    </div>
  );
}
