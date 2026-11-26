import * as React from 'react';

import type { Element } from '../../../core';
import type { BoardStrokePath } from '../../../features/board/lib';
import { BOARD_ARROW_TYPE } from '../../../features/board/lib/boardArrow.internal';
import { shapeIdOf } from '../../../features/board/lib/boardCopy.internal';
import {
  EditorElement,
  type EditorElementProps,
  useComposedRef,
  useEditorSelector,
  useElementSelected,
} from '../../core';
import { useClaimEditableDOMCommit } from '../../plite-react';
import type { BoardCorner } from './boardIndex.internal';
import type {
  BoardArrowPlugin,
  BoardFramePlugin,
  BoardGeoPlugin,
  BoardImagePlugin,
  BoardNotePlugin,
  BoardStrokePlugin,
} from './BoardPlugin';
import { useBoardView } from './BoardSurface';
import {
  type BoardArrowPath as ArrowPath,
  BoardViewContext,
  useBoardViewContext,
} from './boardView.internal';

const CORNERS: ReadonlyArray<readonly [BoardCorner, React.CSSProperties]> = [
  ['topLeft', { cursor: 'nwse-resize', left: -4, top: -4 }],
  ['topRight', { cursor: 'nesw-resize', right: -4, top: -4 }],
  ['bottomLeft', { bottom: -4, cursor: 'nesw-resize', left: -4 }],
  ['bottomRight', { bottom: -4, cursor: 'nwse-resize', right: -4 }],
];

function Handles() {
  const resizes = useBoardView((view) => view.tool === 'select');

  if (!resizes) return null;

  return CORNERS.map(([corner, place]) => (
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
  ));
}

function AloneHandles() {
  const alone = useEditorSelector(
    (editor) => editor.read.selection.nodes().length === 1
  );

  return alone && <Handles />;
}

/**
 * One member of a board, painted at its stacking rank while the DOM keeps the
 * board's stored order. A shape, frame or stroke sits at its box and,
 * selected alone while the view's tool is `select`, shows four resize
 * handles, `[data-board-handle]`, each valued with its `BoardCorner`. An
 * arrow sits at the board's origin with no size, so its component draws in
 * board coordinates through `BoardArrowPath`, `BoardArrowhead` and
 * `BoardArrowLabel`, and it has no handles. A frame takes
 * a press only on its edge or on a child marked `[data-board-frame-name]`,
 * such as its name, and a stroke only on its line, which its component draws
 * from `useStrokePath`. A selected member shows `data-selected`, one the
 * eraser will remove on release shows `data-erasing`, and the one under the
 * picking cursor that Space starts shows `data-board-cursor`.
 */
export function BoardShape({
  className,
  style,
  ...props
}: EditorElementProps<
  | typeof BoardArrowPlugin
  | typeof BoardFramePlugin
  | typeof BoardGeoPlugin
  | typeof BoardImagePlugin
  | typeof BoardNotePlugin
  | typeof BoardStrokePlugin
> & {
  className?: string;
  style?: React.CSSProperties;
}) {
  useClaimEditableDOMCommit();
  const view = useBoardViewContext();
  const id = shapeIdOf(props.element);
  const readLayout = React.useMemo(
    () => createLayoutReader(view, id),
    [id, view]
  );
  const layout = React.useSyncExternalStore(
    view.subscribeShapes,
    readLayout,
    readLayout
  );
  const subscribeErasing = React.useCallback(
    (listener: () => void) => view.subscribeErasing(id, listener),
    [id, view]
  );
  const readErasing = () => view.erasing(id);
  const erasing = React.useSyncExternalStore(
    subscribeErasing,
    readErasing,
    readErasing
  );
  const [cursor] = React.useState(() => view.isCursor(id));
  const selected = useElementSelected({ mode: 'node' });
  const arrow = props.element.type === BOARD_ARROW_TYPE;
  const arrowChannel = React.useMemo(
    () => (arrow ? createArrowChannel(view, id) : null),
    [arrow, id, view]
  );

  React.useLayoutEffect(() => {
    if (!arrowChannel) return undefined;
    arrowChannel.sync();

    return view.subscribeArrow(id, arrowChannel.sync);
  }, [arrowChannel, layout?.key, id, view]);

  return (
    <EditorElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-board-cursor': cursor ? '' : undefined,
        'data-board-shape': layout?.id,
        'data-erasing': erasing || undefined,
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
      {arrowChannel ? (
        <ArrowContext value={arrowChannel}>{props.children}</ArrowContext>
      ) : (
        props.children
      )}
      {selected && !arrow && <AloneHandles />}
    </EditorElement>
  );
}

const createLayoutReader = (
  view: ReturnType<typeof useBoardViewContext>,
  id: string
) => {
  let held: ReturnType<typeof view.layoutOf>;

  return () => {
    const next = view.layoutOf(id);

    if (
      next?.kind === 'arrow' &&
      held?.kind === 'arrow' &&
      held.key === next.key &&
      held.rank === next.rank
    ) {
      return held;
    }
    held = next;

    return next;
  };
};

const ArrowContext = React.createContext<ReturnType<
  typeof createArrowChannel
> | null>(null);

const useArrowChannel = (component: string) => {
  const view = React.useContext(BoardViewContext);
  const channel = React.useContext(ArrowContext);

  if (!channel || channel.view !== view) {
    throw new Error(
      `${component} must be used inside a BoardShape for an arrow`
    );
  }

  return channel;
};

