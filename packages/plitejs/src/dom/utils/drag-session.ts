import type { Anchor, NodeKey, Range } from '../..';
import type { AnyEditor } from '../../interfaces/editor';
import { clearDropIndicators } from './drop-indicator';

const DRAG_SESSION_FORMAT = 'application/x-editor-drag-session';
const DRAGGING_ATTRIBUTE = 'data-editor-dragging';
const SESSIONS = new WeakMap<Document, ActiveDragSession>();
const ORIGINS = new WeakMap<Document, number>();
const REPAINTS = new WeakMap<
  Document,
  Readonly<{ owner: object; repaint: () => void }>
>();
const RESTS = new WeakMap<
  Document,
  Readonly<{
    key: string;
    owner: object;
    timer: ReturnType<typeof setTimeout>;
  }>
>();
const CONSUMED = new WeakMap<Document, string>();

export type DragSession = Readonly<{
  copyOnly: boolean;
  draggedBlock: boolean;
  id: string;
  source:
    | Readonly<{ kind: 'nodes'; keys: readonly NodeKey[] }>
    | Readonly<{ anchor: Anchor<Range>; kind: 'text' }>;
  sourceEditor: AnyEditor;
}>;

type ActiveDragSession = DragSession & {
  readonly release: () => void;
};

const readToken = (dataTransfer: Pick<DataTransfer, 'getData'>) => {
  try {
    return dataTransfer.getData(DRAG_SESSION_FORMAT) || null;
  } catch {
    return null;
  }
};

/** Cancels the pending rest, or only `owner`'s, as when a drag leaves its view. */
export const cancelDragRest = (document: Document, owner?: object) => {
  const rest = RESTS.get(document);

  if (!rest || (owner && rest.owner !== owner)) return;

  globalThis.clearTimeout(rest.timer);
  RESTS.delete(document);
};

const endSession = (document: Document, session: ActiveDragSession) => {
  if (SESSIONS.get(document) === session) SESSIONS.delete(document);
  session.release();
};

/**
 * Listens for the end of the drag only while it runs: `dragend`, or a later
 * press, release or buttonless move when the source unmounted before `dragend`
 * reached it. Firefox on macOS can send the move that started the drag after
 * `dragstart`, with the button still down.
 */
export const beginDragSession = ({
  dataTransfer,
  document,
  hosts = [],
  originX,
  ...session
}: Omit<DragSession, 'id'> & {
  dataTransfer: DataTransfer;
  document: Document;
  hosts?: readonly HTMLElement[];
  originX?: number;
}): DragSession | null => {
  const previous = SESSIONS.get(document);

  if (previous) endSession(document, previous);

  const id = Math.random().toString(36).slice(2);

  try {
    dataTransfer.setData(DRAG_SESSION_FORMAT, id);
  } catch {
    if (session.source.kind === 'text') session.source.anchor.release();

    return null;
  }

  for (const host of hosts) host.setAttribute(DRAGGING_ATTRIBUTE, 'true');

  let released = false;
  const end = () => {
    const current = SESSIONS.get(document);

    if (current?.id === id) endSession(document, current);
  };
  const endAfterRelease = (event: PointerEvent) => {
    if (event.buttons === 0) end();
  };
  // Browsers repeat dragover for a held pointer only periodically, so content
  // scrolling under it would leave the indicator at stale viewport coordinates.
  const repaint = () => REPAINTS.get(document)?.repaint();
  const next: ActiveDragSession = {
    ...session,
    id,
    release: () => {
      if (released) return;
      released = true;
      document.removeEventListener('dragend', end, true);
      document.removeEventListener('pointerdown', end, true);
      document.removeEventListener('pointerup', end, true);
      document.removeEventListener('pointermove', endAfterRelease, true);
      document.removeEventListener('scroll', repaint, true);
      REPAINTS.delete(document);
      ORIGINS.delete(document);
      cancelDragRest(document);
      for (const host of hosts) host.removeAttribute(DRAGGING_ATTRIBUTE);
      // A cancelled drag reaches no dragleave on the view it was over.
      clearDropIndicators();
      if (session.source.kind === 'text') session.source.anchor.release();
    },
  };

  document.addEventListener('dragend', end, true);
  document.addEventListener('pointerdown', end, true);
  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointermove', endAfterRelease, true);
  document.addEventListener('scroll', repaint, {
    capture: true,
    passive: true,
  });
  SESSIONS.set(document, next);
  if (originX !== undefined) ORIGINS.set(document, originX);

  return next;
};

/** Sets what the active drag runs after each scroll; does nothing without one. */
export const setDragScrollRepaint = (
  document: Document,
  owner: object,
  repaint: () => void
) => {
  if (SESSIONS.has(document)) REPAINTS.set(document, { owner, repaint });
};

/** Drops `owner`'s repaint, as when the pointer leaves its view. */
export const clearDragScrollRepaint = (document: Document, owner: object) => {
  if (REPAINTS.get(document)?.owner === owner) REPAINTS.delete(document);
};

export const isDragScrollRepaintActive = (
  document: Document,
  sessionId: string,
  owner: object
) =>
  SESSIONS.get(document)?.id === sessionId &&
  REPAINTS.get(document)?.owner === owner;

/**
 * Runs `settle` once the active drag has rested on `key` of `owner` for
 * `delay` ms. A dragover on another key, `null`, or the drag's end cancels it,
 * and a repeated call for the pending key keeps its timer.
 */
export const restDrag = (
  document: Document,
  owner: object,
  key: string | null,
  delay: number,
  settle: (key: string) => void
) => {
  const rest = RESTS.get(document);

  if (rest?.owner === owner && rest.key === key) return;

  cancelDragRest(document);

  if (key === null || !SESSIONS.has(document)) return;

  const timer = globalThis.setTimeout(() => {
    RESTS.delete(document);
    settle(key);
  }, delay);

  RESTS.set(document, { key, owner, timer });
};

// Outlives `takeDragSession`, so the drop resolves the target the hover painted.
export const readDragOriginX = (document: Document) => ORIGINS.get(document);

export const clearDragSession = (
  document: Document,
  sourceEditor?: AnyEditor
) => {
  const session = SESSIONS.get(document);

  if (!session || (sourceEditor && session.sourceEditor !== sourceEditor)) {
    return;
  }

  endSession(document, session);
};

/**
 * Drag data is protected until drop, so this matches the marker type and the
 * document's active session.
 */
export const readDragSession = (
  document: Document,
  dataTransfer: Pick<DataTransfer, 'types'> | null
): DragSession | null =>
  dataTransfer && Array.from(dataTransfer.types).includes(DRAG_SESSION_FORMAT)
    ? (SESSIONS.get(document) ?? null)
    : null;

export const isDragSessionClaimed = (
  document: Document,
  dataTransfer: Pick<DataTransfer, 'getData'>
) => {
  const token = readToken(dataTransfer);

  return !!token && SESSIONS.get(document)?.id === token;
};

export const takeDragSession = ({
  dataTransfer,
  document,
}: {
  dataTransfer: DataTransfer;
  document: Document;
}): DragSession | 'consumed' | null => {
  const session = SESSIONS.get(document);
  const token = readToken(dataTransfer);

  if (token && CONSUMED.get(document) === token) return 'consumed';
  if (!session || token !== session.id) return null;

  SESSIONS.delete(document);
  CONSUMED.set(document, session.id);

  return session;
};

export const settleDragSession = (session: DragSession) => {
  (session as ActiveDragSession).release();
};
