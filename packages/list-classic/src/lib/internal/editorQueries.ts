import type { SlateEditor } from '@platejs/core';
import type {
  EditorCoreStateView,
  Element,
  ElementEntry,
  Path,
  Point,
} from '@platejs/slate';

export const getEditorDescendant = (
  editor: SlateEditor,
  {
    at,
    match,
  }: {
    at: Path;
    match: (node: Element) => boolean;
  }
): ElementEntry | undefined =>
  Array.from(
    editor.api.nodes<Element>({
      at,
      match,
    })
  ).find(([, path]) => path.length > at.length);

export const hasEditorPath = (editor: SlateEditor, path: Path) => {
  if ('read' in editor && typeof editor.read === 'function') {
    return editor.read((state: EditorCoreStateView) =>
      state.nodes.hasPath(path)
    );
  }

  try {
    return !!editor.api.node(path);
  } catch {
    return false;
  }
};

export const isEditorPointEnd = (
  editor: SlateEditor,
  point: Point,
  at: Path
) =>
  'read' in editor && typeof editor.read === 'function'
    ? editor.read((state: EditorCoreStateView) => state.points.isEnd(point, at))
    : ((
        editor.api as {
          isEnd?: (point: Point, at: Path) => boolean;
        }
      ).isEnd?.(point, at) ?? false);

export const isEditorPointStart = (
  editor: SlateEditor,
  point: Point,
  at: Path
) =>
  'read' in editor && typeof editor.read === 'function'
    ? editor.read((state: EditorCoreStateView) =>
        state.points.isStart(point, at)
      )
    : ((
        editor.api as {
          isStart?: (point: Point, at: Path) => boolean;
        }
      ).isStart?.(point, at) ?? false);
