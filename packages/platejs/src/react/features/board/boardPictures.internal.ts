import type { Editor, Element } from '../../../core';
import { subscribeEditorViewState } from '../../../facade';
import type { BoardSize } from '../../../features/board/lib';
import { activeElementOf } from './boardVoice.internal';

const LONGEST_SIDE = 480;
const UNLOADED: BoardSize = { height: 240, width: 320 };

export type BoardPicture = Readonly<{ element: Element; size: BoardSize }>;

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
  mounted,
  writable,
}: Readonly<{ editor: Editor; mounted: Editor; writable: () => boolean }>) => {
  let stop: (() => void) | null = null;

  const cancel = () => {
    const held = stop;

    stop = null;
    held?.();
  };

  const load = (
    host: HTMLElement,
    elements: readonly Element[],
    loaded: (pictures: readonly BoardPicture[]) => void
  ) => {
    cancel();

    const view = host.ownerDocument.defaultView;

    if (!view) return;

    const sizes: Array<BoardSize | undefined> = elements.map(() => undefined);
    const images = elements.map(() => new view.Image());
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
        elements.map((element, index) => ({
          element,
          size: sizes[index] ?? UNLOADED,
        }))
      );
    };
    const handlers = images.map((image, at) => ({
      error: () => settle(at, UNLOADED),
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
      view.removeEventListener('keydown', onPress, true);
      view.removeEventListener('pointerdown', onPress, true);
      view.removeEventListener('paste', drop, true);
      host.removeEventListener('focusout', onFocusOut);
      stopCommits();
      stopViewState();
    };
    const stopCommits = editor.subscribeCommit(({ changed }) => {
      if (changed.hasAny('document') || changed.hasAny('selection')) drop();
    });
    const stopViewState = subscribeEditorViewState(mounted, () => {
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
      image.src = String(elements[at].url);
    });
  };

  return { cancel, load };
};
