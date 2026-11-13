import type { NodeKey } from '../../../core';
import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardStrokePlugin,
  type BoardArrowEndInput,
  type BoardPlace,
} from '../../../features/board/lib';
import { BOARD_FRAME_SIZE } from '../../../features/board/lib/boardFrame.internal';
import type { BoardInkPoint } from '../../../features/board/lib/boardStroke.internal';
import {
  type BoardBox,
  type BoardShapeLayout,
  sameBox,
  spanOf,
} from './boardIndex.internal';
import { simulatedPressure, strokeOutline } from './boardInk.internal';
import {
  placeElement,
  previewArrowLine,
  previewCopy,
  previewFrameOutline,
  previewSelectBox,
  previewStroke,
} from './boardPreview.internal';
import type { BoardCamera, BoardViewCore } from './boardView.internal';

type Corner = 'ne' | 'nw' | 'se' | 'sw';

type Gesture = Readonly<{ pointerId: number }> &
  (
    | {
        kind: 'arrow';
        from: BoardPlace;
        line: SVGLineElement;
        pointer: BoardPlace;
        press: BoardPlace;
        start: BoardArrowEndInput;
      }
    | {
        kind: 'box';
        base: readonly NodeKey[];
        from: BoardPlace;
        outline: HTMLElement;
        pointer: BoardPlace;
      }
    | {
        kind: 'frame';
        from: BoardPlace;
        outline: HTMLElement;
        pointer: BoardPlace;
        press: BoardPlace;
      }
    | {
        kind: 'move';
        carried: ReadonlySet<string>;
        copy: boolean;
        delta: BoardPlace;
        elements: readonly HTMLElement[];
        grab: BoardPlace;
        ids: readonly string[];
        pointer: BoardPlace;
      }
    | {
        kind: 'pen';
        path: SVGPathElement;
        points: BoardInkPoint[];
        pointer: BoardPlace;
      }
    | {
        kind: 'pan';
        camera: BoardCamera;
        pointer: BoardPlace;
        start: BoardPlace;
      }
    | {
        kind: 'resize';
        corner: Corner;
        element: HTMLElement;
        grab: BoardPlace;
        id: string;
        pointer: BoardPlace;
        rect: BoardBox;
        restore: string;
        start: BoardBox;
      }
  );

const CORNERS: Readonly<Record<string, Corner>> = {
  ne: 'ne',
  nw: 'nw',
  se: 'se',
  sw: 'sw',
};

const MIN_SHAPE_SIZE = 8;
const CLICK_SLOP_PX = 8;

const dragged = (press: BoardPlace, pointer: BoardPlace) =>
  Math.hypot(pointer.x - press.x, pointer.y - press.y) >= CLICK_SLOP_PX;

const frameToolBox = (
  from: BoardPlace,
  to: BoardPlace,
  drag: boolean
): BoardBox => {
  if (!drag) {
    const { height, width } = BOARD_FRAME_SIZE;

    return { height, width, x: to.x - width / 2, y: to.y - height / 2 };
  }

  const span = spanOf({ end: to, start: from });

  return {
    ...span,
    height: Math.max(MIN_SHAPE_SIZE, span.height),
    width: Math.max(MIN_SHAPE_SIZE, span.width),
  };
};

const holds = (outer: BoardBox, inner: BoardBox) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

const fractionOf = (offset: number, length: number) =>
  length > 0 ? Math.min(1, Math.max(0, offset / length)) : 0.5;

const resized = (start: BoardBox, corner: Corner, dx: number, dy: number) => {
  const west = corner === 'nw' || corner === 'sw';
  const north = corner === 'ne' || corner === 'nw';
  const width = Math.max(MIN_SHAPE_SIZE, start.width + (west ? -dx : dx));
  const height = Math.max(MIN_SHAPE_SIZE, start.height + (north ? -dy : dy));

  return {
    height,
    width,
    x: west ? start.x + start.width - width : start.x,
    y: north ? start.y + start.height - height : start.y,
  };
};

