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
import type { BoardCorner, BoardShapeGrow } from './boardIndex.internal';
import type {
  BoardArrowPlugin,
  BoardFramePlugin,
  BoardGeoPlugin,
  BoardImagePlugin,
  BoardNotePlugin,
  BoardStrokePlugin,
  BoardTextPlugin,
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

function Handles({ id }: { id: string }) {
  const view = useBoardViewContext();
  const selectTool = useBoardView((state) => state.tool === 'select');
  const subscribeResize = React.useCallback(
    (listener: () => void) => view.subscribeResize(id, listener),
    [id, view]
  );
  const readResizing = () => view.resizeCorner(id) !== undefined;
  const resizing = React.useSyncExternalStore(
    subscribeResize,
    readResizing,
    readResizing
  );

  if (!selectTool && !resizing) return null;

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

function AloneHandles({ id }: { id: string }) {
  const alone = useEditorSelector(
    (editor) => editor.read.selection.nodes().length === 1
  );

  return alone && <Handles id={id} />;
}

const FIXED_STYLE_KEYS: ReadonlySet<string> = new Set([
  'alignSelf',
  'all',
  'blockSize',
  'bottom',
  'boxSizing',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'height',
  'inlineSize',
  'inset',
  'insetBlock',
  'insetBlockEnd',
  'insetBlockStart',
  'insetInline',
  'insetInlineEnd',
  'insetInlineStart',
  'justifySelf',
  'left',
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'placeSelf',
  'position',
  'right',
  'top',
  'width',
]);

const NOTE_FIXED_STYLE_KEYS: ReadonlySet<string> = new Set([
  ...FIXED_STYLE_KEYS,
  'maxBlockSize',
  'maxHeight',
  'minBlockSize',
  'minHeight',
]);

const TEXT_AUTO_FIXED_STYLE_KEYS: ReadonlySet<string> = new Set([
  ...NOTE_FIXED_STYLE_KEYS,
  'maxInlineSize',
  'maxWidth',
  'minInlineSize',
  'minWidth',
]);

const ROOT_FIXED_STYLE: React.CSSProperties = {
  alignSelf: 'start',
  bottom: 0,
  boxSizing: 'border-box',
  gridColumn: '1 / 2',
  gridRow: '1 / 2',
  height: '100%',
  justifySelf: 'stretch',
  left: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  position: 'relative',
  right: 0,
  top: 0,
  width: '100%',
};

const ROOT_NOTE_FIXED_STYLE: React.CSSProperties = {
  ...ROOT_FIXED_STYLE,
  height: 'auto',
  maxBlockSize: 'none',
  maxHeight: 'none',
  minHeight: '100%',
};

const ROOT_TEXT_AUTO_FIXED_STYLE: React.CSSProperties = {
  ...ROOT_NOTE_FIXED_STYLE,
  justifySelf: 'left',
  maxInlineSize: 'none',
  maxWidth: 'none',
  minWidth: '100%',
  width: 'max-content',
};

const WRAPPER_STYLE: React.CSSProperties = {
  alignItems: 'start',
  contain: 'size layout',
  display: 'grid',
  gridTemplateColumns: '100%',
  gridTemplateRows: '100%',
  margin: 0,
  position: 'absolute',
};

const rootStyle = (
  attrStyle: React.CSSProperties | undefined,
  propStyle: React.CSSProperties | undefined,
  grow: BoardShapeGrow
): React.CSSProperties => {
  const fixed =
    grow === 'both'
      ? ROOT_TEXT_AUTO_FIXED_STYLE
      : grow === 'height'
        ? ROOT_NOTE_FIXED_STYLE
        : ROOT_FIXED_STYLE;

  if (!attrStyle && !propStyle) return fixed;

  const merged =
    attrStyle && propStyle
      ? { ...attrStyle, ...propStyle }
      : (propStyle ?? attrStyle);

  if (!merged) return fixed;

  const blocked =
    grow === 'both'
      ? TEXT_AUTO_FIXED_STYLE_KEYS
      : grow === 'height'
        ? NOTE_FIXED_STYLE_KEYS
        : FIXED_STYLE_KEYS;

  if (!Object.keys(merged).some((key) => blocked.has(key))) {
    return { ...merged, ...fixed };
  }

  return {
    ...Object.fromEntries(
      Object.entries(merged).filter(([key]) => !blocked.has(key))
    ),
    ...fixed,
  };
};

/**
 * One member of a board, painted at its stacking rank while the DOM keeps the
 * board's stored order. A shape, frame or stroke sits at its box and,
 * selected alone while the view's tool is `select` or during a keyboard
 * resize, shows four resize handles, `[data-board-handle]`, each valued with
 * its `BoardCorner`. While keyboard resize is active, the shape carries
 * `data-board-resize-corner` set to the active `BoardCorner`. An
 * arrow sits at the board's origin with no size, so its component draws in
 * board coordinates through `BoardArrowPath`, `BoardArrowhead` and
 * `BoardArrowLabel`, and it has no handles. A frame takes
 * a press only on its edge or on a child marked `[data-board-frame-name]`,
 * such as its name, and a stroke only on its line, which its component draws
 * from `useStrokePath`. A selected member shows `data-selected`, one the
 * eraser will remove on release shows `data-erasing`, and the one under the
 * picking cursor that Space starts shows `data-board-cursor`. Those marks,
 * `className` and `style` go on the member's root, which fills a `div` that
 * carries the member's box, paint rank and drag `translate` (read inline
 * `left`, `top`, `width`, `height`, `z-index`, `translate`, `offsetLeft` and
 * `offsetTop` on `root.parentElement`). A note's root grows down past its
 * stored height when its text needs the room, and a free-text shape's root
 * grows in both width and height while `autoSize` is true (or down past its
 * stored height once resized), without changing stored size. A private
 * `@layer board-shapes` style rule makes the wrapper take no press and
 * restores `pointer-events: auto` on the root so host CSS layers and classes
 * still override `pointer-events`; to disable pointer input on an ancestor of
 * a board, set `inert`. The root's `position` is `relative`, so its absolute
 * children place against it, and `style` cannot change its `all`,
 * `boxSizing`, `height`, `inset`, `margin`, `position`, `width`, their sides
 * or logical forms, its grid placement and self-alignment properties,
 * `minHeight`, `minBlockSize`, `maxHeight` and `maxBlockSize` on a note or
 * free-text shape, or `minWidth`, `minInlineSize`, `maxWidth` and
 * `maxInlineSize` on auto-sized free text.
 */
export function BoardShape({
  className,
  ref,
  style,
  ...props
}: EditorElementProps<
  | typeof BoardArrowPlugin
  | typeof BoardFramePlugin
  | typeof BoardGeoPlugin
  | typeof BoardImagePlugin
  | typeof BoardNotePlugin
  | typeof BoardStrokePlugin
  | typeof BoardTextPlugin
> & {
  className?: string;
  style?: React.CSSProperties;
}) {
  useClaimEditableDOMCommit();
  const view = useBoardViewContext();
  const id = shapeIdOf(props.element);
  const subscribeShape = useShapeSubscription(view, id);
  const readPlacement = React.useMemo(
    () => createPlacementReader(view, id),
    [id, view]
  );
  const placement = React.useSyncExternalStore(
    subscribeShape,
    readPlacement,
    readPlacement
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
  const [resizeCorner] = React.useState(() => view.resizeCorner(id));
  const selected = useElementSelected({ mode: 'node' });
  const arrow = props.element.type === BOARD_ARROW_TYPE;
  const grow: BoardShapeGrow = placement?.grow ?? 'none';
  const rootRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRef(rootRef, ref);
  const observedRef = React.useRef<{
    element: HTMLElement;
    grow: BoardShapeGrow;
    id: string;
    stop: () => void;
    view: ReturnType<typeof useBoardViewContext>;
  } | null>(null);
  const arrowChannel = React.useMemo(
    () => (arrow ? createArrowChannel(view, id) : null),
    [arrow, id, view]
  );

  React.useLayoutEffect(() => {
    const target = grow !== 'none' ? rootRef.current : null;
    const held = observedRef.current;

    if (
      target === held?.element &&
      grow === held?.grow &&
      id === held?.id &&
      view === held?.view
    ) {
      return;
    }
    held?.stop();
    observedRef.current = target
      ? { element: target, grow, id, stop: view.observeText(id, target), view }
      : null;
    if (held && !target) held.view.dropText(held.id);
  });
  React.useLayoutEffect(
    () => () => {
      observedRef.current?.stop();
      observedRef.current = null;
    },
    []
  );

  React.useLayoutEffect(() => {
    if (!arrowChannel) return undefined;
    arrowChannel.sync();

    return view.subscribeArrow(id, arrowChannel.sync);
  }, [arrowChannel, placement?.key, id, view]);

  return (
    <div
      style={{
        ...WRAPPER_STYLE,
        height: arrow ? 0 : placement?.box.height,
        left: arrow ? 0 : placement?.box.x,
        top: arrow ? 0 : placement?.box.y,
        width: arrow ? 0 : placement?.box.width,
        zIndex: placement?.rank,
      }}
    >
      <EditorElement
        {...props}
        ref={composedRef}
        attributes={{
          ...props.attributes,
          'data-board-cursor': cursor ? '' : undefined,
          'data-board-resize-corner': resizeCorner,
          'data-board-shape': placement?.id,
          'data-erasing': erasing || undefined,
          'data-selected': selected || undefined,
          style: undefined,
        }}
        className={className}
        style={rootStyle(props.attributes.style, style, grow)}
      >
        {arrowChannel ? (
          <ArrowContext value={arrowChannel}>{props.children}</ArrowContext>
        ) : (
          props.children
        )}
        {selected && !arrow && <AloneHandles id={id} />}
      </EditorElement>
    </div>
  );
}

const useShapeSubscription = (
  view: ReturnType<typeof useBoardViewContext>,
  id: string
) =>
  React.useCallback(
    (listener: () => void) => view.subscribeShape(id, listener),
    [id, view]
  );

const createPlacementReader = (
  view: ReturnType<typeof useBoardViewContext>,
  id: string
) => {
  let held: ReturnType<typeof view.placementOf>;

  return () => {
    const next = view.placementOf(id);

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
  const subscribe = useShapeSubscription(view, id);
  const read = () => view.strokePathOf(id);

  return React.useSyncExternalStore(subscribe, read, read);
};
