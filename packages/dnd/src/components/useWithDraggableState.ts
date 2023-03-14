import { useMemo } from 'react';
import {
  findNodePath,
  PlateRenderElementProps,
  TEditor,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';

export interface WithDraggableOptions<T = any> {
  /**
   * Document level where dnd is enabled. 0 = root blocks, 1 = first level of children, etc.
   * Set to null to allow all levels.
   * @default 0
   */
  level?: number | null;

  /**
   * Filter out elements that can't be dragged.
   */
  filter?: (editor: TEditor, path: Path) => boolean;

  /**
   * Enables dnd in read-only.
   */
  allowReadOnly?: boolean;
  draggableProps?: T;
}

export const useWithDraggableState = <T = any>({
  editor,
  level = 0,
  filter,
  element,
  allowReadOnly = false,
  draggableProps,
}: WithDraggableOptions<T> & PlateRenderElementProps) => {
  const readOnly = useReadOnly();
  const path = useMemo(() => findNodePath(editor, element), [editor, element]);

  const filteredOut = useMemo(
    () =>
      path &&
      ((Number.isInteger(level) && level !== path.length - 1) ||
        (filter && filter(editor, path))),
    [path, level, filter, editor]
  );

  return {
    disabled: filteredOut || (!allowReadOnly && readOnly),
    draggableProps: {
      editor,
      element,
      ...draggableProps,
    },
  };
};