const PRESS_PRESSURE = 0.5;

const addPenPoint = (
  points: BoardInkPoint[],
  at: BoardPlace,
  event: PointerEvent
) => {
  const last = points.at(-1);
  const distance = last ? Math.hypot(at.x - last[0], at.y - last[1]) : 0;

  if (last && distance === 0) return;

  let pressure = PRESS_PRESSURE;

  if (event.pointerType === 'pen') {
    pressure = Math.min(1, Math.max(0, event.pressure));
  } else if (last) {
    pressure = simulatedPressure(last[2], distance);
  }
  points.push([at.x, at.y, pressure]);
};

const elementOf = (host: HTMLElement, id: string) =>
  host.querySelector<HTMLElement>(`[data-board-shape="${CSS.escape(id)}"]`);

/**
 * The board's pointer gestures on `host`: pan, the selection box, move, copy
 * drag, resize, the pen's line and the other tools' drags, each previewed with
 * no write and committed once on release.
 */
export const attachBoardGestures = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;
  const previewRank = () => index.entries().length + 1;

  let gesture: Gesture | null = null;
  let swallowClick = false;
  let pressed: BoardShapeLayout | undefined;
  let spaceHeld = false;

  const drawPen = ({ path, points }: Extract<Gesture, { kind: 'pen' }>) => {
    path.setAttribute('d', strokeOutline(points, false));
  };

  const pan = (pointer: BoardPlace, pointerId: number): Gesture => ({
    camera: core.state().camera,
    kind: 'pan',
    pointer,
    pointerId,
    start: pointer,
  });

  const pick = (keys: readonly NodeKey[]) => {
    if (keys.length > 0) core.select(keys);
    else core.deselectOnBoard();
    core.voice.hold(true);
  };

  const follow = () => {
    if (!gesture || gesture.kind === 'pan' || gesture.kind === 'pen') return;

    const at = core.boardPointAt(gesture.pointer);

    if (gesture.kind === 'box') {
      const span = spanOf({ end: at, start: gesture.from });
      const keys = new Set(gesture.base.filter((key) => index.layout(key)));

      placeElement(gesture.outline, span);
      for (const { key } of index.search({
        maxX: span.x + span.width,
        maxY: span.y + span.height,
        minX: span.x,
        minY: span.y,
      })) {
        const layout = index.layout(key);

        if (layout && holds(span, layout.box)) keys.add(key);
      }

      const selected = core.selectedShapes();

      if (
        keys.size !== selected.length ||
        selected.some(({ key }) => !keys.has(key))
      ) {
        pick([...keys]);
      }

      return;
    }

    if (gesture.kind === 'arrow') {
      gesture.line.setAttribute('x2', String(at.x));
      gesture.line.setAttribute('y2', String(at.y));

      return;
    }

    if (gesture.kind === 'frame') {
      placeElement(gesture.outline, spanOf({ end: at, start: gesture.from }));

      return;
    }

    const dx = at.x - gesture.grab.x;
    const dy = at.y - gesture.grab.y;

    if (gesture.kind === 'move') {
      const { carried, copy } = gesture;
      const delta = { x: dx, y: dy };

      gesture.delta = delta;
      for (const shape of gesture.elements) {
        shape.style.translate = `${dx}px ${dy}px`;
      }
      if (!copy) {
        index.previewArrows(
          [...carried],
          (id) => {
            const box = carried.has(id) ? index.byId(id)?.box : undefined;

            return box && { ...box, x: box.x + dx, y: box.y + dy };
          },
          delta
        );
      }
    } else {
      const { id } = gesture;
      const rect = resized(gesture.start, gesture.corner, dx, dy);

      gesture.rect = rect;
      placeElement(gesture.element, rect);
      index.previewArrows(
        [id],
        (target) => (target === id ? rect : undefined),
        {
          x: 0,
          y: 0,
        }
      );
    }
  };

  const cancel = () => {
    const done = gesture;

    if (!done) return false;
    gesture = null;
    core.voice.release();
    if (done.kind === 'move') {
      for (const shape of done.elements) {
        if (done.copy) shape.remove();
        else shape.style.translate = '';
      }
    } else if (done.kind === 'resize') {
      done.element.style.cssText = done.restore;
    } else if (done.kind === 'arrow') {
      done.line.ownerSVGElement?.remove();
    } else if (done.kind === 'box' || done.kind === 'frame') {
      done.outline.remove();
    } else if (done.kind === 'pen') {
      done.path.ownerSVGElement?.remove();
    }
    index.clearPreview();

    return true;
  };

  const arrowEndAt = (at: BoardPlace): BoardArrowEndInput => {
    const top = core.shapeAt(at);

    if (!top) return at;

    const { box } = top;

    return {
      anchor: [
        fractionOf(at.x - box.x, box.width),
        fractionOf(at.y - box.y, box.height),
      ],
      shape: top.id,
    };
  };

  const release = () => {
    const done = gesture;

    if (!done || done.kind === 'pan') {
      gesture = null;
      core.voice.release();

      return;
    }
    cancel();
    if (done.kind === 'box') return;
    if (done.kind === 'pen') {
      core.write((tx) =>
        tx
          .plugin(BaseBoardStrokePlugin)
          .insert({ points: done.points }, { board: core.board })
      );
    } else if (done.kind === 'arrow') {
      if (dragged(done.press, done.pointer)) {
        const end = arrowEndAt(core.boardPointAt(done.pointer));

        core.insertWith((tx) =>
          tx
            .plugin(BaseBoardArrowPlugin)
            .insert({ end, start: done.start }, { board: core.board })
        );
      }
    } else if (done.kind === 'frame') {
      const box = frameToolBox(
        done.from,
        core.boardPointAt(done.pointer),
        dragged(done.press, done.pointer)
      );

      core.insertWith((tx) =>
        tx.plugin(BaseBoardFramePlugin).insert(box, { board: core.board })
      );
    } else if (done.kind === 'move') {
      const { carried, copy, delta, ids } = done;

      if (delta.x === 0 && delta.y === 0) return;
      if (!copy) {
        core.commit({ delta, ids, kind: 'move' });

        return;
      }

      const boxes = [...carried].flatMap((id) => {
        const layout = index.byId(id);

        return layout ? [layout.box] : [];
      });
      const slice = core.slice(ids);

      if (slice && boxes.length > 0) {
        core.land(slice, {
          x: Math.min(...boxes.map(({ x }) => x)) + delta.x,
          y: Math.min(...boxes.map(({ y }) => y)) + delta.y,
        });
      }
    } else if (!sameBox(done.rect, done.start)) {
      core.commit({ id: done.id, kind: 'resize', rect: done.rect });
    }
  };

  const pressTargetAt = (
    target: globalThis.Element,
    at: BoardPlace,
    onHandle: boolean
  ) => {
    const hit = target.closest<HTMLElement>('[data-board-shape]');
    const shape = hit ? index.byId(hit.dataset.boardShape ?? '') : undefined;

    if (onHandle || target.closest('[data-board-frame-name]')) {
      return { element: hit, shape };
    }

    const under = core.shapeAt(at);

    // A line reaches past its element, so it can take a press on the shape
    // under it.
    if (shape?.holdsText && !(under?.ink && under.rank > shape.rank)) {
      return { element: hit, shape };
    }

    return {
      element: under === shape ? hit : under && elementOf(host, under.id),
      shape: under,
    };
  };

  const onPointerDown = (event: PointerEvent) => {
    if (gesture) return;
    pressed = undefined;
    swallowClick = false;
    if (event.button > 1 || !(event.target instanceof Element)) return;
    if (event.target.closest('[data-board-toolbar]')) return;

    core.measure();

    const { pointerId } = event;
    const { nextStyle, tool } = core.state();
    const pointer = { x: event.clientX, y: event.clientY };
    const at = core.boardPointAt(pointer);
    const handle =
      CORNERS[
        event.target.closest<HTMLElement>('[data-board-handle]')?.dataset
          .boardHandle ?? ''
      ];
    const { element: shapeElement, shape } = pressTargetAt(
      event.target,
      at,
      !!handle
    );
    const draws = tool === 'arrow' || tool === 'pen';
    const typing = core.writable() && !!core.editedShape();

    if (event.button === 1 || (spaceHeld && !typing)) {
      gesture = pan(pointer, pointerId);
    } else if (!draws && shapeElement && shape && handle) {
      if (!core.writable()) return;
      gesture = {
        corner: handle,
        element: shapeElement,
        grab: at,
        id: shape.id,
        kind: 'resize',
        pointer,
        pointerId,
        rect: shape.box,
        restore: shapeElement.style.cssText,
        start: shape.box,
      };
    } else if (!draws && shapeElement && shape) {
      pressed = shape;
      if (core.editedShape()?.key === shape.key) return;

      const selected = core.selectedShapes();
      const held = selected.some(({ key }) => key === shape.key);
      let moving = held ? selected : [shape];

      if (event.shiftKey) {
        moving = held ? [] : [...selected, shape];
        core.select(
          (held ? selected.filter(({ key }) => key !== shape.key) : moving).map(
            ({ key }) => key
          )
        );
      } else if (!held) {
        core.select([shape.key]);
      }

      const ids = new Set(moving.map(({ id }) => id));
      const carried = new Set(ids);

      for (const id of ids) {
        for (const member of index.membersOf(id) ?? []) carried.add(member);
      }

      if (ids.size > 0 && core.writable()) {
        const elements = [
          ...host.querySelectorAll<HTMLElement>('[data-board-shape]'),
        ].filter((candidate) =>
          carried.has(candidate.dataset.boardShape ?? '')
        );
        const boxesOnly = (candidate: HTMLElement) =>
          index.byId(candidate.dataset.boardShape ?? '')?.kind !== 'arrow';

        gesture = {
          carried,
          copy: event.altKey,
          delta: { x: 0, y: 0 },
          elements: event.altKey
            ? elements.map((element) =>
                previewCopy(element, core.zoomLayer(), previewRank())
              )
            : elements.filter(boxesOnly),
          grab: at,
          ids: [...ids],
          kind: 'move',
          pointer,
          pointerId,
        };
      }
    } else {
      switch (tool) {
        case 'arrow': {
          if (!core.writable()) return;
          gesture = {
            from: at,
            kind: 'arrow',
            line: previewArrowLine(core.zoomLayer(), at, previewRank()),
            pointer,
            pointerId,
            press: pointer,
            start: arrowEndAt(at),
          };
          break;
        }
        case 'frame': {
          if (!core.writable()) return;
          gesture = {
            from: at,
            kind: 'frame',
            outline: previewFrameOutline(core.zoomLayer(), at, previewRank()),
            pointer,
            pointerId,
            press: pointer,
          };
          break;
        }
        case 'geo': {
          const { fill, geo } = nextStyle;

          core.insertWith((tx) =>
            tx.plugin(BaseBoardGeoPlugin).insert(
              {
                ...at,
                ...(fill === undefined ? {} : { fill }),
                ...(geo === undefined ? {} : { geo }),
              },
              { board: core.board }
            )
          );
          break;
        }
        case 'note': {
          const { fill } = nextStyle;

          core.insertWith((tx) =>
            tx
              .plugin(BaseBoardNotePlugin)
              .insert(
                { ...at, ...(fill === undefined ? {} : { fill }) },
                { board: core.board }
              )
          );
          break;
        }
        case 'pen': {
          if (!core.writable()) return;
          core.deselectOnBoard();

          const points: BoardInkPoint[] = [];

          addPenPoint(points, at, event);
          gesture = {
            kind: 'pen',
            path: previewStroke(core.zoomLayer(), previewRank()),
            pointerId,
            points,
            pointer,
          };
          drawPen(gesture);
          break;
        }
        case 'select': {
          if (event.pointerType === 'touch') {
            core.deselectOnBoard();
            gesture = pan(pointer, pointerId);
            break;
          }

          const base = event.shiftKey
            ? core.selectedShapes().map(({ key }) => key)
            : [];

          pick(base);
          gesture = {
            base,
            from: at,
            kind: 'box',
            outline: previewSelectBox(core.zoomLayer(), at, previewRank()),
            pointer,
            pointerId,
          };
          break;
        }
      }
    }

    if (gesture) core.voice.hold(gesture.kind === 'box');
    event.preventDefault();
    event.stopPropagation();
    host.setPointerCapture(pointerId);
    // A middle press ends in auxclick, not click.
    swallowClick = event.button === 0;
  };
  const owns = (event: PointerEvent) => gesture?.pointerId === event.pointerId;
  const onPointerMove = (event: PointerEvent) => {
    if (!gesture || !owns(event)) return;
    gesture.pointer = { x: event.clientX, y: event.clientY };
    if (gesture.kind === 'pen') {
      addPenPoint(gesture.points, core.boardPointAt(gesture.pointer), event);
      drawPen(gesture);
    } else if (gesture.kind === 'pan') {
      const { camera, pointer, start } = gesture;

      core.setCamera({
        ...camera,
        x: camera.x - (pointer.x - start.x) / camera.zoom,
        y: camera.y - (pointer.y - start.y) / camera.zoom,
      });
    } else {
      follow();
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    if (owns(event)) release();
  };
  const onPointerCancel = (event: PointerEvent) => {
    if (owns(event)) cancel();
  };
  const onClick = (event: MouseEvent) => {
    const swallow = swallowClick;

    swallowClick = false;
    if (
      !swallow ||
      !(event.target instanceof Node) ||
      !host.contains(event.target)
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  // Pointer capture sends the double click to the board, not the shape the
  // pointer is over, so it edits the shape the last press went down on.
  const onDoubleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Node) || !host.contains(event.target)) {
      return;
    }

    const shape = pressed;

    if (!shape?.holdsText || core.editedShape()?.key === shape.key) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    core.edit(shape.key);
  };
  const onSpace = (event: KeyboardEvent) => {
    if (event.code !== 'Space' && event.key !== ' ') return;
    spaceHeld =
      event.type === 'keydown' &&
      event.target instanceof Node &&
      host.contains(event.target);
  };
  const releaseSpace = () => {
    spaceHeld = false;
  };
  const view = host.ownerDocument.defaultView;

  host.addEventListener('pointerdown', onPointerDown, true);
  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerCancel);
  view?.addEventListener('click', onClick, true);
  view?.addEventListener('dblclick', onDoubleClick, true);
  view?.addEventListener('keydown', onSpace, true);
  view?.addEventListener('keyup', onSpace, true);
  view?.addEventListener('blur', releaseSpace);

  return {
    /** End the gesture in flight with no write, and return whether one was. */
    cancel,
    detach: () => {
      cancel();
      host.removeEventListener('pointerdown', onPointerDown, true);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerCancel);
      view?.removeEventListener('click', onClick, true);
      view?.removeEventListener('dblclick', onDoubleClick, true);
      view?.removeEventListener('keydown', onSpace, true);
      view?.removeEventListener('keyup', onSpace, true);
      view?.removeEventListener('blur', releaseSpace);
    },
    /** Redraw the gesture's preview after the camera or the shapes moved. */
    follow,
    /** End a gesture that would write once the view can no longer write. */
    refuseWrites: () => {
      if (
        gesture &&
        gesture.kind !== 'pan' &&
        gesture.kind !== 'box' &&
        !core.writable()
      ) {
        cancel();
      }
    },
  };
};
