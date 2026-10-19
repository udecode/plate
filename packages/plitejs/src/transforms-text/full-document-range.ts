import { isStructuralEdge } from '../editor/point';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { getChildren as editorGetChildren } from '../interfaces/editor';
import { type Range, RangeApi } from '../interfaces/range';

export const isFullDocumentRange = (editor: Editor, range: Range) => {
  if (RangeApi.isCollapsed(range)) {
    return false;
  }

  if (editorGetChildren(editor).length === 0) {
    return false;
  }

  const [start, end] = RangeApi.edges(range);

  return (
    isStructuralEdge(editor, [], start, 'start') &&
    isStructuralEdge(editor, [], end, 'end')
  );
};
