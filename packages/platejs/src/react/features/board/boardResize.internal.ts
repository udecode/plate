import type { BoardPlace } from '../../../features/board/lib';
import {
  CORNERS_CLOCKWISE,
  type BoardBox,
  type BoardCorner,
  type BoardShapeLayout,
  resized,
  sameBox,
} from './boardIndex.internal';
import {
  drawnNoteHeight,
  elementOf,
  placeShape,
  placedAndDrawn,
  setResizeTextWrap,
} from './boardPreview.internal';
import type { BoardViewCore } from './boardView.internal';

const RESIZE_CORNER = 'data-board-resize-corner';

type EdgeOffsets = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

type Resize = {
  bottomOffset: number;
  corner: BoardCorner;
  edges: EdgeOffsets;
  element: HTMLElement | null;
  readonly id: string;
};

const UNMOVED: EdgeOffsets = { bottom: 0, left: 0, right: 0, top: 0 };

const resizedByEdges = (
  layout: BoardShapeLayout,
  { bottom, left, right, top }: EdgeOffsets,
  corner: BoardCorner
): BoardBox => {
  const { box } = layout;

  if (bottom === 0 && left === 0 && right === 0 && top === 0) return box;

  return resized(
    {
      height: box.height - top + bottom,
      width: box.width - left + right,
      x: box.x + left,
      y: box.y + top,
    },
    corner,
    0,
    0,
    { center: false, keepRatio: layout.keepsRatio }
  );
};

const withoutFloatDrift = (offset: number) => {
  const near = Math.round(offset);

  return Math.abs(offset - near) < 1e-9 ? near : offset;
};

const edgesBetween = (box: BoardBox, next: BoardBox): EdgeOffsets => ({
  bottom: withoutFloatDrift(next.y + next.height - (box.y + box.height)),
  left: withoutFloatDrift(next.x - box.x),
  right: withoutFloatDrift(next.x + next.width - (box.x + box.width)),
  top: withoutFloatDrift(next.y - box.y),
});

