import React from 'react';

import { findNodePath, useEditorRef } from '@udecode/plate-common';
import {
  type TElement,
  getPluginOptions,
  isInline,
  queryNode,
} from '@udecode/plate-common/server';

import { useBlockSelectionSelectors } from '../blockSelectionStore';
import {
  type BlockSelectionPlugin,
  KEY_BLOCK_SELECTION,
} from '../createBlockSelectionPlugin';

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
      key: id,
      style: isSelected
        ? {
            backgroundColor: selectedColor,
          }
        : undefined,
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
