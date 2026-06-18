import { Editor } from '../interfaces/editor';
import { type Range, RangeApi } from '../interfaces/range';

export const samePoint = (
  left: { offset: number; path: readonly number[] },
  right: { offset: number; path: readonly number[] }
) =>
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((segment, index) => segment === right.path[index]);

export const isFullDocumentRange = (editor: Editor, range: Range) => {
  if (RangeApi.isCollapsed(range)) {
    return false;
  }

  if (Editor.getChildren(editor).length === 0) {
    return false;
  }

  const start = Editor.point(editor, [], { edge: 'start' });
  const end = Editor.point(editor, [], { edge: 'end' });

  return (
    (samePoint(range.anchor, start) && samePoint(range.focus, end)) ||
    (samePoint(range.anchor, end) && samePoint(range.focus, start))
  );
};
