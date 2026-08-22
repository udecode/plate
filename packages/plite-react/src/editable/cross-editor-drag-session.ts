import type { ContentSlice, Descendant, Range } from '@platejs/plite';

import type { ReactRuntimeEditor } from '../plugin/react-editor';

const CROSS_EDITOR_DRAG_FORMAT = 'application/x-plite-drag-session';
const SESSIONS = new WeakMap<Document, CrossEditorDragSession>();

let nextSessionId = 0;

export type CrossEditorDragSession = Readonly<{
  draggedBlock: boolean;
  id: string;
  slice: ContentSlice;
  sourceChildren: readonly Descendant[];
  sourceEditor: ReactRuntimeEditor;
  sourceRange: Range;
}>;

export const beginCrossEditorDragSession = ({
  dataTransfer,
  document,
  draggedBlock,
  slice,
  sourceChildren,
  sourceEditor,
  sourceRange,
}: Omit<CrossEditorDragSession, 'id'> & {
  dataTransfer: DataTransfer;
  document: Document;
}) => {
  const id = String((nextSessionId += 1));

  try {
    dataTransfer.setData(CROSS_EDITOR_DRAG_FORMAT, id);
  } catch {
    SESSIONS.delete(document);
    return null;
  }

  const session: CrossEditorDragSession = {
    draggedBlock,
    id,
    slice,
    sourceChildren,
    sourceEditor,
    sourceRange,
  };

  SESSIONS.set(document, session);

  return session;
};

export const clearCrossEditorDragSession = (
  document: Document,
  sourceEditor?: ReactRuntimeEditor
) => {
  const session = SESSIONS.get(document);

  if (!session || (sourceEditor && session.sourceEditor !== sourceEditor)) {
    return;
  }

  SESSIONS.delete(document);
};

export const readCrossEditorDragSession = ({
  dataTransfer,
  document,
  targetEditor,
}: {
  dataTransfer: DataTransfer;
  document: Document;
  targetEditor: ReactRuntimeEditor;
}) => {
  const session = SESSIONS.get(document);

  if (!session || session.sourceEditor === targetEditor) {
    return null;
  }

  try {
    return dataTransfer.getData(CROSS_EDITOR_DRAG_FORMAT) === session.id
      ? session
      : null;
  } catch {
    return null;
  }
};
