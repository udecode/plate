import * as React from 'react';

import {
  EditorElement,
  type EditorElementProps,
  useElementSelected,
} from '../../core';
import type { BoardGeoPlugin, BoardNotePlugin } from './BoardPlugin';
import { useBoardViewContext } from './boardView.internal';

const CORNERS = [
  ['nw', { cursor: 'nwse-resize', left: -4, top: -4 }],
  ['ne', { cursor: 'nesw-resize', right: -4, top: -4 }],
  ['sw', { bottom: -4, cursor: 'nesw-resize', left: -4 }],
  ['se', { bottom: -4, cursor: 'nwse-resize', right: -4 }],
] as const;

/**
 * One shape on a board, placed at its box and painted at its stacking rank,
 * while the DOM keeps the board's stored order. A selected shape shows four
 * resize handles, `[data-board-handle]`, and `data-selected`.
 */
export function BoardShape({
  className,
  style,
  ...props
}: EditorElementProps<typeof BoardGeoPlugin | typeof BoardNotePlugin> & {
  className?: string;
  style?: React.CSSProperties;
}) {
  const view = useBoardViewContext();
  const key = view.keyOf(props.element);
  const layout = React.useSyncExternalStore(
    view.subscribeShapes,
    () => view.layoutOf(key),
    () => view.layoutOf(key)
  );
  const selected = useElementSelected({ mode: 'object' });

  return (
    <EditorElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-board-shape': layout?.id,
        'data-selected': selected || undefined,
      }}
      className={className}
      style={{
        ...style,
        height: layout?.box.height,
        left: layout?.box.x,
        margin: 0,
        position: 'absolute',
        top: layout?.box.y,
        width: layout?.box.width,
        zIndex: layout?.rank,
      }}
    >
      {props.children}
      {selected &&
        CORNERS.map(([corner, place]) => (
          <div
            contentEditable={false}
            data-board-handle={corner}
            key={corner}
            style={{
              background: 'white',
              border: '1px solid currentColor',
              height: 8,
              position: 'absolute',
              width: 8,
              ...place,
            }}
          />
        ))}
    </EditorElement>
  );
}
