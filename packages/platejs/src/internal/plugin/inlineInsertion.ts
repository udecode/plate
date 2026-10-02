import { type EditorUpdateTransaction, type Path, PathApi } from '../../facade';

// Before normalization a block-end inline has no following text to hold the caret.
export const selectAfterInline = (tx: EditorUpdateTransaction, path: Path) => {
  const after = tx.points.after(path);

  if (
    after &&
    PathApi.equals(PathApi.parent(after.path), PathApi.parent(path))
  ) {
    tx.selection.set({ anchor: after, focus: after });

    return;
  }

  const point = { offset: 0, path: PathApi.next(path) };

  tx.nodes.insert({ text: '' }, { at: point.path });
  tx.selection.set({ anchor: point, focus: point });
};

export const getCaretInline = (tx: EditorUpdateTransaction, type: string) => {
  const caret = tx.selection();

  if (!caret) return null;

  const path = PathApi.parent(caret.anchor.path);
  const node = tx.nodes.get(path)?.[0] as { type?: unknown } | undefined;

  return node?.type === type ? path : null;
};
