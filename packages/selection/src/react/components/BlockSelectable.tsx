import React, { useRef } from 'react';

import {
  type TElement,
  getAboveNode,
  isInline,
  isVoid,
  queryNode,
} from '@udecode/plate-common';
import {
  createAtomStore,
  findNodePath,
  useEditorPlugin,
} from '@udecode/plate-common/react';
import { Path } from 'slate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const { BlockSelectableProvider, useBlockSelectableStore } =
  createAtomStore(
    {
      selectable: false,
    },
    { name: 'blockSelectable' }
  );

export interface BlockSelectableOptions {
  element: TElement;
  active?: boolean;
}

export const useBlockSelectableState = ({
  active,
  element,
}: BlockSelectableOptions) => {
  const { editor, getOptions } = useEditorPlugin(BlockSelectionPlugin);

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

  const { query } = getOptions();

  if (query && !queryNode([element, path], query)) {
    return {
      active: active ?? false,
    };
  }

  return {
    active: active ?? true,
    element,
    path,
    ref,
  };
};

export const useBlockSelectable = ({
  active,
  element,
  path,
  ref,
}: ReturnType<typeof useBlockSelectableState>) => {
  const { api, editor, getOption, getOptions } =
    useEditorPlugin(BlockSelectionPlugin);

  const id = element?.id as string | undefined;

  const data = { 'data-key': id };

  return {
    props: {
      className: 'slate-selectable',
      ref,
      onContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!element || !active) return;

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
            if (!isSelected && !isVoid(editor, nodeEntry[0]) && !isOpenAlways)
              return event.stopPropagation();
          }
        }

        const aboveHtmlNode = ref.current;

        if (id && aboveHtmlNode) {
          api.blockSelection.addSelectedRow(id, {
            aboveHtmlNode,
            clear: !event?.shiftKey,
          });
        }
      },
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
  const blockSelectable = useBlockSelectable(state);

  if (!state.active)
    return <BlockSelectableProvider>{children}</BlockSelectableProvider>;

  return (
    <BlockSelectableProvider selectable>
      <div {...blockSelectable.props} {...props}>
        {children}
      </div>
    </BlockSelectableProvider>
  );
}
