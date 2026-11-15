import {
  BaseBoardArrowPlugin,
  type BoardArrowAnchor,
  type BoardMemberEntry,
  type BoardPlace,
} from '../../../features/board/lib';
import {
  type BoardBox,
  type BoardShapeLayout,
  sameBox,
} from './boardIndex.internal';
import { anchorIn } from './boardPick.internal';
import { previewArrowLine } from './boardPreview.internal';
import type { BoardViewCore } from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

type ConnectEnd = Readonly<{
  keyPoint: BoardPlace;
  bound?: Readonly<{ anchor: BoardArrowAnchor; box: BoardBox; shape: string }>;
}>;

type Connect = { end?: ConnectEnd; line: SVGLineElement; start: string };

const pointIn = (box: BoardBox, [across, down]: BoardArrowAnchor) => ({
  x: box.x + across * box.width,
  y: box.y + down * box.height,
});

const centerOf = (box: BoardBox) => pointIn(box, [0.5, 0.5]);

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

  const aimable = (entry: BoardMemberEntry) =>
    entry.id === connect?.start || entry.kind === 'arrow'
      ? undefined
      : index.layout(entry.key);

  const draw = ({ end, line, start }: Connect) => {
    const from = bindable(start);

    if (!from) return;

    const a = centerOf(from.box);
    const b = end?.keyPoint ?? a;

    line.setAttribute('x1', String(a.x));
    line.setAttribute('y1', String(a.y));
    line.setAttribute('x2', String(b.x));
    line.setAttribute('y2', String(b.y));
  };

  const follow = () => {
    if (!connect) return;
    if (!core.writable() || !bindable(connect.start)) {
      core.cancelInteraction();

      return;
    }
    const bound = connect.end?.bound;
    const box = bound && bindable(bound.shape)?.box;

    if (bound && !box) connect.end = undefined;
    else if (bound && box && !sameBox(box, bound.box)) {
      connect.end = {
        bound: { ...bound, box },
        keyPoint: pointIn(box, bound.anchor),
      };
    }
    draw(connect);
  };

  const sayEnd = ({ end, start }: Connect) => {
    const target = bindable(end?.bound?.shape);
    const from = bindable(start);

    if (end?.bound && target) core.voice.aim(target.key, end.bound.anchor);
    else if (end && !end.bound) core.voice.free(end.keyPoint);
    else if (from) core.voice.connecting(from.key);
  };

  const aimAt = (target: BoardShapeLayout) => {
    if (!connect) return;
    connect.end = {
      bound: { anchor: [0.5, 0.5], box: target.box, shape: target.id },
      keyPoint: centerOf(target.box),
    };
    draw(connect);
    if (!core.inView(target)) {
      core.reveal([index.entries().findIndex(({ key }) => key === target.key)]);
    }
    sayEnd(connect);
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
    bindable(connect?.end?.bound?.shape) ?? bindable(connect?.start);

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

      const { end, start } = connect;
      const from = bindable(start);
      const drawn =
        end &&
        from &&
        index.resolveArrow({
          end: end.bound
            ? {
                ...pointIn(end.bound.box, end.bound.anchor),
                anchor: end.bound.anchor,
                shape: end.bound.shape,
              }
            : end.keyPoint,
          start: { ...centerOf(from.box), anchor: [0.5, 0.5], shape: start },
        });

      if (!end || (drawn && drawsNoLength(drawn))) {
        if (from) core.voice.connecting(from.key);

        return;
      }
      core.cancelInteraction();
      core.insertAndSelect((tx) =>
        tx.plugin(BaseBoardArrowPlugin).insert(
          {
            end: end.bound
              ? { anchor: end.bound.anchor, shape: end.bound.shape }
              : end.keyPoint,
            start,
          },
          { board: core.board }
        )
      );
    },
    move: (by: BoardPlace) => {
      const from = bindable(connect?.start);

      if (!connect || !from) return;

      const { x, y } = connect.end?.keyPoint ?? centerOf(from.box);
      const keyPoint = { x: x + by.x, y: y + by.y };
      const shape = core.shapeAt(keyPoint, connect.start);

      connect.end = shape
        ? {
            bound: {
              anchor: anchorIn(keyPoint, shape.box),
              box: shape.box,
              shape: shape.id,
            },
            keyPoint,
          }
        : { keyPoint };
      draw(connect);
      sayEnd(connect);
    },
    sayEnd: () => {
      if (connect) sayEnd(connect);
    },
    searchFrom: () => {
      const end = connect?.end;
      const middle = end?.bound?.anchor.every((part) => part === 0.5);

      return !end || middle
        ? aimFrom()?.box
        : { ...end.keyPoint, height: 0, width: 0 };
    },
    start: (from: BoardShapeLayout) => {
      const next: Connect = {
        line: previewArrowLine(
          core.zoomLayer(),
          centerOf(from.box),
          index.entries().length + 1
        ),
        start: from.id,
      };

      core.replaceInteraction({
        cancel: () => {
          next.line.ownerSVGElement?.remove();
          if (connect === next) connect = null;
          core.voice.repeatSelection();
        },
        follow,
        kind: 'connect',
        start: from.id,
      });
      connect = next;
      core.voice.connecting(from.key);
    },
  };
};
