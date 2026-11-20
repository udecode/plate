import type { Editor } from '../../../core';
import type { Editor as RuntimeEditor } from '../../../facade';
import { subscribeEditorViewState } from '../../../facade';
import type { BoardSize } from '../../../features/board/lib';
import { UPLOAD_COMMIT_TAG } from '../../../internal/plugin/uploadDrafts';
import { activeElementOf } from './boardVoice.internal';

const LONGEST_SIDE = 480;
const UNLOADED: BoardSize = { height: 240, width: 320 };

const fit = ({ naturalHeight, naturalWidth }: HTMLImageElement): BoardSize => {
  if (!(naturalWidth > 0 && naturalHeight > 0)) return UNLOADED;

  const scale = Math.min(
    1,
    LONGEST_SIDE / Math.max(naturalWidth, naturalHeight)
  );

  return { height: naturalHeight * scale, width: naturalWidth * scale };
};

export const createPendingPictures = ({
  editor,
  shapes,
  writable,
}: Readonly<{
  editor: Editor;
  shapes: RuntimeEditor;
  writable: () => boolean;
}>) => {
  let stop: (() => void) | null = null;

  const cancel = () => {
    const held = stop;

    stop = null;
    held?.();
  };

  const load = (
    host: HTMLElement,
    sources: ReadonlyArray<File | string>,
    loaded: (sizes: readonly BoardSize[], failed: boolean) => void
  ) => {
    cancel();

    const view = host.ownerDocument.defaultView;

    if (!view) return;

    const urls = sources.map((source) =>
      typeof source === 'string' ? source : view.URL.createObjectURL(source)
    );
    const sizes: Array<BoardSize | undefined> = sources.map(() => undefined);
    const images = sources.map(() => new view.Image());
    let failed = false;
    // happy-dom still runs a listener removed during the event it is handling,
    // so each handler acts only while its own batch is the pending one.
    const drop = () => {
      if (stop === halt) cancel();
    };
    const settle = (at: number, size: BoardSize) => {
      if (stop !== halt) return;
      sizes[at] = size;
      if (sizes.includes(undefined)) return;
      cancel();
      loaded(
        sizes.map((box) => box ?? UNLOADED),
        failed
      );
    };
    const handlers = images.map((image, at) => ({
      error: () => {
        failed = true;
        settle(at, UNLOADED);
      },
      load: () => settle(at, fit(image)),
    }));
    const onPress = (event: Event) => {
      if (event.composedPath().includes(host)) drop();
    };
    // A window that loses focus fires focusout with no relatedTarget and keeps
    // its active element, so the wait goes on when the window comes back.
    const onFocusOut = ({ relatedTarget }: FocusEvent) => {
      const next =
        relatedTarget instanceof view.Node
          ? relatedTarget
          : activeElementOf(host);

      if (!host.contains(next)) drop();
    };
    const halt = () => {
      images.forEach((image, at) => {
        image.removeEventListener('load', handlers[at].load);
        image.removeEventListener('error', handlers[at].error);
        image.src = '';
      });
      sources.forEach((source, at) => {
        if (typeof source !== 'string') view.URL.revokeObjectURL(urls[at]);
      });
      view.removeEventListener('keydown', onPress, true);
      view.removeEventListener('pointerdown', onPress, true);
      view.removeEventListener('paste', drop, true);
      host.removeEventListener('focusout', onFocusOut);
      stopCommits();
      stopViewState();
    };
    const stopCommits = editor.subscribeCommit(({ changed, tags }) => {
      if (
        !tags.includes(UPLOAD_COMMIT_TAG) &&
        (changed.hasAny('document') || changed.hasAny('selection'))
      ) {
        drop();
      }
    });
    const stopViewState = subscribeEditorViewState(shapes, () => {
      if (!writable()) drop();
    });

    stop = halt;
    view.addEventListener('keydown', onPress, true);
    view.addEventListener('pointerdown', onPress, true);
    view.addEventListener('paste', drop, true);
    host.addEventListener('focusout', onFocusOut);
    images.forEach((image, at) => {
      image.addEventListener('load', handlers[at].load);
      image.addEventListener('error', handlers[at].error);
      image.src = urls[at];
    });
  };

  return { cancel, load };
};
