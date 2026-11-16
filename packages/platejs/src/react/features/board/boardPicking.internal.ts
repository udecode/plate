import type { BoardShapeLayout } from './boardIndex.internal';
import { elementOf } from './boardPreview.internal';
import type { BoardViewCore } from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

type Cursor = { element: HTMLElement | null; id: string };

const CURSOR = 'data-board-cursor';

export const attachBoardPicking = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;
  let cursor: Cursor | null = null;

  const elementFor = (held: Cursor) => {
    if (!held.element?.isConnected) held.element = elementOf(host, held.id);

    return held.element;
  };

  const shape = () => (cursor ? index.byId(cursor.id) : undefined);

  const say = (kind: 'pick' | 'picking') => {
    const layout = shape();

    if (layout) core.voice[kind](layout.key);
  };

  const reveal = (layout: BoardShapeLayout) => {
    if (!core.inView(layout)) {
      core.reveal([index.entries().findIndex(({ key }) => key === layout.key)]);
    }
  };

  const follow = () => {
    if (!shape()) core.cancelInteraction();
  };

  // A window that loses focus fires focusout with no relatedTarget and keeps
  // its active element, so picking goes on when the window comes back.
  const onFocusOut = ({ relatedTarget }: FocusEvent) => {
    const next =
      relatedTarget instanceof Node ? relatedTarget : activeElementOf(host);

    if (cursor && !host.contains(next)) core.cancelInteraction();
  };

  const onPointerDown = () => {
    if (!cursor) return;
    core.cancelInteraction();
    core.voice.quiet();
  };

  const view = host.ownerDocument.defaultView;

  host.addEventListener('focusout', onFocusOut);
  view?.addEventListener('pointerdown', onPointerDown, true);

  return {
    active: () => !!cursor,
    detach: () => {
      host.removeEventListener('focusout', onFocusOut);
      view?.removeEventListener('pointerdown', onPointerDown, true);
    },
    moveTo: (layout: BoardShapeLayout) => {
      if (!cursor) return;
      elementFor(cursor)?.removeAttribute(CURSOR);
      cursor.id = layout.id;
      cursor.element = null;
      elementFor(cursor)?.setAttribute(CURSOR, '');
      reveal(layout);
      say('pick');
    },
    sayAgain: () => say('pick'),
    shape,
    start: () => {
      const [first] = core.selectedShapes();
      const layout = first ?? index.layout(index.entries()[0]?.key ?? '');

      if (!layout) return;

      const next: Cursor = { element: null, id: layout.id };

      core.replaceInteraction({
        cancel: () => {
          elementFor(next)?.removeAttribute(CURSOR);
          if (cursor === next) cursor = null;
          core.voice.repeatSelection();
        },
        cursor: () => next.id,
        follow,
        kind: 'pick',
      });
      cursor = next;
      elementFor(next)?.setAttribute(CURSOR, '');
      reveal(layout);
      say('picking');
    },
    toggle: () => {
      const layout = shape();

      if (!layout) return;
      core.toggleSelected(layout.key);
      say('pick');
    },
  };
};
