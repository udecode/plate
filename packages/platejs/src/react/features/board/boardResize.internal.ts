import type { BoardPlace } from '../../../features/board/lib';
import {
  CORNERS_CLOCKWISE,
  type BoardBox,
  type BoardCorner,
  type BoardShapeLayout,
  resized,
  sameBox,
} from './boardIndex.internal';
import { elementOf, placeShape } from './boardPreview.internal';
import type { BoardViewCore } from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

type EdgeOffsets = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

type Resize = {
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

    if (element && box) placeShape(element, box);
  };

  const show = () => {
    const shown = held();

    if (!shown) return undefined;

    const { box, resize: shownResize } = shown;
    const { id } = shownResize;
    const element = elementFor(shownResize);

    index.previewShape(id, box);
    if (element) placeShape(element, box);
    index.previewArrows([id], (target) => (target === id ? box : undefined), {
      x: 0,
      y: 0,
    });

    return shown;
  };

  const say = (corner: BoardCorner, { height, width }: BoardBox) =>
    core.voice.resize({ corner, height, width });

  const follow = () => {
    if (!core.writable() || !show()) core.cancelInteraction();
  };

  // A window that loses focus fires focusout with no relatedTarget and keeps
  // its active element, so the resize goes on when the window comes back.
  const onFocusOut = ({ relatedTarget }: FocusEvent) => {
    const next =
      relatedTarget instanceof Node ? relatedTarget : activeElementOf(host);

    if (resize && !host.contains(next)) core.cancelInteraction();
  };

  const onPointerDown = () => {
    if (!resize) return;
    core.cancelInteraction();
    core.voice.quiet();
  };

  const view = host.ownerDocument.defaultView;

  host.addEventListener('focusout', onFocusOut);
  view?.addEventListener('pointerdown', onPointerDown, true);

  return {
    active: () => !!resize,
    detach: () => {
      host.removeEventListener('focusout', onFocusOut);
      view?.removeEventListener('pointerdown', onPointerDown, true);
    },
    finish: () => {
      const done = held();

      if (!done) return;
      core.cancelInteraction();
      if (!sameBox(done.box, done.layout.box)) {
        core.commit({ id: done.resize.id, kind: 'resize', rect: done.box });
        placeAtModel(done.resize);
      }
    },
    move: (by: BoardPlace) => {
      const moving = held();

      if (!moving) return;
      moving.resize.edges = edgesBetween(
        moving.layout.box,
        resized(moving.box, moving.resize.corner, by.x, by.y, {
          center: false,
          keepRatio: moving.layout.keepsRatio,
        })
      );

      const shown = show();

      if (shown) say(shown.resize.corner, shown.box);
    },
    start: (shape: BoardShapeLayout) => {
      const next: Resize = {
        corner: 'bottomRight',
        edges: UNMOVED,
        element: elementOf(host, shape.id),
        id: shape.id,
      };

      core.replaceInteraction({
        cancel: () => {
          if (resize === next) resize = null;
          placeAtModel(next);
          index.clearPreview();
          core.voice.repeatSelection();
        },
        follow,
        kind: 'resize',
      });
      resize = next;
      core.voice.resizing(shape.key, {
        corner: next.corner,
        height: shape.box.height,
        width: shape.box.width,
      });
    },
    turn: (backward: boolean) => {
      const turning = held();

      if (!turning) return;

      const { length } = CORNERS_CLOCKWISE;
      const at = CORNERS_CLOCKWISE.indexOf(turning.resize.corner);

      turning.resize.edges = edgesBetween(turning.layout.box, turning.box);
      turning.resize.corner =
        CORNERS_CLOCKWISE[(at + (backward ? length - 1 : 1)) % length];
      say(turning.resize.corner, turning.box);
    },
  };
};
