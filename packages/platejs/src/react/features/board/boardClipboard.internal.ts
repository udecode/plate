import { ElementApi } from '../../../core';
import {
  BaseBoardImagePlugin,
  type BoardPlace,
} from '../../../features/board/lib';
import { readImageLink } from '../../../internal/plugin/imageLink';
import { pastedUploadFiles } from '../../../internal/plugin/pastedUploadFiles';
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
  const picturesIn = (data: DataTransfer) => {
    const link = readImageLink(editor, data.getData('text/plain'));

    if (link) return [link];

    const html = data.getData('text/html');
    const parsed = html ? editor.api.html.parseSlice(html) : undefined;

    if (!parsed?.ok) return undefined;

    const holds =
      editor.read.schema.element(
        editor.plugin(BaseBoardImagePlugin).schema.type
      )?.content?.allowedElementTypes ?? [];
    const blocks = parsed.slice.content.filter(
      (block) =>
        !(ElementApi.isElement(block) && editor.read.nodes.isEmpty(block))
    );
    const pictures = blocks.flatMap((block) =>
      ElementApi.isElement(block) &&
      holds.includes(block.type) &&
      typeof block.url === 'string'
        ? [block]
        : []
    );

    return pictures.length > 0 && pictures.length === blocks.length
      ? pictures
      : undefined;
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

    const data = event.clipboardData;
    const read = editor.api.dom.clipboard.readSlice(data);
    const holdsFiles = data.files.length > 0 && read.kind !== 'slice';

    if (holdsFiles && !onTarget) return;

    core.measure();

    const open = read.kind !== 'slice' && !core.editedShape();
    const pictures =
      open && core.writable() && editor.plugin(BaseBoardImagePlugin).installed
        ? picturesIn(data)
        : undefined;
    const takesFiles = open && core.takesPictureFiles();
    const fallbackFiles = takesFiles && pictures ? Array.from(data.files) : [];
    const pictureFiles = takesFiles && !pictures ? pastedUploadFiles(data) : [];

    if (pictures || pictureFiles.length > 0) {
      const point = hover ? core.boardPointAt(hover) : core.viewCenter();

      event.preventDefault();
      event.stopPropagation();
      if (pictures) core.landPictures(pictures, point, fallbackFiles);
      else core.landPictureFiles(pictureFiles, point);

      return;
    }

    const pasted =
      read.kind === 'slice'
        ? core.land(read.slice, hover ? core.boardPointAt(hover) : undefined)
        : onTarget &&
          !holdsFiles &&
          core.selectedShapes().length > 0 &&
          core.paste(data);

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
