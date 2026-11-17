import type { NodeKey } from '../../../core';
import {
  BaseBoardArrowPlugin,
  BaseBoardStrokePlugin,
  type BoardArrowEndInput,
  type BoardPlace,
} from '../../../features/board/lib';
import {
  BOARD_PEN,
  type BoardInkPoint,
} from '../../../features/board/lib/boardStroke.internal';
import {
  simulatedPressure,
  strokeOutline,
} from '../../internal/penStroke.internal';
import {
  CORNERS_CLOCKWISE,
  type BoardBox,
  type BoardBoxModifiers,
  type BoardCorner,
  type BoardShapeLayout,
  draggedBox,
  resized,
  sameBox,
  spanOf,
} from './boardIndex.internal';
import { arrowEndOn, BOARD_PLACE_SIZE } from './boardPick.internal';
import {
  elementOf,
  placeElement,
  previewArrowLine,
  previewCopy,
  previewPlaceOutline,
  previewSelectBox,
  previewStroke,
} from './boardPreview.internal';
import {
  type BoardPlaceTool,
  type BoardStyle,
  type BoardViewCore,
  SHAPES_EDITABLE,
} from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

type Gesture = Readonly<{ pointerId: number }> &
  (
    | {
        kind: 'arrow';
        from: BoardPlace;
        line: SVGLineElement;
        pointer: BoardPlace;
        press: BoardPlace;
        start: BoardArrowEndInput;
        style: BoardStyle;
      }
    | {
        kind: 'box';
        base: readonly NodeKey[];
        from: BoardPlace;
        outline: HTMLElement;
        pointer: BoardPlace;
      }
    | {
        kind: 'erase';
        pointer: BoardPlace;
      }
    | {
        kind: 'place';
        from: BoardPlace;
        modifiers: BoardBoxModifiers;
        outline: HTMLElement;
        pointer: BoardPlace;
        press: BoardPlace;
        style: BoardStyle;
        tool: BoardPlaceTool;
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
        style: BoardStyle;
      }
    | {
        kind: 'pan';
        pointer: BoardPlace;
      }
    | {
        kind: 'resize';
        corner: BoardCorner;
        element: HTMLElement;
        grab: BoardPlace;
        id: string;
        modifiers: BoardBoxModifiers;
        pointer: BoardPlace;
        rect: BoardBox;
        start: BoardBox;
      }
  );

const CLICK_SLOP_PX = 8;

const dragged = (press: BoardPlace, pointer: BoardPlace) =>
  Math.hypot(pointer.x - press.x, pointer.y - press.y) >= CLICK_SLOP_PX;

const modifiersOf = (
  event: KeyboardEvent | PointerEvent
): BoardBoxModifiers => ({ center: event.altKey, keepRatio: event.shiftKey });

const placedBox = (
  {
    from,
    modifiers,
    pointer,
    press,
    tool,
  }: Extract<Gesture, { kind: 'place' }>,
  at: BoardPlace
): BoardBox => {
  if (dragged(press, pointer)) return draggedBox(from, at, modifiers);

  const { height, width } = BOARD_PLACE_SIZE[tool];

  return { height, width, x: at.x - width / 2, y: at.y - height / 2 };
};

const holds = (outer: BoardBox, inner: BoardBox) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

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
    pressure = simulatedPressure(last[2], distance, BOARD_PEN.size);
  }
  points.push([at.x, at.y, pressure]);
};

/**
 * The board's pointer gestures on `host`: pan, the selection box, move, copy
 * drag, resize, the pen's line, the eraser and the other tools' drags, each
 * previewed with no write and committed once on release.
 */
