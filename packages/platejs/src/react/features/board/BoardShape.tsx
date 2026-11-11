import * as React from 'react';

import type { Element } from '../../../core';
import {
  EditorElement,
  type EditorElementProps,
  useElementSelected,
} from '../../core';
import type {
  BoardArrowPlugin,
  BoardGeoPlugin,
  BoardNotePlugin,
} from './BoardPlugin';
import { type BoardArrowPath, useBoardViewContext } from './boardView.internal';

export type { BoardArrowPath } from './boardView.internal';

const CORNERS = [
  ['nw', { cursor: 'nwse-resize', left: -4, top: -4 }],
  ['ne', { cursor: 'nesw-resize', right: -4, top: -4 }],
  ['sw', { bottom: -4, cursor: 'nesw-resize', left: -4 }],
  ['se', { bottom: -4, cursor: 'nwse-resize', right: -4 }],
] as const;

/**
 * One member of a board, painted at its stacking rank while the DOM keeps the
 * board's stored order. A shape sits at its box, and a shape selected alone
 * shows four resize handles, `[data-board-handle]`. An arrow sits at the
 * board's origin with no size, so its component draws in board coordinates
 * from `useArrowPath`, and it has no handles. A selected member shows
 * `data-selected`.
 */
export function BoardShape({
  className,
  style,
  ...props
}: EditorElementProps<
  typeof BoardArrowPlugin | typeof BoardGeoPlugin | typeof BoardNotePlugin
> & {
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
  const selected = useElementSelected({ mode: 'node' });
  const alone = useElementSelected({ mode: 'object' });
  const arrow = layout?.kind === 'arrow';

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
        height: arrow ? 0 : layout?.box.height,
        left: arrow ? 0 : layout?.box.x,
        margin: 0,
        position: 'absolute',
        top: arrow ? 0 : layout?.box.y,
        width: arrow ? 0 : layout?.box.width,
        zIndex: layout?.rank,
      }}
    >
      {props.children}
      {alone &&
        !arrow &&
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

/**
 * Where the board arrow `element` draws: its two ends in board coordinates,
 * each bound end stopped at its shape's outline, and the path between them.
 * It follows a drag or resize of a bound shape, and a drag of the arrow
 * itself, from the view's preview, with no write, and changes only when the
 * arrow's stored ends or a bound shape's box change.
 */
export const useArrowPath = (element: Element): BoardArrowPath | undefined => {
  const view = useBoardViewContext();
  const key = view.keyOf(element);
  const subscribe = React.useCallback(
    (listener: () => void) => view.subscribeArrow(key, listener),
    [key, view]
  );
  const read = () => view.arrowPathOf(key);

  return React.useSyncExternalStore(subscribe, read, read);
};
