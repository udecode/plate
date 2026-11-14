import type { BoardPlace } from '../../../features/board/lib';
import type { BoardViewCore } from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

export const attachBoardClipboard = (
  host: HTMLElement,
  core: BoardViewCore
) => {
  const { editor } = core;
  let hover: BoardPlace | null = null;

  // Firefox fires clipboard events at the body when a shape selection leaves
  // no DOM range, and Chromium and Firefox fire them at the start of a
  // document range that focus left for the board. The focused element names
  // the view they are for.
  const clipboardTarget = (event: ClipboardEvent) => {
    const active = activeElementOf(host);

    return active !== core.focusTarget.current &&
      editor.api.dom.hasEditableTarget(event.target)
      ? event.target
      : active;
  };
  const onCopy = (event: ClipboardEvent) => {
    if (
      clipboardTarget(event) !== core.focusTarget.current ||
      !event.clipboardData ||
      core.selectedShapes().length === 0
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    editor.api.dom.clipboard.writeSelection(event.clipboardData);
  };
  const onCut = (event: ClipboardEvent) => {
    const shapes = core.selectedShapes();
    const target = clipboardTarget(event);

    if (target === core.focusTarget.current && shapes.length === 0) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }
    if (
      !(
        target === core.focusTarget.current ||
        editor.api.dom.hasEditableTarget(target)
      ) ||
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
    const onTarget = !!target && target === core.focusTarget.current;
    const onBoard =
      onTarget ||
      (!!hover &&
        editor.api.dom.hasEditableTarget(target) &&
        (host.contains(target) || target.contains(host)));

    if (!event.clipboardData || !onBoard) return;

    const read = editor.api.dom.clipboard.readSlice(event.clipboardData);

    core.measure();

    const pasted =
      read.kind === 'slice'
        ? core.land(read.slice, hover ? core.boardPointAt(hover) : undefined)
        : onTarget &&
          core.selectedShapes().length > 0 &&
          core.paste(event.clipboardData);

    if (!(pasted || onTarget)) return;
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
  view?.addEventListener('copy', onCopy, true);
  view?.addEventListener('cut', onCut, true);
  view?.addEventListener('paste', onPaste, true);

  return () => {
    hover = null;
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    view?.removeEventListener('copy', onCopy, true);
    view?.removeEventListener('cut', onCut, true);
    view?.removeEventListener('paste', onPaste, true);
  };
};