export const attachBoardGestures = (
  host: HTMLElement,
  core: BoardViewCore,
  spaceHeld: () => boolean
) => {
  const { index } = core;
  const previewRank = () => index.entries().length + 1;

  let gesture: Gesture | null = null;
  let free: (() => void) | null = null;
  let swallowClick = false;
  let clicker: number | undefined;
  let pressed: BoardShapeLayout | undefined;

  const drawPen = ({ path, points }: Extract<Gesture, { kind: 'pen' }>) => {
    path.setAttribute('d', strokeOutline(points, BOARD_PEN, false));
  };

  // Both client points go through the current camera, so a pan mid-drag
  // cannot stretch the segment across the board.
  const erase = (from: BoardPlace, to: BoardPlace) => {
    core.markErasing(
      core.shapesAlong(core.boardPointAt(from), core.boardPointAt(to))
    );
  };

  const pan = (pointer: BoardPlace, pointerId: number): Gesture => ({
    kind: 'pan',
    pointer,
    pointerId,
  });

  const placeAtModel = (element: HTMLElement, id: string) => {
    const layout = index.byId(id);

    if (layout) placeElement(element, layout.box);
  };

  const pick = (keys: readonly NodeKey[]) => {
    if (keys.length > 0) core.select(keys);
    else core.deselectOnBoard();
    core.voice.hold(true);
  };

  const follow = () => {
    if (
      !gesture ||
      gesture.kind === 'erase' ||
      gesture.kind === 'pan' ||
      gesture.kind === 'pen'
    ) {
      return;
    }

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

    if (gesture.kind === 'place') {
      placeElement(
        gesture.outline,
        dragged(gesture.press, gesture.pointer)
          ? placedBox(gesture, at)
          : { ...gesture.from, height: 0, width: 0 }
      );

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
      const { element, id, start } = gesture;
      const rect = resized(start, gesture.corner, dx, dy, gesture.modifiers);

      gesture.rect = rect;
      if (sameBox(rect, start)) {
        placeAtModel(element, id);
        index.clearPreview();

        return;
      }
      index.previewShape(id, rect);
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
    free?.();
    core.voice.release();
    if (done.kind === 'move') {
      for (const shape of done.elements) {
        if (done.copy) shape.remove();
        else shape.style.translate = '';
      }
    } else if (done.kind === 'resize') {
      placeAtModel(done.element, done.id);
    } else if (done.kind === 'arrow') {
      done.line.ownerSVGElement?.remove();
    } else if (done.kind === 'box' || done.kind === 'place') {
      done.outline.remove();
    } else if (done.kind === 'pen') {
      done.path.ownerSVGElement?.remove();
    } else if (done.kind === 'erase') {
      core.clearErasing();
    }
    index.clearPreview();

    return true;
  };

  const arrowEndAt = (at: BoardPlace) => arrowEndOn(at, core.shapeAt(at));

  const release = () => {
    const done = gesture;

    if (!done || done.kind === 'pan') {
      gesture = null;
      free?.();
      core.voice.release();

      return;
    }

    const erased = done.kind === 'erase' ? core.clearErasing() : [];

    cancel();
    if (done.kind === 'box') return;
    if (done.kind === 'erase') {
      index.update();

      // Since the drag marked them, a shape may be gone or retyped into a frame.
      const ids = erased.filter((id) => {
        const kind = index.byId(id)?.kind;

        return kind === 'arrow' || kind === 'shape';
      });

      if (ids.length > 0) core.commit({ ids, kind: 'remove' });

      return;
    }
    if (done.kind === 'pen') {
      core.write((tx) =>
        tx.plugin(BaseBoardStrokePlugin).insert(
          {
            ...core.styleFor(BaseBoardStrokePlugin.name, done.style),
            points: done.points,
          },
          { board: core.board }
        )
      );
    } else if (done.kind === 'arrow') {
      if (dragged(done.press, done.pointer)) {
        const end = arrowEndAt(core.boardPointAt(done.pointer));

        core.insertAndSelect((tx) =>
          tx.plugin(BaseBoardArrowPlugin).insert(
            {
              ...core.styleFor(BaseBoardArrowPlugin.name, done.style),
              end,
              start: done.start,
            },
            { board: core.board }
          )
        );
      }
    } else if (done.kind === 'place') {
      core.place(done.tool, placedBox(done, core.boardPointAt(done.pointer)), {
        style: done.style,
      });
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
      placeAtModel(done.element, done.id);
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

  const inOwnText = (element: Element | null) =>
    !!element && element === host.querySelector(SHAPES_EDITABLE);
  const onPointerDown = (event: PointerEvent) => {
    if (gesture) return;
    pressed = undefined;
    swallowClick = false;
    if (event.button > 1 || !(event.target instanceof Element)) return;
    if (event.target.closest('[data-board-toolbar]')) return;

    core.measure();

    const { pointerId } = event;
    const { tool } = core.state();
    const pointer = { x: event.clientX, y: event.clientY };
    const at = core.boardPointAt(pointer);
    const handleName = event.target.closest<HTMLElement>('[data-board-handle]')
      ?.dataset.boardHandle;
    const handle = CORNERS_CLOCKWISE.find((corner) => corner === handleName);
    const { element: shapeElement, shape } = pressTargetAt(
      event.target,
      at,
      !!handle
    );
    const selecting = tool === 'select';
    const typing = core.writable() && !!core.editedShape();
    const spacePan = !typing && spaceHeld();

    if (event.button === 1 || tool === 'hand' || spacePan) {
      if (tool === 'hand' && !inOwnText(activeElementOf(host))) {
        core.focusBoard();
      }
      gesture = pan(pointer, pointerId);
    } else if (selecting && shapeElement && shape && handle) {
      if (!core.writable()) return;
      gesture = {
        corner: handle,
        element: shapeElement,
        grab: at,
        id: shape.id,
        kind: 'resize',
        modifiers: modifiersOf(event),
        pointer,
        pointerId,
        rect: shape.box,
        start: shape.box,
      };
    } else if (selecting && shapeElement && shape) {
      pressed = shape;
      if (core.editedShape()?.key === shape.key) return;

      const selected = core.selectedShapes();
      const held = selected.some(({ key }) => key === shape.key);
      let moving = held ? selected : [shape];

      if (event.shiftKey) {
        moving = held ? [] : [...selected, shape];
        core.toggleSelected(shape.key);
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
            style: core.state().nextStyle,
          };
          break;
        }
        case 'eraser': {
          if (!core.writable()) return;
          core.deselectOnBoard();
          gesture = { kind: 'erase', pointer, pointerId };
          erase(pointer, pointer);
          break;
        }
        case 'frame':
        case 'geo':
        case 'note': {
          if (!core.writable()) return;

          const style = core.state().nextStyle;

          gesture = {
            from: at,
            kind: 'place',
            modifiers: modifiersOf(event),
            outline: previewPlaceOutline(
              core.zoomLayer(),
              at,
              previewRank(),
              tool,
              style.geo
            ),
            pointer,
            pointerId,
            press: pointer,
            style,
            tool,
          };
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
            style: core.state().nextStyle,
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

    if (gesture) {
      const { kind } = gesture;

      free = core.replaceInteraction({
        cancel,
        kind:
          kind === 'arrow' ||
          kind === 'erase' ||
          kind === 'pen' ||
          kind === 'place'
            ? 'draw'
            : 'drag',
      });
      core.voice.hold(kind === 'box');
    }
    event.preventDefault();
    event.stopPropagation();
    host.setPointerCapture(pointerId);
    // A middle press ends in auxclick, not click.
    clicker = event.button === 0 ? pointerId : undefined;
  };
  const takeModifiers = (event: KeyboardEvent | PointerEvent) => {
    if (gesture?.kind !== 'place' && gesture?.kind !== 'resize') return false;
    gesture.modifiers = modifiersOf(event);

    return true;
  };
  const owns = (event: PointerEvent) => gesture?.pointerId === event.pointerId;
  const onPointerMove = (event: PointerEvent) => {
    if (!gesture || !owns(event)) return;

    const previous = gesture.pointer;

    takeModifiers(event);

    gesture.pointer = { x: event.clientX, y: event.clientY };
    if (gesture.kind === 'pen') {
      addPenPoint(gesture.points, core.boardPointAt(gesture.pointer), event);
      drawPen(gesture);
    } else if (gesture.kind === 'erase') {
      erase(previous, gesture.pointer);
    } else if (gesture.kind === 'pan') {
      const { camera } = core.state();
      const { pointer } = gesture;

      core.setCamera({
        ...camera,
        x: camera.x - (pointer.x - previous.x) / camera.zoom,
        y: camera.y - (pointer.y - previous.y) / camera.zoom,
      });
    } else {
      follow();
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === clicker) {
      clicker = undefined;
      swallowClick = true;
    }
    if (!owns(event)) return;
    if (gesture?.kind === 'erase') {
      const previous = gesture.pointer;

      gesture.pointer = { x: event.clientX, y: event.clientY };
      erase(previous, gesture.pointer);
    }
    release();
  };
  const onPointerCancel = (event: PointerEvent) => {
    if (owns(event)) cancel();
  };
  const onLostPointerCapture = (event: PointerEvent) => {
    if (event.pointerId === clicker) clicker = undefined;
  };
  const onClick = (event: MouseEvent) => {
    const swallow = swallowClick;

    swallowClick = false;
    if (
      !swallow ||
      !event.detail ||
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
  const onModifierKey = (event: KeyboardEvent) => {
    if (
      (event.key === 'Alt' || event.key === 'Shift') &&
      takeModifiers(event)
    ) {
      follow();
    }
  };
  const view = host.ownerDocument.defaultView;

  host.addEventListener('pointerdown', onPointerDown, true);
  view?.addEventListener('keydown', onModifierKey, true);
  view?.addEventListener('keyup', onModifierKey, true);
  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerCancel);
  host.addEventListener('lostpointercapture', onLostPointerCapture);
  view?.addEventListener('click', onClick, true);
  view?.addEventListener('dblclick', onDoubleClick, true);

  return {
    detach: () => {
      cancel();
      host.removeEventListener('pointerdown', onPointerDown, true);
      view?.removeEventListener('keydown', onModifierKey, true);
      view?.removeEventListener('keyup', onModifierKey, true);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerCancel);
      host.removeEventListener('lostpointercapture', onLostPointerCapture);
      view?.removeEventListener('click', onClick, true);
      view?.removeEventListener('dblclick', onDoubleClick, true);
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
