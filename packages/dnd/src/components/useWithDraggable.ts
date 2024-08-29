import React from 'react';

import type { TEditor } from '@udecode/plate-common';
import type { Path } from 'slate';

import {
  type PlateRenderElementProps,
  findNodePath,
} from '@udecode/plate-common/react';
import { useReadOnly } from 'slate-react';

export interface WithDraggableOptions<T = any> {
  /** Enables dnd in read-only. */
  allowReadOnly?: boolean;

  draggableProps?: T;

  /** Filter out elements that can't be dragged. */
  filter?: (editor: TEditor, path: Path) => boolean;
  /**
   * Document level where dnd is enabled. 0 = root blocks, 1 = first level of
   * children, etc. Set to null to allow all levels.
   *
   * @default 0
   */
  level?: null | number;
}

export const useWithDraggable = <T = any>({
  allowReadOnly = false,
  draggableProps,
  editor,
  element,
  filter,
  level = 0,
}: PlateRenderElementProps & WithDraggableOptions<T>) => {
  const readOnly = useReadOnly();
  const path = React.useMemo(
    () => findNodePath(editor, element),
    [editor, element]
  );

  const filteredOut = React.useMemo(
    () =>
      path &&
      ((Number.isInteger(level) && level !== path.length - 1) ||
        filter?.(editor, path)),
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
