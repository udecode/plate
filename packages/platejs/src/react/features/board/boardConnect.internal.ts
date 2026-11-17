import {
  BaseBoardArrowPlugin,
  type BoardArrowAnchor,
  type BoardArrowEnd,
  type BoardArrowSide,
  type BoardMemberEntry,
  type BoardPlace,
} from '../../../features/board/lib';
import {
  type BoardBox,
  type BoardShapeLayout,
  sameBox,
} from './boardIndex.internal';
import { anchorIn } from './boardPick.internal';
import { previewArrowLine, previewArrowMark } from './boardPreview.internal';
import type { BoardStyle, BoardViewCore } from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

type ConnectEnd = Readonly<{
  keyPoint: BoardPlace;
  bound?: Readonly<{ anchor: BoardArrowAnchor; box: BoardBox; shape: string }>;
}>;

type Connect = {
  end?: ConnectEnd;
  line: SVGLineElement;
  mark: SVGCircleElement;
  side: BoardArrowSide;
  start: ConnectEnd;
  style: BoardStyle;
};

const MIDDLE: BoardArrowAnchor = [0.5, 0.5];

const pointIn = (box: BoardBox, [across, down]: BoardArrowAnchor) => ({
  x: box.x + across * box.width,
  y: box.y + down * box.height,
});

const middleOf = ({ box, id }: BoardShapeLayout): ConnectEnd => ({
  bound: { anchor: MIDDLE, box, shape: id },
  keyPoint: pointIn(box, MIDDLE),
});

const endAt = (
  keyPoint: BoardPlace,
  shape: BoardShapeLayout | undefined
): ConnectEnd =>
  shape
    ? {
        bound: {
          anchor: anchorIn(keyPoint, shape.box),
          box: shape.box,
          shape: shape.id,
        },
        keyPoint,
      }
    : { keyPoint };

const resolvedOf = ({ bound, keyPoint }: ConnectEnd): BoardArrowEnd =>
  bound
    ? {
        ...pointIn(bound.box, bound.anchor),
        anchor: bound.anchor,
        shape: bound.shape,
      }
    : keyPoint;

const writtenOf = ({ bound, keyPoint }: ConnectEnd) =>
  bound ? { anchor: bound.anchor, shape: bound.shape } : keyPoint;

const FLOAT_SLOP = 1e-6;

const drawsNoLength = ({
  end,
  start,
}: Readonly<{ end: BoardPlace; start: BoardPlace }>) =>
  Math.hypot(end.x - start.x, end.y - start.y) < FLOAT_SLOP;

