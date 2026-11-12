import type { BoardPlace } from '../../../features/board/lib';
import type { BoardViewCore } from './boardView.internal';

/**
 * The board's cut and paste: a cut of selected shapes runs the board's
 * `remove`, and a paste of shapes over the board lands them at the pointer.
 * Returns the detach.
 */
export const attachBoardClipboard = (
  host: HTMLElement,
  core: BoardViewCore
) => {
  const { editor } = core;
  let hover: BoardPlace | null = null;

  // A shape selection has no DOM range, so Firefox fires its clipboard
  // events at the body; the focused element names the view they are for.
  const clipboardTarget = (event: ClipboardEvent) =>
    editor.api.dom.hasEditableTarget(event.target)
      ? event.target
      : host.ownerDocument.activeElement;
  const onCut = (event: ClipboardEvent) => {
    const shapes = core.selectedShapes();
    const target = clipboardTarget(event);

    if (
      !editor.api.dom.hasEditableTarget(target) ||
      !host.contains(target) ||
      !event.clipboardData ||
      shapes.length === 0 ||
      !core.writable()
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    editor.api.dom.clipboard.writeSelection(event.clipboardData);
    core.commit({ ids: shapes.map(({ id }) => id), kind: 'remove' });
  };
  const onPaste = (event: ClipboardEvent) => {
    const target = clipboardTarget(event);
    const onBoard =
      (!!target && target === core.focusTarget()) ||
      (!!hover &&
        editor.api.dom.hasEditableTarget(target) &&
        (host.contains(target) || target.contains(host)));

    if (!event.clipboardData || !onBoard) return;

    const read = editor.api.dom.clipboard.readSlice(event.clipboardData);

    core.measure();
    if (
      read.kind !== 'slice' ||
      !core.land(read.slice, hover ? core.boardPointAt(hover) : undefined)
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const onPointerMove = (event: PointerEvent) => {
    hover = { x: event.clientX, y: event.clientY };
  };
  const onPointerLeave = () => {
    hover = null;
  };
  const view = host.ownerDocument.defaultView;

  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerleave', onPointerLeave);
  view?.addEventListener('cut', onCut, true);
  view?.addEventListener('paste', onPaste, true);

  return () => {
    hover = null;
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    view?.removeEventListener('cut', onCut, true);
    view?.removeEventListener('paste', onPaste, true);
  };
};
