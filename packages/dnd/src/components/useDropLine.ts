import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

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
  const element = useElement();
  const id = idProp || (element.id as string);
  const dropTarget = useEditorPlugin(DndPlugin).useOption('dropTarget');
  const dropLine = dropTarget?.line;

  // Only show dropline for currently hovered element
  if (id && dropTarget?.id !== id) {
    return {
      dropLine: '',
    };
  }
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
