import React, { HTMLAttributes, ReactNode, useMemo } from 'react';
import {
  findNodePath,
  getPluginOptions,
  HTMLPropsAs,
  isInline,
  queryNode,
  TElement,
  useEditorRef,
} from '@udecode/plate-common';
import { useBlockSelectionSelectors } from '../blockSelectionStore';
import {
  BlockSelectionPlugin,
  KEY_BLOCK_SELECTION,
} from '../createBlockSelectionPlugin';

export interface BlockSelectableState {
  active: boolean;
}

export interface BlockSelectableProps extends HTMLPropsAs<'div'> {
  element: TElement;
  children: ReactNode;
  state?: BlockSelectableState;
  selectedColor?: string;
}

export const useBlockSelectableState = ({
  element,
  state,
}: BlockSelectableProps) => {
  const editor = useEditorRef();

  const path = useMemo(() => findNodePath(editor, element), [editor, element]);

  if (!path || isInline(editor, element)) {
    return {
      active: false,
      ...state,
    };
  }

  const { query } = getPluginOptions<BlockSelectionPlugin>(
    editor,
    KEY_BLOCK_SELECTION
  );

  if (query && !queryNode([element, path], query)) {
    return {
      active: false,
      ...state,
    };
  }

  return {
    active: true,
    ...state,
  };
};

export const useBlockSelectable = ({
  element,
  selectedColor,
  ...props
}: BlockSelectableProps): HTMLAttributes<HTMLDivElement> => {
  const id = element.id as string | undefined;
  const isSelected = useBlockSelectionSelectors().isSelected(id);

  const data = {
    'data-key': id,
  };

  return {
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
    ...props,
  };
};

export function BlockSelectable(props: BlockSelectableProps) {
  const htmlProps = useBlockSelectable(props as any);
  const { active } = useBlockSelectableState(props as any);

  if (!active) return <>{htmlProps.children}</>;

  return <div {...htmlProps} />;
}
