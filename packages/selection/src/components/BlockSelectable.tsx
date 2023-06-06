import React, { HTMLAttributes, useMemo } from 'react';
import {
  findNodePath,
  getPluginOptions,
  isInline,
  queryNode,
  TElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { useBlockSelectionSelectors } from '../blockSelectionStore';
import {
  BlockSelectionPlugin,
  KEY_BLOCK_SELECTION,
} from '../createBlockSelectionPlugin';

export interface BlockSelectableOptions {
  element: TElement;
  selectedColor?: string;
  active?: boolean;
}

export const useBlockSelectableState = ({
  element,
  selectedColor,
  active,
}: BlockSelectableOptions) => {
  const editor = usePlateEditorRef();

  const path = useMemo(() => findNodePath(editor, element), [editor, element]);

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
    element,
    selectedColor,
  };
};

export const useBlockSelectable = ({
  element,
  selectedColor,
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
      style: isSelected
        ? {
            backgroundColor: selectedColor,
          }
        : undefined,
      key: id,
      ...data,
    },
  };
};

export function BlockSelectable({
  options,
  children,
  ...props
}: { options: BlockSelectableOptions } & HTMLAttributes<HTMLDivElement>) {
  const state = useBlockSelectableState(options);
  const { props: rootProps } = useBlockSelectable(state);

  if (!state.active) return <>{children}</>;

  return (
    <div {...rootProps} {...props}>
      {children}
    </div>
  );
}
