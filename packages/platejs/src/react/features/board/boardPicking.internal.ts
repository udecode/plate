import type { BoardShapeLayout } from './boardIndex.internal';
import { elementOf } from './boardPreview.internal';
import type { BoardViewCore } from './boardView.internal';

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

  return {
    active: () => !!cursor,
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
