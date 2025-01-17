import { useEditorPlugin, useEditorRef, useElement } from '@udecode/plate/react';

import type { DropLineDirection } from '../types';

import { DndPlugin } from '../DndPlugin';

export const useDropLine = ({
  id: idProp,
  orientation = 'vertical',
}: {
  /** The id of the element to show the dropline for. */
  id?: string;
  orientation?: 'horizontal' | 'vertical';
} = {}): {
  dropLine?: DropLineDirection;
} => {
  const editor = useEditorRef();
  const element = useElement();
  const id = idProp || (element.id as string);

  const dropLine = editor.useOptions(DndPlugin, ({ dropTarget }) => {
    if (!dropTarget) return null;
    if (dropTarget.id !== id) return null;
    return dropTarget.line;
  }) ?? '';

  if (orientation) {
    const isHorizontalDropLine = dropLine === 'left' || dropLine === 'right';
    const isVerticalDropLine = dropLine === 'top' || dropLine === 'bottom';

    // If the orientation is vertical but we got a horizontal dropline, clear it.
    if (
      (orientation === 'vertical' && isHorizontalDropLine) ||
      (orientation === 'horizontal' && isVerticalDropLine)
    ) {
      return {
        dropLine: '',
      };
    }
  }

  return {
    dropLine,
  };
};
