import * as React from 'react';

import type {
  TableElement,
  TableResize,
  TableResizeTarget,
} from '../../../features/table';
import { useEditor, useEditorReadOnly } from '../../core';
import { bindPointerSession } from '../../utils/bindPointerSession.internal';
import { TablePlugin } from './TablePlugin';

export type TableResizeHandle =
  | { edge: 'bottom'; rowIndex: number }
  | Exclude<TableResizeTarget, { edge: 'bottom' }>;

/**
 * Starts a table resize from a primary pointer on the supplied table.
 * Previews stay in the caller; pointerup commits once. Cancellation, blur,
 * read-only changes, table replacement and unmount discard the preview.
 * Returns false when the handle cannot start a resize.
 */
export const useTableResize = ({
  element,
  tableRef,
  onResize,
  onResizeEnd,
}: {
  element: TableElement;
  tableRef: React.RefObject<HTMLTableElement | null>;
  onResize: (resize: TableResize) => void;
  onResizeEnd: () => void;
}) => {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const cancelRef = React.useRef<(() => void) | null>(null);
  const callbacksRef = React.useRef({ onResize, onResizeEnd });

  React.useLayoutEffect(() => {
    callbacksRef.current = { onResize, onResizeEnd };
  }, [onResize, onResizeEnd]);

  React.useLayoutEffect(
    () => () => {
      cancelRef.current?.();
    },
    [editor, element, readOnly, tableRef]
  );

  return React.useCallback(
    (event: React.PointerEvent<HTMLElement>, handle: TableResizeHandle) => {
      const table = tableRef.current;
      const ownerWindow = table?.ownerDocument.defaultView;
      const key = editor.key(element);
      const currentElement = key
        ? editor.read.nodes.get(key, { type: TablePlugin })?.[0]
        : undefined;

      if (
        readOnly ||
        editor.read.view.isReadOnly() ||
        event.button !== 0 ||
        !event.isPrimary ||
        !table?.isConnected ||
        !table.contains(event.currentTarget) ||
        !ownerWindow ||
        !key ||
        !currentElement
      ) {
        return false;
      }

      let target: TableResizeTarget;

      if (handle.edge === 'bottom') {
        const height = table.rows
          .item(handle.rowIndex)
          ?.getBoundingClientRect().height;

        if (!height) return false;
        target = { ...handle, height };
      } else {
        target = handle;
      }
      if (
        handle.edge === 'left' &&
        editor.plugin(TablePlugin).store.get().disableMarginLeft
      ) {
        return false;
      }

      cancelRef.current?.();

      const callbacks = callbacksRef.current;
      const resize = editor
        .plugin(TablePlugin)
        .api.createResize(currentElement, target);
      const position = (pointer: Pick<PointerEvent, 'clientX' | 'clientY'>) =>
        handle.edge === 'bottom' ? pointer.clientY : pointer.clientX;
      const initialPosition = position(event);
      const isCurrent = () =>
        !editor.read.view.isReadOnly() &&
        tableRef.current === table &&
        table.isConnected &&
        editor.read.nodes.get(key, { type: TablePlugin })?.[0] ===
          currentElement;

      cancelRef.current = bindPointerSession({
        ownerWindow,
        pointerId: event.pointerId,
        isCurrent,
        onMove: (pointer) => {
          callbacks.onResize(resize(position(pointer) - initialPosition));
        },
        onEnd: (pointer) => {
          cancelRef.current = null;
          try {
            if (pointer) {
              const delta = position(pointer) - initialPosition;
              if (delta !== 0) {
                editor
                  .plugin(TablePlugin)
                  .update.resize(resize(delta), { at: key });
              }
            }
          } finally {
            callbacks.onResizeEnd();
          }
        },
      });
      event.preventDefault();
      event.stopPropagation();

      return true;
    },
    [editor, element, readOnly, tableRef]
  );
};