const endTransform = ({ end, start }: ArrowPath) =>
  `translate(${end.x} ${end.y}) rotate(${(Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI})`;

const createArrowChannel = (
  view: ReturnType<typeof useBoardViewContext>,
  id: string
) => {
  const read = () => view.arrowPathOf(id);
  const writers = new Set<(drawn: ArrowPath | undefined) => void>();
  const bind =
    <T,>(
      apply: (node: T, drawn: ArrowPath | undefined) => void
    ): React.RefCallback<T> =>
    (node) => {
      if (!node) return undefined;
      let applied = read();
      const write = (drawn: ArrowPath | undefined) => {
        if (drawn === applied) return;
        applied = drawn;
        apply(node, drawn);
      };

      writers.add(write);
      apply(node, applied);

      return () => {
        writers.delete(write);
      };
    };

  return {
    head: bind<SVGGElement>((node, drawn) => {
      if (drawn) {
        node.setAttribute('transform', endTransform(drawn));
        node.removeAttribute('display');
      } else {
        node.removeAttribute('transform');
        node.setAttribute('display', 'none');
      }
    }),
    label: bind<HTMLDivElement>((node, drawn) => {
      if (drawn) {
        node.style.left = `${(drawn.start.x + drawn.end.x) / 2}px`;
        node.style.top = `${(drawn.start.y + drawn.end.y) / 2}px`;
        node.hidden = false;
      } else {
        node.hidden = true;
        node.style.left = '';
        node.style.top = '';
      }
    }),
    path: bind<SVGPathElement>((node, drawn) => {
      if (drawn) node.setAttribute('d', drawn.path);
      else node.removeAttribute('d');
    }),
    read,
    sync: () => {
      const drawn = read();

      for (const write of writers) write(drawn);
    },
    view,
  };
};

/**
 * An SVG `<path>` inside an arrow's `BoardShape`, whose `d` runs between the
 * arrow's ends in board coordinates. It follows the arrow without a render, and
 * has no `d` until the arrow has a drawing.
 */
export function BoardArrowPath({
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<'path'>, 'd'>) {
  const channel = useArrowChannel('BoardArrowPath');
  const [drawn] = React.useState(channel.read);

  return (
    <path {...props} d={drawn?.path} ref={useComposedRef(channel.path, ref)} />
  );
}

/**
 * An SVG `<g>` inside an arrow's `BoardShape` that draws its children at the
 * arrow's end, turned so that the positive x axis points away from the arrow's
 * start. It follows the arrow without a render, and is hidden with
 * `display="none"` until the arrow has a drawing.
 */
export function BoardArrowhead({
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<'g'>, 'display' | 'transform'>) {
  const channel = useArrowChannel('BoardArrowhead');
  const [drawn] = React.useState(channel.read);

  return (
    <g
      {...props}
      display={drawn ? undefined : 'none'}
      ref={useComposedRef(channel.head, ref)}
      transform={drawn ? endTransform(drawn) : undefined}
    />
  );
}

/**
 * A `<div>` inside an arrow's `BoardShape`, for the arrow's text, with its
 * `left` and `top` at the arrow's middle in board coordinates. It sets
 * `position: absolute` and a `translate` that centers it on that point,
 * unless `style` sets either one. It follows the arrow without a render, and
 * is `hidden` until the arrow has a drawing.
 */
export function BoardArrowLabel({
  ref,
  style,
  ...props
}: Omit<React.ComponentPropsWithRef<'div'>, 'hidden' | 'style'> & {
  style?: Omit<React.CSSProperties, 'left' | 'top'>;
}) {
  const channel = useArrowChannel('BoardArrowLabel');
  const [drawn] = React.useState(channel.read);

  return (
    <div
      data-board-arrow-label=""
      {...props}
      hidden={!drawn}
      ref={useComposedRef(channel.label, ref)}
      style={{
        position: 'absolute',
        translate: '-50% -50%',
        ...style,
        ...(drawn
          ? {
              left: (drawn.start.x + drawn.end.x) / 2,
              top: (drawn.start.y + drawn.end.y) / 2,
            }
          : undefined),
      }}
    />
  );
}

/**
 * Where the board arrow `element` draws: its two ends in board coordinates,
 * each bound end stopped at its shape's outline, and the path between them.
 * It follows a drag or resize of a bound shape, and a drag of the arrow
 * itself, from the view's preview, with no write, and changes only when the
 * arrow's stored ends or a bound shape's box change.
 */
export const useArrowPath = (element: Element): ArrowPath | undefined => {
  const view = useBoardViewContext();
  const id = shapeIdOf(element);
  const subscribe = React.useCallback(
    (listener: () => void) => view.subscribeArrow(id, listener),
    [id, view]
  );
  const read = () => view.arrowPathOf(id);

  return React.useSyncExternalStore(subscribe, read, read);
};

/**
 * Where the board stroke `element` draws its line: an SVG path within a box
 * of the stroke's stored size, which a component scales to the stroke's box,
 * so a resize preview stretches it until the release redraws it. It stays the
 * same object while the stroke's points and size stay the same, so a move
 * does not redraw it.
 */
export const useStrokePath = (
  element: Element
): BoardStrokePath | undefined => {
  const view = useBoardViewContext();
  const id = shapeIdOf(element);
  const read = () => view.strokePathOf(id);

  return React.useSyncExternalStore(view.subscribeShapes, read, read);
};