export const attachBoardResize = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;
  let resize: Resize | null = null;

  const elementFor = (held: Resize) => {
    if (!held.element?.isConnected) held.element = elementOf(host, held.id);

    return held.element;
  };

  const held = () => {
    const layout = resize && index.byId(resize.id);

    return resize && layout && layout.kind !== 'arrow'
      ? {
          box: resizedByEdges(layout, resize.edges, resize.corner),
          layout,
          resize,
        }
      : undefined;
  };

  const placeAtModel = (placed: Resize) => {
    const element = elementFor(placed);
    const box = index.storedBoxOf(placed.id);

    if (element) {
      setResizeTextWrap(
        element,
        false,
        index.placementOf(placed.id)?.grow === 'both'
      );
      if (box) placeShape(element, box);
    }
  };

  const measure = (
    layout: BoardShapeLayout,
    placed: BoardBox,
    corner: BoardCorner,
    bottomOffset: number,
    element: HTMLElement | null
  ) => {
    const grow = index.placementOf(layout.id)?.grow ?? 'none';

    if (!element || grow === 'none') {
      return { drawn: placed, placed };
    }
    setResizeTextWrap(element, true, grow === 'both');
    placeShape(element, placed);

    return placedAndDrawn(
      placed,
      {
        bottom: layout.box.y + layout.box.height + bottomOffset,
        centerY: layout.box.y + layout.box.height / 2,
      },
      corner,
      false,
      drawnNoteHeight(element, placed.height, core.state().camera.zoom)
    );
  };

  const applyPreview = (
    shownResize: Resize,
    placed: BoardBox,
    drawn: BoardBox,
    element: HTMLElement | null
  ) => {
    const { id } = shownResize;

    index.previewShape(id, placed, drawn);
    if (element) placeShape(element, placed);
    index.previewArrows([id], (target) => (target === id ? drawn : undefined), {
      x: 0,
      y: 0,
    });
  };

  const clearToModel = (active: Resize) => {
    active.edges = UNMOVED;
    active.bottomOffset = 0;
    placeAtModel(active);
    if (index.isPreviewing(active.id)) index.clearPreview();
  };

  const show = () => {
    const shown = held();

    if (!shown) return undefined;

    const { box, layout, resize: shownResize } = shown;

    if (sameBox(box, layout.box)) {
      if (index.isPreviewing(shownResize.id)) clearToModel(shownResize);

      return { ...shown, drawn: box, placed: box };
    }

    const element = elementFor(shownResize);
    const { drawn, placed } = measure(
      layout,
      box,
      shownResize.corner,
      shownResize.bottomOffset,
      element
    );

    if (sameBox(placed, layout.box)) {
      clearToModel(shownResize);

      return { ...shown, drawn: layout.box, placed: layout.box };
    }
    if (!sameBox(placed, box)) {
      shownResize.edges = edgesBetween(layout.box, placed);
    }
    applyPreview(shownResize, placed, drawn, element);

    return { ...shown, drawn, placed };
  };

  const say = (corner: BoardCorner, { height, width }: BoardBox) =>
    core.voice.resize({ corner, height, width });

  const markCorner = (current: Resize) => {
    elementFor(current)?.setAttribute(RESIZE_CORNER, current.corner);
  };

  const clearCorner = (current: Resize) => {
    elementFor(current)?.removeAttribute(RESIZE_CORNER);
  };

  const follow = () => {
    if (!core.writable() || !show()) core.cancelInteraction();
  };

  return {
    active: () => !!resize,
    finish: () => {
      const done = held();

      if (!done) return;
      if (!sameBox(done.box, done.layout.box)) {
        const committed = done.resize;
        const { placed } = measure(
          done.layout,
          done.box,
          committed.corner,
          committed.bottomOffset,
          elementFor(committed)
        );

        if (!sameBox(placed, done.layout.box)) {
          resize = null;
          core.commit({ id: committed.id, kind: 'resize', rect: placed });
          placeAtModel(committed);
          if (index.isPreviewing(committed.id)) index.clearPreview();
        }
      }
      core.cancelInteraction();
    },
    move: (by: BoardPlace) => {
      const moving = held();

      if (!moving) return;

      const { layout, resize: active } = moving;
      const dragged = resized(moving.box, active.corner, by.x, by.y, {
        center: false,
        keepRatio: layout.keepsRatio,
      });

      if (sameBox(dragged, moving.box)) {
        say(active.corner, moving.box);

        return;
      }

      const element = elementFor(active);
      const { drawn, placed } = measure(
        layout,
        dragged,
        active.corner,
        active.bottomOffset,
        element
      );

      if (sameBox(placed, layout.box)) {
        clearToModel(active);
        say(active.corner, layout.box);

        return;
      }

      active.edges = edgesBetween(layout.box, placed);
      applyPreview(active, placed, drawn, element);
      say(active.corner, placed);
    },
    start: (shape: BoardShapeLayout) => {
      if ((index.placementOf(shape.id)?.grow ?? 'none') !== 'none') {
        core.syncTextSize(shape.id);
      }

      const startBox = index.byId(shape.id)?.box ?? shape.box;
      const next: Resize = {
        bottomOffset: 0,
        corner: 'bottomRight',
        edges: UNMOVED,
        element: elementOf(host, shape.id),
        id: shape.id,
      };

      core.replaceInteraction({
        cancel: () => {
          if (resize === next) resize = null;
          clearCorner(next);
          placeAtModel(next);
          index.clearPreview();
          core.voice.repeatSelection();
        },
        corner: () => next.corner,
        follow,
        kind: 'resize',
        shape: () => next.id,
      });
      resize = next;
      markCorner(next);
      core.voice.resizing(shape.key, {
        corner: next.corner,
        height: startBox.height,
        width: startBox.width,
      });
    },
    turn: (backward: boolean) => {
      const turning = held();

      if (!turning) return;

      const { length } = CORNERS_CLOCKWISE;
      const at = CORNERS_CLOCKWISE.indexOf(turning.resize.corner);
      const element = elementFor(turning.resize);
      const unmoved = sameBox(turning.box, turning.layout.box);
      const { drawn, placed } = unmoved
        ? { drawn: turning.layout.box, placed: turning.layout.box }
        : measure(
            turning.layout,
            turning.box,
            turning.resize.corner,
            turning.resize.bottomOffset,
            element
          );

      turning.resize.corner =
        CORNERS_CLOCKWISE[(at + (backward ? length - 1 : 1)) % length];
      markCorner(turning.resize);
      if (!unmoved && sameBox(placed, turning.layout.box)) {
        clearToModel(turning.resize);
        say(turning.resize.corner, turning.layout.box);

        return;
      }
      turning.resize.bottomOffset = withoutFloatDrift(
        drawn.y +
          drawn.height -
          (turning.layout.box.y + turning.layout.box.height)
      );
      turning.resize.edges = edgesBetween(turning.layout.box, placed);
      if (!unmoved) applyPreview(turning.resize, placed, drawn, element);
      say(turning.resize.corner, placed);
    },
  };
};