export const attachBoardConnect = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;
  let connect: Connect | null = null;

  const bindable = (id: string | undefined) => {
    const layout = id === undefined ? undefined : index.byId(id);

    return layout?.kind === 'arrow' ? undefined : layout;
  };

  const startShape = () => connect?.start.bound?.shape;

  const aimable = (entry: BoardMemberEntry) =>
    entry.kind === 'arrow' ||
    (connect?.side === 'end' && entry.id === startShape())
      ? undefined
      : index.layout(entry.key);

  const draw = ({ end, line, mark, start }: Connect) => {
    const a = start.keyPoint;
    const b = (end ?? start).keyPoint;

    mark.setAttribute('cx', String(a.x));
    mark.setAttribute('cy', String(a.y));
    line.setAttribute('x1', String(a.x));
    line.setAttribute('y1', String(a.y));
    line.setAttribute('x2', String(b.x));
    line.setAttribute('y2', String(b.y));
  };

  const followed = (end: ConnectEnd | undefined) => {
    const bound = end?.bound;

    if (!bound) return end;

    const box = bindable(bound.shape)?.box;

    if (!box) return undefined;

    return sameBox(box, bound.box)
      ? end
      : { bound: { ...bound, box }, keyPoint: pointIn(box, bound.anchor) };
  };

  const follow = () => {
    if (!connect) return;

    const start = followed(connect.start);

    if (!core.writable() || !start) {
      core.cancelInteraction();

      return;
    }
    connect.start = start;
    connect.end = followed(connect.end);
    draw(connect);
  };

  const sayConnecting = ({ start }: Connect) =>
    core.voice.connecting(bindable(start.bound?.shape)?.key ?? null);

  const sayPlaced = (placing: Connect) => {
    const { side } = placing;
    const placed = placing[side];
    const target = bindable(placed?.bound?.shape);

    if (placed?.bound && target) {
      core.voice.aim(target.key, placed.bound.anchor, side);
    } else if (placed && !placed.bound) core.voice.free(placed.keyPoint, side);
    else sayConnecting(placing);
  };

  const aimAt = (target: BoardShapeLayout) => {
    if (!connect) return;
    connect[connect.side] = middleOf(target);
    draw(connect);
    if (!core.inView(target)) {
      core.reveal([index.entries().findIndex(({ key }) => key === target.key)]);
    }
    sayPlaced(connect);
  };

  // A window that loses focus fires focusout with no relatedTarget and keeps
  // its active element, so the connect goes on when the window comes back.
  const onFocusOut = ({ relatedTarget }: FocusEvent) => {
    const next =
      relatedTarget instanceof Node ? relatedTarget : activeElementOf(host);

    if (connect && !host.contains(next)) core.cancelInteraction();
  };

  host.addEventListener('focusout', onFocusOut);

  const aimFrom = () =>
    connect
      ? (bindable(connect[connect.side]?.bound?.shape) ??
        bindable(startShape()))
      : undefined;

  const begin = (start: ConnectEnd, side: BoardArrowSide) => {
    const line = previewArrowLine(
      core.zoomLayer(),
      start.keyPoint,
      index.entries().length + 1
    );
    const next: Connect = {
      line,
      mark: previewArrowMark(line, start.keyPoint),
      side,
      start,
      style: core.state().nextStyle,
    };

    core.replaceInteraction({
      cancel: () => {
        next.line.ownerSVGElement?.remove();
        if (connect === next) connect = null;
        core.voice.repeatSelection();
      },
      follow,
      kind: 'connect',
      startShape: () => next.start.bound?.shape,
    });
    connect = next;
  };

  return {
    active: () => !!connect,
    aimAt,
    aimable,
    aimFrom,
    candidates: () => index.entries().flatMap((entry) => aimable(entry) ?? []),
    detach: () => {
      host.removeEventListener('focusout', onFocusOut);
    },
    finish: () => {
      if (!connect) return;
      if (connect.side === 'start') {
        connect.side = 'end';
        sayConnecting(connect);

        return;
      }

      const { end, start, style } = connect;
      const drawn =
        end &&
        index.resolveArrow({ end: resolvedOf(end), start: resolvedOf(start) });

      if (!end || !drawn || drawsNoLength(drawn)) {
        sayConnecting(connect);

        return;
      }
      core.cancelInteraction();
      core.insertAndSelect((tx) =>
        tx.plugin(BaseBoardArrowPlugin).insert(
          {
            ...core.styleFor(BaseBoardArrowPlugin.name, style),
            end: writtenOf(end),
            start: writtenOf(start),
          },
          { board: core.board }
        )
      );
    },
    move: (by: BoardPlace) => {
      if (!connect) return;

      const { side } = connect;
      const { x, y } = (connect[side] ?? connect.start).keyPoint;
      const keyPoint = { x: x + by.x, y: y + by.y };

      connect[side] = endAt(
        keyPoint,
        core.shapeAt(keyPoint, side === 'end' ? startShape() : undefined)
      );
      draw(connect);
      sayPlaced(connect);
    },
    sayPlaced: () => {
      if (connect) sayPlaced(connect);
    },
    searchFrom: () => {
      if (!connect) return undefined;

      const { bound, keyPoint } = connect[connect.side] ?? connect.start;
      const box = bound?.anchor.every((part) => part === 0.5)
        ? bindable(bound.shape)?.box
        : undefined;

      return box ?? { ...keyPoint, height: 0, width: 0 };
    },
    start: (from: BoardShapeLayout) => {
      begin(middleOf(from), 'end');
      core.voice.connecting(from.key);
    },
    startFree: () => {
      const center = core.viewCenter();
      const at = { x: Math.round(center.x), y: Math.round(center.y) };

      const shape = core.shapeAt(at);

      begin(endAt(at, shape), 'start');
      core.voice.starting(at, shape?.key ?? null);
    },
  };
};
