import type { BasePlateEditor } from '@platejs/core';
import type {
  EditorCoreStateView,
  Element,
  ElementEntry,
  Path,
  Point,
} from '@platejs/plite';

export const getEditorDescendant = (
  editor: BasePlateEditor,
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

export const hasEditorPath = (editor: BasePlateEditor, path: Path) => {
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
  editor: BasePlateEditor,
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
  editor: BasePlateEditor,
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
